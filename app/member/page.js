'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, Bike, MapPin, Shield, Award, Calendar,
  LogOut, Upload, FileSpreadsheet, CheckCircle, XCircle, Clock,
  TrendingUp, Eye, EyeOff, RefreshCw, Home, Settings, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_9bab05d4-0d45-4f8d-a396-cf0659408542/artifacts/lv5k959m_Ilt%20logo.png'

// Math Captcha Component
function MathCaptcha({ captchaId, setCaptchaId, captchaQuestion, setCaptchaQuestion, captchaAnswer, setCaptchaAnswer }) {
  const [loading, setLoading] = useState(false)

  const refreshCaptcha = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/captcha/generate')
      const data = await res.json()
      setCaptchaId(data.captchaId)
      setCaptchaQuestion(data.question)
      setCaptchaAnswer('')
    } catch (error) {
      toast.error('Failed to load captcha')
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshCaptcha()
  }, [])

  return (
    <div className="space-y-2">
      <Label>Security Check</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-center">
          <span className="text-lg font-mono font-bold text-yellow-400">
            {loading ? '...' : captchaQuestion}
          </span>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={refreshCaptcha}
          disabled={loading}
          className="border-zinc-700"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>
      <Input
        type="number"
        value={captchaAnswer}
        onChange={(e) => setCaptchaAnswer(e.target.value)}
        className="bg-zinc-800 border-zinc-700"
        placeholder="Enter your answer"
        required
      />
    </div>
  )
}

// Login Form Component
function LoginForm({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaId, captchaAnswer })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('iltmc_member_token', data.token)
        localStorage.setItem('iltmc_member_user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
        toast.success('Welcome back!')
      } else {
        toast.error(data.error || 'Login failed')
        // Refresh captcha on error
        const captchaRes = await fetch('/api/captcha/generate')
        const captchaData = await captchaRes.json()
        setCaptchaId(captchaData.captchaId)
        setCaptchaQuestion(captchaData.question)
        setCaptchaAnswer('')
      }
    } catch (error) {
      toast.error('Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <img src={LOGO_URL} alt="ILTMC" className="w-24 h-24 mx-auto mb-4" />
            <CardTitle className="text-2xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
              MEMBER <span className="text-red-500">LOGIN</span>
            </CardTitle>
            <CardDescription>Sign in to your member account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <MathCaptcha
                captchaId={captchaId}
                setCaptchaId={setCaptchaId}
                captchaQuestion={captchaQuestion}
                setCaptchaQuestion={setCaptchaQuestion}
                captchaAnswer={captchaAnswer}
                setCaptchaAnswer={setCaptchaAnswer}
              />

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button onClick={onSwitchToSignup} className="text-red-500 hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center">
          <a href="/" className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2">
            <Home size={14} /> Back to Homepage
          </a>
        </div>
      </motion.div>
    </div>
  )
}

