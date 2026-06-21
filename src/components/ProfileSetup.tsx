import React, { useState } from 'react';
import { UserProfile, UserType } from '../types';
import { ChevronRight, Brain, Target, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { t } from '../lib/translations';
import { SUPPORTED_LANGUAGES, getCountryFlag, getFlagUrl } from '../lib/languages';

interface ProfileSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  initialData?: UserProfile;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function ProfileSetup({ onComplete, initialData, language, onLanguageChange }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(initialData?.userType || 'pupil');
  const [purpose, setPurpose] = useState<string>(initialData?.purpose || 'careerChange');
  const [currentUniversity, setCurrentUniversity] = useState<string>(initialData?.currentUniversity || '');
  const [country, setCountry] = useState<string>(initialData?.country || 'Global');
  const [interests, setInterests] = useState<string>(initialData?.interests.join(', ') || '');
  const [skills, setSkills] = useState<string>(initialData?.skills.join(', ') || '');
  const [subjects, setSubjects] = useState<string>(initialData?.academicSubjects.join(', ') || '');

  const totalSteps = 8;

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
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const filteredCountries = countries.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleNext = () => {
    // Skip university step for pupils
    if (step === 4 && userType === 'pupil') {
      setStep(6);
      return;
    }

    if (step < totalSteps) setStep(step + 1);
    else {
      onComplete({
        userType,
        purpose,
        currentUniversity: userType !== 'pupil' ? currentUniversity : undefined,
        country,
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        academicSubjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
      });
    }
  };

  const handleBack = () => {
    if (step === 6 && userType === 'pupil') {
      setStep(4);
      return;
    }
    setStep(step - 1);
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-12 px-4 text-white">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#ff4e00]">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">{t('step', language)} {step} {t('of', language)} {totalSteps}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">{t('buildProfileTitle', language)}</h2>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#ff4e00]" 
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[250px] sm:min-h-[300px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('selectLanguageTitle', language)}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => onLanguageChange(l.code)}
                    className={`p-4 sm:p-5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                      language === l.code 
                        ? 'bg-[#ff4e00]/10 border-[#ff4e00] ring-1 ring-[#ff4e00]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <img
                      src={getFlagUrl(l.flagCode)}
                      alt={l.name}
                      width={32}
                      height={24}
                      loading="lazy"
                      className="w-8 h-6 object-cover rounded shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold truncate">{l.name}</div>
                      <div className="text-xs text-gray-400">{l.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('whoAreYouTitle', language)}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {(['pupil', 'student', 'professional'] as UserType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setUserType(type)}
                    className={`p-4 sm:p-6 rounded-2xl border text-left transition-all ${
                      userType === type 
                        ? 'bg-[#ff4e00]/10 border-[#ff4e00] ring-1 ring-[#ff4e00]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold capitalize text-sm sm:text-base">{t(type, language)}</div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {t(`${type}Desc`, language)}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('appPurposeTitle', language)}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {(['careerChange', 'universityChoice', 'skillDevelopment']).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPurpose(p)}
                    className={`p-4 sm:p-6 rounded-2xl border text-left transition-all ${
                      purpose === p 
                        ? 'bg-[#ff4e00]/10 border-[#ff4e00] ring-1 ring-[#ff4e00]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold capitalize text-sm sm:text-base">{t(p, language)}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('locationTitle', language)}</h3>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder={t('searchCountry', language)}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#ff4e00] mb-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCountries.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCountry(c)}
                    className={`p-3 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all text-left flex items-center gap-2.5 ${
                      country === c 
                        ? 'bg-[#ff4e00]/10 border-[#ff4e00] text-[#ff4e00] font-bold' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    <img
                      src={getCountryFlag(c)}
                      alt={c}
                      width={24}
                      height={16}
                      loading="lazy"
                      className="w-6 h-4 object-cover rounded-sm shadow-sm flex-shrink-0"
                    />
                    <span className="truncate">{c}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 italic text-sm">
                    {t('noCountriesFound', language)}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('currentUniTitle', language)}</h3>
              </div>
              <input 
                type="text"
                value={currentUniversity}
                onChange={(e) => setCurrentUniversity(e.target.value)}
                placeholder={t('uniPlaceholder', language)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#ff4e00] outline-none"
              />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('interestsTitle', language)}</h3>
              </div>
              <textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={t('interestsPlaceholder', language)}
                className="w-full h-32 sm:h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#ff4e00] outline-none resize-none"
              />
              <p className="text-xs sm:text-sm text-gray-400 italic">{t('separateCommas', language)}</p>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('skillsTitle', language)}</h3>
              </div>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder={t('skillsPlaceholder', language)}
                className="w-full h-32 sm:h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#ff4e00] outline-none resize-none"
              />
              <p className="text-xs sm:text-sm text-gray-400 italic">{t('separateCommas', language)}</p>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 text-lg sm:text-xl font-medium">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4e00]" />
                <h3>{t('subjectsTitle', language)}</h3>
              </div>
              <textarea
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder={t('subjectsPlaceholder', language)}
                className="w-full h-32 sm:h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#ff4e00] outline-none resize-none"
              />
              <p className="text-xs sm:text-sm text-gray-400 italic">{t('separateCommas', language)}</p>
            </motion.div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 sm:pt-8">
          {step > 1 && (
            <button onClick={handleBack} className="text-gray-400 hover:text-white font-medium text-sm sm:text-base">
              {t('back', language)}
            </button>
          )}
          <div className="flex-1" />
          <button 
            onClick={handleNext}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-2xl font-bold flex items-center gap-2 transition-all text-sm sm:text-base"
          >
            {step === totalSteps ? t('completeProfile', language) : t('nextStep', language)}
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
