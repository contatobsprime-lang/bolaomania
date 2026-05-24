"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ─── CONFIG ────────────────────────────────────────────────────────
const CONFIG = {
  valorCota: 10,
  chavePix: "ab08302c-9d0d-43ac-933a-dafedeaf0b50",
  nomePix: "Bruno Souza",
  pixCopiaCola: "00020126360014br.gov.bcb.pix0114+5547999931877520400005303986540510.005802BR5911Bruno Souza6009Sao Paulo62240520daqr120444386078858563042950",
  bonusCampeao: 20,
  minutesBloqueio: 30,
  premios: { 1: 0.40, 2: 0.25, 3: 0.15, 4: 0.12, 5: 0.08 },
  pontos: {
    grupos:  { vencedor: 2,  placar: 5  },
    oitavas: { vencedor: 3,  placar: 8  },
    quartas: { vencedor: 5,  placar: 12 },
    semi:    { vencedor: 7,  placar: 15 },
    final:   { vencedor: 10, placar: 20 },
  },
};

// Senha admin via variável de ambiente (NEXT_PUBLIC_ADMIN_SENHA no .env.local)
const SENHA_ADMIN = process.env.NEXT_PUBLIC_ADMIN_SENHA || "admin123";

// ─── DADOS DA COPA 2026 ────────────────────────────────────────────
const GRUPOS: Record<string, string[]> = {
  A: ["México", "Coreia do Sul", "República Tcheca", "África do Sul"],
  B: ["Canadá", "Suíça", "Catar", "Bósnia"],
  C: ["Brasil", "Marrocos", "Escócia", "Haiti"],
  D: ["Estados Unidos", "Austrália", "Paraguai", "Turquia"],
  E: ["Alemanha", "Equador", "Costa do Marfim", "Curaçao"],
  F: ["Países Baixos", "Japão", "Tunísia", "Suécia"],
  G: ["Bélgica", "Irã", "Egito", "Nova Zelândia"],
  H: ["Espanha", "Uruguai", "Arábia Saudita", "Cabo Verde"],
  I: ["França", "Senegal", "Noruega", "Iraque"],
  J: ["Argentina", "Áustria", "Argélia", "Jordânia"],
  K: ["Portugal", "Colômbia", "Uzbequistão", "RD Congo"],
  L: ["Inglaterra", "Croácia", "Panamá", "Gana"],
};
const TODOS_TIMES = Object.values(GRUPOS).flat();
const BANDEIRAS: Record<string, string> = {
  México:"🇲🇽","Coreia do Sul":"🇰🇷","República Tcheca":"🇨🇿","África do Sul":"🇿🇦",
  Canadá:"🇨🇦",Suíça:"🇨🇭",Catar:"🇶🇦",Bósnia:"🇧🇦",
  Brasil:"🇧🇷",Marrocos:"🇲🇦",Escócia:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",Haiti:"🇭🇹",
  "Estados Unidos":"🇺🇸",Austrália:"🇦🇺",Paraguai:"🇵🇾",Turquia:"🇹🇷",
  Alemanha:"🇩🇪",Equador:"🇪🇨","Costa do Marfim":"🇨🇮","Curaçao":"🇨🇼",
  "Países Baixos":"🇳🇱",Japão:"🇯🇵",Tunísia:"🇹🇳",Suécia:"🇸🇪",
  Bélgica:"🇧🇪",Irã:"🇮🇷",Egito:"🇪🇬","Nova Zelândia":"🇳🇿",
  Espanha:"🇪🇸",Uruguai:"🇺🇾","Arábia Saudita":"🇸🇦","Cabo Verde":"🇨🇻",
  França:"🇫🇷",Senegal:"🇸🇳",Noruega:"🇳🇴",Iraque:"🇮🇶",
  Argentina:"🇦🇷",Áustria:"🇦🇹",Argélia:"🇩🇿",Jordânia:"🇯🇴",
  Portugal:"🇵🇹",Colômbia:"🇨🇴",Uzbequistão:"🇺🇿","RD Congo":"🇨🇩",
  Inglaterra:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Croácia:"🇭🇷",Panamá:"🇵🇦",Gana:"🇬🇭",
};
const DATAS_JOGOS: Record<string, string[]> = {
  A:["2026-06-11T15:00:00","2026-06-18T21:00:00","2026-06-24T21:00:00"],
  B:["2026-06-12T15:00:00","2026-06-19T18:00:00","2026-06-25T18:00:00"],
  C:["2026-06-13T19:00:00","2026-06-20T15:00:00","2026-06-26T18:00:00"],
  D:["2026-06-14T15:00:00","2026-06-21T18:00:00","2026-06-27T18:00:00"],
  E:["2026-06-15T15:00:00","2026-06-22T15:00:00","2026-06-28T18:00:00"],
  F:["2026-06-16T15:00:00","2026-06-23T15:00:00","2026-06-29T18:00:00"],
  G:["2026-06-16T21:00:00","2026-06-23T21:00:00","2026-06-29T21:00:00"],
  H:["2026-06-17T15:00:00","2026-06-24T15:00:00","2026-06-30T18:00:00"],
  I:["2026-06-17T21:00:00","2026-06-24T18:00:00","2026-06-30T21:00:00"],
  J:["2026-06-18T15:00:00","2026-06-25T15:00:00","2026-07-01T18:00:00"],
  K:["2026-06-19T21:00:00","2026-06-26T15:00:00","2026-07-01T21:00:00"],
  L:["2026-06-20T21:00:00","2026-06-27T15:00:00","2026-07-02T18:00:00"],
};
const ELIM_TEMPLATE = [
  ...Array.from({length:16},(_,i)=>({ id:100+i, fase:"oitavas", label:`Oitavas ${i+1}`, time1:"", time2:"", dataHora:"2026-07-04T18:00:00" })),
  ...Array.from({length:8},(_,i)=>({ id:200+i, fase:"quartas", label:`Quartas ${i+1}`, time1:"", time2:"", dataHora:"2026-07-10T18:00:00" })),
  ...Array.from({length:4},(_,i)=>({ id:300+i, fase:"semi", label:`Semifinal ${i+1}`, time1:"", time2:"", dataHora:"2026-07-14T18:00:00" })),
  { id:400, fase:"final", label:"Final", time1:"", time2:"", dataHora:"2026-07-19T17:00:00" },
  { id:401, fase:"final", label:"3º Lugar", time1:"", time2:"", dataHora:"2026-07-18T17:00:00" },
];

function gerarJogosGrupo() {
  const jogos: any[] = [];
  let id = 1;
  Object.entries(GRUPOS).forEach(([grupo, times]) => {
    const datas = DATAS_JOGOS[grupo];
    let rodada = 0;
    for (let i = 0; i < times.length; i++) {
      for (let j = i + 1; j < times.length; j++) {
        jogos.push({ id: id++, grupo, rodada: rodada+1, fase:"grupos", time1:times[i], time2:times[j], dataHora:datas[Math.min(rodada,datas.length-1)] });
        rodada++;
      }
    }
  });
  return jogos;
}

function bloqueado(dataHora: string) {
  return (new Date(dataHora).getTime() - Date.now()) / 60000 <= CONFIG.minutesBloqueio;
}

function getPontos(fase: string) {
  return (CONFIG.pontos as any)[fase] || CONFIG.pontos.grupos;
}

