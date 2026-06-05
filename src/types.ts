export type UserType = 'pupil' | 'student' | 'professional';

export interface UserProfile {
  uid: string;
  email: string;
  userType: UserType;
  country: string;
  interests: string[];
  skills: string[];
  academicSubjects: string[];
  purpose: string;
  currentUniversity?: string;
  behavioralData?: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

export interface CareerPrediction {
  id?: string;
  careerName: string;
  demandScore: number;
  year: number;
  growthRate?: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
}

export interface Recommendation {
  id?: string;
  uid: string;
  careerName: string;
  matchScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning?: string;
  roadmap?: string[];
  skillGap?: string[];
  futureDemandTrend?: string;
  suggestedUniversities?: string[];
  proTip?: string;
  language?: string;
  createdAt: any;
}

export interface ChatMessage {
  id?: string;
  uid: string;
  role: 'user' | 'assistant';
  content: string;
  detectedLanguage?: string | null;
  timestamp: any;
}
