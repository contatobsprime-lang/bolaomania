import { CONFIG } from "@/lib/constantes";

// ─── Bloqueio de palpites ────────────────────────────────────────────────────

export function lock(dt: string): boolean {
  return (new Date(dt).getTime() - Date.now()) / 60000 <= CONFIG.minutesBloqueio;
}

export function campLock(): boolean {
  return lock(CONFIG.bloqueioCompetidor);
}

// ─── Formatação de datas ─────────────────────────────────────────────────────

export function fmtDLong(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export function fmtD(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export function fmtH(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Countdown ───────────────────────────────────────────────────────────────

export function tr(iso: string): string | null {
  const d = (new Date(iso).getTime() - Date.now()) / 1000;
  if (d <= 0) return null;
  const dy = Math.floor(d / 86400);
  const h  = Math.floor(d / 3600);
  const m  = Math.floor((d % 3600) / 60);
  const s  = Math.floor(d % 60);
  if (dy > 0) return `${dy}d ${h % 24}h ${m}m`;
  if (h > 0)  return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// ─── Status do jogo ──────────────────────────────────────────────────────────

export function statusJ(dt: string, temRes: boolean): "enc" | "live" | "wait" | "prox" {
  const diff = Date.now() - new Date(dt).getTime();
  if (temRes) return "enc";
  if (diff > 0 && diff < 130 * 60000) return "live";
  if (diff >= 130 * 60000) return "wait";
  return "prox";
}