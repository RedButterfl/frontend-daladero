import axios from 'axios'

// Configuration de base d'Axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si token expiré (401), essayer de le rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          })
          
          const { access_token, refresh_token: newRefreshToken } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', newRefreshToken)
          
          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Services d'authentification
export const authService = {
  signup: async (email, password) => {
    const response = await api.post('/auth/signup', { email, password })
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  }
}

// Services de profil utilisateur
export const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/user/profile', profileData)
    return response.data
  },

  getVectorStoreInfo: async () => {
    const response = await api.get('/vectorstore/info')
    return response.data
  }
}

export const profileService = {
  updateProfile: async (profileData) => {
    const { data } = await api.put('/user/profile', profileData);
    return data;
  },
  deleteAccount: async () => {
    const { data } = await api.delete('/user');
    return data;
  },
};

// Services de vector store
export const vectorStoreService = {
  getStatus: async () => {
    const response = await api.get('/vectorstore/status')
    return response.data
  },

  create: async (name) => {
    const response = await api.post('/vectorstore/create', { name })
    return response.data
  },

  uploadFile: async (file, onProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/vectorstore/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    })
    return response.data
  },

  getFiles: async () => {
    const response = await api.get('/vectorstore/files')
    return response.data
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/vectorstore/files/${fileId}`)
    return response.data
  },

  getFileContent: async (fileId) => {
    const response = await api.get(`/vectorstore/files/${fileId}/content`)
    return response.data
  }
}

// Services des agents IA
export const agentService = {
  chat: async (query, agentType = 'knowledge_assistant', options = {}) => {
    const response = await api.post('/agents/chat', {
      query,
      agent_type: agentType,
      session_id: options.sessionId,
      custom_instructions: options.instructions,
      max_results: options.maxResults
    })
    return response.data
  },

  streamChat: async (query, agentType = 'knowledge_assistant', options = {}) => {
    const response = await api.post('/agents/stream', {
      query,
      agent_type: agentType,
      session_id: options.sessionId,
      custom_instructions: options.instructions,
      max_results: options.maxResults
    }, {
      responseType: 'stream'
    })
    return response.data
  },

  clearSession: async (sessionId) => {
    const response = await api.delete(`/agents/sessions/${sessionId}`)
    return response.data
  },

  getSessionStats: async () => {
    const response = await api.get('/agents/sessions/stats')
    return response.data
  },

  // Memory Chat - Non streaming
  memoryChat: async (query, sessionId = null) => {
    const response = await api.post('/api/v1/agents/memory-chat', {
      query,
      session_id: sessionId
    })
    return response.data
  },

  // Memory Chat - Streaming avec SSE
  memoryChatStream: async (query, sessionId = null) => {
    const token = localStorage.getItem('access_token')
    
    // Utiliser fetch pour POST avec streaming SSE
    const response = await fetch('http://localhost:8000/api/v1/agents/memory-chat/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        query,
        session_id: sessionId
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }
}

// Services GitHub
export const githubService = {
  connect: async () => {
    const response = await api.get('/api/v1/github/connect')
    return response.data
  },

  getStatus: async () => {
    const response = await api.get('/api/v1/github/status')
    return response.data
  },

  disconnect: async () => {
    const response = await api.delete('/api/v1/github/disconnect')
    return response.data
  },

  getRepos: async (page = 1, perPage = 30) => {
    const response = await api.get('/api/v1/github/repos', {
      params: { page, per_page: perPage }
    })
    return response.data
  },

  indexRepo: async (repoOwner, repoName, options = {}) => {
    const response = await api.post('/api/v1/github/index-repo', {
      repo_owner: repoOwner,
      repo_name: repoName,
      file_patterns: options.filePatterns,
      max_file_size_kb: options.maxFileSizeKb
    })
    return response.data
  },

  getIndexedRepos: async () => {
    const response = await api.get('/api/v1/github/indexed-repos')
    return response.data
  }
}

// Services de mémoires
export const memoryService = {
  getMemories: async (category = null) => {
    const params = category ? { category } : {}
    const response = await api.get('/api/v1/memories', { params })
    return response.data
  },

  createMemory: async (memoryData) => {
    const response = await api.post('/api/v1/memories', memoryData)
    return response.data
  },

  updateMemory: async (memoryId, memoryData) => {
    const response = await api.put(`/api/v1/memories/${memoryId}`, memoryData)
    return response.data
  },

  deleteMemory: async (memoryId) => {
    const response = await api.delete(`/api/v1/memories/${memoryId}`)
    return response.data
  },

  searchMemories: async (query, category = null) => {
    const response = await api.post('/api/v1/memories/search', {
      query,
      category
    })
    return response.data
  }
}

// Services microservices
export const microserviceService = {
  getUserInfo: async (userId) => {
    const response = await api.get(`/api/v1/users/${userId}/info`)
    return response.data
  },

  query: async (userId, query, agentType = 'knowledge_assistant') => {
    const response = await api.post('/api/v1/query', {
      user_id: userId,
      query,
      agent_type: agentType
    })
    return response.data
  },

  getCVData: async (userId, jobOffer) => {
    const response = await api.post('/api/v1/cv-data', {
      user_id: userId,
      job_offer: jobOffer
    })
    return response.data
  },

  getUnifiedUserData: async (userId, jobOffer = null) => {
    const response = await api.post('/api/v1/unified-user-data', {
      user_id: userId,
      job_offer: jobOffer
    })
    return response.data
  }
}

// Health check
export const healthService = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api