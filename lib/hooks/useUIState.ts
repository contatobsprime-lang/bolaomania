import { useState, useEffect } from "react";
import type { Modo, StatusFiltro } from "@/lib/types";

export function useUIState() {
    const [modo, setModo] = useState(() =>
        typeof window !== "undefined" ? localStorage.getItem("modoAtual") || "home" : "home"
    );
    const [adminModo, setAdminModo] = useState("resultados");
    const [grupoAtivo, setGrupoAtivo] = useState("A");
    const [faseAtiva, setFaseAtiva] = useState("grupos");
    const [onboarding, setOnboarding] = useState(false);

    // Filtros
    const [rodada, setRodada] = useState(1);
    const [statusF, setStatusF] = useState<StatusFiltro>("proximos");
    const [histRodada, setHistRodada] = useState<number | "todas">("todas");

    // Seleções
    const [jogoSel, setJogoSel] = useState<any | null>(null);
    const [countdown, setCountdown] = useState("");

    // Copiar
    const [copChave, setCopChave] = useState(false);
    const [copCola, setCopCola] = useState(false);
    const [copRank, setCopRank] = useState(false);

    // Loading
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Pull refresh
    const [pullRefresh, setPullRefresh] = useState(0);
    const [notif15min, setNotif15min] = useState(false);

    // Salvar modo no localStorage
    useEffect(() => {
        localStorage.setItem("modoAtual", modo);
    }, [modo]);

    const irParaHome = () => {
        const modoSalvo = localStorage.getItem("modoAtual") || "home";
        setModo(modoSalvo);
    };

    return {
        // Modo
        modo,
        setModo,
        irParaHome,
        adminModo,
        setAdminModo,

        // Grupos/Fases
        grupoAtivo,
        setGrupoAtivo,
        faseAtiva,
        setFaseAtiva,

        // Onboarding
        onboarding,
        setOnboarding,

        // Filtros
        rodada,
        setRodada,
        statusF,
        setStatusF,
        histRodada,
        setHistRodada,

        // Seleções
        jogoSel,
        setJogoSel,
        countdown,
        setCountdown,

        // Copiar
        copChave,
        setCopChave,
        copCola,
        setCopCola,
        copRank,
        setCopRank,

        // Loading
        carregando,
        setCarregando,
        salvando,
        setSalvando,

        // Pull
        pullRefresh,
        setPullRefresh,
        notif15min,
        setNotif15min,
    };
}