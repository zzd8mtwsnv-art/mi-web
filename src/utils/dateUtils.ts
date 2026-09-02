// Date formatting, countdowns, and schedule slot helpers

export const SPANISH_DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

export const SPANISH_MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

// Returns human readable relative day (e.g., "Hoy", "Mañana", "En 4 días", "Hace 2 días")
export function getRelativeDayString(dateStr: string): string {
  if (!dateStr) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === 2) return 'Pasado mañana';
  if (diffDays > 2) return `En ${diffDays} días`;
  if (diffDays === -1) return 'Ayer';
  return `Hace ${Math.abs(diffDays)} días`;
}

// Format full date in Spanish: "Martes, 1 de Septiembre"
export function formatHeaderDate(date: Date = new Date()): string {
  const dayName = SPANISH_DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = SPANISH_MONTHS[date.getMonth()];
  return `${dayName}, ${dayNum} de ${monthName}`;
}

// Format minutes to "1h 45m" or "45m"
export function formatMinutes(minutes: number): string {
  if (minutes < 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// Format seconds into MM:SS
export function formatSecondsToTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Returns YYYY-MM-DD for current local date
export function getTodayDateString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Returns ISO day of week: 1=Mon, 2=Tue, ..., 7=Sun
export function getDayOfWeekIndex(date: Date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}
