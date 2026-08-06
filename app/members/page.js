'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Bike, MapPin, Shield, Award, Search, Filter, ArrowLeft, ExternalLink, Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_9bab05d4-0d45-4f8d-a396-cf0659408542/artifacts/lv5k959m_Ilt%20logo.png'

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [onlineStatus, setOnlineStatus] = useState({})
  const [ranks, setRanks] = useState([])
  const [positions, setPositions] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterChapter, setFilterChapter] = useState('all')
  const [filterRank, setFilterRank] = useState('all')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchOnlineStatus, 10000) // Update online status every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [membersRes, ranksRes, positionsRes, chaptersRes] = await Promise.all([
        fetch('/api/members/public'),
        fetch('/api/ranks'),
        fetch('/api/positions'),
        fetch('/api/chapters')
      ])
      
      const membersData = await membersRes.json()
      // Only show approved members
      setMembers(membersData.filter(m => m.approvalStatus === 'approved' || !m.approvalStatus))
      setRanks(await ranksRes.json())
      setPositions(await positionsRes.json())
      setChapters(await chaptersRes.json())
      
      await fetchOnlineStatus()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const fetchOnlineStatus = async () => {
    try {
      const res = await fetch('/api/members/online')
      if (res.ok) {
        const onlineMembers = await res.json()
        const statusMap = {}
        onlineMembers.forEach(m => {
          statusMap[m.id] = {
            isOnline: m.isOnline,
            lastSeen: m.lastSeen
          }
        })
        setOnlineStatus(statusMap)
      }
    } catch (error) {
      console.error('Failed to fetch online status:', error)
    }
  }

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Never seen'
    const diff = Date.now() - new Date(lastSeen).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.roadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.bike?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChapter = filterChapter === 'all' || member.chapter === filterChapter
    const matchesRank = filterRank === 'all' || member.rank === filterRank
    return matchesSearch && matchesChapter && matchesRank
  })

  // Group by position for leadership display
  const leaders = filteredMembers.filter(m => 
    ['President', 'Vice President', 'Secretary', 'Treasurer', 'Road Captain'].includes(m.position)
  )
  const regularMembers = filteredMembers.filter(m => 
    !['President', 'Vice President', 'Secretary', 'Treasurer', 'Road Captain'].includes(m.position)
  )

  const getRankBadge = (rankName) => {
    const rank = ranks.find(r => r.name === rankName)
    return rank?.badge || '⚔️'
  }

  const getPositionBadge = (positionName) => {
    const position = positions.find(p => p.name === positionName)
    return position?.badge || ''
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ILTMC" className="w-12 h-12" />
            <div>
              <p className="font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                INTREPIDUS LEONES
              </p>
              <p className="text-xs text-red-500">TRIPURA MOTORCYCLE CLUB</p>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a>
            <a href="/#about" className="text-gray-400 hover:text-white transition-colors">About</a>
            <a href="/members" className="text-red-500 font-medium">Members</a>
            <a href="/#rides" className="text-gray-400 hover:text-white transition-colors">Rides</a>
            <a href="/#events" className="text-gray-400 hover:text-white transition-colors">Events</a>
            <a href="/#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            <a href="/member">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">Member Login</Button>
            </a>
          </nav>
          <a href="/" className="md:hidden">
            <Button variant="outline" size="sm" className="border-zinc-700">
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-red-950/30 to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="outline" className="mb-4 border-red-500 text-red-500">THE PRIDE</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
              OUR <span className="text-red-500">MEMBERS</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Meet the riders who make up the Intrepidus Leones family. 
              United by passion, bonded by brotherhood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-zinc-950/50 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Search members by name, road name, or bike..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 w-full"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={filterChapter} onValueChange={setFilterChapter}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full md:w-40">
                  <SelectValue placeholder="Chapter" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Chapters</SelectItem>
                  {chapters.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRank} onValueChange={setFilterRank}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full md:w-40">
                  <SelectValue placeholder="Rank" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="all">All Ranks</SelectItem>
                  {ranks.map(r => (
                    <SelectItem key={r.id} value={r.name}>{r.badge} {r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>
      </section>

      {/* Leadership */}
      {leaders.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-zinc-950 to-black">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
              <Shield className="inline text-red-500 mr-2" size={28} />
              CLUB <span className="text-red-500">LEADERSHIP</span>
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {leaders.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a href={`/profile/${member.id}`}>
                    <Card className="bg-gradient-to-br from-red-950/50 to-zinc-900 border-red-900/50 hover:border-red-500 transition-all duration-300 overflow-hidden group">
                      <CardContent className="p-6 text-center relative">
                        {/* Online Status Badge */}
                        {onlineStatus[member.id]?.isOnline && (
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              <Circle size={6} fill="white" className="animate-pulse" />
                              Online
                            </div>
                          </div>
                        )}
                        
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                          {getPositionBadge(member.position) || member.name?.charAt(0)}
                        </div>
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        {member.roadName && (
                          <p className="text-red-500 text-sm">&quot;{member.roadName}&quot;</p>
                        )}
                        <Badge className="mt-2 bg-red-600">{member.position}</Badge>
                        <div className="mt-3 text-sm text-gray-400">
                          <p>{getRankBadge(member.rank)} {member.rank}</p>
                        </div>
                        {!onlineStatus[member.id]?.isOnline && onlineStatus[member.id]?.lastSeen && (
                          <p className="text-xs text-gray-500 mt-2">
                            {getLastSeenText(onlineStatus[member.id].lastSeen)}
                          </p>
                        )}
                        <ExternalLink className="mx-auto mt-3 text-gray-600 group-hover:text-red-500 transition-colors" size={16} />
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Members */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <User className="inline text-red-500 mr-2" size={28} />
            ALL <span className="text-red-500">MEMBERS</span>
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading members...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {(leaders.length > 0 ? regularMembers : filteredMembers).map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <a href={`/profile/${member.id}`}>
                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-500/50 transition-all duration-300 overflow-hidden group h-full">
                      <CardContent className="p-4 text-center relative">
                        {/* Online Status Badge */}
                        {onlineStatus[member.id]?.isOnline && (
                          <div className="absolute top-2 right-2">
                            <Circle size={8} fill="#22c55e" className="text-green-500" />
                          </div>
                        )}
                        
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:from-red-700 group-hover:to-red-900 transition-all">
                          {getRankBadge(member.rank) || member.name?.charAt(0)}
                        </div>
                        <h3 className="font-bold truncate">{member.name}</h3>
                        {member.roadName && (
                          <p className="text-red-500 text-sm truncate">&quot;{member.roadName}&quot;</p>
                        )}
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
                            {member.rank || 'Member'}
                          </Badge>
                          {member.memberType === 'member' ? (
                            <Badge className="text-xs bg-green-600">✓</Badge>
                          ) : (
                            <Badge className="text-xs bg-orange-600">P</Badge>
                          )}
                        </div>
                        {member.bike && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1 truncate">
                            <Bike size={12} /> {member.bike}
                          </p>
                        )}
                        {member.chapter && (
                          <p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                            <MapPin size={10} /> {member.chapter}
                          </p>
                        )}
                        {!onlineStatus[member.id]?.isOnline && onlineStatus[member.id]?.lastSeen && (
                          <p className="text-xs text-gray-600 mt-1">
                            {getLastSeenText(onlineStatus[member.id].lastSeen)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
              {filteredMembers.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No members found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-gradient-to-t from-red-950/30 to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            WANT TO <span className="text-red-500">JOIN US?</span>
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Become part of the Intrepidus Leones brotherhood. 
            Ride with passion, live with pride.
          </p>
          <a href="/member">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 px-8">
              JOIN THE PRIDE
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <img src={LOGO_URL} alt="ILTMC" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-sm">
            © {new Date().getFullYear()} Intrepidus Leones Tripura Motorcycle Club. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="/" className="hover:text-white">Home</a>
            <a href="/#about" className="hover:text-white">About</a>
            <a href="/#contact" className="hover:text-white">Contact</a>
            <a href="/admin" className="hover:text-white">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
