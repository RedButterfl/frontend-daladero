import { useState, useEffect, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { vectorStoreService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { t } from 'i18next'

export default function FileManager() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [viewingFile, setViewingFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await vectorStoreService.getFiles()
      setFiles(response.files || [])
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error)
      if (error.response?.status === 404) {
        toast.error('Aucun vector store trouvé. Connectez-vous d\'abord.')
      } else {
        toast.error('Erreur lors du chargement des fichiers')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const uploadFile = async (file) => {
    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté. Utilisez PDF, TXT, MD, DOC, DOCX, CSV ou JSON.')
      return
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Taille maximale : 10MB')
      return
    }

    try {
      setUploading(true)
      
      const response = await vectorStoreService.uploadFile(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // Optionnel : afficher la progression
      })

      toast.success(`Fichier "${file.name}" uploadé avec succès !`)
      await loadFiles() // Recharger la liste
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      const errorMessage = error.response?.data?.detail || 'Erreur lors de l\'upload du fichier'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const deleteFile = async (fileId, filename) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${filename}" ?`)) {
      return
    }

    try {
      await vectorStoreService.deleteFile(fileId)
      toast.success('Fichier supprimé avec succès')
      await loadFiles() // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du fichier')
    }
  }

  const viewFileContent = async (file) => {
    try {
      setViewingFile(file)
      setFileContent(null)
      
      const response = await vectorStoreService.getFileContent(file.id)
      setFileContent(response.content)
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error)
      toast.error('Erreur lors de la lecture du fichier')
      setViewingFile(null)
    }
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'txt':
      case 'md':
        return '📝'
      case 'doc':
      case 'docx':
        return '📘'
      case 'csv':
        return '📊'
      case 'json':
        return '⚙️'
      default:
        return '📎'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('documents.title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        {t('documents.subtitle')}
      </p>
    </div>

    {/* Upload Zone */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('documents.upload.title')}
      </h2>
      
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
          {t('documents.upload.dropzone.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('documents.upload.dropzone.subtitle')}
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          {uploading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">{t('documents.upload.uploading')}</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="ml-2">{t('documents.upload.button')}</span>
            </>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept=".pdf,.txt,.md,.doc,.docx,.csv,.json"
          className="hidden"
        />
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          {t('documents.upload.supportedFormats')}
        </p>
      </div>
    </div>

    {/* Files List */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('documents.list.title', { count: files.length })}
        </h2>
      </div>

      {files.length === 0 ? (
        <div className="p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
            {t('documents.list.empty.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t('documents.list.empty.description')}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="text-3xl">
                    {getFileIcon(file.filename)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                      {file.filename}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(file.created_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      {file.usage_bytes && (
                        <span className="font-medium">{formatFileSize(file.usage_bytes)}</span>
                      )}
                      <div className="flex items-center space-x-1.5">
                        {getStatusIcon(file.status)}
                        <span className="capitalize font-medium">
                          {t(`documents.status.${file.status}`, { defaultValue: file.status })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => viewFileContent(file)}
                    className="p-2.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    title={t('documents.actions.view')}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => deleteFile(file.id, file.filename)}
                    className="p-2.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title={t('documents.actions.delete')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* File Content Modal */}
    {viewingFile && (
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getFileIcon(viewingFile.filename)}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-2xl">
                {viewingFile.filename}
              </h3>
            </div>
            <button
              onClick={() => {
                setViewingFile(null)
                setFileContent(null)
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('common.close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-900/50">
            {fileContent === null ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                {fileContent}
              </pre>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}