function calcularPontosJogo(pg1:number,pg2:number,rg1:number,rg2:number,fase:string,penalti:boolean) {
  const vR = rg1>rg2?1:rg1<rg2?-1:0;
  const vP = pg1>pg2?1:pg1<pg2?-1:0;
  const pts = getPontos(fase);
  if (fase==="grupos") {
    if (pg1===rg1&&pg2===rg2) return { pts: pts.placar, tipo:"placar" };
    if (vR===vP) return { pts: pts.vencedor, tipo:"vencedor" };
    return { pts:0, tipo:"erro" };
  } else {
    if (penalti) {
      if (vP===vR&&vR!==0) return { pts: pts.vencedor, tipo:"vencedor" };
      return { pts:0, tipo:"erro" };
    } else {
      if (pg1===rg1&&pg2===rg2) return { pts: pts.placar, tipo:"placar" };
      if (vR===vP) return { pts: pts.vencedor, tipo:"vencedor" };
      return { pts:0, tipo:"erro" };
    }
  }
}

function calcularTudo(palpites:any, jogosGrupo:any[], jogosElim:any[], resultados:any, resultadosElim:any, campeaoPalpite:string, campeaoReal:string) {
  let pontos=0, acertos=0, placares=0, detalhes:any[]=[];
  [...jogosGrupo,...jogosElim].forEach(jogo => {
    const res = jogo.fase==="grupos" ? resultados[jogo.id] : resultadosElim[jogo.id];
    const pal = palpites[jogo.id];
    if (!res||res.gols1===""||res.gols1===undefined||res.gols2===""||res.gols2===undefined) return;
    if (!pal||pal.gols1===""||pal.gols1===undefined||pal.gols2===""||pal.gols2===undefined) {
      detalhes.push({...jogo, res, pal:null, tipo:"sem_palpite", pts:0});
      return;
    }
    const rg1=parseInt(res.gols1),rg2=parseInt(res.gols2);
    const pg1=parseInt(pal.gols1),pg2=parseInt(pal.gols2);
    if (isNaN(rg1)||isNaN(rg2)||isNaN(pg1)||isNaN(pg2)) return;
    const {pts,tipo} = calcularPontosJogo(pg1,pg2,rg1,rg2,jogo.fase,res.penalti);
    pontos+=pts;
    if (tipo==="placar"||tipo==="vencedor") acertos++;
    if (tipo==="placar") placares++;
    detalhes.push({...jogo, res, pal, tipo, pts});
  });
  let bonusCampeao=0;
  if (campeaoReal&&campeaoPalpite&&campeaoPalpite===campeaoReal) { bonusCampeao=CONFIG.bonusCampeao; pontos+=bonusCampeao; }
  return { pontos, acertos, placares, bonusCampeao, detalhes };
}

function calcularPremios(n: number) {
  const total=n*CONFIG.valorCota;
  return { total, dist: Object.entries(CONFIG.premios).map(([pos,pct])=>({ pos:parseInt(pos), pct, valor:Math.floor(total*pct) })) };
}

function desempate(a:any,b:any) {
  if (b.pontos!==a.pontos) return b.pontos-a.pontos;
  if (b.placares!==a.placares) return b.placares-a.placares;
  if (b.acertos!==a.acertos) return b.acertos-a.acertos;
  const aC=a.campeao&&a.campeao===a.campeaoReal?1:0;
  const bC=b.campeao&&b.campeao===b.campeaoReal?1:0;
  return bC-aC;
}

