/**
 * Davetiye temaları. Hem editör canlı önizlemesi hem de /embed sayfası
 * aynı tema tanımlarını kullanır.
 */
export interface Theme {
  id: string;
  label: string;
  bg: string; // sayfa arka planı
  panel: string; // kart arka planı
  text: string; // ana metin
  muted: string; // ikincil metin
  accent: string; // vurgu (butonlar, başlık)
  accentText: string; // vurgu üzerindeki metin
  heading: string; // başlık font-family
}

export const THEMES: Record<string, Theme> = {
  classic: {
    id: "classic",
    label: "Klasik (Fildişi & Altın)",
    bg: "#f7f3ec",
    panel: "#fffdf8",
    text: "#3a3226",
    muted: "#8a7f6d",
    accent: "#b08d57",
    accentText: "#fffdf8",
    heading: "'Playfair Display', Georgia, serif",
  },
  romantic: {
    id: "romantic",
    label: "Romantik (Pudra & Gül)",
    bg: "#fbeef0",
    panel: "#fffafb",
    text: "#5a3540",
    muted: "#a9808c",
    accent: "#d98a9e",
    accentText: "#ffffff",
    heading: "'Playfair Display', Georgia, serif",
  },
  modern: {
    id: "modern",
    label: "Modern (Antrasit & Zümrüt)",
    bg: "#12161a",
    panel: "#1b2127",
    text: "#e8edf1",
    muted: "#9aa7b1",
    accent: "#37b98a",
    accentText: "#0b0f12",
    heading: "'Poppins', system-ui, sans-serif",
  },
  minimal: {
    id: "minimal",
    label: "Minimal (Beyaz & Siyah)",
    bg: "#ffffff",
    panel: "#ffffff",
    text: "#111111",
    muted: "#777777",
    accent: "#111111",
    accentText: "#ffffff",
    heading: "'Poppins', system-ui, sans-serif",
  },
};

export const DEFAULT_THEME = "classic";

export function getTheme(id?: string | null): Theme {
  return THEMES[id ?? ""] ?? THEMES[DEFAULT_THEME];
}

export const THEME_OPTIONS = Object.values(THEMES).map((t) => ({
  value: t.id,
  label: t.label,
}));
