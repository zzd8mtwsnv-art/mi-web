import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassBadge } from '../ui/GlassBadge';
import { soundManager } from '../../utils/sound';
import { formatSecondsToTimer, formatMinutes } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Volume2,
  VolumeX,
  Flame,
  Clock,
  Sparkles,
  CloudRain,
  Radio,
  Wind
} from 'lucide-react';

export const FocusView: React.FC = () => {
  const {
    subjects,
    settings,
    addFocusSession,
    currentStreak,
    todayStudyMinutes,
    sessions
  } = useApp();

  // Mode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch'
  const [mode, setMode] = useState<'pomodoro' | 'short_break' | 'long_break' | 'stopwatch'>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroWorkMinutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'white' | 'lofi'>('none');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize durations
  const getDurationForMode = (m: string) => {
    switch (m) {
      case 'pomodoro':
        return settings.pomodoroWorkMinutes * 60;
      case 'short_break':
        return settings.pomodoroShortBreakMinutes * 60;
      case 'long_break':
        return settings.pomodoroLongBreakMinutes * 60;
      default:
        return 0;
    }
  };

  const handleModeChange = (newMode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch') => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setSecondsLeft(getDurationForMode(newMode));
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleStartPause = () => {
    if (!isActive) {
      soundManager.playStartChime();
    } else {
      soundManager.playClick();
    }
    setIsActive((prev) => !prev);
  };

  const handleReset = () => {
    soundManager.playClick();
    setIsActive(false);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setSecondsLeft(getDurationForMode(mode));
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    soundManager.playCompletionChime();

    // Trigger celebration
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (mode === 'pomodoro') {
      const studiedMins = settings.pomodoroWorkMinutes;
      addFocusSession({
        durationMinutes: studiedMins,
        type: 'pomodoro',
        date: new Date().toISOString(),
        completed: true,
        notes: `Bloque Pomodoro (${studiedMins} min)`,
        ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {})
      });

      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);

      if (nextCount % settings.pomodoroLongBreakInterval === 0) {
        handleModeChange('long_break');
      } else {
        handleModeChange('short_break');
      }
    }
  };

  // Manual session finish (for stopwatch or early stop)
  const handleFinishEarly = () => {
    const elapsedMinutes =
      mode === 'stopwatch'
        ? Math.max(1, Math.round(stopwatchSeconds / 60))
        : Math.max(1, Math.round((getDurationForMode(mode) - secondsLeft) / 60));

    if (elapsedMinutes >= 1 && (mode === 'pomodoro' || mode === 'stopwatch')) {
      addFocusSession({
        durationMinutes: elapsedMinutes,
        type: mode === 'pomodoro' ? 'pomodoro' : 'normal',
        date: new Date().toISOString(),
        completed: true,
        notes: `Sesión de ${elapsedMinutes} minutos`,
        ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {})
      });

      confetti({ particleCount: 50, spread: 60 });
      soundManager.playCompletionChime();
    }

    handleReset();
  };

  // Ambient sound handler
  const handleAmbientChange = (type: 'none' | 'rain' | 'white' | 'lofi') => {
    setAmbientSound(type);
    if (type === 'none') {
      soundManager.stopAmbient();
    } else {
      soundManager.startAmbient(type);
    }
  };

  // Calculate Ring Progress Percentage
  const totalModeDuration = getDurationForMode(mode);
  const progressPercent =
    mode === 'stopwatch'
      ? Math.min(100, (stopwatchSeconds % 3600) / 36)
      : Math.round(((totalModeDuration - secondsLeft) / totalModeDuration) * 100);

  const displayTime =
    mode === 'stopwatch'
      ? formatSecondsToTimer(stopwatchSeconds)
      : formatSecondsToTimer(secondsLeft);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" /> Modo Focus & Pomodoro
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Elimina distracciones y potencia tu concentración para Bachillerato
        </p>
      </div>

      {/* Main Glass Focus Hub */}
      <GlassCard padding="xl" className="relative shadow-2xl overflow-hidden text-center">
        {/* Glow ambient background aura */}
        <div
          style={{
            backgroundColor: selectedSubject?.color ? `${selectedSubject.color}25` : 'rgba(99, 102, 241, 0.15)'
          }}
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-700 -z-10"
        />

        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 mb-8">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Descanso Corto (5m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'long_break'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Descanso Largo (15m)
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'stopwatch'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cronómetro Libre
          </button>
        </div>

        {/* Subject Selector Bar */}
        <div className="max-w-xs mx-auto mb-8">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Materia a estudiar
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={isActive}
            className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm font-semibold text-center"
          >
            <option value="">Estudio General / Repaso</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Big Minimalist Circular Timer */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-200/50 dark:text-slate-800/80 stroke-current"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={selectedSubject?.color || '#6366F1'}
              strokeWidth="5.5"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white font-mono drop-shadow-sm">
              {displayTime}
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400 mt-2">
              {isActive ? 'En Concentración' : 'En Pausa'}
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm active:scale-95"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleStartPause}
            className={`px-8 py-4 rounded-3xl font-bold text-base flex items-center gap-2.5 shadow-xl transition-all active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> Iniciar
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
            title="Finalizar y Guardar Sesión"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sounds Generator */}
        <div className="pt-8 mt-8 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-500" /> Sonido Ambiente:
          </span>
          {[
            { id: 'none', label: 'Silencio', icon: VolumeX },
            { id: 'rain', label: 'Lluvia Suave', icon: CloudRain },
            { id: 'white', label: 'Ruido Blanco', icon: Wind },
            { id: 'lofi', label: 'Lo-Fi Waves', icon: Radio }
          ].map((snd) => {
            const Icon = snd.icon;
            const isSelected = ambientSound === snd.id;
            return (
              <button
                key={snd.id}
                onClick={() => handleAmbientChange(snd.id as 'none' | 'rain' | 'white' | 'lofi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {snd.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Focus Daily Stats & Streak Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard padding="md" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Racha de Estudio
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currentStreak} días consecutivos
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="md" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estudiado Hoy
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatMinutes(todayStudyMinutes)}
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="md" className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pomodoros Hoy
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {sessions.filter((s) => s.type === 'pomodoro').length} completados
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
