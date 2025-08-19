import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { PasswordManager } from '@/components/PasswordManager';
import { PasswordAnalyzer } from '@/components/PasswordAnalyzer';
import { Dashboard } from '@/components/Dashboard';
import { updateStats } from '@/utils/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generator');

  useEffect(() => {
    updateStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'generator':
        return <PasswordGenerator />;
      case 'manager':
        return <PasswordManager />;
      case 'analyzer':
        return <PasswordAnalyzer />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <PasswordGenerator />;
    }
  };

  return (
    <div className="min-h-screen animated-bg particle-bg">
      <div className="container mx-auto px-4 py-8">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
