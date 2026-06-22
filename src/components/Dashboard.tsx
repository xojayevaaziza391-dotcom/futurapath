import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Recommendation, CareerPrediction } from '../types';
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from '../firebase';
import { generateRecommendations, getMarketPredictions, analyzeTrends, getUniversityInfo, getCareerDetails, analyzeSkillGap } from '../services/gemini';
import { speakText } from '../services/ttsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, RefreshCw, Loader2, BarChart2, GraduationCap, Volume2, X, MapPin, ExternalLink, Award, Briefcase, TrendingDown, Target, Wand2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/translations';
import { getCountryFlag } from '../lib/languages';

interface DashboardProps {
  profile: UserProfile;
  language: string;
}

export default function Dashboard({ profile, language }: DashboardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rawMarketTrends, setRawMarketTrends] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [trendAnalysis, setTrendAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Recommendation | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{[key: string]: boolean}>({});
  const [selectedUniversityName, setSelectedUniversityName] = useState<string | null>(null);
  const [universityData, setUniversityData] = useState<any>(null);
  const [isLoadingUni, setIsLoadingUni] = useState(false);
  const [selectedCareerTrend, setSelectedCareerTrend] = useState<string | null>(null);
  const [careerInsightData, setCareerInsightData] = useState<any>(null);
  const [isLoadingCareerInsight, setIsLoadingCareerInsight] = useState(false);

  // Skills Gap Analyzer state
  const [skillInput, setSkillInput] = useState('');
  const [currentSkillsList, setCurrentSkillsList] = useState<string[]>([]);
  const [skillGapResult, setSkillGapResult] = useState<any>(null);
  const [isAnalyzingSkills, setIsAnalyzingSkills] = useState(false);
  const lastRegenTriggerRef = useRef<string | null>(null);
  const marketTrends = React.useMemo(() => {
    if (rawMarketTrends.length === 0) return [];
    const years = rawMarketTrends[0].data.map((d: any) => d.year);
    return years.map((year: number) => {
      const entry: any = { year };
      rawMarketTrends.forEach((career: any) => {
        const yearData = career.data.find((d: any) => d.year === year);
        entry[career.name] = yearData ? yearData.score : 0;
      });
      return entry;
    });
  }, [rawMarketTrends]);

  const currentCountry = profile.country || 'Global';

  useEffect(() => {
    async function fetchUniInfo() {
      if (!selectedUniversityName) { setUniversityData(null); return; }
      setIsLoadingUni(true);
      try {
        const data = await getUniversityInfo(selectedUniversityName, language);
        setUniversityData(data);
      } catch (error) {
        console.error("Error fetching uni info:", error);
      } finally {
        setIsLoadingUni(false);
      }
    }
    fetchUniInfo();
  }, [selectedUniversityName, language]);

  useEffect(() => {
    async function fetchCareerInfo() {
      if (!selectedCareerTrend) { setCareerInsightData(null); return; }
      setIsLoadingCareerInsight(true);
      try {
        const data = await getCareerDetails(selectedCareerTrend, language);
        setCareerInsightData(data);
      } catch (error) {
        console.error("Error fetching career info:", error);
      } finally {
        setIsLoadingCareerInsight(false);
      }
    }
    fetchCareerInfo();
  }, [selectedCareerTrend, language]);

  useEffect(() => {
    const q = query(collection(db, 'users', profile.uid, 'recommendations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recommendation));
      setRecommendations(recs);
      if (recs.length === 0 && !isGenerating) handleGenerateRecs();
    });
    return unsubscribe;
  }, [profile.uid]);

  useEffect(() => {
    if (recommendations.length === 0 || isGenerating) return;

    const latestRec = recommendations[0];
    const profileUpdatedSeconds = profile.updatedAt?.seconds ?? null;
    const recCreatedSeconds = latestRec.createdAt?.seconds ?? null;

    if (profileUpdatedSeconds === null || recCreatedSeconds === null) return;

    const needsRegen = profileUpdatedSeconds > recCreatedSeconds + 5 || latestRec.language !== language;
    if (!needsRegen) return;

    const triggerKey = `${profileUpdatedSeconds}_${language}`;
    if (lastRegenTriggerRef.current === triggerKey) return;

    lastRegenTriggerRef.current = triggerKey;
    handleGenerateRecs();
  }, [profile.updatedAt, recommendations, isGenerating, language]);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoadingTrends(true);
      setTrendAnalysis(null);
      try {
        const data = await getMarketPredictions(currentCountry, language);
        setRawMarketTrends(data.careers);
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setIsLoadingTrends(false);
      }
    };
    fetchTrends();
  }, [currentCountry, language]);

  useEffect(() => {
    if (rawMarketTrends.length > 0 && !trendAnalysis && !isAnalyzing && !isLoadingTrends) {
      handleAnalyzeTrends();
    }
  }, [rawMarketTrends, trendAnalysis, isAnalyzing, isLoadingTrends]);

  const handleGenerateRecs = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const recs = await generateRecommendations(profile, language);
      for (const rec of recs) {
        await addDoc(collection(db, 'users', profile.uid, 'recommendations'), {
          ...rec, uid: profile.uid, language, createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    if (rawMarketTrends.length === 0) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeTrends(rawMarketTrends, language, currentCountry);
      setTrendAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing trends:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openRoadmap = (rec: Recommendation) => {
    setSelectedRoadmap(rec);
    setCurrentSkillsList(profile.skills || []);
    setSkillGapResult(null);
    setSkillInput('');
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !currentSkillsList.includes(skill)) {
      setCurrentSkillsList(prev => [...prev, skill]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setCurrentSkillsList(prev => prev.filter(s => s !== skill));
  };

  const handleAnalyzeSkillGap = async () => {
    if (!selectedRoadmap) return;
    setIsAnalyzingSkills(true);
    setSkillGapResult(null);
    try {
      const result = await analyzeSkillGap(selectedRoadmap.careerName, currentSkillsList, language);
      setSkillGapResult(result);
    } catch (error) {
      console.error('Error analyzing skill gap:', error);
    } finally {
      setIsAnalyzingSkills(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('futureDashboard', language)}</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1 flex items-center gap-2">
            <span>{t('personalizedForecast', language)}</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-lg border border-white/10 text-white font-medium">
              <img src={getCountryFlag(currentCountry)} alt={currentCountry} className="w-4 h-3 object-cover rounded-sm shadow-sm" />
              {currentCountry}
            </span>
          </p>
        </div>
        <button onClick={handleGenerateRecs} disabled={isGenerating} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff4e00] hover:bg-[#ff6a2a] rounded-2xl font-bold transition-all disabled:opacity-50 w-full sm:w-auto">
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          <span className="text-sm sm:text-base">{t('updateRecommendations', language)}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white/5 rounded-3xl border border-white/10 p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff4e00]" />
              <h3 className="font-bold text-base sm:text-lg leading-tight">{t('careerDemandForecast', language)}</h3>
            </div>
            <button onClick={handleAnalyzeTrends} disabled={isAnalyzing || isLoadingTrends} className="text-[10px] sm:text-xs text-[#ff4e00] font-bold uppercase tracking-widest bg-[#ff4e00]/10 px-3 py-1.5 rounded-lg hover:bg-[#ff4e00]/20 transition-all flex items-center gap-2">
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart2 className="w-3 h-3" />}
              {t('aiAnalysis', language)}
            </button>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            {isLoadingTrends ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#ff4e00] animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrends}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4e00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff4e00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="year" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }} itemStyle={{ fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  {marketTrends.length > 0 && Object.keys(marketTrends[0]).filter(k => k !== 'year').map((career, idx) => (
                    <Area key={career} type="monotone" dataKey={career} stroke={idx === 0 ? '#ff4e00' : `hsl(${idx * 40}, 70%, 50%)`} fillOpacity={1} fill="url(#colorScore)" />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          {trendAnalysis && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-[#ff4e00]/5 border border-[#ff4e00]/20 rounded-2xl text-sm text-gray-300 leading-relaxed">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#ff4e00] font-bold uppercase text-xs">
                  <Sparkles className="w-4 h-4" />{t('aiTrendInsight', language)}
                </div>
                <button onClick={() => speakText(trendAnalysis, language)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-[#ff4e00] transition-all">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {trendAnalysis}
            </motion.div>
          )}
        </div>

        <div className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#ff4e00] font-bold uppercase text-xs">
              <Target className="w-4 h-4" />{t('emergingProfessions', language)}
            </div>
            <div className="space-y-2">
              {rawMarketTrends.length > 0 && rawMarketTrends.map((career: any, i: number) => (
                <button key={career.name} onClick={() => setSelectedCareerTrend(career.name)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#ff4e00]/30 transition-all group text-left">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${['bg-[#ff4e00]', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'][i % 5]}`} />
                    <span className="text-xs font-bold group-hover:text-white text-gray-300 transition-colors uppercase tracking-tight truncate max-w-[120px]">{career.name}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-[#ff4e00] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />{t('marketRiskAnalysis', language)}
            </h3>
            <div className="space-y-4">
              <RiskItem label={t('aiAutomationRisk', language)} level={t('high', language)} color="text-red-500" />
              <RiskItem label={t('remoteWorkStability', language)} level={t('medium', language)} color="text-yellow-500" />
              <RiskItem label={t('greenTechGrowth', language)} level={t('lowRisk', language)} color="text-green-500" />
              <p className="text-xs text-gray-400 italic pt-4">{t('marketRiskAnalysisDesc', language)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#ff4e00]" />
          <h2 className="text-2xl font-bold">{t('topFutureMatches', language)}</h2>
        </div>
        {recommendations.length === 0 && !isGenerating ? (
          <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/20">
            <p className="text-gray-400 mb-4">{t('noRecsYet', language)}</p>
            <button onClick={handleGenerateRecs} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">{t('generateNow', language)}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            <AnimatePresence mode="popLayout">
              {isGenerating ? (
                [1, 2, 3].map((_, i) => (
                  <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-4 animate-pulse">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                      <div className="w-20 h-4 bg-white/10 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-3/4 h-6 bg-white/10 rounded-lg" />
                      <div className="w-full h-20 bg-white/10 rounded-xl" />
                    </div>
                  </motion.div>
                ))
              ) : (
                recommendations.slice(0, 3).map((rec, i) => (
                  <motion.div key={rec.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-4 hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-[#ff4e00]/20 rounded-2xl flex items-center justify-center text-[#ff4e00] font-bold text-xl">{rec.matchScore}%</div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-green-500 font-bold uppercase tracking-widest">{t('highMatch', language)}</div>
                        <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${rec.riskLevel === 'low' ? 'border-green-500 text-green-500' : rec.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}>
                          {t(rec.riskLevel || 'low', language)} {t('risk', language)}
                        </div>
                        <div className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-gray-500 text-gray-400">{rec.futureDemandTrend || t('stable', language)}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold group-hover:text-[#ff4e00] transition-colors">{rec.careerName}</h4>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-3">{rec.reasoning}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-500 uppercase">{t('skillGaps', language)}</div>
                        <div className="flex flex-wrap gap-2">
                          {rec.skillGap?.map(skill => (<span key={skill} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] border border-white/10">{skill}</span>))}
                        </div>
                      </div>
                      {rec.suggestedUniversities && rec.suggestedUniversities.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-[#ff4e00] uppercase flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />{t('suggestedUniversities', language)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {rec.suggestedUniversities.map(uni => (<span key={uni} className="px-2 py-1 bg-[#ff4e00]/5 rounded-lg text-[10px] border border-[#ff4e00]/10 text-gray-300">{uni}</span>))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-gray-500 uppercase">{t('futureRoadmap', language)}</div>
                        <div className="space-y-1">
                          {rec.roadmap?.slice(0, 3).map((step: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-300">
                              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px]">{idx + 1}</div>
                              <span>{typeof step === 'string' ? step : step.step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => openRoadmap(rec)} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                      {t('viewRoadmap', language)}<ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Roadmap Modal */}
      <AnimatePresence>
        {selectedRoadmap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#0f0a07] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff4e00]/20 rounded-xl flex items-center justify-center text-[#ff4e00]"><Sparkles className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{selectedRoadmap.careerName}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{t('futureRoadmap', language)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRoadmap(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* Progress Bar */}
                {(() => {
                  const total = selectedRoadmap.roadmap?.length || 0;
                  const done = selectedRoadmap.roadmap?.filter((_: any, i: number) => completedSteps[`${selectedRoadmap.id}-${i}`]).length || 0;
                  const pct = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{t('progress', language)}</span>
                        <span className="text-[#ff4e00] font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff4e00] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
                {/* Steps */}
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#ff4e00] to-transparent opacity-20" />
                  <div className="space-y-6">
                    {selectedRoadmap.roadmap?.map((item: any, idx: number) => {
                      const stepKey = `${selectedRoadmap.id}-${idx}`;
                      const isDone = completedSteps[stepKey];
                      const step = typeof item === 'string' ? item : item.step;
                      const timeEstimate = typeof item === 'object' ? item.timeEstimate : null;
                      const courseLink = typeof item === 'object' ? item.courseLink : null;
                      return (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={idx} className="relative pl-12">
                          <div className={`absolute left-0 top-0 w-8 h-8 rounded-xl border flex items-center justify-center font-bold shadow-xl z-10 transition-all cursor-pointer ${isDone ? 'bg-[#ff4e00] border-[#ff4e00] text-white' : 'bg-white/5 border-white/10 text-[#ff4e00]'}`} onClick={() => setCompletedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }))}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div className={`bg-white/5 border rounded-2xl p-4 transition-all ${isDone ? 'border-[#ff4e00]/30 opacity-60' : 'border-white/10 hover:border-[#ff4e00]/30'}`}>
                            <p className={`text-sm sm:text-base leading-relaxed font-medium ${isDone ? 'line-through text-gray-500' : 'text-gray-200'}`}>{step}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {timeEstimate && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">⏱ {timeEstimate}</span>}
                              {courseLink && <a href={courseLink} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 px-2 py-0.5 rounded-full text-[#ff4e00] transition-all">📚 {t('freeCourse', language)}</a>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Skills Gap Analyzer */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[#ff4e00] font-bold uppercase text-xs">
                    <Wand2 className="w-4 h-4" />
                    {t('skillGapAnalyzer', language)}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">{t('yourCurrentSkills', language)}</label>
                    <div className="flex flex-wrap gap-2">
                      {currentSkillsList.map((skill) => (
                        <span key={skill} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg text-xs text-gray-200">
                          {skill}
                          <button onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                        placeholder={t('addSkill', language)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#ff4e00]"
                      />
                      <button onClick={handleAddSkill} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyzeSkillGap}
                    disabled={isAnalyzingSkills}
                    className="w-full py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2a] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isAnalyzingSkills ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {t('analyzeSkillGap', language)}
                  </button>

                  {skillGapResult && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{t('skillMatch', language)}</span>
                          <span className="text-[#ff4e00] font-bold">{skillGapResult.matchPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#ff4e00] rounded-full transition-all duration-500" style={{ width: `${skillGapResult.matchPercent}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {skillGapResult.missingSkills?.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-white">{item.skill}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-500/10 text-red-400' : item.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                                {t(item.priority, language)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{item.reason}</p>
                            {item.courseLink && (
                              <a href={item.courseLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 px-2 py-0.5 rounded-full text-[#ff4e00] transition-all">
                                📚 {t('freeCourse', language)}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Pro Tip */}
                <div className="p-4 bg-[#ff4e00]/5 border border-[#ff4e00]/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#ff4e00] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase text-[#ff4e00] mb-1">{t('proTip', language)}</h4>
                      <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed italic">
                        {selectedRoadmap.proTip || t('proTipDefault', language)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {selectedRoadmap.suggestedUniversities && selectedRoadmap.suggestedUniversities.length > 0 && (
                <div className="p-6 bg-white/5 border-t border-white/10">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />{t('suggestedUniversities', language)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoadmap.suggestedUniversities.map((uni: string) => (
                      <button key={uni} onClick={() => setSelectedUniversityName(uni)} className="px-3 py-1.5 bg-white/5 hover:bg-[#ff4e00]/10 hover:border-[#ff4e00]/30 rounded-lg text-xs border border-white/10 font-medium transition-all">{uni}</button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Career Detail Modal */}
      <AnimatePresence>
        {selectedCareerTrend && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0f0a07] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-sm uppercase tracking-widest text-[#ff4e00]">{t('careerInsights', language)}</h3>
                <button onClick={() => { setSelectedCareerTrend(null); setCareerInsightData(null); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingCareerInsight ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-white/10 border-t-[#ff4e00] rounded-full animate-spin" />
                      <Briefcase className="w-6 h-6 text-[#ff4e00] absolute inset-0 m-auto" />
                    </div>
                    <p className="text-sm text-gray-400 animate-pulse">{t('careerInfoLoading', language)}</p>
                  </div>
                ) : careerInsightData ? (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{careerInsightData.name}</h2>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><TrendingUp className="w-3.5 h-3.5 text-green-500" />{careerInsightData.demandLevel} {t('demand', language)}</div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><Target className="w-3.5 h-3.5 text-yellow-500" />{careerInsightData.salaryRange}</div>
                      </div>
                    </div>
                    <div className="aspect-video w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 relative group">
                      <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800" alt="Career Growth" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a07] to-transparent" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('overview', language)}</h4>
                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{careerInsightData.description}</p>
                      </div>
                      <div className="p-4 bg-[#ff4e00]/5 border border-[#ff4e00]/20 rounded-2xl">
                        <h4 className="text-xs font-bold text-[#ff4e00] uppercase mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" />{t('futureGrowth', language)}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{careerInsightData.futureGrowth}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#ff4e00]" />{t('skillsRequired', language)}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {careerInsightData.skills.map((skill: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-300 font-medium">{skill}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <AlertTriangle className="w-10 h-10 mb-2 opacity-20" /><p>{t('infoUnavailable', language)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* University Detail Modal */}
      <AnimatePresence>
        {selectedUniversityName && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0f0a07] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-sm uppercase tracking-widest text-[#ff4e00]">{t('universityDetails', language)}</h3>
                <button onClick={() => { setSelectedUniversityName(null); setUniversityData(null); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoadingUni ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-white/10 border-t-[#ff4e00] rounded-full animate-spin" />
                      <GraduationCap className="w-6 h-6 text-[#ff4e00] absolute inset-0 m-auto" />
                    </div>
                    <p className="text-sm text-gray-400 animate-pulse">{t('universityInfoLoading', language)}</p>
                  </div>
                ) : universityData ? (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{universityData.name}</h2>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><MapPin className="w-3.5 h-3.5 text-[#ff4e00]" />{universityData.location}</div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><Award className="w-3.5 h-3.5 text-yellow-500" />{universityData.rank}</div>
                      </div>
                    </div>
                    <div className="aspect-video w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 relative group">
                      <img src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800" alt="University Campus" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a07] to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                        <Sparkles className="w-3 h-3 text-[#ff4e00]" />
                        <span className="text-[10px] uppercase font-bold text-white/70">{t('aiImage', language)}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{universityData.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {universityData.keyFeatures.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-6 h-6 rounded-lg bg-[#ff4e00]/10 flex items-center justify-center text-[#ff4e00] shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                          <span className="text-xs text-gray-300 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <a href={universityData.searchLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#ff4e00]/10">
                      {t('visitWebsite', language)}<ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                    <AlertTriangle className="w-10 h-10 mb-2 opacity-20" /><p>{t('infoUnavailable', language)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RiskItem({ label, level, color }: { label: string, level: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{level}</span>
    </div>
  );
}
