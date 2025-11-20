import { useState, useEffect } from 'react'
import { 
  Github, 
  ExternalLink, 
  Star, 
  GitBranch, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Download,
  Eye
} from 'lucide-react'
import { githubService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { t } from 'i18next'

export default function GitHubIntegration() {
  const [githubStatus, setGithubStatus] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [indexedRepos, setIndexedRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [indexingRepo, setIndexingRepo] = useState(null)

  useEffect(() => {
    loadGitHubData()
  }, [])

  const loadGitHubData = async () => {
    try {
      setLoading(true)
      
      // Vérifier le statut GitHub
      try {
        const status = await githubService.getStatus()
        setGithubStatus(status)
        
        // Si connecté, charger les repos
        if (status) {
          await Promise.all([
            loadRepositories(),
            loadIndexedRepositories()
          ])
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setGithubStatus(null) // Pas connecté
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement GitHub:', error)
      toast.error('Erreur lors du chargement des données GitHub')
    } finally {
      setLoading(false)
    }
  }

  const loadRepositories = async () => {
    try {
      setLoadingRepos(true)
      const response = await githubService.getRepos(1, 50)
      setRepositories(response.repos || [])
    } catch (error) {
      console.error('Erreur lors du chargement des repos:', error)
      if (error.response?.status === 401) {
        toast.error('Token GitHub expiré. Veuillez reconnecter votre compte.')
        setGithubStatus(null)
      }
    } finally {
      setLoadingRepos(false)
    }
  }

  const loadIndexedRepositories = async () => {
    try {
      const response = await githubService.getIndexedRepos()
      setIndexedRepos(response.indexed_repos || [])
    } catch (error) {
      console.error('Erreur lors du chargement des repos indexés:', error)
    }
  }

  const connectGitHub = async () => {
    try {
      const response = await githubService.connect()
      
      if (response.authorization_url) {
        // Redirection vers GitHub OAuth
        window.location.href = response.authorization_url
      }
    } catch (error) {
      console.error('Erreur lors de la connexion GitHub:', error)
      toast.error('Erreur lors de la connexion à GitHub')
    }
  }

  const disconnectGitHub = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter GitHub ?')) {
      return
    }

    try {
      await githubService.disconnect()
      setGithubStatus(null)
      setRepositories([])
      setIndexedRepos([])
      toast.success('GitHub déconnecté avec succès')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      toast.error('Erreur lors de la déconnexion de GitHub')
    }
  }

  const indexRepository = async (repo) => {
    try {
      setIndexingRepo(repo.full_name)
      
      const response = await githubService.indexRepo(repo.owner, repo.name, {
        filePatterns: ['README.md', '*.md', '*.py', '*.js', '*.ts'],
        maxFileSizeKb: 500
      })

      toast.success(`Indexation de ${repo.name} lancée !`)
      
      // Recharger les repos indexés après un délai
      setTimeout(() => {
        loadIndexedRepositories()
      }, 2000)
      
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error)
      toast.error('Erreur lors de l\'indexation du repository')
    } finally {
      setIndexingRepo(null)
    }
  }

  const isRepoIndexed = (repoFullName) => {
    return indexedRepos.find(indexed => indexed.repo_full_name === repoFullName)
  }

  const getIndexingStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'indexing':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('github.title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
        {t('github.subtitle')}
      </p>
    </div>

    {/* Connection Status Card */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
      {githubStatus ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-gray-900 dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-md">
              <Github className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('github.connected.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                @{githubStatus.github_username} • {t('github.connected.since')}{' '}
                {new Date(githubStatus.connected_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={disconnectGitHub}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            {t('github.actions.disconnect')}
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <Github className="w-12 h-12 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('github.disconnected.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            {t('github.disconnected.description')}
          </p>
          <button
            onClick={connectGitHub}
            className="inline-flex items-center px-8 py-4 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Github className="w-5 h-5 mr-3" />
            {t('github.actions.connect')}
          </button>
        </div>
      )}
    </div>

    {/* Repositories Section – Only if connected */}
    {githubStatus && (
      <>
        {/* Indexed Repositories */}
        {indexedRepos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('github.indexed.title', { count: indexedRepos.length })}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t('github.indexed.description')}
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {indexedRepos.map((repo) => (
                <div key={repo.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getRepoIcon(repo)}</div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {repo.repo_full_name}
                          </h3>
                          {getIndexingStatusIcon(repo.status)}
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                            {t(`github.status.${repo.status}`, { defaultValue: repo.status })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            {repo.files_indexed || 0} {t('github.filesIndexed')}
                          </span>
                          <span>
                            {t('github.indexedAt')}{' '}
                            {new Date(repo.indexed_at || repo.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {repo.error_message && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                            {t('github.error')}: {repo.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Repositories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('github.available.title', { count: repositories.length })}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {t('github.available.description')}
                </p>
              </div>
              {loadingRepos && <LoadingSpinner size="md" />}
            </div>
          </div>

          {repositories.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t('github.available.empty')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {repositories.map((repo) => {
                const indexed = isRepoIndexed(repo.full_name)
                const isIndexing = indexingRepo === repo.full_name

                return (
                  <div
                    key={repo.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                            {repo.name}
                          </h3>
                          {repo.private && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-full">
                              {t('github.labels.private')}
                            </span>
                          )}
                          {indexed && (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              {t('github.labels.indexed')}
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                            {repo.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          {repo.language && (
                            <span className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-1.5 ${getLanguageColor(repo.language)}`} />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center">
                            <GitBranch className="w-4 h-4 mr-1" />
                            {repo.forks}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(repo.updated_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          title={t('github.actions.viewOnGitHub')}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>

                        {!indexed && (
                          <button
                            onClick={() => indexRepository(repo)}
                            disabled={isIndexing}
                            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                          >
                            {isIndexing ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span>{t('github.actions.indexing')}</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>{t('github.actions.index')}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
}