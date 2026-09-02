import React from 'react';
import { Bell, Check, Trash2, Calendar, CheckSquare, Flame, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';

export const NotificationsModal: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setActiveView
  } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-amber-500" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'goal':
        return <Award className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleNotificationClick = (actionView?: string, id?: string) => {
    if (id) markNotificationRead(id);
    if (actionView) {
      setActiveView(actionView);
      setIsNotificationsOpen(false);
    }
  };

  return (
    <GlassModal
      isOpen={isNotificationsOpen}
      onClose={() => setIsNotificationsOpen(false)}
      title="Centro de Notificaciones"
      subtitle="Avisos importantes de tus exámenes, tareas y metas"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Actions bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10 text-xs">
            <button
              onClick={markAllNotificationsRead}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Check className="w-3.5 h-3.5" /> Marcar todas leídas
            </button>
            <button
              onClick={clearNotifications}
              className="text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Vaciar
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-[55vh] overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center mb-3 text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No tienes notificaciones pendientes
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ¡Todo al día con tus estudios y entregas!
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.actionView, n.id)}
                className={`
                  p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3
                  ${
                    n.read
                      ? 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/5 opacity-75'
                      : 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-500/20 shadow-sm'
                  }
                `}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2">
          <GlassButton
            variant="secondary"
            fullWidth
            onClick={() => setIsNotificationsOpen(false)}
          >
            Cerrar
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
