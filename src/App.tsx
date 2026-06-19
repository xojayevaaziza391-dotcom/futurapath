import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, onAuthStateChanged, db, doc, getDoc, setDoc, serverTimestamp, FirebaseUser } from './firebase';
import { UserProfile } from './types';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import Chat from './components/Chat';
import Account from './components/Account';
import EconomyTab from './components/EconomyTab';
import JobsTab from './components/JobsTab';
import NewsTab from './components/NewsTab';
import LanguageSelector from './components/LanguageSelector';
import { LogIn, LogOut, LayoutDashboard, MessageSquare, User as UserIcon, Loader2, TrendingUp, Briefcase, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from './lib/translations';

type ActiveTab = 'dashboard' | 'chat' | 'economy' | 'jobs' | 'news' | 'profile';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguage] = useState<string>('English');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleProfileUpdate = async (newProfile: Partial<UserProfile>) => {
    if (!user) return;
    const updatedProfile = {
      ...(profile || {}),
      ...newProfile,
      uid: user.uid,
      email: user.email!,
      updatedAt: serverTimestamp(),
      createdAt: profile?.createdAt || serverTimestamp(),
    } as UserProfile;
    await setDoc(doc(db, 'users', user.uid), updatedProfile);
    setProfile(updatedProfile);
    if (!profile) setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0502]">
        <Loader2 className="w-12 h-12 text-[#ff4e00] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0502] text-white flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-6 right-6">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold tracking-tighter text-[#ff4e00]">FUTURAPATH</h1>
            <p className="text-gray-400 text-lg">{t('tagline', language)}</p>
          </div>
          <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 space-y-6">
            <p className="text-sm text-gray-300">{t('signInDesc', language)}</p>
            <button onClick={signInWithGoogle} className="w-full py-4 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              <LogIn className="w-5 h-5" />
              {t('continueWithGoogle', language)}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup onComplete={handleProfileUpdate} language={language} onLanguageChange={setLanguage} />;
  }

  const countries = [
    'Global', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen', 'Zambia', 'Zimbabwe'
  ];

  return (
    <div className="min-h-screen bg-[#0a0502] text-white flex flex-col">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff4e00] rounded-lg flex items-center justify-center font-bold">F</div>
            <span className="font-bold tracking-tight hidden sm:block">FUTURAPATH</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
              <select value={profile.country || 'Global'} onChange={(e) => handleProfileUpdate({ country: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] sm:text-xs text-gray-300 outline-none focus:ring-1 focus:ring-[#ff4e00] max-w-[80px] sm:max-w-none">
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label={t('dashboard', language)} />
              <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare className="w-4 h-4" />} label={t('advisor', language)} />
              <NavButton active={activeTab === 'economy'} onClick={() => setActiveTab('economy')} icon={<TrendingUp className="w-4 h-4" />} label="Economy" />
              <NavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={<Briefcase className="w-4 h-4" />} label="Jobs" />
              <NavButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Newspaper className="w-4 h-4" />} label="News" />
              <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon className="w-4 h-4" />} label={t('account', language)} />
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-white transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-24 sm:pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Dashboard profile={profile} language={language} />
            </motion.div>
          )}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]">
              <Chat profile={profile} language={language} />
            </motion.div>
          )}
          {activeTab === 'economy' && (
            <motion.div key="economy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <EconomyTab country={profile.country || 'Global'} language={language} />
            </motion.div>
          )}
          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <JobsTab profile={profile} language={language} />
            </motion.div>
          )}
          {activeTab === 'news' && (
            <motion.div key="news" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <NewsTab language={language} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Account profile={profile} onUpdate={handleProfileUpdate} language={language} onLanguageChange={setLanguage} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-6 h-6" />} label={t('home', language)} />
          <MobileNavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare className="w-6 h-6" />} label={t('advisor', language)} />
          <MobileNavButton active={activeTab === 'economy'} onClick={() => setActiveTab('economy')} icon={<TrendingUp className="w-6 h-6" />} label="Economy" />
          <MobileNavButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} icon={<Briefcase className="w-6 h-6" />} label="Jobs" />
          <MobileNavButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={<Newspaper className="w-6 h-6" />} label="News" />
          <MobileNavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon className="w-6 h-6" />} label={t('account', language)} />
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${active ? 'bg-[#ff4e00]/10 text-[#ff4e00] font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="text-sm hidden md:block">{label}</span>
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#ff4e00]' : 'text-gray-500'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
