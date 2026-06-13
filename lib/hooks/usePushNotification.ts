import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function usePushNotification(usuarioAtual: string | null) {
  const [permissao, setPermissao] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermissao(Notification.permission);
    }
  }, []);

  async function ativarNotificacoes() {
    if (!usuarioAtual) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Seu navegador não suporta notificações push.");
      return;
    }

    const perm = await Notification.requestPermission();
    setPermissao(perm);
    if (perm !== "granted") return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    });

    await supabase.from("push_subscriptions").upsert({
      usuario_nome: usuarioAtual,
      subscription: sub.toJSON(),
    }, {
      onConflict: "usuario_nome"
    });
  }

  return { permissao, ativarNotificacoes };
}