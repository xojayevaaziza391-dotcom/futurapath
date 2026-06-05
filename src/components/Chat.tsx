import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from '../firebase';
import { getCareerAdvice, detectLanguage } from '../services/gemini';
import { speakText } from '../services/ttsService';
import { Send, Bot, User, Loader2, Sparkles, Volume2, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/translations';

interface ChatProps {
  profile: UserProfile;
  language: string;
}

export default function Chat({ profile, language }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users', profile.uid, 'chat_history'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [profile.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true);

    try {
      // Detect language
      const detected = await detectLanguage(userMsg);
      const responseLanguage = (detected && detected !== 'Unknown') ? detected : language;

      // Save user message
      await addDoc(collection(db, 'users', profile.uid, 'chat_history'), {
        uid: profile.uid,
        role: 'user',
        content: userMsg,
        detectedLanguage: detected !== 'Unknown' ? detected : null,
        timestamp: serverTimestamp(),
      });

      // Get AI response
      const response = await getCareerAdvice(profile, userMsg, messages, responseLanguage);

      // Save AI message
      await addDoc(collection(db, 'users', profile.uid, 'chat_history'), {
        uid: profile.uid,
        role: 'assistant',
        content: response,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ff4e00] rounded-lg sm:rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">{t('aiCareerAdvisor', language)}</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              {t('onlinePredicting', language)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-xs text-[#ff4e00] font-bold uppercase tracking-widest bg-[#ff4e00]/10 px-2 sm:px-3 py-1 rounded-full">
          <button onClick={() => {}} className="flex items-center gap-1 cursor-default">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {t('futureProof', language)}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-4">
            <Bot className="w-10 h-10 sm:w-12 sm:h-12" />
            <p className="max-w-xs text-sm sm:text-base">{t('aiBuddy', language)}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div 
            key={msg.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-white/10' : 'bg-[#ff4e00]'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl relative group ${
                msg.role === 'user' 
                  ? 'bg-white/10 rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 rounded-tl-none'
              }`}>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {msg.role === 'user' && msg.detectedLanguage && (
                  <div className="mt-1.5 flex items-center gap-1 text-[8px] sm:text-[10px] text-gray-500 font-medium">
                    <Languages className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    <span>{t('detected', language)}: {msg.detectedLanguage}</span>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => speakText(msg.content, language)}
                    className="absolute -right-8 sm:-right-10 top-1.5 sm:top-2 p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-[#ff4e00]"
                    title="Speak"
                  >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#ff4e00] rounded-lg flex items-center justify-center">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
              </div>
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white/5 border-t border-white/10">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('askFuture', language)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:ring-2 focus:ring-[#ff4e00] transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ff4e00] hover:bg-[#ff6a2a] disabled:opacity-50 disabled:hover:bg-[#ff4e00] rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
