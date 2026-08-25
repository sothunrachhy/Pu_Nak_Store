export function formatMoney(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `$${n.toFixed(2)}`;
}

export function formatDate(date: Date | string, lang: "en" | "km") {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(lang === "km" ? "km-KH" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const WEEKDAY_SHORT = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  km: ["អា", "ចន្ទ", "អង្គ", "ពុធ", "ព្រហ", "សុក្រ", "សៅរ៍"],
} as const;

export function shortWeekday(date: Date | string, lang: "en" | "km") {
  const d = typeof date === "string" ? new Date(date) : date;
  return WEEKDAY_SHORT[lang][d.getDay()];
}
