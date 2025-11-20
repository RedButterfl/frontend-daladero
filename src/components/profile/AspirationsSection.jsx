import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Target, Briefcase, DollarSign, MapPin, Star } from 'lucide-react'

export function AspirationsSection({ aspirations = [], preferences = [], salaryExpectations = [], locationPreferences = [], otherMemories = [] }) {
  const renderMemoryItem = (memory, icon) => {
    const Icon = icon
    return (
      <div key={memory.memory_id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex-shrink-0 mt-1">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{memory.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Importance: {memory.importance_score}/10
            </Badge>
            <Badge variant="outline" className="text-xs">
              Confiance: {(memory.confidence_score * 100).toFixed(0)}%
            </Badge>
            {memory.tags && memory.tags.length > 0 && (
              memory.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Source: {memory.source} • {new Date(memory.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    )
  }

  const hasData = aspirations.length > 0 || preferences.length > 0 || salaryExpectations.length > 0 || locationPreferences.length > 0

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Ce que vous recherchez
          </CardTitle>
          <CardDescription>
            Vos aspirations et préférences professionnelles · Étape 1
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucune information enregistrée</p>
            <p className="text-sm mt-2">
              Rendez-vous dans "Mes Aspirations" pour échanger avec l'IA
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Ce que vous recherchez
        </CardTitle>
        <CardDescription>
          Vos aspirations et préférences professionnelles · Étape 1
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aspirations de carrière */}
        {aspirations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Aspirations de Carrière
            </h3>
            <div className="space-y-3">
              {aspirations.map(asp => renderMemoryItem(asp, Target))}
            </div>
          </div>
        )}

        {aspirations.length > 0 && preferences.length > 0 && <Separator />}

        {/* Préférences de travail */}
        {preferences.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Préférences de Travail
            </h3>
            <div className="space-y-3">
              {preferences.map(pref => renderMemoryItem(pref, Briefcase))}
            </div>
          </div>
        )}

        {(aspirations.length > 0 || preferences.length > 0) && salaryExpectations.length > 0 && <Separator />}

        {/* Attentes salariales */}
        {salaryExpectations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Attentes Salariales
            </h3>
            <div className="space-y-3">
              {salaryExpectations.map(salary => renderMemoryItem(salary, DollarSign))}
            </div>
          </div>
        )}

        {(aspirations.length > 0 || preferences.length > 0 || salaryExpectations.length > 0) && locationPreferences.length > 0 && <Separator />}

        {/* Préférences de localisation */}
        {locationPreferences.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              Préférences de Localisation
            </h3>
            <div className="space-y-3">
              {locationPreferences.map(loc => renderMemoryItem(loc, MapPin))}
            </div>
          </div>
        )}

        {/* Autres mémoires */}
        {otherMemories.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Autres Informations
              </h3>
              <div className="space-y-3">
                {otherMemories.map(mem => renderMemoryItem(mem, Star))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
