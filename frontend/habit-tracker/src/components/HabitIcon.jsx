import {
  Activity,
  BookOpen,
  Clock,
  Coffee,
  Droplet,
  Dumbbell,
  Heart,
  Leaf,
  Moon,
  PenLine,
  Target,
  Wind,
} from "lucide-react";
import { resolveIconKey } from "../utils/constants.js";

const ICONS = {
  droplet: Droplet,
  book: BookOpen,
  activity: Activity,
  dumbbell: Dumbbell,
  wind: Wind,
  moon: Moon,
  leaf: Leaf,
  pen: PenLine,
  target: Target,
  heart: Heart,
  clock: Clock,
  coffee: Coffee,
};

// Just the glyph.
export function IconGlyph({ icon, size = 18 }) {
  const Glyph = ICONS[resolveIconKey(icon)];
  return <Glyph size={size} strokeWidth={1.5} aria-hidden="true" />;
}

// The glyph inside the standard bordered tile.
export default function HabitIcon({ icon, size = 18, className = "" }) {
  return (
    <span className={`icon-tile ${className}`}>
      <IconGlyph icon={icon} size={size} />
    </span>
  );
}
