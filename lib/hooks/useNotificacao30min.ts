import { useState, useEffect } from "react";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import { lock } from "@/lib/utils";

export function useNotificacao30min(
  palpitesMap: Record<string, any>,
  elim: any[],
  usuarioAtual: string | null
) {
  const [popupJogo, setPopupJogo] = useState<any | null>(null);
  const [notif30min, setNotif30min] = useState(false);
  const [countdown, setCountdown] = useState("");

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

      if (diffMs > 0 && diffMs <= 30 * 60 * 1000 && !notif30min) {
        setPopupJogo(prox);
        setNotif30min(true);
        setTimeout(() => setPopupJogo(null), 15000);
      }

      if (diffMs > 0) {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
      } else {
        setCountdown("");
      }
    }

    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, [palpitesMap, elim, usuarioAtual, notif30min]);

  return { popupJogo, setPopupJogo, countdown };
}