// Signup Form Component
function SignupForm({ onLogin, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    roadName: '', phone: '', bike: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/member/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaId,
          captchaAnswer
        })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('iltmc_member_token', data.token)
        localStorage.setItem('iltmc_member_user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
        toast.success('Account created successfully!')
      } else {
        toast.error(data.error || 'Signup failed')
        // Refresh captcha on error
        const captchaRes = await fetch('/api/captcha/generate')
        const captchaData = await captchaRes.json()
        setCaptchaId(captchaData.captchaId)
        setCaptchaQuestion(captchaData.question)
        setCaptchaAnswer('')
      }
    } catch (error) {
      toast.error('Signup failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <img src={LOGO_URL} alt="ILTMC" className="w-20 h-20 mx-auto mb-2" />
            <CardTitle className="text-2xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
              MEMBER <span className="text-red-500">SIGNUP</span>
            </CardTitle>
            <CardDescription>Create your member account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label>Road Name</Label>
                  <Input
                    value={formData.roadName}
                    onChange={(e) => setFormData({...formData, roadName: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Nickname"
                  />
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-zinc-800 border-zinc-700 pr-10"
                      placeholder="Min 6 chars"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Confirm *</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <Label>Bike</Label>
                  <Input
                    value={formData.bike}
                    onChange={(e) => setFormData({...formData, bike: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Your bike"
                  />
                </div>
              </div>

              <MathCaptcha
                captchaId={captchaId}
                setCaptchaId={setCaptchaId}
                captchaQuestion={captchaQuestion}
                setCaptchaQuestion={setCaptchaQuestion}
                captchaAnswer={captchaAnswer}
                setCaptchaAnswer={setCaptchaAnswer}
              />

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="text-red-500 hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 text-center">
          <a href="/" className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2">
            <Home size={14} /> Back to Homepage
          </a>
        </div>
      </motion.div>
    </div>
  )
}

// Dashboard Tab
function DashboardTab({ profile, stats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          Welcome, <span className="text-red-500">{profile?.name}</span>
        </h1>
        <p className="text-gray-400">Your member dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-2xl font-bold">{stats?.totalKilometers || 0}</p>
            <p className="text-sm text-gray-400">Total KM</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-2xl font-bold">{stats?.ridesCount || 0}</p>
            <p className="text-sm text-gray-400">Rides Attended</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 text-center">
            <Award className="mx-auto text-yellow-500 mb-2" size={32} />
            <p className="text-2xl font-bold">{stats?.rank || 'N/A'}</p>
            <p className="text-sm text-gray-400">Current Rank</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 text-center">
            <Shield className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-2xl font-bold">{stats?.position || 'N/A'}</p>
            <p className="text-sm text-gray-400">Position</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Your Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bike className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Bike</p>
                <p className="font-medium">{profile?.bike || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Chapter</p>
                <p className="font-medium">{profile?.chapter || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Profile Tab
function ProfileTab({ token, profile, setProfile }) {
  const [formData, setFormData] = useState({
    name: '', roadName: '', phone: '', bike: '', chapter: ''
  })
  const [loading, setLoading] = useState(false)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        roadName: profile.roadName || '',
        phone: profile.phone || '',
        bike: profile.bike || '',
        chapter: profile.chapter || ''
      })
    }
    fetchChapters()
  }, [profile])

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/chapters')
      setChapters(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Profile updated!')
        setProfile(data.profile)
      } else {
        toast.error(data.error || 'Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Edit Profile</h1>
        <p className="text-gray-400">Update your member information</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Road Name</Label>
                <Input
                  value={formData.roadName}
                  onChange={(e) => setFormData({...formData, roadName: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Your nickname"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Bike</Label>
                <Input
                  value={formData.bike}
                  onChange={(e) => setFormData({...formData, bike: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="e.g., Royal Enfield Classic 350"
                />
              </div>
            </div>
            <div>
              <Label>Chapter</Label>
              <select
                value={formData.chapter}
                onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2"
              >
                <option value="">Select chapter</option>
                {chapters.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="font-medium mb-2">Read-only Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Rank (Assigned by Admin)</Label>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-md p-2">
                    <Badge className="bg-yellow-600">{profile?.rank || 'Not assigned'}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Position (Assigned by Admin)</Label>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-md p-2">
                    <Badge className="bg-red-600">{profile?.position || 'Member'}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Attendance Tab
function AttendanceTab({ token }) {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/member/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAttendance(await res.json())
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Attendance History</h1>
        <p className="text-gray-400">Your ride attendance record</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {attendance.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {attendance.map((record) => (
                  <div key={record.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{record.ride?.title || 'Unknown Ride'}</p>
                      <p className="text-sm text-gray-400">
                        {record.ride?.date ? new Date(record.ride.date).toLocaleDateString() : 'N/A'} 
                        {record.ride?.distance && ` • ${record.ride.distance} KM`}
                      </p>
                    </div>
                    <Badge className={record.present ? 'bg-green-600' : 'bg-red-600'}>
                      {record.present ? <CheckCircle size={14} className="mr-1" /> : <XCircle size={14} className="mr-1" />}
                      {record.present ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No attendance records yet
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Ride Excel Upload Tab
function RideUploadTab({ token }) {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      const res = await fetch('/api/member/ride-excel', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUploads(await res.json())
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast.error('Please upload an Excel file (.xls, .xlsx) or CSV file')
      return
    }

    setUploading(true)
    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1]
        
        const res = await fetch('/api/member/ride-excel', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            description
          })
        })

        if (res.ok) {
          toast.success('File uploaded successfully!')
          setDescription('')
          fetchUploads()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Upload failed')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Upload failed')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Ride Points Upload</h1>
        <p className="text-gray-400">Upload your ride data Excel sheets</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload size={20} className="text-red-500" />
            Upload New File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="e.g., January 2025 rides"
            />
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xls,.xlsx,.csv"
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-red-600 hover:bg-red-700"
              disabled={uploading}
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <><FileSpreadsheet size={16} className="mr-2" /> Select Excel File</>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">Supported formats: .xls, .xlsx, .csv</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Your Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : uploads.length > 0 ? (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-green-500" size={24} />
                    <div>
                      <p className="font-medium">{upload.fileName}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(upload.uploadedAt).toLocaleDateString()}
                        {upload.description && ` • ${upload.description}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    upload.status === 'approved' ? 'bg-green-600' :
                    upload.status === 'reviewed' ? 'bg-blue-600' : 'bg-yellow-600'
                  }>
                    {upload.status === 'approved' ? <CheckCircle size={12} className="mr-1" /> :
                     upload.status === 'reviewed' ? <Eye size={12} className="mr-1" /> :
                     <Clock size={12} className="mr-1" />}
                    {upload.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No uploads yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Password Tab
function PasswordTab({ token }) {
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password changed successfully!')
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Change Password</h1>
        <p className="text-gray-400">Update your account password</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPwd"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <label htmlFor="showPwd" className="text-sm text-gray-400">Show passwords</label>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Member Portal
export default function MemberPortal() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('iltmc_member_token')
    const savedUser = localStorage.getItem('iltmc_member_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (token) {
      fetchProfile()
      fetchStats()
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/member/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setProfile(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/member/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('iltmc_member_token')
    localStorage.removeItem('iltmc_member_user')
    setUser(null)
    setToken(null)
    setProfile(null)
    setStats(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="ILTMC" className="w-20 h-20 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !token) {
    if (isLogin) {
      return <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setIsLogin(false)} />
    } else {
      return <SignupForm onLogin={handleLogin} onSwitchToLogin={() => setIsLogin(true)} />
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'upload', label: 'Ride Upload', icon: Upload },
    { id: 'password', label: 'Password', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ILTMC" className="w-10 h-10" />
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>ILTMC</p>
              <p className="text-xs text-red-500">Member Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{profile?.rank || 'Member'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-700">
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && <DashboardTab profile={profile} stats={stats} />}
        {activeTab === 'profile' && <ProfileTab token={token} profile={profile} setProfile={setProfile} />}
        {activeTab === 'attendance' && <AttendanceTab token={token} />}
        {activeTab === 'upload' && <RideUploadTab token={token} />}
        {activeTab === 'password' && <PasswordTab token={token} />}
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-4 text-center text-gray-500 text-sm">
        <a href="/" className="hover:text-white">← Back to Main Website</a>
      </footer>
    </div>
  )
}
