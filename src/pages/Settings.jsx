import { useState, useEffect } from 'react'
import { Settings as Set, Shield, Trash2, Globe, Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'
import { profileService, userService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from "react-i18next";
import { t } from 'i18next'

export default function Settings() {
  const [settings, setSettings] = useState({
    language: 'fr',
    theme: 'light',
  })
  const [initialSettings, setInitialSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const profile = await userService.getProfile()
        const currentSettings = {
          language: profile.language || 'fr',
          theme: profile.theme || 'light',
        }
        setSettings(currentSettings)
        setInitialSettings(currentSettings)
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error)
        toast.error("Impossible de charger les paramètres.")
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setSettings((prev) => ({ ...prev, [name]: value }))
    if (name === 'theme') {
    setTheme(value);
  }
  }

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Sauvegarde des paramètres...');
    try {
      const updatedProfile = await profileService.updateProfile(settings);
      
      if (updatedProfile.theme) {
        setTheme(updatedProfile.theme); 
      }

      setSettings({
        language: updatedProfile.language,
        theme: updatedProfile.theme,
      });
      setInitialSettings({
        language: updatedProfile.language,
        theme: updatedProfile.theme,
      });

      if (updatedProfile.theme) {
        setTheme(updatedProfile.theme);
      }
      
      toast.success('Paramètres sauvegardés !', { id: toastId });
      console.log(updatedProfile.language)
      if (updatedProfile.language === 'fr') {
        i18n.changeLanguage("fr")
      } else {
        i18n.changeLanguage("en")
      }
    } catch (error) {
      toast.error(error)
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmationText = "Je suis sûr de vouloir supprimer mon compte définitivement.";
    const userInput = window.prompt(`Pour confirmer, veuillez taper : "${confirmationText}"`);
    
    if (userInput === confirmationText) {
      const toastId = toast.loading('Suppression de votre compte...');
      try {
        await profileService.deleteAccount();
        toast.success('Compte supprimé avec succès. Vous allez être déconnecté.', { id: toastId, duration: 4000 });
        
        setTimeout(() => {
          logout(); 
        }, 2000);

      } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        toast.error('La suppression du compte a échoué.', { id: toastId });
      }
    } else if (userInput !== null) { 
      toast.error('Le texte de confirmation est incorrect.');
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
  <div className="space-y-10">
    {/* Header */}
    <div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        {t('settings.title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
        {t('settings.subtitle')}
      </p>
    </div>

    {/* General Settings */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
          <Set className="w-7 h-7 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">
          {t('settings.general.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
        {/* Language */}
        <div>
          <label htmlFor="language" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            <Globe className="w-5 h-5 mr-2 text-gray-500" />
            {t('settings.language.label')}
          </label>
          <select
            id="language"
            name="language"
            value={settings.language}
            onChange={handleInputChange}
            className="w-full px-5 py-3.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white transition-all"
          >
            <option value="fr">{t('settings.language.fr')}</option>
            <option value="en">{t('settings.language.en')}</option>
            {/* Ajoute les langues que tu veux */}
          </select>
        </div>

        {/* Theme */}
        <div>
          <label htmlFor="theme" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 mr-2 text-gray-500" />
            ) : (
              <Sun className="w-5 h-5 mr-2 text-gray-500" />
            )}
            {t('settings.theme.label')}
          </label>
          <select
            id="theme"
            name="theme"
            value={settings.theme}
            onChange={handleInputChange}
            className="w-full px-5 py-3.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white transition-all"
          >
            <option value="light">{t('settings.theme.light')}</option>
            <option value="dark">{t('settings.theme.dark')}</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('settings.theme.systemHint')}
          </p>
        </div>
      </div>

      {/* Save Button – only if changes */}
      {hasChanges && (
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                {t('settings.actions.saving')}
              </>
            ) : (
              t('settings.actions.save')
            )}
          </button>
        </div>
      )}
    </div>

    {/* Danger Zone */}
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-2xl p-8 shadow-lg">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl">
          <Shield className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 ml-4">
          {t('settings.dangerZone.title')}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('settings.dangerZone.deleteTitle')}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('settings.dangerZone.deleteDescription')}{' '}
            <span className="font-bold text-red-600 dark:text-red-400">
              {t('settings.dangerZone.irreversible')}
            </span>
            . {t('settings.dangerZone.deleteConsequences')}
          </p>
        </div>

        <button
          onClick={handleDeleteAccount}
          className="inline-flex items-center px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-600/30 transition-all duration-200"
        >
          <Trash2 className="w-5 h-5 mr-3" />
          {t('settings.dangerZone.deleteButton')}
        </button>
      </div>
    </div>
  </div>
);
}