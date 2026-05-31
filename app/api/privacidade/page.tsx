export default function Privacidade() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px", fontFamily: "Inter, sans-serif", color: "#111827" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, background: "#16a34a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>⚽</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Política de Privacidade</h1>
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Bolão Copa 2026 · Última atualização: maio de 2026</p>
      </div>

      {[
        {
          titulo: "1. Quais dados coletamos",
          texto: "Coletamos seu nome completo, endereço de e-mail e informações de pagamento processadas pelo Mercado Pago. Não armazenamos dados de cartão de crédito.",
        },
        {
          titulo: "2. Como usamos seus dados",
          texto: "Seus dados são usados exclusivamente para identificação no bolão, processamento do pagamento da cota de participação e envio de comunicações relacionadas ao bolão (resultados, ranking e notificações).",
        },
        {
          titulo: "3. Compartilhamento de dados",
          texto: "Seus dados são processados pelo Supabase (banco de dados seguro) e pelo Mercado Pago (processamento de pagamento). Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.",
        },
        {
          titulo: "4. Segurança",
          texto: "Suas senhas são armazenadas de forma criptografada pelo Supabase Auth. O acesso ao banco de dados é protegido por autenticação e políticas de segurança (RLS).",
        },
        {
          titulo: "5. Seus direitos (LGPD)",
          texto: "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento. Para isso, entre em contato pelo e-mail contatobsprime@gmail.com.",
        },
        {
          titulo: "6. Retenção de dados",
          texto: "Seus dados são mantidos pelo período de duração do bolão e por até 90 dias após o encerramento. Após esse período, os dados são excluídos permanentemente.",
        },
        {
          titulo: "7. Contato",
          texto: "Dúvidas sobre esta política? Entre em contato: contatobsprime@gmail.com",
        },
      ].map((sec) => (
        <div key={sec.titulo} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#16a34a" }}>{sec.titulo}</h2>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>{sec.texto}</p>
        </div>
      ))}

      <a href="/" style={{ display: "inline-block", marginTop: 8, fontSize: 13, color: "#16a34a", textDecoration: "none", fontWeight: 600 }}>
        ← Voltar ao app
      </a>
    </div>
  );
}