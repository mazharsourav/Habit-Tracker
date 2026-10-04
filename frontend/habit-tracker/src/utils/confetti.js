import confetti from "canvas-confetti";

const INK = () =>
  document.documentElement.classList.contains("dark")
    ? ["#fafafa", "#a3a3a3", "#525252"]
    : ["#0a0a0a", "#525252", "#a3a3a3"];

export const celebrate = (origin = { x: 0.5, y: 0.6 }) => {
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 32,
    scalar: 0.8,
    origin,
    colors: INK(),
    disableForReducedMotion: true,
  });
};

export const celebrateBig = () => {
  const duration = 700;
  const end = Date.now() + duration;
  const colors = INK();
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors, disableForReducedMotion: true });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};
