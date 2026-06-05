import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/constantes";
import type { Tela } from "@/lib/types";

export function useAuth() {
    const [tela, setTela] = useState<Tela>("login");
    const [usuarioAtual, setUsuarioAtual] = useState<string | null>(null);
    const [emailAtual, setEmailAtual] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sessaoCarregando, setSessaoCarregando] = useState(true);
    const [carregando, setCarregando] = useState(false);

    // Erros de login/cadastro
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

    const handleLogin = useCallback(async (
        email: string,
        senha: string,
        onSuccess: (nome: string, email: string, isAdmin: boolean) => void
    ) => {
        setCarregando(true);
        setLoginErro("");
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: senha,
        });
        if (error || !data.user) {
            setCarregando(false);
            setLoginErro("Email ou senha incorretos.");
            return;
        }
        const userEmail = data.user.email || "";
        setEmailAtual(userEmail);
        const isAdminUser = userEmail === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);
        
        const { data: u } = await supabase.from("usuarios").select("*").eq("email", userEmail).single();
        setCarregando(false);
        if (!u) {
            setLoginErro("Usuário não encontrado na tabela.");
            return;
        }
        setUsuarioAtual(u.nome);
        setLoginEmail("");
        setLoginSenha("");
        onSuccess(u.nome, userEmail, isAdminUser);
    }, []);

    const handleCadastro = useCallback(async (
        nome: string,
        email: string,
        senha: string,
        senhaConfirm: string,
        onSuccess: (nome: string, email: string, isAdmin: boolean) => void
    ) => {
        nome = nome.trim();
        email = email.trim();
        if (!nome) {
            setCadErro("Digite seu nome.");
            return;
        }
        if (!email || !email.includes("@")) {
            setCadErro("Digite um email válido.");
            return;
        }
        if (senha.length < 6) {
            setCadErro("Mínimo 6 caracteres.");
            return;
        }
        if (senha !== senhaConfirm) {
            setCadErro("Senhas não conferem.");
            return;
        }
        setCarregando(true);
        setCadErro("");
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error) {
            setCarregando(false);
            setCadErro(
                error.message === "User already registered" ? "Email já cadastrado." : error.message
            );
            return;
        }
        const { error: err2 } = await supabase
            .from("usuarios")
            .insert({ nome, email, pago: false, campeao_palpite: "" });
        setCarregando(false);
        if (err2) {
            setCadErro(err2.code === "23505" ? "Nome ou email já cadastrado." : "Erro ao criar conta.");
            return;
        }
        setEmailAtual(email);
        const isAdminUser = email === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);
        setCadNome("");
        setCadEmail("");
        setCadSenha("");
        setCadSenha2("");
        onSuccess(nome, email, isAdminUser);
    }, []);

    const handleEsqueceuSenha = useCallback(async (email: string, mostrarToast: (msg: string, tipo: "ok" | "err") => void) => {
        if (!email || !email.includes("@")) {
            mostrarToast("Digite um email válido", "err");
            return;
        }
        setCarregando(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo:
                typeof window !== "undefined" ? window.location.origin + "/reset-password" : "",
        });
        setCarregando(false);
        if (error) {
            mostrarToast("Erro ao enviar email", "err");
            return;
        }
        setEsqueceuSent(true);
    }, []);

    const handleLogout = useCallback(() => {
        supabase.auth.signOut();
        setUsuarioAtual(null);
        setEmailAtual(null);
        setIsAdmin(false);
        setTela("login");
        if (typeof window !== "undefined") localStorage.clear();
    }, []);

    return {
        // Estado
        tela,
        setTela,
        usuarioAtual,
        setUsuarioAtual,
        emailAtual,
        setEmailAtual,
        isAdmin,
        setIsAdmin,
        sessaoCarregando,
        setSessaoCarregando,
        carregando,
        setCarregando,
        // Login
        loginEmail,
        setLoginEmail,
        loginSenha,
        setLoginSenha,
        loginErro,
        setLoginErro,
        // Cadastro
        cadNome,
        setCadNome,
        cadEmail,
        setCadEmail,
        cadSenha,
        setCadSenha,
        cadSenha2,
        setCadSenha2,
        cadErro,
        setCadErro,
        // Esqueceu senha
        esqueceuEmail,
        setEsqueceuEmail,
        esqueceuSent,
        setEsqueceuSent,
        // Funções
        handleLogin,
        handleCadastro,
        handleEsqueceuSenha,
        handleLogout,
    };
}