'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, MapPin, Calendar, Trophy, LayoutDashboard, Settings, 
  LogOut, Bike, Shield, Plus, Edit, Trash2, Eye, CheckCircle,
  XCircle, Clock, Mail, FileText, BarChart3, Search, Menu, X,
  ChevronDown, User, Bell, Activity, TrendingUp, Globe, Image,
  Type, Link, Phone, Home, Info, Award, Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_9bab05d4-0d45-4f8d-a396-cf0659408542/artifacts/lv5k959m_Ilt%20logo.png'

// Login Component
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('admin@iltmc.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('iltmc_token', data.token)
        localStorage.setItem('iltmc_user', JSON.stringify(data.user))
        onLogin(data.user, data.token)
        toast.success('Welcome back!')
      } else {
        toast.error(data.error || 'Login failed')
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
              ADMIN <span className="text-red-500">PANEL</span>
            </CardTitle>
            <CardDescription>Sign in to access the dashboard</CardDescription>
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
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">
                Default: admin@iltmc.com / admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Sidebar Component
function Sidebar({ activeTab, setActiveTab, user, onLogout, collapsed, setCollapsed }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content', label: 'Website Content', icon: Globe },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'ranks', label: 'Ranks & Positions', icon: Award },
    { id: 'chapters', label: 'Chapters', icon: Building },
    { id: 'rides', label: 'Rides', icon: Bike },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'contacts', label: 'Messages', icon: Mail },
    { id: 'seo', label: 'SEO Settings', icon: Settings },
  ]

  return (
    <aside className={`fixed left-0 top-0 h-full bg-zinc-950 border-r border-zinc-800 z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <img src={LOGO_URL} alt="ILTMC" className="w-10 h-10" />
          {!collapsed && (
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>ILTMC</p>
              <p className="text-xs text-red-500">Admin Panel</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className={`text-gray-400 hover:text-white ${collapsed ? 'hidden' : ''}`}>
          <ChevronDown className={`transform transition-transform ${collapsed ? 'rotate-90' : '-rotate-90'}`} size={20} />
        </button>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </ScrollArea>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          onClick={onLogout}
          className={`border-zinc-700 hover:bg-zinc-800 ${collapsed ? 'w-full p-2' : 'w-full'}`}
        >
          <LogOut size={16} />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}

// Dashboard Tab
function DashboardTab({ token }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const statCards = [
    { label: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: 'bg-blue-600' },
    { label: 'Active Members', value: stats?.activeMembers || 0, icon: CheckCircle, color: 'bg-green-600' },
    { label: 'Prospects', value: stats?.prospects || 0, icon: Clock, color: 'bg-yellow-600' },
    { label: 'Pending Applications', value: stats?.pendingApplications || 0, icon: FileText, color: 'bg-orange-600' },
    { label: 'Total Rides', value: stats?.totalRides || 0, icon: Bike, color: 'bg-purple-600' },
    { label: 'Upcoming Rides', value: stats?.upcomingRides || 0, icon: Calendar, color: 'bg-pink-600' },
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: Trophy, color: 'bg-indigo-600' },
    { label: 'Unread Messages', value: stats?.unreadContacts || 0, icon: Mail, color: 'bg-red-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Dashboard</h1>
        <p className="text-gray-400">Welcome to ILTMC Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} className="text-red-500" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3"
                    strokeDasharray={`${stats?.attendanceRate || 0}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{stats?.attendanceRate || 0}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 text-sm">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-zinc-800 hover:bg-zinc-700">
              <Plus size={16} className="mr-2" /> Add New Member
            </Button>
            <Button className="w-full justify-start bg-zinc-800 hover:bg-zinc-700">
              <Bike size={16} className="mr-2" /> Create New Ride
            </Button>
            <Button className="w-full justify-start bg-zinc-800 hover:bg-zinc-700">
              <Calendar size={16} className="mr-2" /> Schedule Event
            </Button>
            <Button className="w-full justify-start bg-zinc-800 hover:bg-zinc-700">
              <FileText size={16} className="mr-2" /> Review Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Members Tab
function MembersTab({ token }) {
  const [members, setMembers] = useState([])
  const [ranks, setRanks] = useState([])
  const [positions, setPositions] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '', roadName: '', rank: '', position: '', chapter: '', bike: '', status: 'active', phone: '', email: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [membersRes, ranksRes, positionsRes, chaptersRes] = await Promise.all([
        fetch('/api/admin/members', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/ranks'),
        fetch('/api/positions'),
        fetch('/api/chapters')
      ])
      setMembers(await membersRes.json())
      setRanks(await ranksRes.json())
      setPositions(await positionsRes.json())
      setChapters(await chaptersRes.json())
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    try {
      const url = editingMember 
        ? `/api/admin/members/${editingMember.id}`
        : '/api/admin/members'
      const method = editingMember ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingMember ? 'Member updated' : 'Member added')
        setShowDialog(false)
        setEditingMember(null)
        setFormData({ name: '', roadName: '', rank: '', position: '', chapter: '', bike: '', status: 'active', phone: '', email: '' })
        fetchData()
      }
    } catch (error) {
      toast.error('Failed to save member')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    try {
      await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Member deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const openEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '',
      roadName: member.roadName || '',
      rank: member.rank || '',
      position: member.position || '',
      chapter: member.chapter || '',
      bike: member.bike || '',
      status: member.status || 'active',
      phone: member.phone || '',
      email: member.email || ''
    })
    setShowDialog(true)
  }

  const openAdd = () => {
    setEditingMember(null)
    setFormData({ name: '', roadName: '', rank: '', position: '', chapter: '', bike: '', status: 'active', phone: '', email: '' })
    setShowDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Members</h1>
          <p className="text-gray-400">Manage club members</p>
        </div>
        <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700">
          <Plus size={16} className="mr-2" /> Add Member
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Member</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Rank</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Position</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Chapter</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-lg">
                          {positions.find(p => p.name === member.position)?.badge || ranks.find(r => r.name === member.rank)?.badge || '⚔️'}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-red-500">&quot;{member.roadName}&quot;</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                        {ranks.find(r => r.name === member.rank)?.badge} {member.rank || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-red-500/50 text-red-400">
                        {positions.find(p => p.name === member.position)?.badge} {member.position || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-300">{member.chapter || 'N/A'}</td>
                    <td className="p-4">
                      <Badge className={
                        member.status === 'active' ? 'bg-green-600' :
                        member.status === 'prospect' ? 'bg-yellow-600' :
                        member.status === 'veteran' ? 'bg-blue-600' : 'bg-gray-600'
                      }>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(member)}>
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No members found. Add your first member!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Member Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Road Name *</Label>
                <Input
                  value={formData.roadName}
                  onChange={(e) => setFormData({...formData, roadName: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rank (Achievement Level)</Label>
                <Select value={formData.rank} onValueChange={(v) => setFormData({...formData, rank: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {ranks.map(r => (
                      <SelectItem key={r.id} value={r.name}>{r.badge} {r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Position (Club Role)</Label>
                <Select value={formData.position} onValueChange={(v) => setFormData({...formData, position: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {positions.map(p => (
                      <SelectItem key={p.id} value={p.name}>{p.badge} {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chapter</Label>
                <Select value={formData.chapter} onValueChange={(v) => setFormData({...formData, chapter: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {chapters.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="veteran">Veteran</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
              {editingMember ? 'Update' : 'Add'} Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Rides Tab
function RidesTab({ token }) {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', startPoint: '', endPoint: '', 
    distance: '', difficulty: 'Medium', captain: '', isPublic: true
  })

  useEffect(() => {
    fetchRides()
  }, [])

  const fetchRides = async () => {
    try {
      const res = await fetch('/api/admin/rides', { headers: { Authorization: `Bearer ${token}` } })
      setRides(await res.json())
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/rides', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          distance: parseInt(formData.distance) || 0
        })
      })
      if (res.ok) {
        toast.success('Ride created')
        setShowDialog(false)
        setFormData({ title: '', description: '', date: '', startPoint: '', endPoint: '', distance: '', difficulty: 'Medium', captain: '', isPublic: true })
        fetchRides()
      }
    } catch (error) {
      toast.error('Failed to create ride')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this ride?')) return
    try {
      await fetch(`/api/admin/rides/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Ride deleted')
      fetchRides()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Rides</h1>
          <p className="text-gray-400">Manage club rides</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-red-600 hover:bg-red-700">
          <Plus size={16} className="mr-2" /> Create Ride
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rides.map((ride) => (
          <Card key={ride.id} className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex justify-between">
                <Badge className={
                  ride.difficulty === 'Hard' ? 'bg-red-600' :
                  ride.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                }>
                  {ride.difficulty}
                </Badge>
                <span className="text-red-500 font-bold">{ride.distance} KM</span>
              </div>
              <CardTitle className="text-lg">{ride.title}</CardTitle>
              <CardDescription>{ride.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-400">
                <p><Calendar size={14} className="inline mr-2" />{new Date(ride.date).toLocaleDateString()}</p>
                <p><MapPin size={14} className="inline mr-2" />{ride.startPoint} → {ride.endPoint}</p>
                <p><User size={14} className="inline mr-2" />Captain: {ride.captain || 'TBD'}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye size={14} className="mr-1" /> Attendance
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(ride.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rides.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No rides created yet. Create your first ride!
          </div>
        )}
      </div>

      {/* Create Ride Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ride</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Distance (KM)</Label>
                <Input
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Point</Label>
                <Input
                  value={formData.startPoint}
                  onChange={(e) => setFormData({...formData, startPoint: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>End Point</Label>
                <Input
                  value={formData.endPoint}
                  onChange={(e) => setFormData({...formData, endPoint: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({...formData, difficulty: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Road Captain</Label>
                <Input
                  value={formData.captain}
                  onChange={(e) => setFormData({...formData, captain: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(v) => setFormData({...formData, isPublic: v})}
              />
              <Label>Public Ride</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Create Ride</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Attendance Tab
function AttendanceTab({ token }) {
  const [rides, setRides] = useState([])
  const [members, setMembers] = useState([])
  const [selectedRide, setSelectedRide] = useState(null)
  const [attendance, setAttendance] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [ridesRes, membersRes] = await Promise.all([
      fetch('/api/admin/rides', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/admin/members', { headers: { Authorization: `Bearer ${token}` } })
    ])
    setRides(await ridesRes.json())
    setMembers(await membersRes.json())
  }

  const fetchAttendance = async (rideId) => {
    const res = await fetch(`/api/admin/attendance/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const map = {}
    data.forEach(a => { map[a.memberId] = a.present })
    setAttendance(map)
    setSelectedRide(rideId)
  }

  const markAttendance = async (memberId, present) => {
    await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ rideId: selectedRide, memberId, present })
    })
    setAttendance({ ...attendance, [memberId]: present })
    toast.success(present ? 'Marked present' : 'Marked absent')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Attendance</h1>
        <p className="text-gray-400">Track member attendance for rides</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Select Ride</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {rides.map((ride) => (
                  <button
                    key={ride.id}
                    onClick={() => fetchAttendance(ride.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRide === ride.id ? 'bg-red-600' : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    <p className="font-medium">{ride.title}</p>
                    <p className="text-sm text-gray-400">{new Date(ride.date).toLocaleDateString()}</p>
                  </button>
                ))}
                {rides.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No rides available</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>
              {selectedRide ? `${members.length} members` : 'Select a ride to mark attendance'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRide ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-400">&quot;{member.roadName}&quot;</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => markAttendance(member.id, true)}
                          className={attendance[member.id] === true ? 'bg-green-600' : 'bg-zinc-700'}
                        >
                          <CheckCircle size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => markAttendance(member.id, false)}
                          className={attendance[member.id] === false ? 'bg-red-600' : 'bg-zinc-700'}
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                <p>Select a ride from the left panel</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Events Tab
function EventsTab({ token }) {
  const [events, setEvents] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', venue: '', type: 'Rally', isPublic: true
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch('/api/admin/events', { headers: { Authorization: `Bearer ${token}` } })
    setEvents(await res.json())
  }

  const handleSave = async () => {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      toast.success('Event created')
      setShowDialog(false)
      setFormData({ title: '', description: '', date: '', venue: '', type: 'Rally', isPublic: true })
      fetchEvents()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Events</h1>
          <p className="text-gray-400">Manage club events</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-red-600 hover:bg-red-700">
          <Plus size={16} className="mr-2" /> Create Event
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <Badge className="mb-2 bg-red-600">{event.type}</Badge>
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{event.description}</p>
              <div className="space-y-2 text-sm">
                <p><Calendar size={14} className="inline mr-2" />{new Date(event.date).toLocaleDateString()}</p>
                <p><MapPin size={14} className="inline mr-2" />{event.venue}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No events created yet
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="Rally">Rally</SelectItem>
                    <SelectItem value="Show">Bike Show</SelectItem>
                    <SelectItem value="Charity">Charity</SelectItem>
                    <SelectItem value="Meet">Meet & Greet</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Applications Tab
function ApplicationsTab({ token }) {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const res = await fetch('/api/admin/applications', { headers: { Authorization: `Bearer ${token}` } })
    setApplications(await res.json())
  }

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
    toast.success(`Application ${status}`)
    fetchApplications()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Applications</h1>
        <p className="text-gray-400">Review membership applications</p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{app.name}</h3>
                    <Badge className={
                      app.status === 'pending' ? 'bg-yellow-600' :
                      app.status === 'approved' ? 'bg-green-600' : 'bg-red-600'
                    }>
                      {app.status}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                    <p><Mail size={14} className="inline mr-2" />{app.email}</p>
                    <p><User size={14} className="inline mr-2" />{app.phone}</p>
                    <p><Bike size={14} className="inline mr-2" />{app.bike}</p>
                    <p><Clock size={14} className="inline mr-2" />{app.experience}</p>
                  </div>
                  <p className="mt-2 text-gray-300">{app.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => updateStatus(app.id, 'approved')} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle size={16} className="mr-1" /> Approve
                    </Button>
                    <Button onClick={() => updateStatus(app.id, 'rejected')} variant="destructive">
                      <XCircle size={16} className="mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {applications.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-12 text-center text-gray-500">
              No applications yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Contacts Tab
function ContactsTab({ token }) {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    const res = await fetch('/api/admin/contacts', { headers: { Authorization: `Bearer ${token}` } })
    setContacts(await res.json())
  }

  const markRead = async (id) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchContacts()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Messages</h1>
        <p className="text-gray-400">Contact form submissions</p>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className={`bg-zinc-900/50 border-zinc-800 ${!contact.read ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{contact.subject}</h3>
                  <p className="text-sm text-gray-400">{contact.name} • {contact.email}</p>
                </div>
                {!contact.read && (
                  <Button size="sm" variant="outline" onClick={() => markRead(contact.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
              <p className="mt-4 text-gray-300">{contact.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(contact.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
        {contacts.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-12 text-center text-gray-500">
              No messages yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// SEO Tab
function SEOTab({ token }) {
  const [seo, setSeo] = useState({
    title: '', description: '', keywords: '', ogImage: '', 
    robotsTxt: '', analyticsId: '', facebookPixel: '',
    googleVerification: '', bingVerification: '', yandexVerification: '', pinterestVerification: '',
    headScripts: '', bodyScripts: ''
  })
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('meta')

  useEffect(() => {
    fetchSEO()
  }, [])

  const fetchSEO = async () => {
    const res = await fetch('/api/admin/seo', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setSeo(data)
    setLoading(false)
  }

  const handleSave = async () => {
    await fetch('/api/admin/seo', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(seo)
    })
    toast.success('SEO settings saved')
  }

  if (loading) return <div>Loading...</div>

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>SEO Settings</h1>
          <p className="text-gray-400">Manage website SEO, webmaster tools, and analytics</p>
        </div>
        <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
          Save All Settings
        </Button>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
          <Badge variant="outline" className="cursor-pointer hover:bg-zinc-800">View Sitemap.xml</Badge>
        </a>
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
          <Badge variant="outline" className="cursor-pointer hover:bg-zinc-800">View Robots.txt</Badge>
        </a>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {[
          { id: 'meta', label: 'Meta Tags' },
          { id: 'webmaster', label: 'Webmaster Verification' },
          { id: 'analytics', label: 'Analytics & Tracking' },
          { id: 'robots', label: 'Robots & Sitemap' },
          { id: 'scripts', label: 'Custom Scripts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === tab.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meta Tags Section */}
      {activeSection === 'meta' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Meta Tags</CardTitle>
            <CardDescription>Configure page title, description, and Open Graph tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Title</Label>
              <Input
                value={seo.title || ''}
                onChange={(e) => setSeo({...seo, title: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                placeholder="ILTMC - Intrepidus Leones Tripura Motorcycle Club"
              />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea
                value={seo.description || ''}
                onChange={(e) => setSeo({...seo, description: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                placeholder="Elite motorcycle club based in Tripura, India. Est. 2013."
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{(seo.description || '').length}/160 characters recommended</p>
            </div>
            <div>
              <Label>Keywords</Label>
              <Input
                value={seo.keywords || ''}
                onChange={(e) => setSeo({...seo, keywords: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                placeholder="motorcycle club, Tripura, ILTMC, bikers, riding club"
              />
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input
                value={seo.ogImage || ''}
                onChange={(e) => setSeo({...seo, ogImage: e.target.value})}
                className="bg-zinc-800 border-zinc-700"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630 pixels</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webmaster Verification Section */}
      {activeSection === 'webmaster' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Webmaster Verification</CardTitle>
            <CardDescription>Add verification codes for search engines and social platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">G</div>
                <div>
                  <p className="font-medium">Google Search Console</p>
                  <p className="text-xs text-gray-500">Verify at: search.google.com/search-console</p>
                </div>
              </div>
              <Label>Google Verification Code</Label>
              <Input
                value={seo.googleVerification || ''}
                onChange={(e) => setSeo({...seo, googleVerification: e.target.value})}
                className="bg-zinc-700 border-zinc-600"
                placeholder="Enter the content value from meta tag (e.g., abc123xyz)"
              />
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center text-white font-bold">B</div>
                <div>
                  <p className="font-medium">Bing Webmaster Tools</p>
                  <p className="text-xs text-gray-500">Verify at: bing.com/webmasters</p>
                </div>
              </div>
              <Label>Bing Verification Code</Label>
              <Input
                value={seo.bingVerification || ''}
                onChange={(e) => setSeo({...seo, bingVerification: e.target.value})}
                className="bg-zinc-700 border-zinc-600"
                placeholder="Enter the content value from meta tag"
              />
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">Y</div>
                <div>
                  <p className="font-medium">Yandex Webmaster</p>
                  <p className="text-xs text-gray-500">Verify at: webmaster.yandex.com</p>
                </div>
              </div>
              <Label>Yandex Verification Code</Label>
              <Input
                value={seo.yandexVerification || ''}
                onChange={(e) => setSeo({...seo, yandexVerification: e.target.value})}
                className="bg-zinc-700 border-zinc-600"
                placeholder="Enter the content value from meta tag"
              />
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold">P</div>
                <div>
                  <p className="font-medium">Pinterest</p>
                  <p className="text-xs text-gray-500">Verify at: pinterest.com/settings</p>
                </div>
              </div>
              <Label>Pinterest Verification Code</Label>
              <Input
                value={seo.pinterestVerification || ''}
                onChange={(e) => setSeo({...seo, pinterestVerification: e.target.value})}
                className="bg-zinc-700 border-zinc-600"
                placeholder="Enter the content value from meta tag"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Analytics & Tracking</CardTitle>
            <CardDescription>Configure analytics and tracking pixels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <p className="font-medium">Google Analytics 4</p>
                  <p className="text-xs text-gray-500">Track website traffic and user behavior</p>
                </div>
              </div>
              <Label>Measurement ID</Label>
              <Input
                value={seo.analyticsId || ''}
                onChange={(e) => setSeo({...seo, analyticsId: e.target.value})}
                className="bg-zinc-700 border-zinc-600"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">f</div>
                <div>
                  <p className="font-medium">Facebook Pixel / Meta Pixel</p>
                  <p className="text-xs text-gray-500">Track conversions from Facebook ads</p>
                </div>
              </div>
              <Label>Pixel ID</Label>
              <Input
                value={seo.facebookPixel || ''}
                onChange={(e) => setSeo({...seo, facebookPixel: e.target.value})}
                className="bg-zinc-700 border-zinc-600"
                placeholder="Enter your Facebook Pixel ID"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Robots & Sitemap Section */}
      {activeSection === 'robots' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Robots.txt & Sitemap</CardTitle>
            <CardDescription>Configure search engine crawling rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <p className="text-green-400 font-medium">Sitemap URL</p>
                <p className="text-sm text-gray-400 break-all">{baseUrl}/sitemap.xml</p>
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-blue-400 font-medium">Robots.txt URL</p>
                <p className="text-sm text-gray-400 break-all">{baseUrl}/robots.txt</p>
              </div>
            </div>
            <div>
              <Label>Robots.txt Content</Label>
              <Textarea
                value={seo.robotsTxt || ''}
                onChange={(e) => setSeo({...seo, robotsTxt: e.target.value})}
                className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                rows={10}
                placeholder={`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml`}
              />
              <p className="text-xs text-gray-500 mt-1">The sitemap URL will be auto-appended if not included</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Scripts Section */}
      {activeSection === 'scripts' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Custom Scripts</CardTitle>
            <CardDescription>Add custom tracking scripts or code snippets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Head Scripts (before &lt;/head&gt;)</Label>
              <Textarea
                value={seo.headScripts || ''}
                onChange={(e) => setSeo({...seo, headScripts: e.target.value})}
                className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                rows={6}
                placeholder="<!-- Paste your head scripts here -->"
              />
              <p className="text-xs text-gray-500 mt-1">Scripts placed in the &lt;head&gt; section (e.g., analytics, fonts)</p>
            </div>
            <div>
              <Label>Body Scripts (before &lt;/body&gt;)</Label>
              <Textarea
                value={seo.bodyScripts || ''}
                onChange={(e) => setSeo({...seo, bodyScripts: e.target.value})}
                className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                rows={6}
                placeholder="<!-- Paste your body scripts here -->"
              />
              <p className="text-xs text-gray-500 mt-1">Scripts placed at the end of &lt;body&gt; (e.g., chat widgets, conversion scripts)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Website Content Tab
function ContentTab({ token }) {
  const [content, setContent] = useState({
    branding: { logo: '', clubName: '', clubFullName: '', tagline: '', favicon: '' },
    stats: { 
      members: { value: '50', label: 'Members', icon: 'users' },
      rides: { value: '200', label: 'Rides Completed', icon: 'mapPin' },
      distance: { value: '50,000+', label: 'KM Covered', icon: 'compass' },
      years: { value: '13', label: 'Years Strong', icon: 'calendar' }
    },
    hero: { title: '', subtitle: '', tagline: '', ctaText: '', ctaLink: '', secondaryCtaText: '', secondaryCtaLink: '', backgroundImage: '' },
    about: { badge: '', title: '', subtitle: '', sectionTitle: '', description1: '', description2: '', values: ['', '', ''], image: '' },
    timeline: [],
    contact: { badge: '', title: '', address: '', email: '', phone: '', whatsapp: '' },
    social: { facebook: '', instagram: '', youtube: '' },
    footer: { description: '', copyright: '' }
  })
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('branding')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setContent(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(content)
      })
      toast.success('Content saved successfully!')
    } catch (error) {
      toast.error('Failed to save content')
    }
  }

  const updateBranding = (field, value) => setContent({ ...content, branding: { ...content.branding, [field]: value } })
  const updateStats = (statKey, field, value) => setContent({ 
    ...content, 
    stats: { 
      ...content.stats, 
      [statKey]: { ...content.stats?.[statKey], [field]: value } 
    } 
  })
  const updateHero = (field, value) => setContent({ ...content, hero: { ...content.hero, [field]: value } })
  const updateAbout = (field, value) => setContent({ ...content, about: { ...content.about, [field]: value } })
  const updateContact = (field, value) => setContent({ ...content, contact: { ...content.contact, [field]: value } })
  const updateSocial = (field, value) => setContent({ ...content, social: { ...content.social, [field]: value } })
  const updateFooter = (field, value) => setContent({ ...content, footer: { ...content.footer, [field]: value } })

  const addTimelineItem = () => {
    setContent({
      ...content,
      timeline: [...(content.timeline || []), { year: '', title: '', description: '' }]
    })
  }

  const updateTimeline = (index, field, value) => {
    const newTimeline = [...content.timeline]
    newTimeline[index] = { ...newTimeline[index], [field]: value }
    setContent({ ...content, timeline: newTimeline })
  }

  const removeTimeline = (index) => {
    setContent({ ...content, timeline: content.timeline.filter((_, i) => i !== index) })
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  const sections = [
    { id: 'branding', label: 'Branding & Logo', icon: Image },
    { id: 'stats', label: 'Stats Counter', icon: BarChart3 },
    { id: 'hero', label: 'Hero Section', icon: Home },
    { id: 'about', label: 'About Section', icon: Info },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'footer', label: 'Footer', icon: FileText }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Website Content</h1>
          <p className="text-gray-400">Manage all website sections</p>
        </div>
        <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
          Save All Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Section Navigator */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-zinc-800'
                }`}
              >
                <section.icon size={18} />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Section Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Branding Section */}
          {activeSection === 'branding' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Image size={20} /> Branding & Logo</CardTitle>
                <CardDescription>Manage club logo and branding elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Club Logo URL</Label>
                  <Input value={content.branding?.logo || ''} onChange={(e) => updateBranding('logo', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="https://..." />
                  {content.branding?.logo && (
                    <div className="mt-3 p-4 bg-zinc-800 rounded-lg flex items-center gap-4">
                      <img src={content.branding.logo} alt="Logo Preview" className="h-24 w-24 object-contain" />
                      <div>
                        <p className="text-sm text-gray-400">Current Logo</p>
                        <p className="text-xs text-gray-500 mt-1">Recommended: PNG with transparent background, min 200x200px</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Club Short Name</Label>
                    <Input value={content.branding?.clubName || ''} onChange={(e) => updateBranding('clubName', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="ILTMC" />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input value={content.branding?.tagline || ''} onChange={(e) => updateBranding('tagline', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="Est. 2013" />
                  </div>
                </div>
                <div>
                  <Label>Club Full Name</Label>
                  <Input value={content.branding?.clubFullName || ''} onChange={(e) => updateBranding('clubFullName', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="Intrepidus Leones Tripura Motorcycle Club" />
                </div>
                <div>
                  <Label>Favicon URL (optional)</Label>
                  <Input value={content.branding?.favicon || ''} onChange={(e) => updateBranding('favicon', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="https://... (16x16 or 32x32 icon)" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Counter Section */}
          {activeSection === 'stats' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 size={20} /> Stats Counter</CardTitle>
                <CardDescription>Edit the statistics displayed on homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Members Stat */}
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={18} className="text-red-500" />
                    <span className="font-medium">Members Counter</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Value</Label>
                      <Input value={content.stats?.members?.value || ''} onChange={(e) => updateStats('members', 'value', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="50" />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={content.stats?.members?.label || ''} onChange={(e) => updateStats('members', 'label', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="Members" />
                    </div>
                  </div>
                </div>

                {/* Rides Stat */}
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={18} className="text-red-500" />
                    <span className="font-medium">Rides Counter</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Value</Label>
                      <Input value={content.stats?.rides?.value || ''} onChange={(e) => updateStats('rides', 'value', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="200" />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={content.stats?.rides?.label || ''} onChange={(e) => updateStats('rides', 'label', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="Rides Completed" />
                    </div>
                  </div>
                </div>

                {/* Distance Stat */}
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Bike size={18} className="text-red-500" />
                    <span className="font-medium">Distance Counter</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Value</Label>
                      <Input value={content.stats?.distance?.value || ''} onChange={(e) => updateStats('distance', 'value', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="50,000+" />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={content.stats?.distance?.label || ''} onChange={(e) => updateStats('distance', 'label', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="KM Covered" />
                    </div>
                  </div>
                </div>

                {/* Years Stat */}
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-red-500" />
                    <span className="font-medium">Years Counter</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Value</Label>
                      <Input value={content.stats?.years?.value || ''} onChange={(e) => updateStats('years', 'value', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="13" />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input value={content.stats?.years?.label || ''} onChange={(e) => updateStats('years', 'label', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="Years Strong" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Note: These values will be displayed on the homepage. You can use numbers with suffixes like &quot;50,000+&quot; or &quot;12&quot;
                </p>
              </CardContent>
            </Card>
          )}

          {/* Hero Section */}
          {activeSection === 'hero' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Home size={20} /> Hero Section</CardTitle>
                <CardDescription>Edit the main hero banner on homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Main Title</Label>
                    <Input value={content.hero?.title || ''} onChange={(e) => updateHero('title', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="INTREPIDUS LEONES" />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input value={content.hero?.subtitle || ''} onChange={(e) => updateHero('subtitle', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="TRIPURA MOTORCYCLE CLUB" />
                  </div>
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={content.hero?.tagline || ''} onChange={(e) => updateHero('tagline', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="Brotherhood • Freedom • Respect | Est. 2013" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input value={content.hero?.ctaText || ''} onChange={(e) => updateHero('ctaText', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="JOIN THE PRIDE" />
                  </div>
                  <div>
                    <Label>Primary Button Link</Label>
                    <Input value={content.hero?.ctaLink || ''} onChange={(e) => updateHero('ctaLink', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="#join" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Secondary Button Text</Label>
                    <Input value={content.hero?.secondaryCtaText || ''} onChange={(e) => updateHero('secondaryCtaText', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="LEARN MORE" />
                  </div>
                  <div>
                    <Label>Secondary Button Link</Label>
                    <Input value={content.hero?.secondaryCtaLink || ''} onChange={(e) => updateHero('secondaryCtaLink', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="#about" />
                  </div>
                </div>
                <div>
                  <Label>Background Image URL</Label>
                  <Input value={content.hero?.backgroundImage || ''} onChange={(e) => updateHero('backgroundImage', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="https://..." />
                  {content.hero?.backgroundImage && (
                    <img src={content.hero.backgroundImage} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Section */}
          {activeSection === 'about' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info size={20} /> About Section</CardTitle>
                <CardDescription>Edit the about us section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Badge Text</Label>
                    <Input value={content.about?.badge || ''} onChange={(e) => updateAbout('badge', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="OUR STORY" />
                  </div>
                  <div>
                    <Label>Section Title</Label>
                    <Input value={content.about?.title || ''} onChange={(e) => updateAbout('title', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="ABOUT ILTMC" />
                  </div>
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Textarea value={content.about?.subtitle || ''} onChange={(e) => updateAbout('subtitle', e.target.value)} className="bg-zinc-800 border-zinc-700" rows={2} />
                </div>
                <div>
                  <Label>Content Title</Label>
                  <Input value={content.about?.sectionTitle || ''} onChange={(e) => updateAbout('sectionTitle', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="INTREPIDUS LEONES - The Fearless Lions" />
                </div>
                <div>
                  <Label>First Paragraph</Label>
                  <Textarea value={content.about?.description1 || ''} onChange={(e) => updateAbout('description1', e.target.value)} className="bg-zinc-800 border-zinc-700" rows={3} />
                </div>
                <div>
                  <Label>Second Paragraph</Label>
                  <Textarea value={content.about?.description2 || ''} onChange={(e) => updateAbout('description2', e.target.value)} className="bg-zinc-800 border-zinc-700" rows={3} />
                </div>
                <div>
                  <Label>Core Values (3)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <Input key={i} value={content.about?.values?.[i] || ''} onChange={(e) => {
                        const newValues = [...(content.about?.values || ['', '', ''])]
                        newValues[i] = e.target.value
                        updateAbout('values', newValues)
                      }} className="bg-zinc-800 border-zinc-700" placeholder={['Brotherhood', 'Freedom', 'Respect'][i]} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>About Image URL</Label>
                  <Input value={content.about?.image || ''} onChange={(e) => updateAbout('image', e.target.value)} className="bg-zinc-800 border-zinc-700" />
                  {content.about?.image && (
                    <img src={content.about.image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Section */}
          {activeSection === 'timeline' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock size={20} /> Timeline</CardTitle>
                <CardDescription>Edit club history milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(content.timeline || []).map((item, index) => (
                  <div key={index} className="p-4 bg-zinc-800/50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-500">Milestone {index + 1}</span>
                      <Button size="sm" variant="destructive" onClick={() => removeTimeline(index)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label>Year</Label>
                        <Input value={item.year} onChange={(e) => updateTimeline(index, 'year', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="2013" />
                      </div>
                      <div className="col-span-3">
                        <Label>Title</Label>
                        <Input value={item.title} onChange={(e) => updateTimeline(index, 'title', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="Foundation" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input value={item.description} onChange={(e) => updateTimeline(index, 'description', e.target.value)} className="bg-zinc-700 border-zinc-600" placeholder="ILTMC was founded..." />
                    </div>
                  </div>
                ))}
                <Button onClick={addTimelineItem} variant="outline" className="w-full">
                  <Plus size={16} className="mr-2" /> Add Timeline Item
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Phone size={20} /> Contact Information</CardTitle>
                <CardDescription>Edit contact details displayed on website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Badge Text</Label>
                    <Input value={content.contact?.badge || ''} onChange={(e) => updateContact('badge', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="GET IN TOUCH" />
                  </div>
                  <div>
                    <Label>Section Title</Label>
                    <Input value={content.contact?.title || ''} onChange={(e) => updateContact('title', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="CONTACT US" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={content.contact?.address || ''} onChange={(e) => updateContact('address', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="Agartala, Tripura, India" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={content.contact?.email || ''} onChange={(e) => updateContact('email', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="contact@iltmc.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={content.contact?.phone || ''} onChange={(e) => updateContact('phone', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="+91 XXXXXXXXXX" />
                  </div>
                </div>
                <div>
                  <Label>WhatsApp Number</Label>
                  <Input value={content.contact?.whatsapp || ''} onChange={(e) => updateContact('whatsapp', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="+91 XXXXXXXXXX" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {activeSection === 'social' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe size={20} /> Social Media Links</CardTitle>
                <CardDescription>Add your social media profile URLs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Facebook Page URL</Label>
                  <Input value={content.social?.facebook || ''} onChange={(e) => updateSocial('facebook', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="https://facebook.com/iltmc" />
                </div>
                <div>
                  <Label>Instagram Profile URL</Label>
                  <Input value={content.social?.instagram || ''} onChange={(e) => updateSocial('instagram', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="https://instagram.com/iltmc" />
                </div>
                <div>
                  <Label>YouTube Channel URL</Label>
                  <Input value={content.social?.youtube || ''} onChange={(e) => updateSocial('youtube', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="https://youtube.com/@iltmc" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          {activeSection === 'footer' && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText size={20} /> Footer Content</CardTitle>
                <CardDescription>Edit footer text and copyright</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Footer Description</Label>
                  <Textarea value={content.footer?.description || ''} onChange={(e) => updateFooter('description', e.target.value)} className="bg-zinc-800 border-zinc-700" rows={3} placeholder="Brotherhood forged on the open road since 2013..." />
                </div>
                <div>
                  <Label>Copyright Text</Label>
                  <Input value={content.footer?.copyright || ''} onChange={(e) => updateFooter('copyright', e.target.value)} className="bg-zinc-800 border-zinc-700" placeholder="© {year} ILTMC. All rights reserved." />
                  <p className="text-xs text-gray-500 mt-1">Use {'{year}'} for dynamic year</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Ranks & Positions Tab
function RanksPositionsTab({ token }) {
  const [ranks, setRanks] = useState([])
  const [positions, setPositions] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [dialogType, setDialogType] = useState('rank')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', level: 1, badge: '', description: '', color: '#dc2626' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [ranksRes, positionsRes] = await Promise.all([
      fetch('/api/ranks'),
      fetch('/api/positions')
    ])
    setRanks(await ranksRes.json())
    setPositions(await positionsRes.json())
  }

  const openAdd = (type) => {
    setDialogType(type)
    setEditingItem(null)
    setFormData({ name: '', level: 1, badge: '', description: '', color: '#dc2626' })
    setShowDialog(true)
  }

  const openEdit = (item, type) => {
    setDialogType(type)
    setEditingItem(item)
    setFormData({ name: item.name, level: item.level, badge: item.badge, description: item.description, color: item.color })
    setShowDialog(true)
  }

  const handleSave = async () => {
    const endpoint = dialogType === 'rank' ? 'ranks' : 'positions'
    const url = editingItem ? `/api/admin/${endpoint}/${editingItem.id}` : `/api/admin/${endpoint}`
    const method = editingItem ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    toast.success(editingItem ? 'Updated successfully' : 'Created successfully')
    setShowDialog(false)
    fetchData()
  }

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure?')) return
    const endpoint = type === 'rank' ? 'ranks' : 'positions'
    await fetch(`/api/admin/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Deleted successfully')
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Ranks & Positions</h1>
        <p className="text-gray-400">Manage member ranks and club positions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ranks */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ranks (Achievement Levels)</CardTitle>
              <CardDescription>Member achievement progression</CardDescription>
            </div>
            <Button size="sm" onClick={() => openAdd('rank')} className="bg-red-600 hover:bg-red-700">
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ranks.map((rank) => (
                <div key={rank.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rank.badge}</span>
                    <div>
                      <p className="font-medium">{rank.name}</p>
                      <p className="text-xs text-gray-500">Level {rank.level} • {rank.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(rank, 'rank')}><Edit size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(rank.id, 'rank')}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Positions */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Positions (Club Roles)</CardTitle>
              <CardDescription>Official club positions</CardDescription>
            </div>
            <Button size="sm" onClick={() => openAdd('position')} className="bg-red-600 hover:bg-red-700">
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {positions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{position.badge}</span>
                    <div>
                      <p className="font-medium">{position.name}</p>
                      <p className="text-xs text-gray-500">Level {position.level} • {position.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(position, 'position')}><Edit size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(position.id, 'position')}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} {dialogType === 'rank' ? 'Rank' : 'Position'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label>Level</Label>
                <Input type="number" value={formData.level} onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})} className="bg-zinc-800 border-zinc-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Badge (Emoji)</Label>
                <Input value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} className="bg-zinc-800 border-zinc-700" placeholder="🔫" />
              </div>
              <div>
                <Label>Color</Label>
                <Input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="bg-zinc-800 border-zinc-700 h-10" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-zinc-800 border-zinc-700" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Chapters Tab
function ChaptersTab({ token }) {
  const [chapters, setChapters] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [formData, setFormData] = useState({ name: '', city: '', state: 'Tripura', isMain: false })

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    const res = await fetch('/api/chapters')
    setChapters(await res.json())
  }

  const openAdd = () => {
    setEditingChapter(null)
    setFormData({ name: '', city: '', state: 'Tripura', isMain: false })
    setShowDialog(true)
  }

  const openEdit = (chapter) => {
    setEditingChapter(chapter)
    setFormData({ name: chapter.name, city: chapter.city, state: chapter.state, isMain: chapter.isMain })
    setShowDialog(true)
  }

  const handleSave = async () => {
    const url = editingChapter ? `/api/admin/chapters/${editingChapter.id}` : '/api/admin/chapters'
    const method = editingChapter ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    toast.success(editingChapter ? 'Chapter updated' : 'Chapter created')
    setShowDialog(false)
    fetchChapters()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this chapter?')) return
    await fetch(`/api/admin/chapters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Chapter deleted')
    fetchChapters()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>Chapters</h1>
          <p className="text-gray-400">Manage club chapters and locations</p>
        </div>
        <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700">
          <Plus size={16} className="mr-2" /> Add Chapter
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{chapter.name}</h3>
                    {chapter.isMain && <Badge className="bg-red-600">Main</Badge>}
                  </div>
                  <p className="text-gray-400">{chapter.city}, {chapter.state}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(chapter)}><Edit size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(chapter.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>{editingChapter ? 'Edit' : 'Add'} Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Chapter Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-zinc-800 border-zinc-700" placeholder="Agartala" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="bg-zinc-800 border-zinc-700" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isMain} onCheckedChange={(v) => setFormData({...formData, isMain: v})} />
              <Label>Main Chapter</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Main Admin Page
export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('iltmc_token')
    const savedUser = localStorage.getItem('iltmc_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('iltmc_token')
    localStorage.removeItem('iltmc_user')
    setUser(null)
    setToken(null)
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
    return <LoginForm onLogin={handleLogin} />
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab token={token} />
      case 'content': return <ContentTab token={token} />
      case 'members': return <MembersTab token={token} />
      case 'ranks': return <RanksPositionsTab token={token} />
      case 'chapters': return <ChaptersTab token={token} />
      case 'rides': return <RidesTab token={token} />
      case 'attendance': return <AttendanceTab token={token} />
      case 'events': return <EventsTab token={token} />
      case 'applications': return <ApplicationsTab token={token} />
      case 'contacts': return <ContactsTab token={token} />
      case 'seo': return <SEOTab token={token} />
      default: return <DashboardTab token={token} />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-8`}>
        {renderTab()}
      </main>
    </div>
  )
}
