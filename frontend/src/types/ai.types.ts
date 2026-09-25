export interface JobMatchAnalysis {
  matchPercentage: number;
  matchLevel: "Strong Match" | "Good Match" | "Developing Match" | string;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface GenerateCoverLetterRequest {
  jobId: number;
  tone?: "Professional" | "Confident" | "Enthusiastic";
  customHighlights?: string;
}

export interface GenerateCoverLetterResponse {
  coverLetter: string;
  keyPointsAddressed: string[];
}

export interface GenerateJobDescriptionRequest {
  jobTitle: string;
  experienceLevel: "Entry" | "Mid" | "Senior" | "Lead" | string;
  workplaceType?: "Onsite" | "Remote" | "Hybrid" | string;
  industry?: string;
  keySkillsHint?: string;
}

export interface GeneratedJobDescription {
  description: string;
  responsibilities: string;
  requirements: string;
  suggestedSkills: string;
  benefits?: string;
}

export interface OptimizeProfileRequest {
  bio?: string;
  currentSkills?: string;
  targetJobTitle?: string;
}

export interface OptimizeProfileResponse {
  enhancedBio: string;
  suggestedHeadline: string;
  extractedSkills: string[];
  improvementTips: string[];
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "model";
  content: string;
  timestamp?: string;
}

export interface ChatRecommendedJob {
  id: number;
  title: string;
  companyName: string;
  location: string;
  workplaceType: string;
  salaryRange?: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: { role: string; content: string }[];
}

export interface ChatResponse {
  reply: string;
  suggestedPrompts: string[];
  recommendedJobs: ChatRecommendedJob[];
}
