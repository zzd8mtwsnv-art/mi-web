import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassButton';
import { AVAILABLE_COLORS } from '../../utils/icons';
import { User, LogOut, Trash2, Plus, RefreshCw, Check, Cloud, Mail } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    authUser,
    currentUser,
    profiles,
    login,
    updateProfile,
    deleteProfile,
    createProfile,
    clearCurrentUserData,
    syncStatus,
    logout
  } = useApp();

  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVAILABLE_COLORS[0]);
  const [activeTab, setActiveTab] = useState<'edit' | 'switch' | 'new'>('edit');
  const [isSaved, setIsSaved] = useState(false);

  // New Profile Form
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('2º Bachillerato');
  const [newColor, setNewColor] = useState(AVAILABLE_COLORS[1]);
  const [newStartBlank, setNewStartBlank] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setGradeLevel(currentUser.gradeLevel);
      setAvatarColor(currentUser.avatarColor || AVAILABLE_COLORS[0]);
    }
  }, [currentUser, isOpen]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim()) return;

    updateProfile(currentUser.id, {
      name: name.trim(),
      gradeLevel: gradeLevel.trim(),
      avatarColor
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createProfile({
      name: newName.trim(),
      gradeLevel: newGrade.trim(),
      avatarColor: newColor,
      startBlank: newStartBlank
    });
    setNewName('');
    onClose();
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar todas las tareas, asignaturas y horarios de este perfil para empezar 100% en blanco?')) {
      clearCurrentUserData();
      alert('¡Datos del perfil vaciados con éxito!');
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!currentUser) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Cuenta & Perfil"
      subtitle="Personaliza tus datos, revisa la sincronización o cambia de cuenta"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Mi Cuenta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'switch'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Cambiar Perfil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            + Nuevo
          </button>
        </div>

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === 'edit' && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5">
              {authUser?.photoURL ? (
                <img
                  src={authUser.photoURL}
                  alt={name}
                  className="w-12 h-12 rounded-2xl object-cover shadow-md ring-2 ring-indigo-500/30"
                />
              ) : (
                <div
                  style={{ backgroundColor: avatarColor }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                >
                  {name.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                  {name || 'Estudiante'}
                </span>
                {authUser?.email && (
                  <span className="text-xs text-indigo-500 font-medium flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 shrink-0" /> {authUser.email}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {gradeLevel} {currentUser.isDemo ? '• (Modo Demo)' : '• Cuenta en la Nube'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Estudiante *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            {/* Clear Data & Logout Options */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 space-y-2">
              <button
                type="button"
                onClick={handleClearData}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs border border-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Vaciar materias y tareas (Empezar en blanco)
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Guardado
                </span>
              ) : <div />}

              <GlassButton variant="primary" type="submit">
                Guardar Cambios
              </GlassButton>
            </div>
          </form>
        )}

        {/* TAB 2: SWITCH PROFILE */}
        {activeTab === 'switch' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Selecciona otro estudiante para acceder a sus tareas y horario:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    login(p.id);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentUser.id === p.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/40'
                      : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: p.avatarColor }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {p.name} {currentUser.id === p.id && '(Activo)'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.gradeLevel}
                      </span>
                    </div>
                  </div>

                  {profiles.length > 1 && p.id !== currentUser.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Eliminar perfil de ${p.name}?`)) {
                          deleteProfile(p.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <GlassButton variant="secondary" fullWidth onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Salir a la Pantalla de Inicio
              </GlassButton>
            </div>
          </div>
        )}

        {/* TAB 3: CREATE NEW PROFILE */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateNew} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Nuevo Estudiante *
              </label>
              <input
                autoFocus
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Laura..."
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Curso / Nivel
              </label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm"
              >
                <option value="2º Bachillerato">2º Bachillerato</option>
                <option value="1º Bachillerato">1º Bachillerato</option>
                <option value="4º ESO">4º ESO</option>
                <option value="Universidad / Grado">Universidad / Grado</option>
                <option value="Oposiciones / Otro">Oposiciones / Otro</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Iniciar con espacio limpio (en blanco)
              </span>
              <input
                type="checkbox"
                checked={newStartBlank}
                onChange={(e) => setNewStartBlank(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <GlassButton variant="primary" fullWidth type="submit">
              Crear e Iniciar con este Perfil
            </GlassButton>
          </form>
        )}
      </div>
    </GlassModal>
  );
};