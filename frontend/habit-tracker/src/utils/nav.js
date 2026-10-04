import { BarChart3, CalendarDays, LayoutGrid, LineChart, List } from "lucide-react";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutGrid },
  { to: "/habits", label: "Habits", short: "Habits", icon: List },
  { to: "/weekly", label: "Weekly", short: "Week", icon: CalendarDays },
  { to: "/insights", label: "Insights", short: "Insights", icon: LineChart },
  { to: "/stats", label: "Statistics", short: "Stats", icon: BarChart3 },
];
