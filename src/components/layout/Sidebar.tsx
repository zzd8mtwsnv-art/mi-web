import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  BookOpen,
  FileText,
  Timer,
  Sparkles,
  Award,
  BarChart3,
  Settings as SettingsIcon,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, pendingTasksCount, upcomingExamsCount, currentStreak } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'schedule', label: 'Horario', icon: Clock },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'subjects', label: 'Asignaturas', icon: BookOpen },
    { id: 'exams', label: 'Exámenes', icon: FileText, badge: upcomingExamsCount > 0 ? upcomingExamsCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'planner', label: 'Planificador', icon: Sparkles },
    { id: 'grades', label: 'Notas', icon: Award },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 p-4 z-30 select-none">
      {/* Glass Sidebar Container */}
      <div className="flex flex-col h-full rounded-3xl glass-panel p-4 overflow-hidden border border-white/60 dark:border-white/10 shadow-xl shadow-indigo-950/5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 py-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
                StudyFlow
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-500 dark:text-indigo-400">
                Bachillerato
              </span>
            </div>
          </div>

          {/* Quick Streak Pill */}
          <div
            onClick={() => setActiveView('focus')}
            title="Racha de estudio"
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{currentStreak}d</span>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm border border-indigo-500/20 dark:border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }
                `}
              >
                {/* Active left indicator light */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-glow-sm" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full text-white shadow-sm ${
                      item.badgeColor || 'bg-indigo-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-3 border-t border-slate-200/60 dark:border-white/10" />

        {/* Bottom Section: Settings */}
        <button
          onClick={() => setActiveView('settings')}
          className={`
            w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group
            ${
              activeView === 'settings'
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
            }
          `}
        >
          <SettingsIcon
            className={`w-4 h-4 transition-transform duration-200 group-hover:rotate-45 ${
              activeView === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
            }`}
          />
          <span>Ajustes</span>
        </button>
      </div>
    </aside>
  );
};
