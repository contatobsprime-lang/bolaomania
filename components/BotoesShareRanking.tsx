// Adiciona isso na TelaRanking, após o ranking ser exibido (antes de fechar a div)

export default function BotoesShareRanking({
    ranking,
    premios,
    usuarioAtual,
    MEDAL,
    mostrarToast,
}: any) {
    const gerarTexto = () => {
        const minhaPos = ranking.findIndex((r: any) => r.nome === usuarioAtual) + 1;
        const meusPts = ranking.find((r: any) => r.nome === usuarioAtual)?.pontos || 0;

        return `🏆 *BOLÃO COPA 2026* 🏆

${usuarioAtual ? `Estou em *${minhaPos}º lugar* com *${meusPts} pontos*! 🎯\n` : ""}

📊 *TOP 5 DO RANKING:*
${ranking
    .slice(0, 5)
    .map((p: any, i: number) => `${MEDAL[i] || `${i + 1}º`} *${p.nome}* — ${p.pontos}pts`)
    .join("\n")}

💰 *PRÊMIOS:*
${premios.dist.map((d: any) => `${d.pos}º lugar: R$ ${d.valor}`).join("\n")}

🎮 Participa também! ⚽`;
    };

    const handleCopiar = () => {
        const txt = gerarTexto();
        navigator.clipboard.writeText(txt).then(() => {
            mostrarToast("✅ Copiado! Cole no WhatsApp");
        });
    };

    const handleWhatsApp = () => {
        const txt = gerarTexto();
        const textoEncodado = encodeURIComponent(txt);
        window.open(`https://wa.me/?text=${textoEncodado}`, "_blank");
    };

    return (
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
                onClick={handleCopiar}
                style={{
                    flex: 1,
                    padding: "14px 16px",
                    background: "#f3f4f6",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#374151",
                    transition: "all .2s",
                }}
                onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.background = "#e5e7eb";
                }}
                onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.background = "#f3f4f6";
                }}
            >
                📋 Copiar
            </button>
            <button
                onClick={handleWhatsApp}
                style={{
                    flex: 1,
                    padding: "14px 16px",
                    background: "#25d366",
                    border: "none",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#fff",
                    transition: "all .2s",
                }}
                onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.background = "#20ba5a";
                }}
                onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.background = "#25d366";
                }}
            >
                💬 Compartilhar
            </button>
        </div>
    );
}