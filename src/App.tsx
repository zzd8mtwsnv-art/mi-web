import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickAddModal } from './components/layout/QuickAddModal';
import { NotificationsModal } from './components/layout/NotificationsModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { AuthScreen } from './components/auth/AuthScreen';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { TasksView } from './components/tasks/TasksView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { ExamsView } from './components/exams/ExamsView';
import { FocusView } from './components/focus/FocusView';
import { PlannerView } from './components/planner/PlannerView';
import { GradesView } from './components/grades/GradesView';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { currentUser, activeView, isProfileModalOpen, setIsProfileModalOpen } = useApp();

  // If no user is logged in, show Auth / Welcome Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'schedule':
        return <ScheduleView />;
      case 'tasks':
        return <TasksView />;
      case 'subjects':
        return <SubjectsView />;
      case 'exams':
        return <ExamsView />;
      case 'focus':
        return <FocusView />;
      case 'planner':
        return <PlannerView />;
      case 'grades':
        return <GradesView />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#080d1a] bg-mesh-light dark:bg-mesh-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Desktop Liquid Glass Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Floating Top Header Bar */}
        <Header />

        {/* Dynamic Page View */}
        <main className="flex-1 px-4 sm:px-8 pt-4 sm:pt-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock */}
      <MobileNav />

      {/* Global Modals */}
      <CommandPalette />
      <QuickAddModal />
      <NotificationsModal />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}