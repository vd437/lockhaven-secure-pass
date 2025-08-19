export interface PasswordEntry {
  id: string;
  title: string;
  password: string;
  notes?: string;
  website?: string;
  username?: string;
  strength: PasswordStrength;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  count: number;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordAnalysis {
  score: number;
  strength: PasswordStrength;
  feedback: string[];
  suggestions: string[];
}

export interface ActivityLog {
  id: string;
  type: 'generate' | 'save' | 'edit' | 'delete' | 'analyze';
  description: string;
  timestamp: Date;
}

export interface AppStats {
  totalPasswords: number;
  generatedCount: number;
  averageStrength: number;
  strongPasswords: number;
  recentActivity: ActivityLog[];
}