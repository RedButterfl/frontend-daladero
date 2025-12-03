import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { t } from 'i18next'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const { login, signup, loading } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    // Confirm password (signup only)
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmez votre mot de passe'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signup(formData.email, formData.password)
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setErrors({})
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-primary-950/30 flex items-center justify-center p-4 relative overflow-hidden">
    
    {/* Formes décoratives animées */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/30 dark:bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
    </div>

    <div className="relative w-full max-w-md">
      {/* Logo et titre */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary-600 dark:bg-primary-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-primary-600/30">
          <span className="text-white font-bold text-2xl">D</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">DALADERO</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{t('auth.subtitle')}</p>
      </div>

      {/* Formulaire */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? t('auth.login.title') : t('auth.signup.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin 
              ? t('auth.login.description') 
              : t('auth.signup.description')
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.email.label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
                placeholder={t('auth.email.placeholder')}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.password.label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
                placeholder={t('auth.password.placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>

          {/* Confirmation mot de passe */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.confirmPassword.label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all`}
                  placeholder={t('auth.password.placeholder')}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Bouton principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 text-white font-medium rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <span className="text-lg">
                  {isLogin ? t('auth.login.submit') : t('auth.signup.submit')}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Lien de bascule */}
        <div className="mt-8 text-center switchmodediv">
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            {' '}
            <button
              onClick={switchMode}
              className="switchmodebtn font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline-offset-4 hover:underline transition"
            >
              {isLogin ? t('auth.signup.link') : t('auth.login.link')}
            </button>
          </p>
        </div>
      </div>

      {/* Mention légale */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {t('auth.legal', { terms: <a href="#" className="underline hover:text-primary-600 dark:hover:text-primary-400">{t('auth.terms')}</a> })}
        </p>
      </div>
    </div>
  </div>
);
}