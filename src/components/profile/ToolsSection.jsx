import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Github, GitBranch, Star, GitFork, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'

export function ToolsSection({ toolsData }) {
  const hasGithub = toolsData?.github?.connected

  if (!hasGithub) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Outils Externes
          </CardTitle>
          <CardDescription>
            Vos intégrations GitHub/GitLab et projets importés (Module Outils)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Github className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun outil externe connecté</p>
            <p className="text-sm mt-2">
              Connectez votre compte GitHub pour enrichir votre profil
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const github = toolsData.github
  const indexedRepos = github.indexed_repos?.indexed_repos || []
  const reposCount = github.repos_count || 0

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Indexé</Badge>
      case 'indexing':
        return <Badge variant="warning" className="text-xs"><Clock className="h-3 w-3 mr-1" />En cours</Badge>
      case 'failed':
        return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Échec</Badge>
      case 'pending':
        return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Outils Externes
        </CardTitle>
        <CardDescription>
          Vos intégrations GitHub/GitLab et projets importés (Module Outils)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GitHub Status */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Github className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  GitHub Connecté
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  @{github.github_username}
                </p>
              </div>
            </div>
            <Badge variant="success">Actif</Badge>
          </div>
          
          {reposCount > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{reposCount}</p>
                  <p className="text-xs text-gray-600 mt-1">Repositories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{indexedRepos.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Indexés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {indexedRepos.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Complétés</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Repositories indexés */}
        {indexedRepos.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-blue-500" />
                Repositories Indexés
              </h3>
              <div className="space-y-3">
                {indexedRepos.map((repo) => (
                  <div key={repo.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {repo.repo_full_name}
                          </h4>
                          {getStatusBadge(repo.status)}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>{repo.files_indexed} fichiers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            <span>{formatBytes(repo.total_bytes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {repo.indexed_at 
                                ? new Date(repo.indexed_at).toLocaleDateString('fr-FR')
                                : 'Non indexé'}
                            </span>
                          </div>
                        </div>

                        {repo.error_message && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                            <strong>Erreur:</strong> {repo.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Statistiques techniques */}
        {indexedRepos.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Statistiques Techniques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total de fichiers indexés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {indexedRepos.reduce((sum, repo) => sum + (repo.files_indexed || 0), 0)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Taille totale indexée</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatBytes(indexedRepos.reduce((sum, repo) => sum + (repo.total_bytes || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Informations de connexion */}
        <Separator />
        <div className="text-xs text-gray-500">
          <p>
            <strong>Connecté le:</strong> {new Date(github.connected_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="mt-1">
            <strong>GitHub User ID:</strong> {github.github_user_id}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function Database({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  )
}
