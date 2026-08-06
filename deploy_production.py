#!/usr/bin/env python3
"""Deploy latest local code to production (iltmc.com). Preserves .env and MongoDB."""

from __future__ import annotations

import os
import sys
import tarfile
import time
from pathlib import Path

import paramiko

# Force UTF-8 console on Windows
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = "185.172.64.93"
USER = "root"
PASSWORD = "VO)PREr8Cm6r"
PORT = 22

LOCAL_ROOT = Path(__file__).resolve().parent
REMOTE_SITE = "/home/iltmc/htdocs/iltmc.com"
STAMP = int(time.time())
REMOTE_TMP = f"/tmp/iltmc_deploy_{STAMP}"
REMOTE_ARCHIVE = f"{REMOTE_TMP}.tar.gz"
LOCAL_ARCHIVE = LOCAL_ROOT / f"iltmc_deploy_{STAMP}.tar.gz"

EXCLUDE_DIRS = {
    ".git",
    ".next",
    "node_modules",
    "server_backup",
    ".npm-cache",
    "__pycache__",
    "iltmc_full_package",
    "database_export",
    "test_reports",
    "tests",
    "memory",
}
EXCLUDE_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    "deploy_production.py",
}


def human_size(n: float) -> str:
    units = ["B", "KB", "MB", "GB"]
    size = float(n)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            if unit == "B":
                return f"{int(size)} {unit}"
            return f"{size:.2f} {unit}"
        size /= 1024
    return f"{n} B"


def human_speed(bps: float) -> str:
    return f"{human_size(bps)}/s"


def progress_line(prefix: str, current: int, total: int, started: float) -> None:
    pct = (current / total * 100) if total else 100.0
    elapsed = max(time.time() - started, 0.001)
    speed = current / elapsed
    bar_w = 28
    filled = int(bar_w * pct / 100)
    bar = "#" * filled + "-" * (bar_w - filled)
    eta = (total - current) / speed if speed > 0 and current < total else 0
    line = (
        f"\r{prefix} [{bar}] {pct:6.2f}%  "
        f"{human_size(current)} / {human_size(total)}  "
        f"{human_speed(speed)}  ETA {eta:5.1f}s"
    )
    sys.stdout.write(line)
    sys.stdout.flush()
    if current >= total:
        sys.stdout.write("\n")
        sys.stdout.flush()


def should_exclude(path: Path) -> bool:
    rel = path.relative_to(LOCAL_ROOT)
    if set(rel.parts) & EXCLUDE_DIRS:
        return True
    if path.name in EXCLUDE_FILES:
        return True
    if path.name.startswith("iltmc_deploy_") and path.suffix == ".gz":
        return True
    if path.name.startswith("_") and path.suffix in {".py", ".js"}:
        return True
    if path.suffix == ".pyc":
        return True
    return False


def make_archive() -> tuple[int, int]:
    print("==> Packing project for deploy")
    if LOCAL_ARCHIVE.exists():
        LOCAL_ARCHIVE.unlink()

    files: list[Path] = []
    total_bytes = 0
    for root, dirs, names in os.walk(LOCAL_ROOT):
        root_path = Path(root)
        dirs[:] = [
            d
            for d in dirs
            if d not in EXCLUDE_DIRS and not should_exclude(root_path / d)
        ]
        for name in names:
            full = root_path / name
            if should_exclude(full):
                continue
            files.append(full)
            total_bytes += full.stat().st_size

    print(f"    Files to pack : {len(files)}")
    print(f"    Source size   : {human_size(total_bytes)}")

    packed = 0
    packed_bytes = 0
    started = time.time()
    with tarfile.open(LOCAL_ARCHIVE, "w:gz") as tar:
        for full in files:
            tar.add(full, arcname=full.relative_to(LOCAL_ROOT).as_posix())
            packed += 1
            packed_bytes += full.stat().st_size
            if packed == 1 or packed % 5 == 0 or packed == len(files):
                progress_line("    Packing ", packed_bytes, total_bytes, started)

    archive_size = LOCAL_ARCHIVE.stat().st_size
    elapsed = max(time.time() - started, 0.001)
    print(
        f"    Archive       : {LOCAL_ARCHIVE.name} ({human_size(archive_size)}) "
        f"in {elapsed:.1f}s  ratio {(archive_size / total_bytes * 100 if total_bytes else 0):.1f}%"
    )
    return len(files), archive_size


