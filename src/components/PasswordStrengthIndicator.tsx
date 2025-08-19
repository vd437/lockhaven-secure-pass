import { PasswordStrength } from '@/types/password';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  score?: number;
  className?: string;
  showText?: boolean;
}

const strengthConfig = {
  weak: {
    label: 'ضعيف',
    icon: ShieldX,
    color: 'strength-weak',
    textColor: 'text-red-400'
  },
  fair: {
    label: 'متوسط',
    icon: ShieldAlert,
    color: 'strength-fair',
    textColor: 'text-yellow-400'
  },
  good: {
    label: 'جيد',
    icon: Shield,
    color: 'strength-good',
    textColor: 'text-lime-400'
  },
  strong: {
    label: 'قوي',
    icon: ShieldCheck,
    color: 'strength-strong',
    textColor: 'text-green-400'
  }
};

export const PasswordStrengthIndicator = ({ 
  strength, 
  score = 0, 
  className,
  showText = true 
}: PasswordStrengthIndicatorProps) => {
  const config = strengthConfig[strength];
  const Icon = config.icon;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Icon className={cn("h-4 w-4", config.textColor)} />
        {showText && (
          <span className={cn("text-sm font-medium", config.textColor)}>
            {config.label}
          </span>
        )}
      </div>
      
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", config.color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      
      {score > 0 && (
        <span className="text-xs text-muted-foreground min-w-[2rem]">
          {score}%
        </span>
      )}
    </div>
  );
};