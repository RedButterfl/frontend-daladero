import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'auth:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      const { access_token, refresh_token, user: userData } = response
      
      // Stocker les données d'authentification
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      toast.success('Connexion réussie !')
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la connexion'
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password) => {
    try {
      setLoading(true)
      const response = await authService.signup(email, password)
      
      const { access_token, refresh_token, user: userData } = response
      
      // Stocker les données d'authentification
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      toast.success('Inscription réussie ! Bienvenue !')
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'inscription'
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      toast.success('Déconnexion réussie')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      // Nettoyer les données locales même en cas d'erreur
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('Pas de refresh token')
      }

      const response = await authService.refreshToken(refreshToken)
      const { access_token, refresh_token: newRefreshToken, user: userData } = response
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', newRefreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      return true
    } catch (error) {
      console.error('Erreur lors du refresh token:', error)
      logout()
      return false
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}