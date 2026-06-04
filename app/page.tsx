"use client";

import "@/styles/app.css";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import PixQRCode from "@/components/PixQRCode";
import { CONFIG, ADMIN_EMAIL, GRUPOS, TODOS_TIMES, F, MEDAL, FASE_L, ELIM_TMPL } from "@/lib/constantes";
import { JOGOS_GRUPO } from "@/data/jogos-grupo";
import type { Jogo, Palpite, Resultado, Usuario, DetJogo, RankingEntry, ToastTipo, Modo, StatusFiltro, HistRodada, Tela } from "@/lib/types";
import { lock, campLock, fmtD, fmtDLong, fmtH, tr, statusJ } from "@/lib/utils";
import { calcJogo, calcTudo, calcPremios, desempate, calcBadges, pts } from "@/lib/calculos";

import TelaLogin from "@/components/TelaLogin";
import TelaCadastro from "@/components/TelaCadastro";
import TelaRecuperarSenha from "@/components/TelaRecuperarSenha";
import TelaJogos from "@/components/TelaJogos";
import TelaPalpites from "@/components/TelaPalpites";
import TelaRanking from "@/components/TelaRanking";
import TelaHistorico from "@/components/TelaHistorico";
import TelaPix from "@/components/TelaPix";
import TelaPerfil from "@/components/TelaPerfil";
import TelaCampeao from "@/components/TelaCampeao";
import TelaAdmin from "@/components/TelaAdmin";
import TelaRegras from "@/components/TelaRegras";
import TelaFeed from "@/components/TelaFeed";
import TelaHome from "@/components/TelaHome";
import TelaMais from "@/components/TelaMais";
import NavBar from "@/components/NavBar";