def upload_with_progress(sftp: paramiko.SFTPClient, local_path: Path, remote_path: str) -> None:
    total = local_path.stat().st_size
    started = time.time()
    last_print = [0.0]

    def callback(transferred: int, remote_total: int) -> None:
        now = time.time()
        # throttle UI updates a bit
        if transferred < (remote_total or total) and now - last_print[0] < 0.05:
            return
        last_print[0] = now
        progress_line("    Uploading", transferred, remote_total or total, started)

    print("==> Uploading archive to server")
    print(f"    Remote path   : {remote_path}")
    print(f"    Upload size   : {human_size(total)}")
    sftp.put(str(local_path), remote_path, callback=callback, confirm=True)
    elapsed = max(time.time() - started, 0.001)
    print(f"    Upload done   : {human_size(total)} in {elapsed:.1f}s ({human_speed(total / elapsed)})")


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 1800, title: str | None = None) -> str:
    if title:
        print(f"==> {title}")
    print(f"    $ {cmd if len(cmd) < 140 else cmd[:137] + '...'}")
    started = time.time()
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    elapsed = time.time() - started
    text = (out + (("\n" + err) if err.strip() else "")).strip()
    if text:
        clipped = text[-2500:] if len(text) > 2500 else text
        for line in clipped.splitlines():
            print(f"    {line}")
    print(f"    [{elapsed:.1f}s] exit={code}")
    if code != 0:
        raise RuntimeError(f"Remote command failed ({code})")
    return out


def main() -> None:
    print("ILTMC production deploy")
    print(f"Host: {HOST}  Site: {REMOTE_SITE}")
    print("-" * 60)

    file_count, archive_size = make_archive()

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("==> Connecting SSH")
    t0 = time.time()
    ssh.connect(
        HOST,
        port=PORT,
        username=USER,
        password=PASSWORD,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )
    print(f"    Connected in {time.time() - t0:.1f}s")

    try:
        run(ssh, "ss -tlnp | grep ':3000' || true", title="Check current app process")
        run(
            ssh,
            f"test -f {REMOTE_SITE}/.env && echo ENV_OK || (echo ENV_MISSING && exit 1)",
            title="Verify production .env exists",
        )

        backup = f"/home/iltmc/htdocs/iltmc.com.bak_{STAMP}"
        run(ssh, f"cp -a {REMOTE_SITE} {backup}", title=f"Backup site -> {backup}")

        sftp = ssh.open_sftp()
        try:
            upload_with_progress(sftp, LOCAL_ARCHIVE, REMOTE_ARCHIVE)
            # confirm remote size
            remote_stat = sftp.stat(REMOTE_ARCHIVE)
            print(
                f"    Remote size   : {human_size(remote_stat.st_size)} "
                f"(match={'yes' if remote_stat.st_size == archive_size else 'NO'})"
            )
            if remote_stat.st_size != archive_size:
                raise RuntimeError("Remote archive size mismatch")
        finally:
            sftp.close()

        run(
            ssh,
            f"mkdir -p {REMOTE_TMP} && tar -xzf {REMOTE_ARCHIVE} -C {REMOTE_TMP}",
            title="Extract archive on server",
        )
        run(
            ssh,
            (
                f"cp {REMOTE_SITE}/.env {REMOTE_TMP}/.env && "
                f"rsync -a --delete "
                f"--exclude node_modules --exclude .next --exclude .env "
                f"{REMOTE_TMP}/ {REMOTE_SITE}/ && "
                f"cp {REMOTE_TMP}/.env {REMOTE_SITE}/.env && "
                f"chown -R iltmc:iltmc {REMOTE_SITE}"
            ),
            title="Sync code (preserve .env / node_modules /.next)",
        )
        run(
            ssh,
            (
                f"bash -lc '"
                f"export NVM_DIR=/home/iltmc/.nvm; . \"$NVM_DIR/nvm.sh\"; "
                f"cd {REMOTE_SITE}; npm install; npm run build"
                f"'"
            ),
            timeout=1800,
            title="npm install + build",
        )
        run(
            ssh,
            (
                "bash <<'EOF'\n"
                "set -e\n"
                "export NVM_DIR=/home/iltmc/.nvm\n"
                ". \"$NVM_DIR/nvm.sh\"\n"
                f"cd {REMOTE_SITE}\n"
                "set -a; . ./.env; set +a\n"
                "fuser -k 3000/tcp 2>/dev/null || true\n"
                "sleep 1\n"
                "mkdir -p /home/iltmc/logs\n"
                "nohup npx next start -H 127.0.0.1 -p 3000 "
                ">> /home/iltmc/logs/next-start.log 2>&1 < /dev/null &\n"
                "echo $! > /home/iltmc/logs/next.pid\n"
                "sleep 5\n"
                "ss -tlnp | grep ':3000' || exit 1\n"
                "curl -s http://127.0.0.1:3000/api/stats\n"
                "echo\n"
                "EOF"
            ),
            title="Restart Next.js on :3000",
        )
        run(
            ssh,
            "curl -s https://iltmc.com/api/stats; echo; "
            "mongosh --quiet iltmc --eval "
            "'print(\"members=\" + db.members.countDocuments())'",
            title="Verify live API + DB",
        )
        run(ssh, f"rm -rf {REMOTE_TMP} {REMOTE_ARCHIVE}", title="Cleanup remote temp")

        print("-" * 60)
        print("Deploy complete")
        print(f"  Packed files : {file_count}")
        print(f"  Upload size  : {human_size(archive_size)}")
        print(f"  Backup       : {backup}")
        print("  Preserved    : .env + MongoDB data")
    finally:
        ssh.close()
        if LOCAL_ARCHIVE.exists():
            LOCAL_ARCHIVE.unlink()
            print(f"  Local archive removed: {LOCAL_ARCHIVE.name}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"\nDEPLOY FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
