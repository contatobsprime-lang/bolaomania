import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ELIM_TMPL } from "@/lib/constantes";

export function useCarregar(mostrarToast: (msg: string, tipo: "ok" | "err") => void) {
    const [usuarios, setUsuarios] = useState<any>({});
    const [palpitesMap, setPalpitesMap] = useState<any>({});
    const [rascunho, setRascunho] = useState<any>({});
    const [res, setRes] = useState<any>({});
    const [resE, setResE] = useState<any>({});
    const [elim, setElim] = useState<any[]>(ELIM_TMPL);
    const [campR, setCampR] = useState("");

    const carregarTudo = useCallback(async () => {
        try {
            const [
                { data: us },
                { data: ps },
                { data: rs },
                { data: es },
                { data: cfg },
            ] = await Promise.all([
                supabase.from("usuarios").select("*"),
                supabase.from("palpites").select("*"),
                supabase.from("resultados").select("*"),
                supabase.from("eliminatorias").select("*"),
                supabase.from("config").select("*"),
            ]);

            if (us) {
                const m: any = {};
                us.forEach((u: any) => {
                    m[u.nome] = {
                        pago: u.pago,
                        camp: u.campeao_palpite || "",
                        email: u.email || "",
                    };
                });
                setUsuarios(m);
            }

            if (ps) {
                const m: any = {};
                ps.forEach((p: any) => {
                    if (!m[p.usuario_nome]) m[p.usuario_nome] = {};
                    m[p.usuario_nome][p.jogo_id] = {
                        gols1: p.gols1?.toString() ?? "",
                        gols2: p.gols2?.toString() ?? "",
                    };
                });
                setPalpitesMap(m);
                setRascunho(m);
            }

            if (rs) {
                const m: any = {};
                rs.forEach((r: any) => {
                    m[r.jogo_id] = {
                        gols1: r.gols1?.toString() ?? "",
                        gols2: r.gols2?.toString() ?? "",
                        penalti: r.penalti,
                    };
                });
                setRes(m);
            }

            if (es && es.length > 0) {
                setElim((prev) =>
                    prev.map((j: any) => {
                        const e = es.find((el: any) => el.jogo_id === j.id);
                        if (!e) return j;
                        return {
                            ...j,
                            time1: e.time1 || "",
                            time2: e.time2 || "",
                            dt: e.data_hora || j.dt,
                            est: e.estadio || j.est,
                            cid: e.cidade || j.cid,
                        };
                    })
                );
                const m: any = {};
                es.forEach((e: any) => {
                    if (e.gols1 !== null || e.gols2 !== null)
                        m[e.jogo_id] = {
                            gols1: e.gols1?.toString() ?? "",
                            gols2: e.gols2?.toString() ?? "",
                            penalti: e.penalti,
                        };
                });
                setResE(m);
            }

            if (cfg) {
                const c = cfg.find((x: any) => x.chave === "campeao_real");
                if (c) setCampR(c.valor || "");
            }

            mostrarToast("✅ Dados atualizados!");
        } catch (e) {
            console.error(e);
        }
    }, [mostrarToast]);

    // Setup realtime
    useEffect(() => {
        carregarTudo();
        const r = setInterval(carregarTudo, 60000);
        const canal = supabase
            .channel("realtime-bolao")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "resultados" },
                () => carregarTudo()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "eliminatorias" },
                () => carregarTudo()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "usuarios" },
                () => carregarTudo()
            )
            .subscribe();
        return () => {
            clearInterval(r);
            supabase.removeChannel(canal);
        };
    }, [carregarTudo]);

    return {
        usuarios,
        setUsuarios,
        palpitesMap,
        setPalpitesMap,
        rascunho,
        setRascunho,
        res,
        setRes,
        resE,
        setResE,
        elim,
        setElim,
        campR,
        setCampR,
        carregarTudo,
    };
}