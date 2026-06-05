import { useState, useCallback } from "react";

export function useNotificacoes() {
    const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);
    const [confetis, setConfetis] = useState<any[]>([]);

    const mostrarToast = useCallback((msg: string, tipo: "ok" | "err" = "ok") => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 2500);
    }, []);

    const dispararConfete = useCallback(() => {
        const em = ["🎉", "⭐", "🏆", "✨", "🎊", "⚽", "🥇"];
        setConfetis(
            Array.from({ length: 10 }, (_, i) => ({
                id: Date.now() + i,
                e: em[i % em.length],
                l: `${10 + Math.random() * 80}%`,
                d: `${Math.random() * 0.4}s`,
            }))
        );
        setTimeout(() => setConfetis([]), 1500);
    }, []);

    return {
        toast,
        setToast,
        confetis,
        setConfetis,
        mostrarToast,
        dispararConfete,
    };
}