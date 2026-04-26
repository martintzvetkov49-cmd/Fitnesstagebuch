const STORAGE_KEY = 'fitness_tagebuch_v3';

export function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (d && d.plans) return d;
  } catch (e) {}
  return { plans: [], logs: {}, weeklySchedule: {} };
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
