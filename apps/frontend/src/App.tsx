import React, { useEffect, useState } from 'react';
import { Sidebar, navItems } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ContextualChatDrawer } from './components/chat/ContextualChatDrawer';
import { DashboardHome } from './pages/DashboardHome';
import { GenericAnalyticsPage } from './pages/GenericAnalyticsPage';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleTriggerChat = (prompt: string) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true);
  };

  const currentItem = navItems.find((i) => i.id === activeTab) || navItems[0];

  return (
    <div className="flex min-h-screen bg-background text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' ? (
            <DashboardHome onTriggerChat={handleTriggerChat} />
          ) : (
            <GenericAnalyticsPage
              pageId={activeTab}
              title={currentItem.label}
              onTriggerChat={handleTriggerChat}
            />
          )}
        </main>
      </div>

      {/* Contextual AI Chatbot Drawer */}
      <ContextualChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeTab={activeTab}
        triggeredPrompt={pendingPrompt}
        onConsumePrompt={() => setPendingPrompt(null)}
      />
    </div>
  );
}

export default App;
