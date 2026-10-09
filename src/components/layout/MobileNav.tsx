import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  BookOpen,
  FileText,
  Timer,
  BarChart3,
  Sparkles,
  CalendarRange,
  Target,
  Award,
  Settings,
  User,
  Menu,
  X,
  ChevronRight,
  Flame,
  Cloud
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setIsProfileModalOpen,
    currentStreak,
    pendingTasksCount,
    currentUser,
    settings
  } = useApp();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryTabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : null },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Timer }
  ];

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Inicio', desc: 'Panel de resumen diario', icon: LayoutDashboard, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' },
        { id: 'tasks', label: 'Tareas', desc: 'Entregas y deberes con filtros', icon: CheckSquare, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50' },
        { id: 'calendar', label: 'Calendario', desc: 'Vista global mensual y agenda', icon: Calendar, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' },
        { id: 'focus', label: 'Focus & Pomodoro', desc: 'Temporizadores y música', icon: Timer, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' }
      ]
    },
    {
      title: 'Académico',
      items: [
        { id: 'schedule', label: 'Horario Escolar', desc: 'Clases semanales por día', icon: Clock, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50' },
        { id: 'subjects', label: 'Asignaturas', desc: 'Materias, profesores y aulas', icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' },
        { id: 'exams', label: 'Exámenes', desc: 'Controles, temarios y cuenta atrás', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' },
        { id: 'grades', label: 'Calificaciones', desc: 'Notas con ponderación opcional', icon: Award, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50' }
      ]
    },
    {
      title: 'Planificación & Metas',
      items: [
        { id: 'planner', label: 'Planificador Inteligente', desc: 'Generador automático de estudio', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' },
        { id: 'cronograma', label: 'Cronogramas Guardados', desc: 'Hojas de ruta por franjas horarias', icon: CalendarRange, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/50' },
        { id: 'goals', label: 'Metas & Hábitos', desc: 'Objetivos diarios y semanales', icon: Target, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/50' }
      ]
    },
    {
      title: 'Rendimiento & Ajustes',
      items: [
        { id: 'stats', label: 'Estadísticas', desc: 'Métricas de estudio y rachas', icon: BarChart3, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/50' },
        { id: 'settings', label: 'Ajustes', desc: 'Tema, curso y preferencias', icon: Settings, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' }
      ]
    }
  ];

  const handleSelectView = (id: string) => {
    setActiveView(id);
    setIsMoreOpen(false);
  };

  const handleOpenProfile = () => {
    setIsMoreOpen(false);
    setIsProfileModalOpen(true);
  };

  return (
    <>
      {/* 5-Item Floating Bottom Navigation Dock */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 pb-safe">
        <div className="flex items-center justify-around py-2 px-1 rounded-3xl glass-panel border border-white/60 dark:border-white/10 shadow-2xl shadow-indigo-950/20 backdrop-blur-2xl">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-0.5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* "Más" Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
              isMoreOpen || !['dashboard', 'tasks', 'calendar', 'focus'].includes(activeView)
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight font-medium">Más</span>
          </button>
        </div>
      </div>

      {/* "Más" Bottom Sheet Modal Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-h-[85vh] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl border-t border-white/40 dark:border-white/10 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden pb-safe"
            >
              {/* Sheet Drag Indicator */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

              {/* Header */}
              <div className="px-5 pb-3 pt-1 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/studyflow-logo.png"
                    alt="StudyFlow"
                    className="w-8 h-8 object-contain shrink-0 drop-shadow-sm select-none pointer-events-none"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      Todas las Secciones
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentUser?.name || settings.studentName || 'Estudiante'} • {settings.gradeLevel}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Categories List */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {/* Profile Quick Action Card */}
                <div
                  onClick={handleOpenProfile}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {currentUser?.name || 'Mi Perfil de Estudio'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {currentUser?.email || 'Gestionar cuenta y datos'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{currentStreak}d</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
                  </div>
                </div>

                {/* Categorized Sections */}
                {menuSections.map((sec) => (
                  <div key={sec.title} className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      {sec.title}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {sec.items.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = activeView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectView(item.id)}
                            className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                              isCurrent
                                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                                : 'glass-panel hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-white/40 dark:border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2 rounded-xl shrink-0 ${isCurrent ? 'bg-white/20 text-white' : item.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">
                                  {item.label}
                                </div>
                                <div className={`text-[10px] truncate ${isCurrent ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {item.desc}
                                </div>
                              </div>
                            </div>

                            <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white/80' : 'text-slate-400'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

