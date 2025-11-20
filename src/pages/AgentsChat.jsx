import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Trash2, Settings, Zap, Brain, Users, MessageCircle } from 'lucide-react'
import { agentService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { t } from 'i18next'

const AGENT_TYPES = {
  knowledge_assistant: {
    name: 'Assistant Connaissances',
    description: 'Questions rapides sur vos documents',
    icon: Bot,
    color: 'bg-blue-500',
    model: 'GPT-4o-mini'
  },
  research_specialist: {
    name: 'Spécialiste Recherche',
    description: 'Analyses approfondies et synthèses',
    icon: Brain,
    color: 'bg-purple-500',
    model: 'GPT-4o'
  },
  multi_agent: {
    name: 'Système Multi-Agents',
    description: 'Triage intelligent et délégation',
    icon: Users,
    color: 'bg-green-500',
    model: 'Multi-agents'
  },
  memory_manager: {
    name: 'Memory Manager',
    description: 'Gestion de vos aspirations et préférences professionnelles',
    icon: MessageCircle,
    color: 'bg-orange-500',
    model: 'GPT-4o-mini',
    isMemoryAgent: true
  }
}

export default function AgentsChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('knowledge_assistant')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Message de bienvenue en fonction de l'agent sélectionné
    let welcomeContent = `Bonjour ! Je suis votre assistant IA personnel. Je peux vous aider à rechercher des informations dans vos documents, répondre à vos questions et bien plus encore. 

Que souhaitez-vous savoir ?`
    
    if (selectedAgent === 'memory_manager') {
      welcomeContent = `Salut ! 👋 Je suis votre Memory Manager. Je peux vous aider à :
• Clarifier vos aspirations professionnelles
• Définir vos préférences de travail  
• Sauvegarder et gérer vos objectifs de carrière
• Consulter vos mémoires déjà enregistrées

Dites-moi, qu'est-ce qui vous amène aujourd'hui ?`
    }
    
    setMessages([{
      id: 1,
      type: 'assistant',
      content: welcomeContent,
      timestamp: new Date(),
      agent: selectedAgent
    }])
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Gestion du streaming pour Memory Manager
  const handleMemoryChatStream = async (userMessage) => {
    const assistantMessageId = Date.now() + 1
    let streamingMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      agent: selectedAgent,
      isStreaming: true,
      toolCalls: []
    }

    setMessages(prev => [...prev, streamingMessage])

    try {
      const response = await agentService.memoryChatStream(userMessage.content, sessionId)
      
      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))
              
              if (data.type === 'token') {
                // Ajouter le token au message en cours
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                ))
              } else if (data.type === 'tool_call_start') {
                // Afficher badge d'outil en cours
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        toolCalls: [...(msg.toolCalls || []), { 
                          tool: data.tool, 
                          status: 'running' 
                        }] 
                      }
                    : msg
                ))
              } else if (data.type === 'tool_call_end') {
                // Marquer l'outil comme terminé
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        toolCalls: (msg.toolCalls || []).map(tc => 
                          tc.tool === data.tool 
                            ? { ...tc, status: 'completed', result: data.result }
                            : tc
                        )
                      }
                    : msg
                ))
                
                // Afficher notification de succès
                if (data.result && data.result.includes('✅')) {
                  toast.success(`Mémoire mise à jour : ${data.tool}`)
                }
              } else if (data.type === 'done') {
                break
              }
            } catch (parseError) {
              console.error('Erreur de parsing SSE:', parseError)
            }
          }
        }
      }

      // Marquer le message comme terminé
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ))

    } catch (error) {
      console.error('Erreur Memory Chat Stream:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: `Désolé, une erreur s'est produite : ${error.message}`, 
              isError: true,
              isStreaming: false
            }
          : msg
      ))
      toast.error('Erreur lors de la communication avec Memory Manager')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) {
      return
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Si c'est Memory Manager, utiliser le streaming
      if (selectedAgent === 'memory_manager') {
        await handleMemoryChatStream(userMessage)
      } else {
        // Logique existante pour les autres agents
        const response = await agentService.chat(
          userMessage.content,
          selectedAgent,
          {
            sessionId,
            maxResults: 5
          }
        )

        if (response.success) {
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: response.output || 'Désolé, je n\'ai pas pu générer une réponse.',
            timestamp: new Date(),
            agent: selectedAgent,
            sources: response.sources || []
          }

          setMessages(prev => [...prev, assistantMessage])
        } else {
          throw new Error(response.error || 'Erreur lors de la génération de la réponse')
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Désolé, une erreur s'est produite : ${error.message}. Veuillez réessayer.`,
        timestamp: new Date(),
        agent: selectedAgent,
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
      toast.error('Erreur lors de la communication avec l\'agent')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearMessages = async () => {
    try {
      await agentService.clearSession(sessionId)
      setMessages([{
        id: Date.now(),
        type: 'assistant',
        content: 'Conversation effacée. Comment puis-je vous aider ?',
        timestamp: new Date(),
        agent: selectedAgent
      }])
      toast.success('Conversation effacée')
    } catch (error) {
      console.error('Erreur lors de l\'effacement:', error)
      toast.error('Erreur lors de l\'effacement de la conversation')
    }
  }

  const handleAgentChange = (agentType) => {
    setSelectedAgent(agentType)
    
    let welcomeMessage = `Agent ${AGENT_TYPES[agentType].name} activé ! Je suis spécialisé dans : ${AGENT_TYPES[agentType].description.toLowerCase()}. Comment puis-je vous aider ?`
    
    // Message personnalisé pour Memory Manager
    if (agentType === 'memory_manager') {
      welcomeMessage = `Salut ! 👋 Je suis votre Memory Manager. Je peux vous aider à :
• Clarifier vos aspirations professionnelles
• Définir vos préférences de travail
• Sauvegarder et gérer vos objectifs de carrière
• Consulter vos mémoires déjà enregistrées

Dites-moi, qu'est-ce qui vous amène aujourd'hui ?`
    }
    
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
      agent: agentType
    }])
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentAgent = AGENT_TYPES[selectedAgent]

  return (
  <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
      <div className="flex items-center space-x-3">
        <div className={`p-2 ${currentAgent.color} rounded-lg`}>
          <currentAgent.icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {t(currentAgent.name)}
            {currentAgent.isMemoryAgent && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                {t("Streaming")}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t(currentAgent.description)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Agent Selector */}
        <div className="relative">
          <select
            value={selectedAgent}
            onChange={(e) => handleAgentChange(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            {Object.entries(AGENT_TYPES).map(([key, agent]) => (
              <option key={key} value={key}>
                {t(agent.name)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button
          onClick={clearMessages}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title={t("Effacer la conversation")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-3xl flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user'
                ? 'bg-primary-500'
                : message.isError
                  ? 'bg-red-500'
                  : currentAgent.color
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <currentAgent.icon className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`rounded-2xl px-4 py-3 min-w-32 ${
              message.type === 'user'
                ? 'bg-primary-600 text-white'
                : message.isError
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
            }`}>
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block ml-1 w-2 h-5 bg-gray-500 dark:bg-gray-400 animate-pulse"></span>
                )}
              </div>

              {/* Sources */}
              {message.sources?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t("Sources :")}</p>
                  <div className="space-y-1">
                    {message.sources.map((source, index) => (
                      <div key={index} className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 border border-gray-300 dark:border-gray-600">
                        {source.filename || `${t("Document")} ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool Calls */}
              {message.toolCalls?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                  <div className="space-y-2">
                    {message.toolCalls.map((toolCall, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        {toolCall.status === 'running' && (
                          <>
                            <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-orange-600 dark:text-orange-400">{t("Sauvegarde en cours...")}</span>
                          </>
                        )}
                        {toolCall.status === 'completed' && (
                          <>
                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-green-600 dark:text-green-400">
                              {t(toolCall.result) || t('Mémoire sauvegardée')}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className={`text text-xs mt-2 ${
                message.type === 'user'
                  ? 'text-primary-200'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 ${currentAgent.color} rounded-full flex items-center justify-center`}>
              <currentAgent.icon className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">{t("L'agent réfléchit...")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* Input Area */}
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
      <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            placeholder={t("Posez votre question...")}
            rows={1}
            className="w-full resize-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
        </button>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          t("Résume mes documents"),
          t("Quelles sont mes compétences ?"),
          t("Analyse mon profil GitHub"),
          t("Aide-moi à rédiger un CV")
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputMessage(suggestion)}
            className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  </div>
);
}