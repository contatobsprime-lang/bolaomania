import { useState, useEffect, useRef } from "react";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { lock } from "@/lib/utils";

export function useNotificacao30min(
  palpitesMap: Record<string, any>,
  elim: any[],
  usuarioAtual: string | null
) {
  const [popupJogo, setPopupJogo] = useState<any | null>(null);
  const [countdown, setCountdown] = useState("");
  // Guarda ids já notificados para não repetir na mesma sessão
  const notificados = useRef<Set<number>>(new Set());

  useEffect(() => {
    function atualizar() {
      if (!usuarioAtual) {
        setCountdown("");
        return;
      }

      const ps = palpitesMap[usuarioAtual] || {};
      const todos = [...JOGOS_GRUPO, ...elim.filter((j: any) => j.time1)];

      const sem = todos
        .filter((j: any) => {
          const p = ps[j.id];
          return !lock(j.dt) && (!p || p.gols1 === "" || p.gols2 === "");
        })
        .sort((a: any, b: any) => new Date(a.dt).getTime() - new Date(b.dt).getTime());

      if (!sem.length) {
        setCountdown("");
        return;
      }

      const prox = sem[0];
      const diffMs = new Date(prox.dt).getTime() - Date.now();

      // Notifica se estiver dentro de 30min e ainda não notificou esse jogo
      if (diffMs > 0 && diffMs <= 35 * 60 * 1000 && !notificados.current.has(prox.id)) {
        notificados.current.add(prox.id);
        setPopupJogo(prox);
        setTimeout(() => setPopupJogo(null), 15000);
      }

      // Reseta notificação se o jogo já passou (permite renotificar se reabrir app)
      if (diffMs <= 0) {
        notificados.current.delete(prox.id);
      }

      // Countdown
      if (diffMs > 0) {
        const horas = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);

        if (horas > 0) {
          setCountdown(`${horas}h ${mins.toString().padStart(2, "0")}min`);
        } else if (mins > 0) {
          setCountdown(`${mins}min ${secs.toString().padStart(2, "0")}s`);
        } else {
          setCountdown(`${secs}s`);
        }
      } else {
        setCountdown("");
      }
    }

    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, [palpitesMap, elim, usuarioAtual]);

  return { popupJogo, setPopupJogo, countdown };
}