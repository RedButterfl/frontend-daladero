import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Camera, 
  Mail, 
  Lock,
} from 'lucide-react'
import { t } from 'i18next';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfileData(data);
      } catch (error) {
        toast.error("Impossible de charger le profil.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setProfileData({ ...profileData, [name]: value })
  }

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      const updatedProfile = await userService.updateProfile({
        username: profileData.username,
        bio: profileData.bio
      });
      setProfileData(updatedProfile);
      toast.success('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil.');
      console.error(error);
    }
  };

  if (loading || !profileData) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }
  
  return (
  <div className="space-y-10">
    {/* Header */}
    <div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        {t('profile.title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
        {t('profile.subtitle')}
      </p>
    </div>

    {/* Profile Card */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 h-32"></div>
      
      <div className="relative px-8 pb-10 pt-4 -mt-16">
        <form onSubmit={handleProfileUpdate} className="space-y-8">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-5 sm:space-y-0 sm:space-x-8">
            <div className="relative group">
              <img
                className="h-32 w-32 rounded-full object-cover ring-8 ring-white dark:ring-gray-800 shadow-2xl"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.username)}&background=random&bold=true&size=256`}
                alt={t('profile.avatarAlt')}
              />
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                  <input id="avatar-upload" type="file" accept="image/*" className="sr-only" />
                </label>
              )}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profileData.username || t('profile.anonymous')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {profileData.email}
              </p>
              {profileData.bio ? (
                <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-xl italic">
                  "{profileData.bio}"
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-500 mt-3 italic">
                  {t('profile.noBio')}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('profile.username.label')}
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={profileData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder={t('profile.username.placeholder')}
                className={`w-full px-5 py-3.5 rounded-xl border ${
                  isEditing
                    ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                } text-gray-900 dark:text-white transition-all duration-200`}
              />
            </div>

            {/* Email (disabled) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('profile.email.label')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email}
                  disabled
                  className="w-full px- full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white cursor-not-allowed pr-12"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('profile.email.immutable')}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.bio.label')}
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={profileData.bio || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder={isEditing ? t('profile.bio.placeholderEdit') : t('profile.bio.placeholderEmpty')}
              className={`w-full px-5 py-4 rounded-xl border resize-none transition-all duration-200 ${
                isEditing
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
              } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('profile.bio.helper')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all duration-200 flex items-center gap-2"
                >
                  {t('profile.actions.save')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all duration-200 flex items-center gap-2"
              >
                {t('profile.actions.edit')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  </div>
);
}