# ILTMC Website - Deployment Guide

## Table of Contents
1. [Database Export](#database-export)
2. [CloudPanel Installation](#cloudpanel-installation)
3. [Environment Variables](#environment-variables)
4. [Post-Installation Setup](#post-installation-setup)

---

## Database Export

### Option 1: Export MongoDB Database (mongodump)

```bash
# Export entire database
mongodump --db iltmc --out ./backup

# This creates a folder structure:
# ./backup/iltmc/
#   ├── users.bson
#   ├── members.bson
#   ├── ranks.bson
#   ├── positions.bson
#   ├── chapters.bson
#   ├── rides.bson
#   ├── events.bson
#   ├── applications.bson
#   ├── contacts.bson
#   ├── newsletter.bson
#   ├── seo_settings.bson
#   ├── website_content.bson
#   └── ... (metadata files)

# Compress for transfer
tar -czvf iltmc-backup.tar.gz ./backup
```

### Option 2: Export as JSON (mongoexport)

```bash
# Export each collection as JSON
mongoexport --db iltmc --collection users --out users.json
mongoexport --db iltmc --collection members --out members.json
mongoexport --db iltmc --collection ranks --out ranks.json
mongoexport --db iltmc --collection positions --out positions.json
mongoexport --db iltmc --collection chapters --out chapters.json
mongoexport --db iltmc --collection rides --out rides.json
mongoexport --db iltmc --collection events --out events.json
mongoexport --db iltmc --collection applications --out applications.json
mongoexport --db iltmc --collection contacts --out contacts.json
mongoexport --db iltmc --collection newsletter --out newsletter.json
mongoexport --db iltmc --collection seo_settings --out seo_settings.json
mongoexport --db iltmc --collection website_content --out website_content.json
mongoexport --db iltmc --collection ride_attendance --out ride_attendance.json
mongoexport --db iltmc --collection gallery --out gallery.json
mongoexport --db iltmc --collection blog --out blog.json

# Or export all at once with a script
for collection in users members ranks positions chapters rides events applications contacts newsletter seo_settings website_content ride_attendance gallery blog; do
    mongoexport --db iltmc --collection $collection --out ${collection}.json
done
```

### Import Database on New Server

```bash
# Using mongorestore (from mongodump backup)
mongorestore --db iltmc ./backup/iltmc

# Using mongoimport (from JSON files)
mongoimport --db iltmc --collection users --file users.json
mongoimport --db iltmc --collection members --file members.json
# ... repeat for each collection
```

---

## CloudPanel Installation

### Prerequisites
- CloudPanel installed on your VPS
- Domain pointed to your server
- SSH access to your server

### Step 1: Create a New Node.js Site in CloudPanel

1. **Login to CloudPanel** at `https://your-server-ip:8443`

2. **Add a New Site:**
   - Click "Add Site"
   - Select "Node.js" as the application type
   - Enter your domain name (e.g., `iltmc.com`)
   - Select Node.js version: **20.x or 22.x** (LTS recommended)
   - Click "Create"

3. **Note the site details:**
   - Site User: `iltmc` (or your chosen name)
   - Home Directory: `/home/iltmc/htdocs/iltmc.com`

### Step 2: Install MongoDB on CloudPanel Server

```bash
# SSH into your server as root
ssh root@your-server-ip

# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Add MongoDB repository (Ubuntu 22.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Step 3: Upload Your Project Files

```bash
# Switch to site user
su - iltmc

# Navigate to site directory
cd ~/htdocs/iltmc.com

# Option A: Clone from Git (if you have a repo)
git clone https://github.com/your-repo/iltmc-website.git .

# Option B: Upload via SFTP
# Use FileZilla or similar to upload all project files to:
# /home/iltmc/htdocs/iltmc.com/

# Option C: Upload via SCP
scp -r /path/to/your/project/* iltmc@your-server-ip:~/htdocs/iltmc.com/
```

### Step 4: Install Dependencies

```bash
# As site user (su - iltmc)
cd ~/htdocs/iltmc.com

# Install Node.js dependencies
npm install
# OR use yarn
yarn install

# Build the Next.js application
npm run build
# OR
yarn build
```

### Step 5: Configure Environment Variables

```bash
# Create .env file
nano ~/htdocs/iltmc.com/.env
```

Add the following content:

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=iltmc

# App URL (replace with your domain)
NEXT_PUBLIC_BASE_URL=https://iltmc.com

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGINS=https://iltmc.com
```

### Step 6: Import Your Database

```bash
# Upload your backup files to server first, then:

# Using mongorestore
mongorestore --db iltmc /path/to/backup/iltmc

# OR using mongoimport for JSON files
cd /path/to/json/files
for file in *.json; do
    collection="${file%.json}"
    mongoimport --db iltmc --collection $collection --file $file
done
```

### Step 7: Configure CloudPanel Node.js Settings

1. **In CloudPanel, go to your site → Node.js Settings**

2. **Set the following:**
   - **App Port:** `3000`
   - **Node.js Version:** `20.x` or `22.x`
   - **Start Command:** `npm start` or `yarn start`
   - **Environment:** `production`

3. **Or configure PM2 (recommended for production):**

```bash
# As site user
cd ~/htdocs/iltmc.com

# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
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
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 8: Configure Nginx Reverse Proxy

CloudPanel usually handles this automatically, but if needed, update the Nginx config:

```bash
# Edit Nginx vhost (as root)
nano /etc/nginx/sites-enabled/iltmc.com.conf
```

Ensure it has:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name iltmc.com www.iltmc.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name iltmc.com www.iltmc.com;

    ssl_certificate /etc/letsencrypt/live/iltmc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iltmc.com/privkey.pem;

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
}
```

Restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Setup SSL Certificate

```bash
# In CloudPanel, go to your site → SSL/TLS
# Click "Actions" → "New Let's Encrypt Certificate"
# Enter your email and click "Create and Install"
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `iltmc` |
| `NEXT_PUBLIC_BASE_URL` | Your website URL | `https://iltmc.com` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://iltmc.com` |

---

## Post-Installation Setup

### 1. Access Admin Panel

Navigate to: `https://yourdomain.com/admin`

**Default Credentials:**
- Email: `admin@iltmc.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

### 2. Update Admin Password

```bash
# Connect to MongoDB
mongosh

# Switch to database
use iltmc

# Generate new password hash (use Node.js)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_NEW_PASSWORD', 12).then(console.log)"

# Update admin password
db.users.updateOne(
  { email: 'admin@iltmc.com' },
  { $set: { password: 'PASTE_HASH_HERE' } }
)
```

### 3. Configure Your Content

1. **Website Content** → Update logo, hero section, about section
2. **SEO Settings** → Add your Google/Bing verification codes
3. **Members** → Add your club members
4. **Chapters** → Update chapter locations
5. **Ranks & Positions** → Customize if needed

### 4. Setup Automatic Backups

```bash
# Create backup script
nano /home/iltmc/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/iltmc/backups"
mkdir -p $BACKUP_DIR
mongodump --db iltmc --out $BACKUP_DIR/backup_$DATE
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Make executable
chmod +x /home/iltmc/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/iltmc/backup.sh
```

---

## Troubleshooting

### App not starting?
```bash
# Check PM2 logs
pm2 logs iltmc

# Check Node.js errors
cd ~/htdocs/iltmc.com
npm run build 2>&1 | tail -50
```

### MongoDB connection issues?
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -100 /var/log/mongodb/mongod.log
```

### 502 Bad Gateway?
```bash
# Check if app is running
pm2 status

# Check Nginx config
sudo nginx -t

# Restart services
pm2 restart iltmc
sudo systemctl restart nginx
```

---

## Project Structure

```
/home/iltmc/htdocs/iltmc.com/
├── app/
│   ├── admin/
│   │   └── page.js          # Admin dashboard
│   ├── api/
│   │   └── [[...path]]/
│   │       └── route.js     # All API endpoints
│   ├── sitemap.xml/
│   │   └── route.js         # Dynamic sitemap
│   ├── robots.txt/
│   │   └── route.js         # Dynamic robots.txt
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout
│   └── page.js              # Homepage
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── db.js                # Database connection
│   └── auth.js              # Auth utilities
├── public/
│   └── uploads/             # Uploaded files
├── .env                     # Environment variables
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## Support

For issues or questions:
- Check the GitHub repository issues
- Review CloudPanel documentation
- MongoDB documentation: https://docs.mongodb.com/

---

**Happy Riding! 🏍️**

*ILTMC - Intrepidus Leones Tripura Motorcycle Club*
