'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, Bike, MapPin, Shield, Award, Calendar,
  TrendingUp, FileSpreadsheet, ArrowLeft, CheckCircle, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/LoadingSpinner'

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_9bab05d4-0d45-4f8d-a396-cf0659408542/artifacts/lv5k959m_Ilt%20logo.png'

export default function MemberProfilePage() {
  const params = useParams()
  const memberId = params?.id
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (memberId) {
      fetchMemberProfile()
    }
  }, [memberId])

  const fetchMemberProfile = async () => {
    try {
      const res = await fetch(`/api/members/${memberId}/profile`)
      if (res.ok) {
        setMember(await res.json())
      } else {
        setError('Member not found')
      }
    } catch (err) {
      setError('Failed to load profile')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner label="Loading profile..." fullHeight />
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
          <CardContent className="p-8 text-center">
            <User className="mx-auto text-gray-500 mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Member Not Found</h2>
            <p className="text-gray-400 mb-4">{error || 'This profile does not exist.'}</p>
            <a href="/">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-2" /> Back to Homepage
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ILTMC" className="w-10 h-10" />
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: 'Oswald, sans-serif' }}>ILTMC</p>
              <p className="text-xs text-red-500">Member Profile</p>
            </div>
          </a>
          <a href="/">
            <Button variant="outline" size="sm" className="border-zinc-700">
              <ArrowLeft size={14} className="mr-2" /> Back
            </Button>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-5xl mb-4 overflow-hidden">
            {member.photoUrl || member.profilePicture ? (
              <img src={member.photoUrl || member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              member.name?.charAt(0) || '?'
            )}
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
            {member.name}
          </h1>
          {member.roadName && (
            <p className="text-xl text-red-500">&quot;{member.roadName}&quot;</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge className={member.memberType === 'member' ? 'bg-green-600' : 'bg-orange-600'}>
              {member.memberType === 'member' ? '✓ Permanent Member' : '⏳ Prospect'}
            </Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto text-green-500 mb-2" size={28} />
              <p className="text-2xl font-bold">{member.totalKilometers || 0}</p>
              <p className="text-sm text-gray-400">Total KM</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <MapPin className="mx-auto text-blue-500 mb-2" size={28} />
              <p className="text-2xl font-bold">{member.ridesCount || 0}</p>
              <p className="text-sm text-gray-400">Rides</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Award className="mx-auto text-yellow-500 mb-2" size={28} />
              <p className="text-xl font-bold">{member.rank || 'N/A'}</p>
              <p className="text-sm text-gray-400">Rank</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <Shield className="mx-auto text-red-500 mb-2" size={28} />
              <p className="text-xl font-bold">{member.position || 'Member'}</p>
              <p className="text-sm text-gray-400">Position</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {member.bike && (
                <div className="flex items-center gap-3">
                  <Bike className="text-red-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-500">Bike</p>
                    <p className="font-medium">{member.bike}</p>
                  </div>
                </div>
              )}
              {member.chapter && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-red-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-500">Chapter</p>
                    <p className="font-medium">{member.chapter}</p>
                  </div>
                </div>
              )}
              {member.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="text-red-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{new Date(member.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rank Points Uploads */}
        {member.rankUploads && member.rankUploads.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="text-green-500" size={20} />
                Rank Points Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {member.rankUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="text-green-500" size={20} />
                      <div>
                        <p className="font-medium">{upload.fileName}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                          {upload.description && ` • ${upload.description}`}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">
                      <CheckCircle size={12} className="mr-1" /> Approved
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rank Points Live Sheet */}
        {member.rankPointsLink && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="text-blue-500" size={20} />
                Live Rank Points Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <a 
                  href={member.rankPointsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open Full Sheet in New Tab
                </a>
                
                {/* Mobile-Friendly Iframe */}
                <div className="w-full h-[600px] border border-zinc-700 rounded-lg overflow-hidden bg-white">
                  <iframe
                    src={member.rankPointsLink}
                    className="w-full h-full"
                    title="Rank Points Sheet"
                    style={{ border: 'none' }}
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-500">
                  💡 Tip: For best viewing on mobile, tap the link above to open the sheet in a new tab
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-6 text-center">
        <a href="/" className="text-gray-400 hover:text-white">
          ← Back to ILTMC Website
        </a>
      </footer>
    </div>
  )
}
