import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Sparkles, User, Plus, ArrowRight, BookOpen, Trash2, Check } from 'lucide-react';
import { AVAILABLE_COLORS } from '../../utils/icons';

export const AuthScreen: React.FC = () => {
  const { profiles, login, createProfile, deleteProfile } = useApp();
  const [mode, setMode] = useState<'select' | 'register'>('select');

  // Register Form
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('2º Bachillerato');
  const [avatarColor, setAvatarColor] = useState(AVAILABLE_COLORS[0]);
  const [startBlank, setStartBlank] = useState(true);

  const handleCreateAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProfile({
      name: name.trim(),
      gradeLevel: gradeLevel.trim() || 'Estudiante',
      avatarColor,
      startBlank
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#080d1a] bg-mesh-light dark:bg-mesh-dark">
      <div className="w-full max-w-md relative">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 shadow-xl shadow-indigo-500/30 text-white mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
            StudyFlow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centro de Organización & Estudio Personal
          </p>
        </div>

        {/* SELECT OR CREATE ACCOUNT */}
        <GlassCard padding="lg" className="shadow-2xl border-white/60 dark:border-white/15">
          {mode === 'select' ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Iniciar Sesión / Elegir Perfil
                </h2>
                <button
                  onClick={() => setMode('register')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Cuenta
                </button>
              </div>

              {/* Profiles List */}
              <div className="space-y-2.5">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => login(p.id)}
                    className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 hover:bg-indigo-50/70 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:border-indigo-400/40"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: p.avatarColor }}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {p.name}
                          </span>
                          {p.isDemo && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Demo
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {p.gradeLevel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar el perfil de ${p.name}?`)) {
                              deleteProfile(p.id);
                            }
                          }}
                          className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                          title="Eliminar perfil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-white/10">
                <GlassButton
                  variant="secondary"
                  fullWidth
                  onClick={() => setMode('register')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Crear Mi Propia Cuenta (Limpia)
                </GlassButton>
              </div>
            </div>
          ) : (
            /* CREATE OWN PROFILE FORM */
            <form onSubmit={handleCreateAndLogin} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Crear Perfil de Estudiante
                </h2>
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Volver
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tu Nombre o Apodo *
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Carlos, Lucía, Mateo..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Curso / Nivel
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
                >
                  <option value="2º Bachillerato">2º Bachillerato</option>
                  <option value="1º Bachillerato">1º Bachillerato</option>
                  <option value="4º ESO">4º ESO</option>
                  <option value="3º ESO">3º ESO</option>
                  <option value="Universidad / Grado">Universidad / Grado</option>
                  <option value="Ciclo Formativo FP">Ciclo Formativo FP</option>
                  <option value="Oposiciones / Otro">Oposiciones / Otro</option>
                </select>
              </div>

              {/* Avatar Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Color del Perfil
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        avatarColor === c
                          ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Data option */}
              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Empezar en blanco
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Sin asignaturas ni tareas de prueba
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={startBlank}
                  onChange={(e) => setStartBlank(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <GlassButton variant="primary" fullWidth type="submit">
                  Crear y Entrar a StudyFlow
                </GlassButton>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};