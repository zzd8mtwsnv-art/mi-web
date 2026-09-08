import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Flame,
  User,
  LogOut,
  ChevronDown,
  RefreshCw,
  Cloud,
  CloudOff,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassButton } from '../ui/GlassButton';

export const Header: React.FC = () => {
  const {
    authUser,
    currentUser,
    settings,
    updateSettings,
    syncStatus,
    setIsSearchOpen,
    setIsQuickAddOpen,
    setIsNotificationsOpen,
    setIsProfileModalOpen,
    notifications,
    currentStreak,
    setActiveView,
    logout,
    clearCurrentUserData
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const handleClearData = () => {
    if (window.confirm('¿Deseas vaciar todas las tareas, asignaturas y horarios para empezar en blanco con este perfil?')) {
      clearCurrentUserData();
      setIsDropdownOpen(false);
    }
  };

  const getSyncBadge = () => {
    if (syncStatus === 'synced') {
      return (
        <span title="Sincronizado con la nube (Firestore)" className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Cloud className="w-3 h-3" /> Nube
        </span>
      );
    } else if (syncStatus === 'syncing') {
      return (
        <span title="Guardando cambios en la nube..." className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" /> Guardando...
        </span>
      );
    } else {
      return (
        <span title="Modo local / sin conexión" className="flex items-center gap-1 text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5">
          <CloudOff className="w-3 h-3" /> Local
        </span>
      );
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full px-4 sm:px-6 py-3 select-none">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto rounded-2xl glass-panel px-4 py-2.5 border border-white/60 dark:border-white/10 shadow-lg shadow-indigo-950/5">
        {/* Left: Search Trigger Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 w-full px-3.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-white/10 text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-all text-left group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="flex-1 truncate">Buscar asignaturas, tareas, exámenes, eventos...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white/80 dark:bg-slate-900/80 rounded-md border border-slate-300/60 dark:border-white/10 text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync Status Indicator */}
          <div className="hidden sm:block">
            {getSyncBadge()}
          </div>

          {/* Quick Add Button */}
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => setIsQuickAddOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex"
          >
            Añadir
          </GlassButton>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="sm:hidden p-2 rounded-xl bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Streak Indicator */}
          <div
            onClick={() => setActiveView('focus')}
            title="Racha de estudio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 font-semibold text-xs cursor-pointer hover:scale-105 transition-transform"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="hidden xs:inline font-bold">{currentStreak}</span>
          </div>

          {/* Notification Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            title="Cambiar tema"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Student Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-white/10 transition-all text-left group"
            >
              {authUser?.photoURL ? (
                <img
                  src={authUser.photoURL}
                  alt={currentUser?.name || 'Usuario'}
                  className="w-7 h-7 rounded-xl object-cover shadow-sm ring-1 ring-white/20"
                />
              ) : (
                <div
                  style={{ backgroundColor: currentUser?.avatarColor || '#6366F1' }}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                >
                  {currentUser?.name.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div className="hidden sm:block text-left leading-none">
                <span className="block text-xs font-bold text-slate-800 dark:text-white truncate max-w-[110px]">
                  {currentUser?.name || 'Estudiante'}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {currentUser?.email || currentUser?.gradeLevel || '2º Bach'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  onClick={() => setIsDropdownOpen(false)}
                  className="fixed inset-0 z-30"
                />
                <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-2xl shadow-indigo-950/20 z-40 space-y-1 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {currentUser?.name}
                    </span>
                    {currentUser?.email && (
                      <span className="text-[11px] text-indigo-500 font-medium block truncate">
                        {currentUser.email}
                      </span>
                    )}
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {currentUser?.gradeLevel}
                      </span>
                      {getSyncBadge()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" /> Mi Perfil & Ajustes
                  </button>

                  <button
                    onClick={handleClearData}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Vaciar y Empezar en Blanco
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors border-t border-slate-200/40 dark:border-white/5 pt-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};