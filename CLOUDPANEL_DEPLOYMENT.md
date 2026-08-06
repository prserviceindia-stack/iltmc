# ILTMC Website - CloudPanel Deployment Guide

## Download Links

### Option 1: Download via Browser
Visit the download endpoint in your browser:
```
https://9bab05d4-0d45-4f8d-a396-cf0659408542.preview.emergentagent.com/api/download/package
```

### Option 2: Download via Admin Panel
1. Login to Admin Panel (`/admin`)
2. Go to the dashboard
3. Use the backup/download feature

---

## CloudPanel Installation Steps

### Prerequisites
- CloudPanel installed on your server
- Node.js 18+ installed
- MongoDB installed and running

### Step 1: Create Node.js Application in CloudPanel

1. Login to CloudPanel
2. Go to **Sites** → **Add Site**
3. Select **Node.js** application
4. Enter your domain: `iltmc.com`
5. Choose Node.js version: **18 or higher**
6. Click **Create**

### Step 2: Upload Files

1. Connect via SFTP or SSH to your server
2. Navigate to: `/home/iltmc/htdocs/iltmc.com/`
3. Upload all files from the downloaded package
4. Or use git clone if you've pushed to GitHub

### Step 3: Configure Environment Variables

Create/edit `.env` file in the project root:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/iltmc

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Base URL
NEXT_PUBLIC_BASE_URL=https://iltmc.com

# Gmail SMTP for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=intrepidusleonestripura@gmail.com
SMTP_PASS=ykvthjfdxeakuier
NOTIFICATION_EMAIL=intrepidusleonestripura@gmail.com
```

### Step 4: Install Dependencies & Build

```bash
cd /home/iltmc/htdocs/iltmc.com/
yarn install
yarn build
```

### Step 5: Configure PM2 in CloudPanel

In CloudPanel, set the **Start Command** to:
```
yarn start
```

Or create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'iltmc',
    script: 'yarn',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Step 6: Import Database (Optional)

If you have database exports from `database_export/` folder:

```bash
# Import each collection
mongoimport --db iltmc --collection users --file database_export/users.json --jsonArray
mongoimport --db iltmc --collection members --file database_export/members.json --jsonArray
mongoimport --db iltmc --collection ranks --file database_export/ranks.json --jsonArray
mongoimport --db iltmc --collection positions --file database_export/positions.json --jsonArray
mongoimport --db iltmc --collection chapters --file database_export/chapters.json --jsonArray
# ... repeat for other collections
```

### Step 7: Setup Nginx Reverse Proxy

CloudPanel should auto-configure this, but ensure:
- Port 3000 is proxied
- WebSocket support enabled (if needed)
- SSL certificate installed

---

## Default Credentials

### Admin Panel
- **URL**: https://iltmc.com/admin
- **Email**: admin@iltmc.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

---

## File Structure

```
/home/iltmc/htdocs/iltmc.com/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel
│   ├── member/            # Member portal
│   ├── members/           # Public members page
│   ├── profile/[id]/      # Public member profiles
│   ├── api/               # API routes
│   └── page.js            # Homepage
├── components/            # UI components
├── lib/                   # Utilities
├── public/                # Static files
├── .env                   # Environment variables
├── package.json           # Dependencies
└── next.config.js         # Next.js config
```

---

## Troubleshooting

### Application not starting?
1. Check Node.js version: `node -v` (should be 18+)
2. Check logs: `pm2 logs iltmc`
3. Verify MongoDB is running: `systemctl status mongod`

### Database connection issues?
1. Ensure MongoDB is installed and running
2. Check MONGO_URL in `.env`
3. Create database if needed: `mongo --eval "use iltmc"`

### Emails not sending?
1. Verify Gmail App Password is correct
2. Check if "Less secure apps" is enabled (if using regular password)
3. Check spam folder

---

## Support

For issues, contact the development team or check the GitHub repository.
