import { useState } from "react";
import api from "../api/axios.js";
import Modal from "./Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function SettingsModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [morning, setMorning] = useState(user?.morningMotivation || false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", {
        name: name.trim(),
        morningMotivation: morning,
      });
      updateUser(res.data.user);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Settings" maxWidth="max-w-[480px]">
      <div className="flex flex-col">
        <div className="pb-5">
          <label htmlFor="settings-name" className="label">
            Display name
          </label>
          <input
            id="settings-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!name.trim()}
          />
          {!name.trim() && (
            <p className="mt-1.5 text-xs text-fg">Your name can't be empty.</p>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-line-soft py-4">
          <div className="flex flex-1 flex-col gap-0.5">
            <span id="settings-morning" className="text-sm font-medium">
              Morning note
            </span>
            <span className="text-[13px] leading-snug text-faint">
              A short AI message on the dashboard each morning, written from
              your streaks.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={morning}
            aria-labelledby="settings-morning"
            onClick={() => setMorning((m) => !m)}
            className={`flex h-[26px] w-11 shrink-0 rounded-full p-[3px] transition-colors ${
              morning ? "justify-end bg-accent" : "justify-start bg-line-strong"
            }`}
          >
            <span className="h-5 w-5 rounded-full bg-surface" />
          </button>
        </div>

        <div className="flex items-center gap-4 border-t border-line-soft py-4">
          <div className="flex flex-1 flex-col gap-0.5">
            <span id="settings-theme" className="text-sm font-medium">
              Appearance
            </span>
            <span className="text-[13px] text-faint">
              Same black, white and grey in both.
            </span>
          </div>
          <div role="group" aria-labelledby="settings-theme" className="segmented h-9">
            <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
              Light
            </button>
            <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
              Dark
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 border-t border-line-soft py-4">
          <span className="text-sm font-medium">Email</span>
          <span className="num text-[13px] text-faint">{user?.email}</span>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft pt-5">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={save}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
