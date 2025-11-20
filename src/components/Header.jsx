import { Menu, Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const headerRef = useRef(null);
  const navigate = useNavigate();

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowProfileMenu(false)
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
  <header ref={headerRef} className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
    <div className="flex items-center justify-between">
      {/* Bouton menu mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('common.menu')}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Titre mobile */}
      <div className="flex-1 lg:flex-none">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:hidden">
          DALADERO
        </h1>
      </div>

      {/* Barre de recherche (desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
            aria-label={t('header.notifications')}
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
          </button>

          {/* Dropdown Notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('header.notifications')}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('notifications.memoryChatReady')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('notifications.memoryChatDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t('notifications.systemOperational')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('notifications.systemOperationalDesc')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil utilisateur */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('header.userMenu')}
          >
            <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
              <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Menu Profil */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('common.connected')}
                </p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => { navigate('/profile'); setShowProfileMenu(false) }}
                  className="w-full flex items-center space-x-3 px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{t('nav.profile')}</span>
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowProfileMenu(false) }}
                  className="w-full flex items-center space-x-3 px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>{t('nav.settings')}</span>
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => {
                    logout()
                    setShowProfileMenu(false)
                    toast.success(t('common.logoutSuccess'))
                  }}
                  className="w-full flex items-center space-x-3 px-5 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
)
}