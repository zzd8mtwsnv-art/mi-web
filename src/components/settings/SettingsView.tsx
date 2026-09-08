import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { ThemeMode } from '../../types';
import {
  Sun,
  Moon,
  Monitor,
  Clock,
  RotateCcw,
  Download,
  Upload,
  User,
  LogOut,
  RefreshCw,
  Check,
  Cloud,
  Mail,
  ShieldCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    authUser,
    currentUser,
    settings,
    syncStatus,
    updateSettings,
    setIsProfileModalOpen,
    resetDemoData,
    clearCurrentUserData,
    exportData,
    importData,
    logout
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importData(content);
        if (ok) {
          alert('¡Datos restaurados con éxito desde la copia de seguridad!');
        } else {
          setImportError(true);
          setTimeout(() => setImportError(false), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restablecer todos los datos a la demostración inicial de Bachillerato? Se sobreescribirán las modificaciones no guardadas.')) {
      resetDemoData();
      alert('¡Datos de Bachillerato restaurados con éxito!');
    }
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar todas las tareas, asignaturas y horarios de tu perfil para empezar 100% en blanco?')) {
      clearCurrentUserData();
      alert('¡Tu espacio de estudio ha quedado totalmente en blanco!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ajustes & Cuenta
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Personaliza tu perfil, sincronización en la nube, apariencia Liquid Glass y copias de seguridad
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION: PERFIL & CUENTA */}
        <GlassCard padding="lg" className="space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Perfil & Cuenta
            </h2>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Gestionar Cuenta
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5">
            {authUser?.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={currentUser?.name || 'Usuario'}
                className="w-14 h-14 rounded-2xl object-cover shadow-md ring-2 ring-indigo-500/30 shrink-0"
              />
            ) : (
              <div
                style={{ backgroundColor: currentUser?.avatarColor || '#6366F1' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0"
              >
                {currentUser?.name.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Estudiante'}
                </span>
                {syncStatus === 'synced' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Nube Conectada
                  </span>
                )}
              </div>

              {authUser?.email && (
                <span className="text-xs text-indigo-500 font-medium flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {authUser.email}
                </span>
              )}

              <span className="text-xs text-slate-400 block mt-0.5">
                {currentUser?.gradeLevel} {currentUser?.isDemo && '• (Modo Demo)'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
              <GlassButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
              >
                Editar Perfil
              </GlassButton>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            </div>
          </div>
        </GlassCard>

        {/* SECTION: APARIENCIA */}
        <GlassCard padding="lg" className="space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-indigo-500" /> Apariencia & Tema Visual
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tema de la interfaz
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Claro', icon: Sun },
                { id: 'dark', label: 'Oscuro', icon: Moon },
                { id: 'auto', label: 'Automático', icon: Monitor }
              ].map((th) => {
                const Icon = th.icon;
                const isSelected = settings.theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => updateSettings({ theme: th.id as ThemeMode })}
                    className={`py-3 px-4 rounded-2xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* SECTION: ESTUDIO & POMODORO */}
        <GlassCard padding="lg" className="space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Parámetros de Estudio & Focus
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Objetivo diario de estudio: <strong className="text-indigo-600">{settings.dailyStudyGoalMinutes} min ({settings.dailyStudyGoalMinutes / 60}h)</strong>
              </label>
              <input
                type="range"
                min="30"
                max="360"
                step="15"
                value={settings.dailyStudyGoalMinutes}
                onChange={(e) => updateSettings({ dailyStudyGoalMinutes: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duración Pomodoro (Trabajo): <strong className="text-indigo-600">{settings.pomodoroWorkMinutes} min</strong>
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={settings.pomodoroWorkMinutes}
                onChange={(e) => updateSettings({ pomodoroWorkMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descanso corto: <strong className="text-emerald-500">{settings.pomodoroShortBreakMinutes} min</strong>
              </label>
              <input
                type="number"
                min="2"
                max="15"
                value={settings.pomodoroShortBreakMinutes}
                onChange={(e) => updateSettings({ pomodoroShortBreakMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descanso largo: <strong className="text-purple-500">{settings.pomodoroLongBreakMinutes} min</strong>
              </label>
              <input
                type="number"
                min="10"
                max="45"
                value={settings.pomodoroLongBreakMinutes}
                onChange={(e) => updateSettings({ pomodoroLongBreakMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-2xl glass-input text-sm font-mono"
              />
            </div>
          </div>
        </GlassCard>

        {/* SECTION: DATOS & COPIAS DE SEGURIDAD */}
        <GlassCard padding="lg" className="space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-500" /> Copia de Seguridad & Datos
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tus datos se guardan tanto en tu navegador como en Firebase Firestore si estás autenticado. Puedes exportar una copia en JSON, vaciar el espacio actual para empezar limpio o restaurar la demo inicial.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportJSON}
              icon={<Download className="w-4 h-4" />}
            >
              Exportar Copia (JSON)
            </GlassButton>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-white/10 shadow-sm transition-all">
                <Upload className="w-4 h-4" /> Importar Copia
              </span>
            </label>

            <button
              type="button"
              onClick={handleClearData}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-2xl bg-amber-500/15 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/30 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Empezar en Blanco (Vaciar datos)
            </button>

            <GlassButton
              type="button"
              variant="danger"
              size="sm"
              onClick={handleResetDemo}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Restablecer Demo Bachillerato
            </GlassButton>
          </div>

          {importError && (
            <p className="text-xs text-rose-500 font-semibold">
              Error al leer el archivo JSON. Asegúrate de que es un respaldo válido de StudyFlow.
            </p>
          )}
        </GlassCard>

        {/* Save button notification */}
        <div className="flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-fade-in">
              <Check className="w-4 h-4" /> Preferencias guardadas correctamente
            </span>
          )}
          <div className="ml-auto">
            <GlassButton variant="primary" type="submit">
              Guardar Cambios
            </GlassButton>
          </div>
        </div>
      </form>
    </div>
  );
};