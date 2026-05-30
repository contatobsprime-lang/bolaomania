"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const CONFIG = {
  valorCota: 10,
  chavePix: "ab08302c-9d0d-43ac-933a-dafedeaf0b50",
  nomePix: "Bruno Souza",
  pixCopiaCola: "00020126360014br.gov.bcb.pix0114+5547999931877520400005303986540510.005802BR5911Bruno Souza6009Sao Paulo62240520daqr120444386078858563042950",
  bonusCampeao: 20,
  minutesBloqueio: 30,
  bloqueioCompetidor: "2026-07-04T18:00:00",
  premios: { 1:0.40, 2:0.25, 3:0.15, 4:0.12, 5:0.08 },
  pontos: {
    grupos:  { vencedor:2,  placar:5  },
    oitavas: { vencedor:3,  placar:8  },
    quartas: { vencedor:5,  placar:12 },
    semi:    { vencedor:7,  placar:15 },
    final:   { vencedor:10, placar:20 },
  },
};

// SENHA_ADMIN movida para API Route segura (/api/verify-admin)
// MP_ACCESS_TOKEN movido para API Route segura (/api/create-payment)

const GRUPOS: Record<string,string[]> = {
  A:["México","Coreia do Sul","República Tcheca","África do Sul"],
  B:["Canadá","Suíça","Catar","Bósnia"],
  C:["Brasil","Marrocos","Escócia","Haiti"],
  D:["Estados Unidos","Austrália","Paraguai","Turquia"],
  E:["Alemanha","Equador","Costa do Marfim","Curaçao"],
  F:["Países Baixos","Japão","Tunísia","Suécia"],
  G:["Bélgica","Irã","Egito","Nova Zelândia"],
  H:["Espanha","Uruguai","Arábia Saudita","Cabo Verde"],
  I:["França","Senegal","Noruega","Iraque"],
  J:["Argentina","Áustria","Argélia","Jordânia"],
  K:["Portugal","Colômbia","Uzbequistão","RD Congo"],
  L:["Inglaterra","Croácia","Panamá","Gana"],
};
const TODOS_TIMES = Object.values(GRUPOS).flat();
const F: Record<string,string> = {
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

const JOGOS_GRUPO = [
  {id:1,g:"A",r:1,fase:"grupos",time1:"México",time2:"África do Sul",dt:"2026-06-11T16:00:00",est:"Estádio Azteca",cid:"Cidade do México"},
  {id:2,g:"A",r:1,fase:"grupos",time1:"Coreia do Sul",time2:"República Tcheca",dt:"2026-06-11T23:00:00",est:"Estádio Akron",cid:"Guadalajara"},
  {id:3,g:"B",r:1,fase:"grupos",time1:"Canadá",time2:"Bósnia",dt:"2026-06-12T16:00:00",est:"BMO Field",cid:"Toronto"},
  {id:4,g:"B",r:1,fase:"grupos",time1:"Catar",time2:"Suíça",dt:"2026-06-13T16:00:00",est:"Levi's Stadium",cid:"San Francisco"},
  {id:5,g:"C",r:1,fase:"grupos",time1:"Brasil",time2:"Marrocos",dt:"2026-06-13T19:00:00",est:"MetLife Stadium",cid:"Nova York/NJ"},
  {id:6,g:"C",r:1,fase:"grupos",time1:"Haiti",time2:"Escócia",dt:"2026-06-13T22:00:00",est:"Gillette Stadium",cid:"Boston"},
  {id:7,g:"D",r:1,fase:"grupos",time1:"Estados Unidos",time2:"Paraguai",dt:"2026-06-12T22:00:00",est:"SoFi Stadium",cid:"Los Angeles"},
  {id:8,g:"D",r:1,fase:"grupos",time1:"Austrália",time2:"Turquia",dt:"2026-06-13T01:00:00",est:"BC Place",cid:"Vancouver"},
  {id:9,g:"E",r:1,fase:"grupos",time1:"Alemanha",time2:"Curaçao",dt:"2026-06-14T14:00:00",est:"NRG Stadium",cid:"Houston"},
  {id:10,g:"E",r:1,fase:"grupos",time1:"Costa do Marfim",time2:"Equador",dt:"2026-06-14T20:00:00",est:"Lincoln Financial",cid:"Filadélfia"},
  {id:11,g:"F",r:1,fase:"grupos",time1:"Países Baixos",time2:"Japão",dt:"2026-06-14T17:00:00",est:"AT&T Stadium",cid:"Dallas"},
  {id:12,g:"F",r:1,fase:"grupos",time1:"Suécia",time2:"Tunísia",dt:"2026-06-14T23:00:00",est:"Estádio BBVA",cid:"Monterrey"},
  {id:13,g:"G",r:1,fase:"grupos",time1:"Bélgica",time2:"Egito",dt:"2026-06-15T16:00:00",est:"Lumen Field",cid:"Seattle"},
  {id:14,g:"G",r:1,fase:"grupos",time1:"Irã",time2:"Nova Zelândia",dt:"2026-06-15T22:00:00",est:"SoFi Stadium",cid:"Los Angeles"},
  {id:15,g:"H",r:1,fase:"grupos",time1:"Espanha",time2:"Cabo Verde",dt:"2026-06-15T13:00:00",est:"Mercedes-Benz Stadium",cid:"Atlanta"},
  {id:16,g:"H",r:1,fase:"grupos",time1:"Arábia Saudita",time2:"Uruguai",dt:"2026-06-15T19:00:00",est:"Hard Rock Stadium",cid:"Miami"},
  {id:17,g:"I",r:1,fase:"grupos",time1:"França",time2:"Senegal",dt:"2026-06-16T16:00:00",est:"MetLife Stadium",cid:"Nova York/NJ"},
  {id:18,g:"I",r:1,fase:"grupos",time1:"Iraque",time2:"Noruega",dt:"2026-06-16T19:00:00",est:"Gillette Stadium",cid:"Boston"},
  {id:19,g:"J",r:1,fase:"grupos",time1:"Argentina",time2:"Argélia",dt:"2026-06-16T14:00:00",est:"Arrowhead Stadium",cid:"Kansas City"},
  {id:20,g:"J",r:1,fase:"grupos",time1:"Áustria",time2:"Jordânia",dt:"2026-06-17T01:00:00",est:"Levi's Stadium",cid:"San Francisco"},
  {id:21,g:"K",r:1,fase:"grupos",time1:"Portugal",time2:"RD Congo",dt:"2026-06-17T14:00:00",est:"NRG Stadium",cid:"Houston"},
  {id:22,g:"K",r:1,fase:"grupos",time1:"Uzbequistão",time2:"Colômbia",dt:"2026-06-17T23:00:00",est:"Estádio Azteca",cid:"Cidade do México"},
  {id:23,g:"L",r:1,fase:"grupos",time1:"Inglaterra",time2:"Croácia",dt:"2026-06-17T17:00:00",est:"AT&T Stadium",cid:"Dallas"},
  {id:24,g:"L",r:1,fase:"grupos",time1:"Gana",time2:"Panamá",dt:"2026-06-17T20:00:00",est:"BMO Field",cid:"Toronto"},
  {id:25,g:"A",r:2,fase:"grupos",time1:"África do Sul",time2:"República Tcheca",dt:"2026-06-18T13:00:00",est:"Mercedes-Benz Stadium",cid:"Atlanta"},
  {id:26,g:"A",r:2,fase:"grupos",time1:"México",time2:"Coreia do Sul",dt:"2026-06-18T22:00:00",est:"Estádio Akron",cid:"Guadalajara"},
  {id:27,g:"B",r:2,fase:"grupos",time1:"Suíça",time2:"Bósnia",dt:"2026-06-18T16:00:00",est:"SoFi Stadium",cid:"Los Angeles"},
  {id:28,g:"B",r:2,fase:"grupos",time1:"Canadá",time2:"Catar",dt:"2026-06-19T19:00:00",est:"BC Place",cid:"Vancouver"},
  {id:29,g:"C",r:2,fase:"grupos",time1:"Escócia",time2:"Marrocos",dt:"2026-06-19T19:00:00",est:"Gillette Stadium",cid:"Boston"},
  {id:30,g:"C",r:2,fase:"grupos",time1:"Brasil",time2:"Haiti",dt:"2026-06-19T21:30:00",est:"Lincoln Financial",cid:"Filadélfia"},
  {id:31,g:"D",r:2,fase:"grupos",time1:"Turquia",time2:"Paraguai",dt:"2026-06-19T01:00:00",est:"Levi's Stadium",cid:"San Francisco"},
  {id:32,g:"D",r:2,fase:"grupos",time1:"Estados Unidos",time2:"Austrália",dt:"2026-06-20T16:00:00",est:"Lumen Field",cid:"Seattle"},
  {id:33,g:"E",r:2,fase:"grupos",time1:"Alemanha",time2:"Costa do Marfim",dt:"2026-06-20T17:00:00",est:"BMO Field",cid:"Toronto"},
  {id:34,g:"E",r:2,fase:"grupos",time1:"Equador",time2:"Curaçao",dt:"2026-06-20T21:00:00",est:"Arrowhead Stadium",cid:"Kansas City"},
  {id:35,g:"F",r:2,fase:"grupos",time1:"Países Baixos",time2:"Suécia",dt:"2026-06-20T14:00:00",est:"NRG Stadium",cid:"Houston"},
  {id:36,g:"F",r:2,fase:"grupos",time1:"Tunísia",time2:"Japão",dt:"2026-06-21T01:00:00",est:"Estádio BBVA",cid:"Monterrey"},
  {id:37,g:"G",r:2,fase:"grupos",time1:"Bélgica",time2:"Irã",dt:"2026-06-21T16:00:00",est:"SoFi Stadium",cid:"Los Angeles"},
  {id:38,g:"G",r:2,fase:"grupos",time1:"Nova Zelândia",time2:"Egito",dt:"2026-06-21T22:00:00",est:"BC Place",cid:"Vancouver"},
  {id:39,g:"H",r:2,fase:"grupos",time1:"Espanha",time2:"Arábia Saudita",dt:"2026-06-21T13:00:00",est:"Mercedes-Benz Stadium",cid:"Atlanta"},
  {id:40,g:"H",r:2,fase:"grupos",time1:"Uruguai",time2:"Cabo Verde",dt:"2026-06-21T19:00:00",est:"Hard Rock Stadium",cid:"Miami"},
  {id:41,g:"I",r:2,fase:"grupos",time1:"França",time2:"Iraque",dt:"2026-06-22T18:00:00",est:"Lincoln Financial",cid:"Filadélfia"},
  {id:42,g:"I",r:2,fase:"grupos",time1:"Noruega",time2:"Senegal",dt:"2026-06-22T21:00:00",est:"MetLife Stadium",cid:"Nova York/NJ"},
  {id:43,g:"J",r:2,fase:"grupos",time1:"Argentina",time2:"Áustria",dt:"2026-06-22T14:00:00",est:"AT&T Stadium",cid:"Dallas"},
  {id:44,g:"J",r:2,fase:"grupos",time1:"Jordânia",time2:"Argélia",dt:"2026-06-23T00:00:00",est:"Levi's Stadium",cid:"San Francisco"},
  {id:45,g:"K",r:2,fase:"grupos",time1:"Portugal",time2:"Uzbequistão",dt:"2026-06-23T14:00:00",est:"NRG Stadium",cid:"Houston"},
  {id:46,g:"K",r:2,fase:"grupos",time1:"Colômbia",time2:"RD Congo",dt:"2026-06-23T23:00:00",est:"Estádio Akron",cid:"Guadalajara"},
  {id:47,g:"L",r:2,fase:"grupos",time1:"Inglaterra",time2:"Gana",dt:"2026-06-23T17:00:00",est:"Gillette Stadium",cid:"Boston"},
  {id:48,g:"L",r:2,fase:"grupos",time1:"Panamá",time2:"Croácia",dt:"2026-06-23T20:00:00",est:"BMO Field",cid:"Toronto"},
  {id:49,g:"A",r:3,fase:"grupos",time1:"República Tcheca",time2:"México",dt:"2026-06-24T22:00:00",est:"Estádio Azteca",cid:"Cidade do México"},
  {id:50,g:"A",r:3,fase:"grupos",time1:"África do Sul",time2:"Coreia do Sul",dt:"2026-06-24T22:00:00",est:"Estádio BBVA",cid:"Monterrey"},
  {id:51,g:"B",r:3,fase:"grupos",time1:"Suíça",time2:"Canadá",dt:"2026-06-24T16:00:00",est:"BC Place",cid:"Vancouver"},
  {id:52,g:"B",r:3,fase:"grupos",time1:"Bósnia",time2:"Catar",dt:"2026-06-24T16:00:00",est:"Lumen Field",cid:"Seattle"},
  {id:53,g:"C",r:3,fase:"grupos",time1:"Escócia",time2:"Brasil",dt:"2026-06-24T19:00:00",est:"Hard Rock Stadium",cid:"Miami"},
  {id:54,g:"C",r:3,fase:"grupos",time1:"Marrocos",time2:"Haiti",dt:"2026-06-24T19:00:00",est:"Mercedes-Benz Stadium",cid:"Atlanta"},
  {id:55,g:"D",r:3,fase:"grupos",time1:"Turquia",time2:"Estados Unidos",dt:"2026-06-25T23:00:00",est:"SoFi Stadium",cid:"Los Angeles"},
  {id:56,g:"D",r:3,fase:"grupos",time1:"Paraguai",time2:"Austrália",dt:"2026-06-25T23:00:00",est:"Levi's Stadium",cid:"San Francisco"},
  {id:57,g:"E",r:3,fase:"grupos",time1:"Equador",time2:"Alemanha",dt:"2026-06-25T17:00:00",est:"MetLife Stadium",cid:"Nova York/NJ"},
  {id:58,g:"E",r:3,fase:"grupos",time1:"Curaçao",time2:"Costa do Marfim",dt:"2026-06-25T17:00:00",est:"Lincoln Financial",cid:"Filadélfia"},
  {id:59,g:"F",r:3,fase:"grupos",time1:"Japão",time2:"Suécia",dt:"2026-06-25T20:00:00",est:"AT&T Stadium",cid:"Dallas"},
  {id:60,g:"F",r:3,fase:"grupos",time1:"Tunísia",time2:"Países Baixos",dt:"2026-06-25T20:00:00",est:"Arrowhead Stadium",cid:"Kansas City"},
  {id:61,g:"G",r:3,fase:"grupos",time1:"Egito",time2:"Irã",dt:"2026-06-27T00:00:00",est:"Lumen Field",cid:"Seattle"},
  {id:62,g:"G",r:3,fase:"grupos",time1:"Nova Zelândia",time2:"Bélgica",dt:"2026-06-27T00:00:00",est:"BC Place",cid:"Vancouver"},
  {id:63,g:"H",r:3,fase:"grupos",time1:"Cabo Verde",time2:"Arábia Saudita",dt:"2026-06-26T21:00:00",est:"NRG Stadium",cid:"Houston"},
  {id:64,g:"H",r:3,fase:"grupos",time1:"Uruguai",time2:"Espanha",dt:"2026-06-26T21:00:00",est:"Estádio Akron",cid:"Guadalajara"},
  {id:65,g:"I",r:3,fase:"grupos",time1:"Noruega",time2:"França",dt:"2026-06-26T16:00:00",est:"Gillette Stadium",cid:"Boston"},
  {id:66,g:"I",r:3,fase:"grupos",time1:"Senegal",time2:"Iraque",dt:"2026-06-26T16:00:00",est:"BMO Field",cid:"Toronto"},
  {id:67,g:"J",r:3,fase:"grupos",time1:"Argélia",time2:"Áustria",dt:"2026-06-27T23:00:00",est:"Arrowhead Stadium",cid:"Kansas City"},
  {id:68,g:"J",r:3,fase:"grupos",time1:"Jordânia",time2:"Argentina",dt:"2026-06-27T23:00:00",est:"AT&T Stadium",cid:"Dallas"},
  {id:69,g:"K",r:3,fase:"grupos",time1:"Colômbia",time2:"Portugal",dt:"2026-06-27T20:30:00",est:"Hard Rock Stadium",cid:"Miami"},
  {id:70,g:"K",r:3,fase:"grupos",time1:"RD Congo",time2:"Uzbequistão",dt:"2026-06-27T20:30:00",est:"Mercedes-Benz Stadium",cid:"Atlanta"},
  {id:71,g:"L",r:3,fase:"grupos",time1:"Panamá",time2:"Inglaterra",dt:"2026-06-27T18:00:00",est:"MetLife Stadium",cid:"Nova York/NJ"},
  {id:72,g:"L",r:3,fase:"grupos",time1:"Croácia",time2:"Gana",dt:"2026-06-27T18:00:00",est:"Lincoln Financial",cid:"Filadélfia"},
];

const ELIM_TMPL = [
  ...Array.from({length:16},(_,i)=>({id:100+i,fase:"oitavas",label:`Oitavas ${i+1}`,time1:"",time2:"",dt:"2026-07-04T18:00:00",est:"A definir",cid:"A definir"})),
  ...Array.from({length:8},(_,i)=>({id:200+i,fase:"quartas",label:`Quartas ${i+1}`,time1:"",time2:"",dt:"2026-07-10T18:00:00",est:"A definir",cid:"A definir"})),
  ...Array.from({length:4},(_,i)=>({id:300+i,fase:"semi",label:`Semifinal ${i+1}`,time1:"",time2:"",dt:"2026-07-14T16:00:00",est:"A definir",cid:"A definir"})),
  {id:400,fase:"final",label:"Final",time1:"",time2:"",dt:"2026-07-19T16:00:00",est:"MetLife Stadium",cid:"Nova York/NJ"},
  {id:401,fase:"final",label:"3º Lugar",time1:"",time2:"",dt:"2026-07-18T17:00:00",est:"Hard Rock Stadium",cid:"Miami"},
];

function lock(dt:string){return (new Date(dt).getTime()-Date.now())/60000<=CONFIG.minutesBloqueio;}
function campLock(){return lock(CONFIG.bloqueioCompetidor);}
function pts(fase:string){return (CONFIG.pontos as any)[fase]||CONFIG.pontos.grupos;}
function calcJogo(pg1:number,pg2:number,rg1:number,rg2:number,fase:string,pen:boolean){
  const vR=rg1>rg2?1:rg1<rg2?-1:0,vP=pg1>pg2?1:pg1<pg2?-1:0,p=pts(fase);
  if(fase==="grupos"){
    if(pg1===rg1&&pg2===rg2)return{pts:p.placar,tipo:"placar"};
    if(vR===vP)return{pts:p.vencedor,tipo:"vencedor"};
    return{pts:0,tipo:"erro"};
  }else{
    if(pen){if(vP===vR&&vR!==0)return{pts:p.vencedor,tipo:"vencedor"};return{pts:0,tipo:"erro"};}
    if(pg1===rg1&&pg2===rg2)return{pts:p.placar,tipo:"placar"};
    if(vR===vP)return{pts:p.vencedor,tipo:"vencedor"};
    return{pts:0,tipo:"erro"};
  }
}
function calcTudo(pals:any,elim:any[],res:any,resE:any,camp:string,campR:string){
  let pontos=0,acertos=0,placares=0,det:any[]=[];
  [...JOGOS_GRUPO,...elim].forEach(j=>{
    const r=j.g?res[j.id]:resE[j.id];
    const p=pals[j.id];
    if(!r||r.gols1===""||r.gols1===undefined||r.gols2===""||r.gols2===undefined)return;
    if(!p||p.gols1===""||p.gols1===undefined||p.gols2===""||p.gols2===undefined){det.push({...j,res:r,pal:null,tipo:"sem_palpite",pts:0});return;}
    const rg1=parseInt(r.gols1),rg2=parseInt(r.gols2),pg1=parseInt(p.gols1),pg2=parseInt(p.gols2);
    if(isNaN(rg1)||isNaN(rg2)||isNaN(pg1)||isNaN(pg2))return;
    const{pts:pt,tipo}=calcJogo(pg1,pg2,rg1,rg2,j.fase||"grupos",r.penalti||false);
    pontos+=pt;if(tipo==="placar"||tipo==="vencedor")acertos++;if(tipo==="placar")placares++;
    det.push({...j,res:r,pal:p,tipo,pts:pt});
  });
  if(campR&&camp&&camp===campR){pontos+=CONFIG.bonusCampeao;}
  const bonusCampeao=campR&&camp&&camp===campR?CONFIG.bonusCampeao:0;
  return{pontos,acertos,placares,bonusCampeao,det};
}
function calcPremios(n:number){
  const total=n*CONFIG.valorCota;
  return{total,dist:Object.entries(CONFIG.premios).map(([pos,pct])=>({pos:parseInt(pos),pct,valor:Math.floor(total*pct)}))};
}
function desempate(a:any,b:any){
  if(b.pontos!==a.pontos)return b.pontos-a.pontos;
  if(b.placares!==a.placares)return b.placares-a.placares;
  if(b.acertos!==a.acertos)return b.acertos-a.acertos;
  return(b.campeao&&b.campeao===b.campR?1:0)-(a.campeao&&a.campeao===a.campR?1:0);
}
function fmtDLong(iso:string){return new Date(iso).toLocaleDateString("pt-BR",{day:"numeric",month:"long"});}
function fmtD(iso:string){return new Date(iso).toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"});}
function fmtH(iso:string){return new Date(iso).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function tr(iso:string){
  const d=(new Date(iso).getTime()-Date.now())/1000;
  if(d<=0)return null;
  const h=Math.floor(d/3600),m=Math.floor((d%3600)/60),s=Math.floor(d%60),dy=Math.floor(d/86400);
  if(dy>0)return`${dy}d ${h%24}h ${m}m`;
  if(h>0)return`${h}h ${m}m ${s}s`;
  return`${m}m ${s}s`;
}
function statusJ(dt:string,temRes:boolean){
  const diff=Date.now()-new Date(dt).getTime();
  if(temRes)return"enc";
  if(diff>0&&diff<130*60000)return"live";
  if(diff>=130*60000)return"wait";
  return"prox";
}

function calcBadges(nome:string,ranking:any[],palpitesMap:any,elim:any[],res:any,resE:any){
  const badges:string[]=[];
  const rodada1=JOGOS_GRUPO.filter((j:any)=>j.r===1);
  let maxPts=0,craque="";
  ranking.forEach(p=>{
    const pals=palpitesMap[p.nome]||{};let pts=0;
    rodada1.forEach(j=>{const r=res[j.id];const pal=pals[j.id];if(!r||!pal||r.gols1===""||pal.gols1==="")return;const{pts:pt}=calcJogo(parseInt(pal.gols1),parseInt(pal.gols2),parseInt(r.gols1),parseInt(r.gols2),"grupos",false);pts+=pt;});
    if(pts>maxPts){maxPts=pts;craque=p.nome;}
  });
  if(craque===nome&&maxPts>0)badges.push("🏆 Craque");
  const pals=palpitesMap[nome]||{};let seq=0;
  [...JOGOS_GRUPO].sort((a,b)=>new Date(a.dt).getTime()-new Date(b.dt).getTime()).forEach(j=>{
    const r=res[j.id];const pal=pals[j.id];
    if(!r||!pal||r.gols1===""||pal.gols1===""){seq=0;return;}
    const{tipo}=calcJogo(parseInt(pal.gols1),parseInt(pal.gols2),parseInt(r.gols1),parseInt(r.gols2),"grupos",false);
    if(tipo==="placar"){seq++;if(seq>=3&&!badges.includes("🔮 Vidente"))badges.push("🔮 Vidente");}else seq=0;
  });
  const palpitados=JOGOS_GRUPO.filter(j=>{const p=pals[j.id];return p&&p.gols1!==""&&p.gols2!=="";}).length;
  if(palpitados===JOGOS_GRUPO.length)badges.push("⚽ Fiel");
  return badges;
}

const MEDAL=["🥇","🥈","🥉","4º","5º"];
const FASE_L:Record<string,string>={grupos:"Grupos",oitavas:"Oitavas",quartas:"Quartas",semi:"Semifinal",final:"Final"};
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;user-select:none;-webkit-user-select:none;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f0f2f5}::-webkit-scrollbar-thumb{background:#16a34a;border-radius:2px}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
input[type=number]{-moz-appearance:textfield}
body{background:#f5f7fa;color:#111827;font-family:'Inter',sans-serif;}
.fade{animation:fadeIn .25s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-100px) rotate(720deg);opacity:0}}
.cf{position:fixed;bottom:80px;animation:confetti 1.2s ease forwards;pointer-events:none;font-size:22px;z-index:9999}
.btn-primary{background:#16a34a;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-family:'Inter',sans-serif;font-weight:700;font-size:16px;cursor:pointer;transition:all .2s;width:100%}
.btn-primary:hover{background:#15803d}.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-gold{background:#16a34a;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-family:'Inter',sans-serif;font-weight:700;font-size:16px;cursor:pointer;transition:all .2s;width:100%}
.btn-gold:hover{background:#15803d}.btn-gold:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:#fff;color:#374151;border:1.5px solid #e5e7eb;border-radius:12px;padding:13px 18px;font-family:'Inter',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s;width:100%}
.btn-ghost:hover{border-color:#16a34a;color:#16a34a}
.btn-outline{background:transparent;color:#16a34a;border:1.5px solid #16a34a;border-radius:10px;padding:9px 16px;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s}
.btn-outline:hover{background:#f0fdf4}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.inp{background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:14px 16px;color:#111827;font-family:'Inter',sans-serif;font-size:16px;outline:none;width:100%;transition:border .2s}
.inp:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.08)}
.si{width:62px;height:62px;background:#fff;border:2px solid #e5e7eb;border-radius:12px;color:#16a34a;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;text-align:center;outline:none;transition:all .2s}
.si:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.08)}.si.f{border-color:#16a34a;background:#f0fdf4}
.si.r{color:#16a34a}.si.r.f{border-color:#16a34a;background:#f0fdf4}.si.r:focus{border-color:#16a34a}.si:disabled{opacity:.35;cursor:not-allowed;background:#f9fafb}
.tab{padding:7px 12px;border-radius:8px;font-family:'Inter',sans-serif;font-weight:600;font-size:12px;cursor:pointer;border:none;transition:all .2s}
.tab.on{background:#16a34a;color:#fff}.tab.off{background:transparent;color:#6b7280}.tab.off:hover{color:#16a34a;background:#f0fdf4}
.gtab{padding:7px 12px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-weight:600;font-size:12px;cursor:pointer;border:1.5px solid #e5e7eb;transition:all .2s;background:#fff}
.gtab.on{background:#f0fdf4;color:#16a34a;border-color:#16a34a}.gtab.off{color:#6b7280}.gtab.off:hover{color:#16a34a;border-color:#16a34a}
.ftab{padding:8px 14px;border-radius:20px;font-family:'Inter',sans-serif;font-weight:600;font-size:13px;cursor:pointer;border:1.5px solid #e5e7eb;transition:all .2s;background:#fff}
.ftab.on{background:#16a34a;color:#fff;border-color:#16a34a}.ftab.off{color:#6b7280}.ftab.off:hover{color:#16a34a;border-color:#16a34a}
.stab{padding:8px 16px;border-radius:20px;font-family:'Inter',sans-serif;font-weight:600;font-size:13px;cursor:pointer;border:1.5px solid #e5e7eb;transition:all .2s;background:#fff}
.stab.on{background:#16a34a;color:#fff;border-color:#16a34a}.stab.off{color:#6b7280}.stab.off:hover{color:#16a34a;border-color:#16a34a}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace}
.bg{background:#fef9c3;color:#854d0e;border:1px solid #fde68a}
.bb{background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe}
.bgr{background:#dcfce7;color:#166534;border:1px solid #86efac}
.br{background:#fee2e2;color:#b91c1c;border:1px solid #fecaca}
.bp{background:#f3e8ff;color:#6b21a8;border:1px solid #d8b4fe}
.bred{background:#fee2e2;color:#b91c1c;border:1px solid #fecaca}
.byellow{background:#fef3c7;color:#92400e;border:1px solid #fde68a}
.bgreen{background:#dcfce7;color:#166534;border:1px solid #86efac}
select{background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:14px 16px;color:#111827;font-family:'Inter',sans-serif;font-size:16px;outline:none;width:100%;transition:border .2s}
select:focus{border-color:#16a34a}select option{background:#fff;color:#111827}select:disabled{opacity:.4;cursor:not-allowed;background:#f9fafb}
.nbtn{width:40px;height:40px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#374151;transition:all .2s}
.nbtn:disabled{opacity:.3;cursor:not-allowed}.nbtn:not(:disabled):hover{border-color:#16a34a;color:#16a34a}
.bottomnav{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;display:flex;align-items:stretch;z-index:200;padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -2px 12px rgba(0,0,0,.06)}
.navbtn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 2px 8px;cursor:pointer;border:none;background:transparent;transition:color .15s;gap:3px;font-family:'Inter',sans-serif;min-height:58px}
.navbtn .ni{font-size:22px;line-height:1}
.navbtn .nl{font-size:10px;font-weight:600;color:#9ca3af}
.navbtn.active .nl{color:#16a34a;font-weight:700}
.navbtn.active .ni{filter:drop-shadow(0 0 4px rgba(22,163,74,.4))}
.date-sep{font-size:15px;font-weight:700;color:#111827;padding:14px 0 8px;font-family:'Inter',sans-serif}
.jogo-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.jogo-card-header{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid #f3f4f6;background:#fafafa}
.jogo-card-body{padding:18px 16px}
.jogo-card-footer{padding:10px 16px;border-top:1px solid #f3f4f6;background:#fafafa;display:flex;justify-content:space-between;align-items:center}
`;

export default function App() {
  const [tela,setTela]=useState("login");
  const [onboarding,setOnboarding]=useState(false);
  const [carregando,setCarregando]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [toast,setToast]=useState<{msg:string,tipo:"ok"|"err"}|null>(null);
  const [confetis,setConfetis]=useState<any[]>([]);
  const [usuarios,setUsuarios]=useState<any>({});
  const [usuarioAtual,setUsuarioAtual]=useState<string|null>(null);
  const [loginNome,setLoginNome]=useState(""); const [loginSenha,setLoginSenha]=useState(""); const [loginErro,setLoginErro]=useState("");
  const [cadNome,setCadNome]=useState(""); const [cadSenha,setCadSenha]=useState(""); const [cadSenha2,setCadSenha2]=useState(""); const [cadErro,setCadErro]=useState("");
  const [adminSenha,setAdminSenha]=useState(""); const [adminErro,setAdminErro]=useState("");
  const [elim,setElim]=useState<any[]>(ELIM_TMPL);
  const [palpitesMap,setPalpitesMap]=useState<any>({});
  const [rascunho,setRascunho]=useState<any>({});
  const [res,setRes]=useState<any>({});
  const [resE,setResE]=useState<any>({});
  const [campR,setCampR]=useState("");
  const [grupoAtivo,setGrupoAtivo]=useState("A");
  const [faseAtiva,setFaseAtiva]=useState("grupos");
  const [modo,setModo]=useState("home");
  const [adminModo,setAdminModo]=useState("resultados");
  const [copChave,setCopChave]=useState(false);
  const [copCola,setCopCola]=useState(false);
  const [copRank,setCopRank]=useState(false);
  const [detUser,setDetUser]=useState<string|null>(null);
  const [resetNome,setResetNome]=useState<string|null>(null);
  const [novaSenha,setNovaSenha]=useState("");
  const [rodada,setRodada]=useState(1);
  const [statusF,setStatusF]=useState<"proximos"|"aovivo"|"terminados">("proximos");
  const [jogoSel,setJogoSel]=useState<any|null>(null);
  const [countdown,setCountdown]=useState("");
  const [histRodada,setHistRodada]=useState<number|"todas">("todas");
  const [maisOpen,setMaisOpen]=useState(false);
  const [mpLoading,setMpLoading]=useState(false);
  const [feed,setFeed]=useState<any[]>([]);
  const [,setTick]=useState(0);

  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),30000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    if(typeof window==="undefined") return;
    const saved=localStorage.getItem("bolao_user");
    if(saved){
      supabase.from("usuarios").select("*").eq("nome",saved).single().then(({data})=>{
        if(data){setUsuarioAtual(data.nome);setUsuarios((prev:any)=>({...prev,[data.nome]:{senha:data.senha,pago:data.pago,camp:data.campeao_palpite||""}}));setTela("app");setModo("home");}
        else localStorage.removeItem("bolao_user");
      });
    }
  },[]);

  useEffect(()=>{
    function atualizar(){
      const ps=palpitesMap[usuarioAtual||""]||{};
      const todos=[...JOGOS_GRUPO,...elim.filter((j:any)=>j.time1)];
      const sem=todos.filter((j:any)=>{const p=ps[j.id];return !lock(j.dt)&&(!p||p.gols1===""||p.gols2==="");})
        .sort((a:any,b:any)=>new Date(a.dt).getTime()-new Date(b.dt).getTime());
      if(!sem.length){setCountdown("");return;}
      const prox=sem[0],t=tr(prox.dt);
      if(!t){setCountdown("");return;}
      setCountdown(`${F[prox.time1]||""}${prox.time1} × ${prox.time2}${F[prox.time2]||""} — ${t}`);
    }
    atualizar();
    const t=setInterval(atualizar,1000);
    return()=>clearInterval(t);
  },[palpitesMap,elim,usuarioAtual]);

  function mostrarToast(msg:string,tipo:"ok"|"err"="ok"){setToast({msg,tipo});setTimeout(()=>setToast(null),2500);}
  function dispararConfete(){
    const em=["🎉","⭐","🏆","✨","🎊","⚽","🥇"];
    setConfetis(Array.from({length:10},(_,i)=>({id:Date.now()+i,e:em[i%em.length],l:`${10+Math.random()*80}%`,d:`${Math.random()*0.4}s`})));
    setTimeout(()=>setConfetis([]),1500);
  }

  function adicionarFeed(msg:string){
    setFeed(prev=>[{id:Date.now(),msg,ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})},...prev].slice(0,20));
  }

  async function pagarMP(){
    setMpLoading(true);
    try{
      const resp=await fetch("/api/create-payment",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({nome:usuarioAtual})
      });
      const data=await resp.json();
      if(data.url){
        window.open(data.url,"_blank");
        mostrarToast("🔗 Link MP aberto! Após pagamento, aguarde confirmação.");
      } else {
        mostrarToast("Erro ao gerar link MP","err");
      }
    }catch{mostrarToast("Erro ao conectar MP","err");}
    setMpLoading(false);
  }

  const carregarTudo=useCallback(async()=>{
    try{
      const [{data:us},{data:ps},{data:rs},{data:es},{data:cfg}]=await Promise.all([
        supabase.from("usuarios").select("*"),
        supabase.from("palpites").select("*"),
        supabase.from("resultados").select("*"),
        supabase.from("eliminatorias").select("*"),
        supabase.from("config").select("*"),
      ]);
      if(us){const m:any={};us.forEach((u:any)=>{m[u.nome]={senha:u.senha,pago:u.pago,camp:u.campeao_palpite||""};});setUsuarios(m);}
      if(ps){const m:any={};ps.forEach((p:any)=>{if(!m[p.usuario_nome])m[p.usuario_nome]={};m[p.usuario_nome][p.jogo_id]={gols1:p.gols1?.toString()??"",gols2:p.gols2?.toString()??""};});setPalpitesMap(m);setRascunho(m);}
      if(rs){const m:any={};rs.forEach((r:any)=>{m[r.jogo_id]={gols1:r.gols1?.toString()??"",gols2:r.gols2?.toString()??"",penalti:r.penalti};});setRes(m);}
      if(es&&es.length>0){
        setElim(prev=>prev.map((j:any)=>{const e=es.find((el:any)=>el.jogo_id===j.id);if(!e)return j;return{...j,time1:e.time1||"",time2:e.time2||"",dt:e.data_hora||j.dt,est:e.estadio||j.est,cid:e.cidade||j.cid};}));
        const m:any={};es.forEach((e:any)=>{if(e.gols1!==null||e.gols2!==null)m[e.jogo_id]={gols1:e.gols1?.toString()??"",gols2:e.gols2?.toString()??"",penalti:e.penalti};});setResE(m);
      }
      if(cfg){const c=cfg.find((x:any)=>x.chave==="campeao_real");if(c)setCampR(c.valor||"");}
    }catch(e){console.error(e);}
  },[]);

  useEffect(()=>{carregarTudo();const r=setInterval(carregarTudo,60000);return()=>clearInterval(r);},[carregarTudo]);
  useEffect(()=>{if(usuarioAtual)setRascunho((prev:any)=>({...prev,[usuarioAtual]:{...(palpitesMap[usuarioAtual]||{})}}));},[usuarioAtual]);

  const palS=palpitesMap[usuarioAtual||""]||{};
  const palR=rascunho[usuarioAtual||""]||{};
  const u=usuarios[usuarioAtual||""]||{};
  const pago=u.pago||false;
  const campAtual=u.camp||"";
  const nPart=Object.keys(usuarios).length;
  const premios=calcPremios(nPart);
  const totSalvos=Object.values(palS).filter((p:any)=>p.gols1!==""&&p.gols1!==undefined&&p.gols2!==""&&p.gols2!==undefined).length;
  const totJogos=JOGOS_GRUPO.length+elim.filter((j:any)=>j.time1).length;
  const pctPal=totJogos>0?Math.round(totSalvos/totJogos*100):0;
  const temRasc=Object.keys(palR).some(id=>{const r=palR[id],s=palS[id]||{};return r.gols1!==s.gols1||r.gols2!==s.gols2;});

  const ranking=Object.keys(usuarios).map(nome=>{
    const p=palpitesMap[nome]||{},camp=usuarios[nome]?.camp||"";
    const{pontos,acertos,placares,bonusCampeao,det}=calcTudo(p,elim,res,resE,camp,campR);
    return{nome,pontos,acertos,placares,bonusCampeao,det,campeao:camp,campR,pago:usuarios[nome]?.pago};
  }).sort(desempate);

  const minhaPos=ranking.findIndex(r=>r.nome===usuarioAtual)+1;
  const meusDados=ranking.find(r=>r.nome===usuarioAtual);

  const jogosRodada=JOGOS_GRUPO.filter(j=>j.r===rodada);
  const jogosFiltrados=jogosRodada.filter(j=>{
    const r=res[j.id]||{};
    const temRes=r.gols1!==undefined&&r.gols1!==""&&r.gols2!==undefined&&r.gols2!=="";
    const s=statusJ(j.dt,temRes);
    if(statusF==="proximos")return s==="prox";
    if(statusF==="aovivo")return s==="live"||s==="wait";
    return s==="enc";
  });

  async function handleLogin(){
    setCarregando(true);setLoginErro("");
    const{data,error}=await supabase.from("usuarios").select("*").eq("nome",loginNome.trim()).single();
    setCarregando(false);
    if(error||!data){setLoginErro("Usuário não encontrado.");return;}
    if(data.senha!==loginSenha){setLoginErro("Senha incorreta.");return;}
    setUsuarioAtual(data.nome);setLoginNome("");setLoginSenha("");
    if(typeof window!=="undefined")localStorage.setItem("bolao_user",data.nome);
    const jaViu=typeof window!=="undefined"&&localStorage.getItem(`ob_${data.nome}`);
    if(!jaViu){setOnboarding(true);if(typeof window!=="undefined")localStorage.setItem(`ob_${data.nome}`,"1");}
    setTela("app");setModo("home");
  }

  async function handleCadastro(){
    const nome=cadNome.trim();
    if(!nome){setCadErro("Digite seu nome.");return;}
    if(cadSenha.length<4){setCadErro("Mínimo 4 caracteres.");return;}
    if(cadSenha!==cadSenha2){setCadErro("Senhas não conferem.");return;}
    setCarregando(true);setCadErro("");
    const{error}=await supabase.from("usuarios").insert({nome,senha:cadSenha,pago:false,campeao_palpite:""});
    setCarregando(false);
    if(error){setCadErro(error.code==="23505"?"Nome já cadastrado.":"Erro ao criar conta.");return;}
    setUsuarios((prev:any)=>({...prev,[nome]:{senha:cadSenha,pago:false,camp:""}}));
    setUsuarioAtual(nome);setCadNome("");setCadSenha("");setCadSenha2("");
    if(typeof window!=="undefined")localStorage.setItem("bolao_user",nome);
    setOnboarding(true);if(typeof window!=="undefined")localStorage.setItem(`ob_${nome}`,"1");
    setTela("app");setModo("home");
  }

  function setPalLocal(jogoId:number,campo:string,valor:string,dt:string){
    if(lock(dt)||!usuarioAtual)return;
    setRascunho((prev:any)=>({...prev,[usuarioAtual]:{...(prev[usuarioAtual]||{}),[jogoId]:{...(prev[usuarioAtual]?.[jogoId]||{}),[campo]:valor}}}));
  }

  async function confirmarPalpite(jogo:any){
    if(!usuarioAtual||salvando)return;
    if(!pago){mostrarToast("Faça o pagamento primeiro!","err");return;}
    const p=palR[jogo.id]||{};
    const g1=parseInt(p.gols1),g2=parseInt(p.gols2);
    if(isNaN(g1)||isNaN(g2)||p.gols1===""||p.gols2===""){mostrarToast("Preencha os dois placares","err");return;}
    setSalvando(true);
    const{error}=await supabase.from("palpites").upsert({usuario_nome:usuarioAtual,jogo_id:jogo.id,gols1:g1,gols2:g2},{onConflict:"usuario_nome,jogo_id"});
    setSalvando(false);
    if(error){mostrarToast("Erro ao salvar","err");return;}
    setPalpitesMap((prev:any)=>({...prev,[usuarioAtual]:{...(prev[usuarioAtual]||{}),[jogo.id]:{gols1:g1.toString(),gols2:g2.toString()}}}));
    mostrarToast("✅ Palpite confirmado!");setJogoSel(null);
  }

  async function salvarGrupo(){
    if(!usuarioAtual||salvando)return;
    if(!pago){mostrarToast("Faça o pagamento primeiro!","err");return;}
    setSalvando(true);
    const ups:any[]=[];
    JOGOS_GRUPO.filter(j=>j.g===grupoAtivo).forEach(j=>{
      const p=palR[j.id]||{};const g1=parseInt(p.gols1),g2=parseInt(p.gols2);
      if(!isNaN(g1)&&!isNaN(g2)&&p.gols1!==""&&p.gols2!=="")ups.push({usuario_nome:usuarioAtual,jogo_id:j.id,gols1:g1,gols2:g2});
    });
    if(ups.length>0){
      const{error}=await supabase.from("palpites").upsert(ups,{onConflict:"usuario_nome,jogo_id"});
      if(!error){setPalpitesMap((prev:any)=>({...prev,[usuarioAtual]:{...(prev[usuarioAtual]||{}),...Object.fromEntries(ups.map(u=>([u.jogo_id,{gols1:u.gols1.toString(),gols2:u.gols2.toString()}])))}}));mostrarToast(`✅ ${ups.length} palpites salvos!`);}
      else mostrarToast("Erro ao salvar","err");
    }else mostrarToast("Nenhum palpite completo","err");
    setSalvando(false);
  }

  async function salvarElim(){
    if(!usuarioAtual||salvando)return;
    if(!pago){mostrarToast("Faça o pagamento primeiro!","err");return;}
    setSalvando(true);
    const ups:any[]=[];
    elim.filter(j=>j.fase===faseAtiva&&j.time1&&j.time2).forEach(j=>{
      const p=palR[j.id]||{};const g1=parseInt(p.gols1),g2=parseInt(p.gols2);
      if(!isNaN(g1)&&!isNaN(g2)&&p.gols1!==""&&p.gols2!=="")ups.push({usuario_nome:usuarioAtual,jogo_id:j.id,gols1:g1,gols2:g2});
    });
    if(ups.length>0){
      const{error}=await supabase.from("palpites").upsert(ups,{onConflict:"usuario_nome,jogo_id"});
      if(!error){setPalpitesMap((prev:any)=>({...prev,[usuarioAtual]:{...(prev[usuarioAtual]||{}),...Object.fromEntries(ups.map(u=>([u.jogo_id,{gols1:u.gols1.toString(),gols2:u.gols2.toString()}])))}}));mostrarToast(`✅ ${ups.length} palpites salvos!`);}
      else mostrarToast("Erro ao salvar","err");
    }else mostrarToast("Nenhum palpite completo","err");
    setSalvando(false);
  }

  async function setCamp(time:string){
    if(!usuarioAtual||campLock())return;
    if(!pago){mostrarToast("Faça o pagamento primeiro!","err");return;}
    setUsuarios((prev:any)=>({...prev,[usuarioAtual]:{...prev[usuarioAtual],camp:time}}));
    await supabase.from("usuarios").update({campeao_palpite:time}).eq("nome",usuarioAtual);
    mostrarToast("🏆 Campeão salvo!");
  }

  async function setResAdmin(jId:number,campo:string,valor:string){
    setRes((prev:any)=>({...prev,[jId]:{...(prev[jId]||{}),[campo]:valor}}));
    const r={...(res[jId]||{}),[campo]:valor};
    const g1=parseInt(r.gols1),g2=parseInt(r.gols2);
    if(!isNaN(g1)&&!isNaN(g2)&&r.gols1!==""&&r.gols2!==""){
      await supabase.from("resultados").upsert({jogo_id:jId,gols1:g1,gols2:g2,penalti:r.penalti||false},{onConflict:"jogo_id"});
      mostrarToast("✅ Resultado salvo!");
    }
  }

  async function setResEAdmin(jId:number,campo:string,valor:any){
    setResE((prev:any)=>({...prev,[jId]:{...(prev[jId]||{}),[campo]:valor}}));
    const r={...(resE[jId]||{}),[campo]:valor};
    const payload:any={jogo_id:jId,penalti:r.penalti||false};
    const g1=typeof r.gols1==="string"?parseInt(r.gols1):r.gols1;
    const g2=typeof r.gols2==="string"?parseInt(r.gols2):r.gols2;
    if(!isNaN(g1)&&r.gols1!=="")payload.gols1=g1;
    if(!isNaN(g2)&&r.gols2!=="")payload.gols2=g2;
    if(payload.gols1!==undefined&&payload.gols2!==undefined){
      await supabase.from("eliminatorias").upsert(payload,{onConflict:"jogo_id"});
      mostrarToast("✅ Resultado salvo!");
    }
  }

  async function updateElimT(jId:number,campo:string,valor:string){
    setElim((prev:any[])=>prev.map(j=>j.id===jId?{...j,[campo]:valor}:j));
    await supabase.from("eliminatorias").upsert({jogo_id:jId,[campo]:valor},{onConflict:"jogo_id"});
  }

  async function togglePago(nome:string){
    const novo=!usuarios[nome]?.pago;
    setUsuarios((prev:any)=>({...prev,[nome]:{...prev[nome],pago:novo}}));
    await supabase.from("usuarios").update({pago:novo}).eq("nome",nome);
    mostrarToast(novo?"✅ Pagamento confirmado!":"⚠ Marcado como pendente");
  }

  async function atualizarCampR(time:string){
    setCampR(time);
    await supabase.from("config").upsert({chave:"campeao_real",valor:time},{onConflict:"chave"});
    mostrarToast("🏆 Campeão real salvo!");
  }

  async function resetarSenha(nome:string,senha:string){
    if(senha.length<4){mostrarToast("Senha muito curta","err");return;}
    await supabase.from("usuarios").update({senha}).eq("nome",nome);
    setUsuarios((prev:any)=>({...prev,[nome]:{...prev[nome],senha}}));
    setResetNome(null);setNovaSenha("");mostrarToast("🔑 Senha resetada!");
  }

  function exportarRanking(){
    const txt=`🏆 BOLÃO COPA 2026\n\n${ranking.map((p,i)=>`${MEDAL[i]||`${i+1}º`} ${p.nome} — ${p.pontos}pts`).join("\n")}\n\n💰 ${premios.dist.map(d=>`${d.pos}º R$${d.valor}`).join(" | ")}`;
    navigator.clipboard.writeText(txt);setCopRank(true);setTimeout(()=>setCopRank(false),2500);
  }

  function JogoCardAdmin({jogo,isElim=false}:any){
    const r=isElim?(resE[jogo.id]||{}):(res[jogo.id]||{});
    const temRes=r.gols1!==undefined&&r.gols1!==""&&r.gols2!==undefined&&r.gols2!=="";
    return(
      <div className="card" style={{padding:"12px",border:`1.5px solid ${temRes?"#86efac":"#e5e7eb"}`}}>
        <div style={{fontSize:11,color:"#9ca3af",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>
          📍 {jogo.est||jogo.estadio} · {fmtD(jogo.dt||jogo.dataHora)} {fmtH(jogo.dt||jogo.dataHora)}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{fontSize:26}}>{F[jogo.time1]||"🏳️"}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#374151"}}>{jogo.time1||"A definir"}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"0 8px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <input type="number" min={0} max={30} className={`si r${temRes?" f":""}`} value={r.gols1??""} onChange={e=>isElim?setResEAdmin(jogo.id,"gols1",e.target.value):setResAdmin(jogo.id,"gols1",e.target.value)} placeholder="—"/>
              <span style={{color:"#d1d5db",fontSize:14}}>×</span>
              <input type="number" min={0} max={30} className={`si r${temRes?" f":""}`} value={r.gols2??""} onChange={e=>isElim?setResEAdmin(jogo.id,"gols2",e.target.value):setResAdmin(jogo.id,"gols2",e.target.value)} placeholder="—"/>
            </div>
            {isElim&&jogo.fase!=="grupos"&&(
              <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#6b7280",cursor:"pointer"}}>
                <input type="checkbox" checked={r.penalti||false} onChange={e=>setResEAdmin(jogo.id,"penalti",e.target.checked)} style={{width:14,height:14}}/> Pênalti
              </label>
            )}
          </div>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{fontSize:26}}>{F[jogo.time2]||"🏳️"}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#374151"}}>{jogo.time2||"A definir"}</div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"#f5f7fa",color:"#111827",fontFamily:"'Inter',sans-serif",userSelect:"none",WebkitUserSelect:"none",paddingBottom:tela==="app"?"72px":"0"}}>
      <style>{CSS}</style>

      {confetis.map(c=><div key={c.id} className="cf" style={{left:c.l,animationDelay:c.d}}>{c.e}</div>)}

      {toast&&(
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9998,
          background:toast.tipo==="ok"?"#166534":"#b91c1c",
          color:"#fff",
          padding:"10px 20px",borderRadius:20,fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
          whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
          {toast.msg}
        </div>
      )}

      {onboarding&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:9997,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div className="card" style={{maxWidth:380,width:"100%",textAlign:"center",padding:"32px 24px"}}>
            <div style={{width:72,height:72,background:"#16a34a",borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 16px"}}>⚽</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:6,color:"#111827"}}>Bem-vindo ao <span style={{color:"#16a34a"}}>Bolão 2026!</span></h2>
            <p style={{fontSize:13,color:"#9ca3af",marginBottom:20,lineHeight:1.7}}>EUA · México · Canadá · 11 Jun – 19 Jul 2026</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24,textAlign:"left"}}>
              {[["🎯","Placar exato",`+5 pts (grupos)`],["⚽","Acertar vencedor","+2 pts (grupos)"],
                ["🏆","Campeão da Copa",`+${CONFIG.bonusCampeao} pts bônus`],
                ["🔒","Palpites fecham",`${CONFIG.minutesBloqueio}min antes do jogo`],
                ["💳","Cota de entrada",`R$ ${CONFIG.valorCota} via Mercado Pago`]
              ].map(([ic,txt,sub])=>(
                <div key={txt} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#f9fafb",borderRadius:12,border:"1px solid #e5e7eb"}}>
                  <span style={{fontSize:22}}>{ic}</span>
                  <div><div style={{fontSize:14,fontWeight:600,color:"#111827"}}>{txt}</div><div style={{fontSize:12,color:"#6b7280"}}>{sub}</div></div>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={()=>setOnboarding(false)}>Entendido, vamos lá! 🚀</button>
          </div>
        </div>
      )}

      {jogoSel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:9996,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"95vh",overflow:"auto"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:12,color:"#16a34a",fontWeight:700}}>GRUPO {jogoSel.g} · {fmtD(jogoSel.dt)}</div>
                <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>📍 {jogoSel.est}, {jogoSel.cid}</div>
              </div>
              <button onClick={()=>setJogoSel(null)} style={{background:"#f3f4f6",border:"none",color:"#374151",width:34,height:34,borderRadius:"50%",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
                <div style={{textAlign:"center",flex:1}}>
                  <div style={{fontSize:40,marginBottom:6}}>{F[jogoSel.time1]||"🏳️"}</div>
                  <div style={{fontWeight:700,fontSize:15}}>{jogoSel.time1}</div>
                </div>
                <div style={{textAlign:"center",padding:"0 16px"}}>
                  <div style={{fontWeight:800,fontSize:18,color:"#d1d5db"}}>VS</div>
                  <div style={{fontSize:13,color:"#9ca3af",marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>{fmtH(jogoSel.dt)}</div>
                </div>
                <div style={{textAlign:"center",flex:1}}>
                  <div style={{fontSize:40,marginBottom:6}}>{F[jogoSel.time2]||"🏳️"}</div>
                  <div style={{fontWeight:700,fontSize:15}}>{jogoSel.time2}</div>
                </div>
              </div>
              {lock(jogoSel.dt)?(
                <div style={{textAlign:"center",padding:"24px",background:"#fef2f2",borderRadius:16,border:"1px solid #fecaca"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔒</div>
                  <div style={{fontWeight:700,color:"#b91c1c",marginBottom:4,fontSize:16}}>Palpite bloqueado</div>
                  <div style={{fontSize:13,color:"#6b7280"}}>O prazo encerrou</div>
                  {palS[jogoSel.id]&&<div style={{marginTop:12,fontSize:15,color:"#374151"}}>Seu palpite: <strong style={{color:"#16a34a"}}>{palS[jogoSel.id].gols1} × {palS[jogoSel.id].gols2}</strong></div>}
                </div>
              ):(
                <>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:20}}>
                    <input type="number" min={0} max={30} className={`si${(palR[jogoSel.id]?.gols1!==undefined&&palR[jogoSel.id]?.gols1!=="")?" f":""}`} style={{width:72,height:72,fontSize:28}}
                      value={palR[jogoSel.id]?.gols1??""} onChange={e=>{setPalLocal(jogoSel.id,"gols1",e.target.value,jogoSel.dt);if(e.target.value!==""){const nx=document.getElementById("gols2_modal");if(nx)nx.focus();}}} placeholder="0"/>
                    <span style={{fontSize:24,color:"#d1d5db",fontWeight:700}}>×</span>
                    <input type="number" min={0} max={30} className={`si${(palR[jogoSel.id]?.gols2!==undefined&&palR[jogoSel.id]?.gols2!=="")?" f":""}`} style={{width:72,height:72,fontSize:28}}
                      value={palR[jogoSel.id]?.gols2??""} id="gols2_modal" onChange={e=>setPalLocal(jogoSel.id,"gols2",e.target.value,jogoSel.dt)} placeholder="0"/>
                  </div>
                  <div className="card" style={{marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:11,color:"#16a34a",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Pontuação</div>
                    {[["🎯","Placar exato",`+${pts(jogoSel.fase||"grupos").placar} pts`],["⚽","Vencedor/Empate",`+${pts(jogoSel.fase||"grupos").vencedor} pts`],["❌","Errar","0 pts"]].map(([ic,txt,p])=>(
                      <div key={txt} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #f9fafb"}}>
                        <span style={{fontSize:14}}>{ic}</span><span style={{flex:1,fontSize:12,color:"#374151"}}>{txt}</span><span className="badge bg">{p}</span>
                      </div>
                    ))}
                  </div>
                  {tr(jogoSel.dt)&&<div style={{textAlign:"center",marginBottom:16}}>
                    <div style={{fontSize:10,color:"#9ca3af",marginBottom:4}}>Tempo restante</div>
                    <div style={{fontWeight:800,fontSize:20,color:"#16a34a",fontFamily:"'JetBrains Mono',monospace"}}>{tr(jogoSel.dt)}</div>
                  </div>}
                  <button className="btn-gold" onClick={()=>confirmarPalpite(jogoSel)} disabled={salvando} style={{fontSize:16,padding:"16px"}}>
                    {salvando?"Salvando...":"✅ Confirmar Palpite"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tela Mais */}
      {maisOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:9995,display:"flex",alignItems:"flex-end"}} onClick={()=>setMaisOpen(false)}>
          <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",padding:"20px 16px 36px"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontWeight:700,fontSize:16,color:"#111827",marginBottom:14}}>Mais opções</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{id:"pix",icon:"💳",label:"Pix"},{id:"perfil",icon:"👤",label:"Perfil"},{id:"campeao",icon:"🏆",label:"Campeão"},{id:"regras",icon:"📋",label:"Regras"},{id:"historico",icon:"📊",label:"Histórico"},{id:"feed",icon:"💬",label:"Feed"}].map(item=>(
                <button key={item.id} onClick={()=>{setModo(item.id);setMaisOpen(false);}}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"20px 12px",background:modo===item.id?"#f0fdf4":"#f9fafb",border:`1.5px solid ${modo===item.id?"#16a34a":"#e5e7eb"}`,borderRadius:16,cursor:"pointer",transition:"all .2s"}}>
                  <span style={{fontSize:30}}>{item.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,color:modo===item.id?"#16a34a":"#374151"}}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"#16a34a",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>⚽</div>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:"#111827",letterSpacing:"-.3px"}}>Bolão Copa 2026</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>48 seleções · 12 grupos</div>
          </div>
        </div>
        {tela==="app"&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {pago?<span className="badge bgr">✅ Pago</span>:<span className="badge br" onClick={()=>setModo("pix")} style={{cursor:"pointer"}}>💳 Pagar</span>}
            <button onClick={()=>{setUsuarioAtual(null);setTela("login");if(typeof window!=="undefined")localStorage.removeItem("bolao_user");}}
              style={{width:32,height:32,borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>↩</button>
          </div>
        )}
        {tela==="admin"&&(
          <button style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#374151"}} onClick={()=>setTela("login")}>Sair</button>
        )}
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"16px 14px"}}>

        {tela==="login"&&(
          <div className="fade" style={{maxWidth:360,margin:"0 auto",paddingTop:24}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={{width:80,height:80,background:"linear-gradient(135deg,#16a34a,#15803d)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,margin:"0 auto 16px"}}>⚽</div>
              <h1 style={{fontSize:26,fontWeight:800,letterSpacing:"-1px",marginBottom:6,color:"#111827"}}>Bolão Copa 2026</h1>
              <p style={{color:"#9ca3af",fontSize:14}}>EUA · México · Canadá · Jun–Jul 2026</p>
            </div>
            <div className="card" style={{marginBottom:12,padding:"24px"}}>
              <div style={{fontWeight:700,fontSize:13,color:"#16a34a",letterSpacing:.5,textTransform:"uppercase",marginBottom:16}}>Entrar</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input className="inp" placeholder="Seu nome" value={loginNome} onChange={e=>setLoginNome(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                <input className="inp" type="password" placeholder="Senha" value={loginSenha} onChange={e=>setLoginSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                {loginErro&&<div style={{color:"#b91c1c",fontSize:13,background:"#fef2f2",padding:"8px 12px",borderRadius:8}}>{loginErro}</div>}
                <button className="btn-primary" onClick={handleLogin} disabled={carregando}>{carregando?"Entrando...":"Entrar"}</button>
              </div>
            </div>
            <button className="btn-ghost" onClick={()=>{setLoginErro("");setTela("cadastro");}}>Criar conta nova →</button>
            <div style={{textAlign:"center",marginTop:16}}>
              <button onClick={()=>setTela("admin-login")} style={{fontSize:12,color:"#9ca3af",background:"none",border:"none",cursor:"pointer"}}>Área do admin</button>
            </div>
          </div>
        )}

        {tela==="cadastro"&&(
          <div className="fade" style={{maxWidth:360,margin:"0 auto",paddingTop:24}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:42,marginBottom:10}}>👤</div>
              <h2 style={{fontSize:22,fontWeight:800,color:"#111827"}}>Criar conta</h2>
              <p style={{color:"#9ca3af",fontSize:14,marginTop:4}}>Cota: <span style={{color:"#16a34a",fontWeight:700}}>R$ {CONFIG.valorCota}</span></p>
            </div>
            <div className="card" style={{marginBottom:12,padding:"24px"}}>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input className="inp" placeholder="Seu nome completo" value={cadNome} onChange={e=>setCadNome(e.target.value)}/>
                <input className="inp" type="password" placeholder="Criar senha (mín. 4 chars)" value={cadSenha} onChange={e=>setCadSenha(e.target.value)}/>
                <input className="inp" type="password" placeholder="Confirmar senha" value={cadSenha2} onChange={e=>setCadSenha2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCadastro()}/>
                {cadErro&&<div style={{color:"#b91c1c",fontSize:13,background:"#fef2f2",padding:"8px 12px",borderRadius:8}}>{cadErro}</div>}
                <button className="btn-primary" onClick={handleCadastro} disabled={carregando}>{carregando?"Criando...":"Criar conta e entrar"}</button>
              </div>
            </div>
            <button className="btn-ghost" style={{width:"100%"}} onClick={()=>{setCadErro("");setTela("login");}}>← Voltar</button>
          </div>
        )}

        {tela==="admin-login"&&(
          <div className="fade" style={{maxWidth:320,margin:"0 auto",paddingTop:40}}>
            <div className="card">
              <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>🔐 Área do Admin</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                <input className="inp" type="password" placeholder="Senha do administrador" value={adminSenha} onChange={e=>setAdminSenha(e.target.value)}
                  onKeyDown={async e=>{if(e.key==="Enter"){const r=await fetch("/api/verify-admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senha:adminSenha})});const d=await r.json();if(d.ok){setAdminErro("");setAdminSenha("");setTela("admin");}else setAdminErro("Senha incorreta.");}}}/>
                {adminErro&&<div style={{color:"#b91c1c",fontSize:13,background:"#fef2f2",padding:"8px 12px",borderRadius:8}}>{adminErro}</div>}
                <button className="btn-primary" onClick={async()=>{const r=await fetch("/api/verify-admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senha:adminSenha})});const d=await r.json();if(d.ok){setAdminErro("");setAdminSenha("");setTela("admin");}else setAdminErro("Senha incorreta.");}}>Entrar</button>
              </div>
            </div>
            <button className="btn-ghost" style={{width:"100%",marginTop:10}} onClick={()=>setTela("login")}>← Voltar</button>
          </div>
        )}

        {tela==="app"&&(
          <div className="fade">

            {/* HOME */}
            {modo==="home"&&(
              <div>
                <div style={{marginBottom:16,padding:"14px 16px",background:"linear-gradient(135deg,rgba(247,201,72,.1),rgba(247,201,72,.03))",border:"1px solid rgba(247,201,72,.2)",borderRadius:14}}>
                  <div style={{fontSize:11,color:"#9ca3af",marginBottom:4}}>Olá,</div>
                  <div style={{fontWeight:800,fontSize:20,marginBottom:2}}>{usuarioAtual} {pago?"✅":"⚠️"}</div>
                  <div style={{fontSize:12,color:"#6b7280"}}>{pago?"Você está dentro do bolão!":"Pagamento pendente — vá em Pix"}</div>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  {[["⭐",meusDados?.pontos??0,"Pontos","#16a34a"],["🎯",totSalvos,"Palpites","#2563eb"],["🥇",meusDados?.placares??0,"Exatos","#16a34a"]].map(([ic,v,lb,cor]:any)=>(
                    <div key={lb} style={{flex:1,textAlign:"center",padding:"12px 8px",background:"rgba(255,255,255,.04)",borderRadius:12,border:"1px solid #f3f4f6"}}>
                      <div style={{fontSize:20}}>{ic}</div>
                      <div style={{fontWeight:800,fontSize:20,color:cor}}>{v}</div>
                      <div style={{fontSize:10,color:"#9ca3af"}}>{lb}</div>
                    </div>
                  ))}
                </div>
                {minhaPos>0&&(
                  <div style={{marginBottom:14,padding:"12px 16px",background:"rgba(255,255,255,.04)",borderRadius:12,border:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:26}}>{MEDAL[minhaPos-1]||`${minhaPos}º`}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>Posição no ranking</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>de {nPart} participantes</div>
                    </div>
                    {premios.dist.find(d=>d.pos===minhaPos)&&(
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:800,fontSize:16,color:"#16a34a"}}>R$ {premios.dist.find(d=>d.pos===minhaPos)?.valor}</div>
                        <div style={{fontSize:10,color:"#9ca3af"}}>prêmio atual</div>
                      </div>
                    )}
                  </div>
                )}
                <div style={{marginBottom:14,padding:"12px 16px",background:"rgba(255,255,255,.04)",borderRadius:12,border:"1px solid #f3f4f6"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12,fontWeight:700}}>Progresso dos palpites</span>
                    <span style={{fontSize:12,color:"#16a34a",fontWeight:700}}>{totSalvos}/{totJogos} ({pctPal}%)</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:"#f3f4f6",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:"linear-gradient(90deg,#16a34a,#4ade80)",width:`${pctPal}%`,transition:"width .5s"}}/>
                  </div>
                </div>
                {countdown&&(
                  <div style={{marginBottom:14,padding:"12px 16px",background:"rgba(247,201,72,.07)",border:"1px solid rgba(247,201,72,.2)",borderRadius:12}}>
                    <div style={{fontSize:10,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>⏱ PRÓXIMO PALPITE PENDENTE</div>
                    <div style={{fontWeight:700,fontSize:13,color:"#16a34a"}}>{countdown}</div>
                  </div>
                )}
                <div style={{marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>Próximos Jogos</span>
                    <button onClick={()=>setModo("jogos")} style={{fontSize:11,color:"#16a34a",background:"none",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>Ver todos →</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {JOGOS_GRUPO.filter(j=>{const r=res[j.id]||{};const tR=r.gols1!==undefined&&r.gols1!==""&&r.gols2!==undefined&&r.gols2!=="";return !tR&&new Date(j.dt).getTime()>Date.now();}).slice(0,3).map(j=>{
                      const pJ=palS[j.id];const tP=pJ&&pJ.gols1!==""&&pJ.gols2!=="";const lk=lock(j.dt);
                      return(
                        <div key={j.id} onClick={()=>{if(!lk)setJogoSel(j);}} className="card"
                          style={{padding:"11px 14px",cursor:lk?"default":"pointer",display:"flex",alignItems:"center",gap:12,border:`1px solid ${tP?"rgba(74,222,128,.2)":"#f3f4f6"}`}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:0}}>
                            <span style={{fontSize:18}}>{F[j.time1]||"🏳️"}</span>
                            <span style={{fontSize:11,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.time1}</span>
                            <span style={{fontSize:10,color:"#d1d5db"}}>×</span>
                            <span style={{fontSize:11,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{j.time2}</span>
                            <span style={{fontSize:18}}>{F[j.time2]||"🏳️"}</span>
                          </div>
                          <div style={{flexShrink:0,textAlign:"right"}}>
                            <div style={{fontSize:10,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace"}}>{fmtD(j.dt)}</div>
                            <div style={{fontSize:10,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace"}}>{fmtH(j.dt)}</div>
                          </div>
                          {lk?<span className="badge br" style={{flexShrink:0}}>🔒</span>:tP?<span className="badge bgr" style={{flexShrink:0}}>✓</span>:<span className="badge bg" style={{flexShrink:0}}>Palpitar</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* JOGOS */}
            {modo==="jogos"&&(
              <div>
                <div style={{fontWeight:800,fontSize:18,marginBottom:14}}>📅 Agenda de Jogos</div>
                <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                  {(["proximos","aovivo","terminados"] as const).map(s=>(
                    <button key={s} className={`stab ${statusF===s?"on":"off"}`} onClick={()=>setStatusF(s)}>
                      {s==="proximos"?"⏰ Próximos":s==="aovivo"?"🔴 Ao Vivo":"✅ Terminados"}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <button className="nbtn" onClick={()=>setRodada(r=>Math.max(1,r-1))} disabled={rodada===1}>←</button>
                  <div style={{flex:1,textAlign:"center"}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#16a34a"}}>Rodada {rodada}</div>
                    <div style={{fontSize:10,color:"#9ca3af",marginTop:1}}>{[...new Set(jogosRodada.map(j=>fmtD(j.dt)))].join(" · ")}</div>
                  </div>
                  <button className="nbtn" onClick={()=>setRodada(r=>Math.min(3,r+1))} disabled={rodada===3}>→</button>
                </div>
                <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:14}}>
                  {[1,2,3].map(r=><button key={r} onClick={()=>setRodada(r)} style={{width:22,height:5,borderRadius:3,border:"none",cursor:"pointer",background:r===rodada?"#16a34a":"#e5e7eb",transition:"all .2s"}}/>)}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {jogosFiltrados.length===0&&(
                    <div className="card" style={{textAlign:"center",padding:"32px",color:"#9ca3af"}}>
                      <div style={{fontSize:28,marginBottom:8}}>{statusF==="proximos"?"⏰":statusF==="aovivo"?"🔴":"✅"}</div>
                      Nenhum jogo {statusF==="proximos"?"próximo":statusF==="aovivo"?"ao vivo":"encerrado"} nesta rodada
                    </div>
                  )}
                  {jogosFiltrados.map(j=>{
                    const r=res[j.id]||{};
                    const tR=r.gols1!==undefined&&r.gols1!==""&&r.gols2!==undefined&&r.gols2!=="";
                    const pJ=palS[j.id];const tP=pJ&&pJ.gols1!==""&&pJ.gols2!=="";
                    const lk=lock(j.dt);const st=statusJ(j.dt,tR);
                    let mT="";
                    if(tR&&tP){const{tipo}=calcJogo(parseInt(pJ.gols1),parseInt(pJ.gols2),parseInt(r.gols1),parseInt(r.gols2),j.fase||"grupos",r.penalti||false);mT=tipo;}
                    let nAc=0,nPal=0;
                    if(tR){Object.values(palpitesMap).forEach((ps:any)=>{const p=ps[j.id];if(!p||p.gols1===""||p.gols2==="")return;nPal++;const{tipo}=calcJogo(parseInt(p.gols1),parseInt(p.gols2),parseInt(r.gols1),parseInt(r.gols2),j.fase||"grupos",r.penalti||false);if(tipo==="placar"||tipo==="vencedor")nAc++;});}
                    return(
                      <div key={j.id} className="card" onClick={()=>{if(!lk&&!tR)setJogoSel(j);}}
                        style={{padding:"14px",cursor:(!lk&&!tR)?"pointer":"default",
                          border:`1px solid ${st==="live"?"rgba(248,113,113,.3)":mT==="placar"?"rgba(247,201,72,.3)":mT==="vencedor"?"rgba(100,160,255,.3)":"#f3f4f6"}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#9ca3af",background:"#f9fafb",padding:"2px 7px",borderRadius:4}}>Grupo {j.g}</span>
                            <span style={{fontSize:9,color:"#d1d5db"}}>{j.est}</span>
                          </div>
                          <div style={{display:"flex",gap:5,alignItems:"center"}}>
                            {!lk&&!tR&&tP&&<span className="badge bgr" style={{fontSize:9}}>✓ {pJ.gols1}×{pJ.gols2}</span>}
                            {!lk&&!tR&&!tP&&<span className="badge bg" style={{fontSize:9}}>Palpitar</span>}
                            {lk&&!tR&&<span className="badge br" style={{fontSize:9}}>🔒</span>}
                            {st==="live"&&<span className="badge bred" style={{fontSize:9}}>🔴 AO VIVO</span>}
                            {st==="wait"&&<span className="badge byellow" style={{fontSize:9}}>⏳ Aguardando</span>}
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
                            <span style={{fontSize:26}}>{F[j.time1]||"🏳️"}</span>
                            <span style={{fontSize:11,fontWeight:700,textAlign:"center"}}>{j.time1}</span>
                          </div>
                          <div style={{textAlign:"center",padding:"0 12px",minWidth:80}}>
                            {tR?<div style={{fontWeight:800,fontSize:24,fontFamily:"'JetBrains Mono',monospace",color:"#111827",letterSpacing:2}}>{r.gols1} × {r.gols2}</div>
                              :<div style={{fontSize:12,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace"}}>{fmtD(j.dt)}<br/>{fmtH(j.dt)}</div>}
                            {r.penalti&&<div style={{fontSize:9,color:"#fbbf24",marginTop:2}}>Pênaltis</div>}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
                            <span style={{fontSize:26}}>{F[j.time2]||"🏳️"}</span>
                            <span style={{fontSize:11,fontWeight:700,textAlign:"center"}}>{j.time2}</span>
                          </div>
                        </div>
                        {tR&&(
                          <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #f9fafb",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{fontSize:11,color:"#6b7280"}}>
                              Meu palpite: {tP?<strong style={{color:mT==="placar"?"#16a34a":mT==="vencedor"?"#2563eb":"#b91c1c"}}>{pJ.gols1}×{pJ.gols2} {mT==="placar"?"🎯":mT==="vencedor"?"✅":"❌"}</strong>:<span style={{color:"#d1d5db"}}>—</span>}
                            </div>
                            {nPal>0&&<div style={{fontSize:10,color:"#16a34a",fontWeight:700}}>{nAc}/{nPal} acertaram</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PALPITES */}
            {modo==="palpites"&&(
              <div>
                {!pago&&(
                  <div className="card" style={{marginBottom:14,background:"rgba(248,113,113,.06)",border:"1px solid rgba(248,113,113,.2)"}}>
                    <div style={{fontWeight:700,color:"#b91c1c",marginBottom:6}}>🔒 Pagamento pendente</div>
                    <div style={{fontSize:12,color:"#6b7280",marginBottom:10}}>Faça o Pix para participar do bolão.</div>
                    <button className="btn-gold" onClick={()=>setModo("pix")}>Ver dados do Pix →</button>
                  </div>
                )}
                <div className="card" style={{marginBottom:14,border:"1px solid rgba(247,201,72,.2)",background:"rgba(247,201,72,.03)"}}>
                  <div style={{fontWeight:700,fontSize:11,color:"#16a34a",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>🏆 Campeão da Copa</div>
                  <div style={{fontSize:12,color:"#6b7280",marginBottom:8}}>
    +{CONFIG.bonusCampeao} pts bônus ·{" "}
    {campLock()
      ?<span style={{color:"#b91c1c"}}>🔒 Bloqueado — palpite encerrado</span>
      :<span style={{color:"#16a34a",fontWeight:700}}>{tr(CONFIG.bloqueioCompetidor)} para fechar</span>}
  </div>
                  <select value={campAtual} onChange={e=>setCamp(e.target.value)} disabled={campLock()}>
                    <option value="">— Selecione o campeão —</option>
                    {TODOS_TIMES.map(t=><option key={t} value={t}>{F[t]} {t}</option>)}
                  </select>
                  {campAtual&&<div style={{marginTop:8,fontSize:12,color:"#6b7280"}}>Seu palpite: <strong style={{color:"#16a34a"}}>{F[campAtual]} {campAtual}</strong></div>}
                </div>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {["grupos","oitavas","quartas","semi","final"].map(f=><button key={f} className={`ftab ${faseAtiva===f?"on":"off"}`} onClick={()=>setFaseAtiva(f)}>{FASE_L[f]}</button>)}
                </div>
                {faseAtiva==="grupos"&&(
                  <>
                    <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
                      {Object.keys(GRUPOS).map(g=><button key={g} className={`gtab ${grupoAtivo===g?"on":"off"}`} onClick={()=>setGrupoAtivo(g)}>{g}</button>)}
                    </div>
                    <div style={{marginBottom:10,padding:"6px 10px",background:"rgba(255,255,255,.03)",borderRadius:7,display:"flex",gap:6,flexWrap:"wrap"}}>
                      {GRUPOS[grupoAtivo].map(t=><span key={t} style={{fontSize:10,color:"#6b7280"}}>{F[t]} {t}</span>)}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {JOGOS_GRUPO.filter(j=>j.g===grupoAtivo).map(j=>{
                        const r=res[j.id]||{};const tR=r.gols1!==undefined&&r.gols1!==""&&r.gols2!==undefined&&r.gols2!=="";
                        const pL=palR[j.id]||{};const pSv=palS[j.id]||{};const lk=lock(j.dt);
                        const tPL=pL.gols1!==""&&pL.gols1!==undefined&&pL.gols2!==""&&pL.gols2!==undefined;
                        const mod=!lk&&(pL.gols1!==pSv.gols1||pL.gols2!==pSv.gols2)&&tPL;
                        let aV=false,aP=false;
                        if(tR&&pSv.gols1!==undefined&&pSv.gols1!==""){const{tipo}=calcJogo(parseInt(pSv.gols1),parseInt(pSv.gols2),parseInt(r.gols1),parseInt(r.gols2),j.fase||"grupos",r.penalti||false);aV=tipo==="vencedor";aP=tipo==="placar";}
                        const bc=aP?"#16a34a":aV?"#2563eb":"transparent";
                        return(
                          <div key={j.id} className="card" style={{position:"relative",overflow:"hidden",padding:"13px",border:`1px solid ${bc==="transparent"?"#f3f4f6":bc+"44"}`}}>
                            {bc!=="transparent"&&<div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:bc}}/>}
                            <div style={{position:"absolute",top:8,right:8,display:"flex",gap:4}}>
                              {lk&&!tPL&&<span className="badge br">🔒</span>}
                              {aP&&<span className="badge bg">🎯 Exato!</span>}
                              {aV&&<span className="badge bb">✅</span>}
                              {mod&&<span className="badge" style={{background:"rgba(251,191,36,.15)",color:"#fbbf24",border:"1px solid rgba(251,191,36,.3)"}}>✏️</span>}
                            </div>
                            <div style={{fontSize:9,color:"#d1d5db",fontFamily:"'JetBrains Mono',monospace",marginBottom:9}}>📍 {j.est}, {j.cid} · {fmtD(j.dt)} {fmtH(j.dt)}</div>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1,minWidth:0}}>
                                <span style={{fontSize:22}}>{F[j.time1]}</span>
                                <span style={{fontSize:10,fontWeight:700,color:"#374151",textAlign:"center"}}>{j.time1}</span>
                              </div>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"0 8px",flexShrink:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <input type="number" min={0} max={30} disabled={lk} className={`si${tPL?" f":""}`} value={pL.gols1??""} onChange={e=>setPalLocal(j.id,"gols1",e.target.value,j.dt)} placeholder="—"/>
                                  <span style={{color:"#d1d5db",fontSize:13}}>×</span>
                                  <input type="number" min={0} max={30} disabled={lk} className={`si${tPL?" f":""}`} value={pL.gols2??""} onChange={e=>setPalLocal(j.id,"gols2",e.target.value,j.dt)} placeholder="—"/>
                                </div>
                                {tR&&<div style={{fontSize:9,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace"}}>Resultado: {r.gols1}×{r.gols2}{r.penalti?" (pên.)":""}</div>}
                              </div>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1,minWidth:0}}>
                                <span style={{fontSize:22}}>{F[j.time2]}</span>
                                <span style={{fontSize:10,fontWeight:700,color:"#374151",textAlign:"center"}}>{j.time2}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={salvarGrupo} disabled={salvando} style={{marginTop:13,width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:salvando?"not-allowed":"pointer",background:temRasc?"#16a34a":"#f3f4f6",color:temRasc?"#fff":"#9ca3af",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:14,transition:"all .2s"}}>
                      {salvando?"Salvando...":temRasc?`💾 Salvar — Grupo ${grupoAtivo}`:"✅ Palpites salvos"}
                    </button>
                  </>
                )}
                {faseAtiva!=="grupos"&&(
                  <div>
                    {elim.filter(j=>j.fase===faseAtiva&&j.time1).length===0&&<div className="card" style={{textAlign:"center",color:"#d1d5db",padding:"28px"}}>Fase ainda não definida pelo admin</div>}
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {elim.filter(j=>j.fase===faseAtiva&&j.time1).map(j=>{
                        const pL=palR[j.id]||{};const lk=lock(j.dt);const tPL=pL.gols1!==""&&pL.gols1!==undefined&&pL.gols2!==""&&pL.gols2!==undefined;
                        return(
                          <div key={j.id} className="card" style={{padding:"13px"}}>
                            <div style={{fontSize:9,color:"#9ca3af",marginBottom:9}}>{j.label} · {fmtD(j.dt)} {fmtH(j.dt)} · {j.est}</div>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                              <div style={{textAlign:"center",flex:1}}><div style={{fontSize:22}}>{F[j.time1]||"🏳️"}</div><div style={{fontSize:10,fontWeight:700,color:"#374151"}}>{j.time1}</div></div>
                              <div style={{display:"flex",alignItems:"center",gap:5,padding:"0 8px"}}>
                                <input type="number" min={0} max={30} disabled={lk} className={`si${tPL?" f":""}`} value={pL.gols1??""} onChange={e=>setPalLocal(j.id,"gols1",e.target.value,j.dt)} placeholder="—"/>
                                <span style={{color:"#d1d5db",fontSize:13}}>×</span>
                                <input type="number" min={0} max={30} disabled={lk} className={`si${tPL?" f":""}`} value={pL.gols2??""} onChange={e=>setPalLocal(j.id,"gols2",e.target.value,j.dt)} placeholder="—"/>
                              </div>
                              <div style={{textAlign:"center",flex:1}}><div style={{fontSize:22}}>{F[j.time2]||"🏳️"}</div><div style={{fontSize:10,fontWeight:700,color:"#374151"}}>{j.time2}</div></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {elim.filter(j=>j.fase===faseAtiva&&j.time1).length>0&&(
                      <button onClick={salvarElim} disabled={salvando} style={{marginTop:13,width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",background:temRasc?"#16a34a":"#f3f4f6",color:temRasc?"#fff":"#9ca3af",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:14}}>
                        {salvando?"Salvando...":temRasc?`💾 Salvar — ${FASE_L[faseAtiva]}`:"✅ Palpites salvos"}
                      </button>
                    )}
                  </div>
                )}
                <div style={{marginTop:10,padding:"9px 14px",background:"rgba(247,201,72,.04)",border:"1px solid rgba(247,201,72,.1)",borderRadius:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#6b7280"}}>{totSalvos} palpites salvos no banco</span>
                  <span className="badge bg">☁ Supabase</span>
                </div>
              </div>
            )}

            {/* RANKING */}
            {modo==="ranking"&&(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>AO VIVO</div>
                    <div style={{fontWeight:800,fontSize:18}}>Classificação Geral</div>
                  </div>
                  <button onClick={exportarRanking} className="btn-ghost" style={{fontSize:11,padding:"6px 12px"}}>{copRank?"✅ Copiado!":"📤 WhatsApp"}</button>
                </div>
                {minhaPos>0&&(
                  <div style={{background:"linear-gradient(135deg,#16a34a,#15803d)",borderRadius:16,padding:"16px",marginBottom:14,color:"#fff",display:"flex",alignItems:"center",gap:14}}>
                    <div style={{fontSize:28}}>{MEDAL[minhaPos-1]||`${minhaPos}º`}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:16}}>{usuarioAtual} <span style={{fontSize:12,opacity:.8}}>(você)</span></div>
                      <div style={{fontSize:13,opacity:.8}}>{meusDados?.pontos||0} pts · {meusDados?.acertos||0} acertos · {meusDados?.placares||0} exatos</div>
                    </div>
                    {premios.dist.find(d=>d.pos===minhaPos)&&<div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:20}}>R$ {premios.dist.find(d=>d.pos===minhaPos)?.valor}</div><div style={{fontSize:11,opacity:.8}}>prêmio</div></div>}
                  </div>
                )}
                <div className="card" style={{marginBottom:14,border:"1.5px solid #fde68a",background:"#fefce8"}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#854d0e",marginBottom:10}}>💰 Premiação — {nPagos} pagos · R$ {premios.total} no total</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {premios.dist.map(d=>(
                      <div key={d.pos} style={{flex:"1 1 60px",textAlign:"center",padding:"10px 8px",background:"#fff",borderRadius:10,border:"1px solid #fde68a"}}>
                        <div style={{fontSize:18}}>{MEDAL[d.pos-1]}</div>
                        <div style={{fontWeight:800,fontSize:15,color:"#16a34a"}}>R$ {d.valor}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {ranking.map((p,i)=>{
                    const isMe=p.nome===usuarioAtual;const premio=premios.dist.find(d=>d.pos===i+1);
                    const badges=calcBadges(p.nome,ranking,palpitesMap,elim,res,resE);
                    return(
                      <div key={p.nome} className="card" style={{border:`1.5px solid ${isMe?"#86efac":"#e5e7eb"}`,background:isMe?"#f0fdf4":"#fff",cursor:"pointer",position:"relative",overflow:"hidden",padding:"14px 16px"}}
                        onClick={()=>setDetUser(detUser===p.nome?null:p.nome)}>
                        {isMe&&<div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:"#16a34a",borderRadius:"2px 0 0 2px"}}/>}
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{fontSize:20,width:28,textAlign:"center",flexShrink:0,fontWeight:700}}>{MEDAL[i]||`${i+1}º`}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:4}}>{p.nome} {isMe&&<span style={{fontSize:11,color:"#16a34a",fontWeight:600}}>(você)</span>}</div>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                              <span className="badge bb">✅ {p.acertos}</span>
                              <span className="badge bp">🎯 {p.placares}</span>
                              {p.campeao&&<span className="badge bg">{F[p.campeao]}</span>}
                              {!p.pago&&<span className="badge br">Pendente</span>}
                              {badges.map(b=><span key={b} className="badge bgr">{b}</span>)}
                            </div>
                            {detUser===p.nome&&(
                              <div style={{marginTop:10,fontSize:12,color:"#6b7280",lineHeight:1.8,background:"#f9fafb",borderRadius:8,padding:"8px 10px"}}>
                                {p.bonusCampeao>0&&<div>🏆 Bônus campeão: +{p.bonusCampeao}pts</div>}
                                <div>Desempate: {p.placares} placares → {p.acertos} acertos</div>
                                {premio&&<div style={{color:"#16a34a",fontWeight:700}}>💰 Prêmio: R$ {premio.valor}</div>}
                              </div>
                            )}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:26,fontWeight:800,color:"#16a34a",fontFamily:"'JetBrains Mono',monospace"}}>{p.pontos}</div>
                            <div style={{fontSize:11,color:"#9ca3af"}}>pts</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HISTÓRICO */}
            {modo==="historico"&&(
              <div>
                <div style={{marginBottom:16}}>
                  <div style={{fontWeight:800,fontSize:20,marginBottom:10,color:"#111827"}}>📊 Meu Histórico</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {(["todas",1,2,3] as const).map(r=><button key={r} className={`gtab ${histRodada===r?"on":"off"}`} onClick={()=>setHistRodada(r)}>{r==="todas"?"Todas":`Rodada ${r}`}</button>)}
                  </div>
                </div>
                {(()=>{
                  const dados=calcTudo(palS,elim,res,resE,campAtual,campR);
                  let comRes=dados.det.filter((d:any)=>d.res);
                  if(histRodada!=="todas")comRes=comRes.filter((d:any)=>d.r===histRodada);
                  if(comRes.length===0)return<div className="card" style={{textAlign:"center",padding:"40px",color:"#9ca3af"}}>Nenhum jogo encerrado nesta rodada</div>;
                  const ac=comRes.filter((d:any)=>d.tipo==="placar"||d.tipo==="vencedor").length;
                  const pct=comRes.length>0?Math.round(ac/comRes.length*100):0;
                  return(
                    <>
                      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                        {[["🎯",comRes.filter((d:any)=>d.tipo==="placar").length,"Exatos","#16a34a"],["✅",comRes.filter((d:any)=>d.tipo==="vencedor").length,"Acertos","#2563eb"],["❌",comRes.filter((d:any)=>d.tipo==="erro"||d.tipo==="sem_palpite").length,"Erros","#b91c1c"],["📊",`${pct}%`,"Taxa","#16a34a"]].map(([ic,v,lb,cor]:any)=>(
                          <div key={lb} className="card" style={{flex:"1 1 60px",textAlign:"center",padding:"12px 6px"}}>
                            <div style={{fontSize:18}}>{ic}</div><div style={{fontWeight:800,fontSize:18,color:cor}}>{v}</div><div style={{fontSize:10,color:"#9ca3af"}}>{lb}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {comRes.map((d:any)=>{
                          const cor=d.tipo==="placar"?"#16a34a":d.tipo==="vencedor"?"#2563eb":"#b91c1c";
                          const ic=d.tipo==="placar"?"🎯":d.tipo==="vencedor"?"✅":d.tipo==="sem_palpite"?"—":"❌";
                          return(
                            <div key={d.id} className="card" style={{padding:"14px 16px",borderLeft:`4px solid ${cor}`}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{fontSize:16,flexShrink:0}}>{ic}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,fontWeight:700,color:"#111827"}}>{F[d.time1]||""} {d.time1} × {d.time2} {F[d.time2]||""}</div>
                                  <div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>Resultado: <strong style={{color:"#374151"}}>{d.res.gols1}×{d.res.gols2}</strong>{d.res.penalti?" (pên.)":""} · Palpite: <strong style={{color:cor}}>{d.pal?`${d.pal.gols1}×${d.pal.gols2}`:"—"}</strong></div>
                                </div>
                                <div style={{fontWeight:800,fontSize:15,color:cor,flexShrink:0,fontFamily:"'JetBrains Mono',monospace"}}>{d.pts>0?`+${d.pts}`:d.tipo==="sem_palpite"?"—":"0"}</div>
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
                <div style={{marginBottom:20}}><div style={{fontSize:11,color:"#9ca3af",marginBottom:2}}>PAGAMENTO</div><div style={{fontWeight:800,fontSize:20,color:"#111827"}}>Cota de Entrada</div></div>
                {pago?(
                  <div className="card" style={{textAlign:"center",padding:"40px",border:"1.5px solid #86efac",background:"#f0fdf4"}}>
                    <div style={{fontSize:52,marginBottom:12}}>✅</div>
                    <div style={{fontWeight:800,fontSize:18,color:"#16a34a",marginBottom:6}}>Pagamento confirmado!</div>
                    <div style={{fontSize:14,color:"#6b7280"}}>Você está dentro do bolão. Boa sorte! 🍀</div>
                  </div>
                ):(
                  <div>
                    <div style={{textAlign:"center",marginBottom:20}}>
                      <div style={{fontWeight:800,fontSize:40,color:"#16a34a"}}>R$ {CONFIG.valorCota},00</div>
                      <div style={{fontSize:14,color:"#9ca3af",marginTop:4}}>Valor da cota</div>
                    </div>
                    <div className="card" style={{marginBottom:12,border:"1.5px solid #86efac",background:"#f0fdf4",textAlign:"center"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#166534",marginBottom:8}}>💳 Pagar via Mercado Pago</div>
                      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>Pix, cartão de crédito ou débito — confirmação automática</div>
                      <button className="btn-primary" onClick={pagarMP} disabled={mpLoading} style={{fontSize:16}}>{mpLoading?"Gerando link...":"💳 Pagar R$ 10 agora"}</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
                      <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
                      <span style={{fontSize:12,color:"#9ca3af"}}>ou Pix manual</span>
                      <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
                    </div>
                    <div className="card" style={{marginBottom:10,textAlign:"center"}}>
                      <div style={{fontSize:12,color:"#9ca3af",marginBottom:10}}>Escaneie o QR Code</div>
                      <div style={{display:"inline-block",background:"#fff",borderRadius:12,padding:10,marginBottom:10,border:"1px solid #e5e7eb"}}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(CONFIG.pixCopiaCola)}`} alt="QR Code Pix" width={190} height={190} style={{display:"block",borderRadius:4}}/>
                      </div>
                      <div style={{fontSize:12,color:"#9ca3af"}}>App do banco → Pix → Ler QR Code</div>
                    </div>
                    <div className="card" style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:"#9ca3af",marginBottom:8}}>CHAVE PIX ALEATÓRIA</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,fontWeight:600,fontSize:12,color:"#374151",wordBreak:"break-all",fontFamily:"'JetBrains Mono',monospace"}}>{CONFIG.chavePix}</div>
                        <button onClick={()=>{navigator.clipboard.writeText(CONFIG.chavePix);setCopChave(true);setTimeout(()=>setCopChave(false),2000);}} style={{flexShrink:0,padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,background:copChave?"#dcfce7":"#f3f4f6",color:copChave?"#166534":"#374151",border:"1px solid #e5e7eb"}}>{copChave?"✅ Copiado!":"📋 Copiar"}</button>
                      </div>
                      <div style={{fontSize:11,color:"#9ca3af",marginTop:6}}>Favorecido: {CONFIG.nomePix}</div>
                    </div>
                    <div className="card" style={{fontSize:13,color:"#6b7280",lineHeight:1.9,border:"1.5px solid #fde68a",background:"#fefce8"}}>
                      <div style={{fontWeight:700,color:"#854d0e",marginBottom:8}}>📌 Pix manual — como pagar</div>
                      <div>1. Escaneie o QR Code ou copie a chave</div>
                      <div>2. Confirme: <strong style={{color:"#111827"}}>R$ {CONFIG.valorCota},00 → {CONFIG.nomePix}</strong></div>
                      <div>3. Envie comprovante no WhatsApp</div>
                      <div>4. Admin confirma e libera acesso</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PERFIL */}
            {modo==="perfil"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:20,color:"#111827"}}>👤 Meu Perfil</div>
                <div style={{background:"linear-gradient(135deg,#16a34a,#15803d)",borderRadius:20,padding:"24px",marginBottom:16,color:"#fff",textAlign:"center"}}>
                  <div style={{width:64,height:64,background:"rgba(255,255,255,.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 12px"}}>👤</div>
                  <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>{usuarioAtual}</div>
                  <div style={{fontSize:13,opacity:.8}}>{pago?"✅ Pagamento confirmado":"⚠️ Pagamento pendente"}</div>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:16}}>
                  {[["⭐",meusDados?.pontos??0,"Pontos"],["🎯",meusDados?.placares??0,"Exatos"],["✅",meusDados?.acertos??0,"Acertos"],["📊",`${minhaPos>0?minhaPos+"º":"—"}`,"Posição"]].map(([ic,v,lb])=>(
                    <div key={lb as string} className="card" style={{flex:1,textAlign:"center",padding:"12px 6px"}}>
                      <div style={{fontSize:18}}>{ic}</div>
                      <div style={{fontWeight:800,fontSize:18,color:"#16a34a"}}>{v}</div>
                      <div style={{fontSize:10,color:"#9ca3af",marginTop:1}}>{lb}</div>
                    </div>
                  ))}
                </div>
                {calcBadges(usuarioAtual||"",ranking,palpitesMap,elim,res,resE).length>0&&(
                  <div className="card" style={{marginBottom:12}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>🏅 Conquistas</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {calcBadges(usuarioAtual||"",ranking,palpitesMap,elim,res,resE).map(b=>(
                        <div key={b} style={{padding:"8px 14px",background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:12,fontSize:13,fontWeight:700,color:"#166534"}}>{b}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CAMPEÃO */}
            {modo==="campeao"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:16,color:"#111827"}}>🏆 Palpite de Campeão</div>
                <div className="card" style={{marginBottom:14,border:"1.5px solid #fde68a",background:"#fefce8"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#854d0e",marginBottom:6}}>Bônus +{CONFIG.bonusCampeao} pontos</div>
                  <div style={{fontSize:13,color:"#92400e",marginBottom:14}}>{campLock()?<span>🔒 Palpite encerrado</span>:<span>{tr(CONFIG.bloqueioCompetidor)} para fechar</span>}</div>
                  <select value={campAtual} onChange={e=>setCamp(e.target.value)} disabled={campLock()}>
                    <option value="">— Selecione o campeão —</option>
                    {TODOS_TIMES.map(t=><option key={t} value={t}>{F[t]} {t}</option>)}
                  </select>
                  {campAtual&&<div style={{marginTop:12,padding:"10px 14px",background:"#fff",borderRadius:10,fontSize:14}}>Seu palpite: <strong style={{color:"#16a34a"}}>{F[campAtual]} {campAtual}</strong></div>}
                </div>
                <div className="card">
                  <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:12}}>Palpites do grupo</div>
                  {Object.entries(usuarios).map(([nome,u]:any)=>(
                    <div key={nome} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f3f4f6"}}>
                      <span style={{flex:1,fontSize:14,color:"#374151",fontWeight:500}}>{nome}</span>
                      <span style={{fontSize:14}}>{u.camp?`${F[u.camp]||""} ${u.camp}`:<span style={{color:"#9ca3af",fontSize:12}}>—</span>}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REGRAS */}
            {modo==="regras"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:16,color:"#111827"}}>📋 Regras do Bolão</div>
                {[
                  {title:"Pontuação por fase",rows:[["⚽","Grupos — vencedor/empate","+2 pts"],["🎯","Grupos — placar exato","+5 pts"],["⚽","Oitavas — vencedor","+3 pts"],["🎯","Oitavas — placar exato","+8 pts"],["⚽","Quartas — vencedor","+5 pts"],["🎯","Quartas — placar exato","+12 pts"],["⚽","Semifinal — vencedor","+7 pts"],["🎯","Semifinal — placar exato","+15 pts"],["⚽","Final — vencedor","+10 pts"],["🎯","Final — placar exato","+20 pts"]]},
                  {title:"Bônus e regras",rows:[["🏆",`Campeão da Copa (fecha 04/07)`,`+${CONFIG.bonusCampeao} pts`],["🥅","Pênalti: vale o vencedor final","sem placar exato"],["🔒",`Palpites fecham ${CONFIG.minutesBloqueio}min antes do jogo`,"automático"]]},
                  {title:"Desempate",rows:[["1️⃣","Mais placares exatos",""],["2️⃣","Mais acertos",""],["3️⃣","Acertou o campeão",""],["4️⃣","Decisão do admin",""]]},
                  {title:"Premiação — apenas pagos",rows:premios.dist.map(d=>[MEDAL[d.pos-1],`${d.pos}º lugar`,`R$ ${d.valor}`])},
                ].map((sec,si)=>(
                  <div key={si} className="card" style={{marginBottom:10}}>
                    <div style={{fontWeight:700,fontSize:12,color:"#16a34a",letterSpacing:.5,textTransform:"uppercase",marginBottom:12}}>{sec.title}</div>
                    {sec.rows.map((r,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<sec.rows.length-1?"1px solid #f3f4f6":"none"}}>
                        <span style={{fontSize:16}}>{r[0]}</span><span style={{flex:1,fontSize:14,color:"#374151"}}>{r[1]}</span>{r[2]&&<span className="badge bgr">{r[2]}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* FEED */}
            {modo==="feed"&&(
              <div>
                <div style={{fontWeight:800,fontSize:20,marginBottom:16,color:"#111827"}}>💬 Feed de Atividade</div>
                {feed.length===0?(
                  <div className="card" style={{textAlign:"center",padding:"40px",color:"#9ca3af"}}>
                    <div style={{fontSize:36,marginBottom:8}}>💬</div>
                    <div>Nenhuma atividade ainda</div>
                    <div style={{fontSize:12,marginTop:4}}>As ações do grupo aparecerão aqui</div>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {feed.map(f=>(
                      <div key={f.id} className="card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,background:"#f0fdf4",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>⚽</div>
                        <div style={{flex:1}}><div style={{fontSize:14,color:"#374151"}}>{f.msg}</div><div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{f.ts}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

        {/* ADMIN */}
        {tela==="admin"&&(
          <div className="fade">
            <div style={{marginBottom:14,padding:"10px 16px",background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:12}}>
              <span style={{fontWeight:700,fontSize:13,color:"#b91c1c"}}>🔐 Painel do Administrador</span>
            </div>

            {adminModo==="resultados"&&(
              <div>
                <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                  {Object.keys(GRUPOS).map(g=><button key={g} className={`gtab ${grupoAtivo===g?"on":"off"}`} onClick={()=>setGrupoAtivo(g)}>{g}</button>)}
                </div>
                <div style={{marginBottom:10,padding:"6px 10px",background:"rgba(255,255,255,.03)",borderRadius:7,display:"flex",gap:6,flexWrap:"wrap"}}>
                  {GRUPOS[grupoAtivo].map(t=><span key={t} style={{fontSize:10,color:"#6b7280"}}>{F[t]} {t}</span>)}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {JOGOS_GRUPO.filter(j=>j.g===grupoAtivo).map(j=><JogoCardAdmin key={j.id} jogo={j}/>)}
                </div>
                <div style={{marginTop:10,padding:"9px 13px",background:"rgba(74,222,128,.04)",border:"1px solid rgba(74,222,128,.12)",borderRadius:9,display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:"#6b7280"}}>{Object.keys(res).filter(id=>res[id]?.gols1!==""&&res[id]?.gols1!==undefined).length}/{JOGOS_GRUPO.length} resultados</span>
                  <span className="badge bgr">☁ Supabase</span>
                </div>
              </div>
            )}

            {adminModo==="elim"&&(
              <div>
                <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                  {["oitavas","quartas","semi","final"].map(f=><button key={f} className={`ftab ${faseAtiva===f?"on":"off"}`} onClick={()=>setFaseAtiva(f)}>{FASE_L[f]}</button>)}
                </div>
                {faseAtiva==="final"&&(
                  <div className="card" style={{marginBottom:10,border:"1px solid rgba(247,201,72,.2)"}}>
                    <div style={{fontWeight:700,fontSize:10,color:"#16a34a",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>🏆 Campeão Real da Copa</div>
                    <select value={campR} onChange={e=>atualizarCampR(e.target.value)}>
                      <option value="">— Ainda não definido —</option>
                      {TODOS_TIMES.map(t=><option key={t} value={t}>{F[t]} {t}</option>)}
                    </select>
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {elim.filter(j=>j.fase===faseAtiva).map(j=>(
                    <div key={j.id}>
                      <div style={{fontSize:10,color:"#9ca3af",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>{j.label}</div>
                      <div style={{display:"flex",gap:7,marginBottom:6}}>
                        <select style={{flex:1,fontSize:12,padding:"7px 10px"}} value={j.time1} onChange={e=>updateElimT(j.id,"time1",e.target.value)}>
                          <option value="">— Time 1 —</option>
                          {TODOS_TIMES.map(t=><option key={t} value={t}>{F[t]} {t}</option>)}
                        </select>
                        <select style={{flex:1,fontSize:12,padding:"7px 10px"}} value={j.time2} onChange={e=>updateElimT(j.id,"time2",e.target.value)}>
                          <option value="">— Time 2 —</option>
                          {TODOS_TIMES.map(t=><option key={t} value={t}>{F[t]} {t}</option>)}
                        </select>
                      </div>
                      {j.time1&&j.time2&&<JogoCardAdmin jogo={j} isElim/>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminModo==="usuarios"&&(
              <div>
                <div style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div style={{fontWeight:700,fontSize:14}}>{nPart} participantes</div>
                    <button onClick={()=>{
                      const pagos=Object.entries(usuarios).filter(([,u]:any)=>u.pago).map(([n]:any)=>n);
                      const pendentes=Object.entries(usuarios).filter(([,u]:any)=>!u.pago).map(([n]:any)=>n);
                      const txt="💰 BOLÃO COPA 2026 — Pagamentos\n\n✅ Pagos ("+pagos.length+"):\n"+(pagos.map((n:string)=>"• "+n).join("\n")||"Nenhum")+"\n\n⚠️ Pendentes ("+pendentes.length+"):\n"+(pendentes.map((n:string)=>"• "+n).join("\n")||"Nenhum");
                      navigator.clipboard.writeText(txt);
                      mostrarToast("✅ Lista copiada para o WhatsApp!");
                    }} style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid #86efac",background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                      📋 Copiar lista
                    </button>
                  </div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>
                    Pagos: <span style={{color:"#16a34a",fontWeight:700}}>R$ {nPagos*CONFIG.valorCota}</span> · Pendente: <span style={{color:"#b91c1c",fontWeight:700}}>R$ {(nPart-nPagos)*CONFIG.valorCota}</span>
                  </div>
                  {/* Barra visual pagos/pendentes */}
                  {nPart>0&&(
                    <div style={{marginTop:8}}>
                      <div style={{height:6,borderRadius:3,background:"#f3f4f6",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#16a34a,#4ade80)",width:`${Math.round(Object.values(usuarios).filter((u:any)=>u.pago).length/nPart*100)}%`,transition:"width .5s"}}/>
                      </div>
                      <div style={{fontSize:11,color:"#9ca3af",marginTop:4,textAlign:"right"}}>{Object.values(usuarios).filter((u:any)=>u.pago).length}/{nPart} pagos ({Math.round(Object.values(usuarios).filter((u:any)=>u.pago).length/nPart*100)}%)</div>
                    </div>
                  )}
                </div>
                {nPart===0&&<div className="card" style={{textAlign:"center",color:"#9ca3af",padding:"36px"}}>Nenhum participante ainda</div>}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Object.entries(usuarios).map(([nome,u]:any)=>{
                    const pos=ranking.findIndex(r=>r.nome===nome);
                    const isReset=resetNome===nome;
                    return(
                      <div key={nome} className="card" style={{padding:"14px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{fontSize:16,width:26,textAlign:"center",flexShrink:0}}>{pos>=0?MEDAL[pos]||`${pos+1}º`:"—"}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:14,color:"#111827"}}>{nome}</div>
                            <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>
                              🏆 {u.camp?`${F[u.camp]||""} ${u.camp}`:"Sem palpite campeão"}
                              {pos>=0&&` · ${ranking[pos]?.pontos||0}pts`}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:6,flexShrink:0}}>
                            <button onClick={()=>{setResetNome(isReset?null:nome);setNovaSenha("");}}
                              style={{padding:"7px 12px",borderRadius:8,border:"1.5px solid #e5e7eb",cursor:"pointer",fontWeight:700,fontSize:12,background:"#f9fafb",color:"#374151"}}>🔑</button>
                            <button onClick={()=>togglePago(nome)}
                              style={{padding:"7px 12px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,
                                background:u.pago?"#dcfce7":"#fee2e2",color:u.pago?"#166534":"#b91c1c",
                                border:u.pago?"1.5px solid #86efac":"1.5px solid #fecaca"}}>
                              {u.pago?"✅ Pago":"⚠ Pendente"}
                            </button>
                          </div>
                        </div>
                        {isReset&&(
                          <div style={{marginTop:10,display:"flex",gap:8}}>
                            <input className="inp" type="password" placeholder="Nova senha (mín. 4 chars)" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)}/>
                            <button onClick={()=>resetarSenha(nome,novaSenha)} style={{padding:"10px 16px",borderRadius:10,border:"none",cursor:"pointer",background:"#16a34a",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>Salvar</button>
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

      {/* Bottom Navigation — estilo Mercado Pago */}
      {tela==="app"&&(
        <nav className="bottomnav">
          {[{id:"home",icon:"⚽",label:"Início"},{id:"jogos",icon:"📅",label:"Jogos"},{id:"palpites",icon:"🎯",label:"Palpites"},{id:"ranking",icon:"🏅",label:"Ranking"}].map(item=>(
            <button key={item.id} className={`navbtn${modo===item.id?" active":""}`} onClick={()=>setModo(item.id)}>
              <span className="ni">{item.icon}</span>
              <span className="nl">{item.label}</span>
            </button>
          ))}
          <button className={`navbtn${["pix","perfil","campeao","regras","historico","feed"].includes(modo)?" active":""}`} onClick={()=>setMaisOpen(true)}>
            <span className="ni">⋯</span>
            <span className="nl">Mais</span>
          </button>
        </nav>
      )}
    </div>);
}