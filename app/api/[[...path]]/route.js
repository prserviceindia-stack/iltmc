import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// MongoDB connection
let client
let db

const JWT_SECRET = process.env.JWT_SECRET || 'iltmc-super-secret-key-2013'

// Captcha store (in-memory, with expiration)
const captchaStore = new Map()

// Generate math captcha
function generateCaptcha() {
  const operations = ['+', '-', '*']
  const op = operations[Math.floor(Math.random() * operations.length)]
  let num1, num2, answer
  
  switch (op) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1
      num2 = Math.floor(Math.random() * 20) + 1
      answer = num1 + num2
      break
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 - num2
      break
    case '*':
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 * num2
      break
  }
  
  const captchaId = uuidv4()
  const question = `${num1} ${op} ${num2} = ?`
  
  // Store with 5-minute expiration
  captchaStore.set(captchaId, { answer, expires: Date.now() + 5 * 60 * 1000 })
  
  // Clean up old captchas
  for (const [key, value] of captchaStore.entries()) {
    if (value.expires < Date.now()) {
      captchaStore.delete(key)
    }
  }
  
  return { captchaId, question }
}

// Verify captcha
function verifyCaptcha(captchaId, userAnswer) {
  const stored = captchaStore.get(captchaId)
  if (!stored) return false
  if (stored.expires < Date.now()) {
    captchaStore.delete(captchaId)
    return false
  }
  const isValid = parseInt(userAnswer) === stored.answer
  captchaStore.delete(captchaId) // One-time use
  return isValid
}

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'iltmc')
  }
  return db
}

// Auth helpers
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

