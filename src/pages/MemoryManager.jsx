import { useState, useEffect } from 'react'
import { 
  Brain, 
  Search, 
  Tag,
  Calendar,
  Filter,
  Trash2
} from 'lucide-react'
import { memoryService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { t } from 'i18next'

const MEMORY_CATEGORIES = {
  career_aspiration: { name: 'Aspirations professionnelles', color: 'bg-blue-100 text-blue-800' },
  work_preference: { name: 'Préférences de travail', color: 'bg-green-100 text-green-800' },
  skill: { name: 'Compétences', color: 'bg-purple-100 text-purple-800' },
  salary_expectation: { name: 'Attentes salariales', color: 'bg-yellow-100 text-yellow-800' },
  location_preference: { name: 'Préférences de localisation', color: 'bg-indigo-100 text-indigo-800' },
  other: { name: 'Autre', color: 'bg-gray-100 text-gray-800' }
}

export default function MemoryManager() {
  const [memories, setMemories] = useState([])
  const [filteredMemories, setFilteredMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadMemories()
  }, [])

  useEffect(() => {
    filterMemories()
  }, [memories, searchTerm, selectedCategory])

  const loadMemories = async () => {
    try {
      setLoading(true)
      const response = await memoryService.getMemories()
      setMemories(response.memories || [])
    } catch (error) {
      console.error('Erreur lors du chargement des mémoires:', error)
      toast.error('Erreur lors du chargement des mémoires')
    } finally {
      setLoading(false)
    }
  }

  const filterMemories = () => {
    let filtered = memories

    // Filtrer par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(memory => memory.category_primary === selectedCategory)
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(memory => 
        memory.content.toLowerCase().includes(term) ||
        memory.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    setFilteredMemories(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryInfo = (category) => {
    return MEMORY_CATEGORIES[category] || MEMORY_CATEGORIES.other
  }

  const handleDeleteMemory = async (memory) => {
    const preview = memory.content.substring(0, 100)
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer cette mémoire ?\n\n"${preview}${memory.content.length > 100 ? '...' : ''}"`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      await memoryService.deleteMemory(memory.id)
      toast.success('Mémoire supprimée avec succès')
      await loadMemories()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de la mémoire')
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('Mes Mémoires')}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
        {t('Consultez vos aspirations professionnelles et préférences sauvegardées')}
      </p>
    </div>

    {/* Search + Filter Bar */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t('Rechercher dans vos mémoires...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-10 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <option value="">{t('Toutes catégories')}</option>
            {Object.entries(MEMORY_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {t(category.name)}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Memories List */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('Mes mémoires')} ({filteredMemories.length})
        </h2>
      </div>

      {filteredMemories.length === 0 ? (
        <div className="p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <Brain className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {searchTerm ? t('Aucun résultat trouvé') : t('Aucune mémoire')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            {searchTerm
              ? t('Essayez avec d\'autres termes de recherche ou modifiez le filtre.')
              : t('Commencez par créer votre première mémoire en discutant avec le Memory Manager !')}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMemories.map((memory) => {
            const category = MEMORY_CATEGORIES[memory.category_primary];

            return (
              <div
                key={memory.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Category + Importance */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
                          category?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {category?.icon && <category.icon className="w-3.5 h-3.5 mr-1.5" />}
                        {t(category?.name) || memory.category_primary}
                      </span>

                      {memory.importance_score && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm">
                          {t('Importance')} {memory.importance_score}/10
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed mb-4 line-clamp-3">
                      {memory.content}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(memory.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>

                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2">
                          <Tag className="w-4 h-4" />
                          {memory.tags.slice(0, 4).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {memory.tags.length > 4 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              +{memory.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteMemory(memory)}
                    className="p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title={t('Supprimer cette mémoire')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
}