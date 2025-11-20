import { Link, useLocation } from 'react-router-dom'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  MessageSquare, 
  Github, 
  Brain, 
  FileText, 
  LogOut,
  User,
  X
} from 'lucide-react'
import { t } from 'i18next'

const navigation = [
  { name: t('nav.dashboard'), href: '/dashboard', icon: Home, i18nKey: 'nav.dashboard' },
  { name: t('nav.chat'), href: '/agents', icon: MessageSquare, i18nKey: 'nav.chat' },
  { name: t('nav.documents'), href: '/files', icon: FileText, i18nKey: 'nav.documents' },
  { name: t('nav.memories'), href: '/memories', icon: Brain, i18nKey: 'nav.memories' },
  { name: t('nav.github'), href: '/github', icon: Github, i18nKey: 'nav.github' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
  <>
    {/* Sidebar pour desktop & mobile */}
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              DALADERO
            </span>
          </div>

          {/* Bouton fermer (mobile uniquement) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-40">
                {user?.email || t('common.defaultUser')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('common.connected')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}
                />
                {t(item.i18nKey)}
              </Link>
            )
          })}
        </nav>

        {/* Déconnexion */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut className="mr-3 w-5 h-5 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  </>
)
}