import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Briefcase, MapPin, Mail, Calendar, Target } from 'lucide-react'

export function ProfileHeader({ profile }) {
  const getInitials = (email) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitials(profile.email)}
            </div>
          </div>

          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.email?.split('@')[0] || 'Votre Profil'}
                </h1>
                <p className="text-gray-600 mb-4">
                  Profil professionnel construit par l'IA
                </p>
              </div>

              <div className="flex gap-2">
                {profile.has_cv && (
                  <Badge variant="success">✓ CV</Badge>
                )}
                {profile.has_github && (
                  <Badge variant="info">✓ GitHub</Badge>
                )}
                {profile.total_memories > 0 && (
                  <Badge variant="secondary">✓ {profile.total_memories} préférences</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>ID: {profile.user_id?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
