export const CATEGORIES = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Productivity",
  "Social",
  "Finance",
  "Creative",
  "Other",
];

// Line-icon keys stored in a habit's `icon` field (rendered by HabitIcon).
export const HABIT_ICONS = [
  "droplet",
  "book",
  "activity",
  "dumbbell",
  "wind",
  "moon",
  "leaf",
  "pen",
  "target",
  "heart",
  "clock",
  "coffee",
];

export const ICON_LABELS = {
  droplet: "Water",
  book: "Reading",
  activity: "Movement",
  dumbbell: "Strength",
  wind: "Breathing",
  moon: "Sleep",
  leaf: "Food",
  pen: "Writing",
  target: "Goal",
  heart: "Health",
  clock: "Time",
  coffee: "Coffee",
};

// Habits created before the redesign (and AI suggestions) store emoji —
// map them onto the closest line icon.
const EMOJI_TO_ICON = {
  "💧": "droplet",
  "🚰": "droplet",
  "📚": "book",
  "📖": "book",
  "🏃": "activity",
  "🚶": "activity",
  "🚴": "activity",
  "🏊": "activity",
  "💪": "dumbbell",
  "🏋": "dumbbell",
  "🧘": "wind",
  "🌬": "wind",
  "😴": "moon",
  "🛌": "moon",
  "🌙": "moon",
  "🥗": "leaf",
  "🍎": "leaf",
  "🥦": "leaf",
  "✍": "pen",
  "📝": "pen",
  "📓": "pen",
  "🎯": "target",
  "🧠": "target",
  "❤": "heart",
  "💊": "heart",
  "⏰": "clock",
  "⏱": "clock",
  "☕": "coffee",
};

export const resolveIconKey = (icon) => {
  if (HABIT_ICONS.includes(icon)) return icon;
  const bare = (icon || "").replace(/[️‍]/g, "");
  return EMOJI_TO_ICON[bare] || "target";
};

export const frequencyLabel = (habit) => {
  const days = habit?.targetDays || 7;
  if (habit?.frequency === "weekly") return `Weekly · ${days}×`;
  return days >= 7 ? "Daily" : `${days} days a week`;
};

// Shown in the footer on every page. Replace with your own details.
export const CREDITS = {
  name: "Mazhar Sourav",
  portfolio: "https://mazharsourav.me",
  github: "https://github.com/mazharsourav",
  linkedin: "https://www.linkedin.com/in/mazharsourav",
};
