import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { SubjectModal } from './SubjectModal';
import { getSubjectIcon } from '../../utils/icons';
import { formatMinutes, getRelativeDayString } from '../../utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  FileText,
  Clock,
  Award,
  ArrowLeft,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    tasks,
    exams,
    grades,
    sessions,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectAverage,
    toggleTaskComplete
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'resumen' | 'tareas' | 'examenes' | 'notas' | 'apuntes'>('resumen');

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingSubject(sub);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta asignatura y todos sus datos asociados?')) {
      deleteSubject(id);
      if (selectedSubjectId === id) setSelectedSubjectId(null);
    }
  };

  const handleSaveSubject = (data: Omit<Subject, 'id'>) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, data);
    } else {
      addSubject(data);
    }
  };

  // Detailed view data for selected subject
  const subjectTasks = selectedSubject
    ? tasks.filter((t) => t.subjectId === selectedSubject.id)
    : [];
  const subjectExams = selectedSubject
    ? exams.filter((e) => e.subjectId === selectedSubject.id)
    : [];
  const subjectGrades = selectedSubject
    ? grades.filter((g) => g.subjectId === selectedSubject.id)
    : [];
  const subjectSessions = selectedSubject
    ? sessions.filter((s) => s.subjectId === selectedSubject.id)
    : [];

  const subjectStudyMinutes = subjectSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const subjectAverage = selectedSubject ? getSubjectAverage(selectedSubject.id) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {selectedSubject ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSubjectId(null)}
                className="p-2 rounded-2xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                  <span
                    style={{ backgroundColor: selectedSubject.color }}
                    className="p-2 rounded-2xl text-white shadow-md"
                  >
                    {getSubjectIcon(selectedSubject.icon, 'w-5 h-5')}
                  </span>
                  {selectedSubject.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedSubject.teacher && `Profesor: ${selectedSubject.teacher}`}
                  {selectedSubject.classroom && ` • Aula: ${selectedSubject.classroom}`}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Asignaturas
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gestiona tus materias, notas medias, tareas y horas dedicadas
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedSubject && (
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={(e) => handleOpenEdit(selectedSubject, e)}
              icon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Editar
            </GlassButton>
          )}
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            Nueva Asignatura
          </GlassButton>
        </div>
      </div>

      {/* DETAILED SUBJECT VIEW */}
      {selectedSubject ? (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <GlassCard padding="sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nota Media
              </span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {subjectAverage.toFixed(2)}{' '}
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Meta: {selectedSubject.targetGrade || 9.0}
              </div>
            </GlassCard>

            <GlassCard padding="sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tiempo Estudiado
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatMinutes(subjectStudyMinutes)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {subjectSessions.length} sesiones
              </div>
            </GlassCard>

            <GlassCard padding="sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tareas Pendientes
              </span>
              <div className="text-2xl font-extrabold text-amber-500 mt-1">
                {subjectTasks.filter((t) => t.status !== 'completada').length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {subjectTasks.length} en total
              </div>
            </GlassCard>

            <GlassCard padding="sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Próximos Exámenes
              </span>
              <div className="text-2xl font-extrabold text-rose-500 mt-1">
                {subjectExams.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {subjectExams[0] ? getRelativeDayString(subjectExams[0].date) : 'Ninguno'}
              </div>
            </GlassCard>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/60 dark:border-white/10 overflow-x-auto">
            {(['resumen', 'tareas', 'examenes', 'notas', 'apuntes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                  selectedTab === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {selectedTab === 'resumen' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tareas de la asignatura */}
              <GlassCard padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-500" /> Tareas
                  </h3>
                  <span className="text-xs text-slate-400">{subjectTasks.length} tareas</span>
                </div>
                {subjectTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No hay tareas para esta asignatura.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subjectTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={t.status === 'completada'}
                            onChange={() => toggleTaskComplete(t.id)}
                            className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                          />
                          <span
                            className={`text-xs font-medium ${
                              t.status === 'completada'
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {getRelativeDayString(t.dueDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Exámenes de la asignatura */}
              <GlassCard padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" /> Exámenes & Controles
                  </h3>
                  <span className="text-xs text-slate-400">{subjectExams.length} previstos</span>
                </div>
                {subjectExams.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No hay exámenes programados.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {subjectExams.map((e) => (
                      <div
                        key={e.id}
                        className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {e.title}
                          </h4>
                          <GlassBadge size="xs" color="#EF4444">
                            {getRelativeDayString(e.date)}
                          </GlassBadge>
                        </div>
                        {e.topics && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {e.topics}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {selectedTab === 'tareas' && (
            <GlassCard padding="md" className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Todas las Tareas de {selectedSubject.name}
              </h3>
              {subjectTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === 'completada'}
                      onChange={() => toggleTaskComplete(t.id)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          t.status === 'completada'
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                      )}
                    </div>
                  </div>
                  <GlassBadge size="xs" color={t.priority === 'urgente' ? '#EF4444' : '#6366F1'}>
                    {t.priority}
                  </GlassBadge>
                </div>
              ))}
            </GlassCard>
          )}

          {selectedTab === 'examenes' && (
            <GlassCard padding="md" className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Calendario de Exámenes de {selectedSubject.name}
              </h3>
              {subjectExams.map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {e.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {e.topics || 'Temario completo'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span>Fecha: {e.date}</span>
                      {e.time && <span>Hora: {e.time}</span>}
                      {e.classroom && <span>Aula: {e.classroom}</span>}
                    </div>
                  </div>
                  <GlassBadge size="sm" color="#EF4444">
                    {getRelativeDayString(e.date)}
                  </GlassBadge>
                </div>
              ))}
            </GlassCard>
          )}

          {selectedTab === 'notas' && (
            <GlassCard padding="md" className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Calificaciones y Criterios
              </h3>
              {subjectGrades.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {g.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {g.category} • Peso: {g.weightPercentage}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {g.score}
                    </span>
                    <span className="text-xs text-slate-400"> / {g.maxScore}</span>
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {selectedTab === 'apuntes' && (
            <GlassCard padding="md">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Notas y Criterios Docentes
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedSubject.notes || 'No se han añadido notas específicas para esta asignatura.'}
              </p>
            </GlassCard>
          )}
        </div>
      ) : (
        /* SUBJECTS CARDS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const avg = getSubjectAverage(sub.id);
            const pendingTasks = tasks.filter(
              (t) => t.subjectId === sub.id && t.status !== 'completada'
            ).length;
            const upExams = exams.filter((e) => e.subjectId === sub.id).length;
            const subMins = sessions
              .filter((s) => s.subjectId === sub.id)
              .reduce((acc, curr) => acc + curr.durationMinutes, 0);

            return (
              <GlassCard
                key={sub.id}
                interactive
                padding="none"
                onClick={() => setSelectedSubjectId(sub.id)}
                className="group flex flex-col justify-between overflow-hidden"
              >
                {/* Subject Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      style={{ backgroundColor: sub.color }}
                      className="p-3 rounded-2xl text-white shadow-md transition-transform group-hover:scale-110"
                    >
                      {getSubjectIcon(sub.icon, 'w-6 h-6')}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(sub, e)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(sub.id, e)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sub.name}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                    {sub.teacher && <div>{sub.teacher}</div>}
                    {sub.classroom && <div>{sub.classroom}</div>}
                  </div>
                </div>

                {/* Subject Metrics Footer */}
                <div className="p-4 bg-slate-50/60 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Nota Media
                    </span>
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                      {avg.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Tareas
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pendingTasks} pend.
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Exámenes
                    </span>
                    <span className="font-semibold text-rose-500">
                      {upExams}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Estudio
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatMinutes(subMins)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveSubject}
        initialData={editingSubject}
      />
    </div>
  );
};
