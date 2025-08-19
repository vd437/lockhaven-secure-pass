import { PasswordGeneratorOptions, PasswordAnalysis, PasswordStrength } from '@/types/password';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;<>.';

export const generatePassword = (options: PasswordGeneratorOptions): string => {
  let charset = '';
  
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;
  
  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
  }
  
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(char => !AMBIGUOUS_CHARS.includes(char)).join('');
  }
  
  if (charset.length === 0) {
    throw new Error('لا يمكن توليد كلمة مرور مع هذه الخيارات');
  }
  
  let password = '';
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

export const generateMultiplePasswords = (options: PasswordGeneratorOptions): string[] => {
  const passwords: string[] = [];
  for (let i = 0; i < options.count; i++) {
    passwords.push(generatePassword(options));
  }
  return passwords;
};

export const analyzePassword = (password: string): PasswordAnalysis => {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
    feedback.push('كلمة المرور قصيرة نسبياً');
    suggestions.push('استخدم 12 حرف على الأقل');
  } else {
    score += 5;
    feedback.push('كلمة المرور قصيرة جداً');
    suggestions.push('استخدم 12 حرف على الأقل');
  }
  
  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  
  const varietyCount = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
  score += varietyCount * 15;
  
  if (!hasLower) suggestions.push('أضف أحرف صغيرة');
  if (!hasUpper) suggestions.push('أضف أحرف كبيرة');
  if (!hasNumbers) suggestions.push('أضف أرقام');
  if (!hasSymbols) suggestions.push('أضف رموز خاصة');
  
  // Repetition check
  const repeatedChars = password.match(/(.)\1{2,}/g);
  if (repeatedChars) {
    score -= 10;
    feedback.push('يحتوي على أحرف متكررة');
    suggestions.push('تجنب تكرار الأحرف');
  }
  
  // Sequential patterns
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    score -= 15;
    feedback.push('يحتوي على تسلسل متوقع');
    suggestions.push('تجنب الأحرف والأرقام المتتالية');
  }
  
  // Common patterns
  const commonPatterns = /(?:password|123456|qwerty|admin|login|user)/i.test(password);
  if (commonPatterns) {
    score -= 20;
    feedback.push('يحتوي على كلمات شائعة');
    suggestions.push('تجنب الكلمات الشائعة');
  }
  
  // Clamp score
  score = Math.max(0, Math.min(100, score));
  
  let strength: PasswordStrength;
  if (score >= 80) {
    strength = 'strong';
    if (feedback.length === 0) feedback.push('كلمة مرور قوية جداً!');
  } else if (score >= 60) {
    strength = 'good';
    feedback.push('كلمة مرور جيدة');
  } else if (score >= 40) {
    strength = 'fair';
    feedback.push('كلمة مرور متوسطة');
  } else {
    strength = 'weak';
    feedback.push('كلمة مرور ضعيفة');
  }
  
  return {
    score,
    strength,
    feedback,
    suggestions
  };
};