import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  BookOpen,
  FileText,
  Timer,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const mobileItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'schedule', label: 'Horario', icon: Clock },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'subjects', label: 'Materias', icon: BookOpen },
    { id: 'stats', label: 'Stats', icon: BarChart3 }
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
      <div className="flex items-center justify-around py-2 px-1 rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-2xl shadow-indigo-950/20 backdrop-blur-2xl">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105 bg-indigo-50/70 dark:bg-indigo-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
