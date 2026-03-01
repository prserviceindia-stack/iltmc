# ILTMC Website - Complete CloudPanel Installation Guide
## Step-by-Step Instructions for Beginners

---

# PART 1: DOWNLOAD FILES TO YOUR PC

## Step 1.1: Download from This Preview Environment

### Method A: Direct Download Link
Your complete package is available at:
```
https://leones-admin.preview.emergentagent.com/api/download
```
*(If this doesn't work, use Method B)*

### Method B: Download Individual Files
1. Open your browser
2. Go to: `https://leones-admin.preview.emergentagent.com`
3. The files you need are in `/app/iltmc_complete_package.tar.gz`

### Method C: Use the Preview File Manager
1. Look for a "Files" or "Download" option in the preview interface
2. Navigate to `/app/`
3. Download `iltmc_complete_package.tar.gz`

### What's Inside the Package:
```
iltmc_complete_package.tar.gz
└── iltmc_full_package/
    ├── app/                    # Next.js app files
    ├── components/             # UI components
    ├── lib/                    # Utility files
    ├── public/                 # Static files
    ├── database_export/        # MongoDB data (JSON files)
    ├── package.json            # Dependencies
    ├── tailwind.config.js      # Tailwind CSS config
    ├── postcss.config.js       # PostCSS config
    ├── jsconfig.json           # JS config
    └── .env                    # Environment variables
```

---

# PART 2: PREPARE YOUR CLOUDPANEL SERVER

## Step 2.1: Login to CloudPanel

1. Open your browser
2. Go to: `https://YOUR_SERVER_IP:8443`
3. Login with your CloudPanel admin credentials

## Step 2.2: Create a New Node.js Website

1. Click **"+ Add Site"** button (top right)
2. Select **"Create a Node.js Site"**
3. Fill in the form:
   - **Domain Name:** `iltmc.com` (or your domain)
   - **Node.js Version:** Select `20` or `22` (LTS)
   - **App Port:** `3000`
4. Click **"Create"**
5. **Note down the Site User** (e.g., `iltmc` or similar)

## Step 2.3: Point Your Domain to Server

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add/Update DNS records:
   - **Type:** A
   - **Name:** @ (or blank)
   - **Value:** YOUR_SERVER_IP
   - **TTL:** 3600

   - **Type:** A
   - **Name:** www
   - **Value:** YOUR_SERVER_IP
   - **TTL:** 3600

3. Wait 5-30 minutes for DNS propagation

---

# PART 3: INSTALL MONGODB ON SERVER

## Step 3.1: Connect to Your Server via SSH

### On Windows:
1. Download and install **PuTTY** from: https://putty.org
2. Open PuTTY
3. Enter your server IP in "Host Name"
4. Click "Open"
5. Login as `root` with your password

### On Mac/Linux:
1. Open Terminal
2. Run: `ssh root@YOUR_SERVER_IP`
3. Enter your password when prompted

## Step 3.2: Install MongoDB (Run These Commands on Server)

**Copy and paste each command one by one:**

```bash
# Step 1: Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
```

```bash
# Step 2: Add MongoDB repository (for Ubuntu 22.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

```bash
# Step 3: Update package list
sudo apt update
```

```bash
# Step 4: Install MongoDB
sudo apt install -y mongodb-org
```

```bash
# Step 5: Start MongoDB
sudo systemctl start mongod
```

```bash
# Step 6: Enable MongoDB to start on boot
sudo systemctl enable mongod
```

```bash
# Step 7: Verify MongoDB is running
sudo systemctl status mongod
```

You should see **"active (running)"** in green. Press `q` to exit.

---

# PART 4: UPLOAD YOUR PROJECT FILES

## Step 4.1: Upload Using FileZilla (SFTP) - RECOMMENDED

### Install FileZilla:
1. Download from: https://filezilla-project.org
2. Install it on your PC

### Connect to Server:
1. Open FileZilla
2. Enter connection details:
   - **Host:** YOUR_SERVER_IP
   - **Username:** The site user (e.g., `iltmc`)
   - **Password:** Your CloudPanel site user password
   - **Port:** 22
3. Click **"Quickconnect"**

### Find Site User Password:
1. In CloudPanel, go to your site
2. Click **"Users"** tab
3. Click on the site user
4. Click **"Reset Password"** and note it down

### Upload Files:
1. On the LEFT side (your PC), navigate to where you extracted `iltmc_full_package`
2. On the RIGHT side (server), navigate to: `/home/iltmc/htdocs/iltmc.com/`
   (Replace `iltmc` with your actual site user and domain)
3. Delete any existing files in the server folder
4. Select ALL files from `iltmc_full_package` folder on the left
5. Drag them to the right side
6. Wait for upload to complete

### Important: File Structure Should Look Like:
```
/home/iltmc/htdocs/iltmc.com/
├── app/
├── components/
├── lib/
├── public/
├── database_export/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── .env
```

## Step 4.2: Alternative - Upload via SCP (Command Line)

### On Windows (using PowerShell):
```powershell
scp -r C:\path\to\iltmc_full_package\* iltmc@YOUR_SERVER_IP:/home/iltmc/htdocs/iltmc.com/
```

### On Mac/Linux:
```bash
scp -r /path/to/iltmc_full_package/* iltmc@YOUR_SERVER_IP:/home/iltmc/htdocs/iltmc.com/
```

---

# PART 5: CONFIGURE THE APPLICATION

## Step 5.1: SSH into Server as Site User

```bash
# From your SSH session as root, switch to site user
su - iltmc
```
(Replace `iltmc` with your actual site user)

## Step 5.2: Navigate to Project Directory

```bash
cd ~/htdocs/iltmc.com
```
(Replace `iltmc.com` with your actual domain)

## Step 5.3: Verify Files are Uploaded

```bash
ls -la
```

You should see: `app/`, `components/`, `package.json`, etc.

## Step 5.4: Edit Environment Variables

```bash
nano .env
```

Update the content to:
```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=iltmc

# Your Domain (CHANGE THIS!)
NEXT_PUBLIC_BASE_URL=https://iltmc.com

# Security (CHANGE THIS!)
JWT_SECRET=your-very-long-random-secret-key-change-this-123456

# CORS
CORS_ORIGINS=https://iltmc.com
```

**To save in nano:**
1. Press `Ctrl + X`
2. Press `Y` to confirm
3. Press `Enter` to save

## Step 5.5: Create next.config.mjs (if not exists)

```bash
nano next.config.mjs
```

Add this content:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
```

Save with `Ctrl + X`, then `Y`, then `Enter`.

---

# PART 6: INSTALL DEPENDENCIES & BUILD

## Step 6.1: Install Node.js Dependencies

```bash
# Make sure you're in the project directory
cd ~/htdocs/iltmc.com

# Install dependencies using npm
npm install
```

Wait for installation to complete (may take 2-5 minutes).

## Step 6.2: Build the Application

```bash
npm run build
```

Wait for build to complete. You should see "Compiled successfully" at the end.

**If you see errors:**
- Read the error message carefully
- Most common issue: missing files or wrong file structure
- Make sure all files from `iltmc_full_package` are uploaded correctly

---

# PART 7: IMPORT DATABASE

## Step 7.1: Import Data from JSON Files

Run these commands one by one:

```bash
cd ~/htdocs/iltmc.com/database_export
```

```bash
# Import all collections
mongoimport --db iltmc --collection users --file users.json
mongoimport --db iltmc --collection ranks --file ranks.json
mongoimport --db iltmc --collection positions --file positions.json
mongoimport --db iltmc --collection chapters --file chapters.json
mongoimport --db iltmc --collection members --file members.json
mongoimport --db iltmc --collection rides --file rides.json
mongoimport --db iltmc --collection events --file events.json
mongoimport --db iltmc --collection applications --file applications.json
mongoimport --db iltmc --collection contacts --file contacts.json
mongoimport --db iltmc --collection newsletter --file newsletter.json
mongoimport --db iltmc --collection seo_settings --file seo_settings.json
mongoimport --db iltmc --collection website_content --file website_content.json
```

## Step 7.2: Verify Database Import

```bash
# Connect to MongoDB
mongosh

# Switch to database
use iltmc

# Check collections
show collections

# Check if users imported
db.users.find()

# Exit MongoDB shell
exit
```

---

# PART 8: SETUP PM2 FOR PRODUCTION

## Step 8.1: Install PM2 Globally

```bash
# As site user
npm install -g pm2
```

## Step 8.2: Create PM2 Configuration

```bash
cd ~/htdocs/iltmc.com
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'iltmc',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/iltmc/htdocs/iltmc.com',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

**IMPORTANT:** Change `/home/iltmc/htdocs/iltmc.com` to your actual path!

Save with `Ctrl + X`, then `Y`, then `Enter`.

## Step 8.3: Start the Application

```bash
pm2 start ecosystem.config.js
```

## Step 8.4: Verify Application is Running

```bash
pm2 status
```

You should see `iltmc` with status `online`.

## Step 8.5: Save PM2 Configuration

```bash
pm2 save
```

## Step 8.6: Setup PM2 to Start on Boot

```bash
# Generate startup script
pm2 startup

# Copy and run the command it gives you (as root)
# It will look something like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u iltmc --hp /home/iltmc
```

---

# PART 9: CONFIGURE CLOUDPANEL NODE.JS SETTINGS

## Step 9.1: Go to CloudPanel

1. Open CloudPanel in browser: `https://YOUR_SERVER_IP:8443`
2. Click on your site
3. Go to **"Vhost"** or **"Nginx"** settings

## Step 9.2: Update Nginx Configuration

Look for the location block and make sure it has:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

# PART 10: SETUP SSL CERTIFICATE

## Step 10.1: In CloudPanel

1. Go to your site in CloudPanel
2. Click **"SSL/TLS"** tab
3. Click **"Actions"** → **"New Let's Encrypt Certificate"**
4. Enter your email address
5. Click **"Create and Install"**

Wait for SSL to be issued (usually 1-2 minutes).

---

# PART 11: TEST YOUR WEBSITE

## Step 11.1: Test the Website

1. Open browser
2. Go to: `https://yourdomain.com`
3. You should see the ILTMC homepage!

## Step 11.2: Test Admin Panel

1. Go to: `https://yourdomain.com/admin`
2. Login with:
   - **Email:** `admin@iltmc.com`
   - **Password:** `admin123`

## Step 11.3: IMPORTANT - Change Admin Password!

After logging in:
1. The default password is `admin123`
2. You should change it immediately

**To change password via command line:**

```bash
# SSH to server as root
ssh root@YOUR_SERVER_IP

# Connect to MongoDB
mongosh

# Switch to database
use iltmc

# Generate new password hash (run this in a separate terminal with Node.js)
# node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_NEW_PASSWORD', 12).then(console.log)"

# Update password in MongoDB
db.users.updateOne(
  { email: 'admin@iltmc.com' },
  { $set: { password: 'PASTE_THE_HASH_HERE' } }
)

# Exit
exit
```

---

# TROUBLESHOOTING

## Problem: Website shows 502 Bad Gateway

**Solution:**
```bash
# Check if app is running
pm2 status

# If not running, start it
pm2 start ecosystem.config.js

# Check logs for errors
pm2 logs iltmc
```

## Problem: Database connection error

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

## Problem: Build fails

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

## Problem: Permission denied errors

**Solution:**
```bash
# Fix permissions (run as root)
chown -R iltmc:iltmc /home/iltmc/htdocs/iltmc.com
```

---

# USEFUL COMMANDS REFERENCE

```bash
# View app logs
pm2 logs iltmc

# Restart app
pm2 restart iltmc

# Stop app
pm2 stop iltmc

# Check app status
pm2 status

# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx config
sudo nginx -t
```

---

# CONTACT & SUPPORT

**Website:** https://iltmc.com
**Admin Panel:** https://iltmc.com/admin

---

**🏍️ Ride Safe! - ILTMC - Intrepidus Leones Tripura Motorcycle Club**
