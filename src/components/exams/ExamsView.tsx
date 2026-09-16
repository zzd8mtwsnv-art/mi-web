import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { ExamModal } from './ExamModal';
import { ItemDetailModal } from '../common/ItemDetailModal';
import { getRelativeDayString } from '../../utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Award
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { exams, subjects, addExam, updateExam, deleteExam, setActiveView } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedDetailExam, setSelectedDetailExam] = useState<Exam | null>(null);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este examen?')) {
      deleteExam(id);
    }
  };

  const handleSave = (data: Omit<Exam, 'id'>) => {
    if (editingExam) {
      updateExam(editingExam.id, data);
    } else {
      addExam(data);
    }
  };

  // Split into upcoming and past exams
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingExams = sortedExams.filter((e) => new Date(e.date) >= todayDate);
  const pastExams = sortedExams.filter((e) => new Date(e.date) < todayDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Exámenes & Controles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cuenta atrás, temarios y calificaciones de pruebas trimestrales
          </p>
        </div>

        <GlassButton
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Examen
        </GlassButton>
      </div>

      {/* SECTION: PRÓXIMOS EXÁMENES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Próximos Exámenes ({upcomingExams.length})
          </h2>
        </div>

        {upcomingExams.length === 0 ? (
          <GlassCard padding="lg" className="text-center py-10">
            <p className="text-sm text-slate-500">
              No tienes ningún examen programado próximamente. ¡Buen trabajo!
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map((exam) => {
              const sub = subjects.find((s) => s.id === exam.subjectId);
              const countdown = getRelativeDayString(exam.date);

              return (
                <GlassCard
                  key={exam.id}
                  padding="md"
                  onClick={() => setSelectedDetailExam(exam)}
                  className="flex flex-col justify-between group relative overflow-hidden border-rose-500/20 hover:border-rose-500/40 transition-all shadow-md cursor-pointer"
                >
                  <div>
                    {/* Top row: Subject pill + Countdown badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {sub && (
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: sub.color }}
                            className="w-2.5 h-2.5 rounded-full"
                          />
                          <span
                            style={{ color: sub.color }}
                            className="text-xs font-bold"
                          >
                            {sub.name}
                          </span>
                        </div>
                      )}

                      <span className="px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-xs shadow-sm">
                        {countdown}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {exam.title}
                    </h3>

                    {exam.topics && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed bg-white/40 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/40 dark:border-white/5 line-clamp-2">
                        {exam.topics}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{exam.date}</span>
                      </div>
                      {exam.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exam.time}</span>
                        </div>
                      )}
                      {exam.classroom && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{exam.classroom}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-200/50 dark:border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView('planner');
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Planificar Estudio
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(exam);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(exam.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: EXÁMENES REALIZADOS */}
      {pastExams.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Exámenes Realizados & Calificaciones ({pastExams.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastExams.map((exam) => {
              const sub = subjects.find((s) => s.id === exam.subjectId);

              return (
                <GlassCard
                  key={exam.id}
                  padding="md"
                  onClick={() => setSelectedDetailExam(exam)}
                  className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {sub && (
                        <span style={{ color: sub.color }} className="text-xs font-bold block mb-1">
                          {sub.name}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {exam.title}
                      </h3>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Realizado el {exam.date}
                      </span>
                    </div>

                    {exam.grade !== undefined ? (
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                          {exam.grade}
                        </span>
                        <span className="text-xs text-slate-400"> / {exam.maxGrade || 10}</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(exam);
                        }}
                        className="text-xs font-semibold text-indigo-500 hover:underline"
                      >
                        + Añadir nota
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={Boolean(selectedDetailExam)}
        onClose={() => setSelectedDetailExam(null)}
        item={selectedDetailExam}
        itemType="exam"
        onEdit={(exam) => {
          setSelectedDetailExam(null);
          handleOpenEdit(exam);
        }}
        onDelete={(id) => {
          handleDelete(id);
          setSelectedDetailExam(null);
        }}
      />

      {/* Modal */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingExam}
      />
    </div>
  );
};
