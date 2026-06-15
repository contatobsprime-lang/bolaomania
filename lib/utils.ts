import { CONFIG } from "@/lib/constantes";

// ─── Força UTC em strings sem timezone ───────────────────────────────────────

function toUTC(dt: string): Date {
  if (!dt) return new Date(NaN);
  const s = dt.includes("T") ? dt : dt.replace(" ", "T");
  return new Date(s);
}

// ─── Bloqueio de palpites ────────────────────────────────────────────────────

export function lock(dt: string): boolean {
  return (toUTC(dt).getTime() - Date.now()) / 60000 <= CONFIG.minutesBloqueio;
}

export function campLock(): boolean {
  return lock(CONFIG.bloqueioCompetidor);
}

// ─── Formatação de datas ─────────────────────────────────────────────────────

export function fmtDLong(iso: string): string {
  return toUTC(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "America/Sao_Paulo" });
}

export function fmtD(iso: string): string {
  return toUTC(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
}

export function fmtH(iso: string): string {
  return toUTC(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

// ─── Countdown ───────────────────────────────────────────────────────────────

export function tr(iso: string): string | null {
  const d = (toUTC(iso).getTime() - Date.now()) / 1000;
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

export function statusJ(dt: string, temRes: boolean, isElim = false): "enc" | "live" | "wait" | "prox" {
  const diff = Date.now() - toUTC(dt).getTime();
  const janela = isElim ? 200 * 60000 : 130 * 60000;
  if (temRes) return "enc";
  if (diff > 0 && diff < janela) return "live";
  if (diff >= janela) return "wait";
  return "prox";
}