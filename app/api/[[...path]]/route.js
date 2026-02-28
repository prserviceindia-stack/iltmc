import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// MongoDB connection
let client
let db

const JWT_SECRET = process.env.JWT_SECRET || 'iltmc-super-secret-key-2013'

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

  // Initialize default ranks (achievement levels)
  const ranksExist = await db.collection('ranks').countDocuments()
  if (ranksExist === 0) {
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
        ...body,
        date: new Date(body.date),
        isPublic: body.isPublic ?? true,
        createdAt: new Date()
      }
      await db.collection('events').insertOne(event)
      return handleCORS(NextResponse.json(event, { status: 201 }))
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
          robotsTxt: 'User-agent: *\nAllow: /',
          analyticsId: '',
          facebookPixel: ''
        }))
      }
      const { _id, ...cleanedSeo } = seo
      return handleCORS(NextResponse.json(cleanedSeo))
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
