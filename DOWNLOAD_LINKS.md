# ILTMC Website - Download Links & Features

## 📥 Download Links

### Website/Project Package
**URL:** `https://leones-admin.preview.emergentagent.com/api/download/package`

Downloads a complete ZIP file of the website source code including:
- All application files and code
- Configuration files
- Documentation
- Excludes: node_modules, .git, .next, dump folders, logs

**Usage:** Click the link or use `wget` or `curl` to download the full project.

---

### Database Export
**URL:** `https://leones-admin.preview.emergentagent.com/api/download/database`

Downloads a JSON file containing all database collections:
- Members
- Users
- Ranks, Positions, Chapters
- Content, SEO settings
- Events, Rides, Gallery
- Applications, Attendance records
- Chat messages

**Note:** Sensitive data (passwords, Aadhaar cards, driving licenses) are automatically excluded from the export for security.

---

## ✨ New Features Implemented

### 1. Member Chat System 🗨️
- **Location:** Member Dashboard → Chat Tab
- **Features:**
  - Real-time member-to-member messaging
  - Conversation list with unread message counts
  - Profile pictures in chat
  - Auto-refresh every 3-5 seconds
  - Mobile-responsive chat interface

### 2. Online Status & Last Seen 🟢
- **Location:** Public Members Page (`/members`)
- **Features:**
  - Green "Online" badge for active members
  - "Last seen" timestamps (e.g., "5m ago", "2h ago")
  - Automatic heartbeat system (updates every 30 seconds)
  - Real-time status updates on members page

### 3. Profile Picture Upload 📸
- **Location:** Member Dashboard → Profile Tab
- **Features:**
  - Upload profile photo (JPG, PNG, WEBP)
  - Max size: 2MB
  - Images stored as base64 in database
  - Displays in member cards, chat, and public profiles
  - Fallback to name initial if no picture

### 4. Nickname (Road Name) 🏍️
- **Location:** Member Dashboard → Profile Tab
- **Features:**
  - Set your biker nickname/road name
  - Visible on public profiles and members page
  - Displays in red color for branding consistency
  - Badge shows it's public information

### 5. Rank Points Excel Sheet Link 📊
- **Location:** Member Dashboard → Profile Tab
- **Features:**
  - Add link to your rank points spreadsheet
  - Supports Google Sheets, Excel Online, etc.
  - Mobile-friendly iframe viewer in public profile
  - Direct link to open in new tab
  - Shows live updated data from spreadsheet

### 6. Enhanced Public Profile Page 👤
- **URL:** `/profile/[member-id]`
- **New Features:**
  - Profile picture display
  - Rank points sheet iframe/link
  - Nickname prominently displayed
  - Stats: Total KM, Rides, Rank, Position
  - Responsive mobile design

---

## 🔑 Test Credentials

### Admin Panel
- **URL:** https://leones-admin.preview.emergentagent.com/admin
- **Email:** admin@iltmc.com
- **Password:** admin123

### Member Portal
- **URL:** https://leones-admin.preview.emergentagent.com/member
- **Test Member Email:** newmember@iltmc.com
- **Test Member Password:** member123

---

## 🚀 How to Deploy to CloudPanel

1. **Download the website package:**
   ```bash
   wget https://leones-admin.preview.emergentagent.com/api/download/package -O iltmc-website.zip
   ```

2. **Upload to your CloudPanel server and extract:**
   ```bash
   unzip iltmc-website.zip
   cd iltmc-website
   ```

3. **Install dependencies:**
   ```bash
   yarn install
   ```

4. **Configure environment variables** (create `.env` file):
   ```
   MONGO_URL=mongodb://localhost:27017/iltmc
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   JWT_SECRET=your-secure-secret-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

5. **Import database** (if needed):
   - Download database export from the link above
   - Use `mongoimport` or MongoDB Compass to import

6. **Build and start:**
   ```bash
   yarn build
   yarn start
   ```

---

## 📱 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/member` | GET | Member login/signup page |
| `/members` | GET | Public members directory with online status |
| `/profile/[id]` | GET | Public member profile |
| `/api/chat/conversations` | GET | Get chat conversations (auth required) |
| `/api/chat/messages/[partnerId]` | GET | Get messages with a member (auth required) |
| `/api/chat/send` | POST | Send a message (auth required) |
| `/api/members/online` | GET | Get online status of all members |
| `/api/member/heartbeat` | POST | Update member's online status (auth required) |
| `/api/member/profile` | PUT | Update member profile (auth required) |

---

## 🎨 Design Highlights

- **Color Scheme:** Red (#DC2626) and Black theme
- **Fonts:** Oswald for headings, Inter for body text
- **UI Components:** shadcn/ui with Tailwind CSS
- **Responsive:** Mobile-first design
- **Animations:** Framer Motion for smooth transitions

---

## 🔒 Security Notes

- JWT authentication for members and admin
- Math CAPTCHA for signup/login
- Password hashing with bcrypt
- Document uploads stored as base64
- Sensitive data excluded from database exports
- CORS enabled for external access

---

## 📧 Email Notifications

Email notifications are sent for:
- New member application submissions
- Event RSVP submissions
- Ride interest submissions

**Configuration:** Check `.env` for SMTP settings.

---

## 💡 Tips

1. **Chat Feature:** Members must be logged in to use chat. The chat tab appears in the member dashboard after approval.

2. **Online Status:** Members are shown as "online" if they've sent a heartbeat in the last 2 minutes. Last seen shows time since last activity.

3. **Profile Pictures:** Uploaded images are converted to base64 and stored in MongoDB. For production with many users, consider switching to cloud storage (S3, Cloudinary).

4. **Rank Points Sheet:** The iframe may not work for all spreadsheet platforms due to embedding restrictions. The direct link always works.

5. **Download Security:** Consider adding admin authentication to the download endpoints in production for security.

---

**Built with ❤️ for Intrepidus Leones Tripura Motorcycle Club**
