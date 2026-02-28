'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, ChevronDown, Users, MapPin, Calendar, Trophy, 
  Bike, Shield, Star, ArrowRight, Mail, Phone, Send,
  Instagram, Facebook, Youtube, Clock, Compass
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_9bab05d4-0d45-4f8d-a396-cf0659408542/artifacts/lv5k959m_Ilt%20logo.png'
const HERO_BG = 'https://images.unsplash.com/photo-1542227844-5e56c7c2687d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcm9hZHxlbnwwfHx8YmxhY2t8MTc3MjI3NzA4MXww&ixlib=rb-4.1.0&q=85'
const ABOUT_IMG = 'https://images.unsplash.com/photo-1597738620274-dfcefdcde990?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxtb3RvcmN5Y2xlJTIwY2x1YnxlbnwwfHx8YmxhY2t8MTc3MjI3NzA3M3ww&ixlib=rb-4.1.0&q=85'
const RIDES_IMG = 'https://images.unsplash.com/photo-1592766845554-f2b181f8ed7c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxtb3RvcmN5Y2xlJTIwcm9hZHxlbnwwfHx8YmxhY2t8MTc3MjI3NzA4MXww&ixlib=rb-4.1.0&q=85'
const GALLERY_IMG = 'https://images.unsplash.com/photo-1582358680471-143e93a1e234?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwY2x1YnxlbnwwfHx8YmxhY2t8MTc3MjI3NzA3M3ww&ixlib=rb-4.1.0&q=85'

// Navbar Component
function Navbar({ content }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Members', href: '#members' },
    { label: 'Rides', href: '#rides' },
    { label: 'Events', href: '#events' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Join Us', href: '#join' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect shadow-lg shadow-red-500/10' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a href="#home" className="flex items-center gap-3">
            <img src={content?.branding?.logo || LOGO_URL} alt="ILTMC" className="h-14 w-14 object-contain" />
            <div className="hidden sm:block">
              <p className="font-bold text-lg tracking-wider" style={{ fontFamily: 'Oswald, sans-serif' }}>{content?.branding?.clubName || 'ILTMC'}</p>
              <p className="text-xs text-red-500">{content?.branding?.tagline || 'Est. 2013'}</p>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-red-500 transition-colors"
                style={{ fontFamily: 'Oswald, sans-serif' }}
              >
                {item.label}
              </a>
            ))}
            <a href="/admin">
              <Button variant="outline" className="ml-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                Admin
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-effect border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-3 text-gray-300 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a href="/admin" className="block mt-2">
                <Button variant="outline" className="w-full border-red-500 text-red-500">Admin</Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// Hero Section