async function authenticateRequest(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Initialize default data
async function initializeDefaults(db) {
  // Check if admin exists
  const adminExists = await db.collection('users').findOne({ email: 'admin@iltmc.com' })
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    await db.collection('users').insertOne({
      id: uuidv4(),
      email: 'admin@iltmc.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      createdAt: new Date()
    })
  }

  // Initialize default ranks (achievement levels) - ILTMC Custom Ranks
  const ranksExist = await db.collection('ranks').countDocuments()
  const hasNewRanks = await db.collection('ranks').findOne({ name: 'Gunner' })
  if (ranksExist === 0 || !hasNewRanks) {
    // Drop old ranks and insert new ones
    await db.collection('ranks').deleteMany({})
    const defaultRanks = [
      { id: uuidv4(), name: 'Gunner', level: 1, badge: '🔫', description: 'Highest achievement rank', color: '#fbbf24' },
      { id: uuidv4(), name: 'Shotgun', level: 2, badge: '💥', description: 'Elite rider status', color: '#f59e0b' },
      { id: uuidv4(), name: 'Boulder', level: 3, badge: '🪨', description: 'Veteran rider', color: '#8b5cf6' },
      { id: uuidv4(), name: 'Iron Clad', level: 4, badge: '🛡️', description: 'Experienced rider', color: '#3b82f6' },
      { id: uuidv4(), name: 'Iron', level: 5, badge: '⚔️', description: 'Proven rider', color: '#10b981' },
      { id: uuidv4(), name: 'Rock', level: 6, badge: '🗿', description: 'Established rider', color: '#6b7280' },
      { id: uuidv4(), name: 'Rubble', level: 7, badge: '🔰', description: 'New member rank', color: '#9ca3af' },
    ]
    await db.collection('ranks').insertMany(defaultRanks)
  }

  // Initialize default positions (club roles)
  const positionsExist = await db.collection('positions').countDocuments()
  if (positionsExist === 0) {
    const defaultPositions = [
      { id: uuidv4(), name: 'President', level: 1, badge: '🦁', description: 'Club leader', color: '#fbbf24' },
      { id: uuidv4(), name: 'Vice President', level: 2, badge: '👑', description: 'Second in command', color: '#ec4899' },
      { id: uuidv4(), name: 'Secretary', level: 3, badge: '📋', description: 'Club records keeper', color: '#3b82f6' },
      { id: uuidv4(), name: 'Vice Secretary', level: 4, badge: '📝', description: 'Assistant to Secretary', color: '#6366f1' },
      { id: uuidv4(), name: 'Treasurer', level: 5, badge: '💰', description: 'Financial manager', color: '#10b981' },
      { id: uuidv4(), name: 'Road Captain', level: 6, badge: '🛣️', description: 'Leads rides and routes', color: '#f59e0b' },
      { id: uuidv4(), name: 'Member', level: 7, badge: '⚔️', description: 'Club member', color: '#dc2626' },
    ]
    await db.collection('positions').insertMany(defaultPositions)
  }

  // Initialize default chapters
  const chaptersExist = await db.collection('chapters').countDocuments()
  if (chaptersExist === 0) {
    const defaultChapters = [
      { id: uuidv4(), name: 'Agartala', city: 'Agartala', state: 'Tripura', isMain: true, createdAt: new Date() },
      { id: uuidv4(), name: 'Dharmanagar', city: 'Dharmanagar', state: 'Tripura', isMain: false, createdAt: new Date() },
      { id: uuidv4(), name: 'Udaipur', city: 'Udaipur', state: 'Tripura', isMain: false, createdAt: new Date() },
    ]
    await db.collection('chapters').insertMany(defaultChapters)
  }
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()
    await initializeDefaults(db)

    // ==================== PUBLIC ROUTES ====================
    
    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "ILTMC API - Intrepidus Leones Tripura Motorcycle Club",
        version: "1.0.0",
        established: 2013
      }))
    }

    // Get public stats
    if (route === '/stats' && method === 'GET') {
      const totalMembers = await db.collection('members').countDocuments()
      const activeMembers = await db.collection('members').countDocuments({ status: 'active' })
      const totalRides = await db.collection('rides').countDocuments()
      const totalEvents = await db.collection('events').countDocuments()
      const totalDistance = await db.collection('rides').aggregate([
        { $group: { _id: null, total: { $sum: '$distance' } } }
      ]).toArray()
      
      return handleCORS(NextResponse.json({
        totalMembers,
        activeMembers,
        totalRides,
        totalEvents,
        totalDistance: totalDistance[0]?.total || 0,
        yearsActive: new Date().getFullYear() - 2013
      }))
    }

    // Get public members
    if (route === '/members/public' && method === 'GET') {
      const members = await db.collection('members')
        .find({ status: { $in: ['active', 'veteran'] } })
        .project({ password: 0 })
        .sort({ rankLevel: -1 })
        .toArray()
      const cleanedMembers = members.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedMembers))
    }

    // Get public rides
    if (route === '/rides/public' && method === 'GET') {
      const rides = await db.collection('rides')
        .find({ isPublic: true })
        .sort({ date: -1 })
        .limit(20)
        .toArray()
      const cleanedRides = rides.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedRides))
    }

    // Get upcoming rides
    if (route === '/rides/upcoming' && method === 'GET') {
      const rides = await db.collection('rides')
        .find({ date: { $gte: new Date() }, isPublic: true })
        .sort({ date: 1 })
        .limit(5)
        .toArray()
      const cleanedRides = rides.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedRides))
    }

    // Get public events
    if (route === '/events/public' && method === 'GET') {
      const events = await db.collection('events')
        .find({ isPublic: true })
        .sort({ date: -1 })
        .limit(20)
        .toArray()
      const cleanedEvents = events.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedEvents))
    }

    // Get upcoming events
    if (route === '/events/upcoming' && method === 'GET') {
      const events = await db.collection('events')
        .find({ date: { $gte: new Date() }, isPublic: true })
        .sort({ date: 1 })
        .limit(5)
        .toArray()
      const cleanedEvents = events.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedEvents))
    }

    // Get gallery
    if (route === '/gallery' && method === 'GET') {
      const gallery = await db.collection('gallery')
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()
      const cleanedGallery = gallery.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedGallery))
    }

    // Get blog posts
    if (route === '/blog' && method === 'GET') {
      const posts = await db.collection('blog')
        .find({ published: true })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray()
      const cleanedPosts = posts.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedPosts))
    }

    // Get single blog post
    if (route.startsWith('/blog/') && method === 'GET') {
      const slug = path[1]
      const post = await db.collection('blog').findOne({ slug, published: true })
      if (!post) {
        return handleCORS(NextResponse.json({ error: 'Post not found' }, { status: 404 }))
      }
      const { _id, ...cleanedPost } = post
      return handleCORS(NextResponse.json(cleanedPost))
    }

    // Submit join application
    if (route === '/applications' && method === 'POST') {
      const body = await request.json()
      const application = {
        id: uuidv4(),
        ...body,
        status: 'pending',
        createdAt: new Date()
      }
      await db.collection('applications').insertOne(application)
      return handleCORS(NextResponse.json({ message: 'Application submitted successfully', id: application.id }))
    }

    // Submit contact form
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      const contact = {
        id: uuidv4(),
        ...body,
        read: false,
        createdAt: new Date()
      }
      await db.collection('contacts').insertOne(contact)
      return handleCORS(NextResponse.json({ message: 'Message sent successfully' }))
    }

    // Newsletter signup
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      const existing = await db.collection('newsletter').findOne({ email: body.email })
      if (existing) {
        return handleCORS(NextResponse.json({ message: 'Already subscribed' }))
      }
      await db.collection('newsletter').insertOne({
        id: uuidv4(),
        email: body.email,
        subscribedAt: new Date()
      })
      return handleCORS(NextResponse.json({ message: 'Subscribed successfully' }))
    }

    // Get ranks public
    if (route === '/ranks' && method === 'GET') {
      const ranks = await db.collection('ranks').find({}).sort({ level: 1 }).toArray()
      const cleanedRanks = ranks.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedRanks))
    }

    // Get chapters public
    if (route === '/chapters' && method === 'GET') {
      const chapters = await db.collection('chapters').find({}).toArray()
      const cleanedChapters = chapters.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedChapters))
    }

    // Get positions public
    if (route === '/positions' && method === 'GET') {
      const positions = await db.collection('positions').find({}).sort({ level: 1 }).toArray()
      const cleanedPositions = positions.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedPositions))
    }

    // ==================== AUTH ROUTES ====================
    
    // Login
    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      const user = await db.collection('users').findOne({ email })
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name })
      const { password: _, _id, ...userData } = user
      
      return handleCORS(NextResponse.json({ token, user: userData }))
    }

    // Verify token
    if (route === '/auth/verify' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Invalid token' }, { status: 401 }))
      }
      return handleCORS(NextResponse.json({ user }))
    }

    // Get current user profile
    if (route === '/auth/profile' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const userData = await db.collection('users').findOne({ id: user.id })
      if (!userData) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }
      const { password: _, _id, ...cleanedUser } = userData
      return handleCORS(NextResponse.json(cleanedUser))
    }

    // Update profile (email, name)
    if (route === '/auth/profile' && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const updateData = {}

      // Update name if provided
      if (body.name) {
        updateData.name = body.name
      }

      // Update email if provided and different
      if (body.email && body.email !== user.email) {
        // Check if email is already taken
        const existingUser = await db.collection('users').findOne({ email: body.email })
        if (existingUser && existingUser.id !== user.id) {
          return handleCORS(NextResponse.json({ error: 'Email already in use' }, { status: 400 }))
        }
        updateData.email = body.email
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date()
        await db.collection('users').updateOne({ id: user.id }, { $set: updateData })
      }

      // Get updated user data
      const updatedUser = await db.collection('users').findOne({ id: user.id })
      const { password: _, _id, ...cleanedUser } = updatedUser

      // Generate new token with updated info
      const newToken = generateToken({ id: cleanedUser.id, email: cleanedUser.email, role: cleanedUser.role, name: cleanedUser.name })

      return handleCORS(NextResponse.json({ message: 'Profile updated', user: cleanedUser, token: newToken }))
    }

    // Change password
    if (route === '/auth/change-password' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const { currentPassword, newPassword } = await request.json()

      // Validate input
      if (!currentPassword || !newPassword) {
        return handleCORS(NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 }))
      }

      if (newPassword.length < 6) {
        return handleCORS(NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 }))
      }

      // Get current user from database
      const userData = await db.collection('users').findOne({ id: user.id })
      if (!userData) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, userData.password)
      if (!isValidPassword) {
        return handleCORS(NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 }))
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      )

      return handleCORS(NextResponse.json({ message: 'Password changed successfully' }))
    }

    // ==================== CAPTCHA ROUTES ====================
    
    // Generate captcha
    if (route === '/captcha/generate' && method === 'GET') {
      const captcha = generateCaptcha()
      return handleCORS(NextResponse.json(captcha))
    }

    // Verify captcha (for testing)
    if (route === '/captcha/verify' && method === 'POST') {
      const { captchaId, answer } = await request.json()
      const isValid = verifyCaptcha(captchaId, answer)
      return handleCORS(NextResponse.json({ valid: isValid }))
    }

    // ==================== MEMBER AUTH ROUTES ====================
    
    // Member signup
    if (route === '/member/signup' && method === 'POST') {
      const { email, password, name, roadName, phone, bike, captchaId, captchaAnswer } = await request.json()

      // Verify captcha
      if (!verifyCaptcha(captchaId, captchaAnswer)) {
        return handleCORS(NextResponse.json({ error: 'Invalid captcha. Please try again.' }, { status: 400 }))
      }

      // Validate required fields
      if (!email || !password || !name) {
        return handleCORS(NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 }))
      }

      if (password.length < 6) {
        return handleCORS(NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 }))
      }

      // Check if email already exists
      const existingMember = await db.collection('member_accounts').findOne({ email })
      if (existingMember) {
        return handleCORS(NextResponse.json({ error: 'Email already registered' }, { status: 400 }))
      }

      // Hash password and create member account
      const hashedPassword = await bcrypt.hash(password, 12)
      const memberId = uuidv4()
      
      // Create member account
      const memberAccount = {
        id: memberId,
        email,
        password: hashedPassword,
        createdAt: new Date()
      }
      await db.collection('member_accounts').insertOne(memberAccount)

      // Create member profile in members collection
      const memberProfile = {
        id: memberId,
        accountId: memberId,
        name,
        roadName: roadName || '',
        email,
        phone: phone || '',
        bike: bike || '',
        rank: 'Rubble', // Default rank for new members
        position: 'Member',
        chapter: 'Agartala',
        status: 'active',
        totalKilometers: 0,
        ridesCount: 0,
        createdAt: new Date()
      }
      await db.collection('members').insertOne(memberProfile)

      // Generate token
      const token = generateToken({ id: memberId, email, role: 'member', name })
      
      return handleCORS(NextResponse.json({ 
        message: 'Account created successfully',
        token,
        user: { id: memberId, email, name, role: 'member' }
      }, { status: 201 }))
    }

    // Member login
    if (route === '/member/login' && method === 'POST') {
      const { email, password, captchaId, captchaAnswer } = await request.json()

      // Verify captcha
      if (!verifyCaptcha(captchaId, captchaAnswer)) {
        return handleCORS(NextResponse.json({ error: 'Invalid captcha. Please try again.' }, { status: 400 }))
      }

      const memberAccount = await db.collection('member_accounts').findOne({ email })
      
      if (!memberAccount || !(await bcrypt.compare(password, memberAccount.password))) {
        return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }))
      }

      // Get member profile
      const memberProfile = await db.collection('members').findOne({ accountId: memberAccount.id })
      
      const token = generateToken({ 
        id: memberAccount.id, 
        email: memberAccount.email, 
        role: 'member', 
        name: memberProfile?.name || 'Member'
      })
      
      return handleCORS(NextResponse.json({ 
        token, 
        user: { 
          id: memberAccount.id, 
          email: memberAccount.email, 
          name: memberProfile?.name || 'Member',
          role: 'member'
        }
      }))
    }

    // Member get profile
    if (route === '/member/profile' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const memberProfile = await db.collection('members').findOne({ accountId: user.id })
      if (!memberProfile) {
        return handleCORS(NextResponse.json({ error: 'Profile not found' }, { status: 404 }))
      }

      const { _id, ...cleanedProfile } = memberProfile
      return handleCORS(NextResponse.json(cleanedProfile))
    }

    // Member update profile
    if (route === '/member/profile' && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const allowedFields = ['name', 'roadName', 'phone', 'bike', 'chapter']
      const updateData = {}
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date()
        await db.collection('members').updateOne({ accountId: user.id }, { $set: updateData })
      }

      const updatedProfile = await db.collection('members').findOne({ accountId: user.id })
      const { _id, ...cleanedProfile } = updatedProfile

      return handleCORS(NextResponse.json({ message: 'Profile updated', profile: cleanedProfile }))
    }

    // Member change password
    if (route === '/member/change-password' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const { currentPassword, newPassword } = await request.json()

      if (!currentPassword || !newPassword) {
        return handleCORS(NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 }))
      }

      if (newPassword.length < 6) {
        return handleCORS(NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 }))
      }

      const memberAccount = await db.collection('member_accounts').findOne({ id: user.id })
      if (!memberAccount) {
        return handleCORS(NextResponse.json({ error: 'Account not found' }, { status: 404 }))
      }

      const isValidPassword = await bcrypt.compare(currentPassword, memberAccount.password)
      if (!isValidPassword) {
        return handleCORS(NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 }))
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await db.collection('member_accounts').updateOne(
        { id: user.id },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      )

      return handleCORS(NextResponse.json({ message: 'Password changed successfully' }))
    }

    // Member get attendance
    if (route === '/member/attendance' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const memberProfile = await db.collection('members').findOne({ accountId: user.id })
      if (!memberProfile) {
        return handleCORS(NextResponse.json({ error: 'Profile not found' }, { status: 404 }))
      }

      const attendance = await db.collection('ride_attendance')
        .find({ memberId: memberProfile.id })
        .sort({ createdAt: -1 })
        .toArray()

      // Get ride details for each attendance
      const rideIds = attendance.map(a => a.rideId)
      const rides = await db.collection('rides').find({ id: { $in: rideIds } }).toArray()
      const ridesMap = new Map(rides.map(r => [r.id, r]))

      const enrichedAttendance = attendance.map(({ _id, ...a }) => ({
        ...a,
        ride: ridesMap.get(a.rideId) ? {
          title: ridesMap.get(a.rideId).title,
          date: ridesMap.get(a.rideId).date,
          distance: ridesMap.get(a.rideId).distance
        } : null
      }))

      return handleCORS(NextResponse.json(enrichedAttendance))
    }

    // Member get stats (total km, rides count)
    if (route === '/member/stats' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const memberProfile = await db.collection('members').findOne({ accountId: user.id })
      if (!memberProfile) {
        return handleCORS(NextResponse.json({ error: 'Profile not found' }, { status: 404 }))
      }

      // Calculate total kilometers from attended rides
      const attendance = await db.collection('ride_attendance')
        .find({ memberId: memberProfile.id, present: true })
        .toArray()

      const rideIds = attendance.map(a => a.rideId)
      const rides = await db.collection('rides').find({ id: { $in: rideIds } }).toArray()
      
      const totalKilometers = rides.reduce((sum, ride) => sum + (ride.distance || 0), 0)
      const ridesCount = rides.length

      // Update member profile with latest stats
      await db.collection('members').updateOne(
        { accountId: user.id },
        { $set: { totalKilometers, ridesCount } }
      )

      return handleCORS(NextResponse.json({
        totalKilometers,
        ridesCount,
        rank: memberProfile.rank,
        position: memberProfile.position
      }))
    }

    // Member upload ride excel
    if (route === '/member/ride-excel' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const { fileName, fileData, description } = body

      if (!fileName || !fileData) {
        return handleCORS(NextResponse.json({ error: 'File name and data are required' }, { status: 400 }))
      }

      const memberProfile = await db.collection('members').findOne({ accountId: user.id })
      
      const upload = {
        id: uuidv4(),
        memberId: memberProfile?.id || user.id,
        memberName: memberProfile?.name || 'Unknown',
        fileName,
        fileData, // Base64 encoded
        description: description || '',
        status: 'pending', // pending, reviewed, approved
        uploadedAt: new Date()
      }

      await db.collection('ride_uploads').insertOne(upload)

      return handleCORS(NextResponse.json({ message: 'File uploaded successfully', uploadId: upload.id }))
    }

    // Member get uploaded files
    if (route === '/member/ride-excel' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'member') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const memberProfile = await db.collection('members').findOne({ accountId: user.id })
      const uploads = await db.collection('ride_uploads')
        .find({ memberId: memberProfile?.id || user.id })
        .sort({ uploadedAt: -1 })
        .toArray()

      const cleanedUploads = uploads.map(({ _id, fileData, ...rest }) => rest) // Don't send file data back
      return handleCORS(NextResponse.json(cleanedUploads))
    }

    // Admin get all ride uploads
    if (route === '/admin/ride-uploads' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const uploads = await db.collection('ride_uploads').find({}).sort({ uploadedAt: -1 }).toArray()
      const cleanedUploads = uploads.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedUploads))
    }

    // Admin update ride upload status
    if (route.startsWith('/admin/ride-uploads/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const uploadId = path[2]
      const body = await request.json()
      await db.collection('ride_uploads').updateOne(
        { id: uploadId },
        { $set: { status: body.status, reviewedBy: user.id, reviewedAt: new Date(), notes: body.notes || '' } }
      )
      return handleCORS(NextResponse.json({ message: 'Upload status updated' }))
    }

    // ==================== ADMIN ROUTES (Protected) ====================
    
    // Admin dashboard stats
    if (route === '/admin/dashboard' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const totalMembers = await db.collection('members').countDocuments()
      const activeMembers = await db.collection('members').countDocuments({ status: 'active' })
      const prospects = await db.collection('members').countDocuments({ status: 'prospect' })
      const pendingApplications = await db.collection('applications').countDocuments({ status: 'pending' })
      const totalRides = await db.collection('rides').countDocuments()
      const upcomingRides = await db.collection('rides').countDocuments({ date: { $gte: new Date() } })
      const totalEvents = await db.collection('events').countDocuments()
      const unreadContacts = await db.collection('contacts').countDocuments({ read: false })
      
      // Recent attendance
      const recentAttendance = await db.collection('ride_attendance')
        .aggregate([
          { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: ['$present', 1, 0] } } } }
        ]).toArray()

      const attendanceRate = recentAttendance[0] 
        ? Math.round((recentAttendance[0].present / recentAttendance[0].total) * 100) 
        : 0

      return handleCORS(NextResponse.json({
        totalMembers,
        activeMembers,
        prospects,
        pendingApplications,
        totalRides,
        upcomingRides,
        totalEvents,
        unreadContacts,
        attendanceRate
      }))
    }

    // ==================== MEMBERS CRUD ====================
    
    // Get all members (admin)
    if (route === '/admin/members' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const members = await db.collection('members').find({}).sort({ createdAt: -1 }).toArray()
      const cleanedMembers = members.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedMembers))
    }

    // Create member
    if (route === '/admin/members' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const member = {
        id: uuidv4(),
        ...body,
        status: body.status || 'prospect',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await db.collection('members').insertOne(member)
      return handleCORS(NextResponse.json(member, { status: 201 }))
    }

    // Update member
    if (route.startsWith('/admin/members/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const memberId = path[2]
      const body = await request.json()
      await db.collection('members').updateOne(
        { id: memberId },
        { $set: { ...body, updatedAt: new Date() } }
      )
      return handleCORS(NextResponse.json({ message: 'Member updated' }))
    }

    // Delete member
    if (route.startsWith('/admin/members/') && method === 'DELETE') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'super_admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const memberId = path[2]
      await db.collection('members').deleteOne({ id: memberId })
      return handleCORS(NextResponse.json({ message: 'Member deleted' }))
    }

    // ==================== RIDES CRUD ====================
    
    // Get all rides (admin)
    if (route === '/admin/rides' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const rides = await db.collection('rides').find({}).sort({ date: -1 }).toArray()
      const cleanedRides = rides.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedRides))
    }

    // Create ride
    if (route === '/admin/rides' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin', 'ride_captain'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const ride = {
        id: uuidv4(),
        ...body,
        date: new Date(body.date),
        isPublic: body.isPublic ?? true,
        createdAt: new Date(),
        createdBy: user.id
      }
      await db.collection('rides').insertOne(ride)
      return handleCORS(NextResponse.json(ride, { status: 201 }))
    }

    // Update ride
    if (route.startsWith('/admin/rides/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const rideId = path[2]
      const body = await request.json()
      if (body.date) body.date = new Date(body.date)
      await db.collection('rides').updateOne({ id: rideId }, { $set: { ...body, updatedAt: new Date() } })
      return handleCORS(NextResponse.json({ message: 'Ride updated' }))
    }

    // Delete ride
    if (route.startsWith('/admin/rides/') && method === 'DELETE') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const rideId = path[2]
      await db.collection('rides').deleteOne({ id: rideId })
      return handleCORS(NextResponse.json({ message: 'Ride deleted' }))
    }

    // ==================== ATTENDANCE ====================
    
    // Mark attendance
    if (route === '/admin/attendance' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const body = await request.json()
      const attendance = {
        id: uuidv4(),
        rideId: body.rideId,
        memberId: body.memberId,
        present: body.present,
        markedBy: user.id,
        createdAt: new Date()
      }
      
      // Upsert attendance
      await db.collection('ride_attendance').updateOne(
        { rideId: body.rideId, memberId: body.memberId },
        { $set: attendance },
        { upsert: true }
      )
      return handleCORS(NextResponse.json(attendance))
    }

    // Get ride attendance
    if (route.startsWith('/admin/attendance/') && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const rideId = path[2]
      const attendance = await db.collection('ride_attendance').find({ rideId }).toArray()
      const cleanedAttendance = attendance.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedAttendance))
    }

    // Get member attendance stats
    if (route === '/admin/attendance/stats' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const stats = await db.collection('ride_attendance').aggregate([
        { $group: { 
          _id: '$memberId', 
          totalRides: { $sum: 1 }, 
          attended: { $sum: { $cond: ['$present', 1, 0] } }
        }},
        { $project: {
          memberId: '$_id',
          totalRides: 1,
          attended: 1,
          rate: { $multiply: [{ $divide: ['$attended', '$totalRides'] }, 100] }
        }}
      ]).toArray()
      
      return handleCORS(NextResponse.json(stats))
    }

    // ==================== EVENTS CRUD ====================
    
    // Get all events (admin)
    if (route === '/admin/events' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const events = await db.collection('events').find({}).sort({ date: -1 }).toArray()
      const cleanedEvents = events.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedEvents))
    }

    // Create event
    if (route === '/admin/events' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const event = {
        id: uuidv4(),
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        venue: body.venue,
        type: body.type,
        imageUrl: body.imageUrl || '', // New: Event image
        externalLink: body.externalLink || '', // New: External link
        isPublic: body.isPublic ?? true,
        createdAt: new Date()
      }
      await db.collection('events').insertOne(event)
      return handleCORS(NextResponse.json(event, { status: 201 }))
    }

    // Update event
    if (route.startsWith('/admin/events/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const eventId = path[2]
      const body = await request.json()
      const updateData = {
        ...body,
        updatedAt: new Date()
      }
      if (body.date) updateData.date = new Date(body.date)
      
      await db.collection('events').updateOne({ id: eventId }, { $set: updateData })
      return handleCORS(NextResponse.json({ message: 'Event updated' }))
    }

    // Delete event
    if (route.startsWith('/admin/events/') && method === 'DELETE') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const eventId = path[2]
      await db.collection('events').deleteOne({ id: eventId })
      return handleCORS(NextResponse.json({ message: 'Event deleted' }))
    }

    // ==================== APPLICATIONS ====================
    
    // Get applications (admin)
    if (route === '/admin/applications' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const applications = await db.collection('applications').find({}).sort({ createdAt: -1 }).toArray()
      const cleanedApps = applications.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedApps))
    }

    // Update application status
    if (route.startsWith('/admin/applications/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const appId = path[2]
      const body = await request.json()
      await db.collection('applications').updateOne(
        { id: appId },
        { $set: { status: body.status, reviewedBy: user.id, reviewedAt: new Date() } }
      )
      return handleCORS(NextResponse.json({ message: 'Application updated' }))
    }

    // ==================== GALLERY ====================
    
    // Add to gallery
    if (route === '/admin/gallery' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const body = await request.json()
      const item = {
        id: uuidv4(),
        ...body,
        isPublic: body.isPublic ?? true,
        createdAt: new Date(),
        uploadedBy: user.id
      }
      await db.collection('gallery').insertOne(item)
      return handleCORS(NextResponse.json(item, { status: 201 }))
    }

    // ==================== SEO SETTINGS ====================
    
    // Get SEO settings
    if (route === '/admin/seo' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const seo = await db.collection('seo_settings').findOne({ key: 'global' })
      if (!seo) {
        return handleCORS(NextResponse.json({
          title: 'ILTMC - Intrepidus Leones Tripura Motorcycle Club',
          description: 'Elite motorcycle club based in Tripura, India. Est. 2013.',
          keywords: 'motorcycle club, Tripura, ILTMC, bikers',
          ogImage: '',
          robotsTxt: 'User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml',
          analyticsId: '',
          facebookPixel: '',
          // Webmaster Verification
          googleVerification: '',
          bingVerification: '',
          yandexVerification: '',
          pinterestVerification: '',
          // Additional scripts
          headScripts: '',
          bodyScripts: ''
        }))
      }
      const { _id, ...cleanedSeo } = seo
      return handleCORS(NextResponse.json(cleanedSeo))
    }

    // Get public SEO settings (for frontend meta tags)
    if (route === '/seo' && method === 'GET') {
      const seo = await db.collection('seo_settings').findOne({ key: 'global' })
      if (!seo) {
        return handleCORS(NextResponse.json({
          title: 'ILTMC - Intrepidus Leones Tripura Motorcycle Club',
          description: 'Elite motorcycle club based in Tripura, India. Est. 2013.',
          keywords: 'motorcycle club, Tripura, ILTMC, bikers',
          googleVerification: '',
          bingVerification: '',
          analyticsId: ''
        }))
      }
      const { _id, key, ...publicSeo } = seo
      return handleCORS(NextResponse.json(publicSeo))
    }

    // Update SEO settings
    if (route === '/admin/seo' && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      await db.collection('seo_settings').updateOne(
        { key: 'global' },
        { $set: { ...body, key: 'global', updatedAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ message: 'SEO settings updated' }))
    }

    // ==================== CONTACTS ====================
    
    // Get contacts (admin)
    if (route === '/admin/contacts' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const contacts = await db.collection('contacts').find({}).sort({ createdAt: -1 }).toArray()
      const cleanedContacts = contacts.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedContacts))
    }

    // Mark contact as read
    if (route.startsWith('/admin/contacts/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const contactId = path[2]
      await db.collection('contacts').updateOne({ id: contactId }, { $set: { read: true } })
      return handleCORS(NextResponse.json({ message: 'Contact marked as read' }))
    }

    // ==================== WEBSITE CONTENT MANAGEMENT ====================
    
    // Get website content
    if (route === '/admin/content' && method === 'GET') {
      const user = await authenticateRequest(request)
      if (!user) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const content = await db.collection('website_content').findOne({ key: 'main' })
      if (!content) {
        // Return default content
        return handleCORS(NextResponse.json({
          branding: {
            logo: 'https://customer-assets.emergentagent.com/job_9bab05d4-0d45-4f8d-a396-cf0659408542/artifacts/lv5k959m_Ilt%20logo.png',
            clubName: 'ILTMC',
            clubFullName: 'Intrepidus Leones Tripura Motorcycle Club',
            tagline: 'Est. 2013',
            favicon: ''
          },
          stats: {
            members: { value: '50', label: 'Members', icon: 'users' },
            rides: { value: '200', label: 'Rides Completed', icon: 'mapPin' },
            distance: { value: '50,000+', label: 'KM Covered', icon: 'compass' },
            years: { value: '13', label: 'Years Strong', icon: 'calendar' }
          },
          hero: {
            title: 'INTREPIDUS LEONES',
            subtitle: 'TRIPURA MOTORCYCLE CLUB',
            tagline: 'Brotherhood • Freedom • Respect | Est. 2013',
            ctaText: 'JOIN THE PRIDE',
            ctaLink: '#join',
            secondaryCtaText: 'LEARN MORE',
            secondaryCtaLink: '#about',
            backgroundImage: 'https://images.unsplash.com/photo-1542227844-5e56c7c2687d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcm9hZHxlbnwwfHx8YmxhY2t8MTc3MjI3NzA4MXww&ixlib=rb-4.1.0&q=85'
          },
          about: {
            badge: 'OUR STORY',
            title: 'ABOUT ILTMC',
            subtitle: 'A brotherhood forged on the open road, united by the love of motorcycles and the spirit of adventure.',
            sectionTitle: 'INTREPIDUS LEONES - The Fearless Lions',
            description1: 'Founded in 2013 in Agartala, Tripura, ILTMC (Intrepidus Leones Tripura Motorcycle Club) represents a brotherhood of passionate riders who share an unbreakable bond through their love for motorcycles and the open road.',
            description2: 'Our name, derived from Latin, means "Fearless Lions" - embodying the courage, strength, and pride that defines every member of our club. We ride together, stand together, and grow together.',
            values: ['Brotherhood', 'Freedom', 'Respect'],
            image: 'https://images.unsplash.com/photo-1597738620274-dfcefdcde990?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxtb3RvcmN5Y2xlJTIwY2x1YnxlbnwwfHx8YmxhY2t8MTc3MjI3NzA3M3ww&ixlib=rb-4.1.0&q=85'
          },
          timeline: [
            { year: '2013', title: 'Foundation', description: 'ILTMC was founded by passionate riders in Tripura' },
            { year: '2015', title: 'First State Ride', description: 'Organized first statewide motorcycle rally' },
            { year: '2018', title: 'National Recognition', description: 'Joined the national motorcycle club federation' },
            { year: '2020', title: 'Community Service', description: 'Started charity rides and community programs' },
            { year: '2023', title: '10 Year Anniversary', description: 'Celebrated a decade of brotherhood and riding' }
          ],
          contact: {
            badge: 'GET IN TOUCH',
            title: 'CONTACT US',
            address: 'Agartala, Tripura, India',
            email: 'contact@iltmc.com',
            phone: '+91 XXXXXXXXXX',
            whatsapp: '+91 XXXXXXXXXX'
          },
          social: {
            facebook: '',
            instagram: '',
            youtube: ''
          },
          footer: {
            description: 'Brotherhood forged on the open road since 2013. United by the love of motorcycles and the spirit of adventure.',
            copyright: '© {year} ILTMC - Intrepidus Leones Tripura Motorcycle Club. All rights reserved.'
          }
        }))
      }
      const { _id, ...cleanedContent } = content
      return handleCORS(NextResponse.json(cleanedContent))
    }

    // Update website content
    if (route === '/admin/content' && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      await db.collection('website_content').updateOne(
        { key: 'main' },
        { $set: { ...body, key: 'main', updatedAt: new Date() } },
        { upsert: true }
      )
      return handleCORS(NextResponse.json({ message: 'Content updated successfully' }))
    }

    // Get public website content
    if (route === '/content' && method === 'GET') {
      const content = await db.collection('website_content').findOne({ key: 'main' })
      if (!content) {
        return handleCORS(NextResponse.json({
          hero: {
            title: 'INTREPIDUS LEONES',
            subtitle: 'TRIPURA MOTORCYCLE CLUB',
            tagline: 'Brotherhood • Freedom • Respect | Est. 2013'
          },
          about: {
            title: 'ABOUT ILTMC',
            subtitle: 'A brotherhood forged on the open road'
          },
          contact: {
            address: 'Agartala, Tripura, India',
            email: 'contact@iltmc.com'
          }
        }))
      }
      const { _id, key, updatedAt, ...publicContent } = content
      return handleCORS(NextResponse.json(publicContent))
    }

    // ==================== RANKS MANAGEMENT ====================
    
    // Update rank (admin)
    if (route.startsWith('/admin/ranks/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const rankId = path[2]
      const body = await request.json()
      await db.collection('ranks').updateOne({ id: rankId }, { $set: body })
      return handleCORS(NextResponse.json({ message: 'Rank updated' }))
    }

    // Create rank (admin)
    if (route === '/admin/ranks' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const body = await request.json()
      const rank = { id: uuidv4(), ...body }
      await db.collection('ranks').insertOne(rank)
      return handleCORS(NextResponse.json(rank, { status: 201 }))
    }

    // Delete rank (admin)
    if (route.startsWith('/admin/ranks/') && method === 'DELETE') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'super_admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const rankId = path[2]
      await db.collection('ranks').deleteOne({ id: rankId })
      return handleCORS(NextResponse.json({ message: 'Rank deleted' }))
    }

    // ==================== POSITIONS MANAGEMENT ====================
    
    // Update position (admin)
    if (route.startsWith('/admin/positions/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const positionId = path[2]
      const body = await request.json()
      await db.collection('positions').updateOne({ id: positionId }, { $set: body })
      return handleCORS(NextResponse.json({ message: 'Position updated' }))
    }

    // Create position (admin)
    if (route === '/admin/positions' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const body = await request.json()
      const position = { id: uuidv4(), ...body }
      await db.collection('positions').insertOne(position)
      return handleCORS(NextResponse.json(position, { status: 201 }))
    }

    // Delete position (admin)
    if (route.startsWith('/admin/positions/') && method === 'DELETE') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'super_admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const positionId = path[2]
      await db.collection('positions').deleteOne({ id: positionId })
      return handleCORS(NextResponse.json({ message: 'Position deleted' }))
    }

    // ==================== CHAPTERS MANAGEMENT ====================
    
    // Update chapter (admin)
    if (route.startsWith('/admin/chapters/') && method === 'PUT') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const chapterId = path[2]
      const body = await request.json()
      await db.collection('chapters').updateOne({ id: chapterId }, { $set: body })
      return handleCORS(NextResponse.json({ message: 'Chapter updated' }))
    }

    // Create chapter (admin)
    if (route === '/admin/chapters' && method === 'POST') {
      const user = await authenticateRequest(request)
      if (!user || !['super_admin', 'admin'].includes(user.role)) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const body = await request.json()
      const chapter = { id: uuidv4(), ...body, createdAt: new Date() }
      await db.collection('chapters').insertOne(chapter)
      return handleCORS(NextResponse.json(chapter, { status: 201 }))
    }

    // Delete chapter (admin)
    if (route.startsWith('/admin/chapters/') && method === 'DELETE') {
      const user = await authenticateRequest(request)
      if (!user || user.role !== 'super_admin') {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }
      const chapterId = path[2]
      await db.collection('chapters').deleteOne({ id: chapterId })
      return handleCORS(NextResponse.json({ message: 'Chapter deleted' }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
