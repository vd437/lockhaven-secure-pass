import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dices, Shield, SearchCheck, BarChart3, Settings, Moon, Sun } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: 'generator',
    label: 'مولد كلمات المرور',
    icon: Dices,
    description: 'توليد كلمات مرور قوية'
  },
  {
    id: 'manager',
    label: 'إدارة كلمات المرور',
    icon: Shield,
    description: 'حفظ وإدارة كلمات المرور'
  },
  {
    id: 'analyzer',
    label: 'تحليل القوة',
    icon: SearchCheck,
    description: 'فحص قوة كلمات المرور'
  },
  {
    id: 'dashboard',
    label: 'لوحة القيادة',
    icon: BarChart3,
    description: 'الإحصائيات والتقارير'
  }
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <Card className="glass-card p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 lg:ml-8">
          <div className="p-3 rounded-full bg-gradient-primary">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              LockVault
            </h1>
            <p className="text-sm text-muted-foreground">مدير كلمات المرور الآمن</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                variant="ghost"
                className={cn(
                  "h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300",
                  isActive 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-glow" 
                    : "hover:bg-card/50 hover:border-border/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isActive && "animate-pulse"
                )} />
                <div className="text-center">
                  <div className="text-sm font-medium">{tab.label}</div>
                  <div className="text-xs opacity-70 hidden lg:block">{tab.description}</div>
                </div>
                {isActive && (
                  <div className="w-full h-0.5 bg-gradient-primary rounded-full mt-1" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};