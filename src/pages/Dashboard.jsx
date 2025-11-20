import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  MessageSquare, 
  FileText, 
  Github, 
  Brain, 
  Upload,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { vectorStoreService, githubService, memoryService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { t } from 'i18next'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    filesCount: 0,
    memoriesCount: 0,
    githubConnected: false,
    vectorStoreExists: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)

      // Charger les stats en parallèle
      const [vectorStoreStatus, memories, githubStatus] = await Promise.allSettled([
        vectorStoreService.getStatus(),
        memoryService.getMemories(),
        githubService.getStatus()
      ])

      const newStats = { ...stats }

      // Vector store et fichiers
      if (vectorStoreStatus.status === 'fulfilled') {
        newStats.vectorStoreExists = vectorStoreStatus.value.exists
        if (vectorStoreStatus.value.exists) {
          try {
            const files = await vectorStoreService.getFiles()
            newStats.filesCount = files.total || 0
          } catch (error) {
            console.warn('Erreur lors du chargement des fichiers:', error)
          }
        }
      }

      // Mémoires
      if (memories.status === 'fulfilled') {
        newStats.memoriesCount = memories.value.memories?.length || 0
      }

      // GitHub
      if (githubStatus.status === 'fulfilled') {
        newStats.githubConnected = true
      }

      setStats(newStats)
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      name: 'Chat avec l\'IA',
      description: 'Posez des questions à vos documents',
      icon: MessageSquare,
      href: '/agents',
      color: 'bg-blue-500',
      enabled: true
    },
    {
      name: 'Uploader des fichiers',
      description: 'Enrichir votre base de connaissances',
      icon: Upload,
      href: '/files',
      color: 'bg-green-500',
      enabled: true
    },
    {
      name: 'Connecter GitHub',
      description: 'Indexer vos repositories automatiquement',
      icon: Github,
      href: '/github',
      color: 'bg-gray-800',
      enabled: true
    },
    {
      name: 'Gérer les mémoires',
      description: 'Personnaliser votre profil IA',
      icon: Brain,
      href: '/memories',
      color: 'bg-purple-500',
      enabled: true
    }
  ]

  const features = [
    {
      name: 'Agents IA Intelligents',
      description: 'Des assistants IA qui comprennent vos documents et votre contexte',
      icon: Zap,
      benefits: ['Recherche sémantique', 'Réponses contextuelles', 'Mémoire persistante']
    },
    {
      name: 'Base de Connaissances',
      description: 'Centralisez tous vos documents dans un vector store intelligent',
      icon: FileText,
      benefits: ['Support multi-formats', 'Indexation automatique', 'Recherche rapide']
    },
    {
      name: 'Intégration GitHub',
      description: 'Connectez vos repositories pour enrichir votre profil automatiquement',
      icon: Github,
      benefits: ['OAuth sécurisé', 'Indexation auto', 'Présentation IA']
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
  <div className="space-y-8">
    {/* Welcome Section – Hero */}
    <div className="bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-500 dark:to-blue-500 rounded-2xl p-8 text-white shadow-xl">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          {t('Bienvenue')}, {user?.email?.split('@')[0] || t('Utilisateur')} !
        </h1>
        <p className="text-primary-100 dark:text-primary-200 text-lg leading-relaxed mb-8 opacity-95">
          {t('Votre assistant IA personnel est prêt à vous aider. Uploadez vos documents, connectez GitHub et commencez à discuter avec votre base de connaissances intelligente.')}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/agents"
            className="inline-flex items-center px-7 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 hover:shadow-lg transition-all duration-200 shadow-md"
          >
            {t('Commencer le chat IA')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          {!stats.vectorStoreExists && (
            <Link
              to="/files"
              className="inline-flex items-center px-7 py-3.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl font-medium hover:bg-white/30 transition-all duration-200"
            >
              {t('Uploader des documents')}
              <Upload className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: t('Documents'), value: stats.filesCount, icon: FileText, color: 'blue' },
        { label: t('Mémoires'), value: stats.memoriesCount, icon: Brain, color: 'purple' },
        { label: t('GitHub'), value: stats.githubConnected ? t('Connecté') : t('Non connecté'), icon: Github, color: 'gray', connected: stats.githubConnected },
        { label: t('Statut'), value: t('Actif'), icon: BarChart3, color: 'green' }
      ].map((stat, i) => (
        <div key={i} className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${
                stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
                stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' :
                stat.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                'bg-green-100 dark:bg-green-900/50'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  stat.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                  'text-green-600 dark:text-green-400'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${
                  stat.connected === false ? 'text-red-600 dark:text-red-400' :
                  'text-gray-900 dark:text-white'
                }`}>
                  {typeof stat.value === 'string' ? (
                    <span className="flex items-center">
                      {stat.connected && <CheckCircle className="w-5 h-5 mr-1 text-green-500" />}
                      {stat.value}
                    </span>
                  ) : stat.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Quick Actions */}
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('Actions rapides')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.enabled ? action.href : '#'}
            className={`group p-6 rounded-xl border transition-all duration-300 ${
              action.enabled
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <action.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{t(action.name)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t(action.description)}</p>
          </Link>
        ))}
      </div>
    </div>

    {/* Features Overview */}
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('Fonctionnalités principales')}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div 
            key={feature.name} 
            className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
                <feature.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">{t(feature.name)}</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{t(feature.description)}</p>
            <ul className="space-y-3">
              {feature.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{t(benefit)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}