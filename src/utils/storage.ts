import { PasswordEntry, ActivityLog, AppStats } from '@/types/password';

const PASSWORDS_KEY = 'lockvault_passwords';
const ACTIVITY_KEY = 'lockvault_activity';
const STATS_KEY = 'lockvault_stats';

export const savePasswords = (passwords: PasswordEntry[]): void => {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
};

export const loadPasswords = (): PasswordEntry[] => {
  try {
    const stored = localStorage.getItem(PASSWORDS_KEY);
    if (!stored) return [];
    
    const passwords = JSON.parse(stored);
    return passwords.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading passwords:', error);
    return [];
  }
};

export const saveActivity = (activities: ActivityLog[]): void => {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
};

export const loadActivity = (): ActivityLog[] => {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    if (!stored) return [];
    
    const activities = JSON.parse(stored);
    return activities.map((a: any) => ({
      ...a,
      timestamp: new Date(a.timestamp)
    }));
  } catch (error) {
    console.error('Error loading activity:', error);
    return [];
  }
};

export const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>): void => {
  const activities = loadActivity();
  const newActivity: ActivityLog = {
    ...activity,
    id: Date.now().toString(),
    timestamp: new Date()
  };
  
  activities.unshift(newActivity);
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.splice(100);
  }
  
  saveActivity(activities);
};

export const saveStats = (stats: AppStats): void => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const loadStats = (): AppStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) {
      return {
        totalPasswords: 0,
        generatedCount: 0,
        averageStrength: 0,
        strongPasswords: 0,
        recentActivity: []
      };
    }
    
    const stats = JSON.parse(stored);
    return {
      ...stats,
      recentActivity: stats.recentActivity.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }))
    };
  } catch (error) {
    console.error('Error loading stats:', error);
    return {
      totalPasswords: 0,
      generatedCount: 0,
      averageStrength: 0,
      strongPasswords: 0,
      recentActivity: []
    };
  }
};

export const updateStats = (): void => {
  const passwords = loadPasswords();
  const activities = loadActivity();
  
  const strengthValues = { weak: 1, fair: 2, good: 3, strong: 4 };
  const averageStrength = passwords.length > 0 
    ? passwords.reduce((sum, p) => sum + strengthValues[p.strength], 0) / passwords.length
    : 0;
    
  const strongPasswords = passwords.filter(p => p.strength === 'strong').length;
  const generatedCount = activities.filter(a => a.type === 'generate').length;
  
  const stats: AppStats = {
    totalPasswords: passwords.length,
    generatedCount,
    averageStrength,
    strongPasswords,
    recentActivity: activities.slice(0, 10)
  };
  
  saveStats(stats);
};