function tempoRestante(dataHora: string) {
  const diff=(new Date(dataHora).getTime()-Date.now())/1000;
  if (diff<=0) return null;
  const h=Math.floor(diff/3600), m=Math.floor((diff%3600)/60);
  if (h>48) return `${Math.floor(h/24)}d`;
  if (h>0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── CSS ───────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0f1e}::-webkit-scrollbar-thumb{background:#f7c948;border-radius:2px}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
input[type=number]{-moz-appearance:textfield}
.fade{animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.btn-gold{background:linear-gradient(135deg,#f7c948,#e8a800);color:#0a0f1e;border:none;border-radius:10px;padding:12px 24px;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;cursor:pointer;transition:transform .15s,box-shadow .15s;width:100%}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(247,201,72,.35)}
.btn-ghost{background:rgba(255,255,255,.06);color:#f0f4ff;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 18px;font-family:'Syne',sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:background .15s}
.btn-ghost:hover{background:rgba(255,255,255,.12)}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:18px}
.inp{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:10px;padding:11px 14px;color:#f0f4ff;font-family:'Syne',sans-serif;font-size:14px;outline:none;width:100%;transition:border .2s}
.inp:focus{border-color:#f7c948}
.si{width:48px;height:48px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);border-radius:10px;color:#f7c948;font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:600;text-align:center;outline:none;transition:border .2s}
.si:focus{border-color:#f7c948;background:rgba(247,201,72,.08)}
.si.f{border-color:rgba(247,201,72,.5)}
.si.r{color:#4ade80}.si.r.f{border-color:rgba(74,222,128,.5)}.si.r:focus{border-color:#4ade80;background:rgba(74,222,128,.08)}
.si:disabled{opacity:.35;cursor:not-allowed}
.tab{padding:7px 13px;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;font-size:12px;cursor:pointer;border:none;transition:all .2s}
.tab.on{background:#f7c948;color:#0a0f1e}.tab.off{background:transparent;color:rgba(240,244,255,.5)}.tab.off:hover{color:#f0f4ff}
.gtab{padding:5px 9px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-weight:600;font-size:11px;cursor:pointer;border:1px solid transparent;transition:all .2s}
.gtab.on{background:rgba(247,201,72,.15);color:#f7c948;border-color:rgba(247,201,72,.4)}.gtab.off{color:rgba(240,244,255,.4)}
.ftab{padding:6px 12px;border-radius:8px;font-family:'Syne',sans-serif;font-weight:600;font-size:11px;cursor:pointer;border:1px solid transparent;transition:all .2s}
.ftab.on{background:rgba(247,201,72,.12);color:#f7c948;border-color:rgba(247,201,72,.3)}.ftab.off{color:rgba(240,244,255,.4);border-color:rgba(255,255,255,.06)}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace}
.bg{background:rgba(247,201,72,.15);color:#f7c948;border:1px solid rgba(247,201,72,.3)}
.bb{background:rgba(100,160,255,.12);color:#7eb8ff;border:1px solid rgba(100,160,255,.25)}
.bgr{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.3)}
.br{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.3)}
.bp{background:rgba(167,139,250,.1);color:#c4b5fd;border:1px solid rgba(167,139,250,.25)}
select{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:10px;padding:11px 14px;color:#f0f4ff;font-family:'Syne',sans-serif;font-size:14px;outline:none;width:100%}
select option{background:#1a2035}
.loading{display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:14px;color:rgba(240,244,255,.4)}
`;

const FASES = ["grupos","oitavas","quartas","semi","final"];
const FASE_LABEL: Record<string,string> = {grupos:"Fase de Grupos",oitavas:"Oitavas de Final",quartas:"Quartas de Final",semi:"Semifinais",final:"Final"};
const MEDALHAS = ["🥇","🥈","🥉","4º","5º"];

export default function App() {
  // ── STATE ────────────────────────────────────────────────────────
  const [tela, setTela] = useState("login");
  const [carregando, setCarregando] = useState(false);
  const [usuarios, setUsuarios] = useState<any>({});
  const [usuarioAtual, setUsuarioAtual] = useState<string|null>(null);
  const [loginNome, setLoginNome] = useState(""); const [loginSenha, setLoginSenha] = useState(""); const [loginErro, setLoginErro] = useState("");
  const [cadNome, setCadNome] = useState(""); const [cadSenha, setCadSenha] = useState(""); const [cadSenha2, setCadSenha2] = useState(""); const [cadErro, setCadErro] = useState("");
  const [adminSenha, setAdminSenha] = useState(""); const [adminErro, setAdminErro] = useState("");
  const [jogosGrupo] = useState(gerarJogosGrupo);
  const [jogosElim, setJogosElim] = useState<any[]>(ELIM_TEMPLATE);
  const [palpitesMap, setPalpitesMap] = useState<any>({});
  const [resultados, setResultados] = useState<any>({});
  const [resultadosElim, setResultadosElim] = useState<any>({});
  const [campeaoReal, setCampeaoReal] = useState("");
  const [grupoAtivo, setGrupoAtivo] = useState("A");
  const [faseAtiva, setFaseAtiva] = useState("grupos");
  const [modo, setModo] = useState("palpites");
  const [adminModo, setAdminModo] = useState("resultados");
  const [copiadoChave, setCopiadoChave] = useState(false);
  const [copiadoCola, setCopiadoCola] = useState(false);
  const [copiadoRanking, setCopiadoRanking] = useState(false);
  const [detalheUser, setDetalheUser] = useState<string|null>(null);
  const [resetNome, setResetNome] = useState<string|null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvoMsg, setSalvoMsg] = useState("");
  const [, setTick] = useState(0);

  // ── CARREGAR DADOS DO SUPABASE ───────────────────────────────────
  const carregarTudo = useCallback(async () => {
    try {
      // Usuários
      const { data: users } = await supabase.from("usuarios").select("*");
      if (users) {
        const mapa: any = {};
        users.forEach((u:any) => { mapa[u.nome] = { senha: u.senha, pago: u.pago, campeaoPalpite: u.campeao_palpite || "" }; });
        setUsuarios(mapa);
      }

      // Palpites
      const { data: pals } = await supabase.from("palpites").select("*");
      if (pals) {
        const mapa: any = {};
        pals.forEach((p:any) => {
          if (!mapa[p.usuario_nome]) mapa[p.usuario_nome] = {};
          mapa[p.usuario_nome][p.jogo_id] = { gols1: p.gols1?.toString() ?? "", gols2: p.gols2?.toString() ?? "" };
        });
        setPalpitesMap(mapa);
      }

      // Resultados grupos
      const { data: ress } = await supabase.from("resultados").select("*");
      if (ress) {
        const mapa: any = {};
        ress.forEach((r:any) => { mapa[r.jogo_id] = { gols1: r.gols1?.toString() ?? "", gols2: r.gols2?.toString() ?? "", penalti: r.penalti }; });
        setResultados(mapa);
      }

      // Eliminatórias
      const { data: elims } = await supabase.from("eliminatorias").select("*");
      if (elims && elims.length > 0) {
        setJogosElim(prev => prev.map(j => {
          const e = elims.find((el:any) => el.jogo_id === j.id);
          if (!e) return j;
          return { ...j, time1: e.time1||"", time2: e.time2||"", dataHora: e.data_hora||j.dataHora };
        }));
        const mapaElim: any = {};
        elims.forEach((e:any) => {
          if (e.gols1 !== null || e.gols2 !== null) {
            mapaElim[e.jogo_id] = { gols1: e.gols1?.toString() ?? "", gols2: e.gols2?.toString() ?? "", penalti: e.penalti };
          }
        });
        setResultadosElim(mapaElim);
      }

      // Config (campeão real)
      const { data: cfg } = await supabase.from("config").select("*");
      if (cfg) {
        const campeao = cfg.find((c:any) => c.chave === "campeao_real");
        if (campeao) setCampeaoReal(campeao.valor || "");
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, []);

  useEffect(() => {
    carregarTudo();
    const t = setInterval(() => setTick(x => x+1), 30000);
    // Atualizar dados a cada 60s (tempo real básico)
    const r = setInterval(() => carregarTudo(), 60000);
    return () => { clearInterval(t); clearInterval(r); };
  }, [carregarTudo]);

  // ── DERIVADOS ────────────────────────────────────────────────────
  const pal = palpitesMap[usuarioAtual||""] || {};
  const u = usuarios[usuarioAtual||""] || {};
  const pago = u.pago || false;
  const campeaoPalpiteAtual = u.campeaoPalpite || "";
  const nParticipantes = Object.keys(usuarios).length;
  const premios = calcularPremios(nParticipantes);
  const jogosGrupoFiltrado = jogosGrupo.filter(j => j.grupo === grupoAtivo);
  const jogosElimFiltrado = jogosElim.filter(j => j.fase === faseAtiva);
  const totalPalpites = Object.values(pal).filter((p:any) => p.gols1!==""&&p.gols1!==undefined&&p.gols2!==""&&p.gols2!==undefined).length;

  const ranking = Object.keys(usuarios).map(nome => {
    const p = palpitesMap[nome] || {};
    const camp = usuarios[nome]?.campeaoPalpite || "";
    const { pontos,acertos,placares,bonusCampeao,detalhes } = calcularTudo(p,jogosGrupo,jogosElim,resultados,resultadosElim,camp,campeaoReal);
    return { nome, pontos, acertos, placares, bonusCampeao, detalhes, campeao:camp, campeaoReal, pago:usuarios[nome]?.pago };
  }).sort(desempate);

  // ── AÇÕES SUPABASE ───────────────────────────────────────────────
  async function handleLogin() {
    setCarregando(true);
    const { data, error } = await supabase.from("usuarios").select("*").eq("nome", loginNome.trim()).single();
    setCarregando(false);
    if (error || !data) { setLoginErro("Usuário não encontrado."); return; }
    if (data.senha !== loginSenha) { setLoginErro("Senha incorreta."); return; }
    setUsuarioAtual(data.nome);
    setLoginErro(""); setLoginNome(""); setLoginSenha("");
    setTela("app"); setModo("palpites");
  }

  async function handleCadastro() {
    const nome = cadNome.trim();
    if (!nome) { setCadErro("Digite seu nome."); return; }
    if (cadSenha.length < 4) { setCadErro("Senha precisa ter pelo menos 4 caracteres."); return; }
    if (cadSenha !== cadSenha2) { setCadErro("Senhas não conferem."); return; }
    setCarregando(true);
    const { error } = await supabase.from("usuarios").insert({ nome, senha: cadSenha, pago: false, campeao_palpite: "" });
    setCarregando(false);
    if (error) { setCadErro(error.code === "23505" ? "Nome já cadastrado." : "Erro ao criar conta."); return; }
    setUsuarios((prev:any) => ({ ...prev, [nome]: { senha: cadSenha, pago: false, campeaoPalpite: "" } }));
    setUsuarioAtual(nome); setCadErro(""); setCadNome(""); setCadSenha(""); setCadSenha2("");
    setTela("app"); setModo("pix");
  }

  async function setPalpite(jogoId:number, campo:string, valor:string, fase:string, dataHora:string) {
    if (bloqueado(dataHora) || !usuarioAtual) return;
    const novo = { ...((palpitesMap[usuarioAtual]||{})[jogoId]||{}), [campo]: valor };
    setPalpitesMap((prev:any) => ({ ...prev, [usuarioAtual]: { ...(prev[usuarioAtual]||{}), [jogoId]: novo } }));
    // Salvar no Supabase com debounce visual
    const g1 = campo==="gols1" ? parseInt(valor) : parseInt(novo.gols1);
    const g2 = campo==="gols2" ? parseInt(valor) : parseInt(novo.gols2);
    if (!isNaN(g1) && !isNaN(g2)) {
      await supabase.from("palpites").upsert({ usuario_nome: usuarioAtual, jogo_id: jogoId, gols1: g1, gols2: g2 }, { onConflict: "usuario_nome,jogo_id" });
    }
  }

  async function setCampeaoPalpite(time:string) {
    if (!usuarioAtual) return;
    setUsuarios((prev:any) => ({ ...prev, [usuarioAtual]: { ...prev[usuarioAtual], campeaoPalpite: time } }));
    await supabase.from("usuarios").update({ campeao_palpite: time }).eq("nome", usuarioAtual);
  }

  async function setRes(jogoId:number, campo:string, valor:string) {
    setResultados((prev:any) => ({ ...prev, [jogoId]: { ...(prev[jogoId]||{}), [campo]: valor } }));
    const r = { ...(resultados[jogoId]||{}), [campo]: valor };
    const g1 = parseInt(r.gols1), g2 = parseInt(r.gols2);
    if (!isNaN(g1) && !isNaN(g2)) {
      await supabase.from("resultados").upsert({ jogo_id: jogoId, gols1: g1, gols2: g2, penalti: r.penalti||false }, { onConflict: "jogo_id" });
      mostrarSalvo();
    }
  }

  async function setResElim(jogoId:number, campo:string, valor:any) {
    setResultadosElim((prev:any) => ({ ...prev, [jogoId]: { ...(prev[jogoId]||{}), [campo]: valor } }));
    const r = { ...(resultadosElim[jogoId]||{}), [campo]: valor };
    const g1 = typeof r.gols1 === "string" ? parseInt(r.gols1) : r.gols1;
    const g2 = typeof r.gols2 === "string" ? parseInt(r.gols2) : r.gols2;
    const payload: any = { jogo_id: jogoId, penalti: r.penalti||false };
    if (!isNaN(g1)) payload.gols1 = g1;
    if (!isNaN(g2)) payload.gols2 = g2;
    await supabase.from("eliminatorias").upsert(payload, { onConflict: "jogo_id" });
    mostrarSalvo();
  }

  async function updateElimTime(jogoId:number, campo:string, valor:string) {
    setJogosElim((prev:any[]) => prev.map(j => j.id===jogoId ? {...j,[campo]:valor} : j));
    await supabase.from("eliminatorias").upsert({ jogo_id: jogoId, [campo]: valor }, { onConflict: "jogo_id" });
  }

  async function togglePago(nome:string) {
    const novoPago = !usuarios[nome]?.pago;
    setUsuarios((prev:any) => ({ ...prev, [nome]: { ...prev[nome], pago: novoPago } }));
    await supabase.from("usuarios").update({ pago: novoPago }).eq("nome", nome);
  }

  async function atualizarCampeaoReal(time:string) {
    setCampeaoReal(time);
    await supabase.from("config").upsert({ chave: "campeao_real", valor: time }, { onConflict: "chave" });
  }

  async function resetarSenha(nome:string, senha:string) {
    if (senha.length < 4) return;
    await supabase.from("usuarios").update({ senha }).eq("nome", nome);
    setUsuarios((prev:any) => ({ ...prev, [nome]: { ...prev[nome], senha } }));
    setResetNome(null); setNovaSenha("");
    mostrarSalvo("Senha resetada!");
  }

  function mostrarSalvo(msg="✓ Salvo!") {
    setSalvoMsg(msg); setTimeout(() => setSalvoMsg(""), 2000);
  }

  function exportarRanking() {
    const linhas = ranking.map((p,i) => `${MEDALHAS[i]||`${i+1}º`} ${p.nome} — ${p.pontos}pts (${p.acertos} acertos, ${p.placares} placares)`);
    const total = `\n💰 Prêmios: ${premios.dist.map(d=>`${d.pos}º R$${d.valor}`).join(" | ")}`;
    navigator.clipboard.writeText(`🏆 BOLÃO COPA 2026\n\n${linhas.join("\n")}${total}`);
    setCopiadoRanking(true); setTimeout(() => setCopiadoRanking(false), 2500);
  }

  // ── JOGO CARD ────────────────────────────────────────────────────
  function JogoCard({ jogo, isAdmin=false, isElim=false }: any) {
    const res = isElim ? (resultadosElim[jogo.id]||{}) : (resultados[jogo.id]||{});
    const p = pal[jogo.id]||{};
    const lock = bloqueado(jogo.dataHora);
    const temRes = res.gols1!==undefined&&res.gols1!==""&&res.gols2!==undefined&&res.gols2!=="";
    const temPal = p.gols1!==undefined&&p.gols1!==""&&p.gols2!==undefined&&p.gols2!=="";
    const tr = tempoRestante(jogo.dataHora);
    const f1 = BANDEIRAS[jogo.time1]||"🏳️";
    const f2 = BANDEIRAS[jogo.time2]||"🏳️";
    let acertouVenc=false, acertouPlacar=false;
    if (temRes&&temPal&&!isAdmin) {
      const {tipo} = calcularPontosJogo(parseInt(p.gols1),parseInt(p.gols2),parseInt(res.gols1),parseInt(res.gols2),jogo.fase,res.penalti);
      acertouVenc=tipo==="vencedor"; acertouPlacar=tipo==="placar";
    }
    const borderColor = isAdmin?(temRes?"#4ade80":"transparent"):(acertouPlacar?"#f7c948":acertouVenc?"#7eb8ff":"transparent");
    return (
      <div className="card" style={{position:"relative",overflow:"hidden",padding:"14px",opacity:lock&&!temPal&&!isAdmin?.7:1,border:`1px solid ${borderColor==="transparent"?"rgba(255,255,255,.08)":borderColor+"44"}`}}>
        {borderColor!=="transparent"&&<div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:borderColor,borderRadius:"3px 0 0 3px"}}/>}
        {!isAdmin&&lock&&!temPal&&<div style={{position:"absolute",top:8,right:8}}><span className="badge br">🔒 Bloqueado</span></div>}
        {!isAdmin&&acertouPlacar&&<div style={{position:"absolute",top:8,right:8}}><span className="badge bg">🎯 Placar exato!</span></div>}
        {!isAdmin&&acertouVenc&&<div style={{position:"absolute",top:8,right:8}}><span className="badge bb">✅ Acertou!</span></div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1,minWidth:0}}>
            <span style={{fontSize:26}}>{f1}</span>
            <span style={{fontSize:10,fontWeight:700,color:"rgba(240,244,255,.7)",textAlign:"center",wordBreak:"break-word"}}>{jogo.time1||"A definir"}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"0 8px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {isAdmin?(
                <>
                  <input type="number" min={0} max={30} className={`si r${temRes?" f":""}`} value={res.gols1??""} onChange={e=>isElim?setResElim(jogo.id,"gols1",e.target.value):setRes(jogo.id,"gols1",e.target.value)} placeholder="—"/>
                  <span style={{color:"rgba(240,244,255,.3)",fontSize:14}}>×</span>
                  <input type="number" min={0} max={30} className={`si r${temRes?" f":""}`} value={res.gols2??""} onChange={e=>isElim?setResElim(jogo.id,"gols2",e.target.value):setRes(jogo.id,"gols2",e.target.value)} placeholder="—"/>
                </>
              ):(
                <>
                  <input type="number" min={0} max={30} disabled={lock} className={`si${temPal?" f":""}`} value={p.gols1??""} onChange={e=>setPalpite(jogo.id,"gols1",e.target.value,jogo.fase,jogo.dataHora)} placeholder="—"/>
                  <span style={{color:"rgba(240,244,255,.3)",fontSize:14}}>×</span>
                  <input type="number" min={0} max={30} disabled={lock} className={`si${temPal?" f":""}`} value={p.gols2??""} onChange={e=>setPalpite(jogo.id,"gols2",e.target.value,jogo.fase,jogo.dataHora)} placeholder="—"/>
                </>
              )}
            </div>
            <div style={{fontSize:9,color:lock?"#f87171":"rgba(240,244,255,.3)",fontFamily:"'JetBrains Mono',monospace",textAlign:"center"}}>
              {lock?"🔒 FECHADO":tr?`⏱ ${tr}`:new Date(jogo.dataHora).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
            </div>
            {isAdmin&&isElim&&jogo.fase!=="grupos"&&(
              <label style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"rgba(240,244,255,.5)",cursor:"pointer",marginTop:2}}>
                <input type="checkbox" checked={res.penalti||false} onChange={e=>setResElim(jogo.id,"penalti",e.target.checked)} style={{width:12,height:12}}/>
                Pênalti
              </label>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1,minWidth:0}}>
            <span style={{fontSize:26}}>{f2}</span>
            <span style={{fontSize:10,fontWeight:700,color:"rgba(240,244,255,.7)",textAlign:"center",wordBreak:"break-word"}}>{jogo.time2||"A definir"}</span>
          </div>
        </div>
        {temRes&&!isAdmin&&(
          <div style={{marginTop:8,padding:"4px 8px",background:"rgba(255,255,255,.03)",borderRadius:6,textAlign:"center",fontSize:10,color:"rgba(240,244,255,.4)",fontFamily:"'JetBrains Mono',monospace"}}>
            Resultado: {jogo.time1} {res.gols1}×{res.gols2} {jogo.time2} {res.penalti?"(pên.)":""}
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",color:"#f0f4ff",fontFamily:"'Syne',sans-serif"}}>
      <style>{CSS}</style>

      {/* Toast salvo */}
      {salvoMsg&&(
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(74,222,128,.15)",border:"1px solid rgba(74,222,128,.3)",color:"#4ade80",padding:"8px 18px",borderRadius:20,fontSize:12,fontWeight:700,zIndex:999,fontFamily:"'JetBrains Mono',monospace"}}>
          {salvoMsg}
        </div>
      )}

      {/* HEADER */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,.07)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"rgba(10,15,30,.95)",backdropFilter:"blur(12px)",zIndex:100,gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🏆</span>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:"#f7c948",letterSpacing:"-.5px"}}>BOLÃO COPA 2026</div>
            <div style={{fontSize:9,color:"rgba(240,244,255,.35)",fontFamily:"'JetBrains Mono',monospace"}}>48 SELEÇÕES · 12 GRUPOS</div>
          </div>
        </div>
        {tela==="app"&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            {["palpites","ranking","historico","pix","regras"].map(m=>(
              <button key={m} className={`tab ${modo===m?"on":"off"}`} onClick={()=>setModo(m)}>
                {m==="palpites"?"🎯":m==="ranking"?"🏅":m==="historico"?"📊":m==="pix"?"💸":"📋"}
                {" "}{m==="palpites"?"Palpites":m==="ranking"?"Ranking":m==="historico"?"Histórico":m==="pix"?"Pix":"Regras"}
              </button>
            ))}
            <button className="btn-ghost" style={{fontSize:11,padding:"5px 9px"}} onClick={()=>{setUsuarioAtual(null);setTela("login");}}>Sair</button>
          </div>
        )}
        {tela==="admin"&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["resultados","elim","usuarios"].map(m=>(
              <button key={m} className={`tab ${adminModo===m?"on":"off"}`} onClick={()=>setAdminModo(m)}>
                {m==="resultados"?"📋 Grupos":m==="elim"?"⚡ Eliminatórias":"👥 Usuários"}
              </button>
            ))}
            <button className="btn-ghost" style={{fontSize:11,padding:"5px 9px"}} onClick={()=>setTela("login")}>Sair</button>
          </div>
        )}
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"18px 12px"}}>

        {/* ══ LOGIN ══ */}
        {tela==="login"&&(
          <div className="fade" style={{maxWidth:360,margin:"0 auto",paddingTop:20}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:52,marginBottom:10}}>⚽</div>
              <h1 style={{fontSize:26,fontWeight:800,letterSpacing:"-1px",marginBottom:6}}>Bem-vindo ao<br/><span style={{color:"#f7c948"}}>Bolão 2026</span></h1>
              <p style={{color:"rgba(240,244,255,.4)",fontSize:12}}>EUA · México · Canadá · Jun–Jul 2026</p>
            </div>
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:11,color:"#f7c948",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Entrar</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <input className="inp" placeholder="Seu nome" value={loginNome} onChange={e=>setLoginNome(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                <input className="inp" type="password" placeholder="Senha" value={loginSenha} onChange={e=>setLoginSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                {loginErro&&<div style={{color:"#f87171",fontSize:12}}>{loginErro}</div>}
                <button className="btn-gold" onClick={handleLogin} disabled={carregando}>{carregando?"Entrando...":"Entrar"}</button>
              </div>
            </div>
            <button className="btn-ghost" style={{width:"100%"}} onClick={()=>{setLoginErro("");setTela("cadastro");}}>Criar conta nova →</button>
          </div>
        )}

        {/* ══ CADASTRO ══ */}
        {tela==="cadastro"&&(
          <div className="fade" style={{maxWidth:360,margin:"0 auto",paddingTop:20}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:36,marginBottom:8}}>👤</div>
              <h2 style={{fontSize:20,fontWeight:800}}>Criar conta</h2>
              <p style={{color:"rgba(240,244,255,.4)",fontSize:12,marginTop:4}}>Cota: <span style={{color:"#f7c948",fontWeight:700}}>R$ {CONFIG.valorCota}</span></p>
            </div>
            <div className="card" style={{marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <input className="inp" placeholder="Seu nome completo" value={cadNome} onChange={e=>setCadNome(e.target.value)}/>
                <input className="inp" type="password" placeholder="Criar senha (mín. 4 chars)" value={cadSenha} onChange={e=>setCadSenha(e.target.value)}/>
                <input className="inp" type="password" placeholder="Confirmar senha" value={cadSenha2} onChange={e=>setCadSenha2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCadastro()}/>
                {cadErro&&<div style={{color:"#f87171",fontSize:12}}>{cadErro}</div>}
                <button className="btn-gold" onClick={handleCadastro} disabled={carregando}>{carregando?"Criando...":"Criar conta e entrar"}</button>
              </div>
            </div>
            <button className="btn-ghost" style={{width:"100%"}} onClick={()=>{setCadErro("");setTela("login");}}>← Voltar</button>
          </div>
        )}

        {/* ══ ADMIN LOGIN ══ */}
        {tela==="admin-login"&&(
          <div className="fade" style={{maxWidth:320,margin:"0 auto",paddingTop:40}}>
            <div className="card">
              <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>🔐 Área do Admin</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <input className="inp" type="password" placeholder="Senha do administrador" value={adminSenha} onChange={e=>setAdminSenha(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"){if(adminSenha===SENHA_ADMIN){setAdminErro("");setAdminSenha("");setTela("admin");}else setAdminErro("Senha incorreta.");}}}/>
                {adminErro&&<div style={{color:"#f87171",fontSize:12}}>{adminErro}</div>}
                <button className="btn-gold" onClick={()=>{if(adminSenha===SENHA_ADMIN){setAdminErro("");setAdminSenha("");setTela("admin");}else setAdminErro("Senha incorreta.");}}>Entrar</button>
              </div>
            </div>
            <button className="btn-ghost" style={{width:"100%",marginTop:10}} onClick={()=>setTela("login")}>← Voltar</button>
          </div>
        )}

        {/* ══ APP ══ */}
        {tela==="app"&&(
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,padding:"9px 13px",background:"rgba(255,255,255,.03)",borderRadius:10,border:"1px solid rgba(255,255,255,.06)"}}>
              <div>
                <div style={{fontSize:10,color:"rgba(240,244,255,.35)",fontFamily:"'JetBrains Mono',monospace"}}>LOGADO COMO</div>
                <div style={{fontWeight:700,fontSize:15}}>{usuarioAtual}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:"rgba(240,244,255,.4)"}}>{totalPalpites}/{jogosGrupo.length+jogosElim.filter((j:any)=>j.time1).length} palpites</span>
                {pago?<span className="badge bgr">✅ Pago</span>:<span className="badge br">⚠ Pendente</span>}
              </div>
            </div>

            {/* PALPITES */}
            {modo==="palpites"&&(
              <div>
                <div className="card" style={{marginBottom:14,border:"1px solid rgba(247,201,72,.2)",background:"rgba(247,201,72,.03)"}}>
                  <div style={{fontWeight:700,fontSize:11,color:"#f7c948",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🏆 Palpite: Campeão da Copa</div>
                  <div style={{fontSize:12,color:"rgba(240,244,255,.45)",marginBottom:8}}>Bônus de <strong style={{color:"#f7c948"}}>{CONFIG.bonusCampeao} pts</strong> se acertar!</div>
                  <select value={campeaoPalpiteAtual} onChange={e=>setCampeaoPalpite(e.target.value)} disabled={bloqueado("2026-07-19T17:00:00")}>
                    <option value="">— Selecione o campeão —</option>
                    {TODOS_TIMES.map(t=><option key={t} value={t}>{BANDEIRAS[t]} {t}</option>)}
                  </select>
                  {campeaoPalpiteAtual&&<div style={{marginTop:8,fontSize:12,color:"rgba(240,244,255,.6)"}}>Seu palpite: <strong style={{color:"#f7c948"}}>{BANDEIRAS[campeaoPalpiteAtual]} {campeaoPalpiteAtual}</strong></div>}
                </div>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {FASES.map(f=><button key={f} className={`ftab ${faseAtiva===f?"on":"off"}`} onClick={()=>setFaseAtiva(f)}>{FASE_LABEL[f]}</button>)}
                </div>
                {faseAtiva==="grupos"&&(
                  <>
                    <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
                      {Object.keys(GRUPOS).map(g=><button key={g} className={`gtab ${grupoAtivo===g?"on":"off"}`} onClick={()=>setGrupoAtivo(g)}>{g}</button>)}
                    </div>
                    <div style={{marginBottom:10,padding:"6px 10px",background:"rgba(255,255,255,.03)",borderRadius:7,display:"flex",gap:7,flexWrap:"wrap"}}>
                      {GRUPOS[grupoAtivo].map(t=><span key={t} style={{fontSize:10,color:"rgba(240,244,255,.55)"}}>{BANDEIRAS[t]} {t}</span>)}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {jogosGrupoFiltrado.map(j=><JogoCard key={j.id} jogo={j}/>)}
                    </div>
                  </>
                )}
                {faseAtiva!=="grupos"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {jogosElimFiltrado.filter((j:any)=>j.time1).length===0&&<div className="card" style={{textAlign:"center",color:"rgba(240,244,255,.3)",padding:"30px"}}>Jogos desta fase ainda não foram definidos pelo admin</div>}
                    {jogosElimFiltrado.filter((j:any)=>j.time1).map((j:any)=><JogoCard key={j.id} jogo={j} isElim/>)}
                  </div>
                )}
              </div>
            )}

            {/* RANKING */}
            {modo==="ranking"&&(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:10,color:"rgba(240,244,255,.35)",fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>AO VIVO</div>
                    <div style={{fontWeight:800,fontSize:18}}>Classificação Geral</div>
                  </div>
                  <button onClick={exportarRanking} className="btn-ghost" style={{fontSize:11,padding:"6px 12px"}}>
                    {copiadoRanking?"✅ Copiado!":"📤 WhatsApp"}
                  </button>
                </div>
                <div className="card" style={{marginBottom:14,background:"rgba(247,201,72,.04)",border:"1px solid rgba(247,201,72,.15)"}}>
                  <div style={{fontWeight:700,fontSize:10,color:"#f7c948",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>💰 Premiação Final</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {premios.dist.map(d=>(
                      <div key={d.pos} style={{flex:"1 1 80px",textAlign:"center",padding:"8px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
                        <div style={{fontSize:18}}>{MEDALHAS[d.pos-1]}</div>
                        <div style={{fontWeight:800,fontSize:15,color:"#f7c948"}}>R$ {d.valor}</div>
                        <div style={{fontSize:9,color:"rgba(240,244,255,.4)"}}>{d.pct*100}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:8,fontSize:10,color:"rgba(240,244,255,.35)",textAlign:"center"}}>
                    Total: R$ {premios.total} · {nParticipantes} participantes × R$ {CONFIG.valorCota}
                  </div>
                </div>
                {nParticipantes===0?(
                  <div className="card" style={{textAlign:"center",padding:"36px",color:"rgba(240,244,255,.4)"}}>Nenhum participante ainda</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {ranking.map((p,i)=>{
                      const isMe=p.nome===usuarioAtual;
                      const premio=premios.dist.find(d=>d.pos===i+1);
                      return (
                        <div key={p.nome} className="card" style={{display:"flex",alignItems:"center",gap:10,background:isMe?"rgba(247,201,72,.06)":"rgba(255,255,255,.04)",border:isMe?"1px solid rgba(247,201,72,.25)":"1px solid rgba(255,255,255,.07)",cursor:"pointer",position:"relative",overflow:"hidden"}}
                          onClick={()=>setDetalheUser(detalheUser===p.nome?null:p.nome)}>
                          {isMe&&<div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:"#f7c948"}}/>}
                          <div style={{fontSize:18,width:26,textAlign:"center",flexShrink:0}}>{MEDALHAS[i]||`${i+1}º`}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{p.nome} {isMe&&<span style={{fontSize:9,color:"#f7c948"}}>(você)</span>}</div>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              <span className="badge bb">✅ {p.acertos}</span>
                              <span className="badge bp">🎯 {p.placares}</span>
                              {p.campeao&&<span className="badge bg">{BANDEIRAS[p.campeao]}</span>}
                              {!p.pago&&<span className="badge br">💸</span>}
                            </div>
                            {detalheUser===p.nome&&(
                              <div style={{marginTop:8,fontSize:10,color:"rgba(240,244,255,.5)",lineHeight:1.7}}>
                                {p.bonusCampeao>0&&<div>🏆 Bônus campeão: +{p.bonusCampeao}pts</div>}
                                <div>Desempate: {p.placares} placares → {p.acertos} acertos</div>
                                {premio&&<div style={{color:"#f7c948",fontWeight:700}}>💰 Prêmio: R$ {premio.valor}</div>}
                              </div>
                            )}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:22,fontWeight:800,color:"#f7c948",fontFamily:"'JetBrains Mono',monospace"}}>{p.pontos}</div>
                            <div style={{fontSize:9,color:"rgba(240,244,255,.35)"}}>pts</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* HISTÓRICO */}
            {modo==="historico"&&(
              <div>
                <div style={{marginBottom:14}}>
                  <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>📊 Meu Histórico</div>
                  <div style={{fontSize:12,color:"rgba(240,244,255,.4)"}}>Resultados jogo a jogo</div>
                </div>
                {(()=>{
                  const dados=calcularTudo(pal,jogosGrupo,jogosElim,resultados,resultadosElim,campeaoPalpiteAtual,campeaoReal);
                  const comRes=dados.detalhes.filter((d:any)=>d.res);
                  if(comRes.length===0) return <div className="card" style={{textAlign:"center",padding:"36px",color:"rgba(240,244,255,.35)"}}>Nenhum jogo encerrado ainda</div>;
                  return (
                    <>
                      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                        {[["🎯",comRes.filter((d:any)=>d.tipo==="placar").length,"Placares exatos","#f7c948"],
                          ["✅",comRes.filter((d:any)=>d.tipo==="vencedor").length,"Acertos","#7eb8ff"],
                          ["❌",comRes.filter((d:any)=>d.tipo==="erro"||d.tipo==="sem_palpite").length,"Erros","#f87171"],
                          ["⭐",dados.pontos,"Pontos totais","#4ade80"]
                        ].map(([ic,v,lb,cor]:any)=>(
                          <div key={lb} style={{flex:"1 1 80px",textAlign:"center",padding:"10px",background:"rgba(255,255,255,.04)",borderRadius:10,border:"1px solid rgba(255,255,255,.07)"}}>
                            <div style={{fontSize:18}}>{ic}</div>
                            <div style={{fontWeight:800,fontSize:18,color:cor}}>{v}</div>
                            <div style={{fontSize:9,color:"rgba(240,244,255,.35)"}}>{lb}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {comRes.map((d:any)=>{
                          const cor=d.tipo==="placar"?"#f7c948":d.tipo==="vencedor"?"#7eb8ff":"#f87171";
                          const ic=d.tipo==="placar"?"🎯":d.tipo==="vencedor"?"✅":d.tipo==="sem_palpite"?"—":"❌";
                          return (
                            <div key={d.id} className="card" style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderLeft:`3px solid ${cor}`}}>
                              <div style={{fontSize:16,flexShrink:0}}>{ic}</div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:11,fontWeight:700}}>{BANDEIRAS[d.time1]||""} {d.time1} × {d.time2} {BANDEIRAS[d.time2]||""}</div>
                                <div style={{fontSize:10,color:"rgba(240,244,255,.4)",marginTop:2}}>
                                  Resultado: {d.res.gols1}×{d.res.gols2}{d.res.penalti?" (pên.)":""} · Palpite: {d.pal?`${d.pal.gols1}×${d.pal.gols2}`:"sem palpite"}
                                </div>
                              </div>
                              <div style={{fontWeight:800,fontSize:14,color:cor,flexShrink:0,fontFamily:"'JetBrains Mono',monospace"}}>
                                {d.pts>0?`+${d.pts}`:d.tipo==="sem_palpite"?"—":"0"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* PIX */}
            {modo==="pix"&&(
              <div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:"rgba(240,244,255,.35)",fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>PAGAMENTO</div>
                  <div style={{fontWeight:800,fontSize:18}}>Cota de Entrada</div>
                </div>
                {pago?(
                  <div className="card" style={{textAlign:"center",padding:"32px",border:"1px solid rgba(74,222,128,.25)",background:"rgba(74,222,128,.04)"}}>
                    <div style={{fontSize:46,marginBottom:10}}>✅</div>
                    <div style={{fontWeight:800,fontSize:17,color:"#4ade80",marginBottom:5}}>Pagamento confirmado!</div>
                    <div style={{fontSize:12,color:"rgba(240,244,255,.45)"}}>Você está dentro do bolão. Boa sorte! 🍀</div>
                  </div>
                ):(
                  <div>
                    <div style={{textAlign:"center",marginBottom:14}}>
                      <div style={{fontWeight:800,fontSize:34,color:"#f7c948"}}>R$ {CONFIG.valorCota},00</div>
                      <div style={{fontSize:12,color:"rgba(240,244,255,.4)",marginTop:2}}>Valor da cota por participante</div>
                    </div>
                    <div className="card" style={{marginBottom:10,border:"1px solid rgba(247,201,72,.2)",background:"rgba(247,201,72,.04)",textAlign:"center"}}>
                      <div style={{fontSize:10,color:"#f7c948",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Escaneie o QR Code</div>
                      <div style={{display:"inline-block",background:"#fff",borderRadius:12,padding:10,marginBottom:10}}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(CONFIG.pixCopiaCola)}`} alt="QR Code Pix" width={190} height={190} style={{display:"block",borderRadius:4}}/>
                      </div>
                      <div style={{fontSize:11,color:"rgba(240,244,255,.45)"}}>App do banco → Pix → Ler QR Code</div>
                    </div>
                    <div className="card" style={{marginBottom:10}}>
                      <div style={{fontSize:10,color:"rgba(240,244,255,.35)",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>CHAVE PIX ALEATÓRIA</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,fontWeight:600,fontSize:11,color:"#f0f4ff",wordBreak:"break-all",fontFamily:"'JetBrains Mono',monospace"}}>{CONFIG.chavePix}</div>
                        <button onClick={()=>{navigator.clipboard.writeText(CONFIG.chavePix);setCopiadoChave(true);setTimeout(()=>setCopiadoChave(false),2000);}}
                          style={{flexShrink:0,padding:"7px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,background:copiadoChave?"rgba(74,222,128,.15)":"rgba(247,201,72,.15)",color:copiadoChave?"#4ade80":"#f7c948",border:copiadoChave?"1px solid rgba(74,222,128,.3)":"1px solid rgba(247,201,72,.3)"}}>
                          {copiadoChave?"✅ Copiado!":"📋 Copiar"}
                        </button>
                      </div>
                      <div style={{fontSize:10,color:"rgba(240,244,255,.35)",marginTop:5}}>Favorecido: {CONFIG.nomePix}</div>
                    </div>
                    <div className="card" style={{marginBottom:10}}>
                      <div style={{fontSize:10,color:"rgba(240,244,255,.35)",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>PIX COPIA E COLA</div>
                      <div style={{fontSize:9,color:"rgba(240,244,255,.4)",wordBreak:"break-all",fontFamily:"'JetBrains Mono',monospace",marginBottom:8,lineHeight:1.5}}>{CONFIG.pixCopiaCola.slice(0,60)}...</div>
                      <button onClick={()=>{navigator.clipboard.writeText(CONFIG.pixCopiaCola);setCopiadoCola(true);setTimeout(()=>setCopiadoCola(false),2000);}}
                        style={{width:"100%",padding:"9px",borderRadius:8,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,background:copiadoCola?"rgba(74,222,128,.15)":"rgba(255,255,255,.06)",color:copiadoCola?"#4ade80":"#f0f4ff",border:copiadoCola?"1px solid rgba(74,222,128,.3)":"1px solid rgba(255,255,255,.12)"}}>
                        {copiadoCola?"✅ Código copiado!":"📋 Copiar código completo"}
                      </button>
                    </div>
                    <div className="card" style={{fontSize:12,color:"rgba(240,244,255,.55)",lineHeight:1.8}}>
                      <div style={{fontWeight:700,color:"#f7c948",marginBottom:7}}>📌 Como pagar</div>
                      <div>1. Escaneie o QR Code <strong style={{color:"#f0f4ff"}}>ou</strong> copie a chave</div>
                      <div>2. Confirme: <strong style={{color:"#f7c948"}}>R$ {CONFIG.valorCota},00 → {CONFIG.nomePix}</strong></div>
                      <div>3. Envie o comprovante no grupo do WhatsApp</div>
                      <div>4. O admin confirma e você entra no bolão</div>
                      <div style={{marginTop:7,padding:"7px 11px",background:"rgba(248,113,113,.07)",borderRadius:7,color:"#f87171",fontSize:11}}>⚠ Apenas pagos concorrem ao prêmio</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REGRAS */}
            {modo==="regras"&&(
              <div>
                <div style={{fontWeight:800,fontSize:18,marginBottom:14}}>📋 Regras do Bolão</div>
                {[
                  {title:"Pontuação por fase",rows:[
                    ["⚽","Grupos — vencedor/empate","+2 pts"],["🎯","Grupos — placar exato","+5 pts"],
                    ["⚽","Oitavas — vencedor","+3 pts"],["🎯","Oitavas — placar exato","+8 pts"],
                    ["⚽","Quartas — vencedor","+5 pts"],["🎯","Quartas — placar exato","+12 pts"],
                    ["⚽","Semifinal — vencedor","+7 pts"],["🎯","Semifinal — placar exato","+15 pts"],
                    ["⚽","Final — vencedor","+10 pts"],["🎯","Final — placar exato","+20 pts"],
                  ]},
                  {title:"Bônus e pênaltis",rows:[
                    ["🏆",`Acertar campeão da Copa`,`+${CONFIG.bonusCampeao} pts`],
                    ["🥅","Pênalti: vale o vencedor final","sem placar exato"],
                    ["🔒",`Bloqueio ${CONFIG.minutesBloqueio}min antes do jogo`,"automático"],
                  ]},
                  {title:"Desempate",rows:[
                    ["1️⃣","Mais placares exatos",""],["2️⃣","Mais acertos",""],
                    ["3️⃣","Acertou o campeão",""],["4️⃣","Decisão do admin",""],
                  ]},
                  {title:"Distribuição do prêmio",rows:premios.dist.map(d=>[MEDALHAS[d.pos-1],`${d.pos}º lugar — ${d.pct*100}%`,`R$ ${d.valor}`])},
                ].map((sec,si)=>(
                  <div key={si} className="card" style={{marginBottom:10}}>
                    <div style={{fontWeight:700,fontSize:10,color:"#f7c948",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{sec.title}</div>
                    {sec.rows.map((r,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:i<sec.rows.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
                        <span style={{fontSize:15}}>{r[0]}</span>
                        <span style={{flex:1,fontSize:12,color:"rgba(240,244,255,.75)"}}>{r[1]}</span>
                        {r[2]&&<span className="badge bg">{r[2]}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ADMIN ══ */}
        {tela==="admin"&&(
          <div className="fade">
            <div style={{marginBottom:14,padding:"9px 13px",background:"rgba(248,113,113,.05)",border:"1px solid rgba(248,113,113,.18)",borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700,fontSize:12,color:"#f87171"}}>🔐 Painel do Administrador</span>
              {salvoMsg&&<span style={{fontSize:11,color:"#4ade80",fontFamily:"'JetBrains Mono',monospace"}}>{salvoMsg}</span>}
            </div>

            {/* GRUPOS */}
            {adminModo==="resultados"&&(
              <div>
                <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>
                  {Object.keys(GRUPOS).map(g=><button key={g} className={`gtab ${grupoAtivo===g?"on":"off"}`} onClick={()=>setGrupoAtivo(g)}>{g}</button>)}
                </div>
                <div style={{marginBottom:10,padding:"6px 10px",background:"rgba(255,255,255,.03)",borderRadius:7,display:"flex",gap:7,flexWrap:"wrap"}}>
                  {GRUPOS[grupoAtivo].map(t=><span key={t} style={{fontSize:10,color:"rgba(240,244,255,.55)"}}>{BANDEIRAS[t]} {t}</span>)}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {jogosGrupo.filter(j=>j.grupo===grupoAtivo).map(j=><JogoCard key={j.id} jogo={j} isAdmin/>)}
                </div>
                <div style={{marginTop:10,padding:"9px 13px",background:"rgba(74,222,128,.04)",border:"1px solid rgba(74,222,128,.12)",borderRadius:9,display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:"rgba(240,244,255,.5)"}}>{Object.keys(resultados).filter(id=>resultados[id]?.gols1!==""&&resultados[id]?.gols1!==undefined).length}/{jogosGrupo.length} resultados</span>
                  <span className="badge bgr">☁ Supabase</span>
                </div>
              </div>
            )}

            {/* ELIMINATÓRIAS */}
            {adminModo==="elim"&&(
              <div>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {["oitavas","quartas","semi","final"].map(f=><button key={f} className={`ftab ${faseAtiva===f?"on":"off"}`} onClick={()=>setFaseAtiva(f)}>{FASE_LABEL[f]}</button>)}
                </div>
                {faseAtiva==="final"&&(
                  <div className="card" style={{marginBottom:10,border:"1px solid rgba(247,201,72,.2)"}}>
                    <div style={{fontWeight:700,fontSize:10,color:"#f7c948",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>🏆 Campeão Real da Copa</div>
                    <select value={campeaoReal} onChange={e=>atualizarCampeaoReal(e.target.value)}>
                      <option value="">— Ainda não definido —</option>
                      {TODOS_TIMES.map(t=><option key={t} value={t}>{BANDEIRAS[t]} {t}</option>)}
                    </select>
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {jogosElim.filter(j=>j.fase===faseAtiva).map(j=>(
                    <div key={j.id}>
                      <div style={{fontSize:10,color:"rgba(240,244,255,.4)",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>{j.label}</div>
                      <div style={{display:"flex",gap:7,marginBottom:6}}>
                        <select style={{flex:1,fontSize:12,padding:"7px 10px"}} value={j.time1} onChange={e=>updateElimTime(j.id,"time1",e.target.value)}>
                          <option value="">— Time 1 —</option>
                          {TODOS_TIMES.map(t=><option key={t} value={t}>{BANDEIRAS[t]} {t}</option>)}
                        </select>
                        <select style={{flex:1,fontSize:12,padding:"7px 10px"}} value={j.time2} onChange={e=>updateElimTime(j.id,"time2",e.target.value)}>
                          <option value="">— Time 2 —</option>
                          {TODOS_TIMES.map(t=><option key={t} value={t}>{BANDEIRAS[t]} {t}</option>)}
                        </select>
                      </div>
                      {j.time1&&j.time2&&<JogoCard jogo={j} isAdmin isElim/>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USUÁRIOS */}
            {adminModo==="usuarios"&&(
              <div>
                <div style={{marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:14}}>{nParticipantes} participantes</div>
                  <div style={{fontSize:11,color:"rgba(240,244,255,.4)"}}>
                    Arrecadado: <span style={{color:"#f7c948",fontWeight:700}}>R$ {premios.total}</span> · 
                    Pagos: <span style={{color:"#4ade80",fontWeight:700}}>R$ {Object.values(usuarios).filter((u:any)=>u.pago).length*CONFIG.valorCota}</span> · 
                    Pendente: <span style={{color:"#f87171",fontWeight:700}}>R$ {Object.values(usuarios).filter((u:any)=>!u.pago).length*CONFIG.valorCota}</span>
                  </div>
                </div>
                {nParticipantes===0&&<div className="card" style={{textAlign:"center",color:"rgba(240,244,255,.35)",padding:"28px"}}>Nenhum participante cadastrado ainda</div>}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Object.entries(usuarios).map(([nome,u]:any)=>{
                    const pos=ranking.findIndex(r=>r.nome===nome);
                    const isReset=resetNome===nome;
                    return (
                      <div key={nome} className="card" style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{fontSize:16,width:24,textAlign:"center"}}>{pos>=0?MEDALHAS[pos]||`${pos+1}º`:"—"}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:13}}>{nome}</div>
                            <div style={{fontSize:10,color:"rgba(240,244,255,.4)",marginTop:2}}>
                              🏆 {u.campeaoPalpite?`${BANDEIRAS[u.campeaoPalpite]} ${u.campeaoPalpite}`:"Sem palpite campeão"}
                              {pos>=0&&` · ${ranking[pos]?.pontos||0}pts`}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:6,flexShrink:0}}>
                            <button onClick={()=>setResetNome(isReset?null:nome)}
                              style={{padding:"5px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,.12)",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:10,background:"rgba(255,255,255,.05)",color:"rgba(240,244,255,.6)"}}>
                              🔑 Senha
                            </button>
                            <button onClick={()=>togglePago(nome)}
                              style={{padding:"5px 10px",borderRadius:7,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:10,background:u.pago?"rgba(74,222,128,.15)":"rgba(248,113,113,.15)",color:u.pago?"#4ade80":"#f87171",border:u.pago?"1px solid rgba(74,222,128,.3)":"1px solid rgba(248,113,113,.3)"}}>
                              {u.pago?"✅ Pago":"⚠ Pendente"}
                            </button>
                          </div>
                        </div>
                        {isReset&&(
                          <div style={{marginTop:10,display:"flex",gap:8}}>
                            <input className="inp" type="password" placeholder="Nova senha (mín. 4 chars)" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)}
                              style={{fontSize:12,padding:"8px 12px"}}/>
                            <button onClick={()=>resetarSenha(nome,novaSenha)}
                              style={{padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",background:"#f7c948",color:"#0a0f1e",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,flexShrink:0}}>
                              Salvar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}