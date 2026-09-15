import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassBadge } from '../ui/GlassBadge';
import { ManualSessionModal } from './ManualSessionModal';
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
  Wind,
  Plus,
  Sliders,
  Coffee,
  BookOpen,
  Check,
  Zap,
  Timer
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

  // Mode: 'pomodoro' | 'custom' | 'stopwatch' | 'short_break' | 'long_break'
  const [mode, setMode] = useState<'pomodoro' | 'custom' | 'stopwatch' | 'short_break' | 'long_break'>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [isActive, setIsActive] = useState(false);

  // Custom Timer (Temporizador Libre) Config & Phase
  const [customStudyMinutes, setCustomStudyMinutes] = useState<number>(45);
  const [customBreakMinutes, setCustomBreakMinutes] = useState<number>(10);
  const [customPhase, setCustomPhase] = useState<'study' | 'break'>('study');
  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(true);

  // Timer Tick States
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.pomodoroWorkMinutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'white' | 'lofi'>('none');

  // Manual Session Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize durations based on mode and phase
  const getDurationForMode = (m: string, phase: 'study' | 'break' = customPhase) => {
    switch (m) {
      case 'pomodoro':
        return settings.pomodoroWorkMinutes * 60;
      case 'short_break':
        return settings.pomodoroShortBreakMinutes * 60;
      case 'long_break':
        return settings.pomodoroLongBreakMinutes * 60;
      case 'custom':
        return phase === 'study' ? customStudyMinutes * 60 : customBreakMinutes * 60;
      default:
        return 0;
    }
  };

  const handleModeChange = (newMode: 'pomodoro' | 'custom' | 'stopwatch' | 'short_break' | 'long_break') => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else if (newMode === 'custom') {
      setCustomPhase('study');
      setSecondsLeft(customStudyMinutes * 60);
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
  }, [isActive, mode, customPhase, customStudyMinutes, customBreakMinutes, autoStartBreak, selectedSubjectId]);

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
    } else if (mode === 'custom') {
      setCustomPhase('study');
      setSecondsLeft(customStudyMinutes * 60);
    } else {
      setSecondsLeft(getDurationForMode(mode));
    }
  };

  const handleTimerComplete = () => {
    soundManager.playCompletionChime();

    // Trigger celebration
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (mode === 'pomodoro') {
      setIsActive(false);
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
    } else if (mode === 'custom') {
      if (customPhase === 'study') {
        // STUDY PHASE FINISHED -> RECORD REAL STUDY TIME
        addFocusSession({
          durationMinutes: customStudyMinutes,
          type: 'normal',
          date: new Date().toISOString(),
          completed: true,
          notes: `Bloque Temporizador Libre (${customStudyMinutes} min)`,
          ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {})
        });

        // Switch to Break Phase
        setCustomPhase('break');
        const breakSeconds = customBreakMinutes * 60;
        setSecondsLeft(breakSeconds);

        if (autoStartBreak) {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } else {
        // BREAK PHASE FINISHED -> (Break is NOT recorded as study)
        setCustomPhase('study');
        setSecondsLeft(customStudyMinutes * 60);
        setIsActive(false);
      }
    } else {
      setIsActive(false);
    }
  };

  // Manual session finish (for stopwatch, custom study, or early stop)
  const handleFinishEarly = () => {
    if (mode === 'stopwatch') {
      const elapsedMinutes = Math.max(1, Math.round(stopwatchSeconds / 60));
      addFocusSession({
        durationMinutes: elapsedMinutes,
        type: 'normal',
        date: new Date().toISOString(),
        completed: true,
        notes: `Sesión con cronómetro (${elapsedMinutes} min)`,
        ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {})
      });
      confetti({ particleCount: 50, spread: 60 });
      soundManager.playCompletionChime();
      handleReset();
      return;
    }

    if (mode === 'custom' && customPhase === 'study') {
      const elapsedMinutes = Math.max(1, Math.round((customStudyMinutes * 60 - secondsLeft) / 60));
      addFocusSession({
        durationMinutes: elapsedMinutes,
        type: 'normal',
        date: new Date().toISOString(),
        completed: true,
        notes: `Sesión libre parcial (${elapsedMinutes} min)`,
        ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {})
      });
      confetti({ particleCount: 50, spread: 60 });
      soundManager.playCompletionChime();
      handleReset();
      return;
    }

    if (mode === 'pomodoro') {
      const elapsedMinutes = Math.max(1, Math.round((settings.pomodoroWorkMinutes * 60 - secondsLeft) / 60));
      addFocusSession({
        durationMinutes: elapsedMinutes,
        type: 'pomodoro',
        date: new Date().toISOString(),
        completed: true,
        notes: `Pomodoro parcial (${elapsedMinutes} min)`,
        ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {})
      });
      confetti({ particleCount: 50, spread: 60 });
      soundManager.playCompletionChime();
      handleReset();
      return;
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
  const totalModeDuration = getDurationForMode(mode, customPhase);
  const progressPercent =
    mode === 'stopwatch'
      ? Math.min(100, (stopwatchSeconds % 3600) / 36)
      : totalModeDuration > 0
      ? Math.round(((totalModeDuration - secondsLeft) / totalModeDuration) * 100)
      : 0;

  const displayTime =
    mode === 'stopwatch'
      ? formatSecondsToTimer(stopwatchSeconds)
      : formatSecondsToTimer(secondsLeft);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header with Title and Manual Log Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" /> Focus & Pomodoro
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Temporizador libre, técnicas Pomodoro y cronómetro para tus sesiones de estudio
          </p>
        </div>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => setIsManualModalOpen(true)}
          icon={<Plus className="w-4 h-4 text-indigo-500" />}
        >
          + Registrar estudio manualmente
        </GlassButton>
      </div>

      {/* Main Glass Focus Hub */}
      <GlassCard padding="xl" className="relative shadow-2xl overflow-hidden text-center">
        {/* Glow ambient background aura */}
        <div
          style={{
            backgroundColor:
              customPhase === 'break' && mode === 'custom'
                ? 'rgba(16, 185, 129, 0.2)'
                : selectedSubject?.color
                ? `${selectedSubject.color}25`
                : 'rgba(99, 102, 241, 0.15)'
          }}
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-700 -z-10"
        />

        {/* Mode Selector Tabs (Responsive Flex-wrap) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 mb-6 max-w-full">
          <button
            onClick={() => handleModeChange('custom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'custom'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Temporizador Libre
          </button>
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'stopwatch'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            Cronómetro Libre
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Descanso Corto (5m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'long_break'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Descanso Largo (15m)
          </button>
        </div>

        {/* CUSTOM TIMER CONFIGURATION PANEL (Only visible in 'custom' mode) */}
        {mode === 'custom' && (
          <div className="max-w-md mx-auto mb-6 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Min. Estudio
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    disabled={isActive}
                    value={customStudyMinutes}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setCustomStudyMinutes(val);
                      if (!isActive && customPhase === 'study') setSecondsLeft(val * 60);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-sm font-bold text-center"
                  />
                  <span className="text-xs text-slate-400 font-medium">min</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                  <Coffee className="w-3 h-3" /> Min. Descanso
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    disabled={isActive}
                    value={customBreakMinutes}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setCustomBreakMinutes(val);
                      if (!isActive && customPhase === 'break') setSecondsLeft(val * 60);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-sm font-bold text-center"
                  />
                  <span className="text-xs text-slate-400 font-medium">min</span>
                </div>
              </div>
            </div>

            {/* Presets quick pills */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Atajos rápidos:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { s: 25, b: 5, label: '25/5' },
                  { s: 45, b: 10, label: '45/10' },
                  { s: 60, b: 15, label: '60/15' },
                  { s: 90, b: 20, label: '90/20' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={isActive}
                    onClick={() => {
                      setCustomStudyMinutes(preset.s);
                      setCustomBreakMinutes(preset.b);
                      if (!isActive) {
                        setCustomPhase('study');
                        setSecondsLeft(preset.s * 60);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                      customStudyMinutes === preset.s && customBreakMinutes === preset.b
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Start Break Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-white/5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                Iniciar descansos automáticamente
              </label>
              <button
                type="button"
                onClick={() => setAutoStartBreak((prev) => !prev)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  autoStartBreak ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoStartBreak ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Subject Selector Bar */}
        <div className="max-w-xs mx-auto mb-6">
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

        {/* Phase Badge Indicator (For Custom Timer) */}
        {mode === 'custom' && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                customPhase === 'study'
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {customPhase === 'study' ? (
                <>
                  <BookOpen className="w-3.5 h-3.5" /> Fase de Estudio ({customStudyMinutes} min)
                </>
              ) : (
                <>
                  <Coffee className="w-3.5 h-3.5" /> Fase de Descanso ({customBreakMinutes} min)
                </>
              )}
            </span>
          </div>
        )}

        {/* Big Minimalist Circular Timer */}
        <div className="relative w-60 h-60 sm:w-80 sm:h-80 mx-auto flex items-center justify-center my-3">
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
              stroke={
                mode === 'custom' && customPhase === 'break'
                  ? '#10B981'
                  : selectedSubject?.color || '#6366F1'
              }
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
            <span className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white font-mono drop-shadow-sm">
              {displayTime}
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400 mt-2">
              {isActive
                ? mode === 'stopwatch'
                  ? 'Contando Tiempo'
                  : mode === 'custom' && customPhase === 'break'
                  ? 'Descansando'
                  : 'En Concentración'
                : 'En Pausa'}
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-center gap-4 mt-6">
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
                : mode === 'custom' && customPhase === 'break'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {mode === 'custom' && customPhase === 'break' ? 'Iniciar Descanso' : 'Iniciar'}
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
        <div className="pt-6 mt-6 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-center gap-2">
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
              Sesiones Registradas
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {sessions.length} en total
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Manual Study Registration Modal */}
      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
