import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAIL } from "@/lib/constantes";
import type { Tela } from "@/lib/types";

export function useAuthState() {
    const [tela, setTela] = useState<Tela>("login");
    const [usuarioAtual, setUsuarioAtual] = useState<string | null>(null);
    const [emailAtual, setEmailAtual] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sessaoCarregando, setSessaoCarregando] = useState(true);

    // Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginSenha, setLoginSenha] = useState("");
    const [loginErro, setLoginErro] = useState("");

    // Cadastro
    const [cadNome, setCadNome] = useState("");
    const [cadEmail, setCadEmail] = useState("");
    const [cadSenha, setCadSenha] = useState("");
    const [cadSenha2, setCadSenha2] = useState("");
    const [cadErro, setCadErro] = useState("");

    // Esqueceu senha
    const [esqueceuEmail, setEsqueceuEmail] = useState("");
    const [esqueceuSent, setEsqueceuSent] = useState(false);

    const [carregando, setCarregando] = useState(false);

    const handleLogout = useCallback(() => {
        supabase.auth.signOut();
        setUsuarioAtual(null);
        setEmailAtual(null);
        setIsAdmin(false);
        setTela("login");
        if (typeof window !== "undefined") localStorage.clear();
    }, []);

    return {
        // Tela
        tela,
        setTela,
        sessaoCarregando,
        setSessaoCarregando,
        // User
        usuarioAtual,
        setUsuarioAtual,
        emailAtual,
        setEmailAtual,
        isAdmin,
        setIsAdmin,
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
        // Esqueceu
        esqueceuEmail,
        setEsqueceuEmail,
        esqueceuSent,
        setEsqueceuSent,
        // Funcs
        carregando,
        setCarregando,
        handleLogout,
    };
}