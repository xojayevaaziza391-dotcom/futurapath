import React, { useState } from 'react';
import { UserProfile } from '../types';
import { auth, logout, db, doc, deleteDoc } from '../firebase';
import { User, Mail, Calendar, Shield, Trash2, LogOut, Edit3, Award, Briefcase, Languages } from 'lucide-react';
import { motion } from 'motion/react';
import ProfileSetup from './ProfileSetup';
import LanguageSelector from './LanguageSelector';
import { t } from '../lib/translations';
import { getCountryFlag } from '../lib/languages';

interface AccountProps {
  profile: UserProfile;
  onUpdate: (profile: Partial<UserProfile>) => Promise<void>;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function Account({ profile, onUpdate, language, onLanguageChange }: AccountProps) {
  const [isEditing, setIsEditing] = useState(false);
  const user = auth.currentUser;

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This will delete your profile and all career data permanently.')) {
      try {
        await deleteDoc(doc(db, 'users', profile.uid));
        // Note: Firebase Auth user deletion requires recent login, 
        // for this app we'll just clear the profile and let them logout.
        await logout();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Career Profile</h2>
          <button 
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
        <ProfileSetup 
          initialData={profile} 
          language={language}
          onLanguageChange={onLanguageChange}
          onComplete={async (data) => {
            await onUpdate(data);
            setIsEditing(false);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      {/* Profile Header */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        <div className="relative">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#ff4e00]/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#ff4e00]/20 flex items-center justify-center border-4 border-[#ff4e00]/10">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-[#ff4e00]" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-[#ff4e00] p-1.5 sm:p-2 rounded-xl shadow-lg">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{user?.displayName || 'Future Explorer'}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {user?.email}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Joined {new Date(profile.createdAt?.seconds * 1000).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <img src={getCountryFlag(profile.country || 'Global')} alt={profile.country || 'Global'} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
              {profile.country || 'Global'}
            </div>
          </div>
          <div className="pt-1 sm:pt-2">
            <span className="px-3 py-1 bg-[#ff4e00]/10 text-[#ff4e00] rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              {profile.userType} Account
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(true)}
          className="w-full md:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Edit3 className="w-4 h-4" />
          {t('editProfile', language)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Career DNA Card */}
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ff4e00]" />
            {t('careerDna', language)}
          </h3>
          
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('goal', language)}</div>
                <div className="text-sm font-medium text-white capitalize">{t(profile.purpose, language)}</div>
              </div>
              {profile.currentUniversity && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('university', language)}</div>
                  <div className="text-sm font-medium text-white truncate" title={profile.currentUniversity}>{profile.currentUniversity}</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase">{t('topInterests', language)}</div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(item => (
                  <span key={item} className="px-3 py-1 bg-white/5 rounded-lg text-xs border border-white/10">{item}</span>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase">{t('coreSkills', language)}</div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(item => (
                  <span key={item} className="px-3 py-1 bg-white/5 rounded-lg text-xs border border-white/10">{item}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase">{t('academicFocus', language)}</div>
              <div className="flex flex-wrap gap-2">
                {profile.academicSubjects.map(item => (
                  <span key={item} className="px-3 py-1 bg-white/5 rounded-lg text-xs border border-white/10">{item}</span>
                ))}
              </div>
            </div>
          </div>

        {/* Account Management */}
        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#ff4e00]" />
            {t('accountSettings', language)}
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={onLanguageChange} 
                variant="account" 
              />
            </div>

            <button 
              onClick={logout}
              className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" />
                <span className="font-medium">{t('signOut', language)}</span>
              </div>
              <div className="text-xs text-gray-500">{language === 'Uzbek' ? 'Xavfsiz chiqish' : language === 'Russian' ? 'Безопасный выход' : 'Securely exit'}</div>
            </button>

            <button 
              onClick={handleDeleteAccount}
              className="w-full p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl flex items-center justify-between group transition-all border border-transparent hover:border-red-500/20"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500/50 group-hover:text-red-500" />
                <span className="font-medium text-red-500/80 group-hover:text-red-500">{t('deleteAccount', language)}</span>
              </div>
              <div className="text-xs text-red-500/50">{language === 'Uzbek' ? 'Doimiy amal' : language === 'Russian' ? 'Безвозвратное действие' : 'Permanent action'}</div>
            </button>
          </div>

          <div className="p-4 bg-[#ff4e00]/5 rounded-2xl border border-[#ff4e00]/10">
            <p className="text-xs text-gray-400 leading-relaxed">
              Your data is encrypted and used only to provide personalized career predictions. We never share your profile with third parties without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