export default function App() {
    const [tela, setTela] = useState<Tela>("login");
    const [onboarding, setOnboarding] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [toast, setToast] = useState<{ msg: string, tipo: "ok" | "err" } | null>(null);
    const [confetis, setConfetis] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any>({});
    const [usuarioAtual, setUsuarioAtual] = useState<string | null>(null);
    const [emailAtual, setEmailAtual] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loginEmail, setLoginEmail] = useState(""); 
    const [loginSenha, setLoginSenha] = useState(""); 
    const [loginErro, setLoginErro] = useState("");
    const [cadNome, setCadNome] = useState(""); 
    const [cadEmail, setCadEmail] = useState(""); 
    const [cadSenha, setCadSenha] = useState(""); 
    const [cadSenha2, setCadSenha2] = useState(""); 
    const [cadErro, setCadErro] = useState("");
    const [esqueceuEmail, setEsqueceuEmail] = useState(""); 
    const [esqueceuSent, setEsqueceuSent] = useState(false); 
    const [elim, setElim] = useState<any[]>(ELIM_TMPL);
    const [palpitesMap, setPalpitesMap] = useState<any>({});
    const [rascunho, setRascunho] = useState<any>({});
    const [res, setRes] = useState<any>({});
    const [resE, setResE] = useState<any>({});
    const [campR, setCampR] = useState("");
    const [grupoAtivo, setGrupoAtivo] = useState("A");
    const [faseAtiva, setFaseAtiva] = useState("grupos");
    const [modo, setModo] = useState(() =>
        typeof window !== "undefined" ? localStorage.getItem("modoAtual") || "home" : "home"
    );
    const [adminModo, setAdminModo] = useState("resultados");
    const [copChave, setCopChave] = useState(false);
    const [copCola, setCopCola] = useState(false);
    const [copRank, setCopRank] = useState(false);
    const [rodada, setRodada] = useState(1);
    const [statusF, setStatusF] = useState<"proximos" | "aovivo" | "terminados">("proximos");
    const [jogoSel, setJogoSel] = useState<any | null>(null);
    const [countdown, setCountdown] = useState("");
    const [histRodada, setHistRodada] = useState<number | "todas">("todas");
    const [feed, setFeed] = useState<any[]>([]);
    const [, setTick] = useState(0);
    const [sessaoCarregando, setSessaoCarregando] = useState(true);
    const [pullRefresh, setPullRefresh] = useState(0);
    const [notif30min, setNotif30min] = useState(false);

    const irParaHome = () => {
        const modoSalvo = localStorage.getItem("modoAtual") || "home";
        setModo(modoSalvo);
    };

    // Pull to refresh
    useEffect(() => {
        let startY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                const diff = e.touches[0].clientY - startY;
                if (diff > 0) setPullRefresh(Math.min(diff, 100));
            }
        };
        const handleTouchEnd = () => {
            if (pullRefresh > 60) carregarTudo();
            setPullRefresh(0);
        };
        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);
        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [pullRefresh]);

    useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 30000); return () => clearInterval(t); }, []);

    useEffect(() => {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const search = typeof window !== "undefined" ? window.location.search : "";

        if (hash.includes("type=recovery") || search.includes("type=recovery")) {
            setTela("recuperar");
            setSessaoCarregando(false);
        } else {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    const email = session.user.email || "";
                    setEmailAtual(email);
                    setIsAdmin(email === ADMIN_EMAIL);
                    supabase.from("usuarios").select("*").eq("email", email).single().then(({ data }) => {
                        if (data) { 
                            setUsuarioAtual(data.nome); 
                            setUsuarios((prev: any) => ({ ...prev, [data.nome]: { pago: data.pago, camp: data.campeao_palpite || "", email: data.email || "" } })); 
                            setTela("app"); 
                            const modoSalvo = localStorage.getItem("modoAtual") || "home"; 
                            setModo(modoSalvo); 
                        }
                        setSessaoCarregando(false);
                    });
                } else { setSessaoCarregando(false); }
            });
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === "PASSWORD_RECOVERY") {
                setTela("recuperar");
                return;
            }
            if (!session) { setUsuarioAtual(null); setEmailAtual(null); setIsAdmin(false); setTela("login"); }
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        function atualizar() {
            const ps = palpitesMap[usuarioAtual || ""] || {};
            const todos = [...JOGOS_GRUPO, ...elim.filter((j: any) => j.time1)];
            const sem = todos.filter((j: any) => { 
                const p = ps[j.id]; 
                return !lock(j.dt) && (!p || p.gols1 === "" || p.gols2 === ""); 
            }).sort((a: any, b: any) => new Date(a.dt).getTime() - new Date(b.dt).getTime());
            
            if (!sem.length) { setCountdown(""); return; }
            const prox = sem[0], t = tr(prox.dt);
            
            // Notificação 30 minutos antes
            const diffMs = new Date(prox.dt).getTime() - Date.now();
            if (diffMs > 0 && diffMs <= 30 * 60 * 1000 && !notif30min) {
                mostrarToast(`⏰ ${F[prox.time1] || ""}${prox.time1} × ${prox.time2}${F[prox.time2] || ""} começa em 30min!`, "ok");
                setNotif30min(true);
            }
            
            if (!t) { setCountdown(""); return; }
            setCountdown(`${F[prox.time1] || ""}${prox.time1} × ${prox.time2}${F[prox.time2] || ""} — ${t}`);
        }
        atualizar();
        const t = setInterval(atualizar, 1000);
        return () => clearInterval(t);
    }, [palpitesMap, elim, usuarioAtual, notif30min]);

    function mostrarToast(msg: string, tipo: "ok" | "err" = "ok") { 
        setToast({ msg, tipo }); 
        setTimeout(() => setToast(null), 2500); 
    }

    function dispararConfete() {
        const em = ["🎉", "⭐", "🏆", "✨", "🎊", "⚽", "🥇"];
        setConfetis(Array.from({ length: 10 }, (_, i) => ({ id: Date.now() + i, e: em[i % em.length], l: `${10 + Math.random() * 80}%`, d: `${Math.random() * 0.4}s` })));
        setTimeout(() => setConfetis([]), 1500);
    }

    const carregarTudo = useCallback(async () => {
        try {
            const [{ data: us }, { data: ps }, { data: rs }, { data: es }, { data: cfg }] = await Promise.all([
                supabase.from("usuarios").select("*"),
                supabase.from("palpites").select("*"),
                supabase.from("resultados").select("*"),
                supabase.from("eliminatorias").select("*"),
                supabase.from("config").select("*"),
            ]);
            if (us) { 
                const m: any = {}; 
                us.forEach((u: any) => { 
                    m[u.nome] = { pago: u.pago, camp: u.campeao_palpite || "", email: u.email || "" }; 
                }); 
                setUsuarios(m); 
            }
            if (ps) { 
                const m: any = {}; 
                ps.forEach((p: any) => { 
                    if (!m[p.usuario_nome]) m[p.usuario_nome] = {}; 
                    m[p.usuario_nome][p.jogo_id] = { gols1: p.gols1?.toString() ?? "", gols2: p.gols2?.toString() ?? "" }; 
                }); 
                setPalpitesMap(m); 
                setRascunho(m); 
            }
            if (rs) { 
                const m: any = {}; 
                rs.forEach((r: any) => { 
                    m[r.jogo_id] = { gols1: r.gols1?.toString() ?? "", gols2: r.gols2?.toString() ?? "", penalti: r.penalti }; 
                }); 
                setRes(m); 
            }
            if (es && es.length > 0) {
                setElim(prev => prev.map((j: any) => { 
                    const e = es.find((el: any) => el.jogo_id === j.id); 
                    if (!e) return j; 
                    return { ...j, time1: e.time1 || "", time2: e.time2 || "", dt: e.data_hora || j.dt, est: e.estadio || j.est, cid: e.cidade || j.cid }; 
                }));
                const m: any = {}; 
                es.forEach((e: any) => { 
                    if (e.gols1 !== null || e.gols2 !== null) 
                        m[e.jogo_id] = { gols1: e.gols1?.toString() ?? "", gols2: e.gols2?.toString() ?? "", penalti: e.penalti }; 
                }); 
                setResE(m);
            }
            if (cfg) { 
                const c = cfg.find((x: any) => x.chave === "campeao_real"); 
                if (c) setCampR(c.valor || ""); 
            }
            mostrarToast("✅ Dados atualizados!");
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        carregarTudo();
        const r = setInterval(carregarTudo, 60000);
        const canal = supabase.channel("realtime-bolao")
            .on("postgres_changes", { event: "*", schema: "public", table: "resultados" }, () => carregarTudo())
            .on("postgres_changes", { event: "*", schema: "public", table: "eliminatorias" }, () => carregarTudo())
            .on("postgres_changes", { event: "*", schema: "public", table: "usuarios" }, () => carregarTudo())
            .subscribe();
        return () => { clearInterval(r); supabase.removeChannel(canal); };
    }, [carregarTudo]);

    useEffect(() => { 
        if (usuarioAtual) 
            setRascunho((prev: any) => ({ ...prev, [usuarioAtual]: { ...(palpitesMap[usuarioAtual] || {}) } })); 
    }, [usuarioAtual]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [modo]);

    useEffect(() => {
        localStorage.setItem("modoAtual", modo);
    }, [modo]);

    const palS = palpitesMap[usuarioAtual || ""] || {};
    const palR = rascunho[usuarioAtual || ""] || {};
    const u = usuarios[usuarioAtual || ""] || {};
    const pago = u.pago || false;

    useEffect(() => {
        if (pago || !usuarioAtual) return;
        const poll = setInterval(async () => {
            const { data } = await supabase.from("usuarios").select("pago").eq("nome", usuarioAtual).single();
            if (data?.pago) {
                setUsuarios((prev: any) => ({ ...prev, [usuarioAtual]: { ...prev[usuarioAtual], pago: true } }));
                dispararConfete();
                mostrarToast("🎉 Pagamento confirmado! Bem-vindo ao bolão!");
                clearInterval(poll);
            }
        }, 5000);
        return () => clearInterval(poll);
    }, [pago, usuarioAtual]);

    const campAtual = u.camp || "";
    const nPart = Object.keys(usuarios).length;
    const nPagos = Object.values(usuarios).filter((u: any) => u.pago).length;
    const premios = calcPremios(nPagos);
    const totSalvos = Object.values(palS).filter((p: any) => p.gols1 !== "" && p.gols1 !== undefined && p.gols2 !== "" && p.gols2 !== undefined).length;
    const totJogos = JOGOS_GRUPO.length + elim.filter((j: any) => j.time1).length;
    const pctPal = totJogos > 0 ? Math.round(totSalvos / totJogos * 100) : 0;
    const temRasc = Object.keys(palR).some(id => { const r = palR[id], s = palS[id] || {}; return r.gols1 !== s.gols1 || r.gols2 !== s.gols2; });

    const ranking = Object.keys(usuarios).map(nome => {
        const p = palpitesMap[nome] || {}, camp = usuarios[nome]?.camp || "";
        const { pontos, acertos, placares, bonusCampeao, det } = calcTudo(p, elim, res, resE, camp, campR);
        return { nome, pontos, acertos, placares, bonusCampeao, det, campeao: camp, campR, pago: usuarios[nome]?.pago };
    }).sort(desempate);

    const minhaPos = ranking.findIndex(r => r.nome === usuarioAtual) + 1;
    const meusDados = ranking.find(r => r.nome === usuarioAtual);

    const jogosRodada = JOGOS_GRUPO.filter(j => j.r === rodada);
    const jogosFiltrados = jogosRodada.filter(j => {
        const r = res[j.id] || {};
        const temRes = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
        const s = statusJ(j.dt, temRes);
        if (statusF === "proximos") return s === "prox";
        if (statusF === "aovivo") return s === "live" || s === "wait";
        return s === "enc";
    });

    async function handleLogin() {
        setCarregando(true); setLoginErro("");
        const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginSenha });
        if (error || !data.user) { setCarregando(false); setLoginErro("Email ou senha incorretos."); return; }
        const email = data.user.email || "";
        setEmailAtual(email); setIsAdmin(email === ADMIN_EMAIL);
        const { data: u } = await supabase.from("usuarios").select("*").eq("email", email).single();
        setCarregando(false);
        if (!u) { setLoginErro("Usuário não encontrado na tabela."); return; }
        setUsuarioAtual(u.nome); setLoginEmail(""); setLoginSenha("");
        setUsuarios((prev: any) => ({ ...prev, [u.nome]: { pago: u.pago, camp: u.campeao_palpite || "" } }));
        const jaViu = typeof window !== "undefined" && localStorage.getItem(`ob_${u.nome}`);
        if (!jaViu) { setOnboarding(true); if (typeof window !== "undefined") localStorage.setItem(`ob_${u.nome}`, "1"); }
        setTela("app"); irParaHome();
    }

    async function handleCadastro() {
        const nome = cadNome.trim(); const email = cadEmail.trim();
        if (!nome) { setCadErro("Digite seu nome."); return; }
        if (!email || !email.includes("@")) { setCadErro("Digite um email válido."); return; }
        if (cadSenha.length < 6) { setCadErro("Mínimo 6 caracteres."); return; }
        if (cadSenha !== cadSenha2) { setCadErro("Senhas não conferem."); return; }
        setCarregando(true); setCadErro("");
        const { data, error } = await supabase.auth.signUp({ email, password: cadSenha });
        if (error) { setCarregando(false); setCadErro(error.message === "User already registered" ? "Email já cadastrado." : error.message); return; }
        const { error: err2 } = await supabase.from("usuarios").insert({ nome, email, pago: false, campeao_palpite: "" });
        setCarregando(false);
        if (err2) { setCadErro(err2.code === "23505" ? "Nome ou email já cadastrado." : "Erro ao criar conta."); return; }
        setEmailAtual(email); setIsAdmin(email === ADMIN_EMAIL);
        setUsuarios((prev: any) => ({ ...prev, [nome]: { pago: false, camp: "" } }));
        setUsuarioAtual(nome); setCadNome(""); setCadEmail(""); setCadSenha(""); setCadSenha2("");
        setOnboarding(true); if (typeof window !== "undefined") localStorage.setItem(`ob_${nome}`, "1");
        setTela("app"); irParaHome();
    }

    function setPalLocal(jogoId: number, campo: string, valor: string, dt: string) {
        if (lock(dt) || !usuarioAtual) return;
        setRascunho((prev: any) => ({ ...prev, [usuarioAtual]: { ...(prev[usuarioAtual] || {}), [jogoId]: { ...(prev[usuarioAtual]?.[jogoId] || {}), [campo]: valor } } }));
    }

    async function confirmarPalpite(jogo: any) {
        if (!usuarioAtual || salvando) return;
        if (!pago) { mostrarToast("Faça o pagamento primeiro!", "err"); return; }
        const p = palR[jogo.id] || {};
        const g1 = parseInt(p.gols1), g2 = parseInt(p.gols2);
        if (isNaN(g1) || isNaN(g2) || p.gols1 === "" || p.gols2 === "") { mostrarToast("Preencha os dois placares", "err"); return; }
        setSalvando(true);
        const { error } = await supabase.from("palpites").upsert({ usuario_nome: usuarioAtual, jogo_id: jogo.id, gols1: g1, gols2: g2 }, { onConflict: "usuario_nome,jogo_id" });
        setSalvando(false);
        if (error) { mostrarToast("Erro ao salvar", "err"); return; }
        setPalpitesMap((prev: any) => ({ ...prev, [usuarioAtual]: { ...(prev[usuarioAtual] || {}), [jogo.id]: { gols1: g1.toString(), gols2: g2.toString() } } }));
        mostrarToast("✅ Palpite confirmado!"); setJogoSel(null);
    }

    async function salvarGrupo() {
        if (!usuarioAtual || salvando) return;
        if (!pago) { mostrarToast("Faça o pagamento primeiro!", "err"); return; }
        setSalvando(true);
        const ups: any[] = [];
        JOGOS_GRUPO.filter(j => j.g === grupoAtivo).forEach(j => {
            const p = palR[j.id] || {}; const g1 = parseInt(p.gols1), g2 = parseInt(p.gols2);
            if (!isNaN(g1) && !isNaN(g2) && p.gols1 !== "" && p.gols2 !== "") ups.push({ usuario_nome: usuarioAtual, jogo_id: j.id, gols1: g1, gols2: g2 });
        });
        if (ups.length > 0) {
            const { error } = await supabase.from("palpites").upsert(ups, { onConflict: "usuario_nome,jogo_id" });
            if (!error) { setPalpitesMap((prev: any) => ({ ...prev, [usuarioAtual]: { ...(prev[usuarioAtual] || {}), ...Object.fromEntries(ups.map(u => ([u.jogo_id, { gols1: u.gols1.toString(), gols2: u.gols2.toString() }]))) } })); mostrarToast(`✅ ${ups.length} palpites salvos!`); }
            else mostrarToast("Erro ao salvar", "err");
        } else mostrarToast("Nenhum palpite completo", "err");
        setSalvando(false);
    }

    async function salvarElim() {
        if (!usuarioAtual || salvando) return;
        if (!pago) { mostrarToast("Faça o pagamento primeiro!", "err"); return; }
        setSalvando(true);
        const ups: any[] = [];
        elim.filter(j => j.fase === faseAtiva && j.time1 && j.time2).forEach(j => {
            const p = palR[j.id] || {}; const g1 = parseInt(p.gols1), g2 = parseInt(p.gols2);
            if (!isNaN(g1) && !isNaN(g2) && p.gols1 !== "" && p.gols2 !== "") ups.push({ usuario_nome: usuarioAtual, jogo_id: j.id, gols1: g1, gols2: g2 });
        });
        if (ups.length > 0) {
            const { error } = await supabase.from("palpites").upsert(ups, { onConflict: "usuario_nome,jogo_id" });
            if (!error) { setPalpitesMap((prev: any) => ({ ...prev, [usuarioAtual]: { ...(prev[usuarioAtual] || {}), ...Object.fromEntries(ups.map(u => ([u.jogo_id, { gols1: u.gols1.toString(), gols2: u.gols2.toString() }]))) } })); mostrarToast(`✅ ${ups.length} palpites salvos!`); }
            else mostrarToast("Erro ao salvar", "err");
        } else mostrarToast("Nenhum palpite completo", "err");
        setSalvando(false);
    }

    async function setCamp(time: string) {
        if (!usuarioAtual || campLock()) return;
        if (!pago) { mostrarToast("Faça o pagamento primeiro!", "err"); return; }
        setUsuarios((prev: any) => ({ ...prev, [usuarioAtual]: { ...prev[usuarioAtual], camp: time } }));
        await supabase.from("usuarios").update({ campeao_palpite: time }).eq("nome", usuarioAtual);
        mostrarToast("🏆 Campeão salvo!");
    }

    async function setResAdmin(jId: number, campo: string, valor: string) {
        setRes((prev: any) => ({ ...prev, [jId]: { ...(prev[jId] || {}), [campo]: valor } }));
        const r = { ...(res[jId] || {}), [campo]: valor };
        const g1 = parseInt(r.gols1), g2 = parseInt(r.gols2);
        if (!isNaN(g1) && !isNaN(g2) && r.gols1 !== "" && r.gols2 !== "") {
            await supabase.from("resultados").upsert({ jogo_id: jId, gols1: g1, gols2: g2, penalti: r.penalti || false }, { onConflict: "jogo_id" });
            mostrarToast("✅ Resultado salvo!");
        }
    }

    async function setResEAdmin(jId: number, campo: string, valor: any) {
        setResE((prev: any) => ({ ...prev, [jId]: { ...(prev[jId] || {}), [campo]: valor } }));
        const r = { ...(resE[jId] || {}), [campo]: valor };
        const payload: any = { jogo_id: jId, penalti: r.penalti || false };
        const g1 = typeof r.gols1 === "string" ? parseInt(r.gols1) : r.gols1;
        const g2 = typeof r.gols2 === "string" ? parseInt(r.gols2) : r.gols2;
        if (!isNaN(g1) && r.gols1 !== "") payload.gols1 = g1;
        if (!isNaN(g2) && r.gols2 !== "") payload.gols2 = g2;
        if (payload.gols1 !== undefined && payload.gols2 !== undefined) {
            await supabase.from("eliminatorias").upsert(payload, { onConflict: "jogo_id" });
            mostrarToast("✅ Resultado salvo!");
        }
    }

    async function updateElimT(jId: number, campo: string, valor: string) {
        setElim((prev: any[]) => prev.map(j => j.id === jId ? { ...j, [campo]: valor } : j));
        await supabase.from("eliminatorias").upsert({ jogo_id: jId, [campo]: valor }, { onConflict: "jogo_id" });
    }

    function handleLogout() {
        supabase.auth.signOut();
        setUsuarioAtual(null); setEmailAtual(null); setIsAdmin(false);
        setTela("login");
        if (typeof window !== "undefined") localStorage.clear();
    }

    async function togglePago(nome: string) {
        const novo = !usuarios[nome]?.pago;
        setUsuarios((prev: any) => ({ ...prev, [nome]: { ...prev[nome], pago: novo } }));
        await supabase.from("usuarios").update({ pago: novo }).eq("nome", nome);
        mostrarToast(novo ? "✅ Pagamento confirmado!" : "⚠ Marcado como pendente");
    }

    async function atualizarCampR(time: string) {
        setCampR(time);
        await supabase.from("config").upsert({ chave: "campeao_real", valor: time }, { onConflict: "chave" });
        mostrarToast("🏆 Campeão real salvo!");
    }

    async function resetarSenha(nome: string, email: string) {
        if (!email) { mostrarToast("Email não encontrado", "err"); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: typeof window !== "undefined" ? window.location.origin : "" });
        if (error) { mostrarToast("Erro ao enviar email", "err"); return; }
        mostrarToast(`📧 Email de reset enviado para ${email}!`);
    }

    function exportarRanking() {
        const txt = `🏆 BOLÃO COPA 2026\n\n${ranking.map((p, i) => `${MEDAL[i] || `${i + 1}º`} ${p.nome} — ${p.pontos}pts`).join("\n")}\n\n💰 ${premios.dist.map(d => `${d.pos}º R$${d.valor}`).join(" | ")}`;
        navigator.clipboard.writeText(txt); 
        setCopRank(true); 
        setTimeout(() => setCopRank(false), 2500);
    }

    // Componente do card de jogo para admin
    function JogoCardAdmin({ jogo, isElim = false }: any) {
        const r = isElim ? (resE[jogo.id] || {}) : (res[jogo.id] || {});
        const temRes = r.gols1 !== undefined && r.gols1 !== "" && r.gols2 !== undefined && r.gols2 !== "";
        return (
            <div style={{ padding: "12px", border: `1.5px solid ${temRes ? "#86efac" : "#e5e7eb"}` }} className="card">
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                    📍 {jogo.est || jogo.estadio} · {fmtD(jogo.dt || jogo.dataHora)} {fmtH(jogo.dt || jogo.dataHora)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 26 }}>{F[jogo.time1] || "🏳️"}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{jogo.time1 || "A definir"}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 8px", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input type="number" min={0} max={30} className={`si r${temRes ? " f" : ""}`} value={r.gols1 ?? ""} onChange={e => isElim ? setResEAdmin(jogo.id, "gols1", e.target.value) : setResAdmin(jogo.id, "gols1", e.target.value)} placeholder="—" />
                            <span style={{ color: "#d1d5db", fontSize: 14 }}>×</span>
                            <input type="number" min={0} max={30} className={`si r${temRes ? " f" : ""}`} value={r.gols2 ?? ""} onChange={e => isElim ? setResEAdmin(jogo.id, "gols2", e.target.value) : setResAdmin(jogo.id, "gols2", e.target.value)} placeholder="—" />
                        </div>
                        {isElim && jogo.fase !== "grupos" && (
                            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>
                                <input type="checkbox" checked={r.penalti || false} onChange={e => setResEAdmin(jogo.id, "penalti", e.target.checked)} style={{ width: 14, height: 14 }} /> Pênalti
                            </label>
                        )}
                    </div>
                    <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 26 }}>{F[jogo.time2] || "🏳️"}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{jogo.time2 || "A definir"}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f5f7fa", color: "#111827", fontFamily: "'Inter',sans-serif", userSelect: "none", WebkitUserSelect: "none", paddingBottom: tela === "app" ? "72px" : "0" }}>
            {/* BANNER FIXO NO TOPO */}
            <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { if (tela === "admin") { setTela("app"); irParaHome(); } else irParaHome(); }}>
                    <div style={{ width: 36, height: 36, background: "#16a34a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚽</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-.3px" }}>Bolão Copa 2026</div>
                    </div>
                </div>
                {tela === "app" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {!pago && <span className="badge br" onClick={() => setModo("pix")} style={{ cursor: "pointer" }}>💳 Pagar</span>}
                    </div>
                )}
                {tela === "admin" && (
                    <button style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }} onClick={() => { setTela("app"); irParaHome(); }}>← Voltar</button>
                )}
            </div>

            {/* MODALS E OVERLAYS */}
            {sessaoCarregando && (
                <div style={{ position: "fixed", inset: 0, background: "#f5f7fa", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                    <div style={{ width: 72, height: 72, background: "#16a34a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>⚽</div>
                    <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                    <div style={{ fontSize: 14, color: "#9ca3af" }}>Carregando...</div>
                </div>
            )}

            {confetis.map(c => <div key={c.id} className="cf" style={{ left: c.l, animationDelay: c.d }}>{c.e}</div>)}

            {toast && (
                <div style={{
                    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9998,
                    background: toast.tipo === "ok" ? "#166534" : "#b91c1c",
                    color: "#fff",
                    padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                    whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.4)"
                }}>
                    {toast.msg}
                </div>
            )}

            {onboarding && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9997, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                    <div className="card" style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: "32px 24px" }}>
                        <div style={{ width: 72, height: 72, background: "#16a34a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 16px" }}>⚽</div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#111827" }}>Bem-vindo ao <span style={{ color: "#16a34a" }}>Bolão 2026!</span></h2>
                        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20, lineHeight: 1.7 }}>EUA · México · Canadá · 11 Jun – 19 Jul 2026</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" }}>
                            {[["🎯", "Placar exato", `+5 pts (grupos)`], ["⚽", "Acertar vencedor", "+2 pts (grupos)"],
                            ["🏆", "Campeão da Copa", `+${CONFIG.bonusCampeao} pts bônus`],
                            ["🔒", "Palpites fecham", `${CONFIG.minutesBloqueio}min antes do jogo`],
                            ["💳", "Cota de entrada", `R$ ${CONFIG.valorCota} via Mercado Pago`]
                            ].map(([ic, txt, sub]) => (
                                <div key={txt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                                    <span style={{ fontSize: 22 }}>{ic}</span>
                                    <div><div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{txt}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div></div>
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" onClick={() => setOnboarding(false)}>Entendido, vamos lá! 🚀</button>
                    </div>
                </div>
            )}

            {jogoSel && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 9996, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, maxHeight: "95vh", overflow: "auto" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>GRUPO {jogoSel.g} · {fmtD(jogoSel.dt)}</div>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>📍 {jogoSel.est}, {jogoSel.cid}</div>
                            </div>
                            <button onClick={() => setJogoSel(null)} style={{ background: "#f3f4f6", border: "none", color: "#374151", width: 34, height: 34, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: 40, marginBottom: 6 }}>{F[jogoSel.time1] || "🏳️"}</div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{jogoSel.time1}</div>
                                </div>
                                <div style={{ textAlign: "center", padding: "0 16px" }}>
                                    <div style={{ fontWeight: 800, fontSize: 18, color: "#d1d5db" }}>VS</div>
                                    <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>{fmtH(jogoSel.dt)}</div>
                                </div>
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: 40, marginBottom: 6 }}>{F[jogoSel.time2] || "🏳️"}</div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{jogoSel.time2}</div>
                                </div>
                            </div>
                            {lock(jogoSel.dt) ? (
                                <div style={{ textAlign: "center", padding: "24px", background: "#fef2f2", borderRadius: 16, border: "1px solid #fecaca" }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                                    <div style={{ fontWeight: 700, color: "#b91c1c", marginBottom: 4, fontSize: 16 }}>Palpite bloqueado</div>
                                    <div style={{ fontSize: 13, color: "#6b7280" }}>O prazo encerrou</div>
                                    {palS[jogoSel.id] && <div style={{ marginTop: 12, fontSize: 15, color: "#374151" }}>Seu palpite: <strong style={{ color: "#16a34a" }}>{palS[jogoSel.id].gols1} × {palS[jogoSel.id].gols2}</strong></div>}
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 }}>
                                        <input type="number" min={0} max={30} className={`si${(palR[jogoSel.id]?.gols1 !== undefined && palR[jogoSel.id]?.gols1 !== "") ? " f" : ""}`} style={{ width: 72, height: 72, fontSize: 28 }}
                                            value={palR[jogoSel.id]?.gols1 ?? ""} onChange={e => { setPalLocal(jogoSel.id, "gols1", e.target.value, jogoSel.dt); if (e.target.value !== "") { const nx = document.getElementById("gols2_modal"); if (nx) nx.focus(); } }} placeholder="0" />
                                        <span style={{ fontSize: 24, color: "#d1d5db", fontWeight: 700 }}>×</span>
                                        <input type="number" min={0} max={30} className={`si${(palR[jogoSel.id]?.gols2 !== undefined && palR[jogoSel.id]?.gols2 !== "") ? " f" : ""}`} style={{ width: 72, height: 72, fontSize: 28 }}
                                            value={palR[jogoSel.id]?.gols2 ?? ""} id="gols2_modal" onChange={e => setPalLocal(jogoSel.id, "gols2", e.target.value, jogoSel.dt)} placeholder="0" />
                                    </div>
                                    <div className="card" style={{ marginBottom: 16 }}>
                                        <div style={{ fontWeight: 700, fontSize: 11, color: "#16a34a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Pontuação</div>
                                        {[["🎯", "Placar exato", `+${pts(jogoSel.fase || "grupos").placar} pts`], ["⚽", "Vencedor/Empate", `+${pts(jogoSel.fase || "grupos").vencedor} pts`], ["❌", "Errar", "0 pts"]].map(([ic, txt, p]) => (
                                            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f9fafb" }}>
                                                <span style={{ fontSize: 14 }}>{ic}</span><span style={{ flex: 1, fontSize: 12, color: "#374151" }}>{txt}</span><span className="badge bg">{p}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {tr(jogoSel.dt) && <div style={{ textAlign: "center", marginBottom: 16 }}>
                                        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>Tempo restante</div>
                                        <div style={{ fontWeight: 800, fontSize: 20, color: "#16a34a", fontFamily: "'JetBrains Mono',monospace" }}>{tr(jogoSel.dt)}</div>
                                    </div>}
                                    <button id="btn_confirmar" className="btn-primary" onClick={() => confirmarPalpite(jogoSel)} disabled={salvando} style={{ fontSize: 16, padding: "16px" }}>
                                        {salvando ? "Salvando..." : "✅ Confirmar Palpite"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 14px", position: "relative", zIndex: 1, transform: `translateY(${pullRefresh}px)`, transition: pullRefresh > 0 ? "none" : "transform .3s ease" }}>

                {tela === "login" && (
                    <TelaLogin
                        onLogin={(nome, email, isAdmin, u) => {
                            setUsuarioAtual(nome);
                            setEmailAtual(email);
                            setIsAdmin(isAdmin);
                            setUsuarios((prev: Record<string, { pago: boolean; camp: string }>) => ({ ...prev, [nome]: { pago: u.pago, camp: u.campeao_palpite || "" } }));
                            setTela("app");
                            irParaHome();
                        }}
                        onCadastro={() => setTela("cadastro")}
                    />
                )}

                {tela === "recuperar" && (
                    <TelaRecuperarSenha onSucesso={() => setTela("login")} />
                )}

                {tela === "cadastro" && (
                    <TelaCadastro
                        onCadastro={(nome, email, isAdmin) => {
                            setUsuarioAtual(nome);
                            setEmailAtual(email);
                            setIsAdmin(isAdmin);
                            setUsuarios((prev: Record<string, { pago: boolean; camp: string }>) => ({ ...prev, [nome]: { pago: false, camp: "" } }));
                            setOnboarding(true);
                            setTela("app");
                            irParaHome();
                        }}
                        onVoltar={() => setTela("login")}
                    />
                )}

                {tela === "app" && (
                    <div className="fade">

                        {modo === "home" && (
                            <TelaHome
                                usuarioAtual={usuarioAtual}
                                pago={pago}
                                meusDados={meusDados}
                                minhaPos={minhaPos}
                                nPart={nPart}
                                totSalvos={totSalvos}
                                totJogos={totJogos}
                                pctPal={pctPal}
                                countdown={countdown}
                                res={res}
                                palS={palS}
                                palR={palR}
                                F={F}
                                setModo={setModo}
                                setJogoSel={setJogoSel}
                                setPalLocal={setPalLocal}
                                confirmarPalpite={confirmarPalpite}
                            />
                        )}

                        {modo === "jogos" && (
                            <TelaJogos
                                statusF={statusF}
                                setStatusF={setStatusF}
                                rodada={rodada}
                                setRodada={setRodada}
                                jogosFiltrados={jogosFiltrados}
                                jogosRodada={jogosRodada}
                                res={res}
                                palS={palS}
                                palpitesMap={palpitesMap}
                                F={F}
                                setJogoSel={setJogoSel}
                            />
                        )}

                        {modo === "palpites" && (
                            <TelaPalpites
                                pago={pago}
                                campAtual={campAtual}
                                faseAtiva={faseAtiva}
                                grupoAtivo={grupoAtivo}
                                elim={elim}
                                palR={palR}
                                palS={palS}
                                res={res}
                                resE={resE}
                                salvando={salvando}
                                temRasc={temRasc}
                                setModo={setModo}
                                setFaseAtiva={setFaseAtiva}
                                setGrupoAtivo={setGrupoAtivo}
                                setJogoSel={setJogoSel}
                                setCamp={setCamp}
                                setPalLocal={setPalLocal}
                                salvarGrupo={salvarGrupo}
                                salvarElim={salvarElim}
                            />
                        )}

                        {modo === "ranking" && (
                            <TelaRanking
                                minhaPos={minhaPos}
                                meusDados={meusDados}
                                usuarioAtual={usuarioAtual}
                                ranking={ranking}
                                premios={premios}
                                palpitesMap={palpitesMap}
                                elim={elim}
                                res={res}
                                resE={resE}
                                MEDAL={MEDAL}
                                F={F}
                                exportarRanking={exportarRanking}
                                copRank={copRank}
                            />
                        )}

                        {modo === "historico" && (
                            <TelaHistorico
                                palS={palS}
                                elim={elim}
                                res={res}
                                resE={resE}
                                campAtual={campAtual}
                                campR={campR}
                                F={F}
                            />
                        )}

                        {modo === "pix" && (
                            <TelaPix
                                pago={pago}
                                usuarioAtual={usuarioAtual}
                                emailAtual={emailAtual}
                                onPago={() => {
                                    setUsuarios((prev: Record<string, { pago: boolean; camp: string }>) => ({ ...prev, [usuarioAtual || ""]: { ...prev[usuarioAtual || ""], pago: true } }));
                                    dispararConfete();
                                    mostrarToast("🎉 Pagamento confirmado! Bem-vindo ao bolão!");
                                    setTimeout(() => irParaHome(), 2000);
                                }}
                            />
                        )}

                        {modo === "perfil" && (
                            <TelaPerfil
                                usuarioAtual={usuarioAtual}
                                emailAtual={emailAtual}
                                pago={pago}
                                meusDados={meusDados}
                                minhaPos={minhaPos}
                                ranking={ranking}
                                palpitesMap={palpitesMap}
                                elim={elim}
                                res={res}
                                resE={resE}
                            />
                        )}

                        {modo === "campeao" && (
                            <TelaCampeao
                                campAtual={campAtual}
                                setCamp={setCamp}
                                usuarios={usuarios}
                                TODOS_TIMES={TODOS_TIMES}
                                F={F}
                            />
                        )}

                        {modo === "regras" && (
                            <TelaRegras premios={premios} />
                        )}

                        {modo === "feed" && (
                            <TelaFeed feed={feed} />
                        )}

                        {modo === "mais" && (
                            <TelaMais
                                modo={modo}
                                isAdmin={isAdmin}
                                setModo={setModo}
                                setTela={setTela}
                                handleLogout={handleLogout}
                                mostrarToast={mostrarToast}
                            />
                        )}

                    </div>
                )}

                {tela === "admin" && (
                    <TelaAdmin
                        adminModo={adminModo}
                        setAdminModo={setAdminModo}
                        grupoAtivo={grupoAtivo}
                        setGrupoAtivo={setGrupoAtivo}
                        faseAtiva={faseAtiva}
                        setFaseAtiva={setFaseAtiva}
                        res={res}
                        resE={resE}
                        elim={elim}
                        updateElimT={updateElimT}
                        campR={campR}
                        atualizarCampR={atualizarCampR}
                        usuarios={usuarios}
                        ranking={ranking}
                        nPart={nPart}
                        nPagos={nPagos}
                        togglePago={togglePago}
                        resetarSenha={resetarSenha}
                        mostrarToast={mostrarToast}
                        F={F}
                    />
                )}

            </div>

            {tela === "app" && <NavBar modo={modo} isAdmin={isAdmin} setModo={setModo} />}
        </div>
    );
}