function HeroSection({ stats, content }) {
  const heroContent = content?.hero || {}
  const statsContent = content?.stats || {}
  const branding = content?.branding || {}

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroContent.backgroundImage || HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-transparent to-red-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src={branding.logo || LOGO_URL} alt="ILTMC Logo" className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-8 drop-shadow-2xl" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-wider"
          style={{ fontFamily: 'Oswald, sans-serif' }}
        >
          {heroContent.title || 'INTREPIDUS LEONES'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-red-500 font-semibold mb-4"
          style={{ fontFamily: 'Oswald, sans-serif' }}
        >
          {heroContent.subtitle || 'TRIPURA MOTORCYCLE CLUB'}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-gray-400 text-lg mb-8"
        >
          {heroContent.tagline || 'Brotherhood • Freedom • Respect | Est. 2013'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a href={heroContent.ctaLink || '#join'}>
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg glow-red">
              {heroContent.ctaText || 'JOIN THE PRIDE'} <ArrowRight className="ml-2" />
            </Button>
          </a>
          <a href={heroContent.secondaryCtaLink || '#about'}>
            <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 px-8 py-6 text-lg">
              {heroContent.secondaryCtaText || 'LEARN MORE'}
            </Button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Users, value: statsContent.members?.value || stats?.totalMembers || '50', label: statsContent.members?.label || 'Members' },
            { icon: MapPin, value: statsContent.rides?.value || stats?.totalRides || '200', label: statsContent.rides?.label || 'Rides Completed' },
            { icon: Compass, value: statsContent.distance?.value || `${(stats?.totalDistance || 50000).toLocaleString()}+`, label: statsContent.distance?.label || 'KM Covered' },
            { icon: Calendar, value: statsContent.years?.value || stats?.yearsActive || '12', label: statsContent.years?.label || 'Years Strong' },
          ].map((stat, index) => (
            <div key={index} className="glass-effect rounded-xl p-4 md:p-6">
              <stat.icon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-3 bg-red-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// About Section
function AboutSection({ content }) {
  const aboutContent = content?.about || {}
  const timelineContent = content?.timeline || []
  
  const timeline = timelineContent.length > 0 ? timelineContent : [
    { year: '2013', title: 'Foundation', description: 'ILTMC was founded by passionate riders in Tripura' },
    { year: '2015', title: 'First State Ride', description: 'Organized first statewide motorcycle rally' },
    { year: '2018', title: 'National Recognition', description: 'Joined the national motorcycle club federation' },
    { year: '2020', title: 'Community Service', description: 'Started charity rides and community programs' },
    { year: '2023', title: '10 Year Anniversary', description: 'Celebrated a decade of brotherhood and riding' },
  ]

  const values = aboutContent.values?.filter(v => v) || ['Brotherhood', 'Freedom', 'Respect']

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-black to-zinc-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">{aboutContent.badge || 'OUR STORY'}</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {aboutContent.title ? aboutContent.title.split(' ').map((word, i) => 
              i === 1 ? <span key={i} className="text-red-500">{word} </span> : word + ' '
            ) : <>ABOUT <span className="text-red-500">ILTMC</span></>}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {aboutContent.subtitle || 'A brotherhood forged on the open road, united by the love of motorcycles and the spirit of adventure.'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-red-500/20 blur-3xl rounded-full" />
            <img
              src={aboutContent.image || ABOUT_IMG}
              alt="ILTMC Members"
              className="relative rounded-2xl shadow-2xl shadow-red-500/20"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 text-red-500" style={{ fontFamily: 'Oswald, sans-serif' }}>
              {aboutContent.sectionTitle || 'INTREPIDUS LEONES - The Fearless Lions'}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {aboutContent.description1 || 'Founded in 2013 in Agartala, Tripura, ILTMC (Intrepidus Leones Tripura Motorcycle Club) represents a brotherhood of passionate riders who share an unbreakable bond through their love for motorcycles and the open road.'}
            </p>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {aboutContent.description2 || 'Our name, derived from Latin, means "Fearless Lions" - embodying the courage, strength, and pride that defines every member of our club. We ride together, stand together, and grow together.'}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Shield, label: values[0] || 'Brotherhood' },
                { icon: Bike, label: values[1] || 'Freedom' },
                { icon: Star, label: values[2] || 'Respect' },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 glass-effect rounded-xl">
                  <item.icon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-16 h-8 bg-red-600 rounded flex items-center justify-center text-sm font-bold shrink-0">
                    {item.year}
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.description || item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Members Section
function MembersSection({ members, ranks, positions }) {
  const ranksArray = Array.isArray(ranks) ? ranks : []
  const positionsArray = Array.isArray(positions) ? positions : []
  
  const getRankBadge = (rankName) => {
    const rank = ranksArray.find(r => r.name === rankName)
    return rank?.badge || '🔰'
  }

  const getPositionBadge = (positionName) => {
    const position = positionsArray.find(p => p.name === positionName)
    return position?.badge || '⚔️'
  }

  const displayMembers = Array.isArray(members) && members.length > 0 ? members : [
    { id: '1', name: 'Rahul Deb', roadName: 'Thunder', rank: 'Gunner', position: 'President', chapter: 'Agartala', bike: 'Royal Enfield Classic 350', status: 'active' },
    { id: '2', name: 'Amit Sarkar', roadName: 'Storm', rank: 'Shotgun', position: 'Vice President', chapter: 'Agartala', bike: 'Harley Davidson Iron 883', status: 'active' },
    { id: '3', name: 'Bikash Das', roadName: 'Rider', rank: 'Boulder', position: 'Road Captain', chapter: 'Agartala', bike: 'Royal Enfield Himalayan', status: 'active' },
    { id: '4', name: 'Dipak Roy', roadName: 'Ghost', rank: 'Iron Clad', position: 'Member', chapter: 'Dharmanagar', bike: 'KTM Duke 390', status: 'active' },
    { id: '5', name: 'Suman Debnath', roadName: 'Blaze', rank: 'Iron', position: 'Member', chapter: 'Agartala', bike: 'Bajaj Dominar 400', status: 'active' },
    { id: '6', name: 'Rajesh Nath', roadName: 'Phoenix', rank: 'Rubble', position: 'Member', chapter: 'Udaipur', bike: 'TVS Apache RR310', status: 'active' },
  ]

  return (
    <section id="members" className="py-24 bg-gradient-to-b from-zinc-950 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">THE PRIDE</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            OUR <span className="text-red-500">MEMBERS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Meet the fearless lions who make up our brotherhood
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-red-500/50 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl shrink-0">
                      {getPositionBadge(member.position)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {member.name}
                      </p>
                      <p className="text-red-500 font-medium">&quot;{member.roadName}&quot;</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge className={member.status === 'active' ? 'bg-green-600' : member.status === 'prospect' ? 'bg-yellow-600' : 'bg-gray-600'}>
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                        {getRankBadge(member.rank)} {member.rank || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs">
                        {getPositionBadge(member.position)} {member.position || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <MapPin size={14} className="text-red-500" />
                      {member.chapter} Chapter
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Bike size={14} className="text-red-500" />
                      {member.bike}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Rides Section
function RidesSection({ rides }) {
  const displayRides = rides?.length > 0 ? rides : [
    { id: '1', title: 'Northeast Expedition', description: 'Epic ride through the seven sisters', date: new Date('2025-07-15'), distance: 850, difficulty: 'Hard', startPoint: 'Agartala', endPoint: 'Shillong', captain: 'Thunder' },
    { id: '2', title: 'Tripura Heritage Ride', description: 'Exploring ancient temples and palaces', date: new Date('2025-06-20'), distance: 280, difficulty: 'Medium', startPoint: 'Agartala', endPoint: 'Udaipur', captain: 'Storm' },
    { id: '3', title: 'Dawn Patrol', description: 'Weekly sunrise ride', date: new Date('2025-06-08'), distance: 120, difficulty: 'Easy', startPoint: 'Agartala', endPoint: 'Ambassa', captain: 'Rider' },
  ]

  return (
    <section id="rides" className="py-24 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img src={RIDES_IMG} alt="" className="w-full h-full object-cover" />
      </div>
      
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">HIT THE ROAD</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            UPCOMING <span className="text-red-500">RIDES</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join us on our next adventure through the scenic roads of Northeast India
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRides.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900/80 border-zinc-800 hover:border-red-500/50 transition-all duration-300 h-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={
                      ride.difficulty === 'Hard' ? 'bg-red-600' : 
                      ride.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }>
                      {ride.difficulty}
                    </Badge>
                    <span className="text-red-500 font-bold">{ride.distance} KM</span>
                  </div>
                  <CardTitle className="text-xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {ride.title}
                  </CardTitle>
                  <CardDescription>{ride.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-red-500" />
                      <span>{new Date(ride.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-red-500" />
                      <span>{ride.startPoint} → {ride.endPoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-red-500" />
                      <span>Road Captain: {ride.captain}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                    RSVP Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Events Section
function EventsSection({ events }) {
  const displayEvents = events?.length > 0 ? events : [
    { id: '1', title: 'ILTMC Anniversary Rally', description: 'Celebrating 12 years of brotherhood', date: new Date('2025-08-15'), venue: 'Agartala Central', type: 'Rally' },
    { id: '2', title: 'Bike Show & Meet', description: 'Display your machine and meet fellow riders', date: new Date('2025-07-01'), venue: 'City Convention Center', type: 'Show' },
    { id: '3', title: 'Charity Ride for Education', description: 'Riding for a cause - support underprivileged children', date: new Date('2025-06-25'), venue: 'Agartala to Udaipur', type: 'Charity' },
  ]

  return (
    <section id="events" className="py-24 bg-gradient-to-b from-black to-zinc-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">MARK YOUR CALENDAR</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            UPCOMING <span className="text-red-500">EVENTS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join us for rallies, meets, and community events
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {displayEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-red-500 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-red-600">{event.type}</Badge>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-red-500" />
                      <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-500" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    Register
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Gallery Section
function GallerySection() {
  const galleryImages = [HERO_BG, ABOUT_IMG, RIDES_IMG, GALLERY_IMG, HERO_BG, ABOUT_IMG]

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-zinc-950 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">MOMENTS</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <span className="text-red-500">GALLERY</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Capturing memories from our rides and events
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <img
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium">ILTMC Ride {index + 1}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Join Section
function JoinSection() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', bike: '', experience: '', reason: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Application submitted successfully! We will contact you soon.')
        setFormData({ name: '', email: '', phone: '', bike: '', experience: '', reason: '' })
      } else {
        toast.error('Failed to submit application')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <section id="join" className="py-24 bg-gradient-to-b from-black via-red-950/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">BECOME A LION</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            JOIN <span className="text-red-500">ILTMC</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ready to be part of the brotherhood? Fill out the application below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Full Name *</label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Email *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Phone *</label>
                    <Input
                      placeholder="+91 xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Your Bike *</label>
                    <Input
                      placeholder="e.g., Royal Enfield Classic 350"
                      value={formData.bike}
                      onChange={(e) => setFormData({...formData, bike: e.target.value})}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Riding Experience *</label>
                  <Input
                    placeholder="e.g., 5 years of riding"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    required
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Why do you want to join ILTMC? *</label>
                  <Textarea
                    placeholder="Tell us about yourself and your passion for riding..."
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    required
                    rows={4}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg" disabled={loading}>
                  {loading ? 'Submitting...' : 'SUBMIT APPLICATION'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

// Contact Section
function ContactSection({ content }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const contactInfo = content?.contact || {}
  const socialLinks = content?.social || {}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Message sent successfully!')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-black to-zinc-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-red-500 text-red-500">{contactInfo.badge || 'GET IN TOUCH'}</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {contactInfo.title ? contactInfo.title.split(' ').map((word, i) => 
              i === 1 ? <span key={i} className="text-red-500">{word} </span> : word + ' '
            ) : <>CONTACT <span className="text-red-500">US</span></>}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-6">
                <MapPin className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>Location</h3>
                <p className="text-gray-400">{contactInfo.address || 'Agartala, Tripura, India'}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <Mail className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>Email</h3>
                <p className="text-gray-400">{contactInfo.email || 'contact@iltmc.com'}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <Phone className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>WhatsApp</h3>
                <p className="text-gray-400">{contactInfo.whatsapp || contactInfo.phone || '+91 XXXXXXXXXX'}</p>
              </div>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, link: socialLinks.facebook },
                  { icon: Instagram, link: socialLinks.instagram },
                  { icon: Youtube, link: socialLinks.youtube }
                ].map((item, i) => (
                  <a key={i} href={item.link || '#'} target={item.link ? '_blank' : '_self'} rel="noopener noreferrer" className="w-12 h-12 glass-effect rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors">
                    <item.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={5}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? 'Sending...' : 'SEND MESSAGE'} <Send className="ml-2" size={16} />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer({ content }) {
  const [email, setEmail] = useState('')
  const branding = content?.branding || {}
  const footerContent = content?.footer || {}
  const socialLinks = content?.social || {}

  const handleNewsletter = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        toast.success('Subscribed to newsletter!')
        setEmail('')
      }
    } catch (error) {
      toast.error('Failed to subscribe')
    }
  }

  return (
    <footer className="bg-black border-t border-zinc-800 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={branding.logo || LOGO_URL} alt="ILTMC" className="h-16 w-16" />
              <div>
                <p className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>{branding.clubFullName?.split(' ').slice(0, 2).join(' ') || 'INTREPIDUS LEONES'}</p>
                <p className="text-red-500 text-sm">{branding.clubFullName?.split(' ').slice(2).join(' ') || 'Tripura Motorcycle Club'}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              {footerContent.description || 'Brotherhood forged on the open road since 2013. United by the love of motorcycles and the spirit of adventure.'}
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                type="email"
                placeholder="Subscribe to newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                <Mail size={16} />
              </Button>
            </form>
          </div>
          
          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>QUICK LINKS</h4>
            <ul className="space-y-2 text-gray-400">
              {['Home', 'About', 'Members', 'Rides', 'Events', 'Contact'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="hover:text-red-500 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>CHAPTERS</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Agartala (Main)</li>
              <li>Dharmanagar</li>
              <li>Udaipur</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            {(footerContent.copyright || '© {year} ILTMC - Intrepidus Leones Tripura Motorcycle Club. All rights reserved.').replace('{year}', new Date().getFullYear())}
          </p>
          <div className="flex gap-4">
            {[
              { icon: Facebook, link: socialLinks.facebook },
              { icon: Instagram, link: socialLinks.instagram },
              { icon: Youtube, link: socialLinks.youtube }
            ].map((item, i) => (
              <a key={i} href={item.link || '#'} target={item.link ? '_blank' : '_self'} rel="noopener noreferrer" className="text-gray-500 hover:text-red-500 transition-colors">
                <item.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main App
export default function App() {
  const [stats, setStats] = useState(null)
  const [members, setMembers] = useState([])
  const [rides, setRides] = useState([])
  const [events, setEvents] = useState([])
  const [ranks, setRanks] = useState([])
  const [positions, setPositions] = useState([])
  const [content, setContent] = useState(null)

  useEffect(() => {
    // Fetch public data
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(console.error)
    fetch('/api/members/public').then(r => r.json()).then(setMembers).catch(console.error)
    fetch('/api/rides/upcoming').then(r => r.json()).then(setRides).catch(console.error)
    fetch('/api/events/upcoming').then(r => r.json()).then(setEvents).catch(console.error)
    fetch('/api/ranks').then(r => r.json()).then(setRanks).catch(console.error)
    fetch('/api/positions').then(r => r.json()).then(setPositions).catch(console.error)
    fetch('/api/content').then(r => r.json()).then(setContent).catch(console.error)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar content={content} />
      <HeroSection stats={stats} content={content} />
      <AboutSection content={content} />
      <MembersSection members={members} ranks={ranks} positions={positions} />
      <RidesSection rides={rides} />
      <EventsSection events={events} />
      <GallerySection />
      <JoinSection />
      <ContactSection content={content} />
      <Footer content={content} />
    </main>
  )
}
