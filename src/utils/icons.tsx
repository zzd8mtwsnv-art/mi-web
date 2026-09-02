import React from 'react';
import {
  Calculator,
  Atom,
  BookOpen,
  Landmark,
  Globe,
  TrendingUp,
  Code,
  Palette,
  Music,
  Compass,
  FlaskConical,
  Languages,
  Brain,
  Sparkles,
  Layers,
  Award,
  Target,
  Clock,
  Flame,
  Calendar,
  BookMarked,
  FileText,
  Activity,
  LucideIcon
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  Atom,
  BookOpen,
  Landmark,
  Globe,
  TrendingUp,
  Code,
  Palette,
  Music,
  Compass,
  FlaskConical,
  Languages,
  Brain,
  Sparkles,
  Layers,
  Award,
  Target,
  Clock,
  Flame,
  Calendar,
  BookMarked,
  FileText,
  Activity
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const AVAILABLE_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
  '#D946EF'  // Fuchsia
];

export const getSubjectIcon = (iconName: string, className = "w-5 h-5") => {
  const IconComponent = ICON_MAP[iconName] || BookOpen;
  return <IconComponent className={className} />;
};
