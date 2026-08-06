'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, Bike, MapPin, Shield, Award, Calendar,
  LogOut, Upload, FileSpreadsheet, CheckCircle, XCircle, Clock,
  TrendingUp, Eye, EyeOff, RefreshCw, Home, Settings, BarChart3, FileText, AlertCircle,
  MessageCircle, Send, Camera, Link, ExternalLink, Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
                Don&apos;t have an account?{' '}
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

// Signup Form Component (Simplified - just email/password/name)
function SignupForm({ onLogin, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
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
          name: formData.name,
          email: formData.email,
          password: formData.password,
          captchaId,
          captchaAnswer
        })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('iltmc_member_token', data.token)
        localStorage.setItem('iltmc_member_user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
        toast.success('Account created! Please complete the joining form.')
      } else {
        toast.error(data.error || 'Signup failed')
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
            <CardDescription>Create your account to join ILTMC</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Your full name"
                  required
                />
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
              <div>
                <Label>Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 pr-10"
                    placeholder="Min 6 characters"
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
                <Label>Confirm Password *</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Repeat password"
                  required
                />
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

// Joining Form Component (shown when status is 'pending')
function JoiningForm({ token, onSubmit }) {
  const [formData, setFormData] = useState({
    roadName: '', phone: '', bike: '', experience: '', reason: '', chapter: 'Agartala',
    aadhaarCard: '', aadhaarFileName: '', drivingLicense: '', drivingLicenseFileName: ''
  })
  const [loading, setLoading] = useState(false)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/chapters')
      setChapters(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      setFormData({
        ...formData,
        [field]: base64,
        [field + 'FileName']: file.name
      })
      toast.success(`${field === 'aadhaarCard' ? 'Aadhaar Card' : 'Driving License'} uploaded`)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.aadhaarCard || !formData.drivingLicense) {
      toast.error('Please upload both Aadhaar Card and Driving License')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/member/joining-form', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Application submitted! Waiting for admin approval.')
        onSubmit()
      } else {
        toast.error(data.error || 'Failed to submit')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <img src={LOGO_URL} alt="ILTMC" className="w-20 h-20 mx-auto mb-4" />
            <CardTitle className="text-2xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
              COMPLETE YOUR <span className="text-red-500">APPLICATION</span>
            </CardTitle>
            <CardDescription>Fill out the joining form to become a member</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Road Name (Nickname)</Label>
                  <Input
                    value={formData.roadName}
                    onChange={(e) => setFormData({...formData, roadName: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Your biker nickname"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="+91 xxxxxxxxxx"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Your Bike *</Label>
                  <Input
                    value={formData.bike}
                    onChange={(e) => setFormData({...formData, bike: e.target.value})}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="e.g., Royal Enfield Classic 350"
                    required
                  />
                </div>
                <div>
                  <Label>Chapter</Label>
                  <select
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2"
                  >
                    <option value="Agartala">Agartala</option>
                    {chapters.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Riding Experience *</Label>
                <Input
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="e.g., 5 years of riding"
                  required
                />
              </div>
              <div>
                <Label>Why do you want to join ILTMC? *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Tell us about yourself and your passion for riding..."
                  rows={4}
                  required
                />
              </div>

              {/* Document Uploads */}
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <FileText className="text-red-500" size={20} />
                  Required Documents (Self-Attested)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Aadhaar Card *</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, 'aadhaarCard')}
                        className="hidden"
                        id="aadhaar-upload"
                      />
                      <label
                        htmlFor="aadhaar-upload"
                        className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          formData.aadhaarCard 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-zinc-700 hover:border-red-500'
                        }`}
                      >
                        {formData.aadhaarCard ? (
                          <>
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-sm text-green-500 truncate">{formData.aadhaarFileName || 'Uploaded'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="text-gray-400" size={20} />
                            <span className="text-sm text-gray-400">Upload Aadhaar</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label>Driving License *</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, 'drivingLicense')}
                        className="hidden"
                        id="dl-upload"
                      />
                      <label
                        htmlFor="dl-upload"
                        className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          formData.drivingLicense 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-zinc-700 hover:border-red-500'
                        }`}
                      >
                        {formData.drivingLicense ? (
                          <>
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-sm text-green-500 truncate">{formData.drivingLicenseFileName || 'Uploaded'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="text-gray-400" size={20} />
                            <span className="text-sm text-gray-400">Upload DL</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max 5MB each. Accepted: JPG, PNG, PDF</p>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg" disabled={loading}>
                {loading ? 'Submitting...' : 'SUBMIT APPLICATION'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Waiting for Approval Component
function WaitingApproval({ profile, onLogout }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
              APPLICATION <span className="text-yellow-500">PENDING</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Your application has been submitted and is waiting for admin approval. 
              We&apos;ll notify you once your membership is approved.
            </p>
            
            <div className="bg-zinc-800/50 rounded-lg p-4 text-left mb-6">
              <h4 className="font-medium mb-2">Application Details:</h4>
              <p className="text-sm text-gray-400">Name: {profile?.name}</p>
              <p className="text-sm text-gray-400">Email: {profile?.email}</p>
              <p className="text-sm text-gray-400">Bike: {profile?.bike || 'Not specified'}</p>
              <p className="text-sm text-gray-400">
                Submitted: {profile?.formSubmittedAt ? new Date(profile.formSubmittedAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>

            <Button variant="outline" onClick={onLogout} className="border-zinc-700">
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </CardContent>
        </Card>
        <div className="mt-4">
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

      {/* Member Type Badge */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Membership Status</h3>
              <p className="text-gray-400 text-sm">Your current membership type</p>
            </div>
            <Badge className={profile?.memberType === 'member' ? 'bg-green-600 text-lg px-4 py-2' : 'bg-orange-600 text-lg px-4 py-2'}>
              {profile?.memberType === 'member' ? '✓ Permanent Member' : '⏳ Prospect'}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
    name: '', roadName: '', phone: '', bike: '', chapter: '', profilePicture: '', rankPointsLink: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        roadName: profile.roadName || '',
        phone: profile.phone || '',
        bike: profile.bike || '',
        chapter: profile.chapter || '',
        profilePicture: profile.profilePicture || '',
        rankPointsLink: profile.rankPointsLink || ''
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

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image')
      return
    }

    setUploadingPicture(true)
    const reader = new FileReader()
    reader.onload = () => {
      setFormData({...formData, profilePicture: reader.result})
      toast.success('Profile picture uploaded! Click Save to update.')
      setUploadingPicture(false)
    }
    reader.readAsDataURL(file)
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
            {/* Profile Picture Upload */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Camera size={16} className="text-red-500" />
                Profile Picture
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl overflow-hidden">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0) || '?'
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    id="profile-picture-upload"
                    disabled={uploadingPicture}
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors"
                  >
                    <Upload size={16} />
                    {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max 2MB. JPG, PNG, or WEBP</p>
                </div>
              </div>
            </div>

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
                <Label className="flex items-center gap-2">
                  Road Name (Nickname)
                  <Badge variant="outline" className="text-xs border-red-500 text-red-500">Public</Badge>
                </Label>
                <Input
                  value={formData.roadName}
                  onChange={(e) => setFormData({...formData, roadName: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Your biker nickname"
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

            {/* Rank Points Excel Link */}
            <div>
              <Label className="flex items-center gap-2">
                <Link size={16} className="text-green-500" />
                Rank Points Excel Sheet Link
              </Label>
              <Input
                value={formData.rankPointsLink}
                onChange={(e) => setFormData({...formData, rankPointsLink: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Add a link to your rank points Excel sheet (Google Sheets, Excel Online, etc.)
              </p>
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
      if (res.ok) {
        setAttendance(await res.json())
      }
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
      if (res.ok) {
        setUploads(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

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
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Rank Points Upload</h1>
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

// Chat Tab
function ChatTab({ token, profile }) {
  const [conversations, setConversations] = useState([])
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner.id)
      const interval = setInterval(() => fetchMessages(selectedPartner.id), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPartner])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setConversations(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const fetchMessages = async (partnerId) => {
    try {
      const res = await fetch(`/api/chat/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedPartner) return

    setSending(true)
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedPartner.id,
          message: newMessage.trim()
        })
      })
      if (res.ok) {
        setNewMessage('')
        await fetchMessages(selectedPartner.id)
        await fetchConversations()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
          <MessageCircle className="inline text-red-500 mr-2" size={32} />
          Member Chat
        </h1>
        <p className="text-gray-400">Connect with fellow club members</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-zinc-800">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="font-medium">Conversations</h3>
              </div>
              <ScrollArea className="h-[540px]">
                {loading ? (
                  <p className="text-center p-4 text-gray-500">Loading...</p>
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => setSelectedPartner({
                        id: conv.partnerId,
                        name: conv.partnerName,
                        roadName: conv.partnerRoadName,
                        picture: conv.partnerPicture
                      })}
                      className={`w-full p-4 border-b border-zinc-800 hover:bg-zinc-800/50 text-left transition-colors ${
                        selectedPartner?.id === conv.partnerId ? 'bg-zinc-800/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                          {conv.partnerPicture ? (
                            <img src={conv.partnerPicture} alt={conv.partnerName} className="w-full h-full object-cover" />
                          ) : (
                            conv.partnerName?.charAt(0) || '?'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conv.partnerName}</p>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-red-600 text-xs">{conv.unreadCount}</Badge>
                            )}
                          </div>
                          {conv.partnerRoadName && (
                            <p className="text-xs text-red-500 truncate">&quot;{conv.partnerRoadName}&quot;</p>
                          )}
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center p-4 text-gray-500">No conversations yet</p>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedPartner ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-sm overflow-hidden">
                      {selectedPartner.picture ? (
                        <img src={selectedPartner.picture} alt={selectedPartner.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedPartner.name?.charAt(0) || '?'
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedPartner.name}</p>
                      {selectedPartner.roadName && (
                        <p className="text-xs text-red-500">&quot;{selectedPartner.roadName}&quot;</p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isMe = msg.senderId === profile?.id
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${
                              isMe ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'
                            }`}>
                              <p className="text-sm break-words">{msg.message}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-zinc-800 border-zinc-700"
                        disabled={sending}
                      />
                      <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={sending || !newMessage.trim()}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
        const data = await res.json()
        setProfile(data)
        // Update user with latest approval status
        setUser(prev => ({ ...prev, approvalStatus: data.approvalStatus }))
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

  const handleFormSubmit = () => {
    fetchProfile()
  }

  // Heartbeat to update online status - must be before early returns
  useEffect(() => {
    if (token && profile) {
      const sendHeartbeat = async () => {
        try {
          await fetch('/api/member/heartbeat', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch (error) {
          console.error('Heartbeat failed:', error)
        }
      }
      
      sendHeartbeat() // Send immediately
      const interval = setInterval(sendHeartbeat, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [token, profile])

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

  // Not logged in
  if (!user || !token) {
    if (isLogin) {
      return <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setIsLogin(false)} />
    } else {
      return <SignupForm onLogin={handleLogin} onSwitchToLogin={() => setIsLogin(true)} />
    }
  }

  // Check approval status
  const approvalStatus = profile?.approvalStatus || user?.approvalStatus

  // Show joining form if status is pending
  if (approvalStatus === 'pending') {
    return <JoiningForm token={token} onSubmit={handleFormSubmit} />
  }

  // Show waiting screen if form submitted but not approved
  if (approvalStatus === 'form_submitted') {
    return <WaitingApproval profile={profile} onLogout={handleLogout} />
  }

  // Show rejected message
  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-zinc-900/50 border-zinc-800 max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">Application Rejected</h2>
            <p className="text-gray-400 mb-4">Unfortunately, your membership application was not approved.</p>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Approved - show full dashboard
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'upload', label: 'Rank Points', icon: Upload },
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
              <div className="flex items-center gap-2 justify-end">
                <p className="text-xs text-gray-400">{profile?.rank || 'Member'}</p>
                <Badge className={profile?.memberType === 'member' ? 'bg-green-600 text-xs' : 'bg-orange-600 text-xs'}>
                  {profile?.memberType === 'member' ? 'Member' : 'Prospect'}
                </Badge>
              </div>
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
        {activeTab === 'chat' && <ChatTab token={token} profile={profile} />}
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
