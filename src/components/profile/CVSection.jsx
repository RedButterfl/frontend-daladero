import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Database, File, Clock } from 'lucide-react'

export function CVSection({ cvData }) {
  if (!cvData || !cvData.raw_analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV & Documents
          </CardTitle>
          <CardDescription>
            Vos documents et informations professionnelles (Module CV)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun CV uploadé</p>
            <p className="text-sm mt-2">
              Uploadez votre CV dans le module Files pour enrichir votre profil
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
          <FileText className="h-5 w-5" />
          CV & Documents
        </CardTitle>
        <CardDescription>
          Vos documents et informations professionnelles (Module CV)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vector Store Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Vector Store
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <p className="font-mono text-xs mt-1 text-gray-900">
                    {cvData.vector_store_id?.slice(0, 20)}...
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="mt-1">
                    <Badge variant="success">Active</Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Analyse du CV */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <File className="h-4 w-4 text-purple-500" />
            Analyse du CV
          </h3>
          <div className="prose prose-sm max-w-none">
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {cvData.raw_analysis}
              </pre>
            </div>
          </div>
        </div>

        {/* Compétences détectées (si disponibles) */}
        {cvData.matched_skills && cvData.matched_skills.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Compétences Principales
              </h3>
              <div className="flex flex-wrap gap-2">
                {cvData.matched_skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill.skill}
                    {skill.level && ` - ${skill.level}`}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Expériences (si disponibles) */}
        {cvData.relevant_experiences && cvData.relevant_experiences.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Expériences Professionnelles
              </h3>
              <div className="space-y-4">
                {cvData.relevant_experiences.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500 mt-1">{exp.duration}</p>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.highlights.map((highlight, hidx) => (
                          <li key={hidx} className="text-sm text-gray-700">
                            • {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Projets (si disponibles) */}
        {cvData.relevant_projects && cvData.relevant_projects.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Projets Importants
              </h3>
              <div className="space-y-4">
                {cvData.relevant_projects.map((project, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, tidx) => (
                          <Badge key={tidx} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
