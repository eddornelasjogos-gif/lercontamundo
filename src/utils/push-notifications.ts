"use client";

import { toast } from "sonner";

// Read VAPID public key from environment variable
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Validate VAPID key on load
if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY_HERE") {
  console.warn("VAPID_PUBLIC_KEY not set in .env! Push notifications will not work.");
}

// Convert VAPID public key to Uint8Array
const urlB64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Backend URL (ajuste para sua URL de produção)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Notification messages for different events
export const NOTIFICATION_MESSAGES = {
  dailyReward: {
    title: "🎁 Recompensa Diária!",
    body: "Você ganhou 25 XP por voltar ao Planeta Sorrisos hoje! Continue aprendendo!",
    icon: "/icons/mascot-panda-192.png",
    badge: "/icons/badge.png",
    actions: [
      {
        action: "view",
        title: "Ver Progresso",
        icon: "/icons/star.png"
      }
    ]
  },
  newStory: {
    title: "📚 Nova História Disponível!",
    body: "Descubra a aventura de 'A Cigarra e a Formiga' no nível fácil. Clique para ler!",
    icon: "/icons/book.png",
    badge: "/icons/book.png",
    actions: [
      {
        action: "read",
        title: "Ler Agora",
        icon: "/icons/book-open.png"
      }
    ]
  },
  mathChallenge: {
    title: "🧮 Desafio de Matemática!",
    body: "Você completou 5 exercícios! Tente o próximo nível para ganhar mais XP.",
    icon: "/icons/calculator.png",
    badge: "/icons/calculator.png",
    actions: [
      {
        action: "math",
        title: "Praticar Mais",
        icon: "/icons/calculator.png"
      }
    ]
  },
  achievementUnlocked: {
    title: "🏆 Conquista Desbloqueada!",
    body: "Parabéns! Você desbloqueou 'Leitor Iniciante'. Veja seu perfil!",
    icon: "/icons/trophy.png",
    badge: "/icons/trophy.png",
    actions: [
      {
        action: "profile",
        title: "Ver Perfil",
        icon: "/icons/user.png"
      }
    ]
  },
  reminder: {
    title: "🌟 Lembrete do Planeta Sorrisos",
    body: "Não esqueça de praticar leitura ou matemática hoje para manter sua sequência!",
    icon: "/icons/mascot-panda-192.png",
    badge: "/icons/star.png",
    actions: []
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    toast.error("Este navegador não suporta notificações.");
    return "denied";
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    toast.success("Notificações ativadas! Você receberá lembretes e atualizações.");
  } else {
    toast.warning("Notificações não foram ativadas. Você pode ativá-las nas configurações do navegador.");
  }
  return permission;
};

// Subscribe to push notifications and send to backend
export const subscribeToPush = async (userId: string): Promise<PushSubscription | null> => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    toast.error("Push notifications não são suportadas neste navegador.");
    return null;
  }

  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY_HERE") {
    toast.error("Chave VAPID não configurada! Configure VITE_VAPID_PUBLIC_KEY no .env.");
    return null;
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Store subscription in localStorage
    const subscriptions = JSON.parse(localStorage.getItem("pushSubscriptions") || "[]");
    subscriptions.push({
      userId,
      subscription: subscription.toJSON(),
      timestamp: Date.now()
    });
    localStorage.setItem("pushSubscriptions", JSON.stringify(subscriptions));

    // Send subscription to backend
    try {
      const response = await fetch(`${BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription: subscription.toJSON() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Subscription sent to server:', result);
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      toast.warning("Subscrição salva localmente, mas falha ao enviar para o servidor. Notificações podem não funcionar completamente.");
    }

    toast.success("Inscrito para notificações push!");
    return subscription;
  } catch (error) {
    console.error("Subscription error:", error);
    toast.error(`Erro ao se inscrever: ${error.message || 'Falha desconhecida'}`);
    return null;
  }
};

// Function to send a test notification (for demo purposes, simulates a push or sends to backend)
export const sendTestNotification = async (messageType: keyof typeof NOTIFICATION_MESSAGES, useBackend = false) => {
  if (!("Notification" in window)) {
    toast.error("Notificações não suportadas.");
    return;
  }

  const permission = Notification.permission;
  if (permission === "granted") {
    const message = NOTIFICATION_MESSAGES[messageType];
    
    if (useBackend) {
      // Send to backend for real push (production)
      try {
        const response = await fetch(`${BACKEND_URL}/api/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: `user_${Date.now()}`, type: messageType })
        });

        if (response.ok) {
          toast.success("Notificação enviada para o servidor!");
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to send via backend:', error);
        toast.error("Falha ao enviar via servidor. Usando notificação local.");
        // Fallback to local notification
        showLocalNotification(message);
      }
    } else {
      // Local notification for dev/testing
      showLocalNotification(message);
    }
  } else {
    toast.warning("Ative as notificações para testar!");
  }
};

// Helper to show local notification (for dev)
const showLocalNotification = (message: any) => {
  const notification = new Notification(message.title, {
    body: message.body,
    icon: message.icon,
    badge: message.badge,
    actions: message.actions,
    requireInteraction: true,
    silent: false
  });

  // Handle notification clicks
  notification.onclick = () => {
    notification.close();
    if (window.focus) {
      window.focus();
    }

    // Navigate based on action
    if (notification.tag === "view") {
      window.location.href = "/profile";
    } else if (notification.tag === "read") {
      window.location.href = "/reading";
    } else if (notification.tag === "math") {
      window.location.href = "/math";
    } else if (notification.tag === "profile") {
      window.location.href = "/profile";
    }
  };

  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10000);
};

// Get stored subscriptions
export const getStoredSubscriptions = (): Array<{ userId: string; subscription: PushSubscriptionJSON; timestamp: number }> => {
  return JSON.parse(localStorage.getItem("pushSubscriptions") || "[]");
};

// Clear subscriptions (for testing)
export const clearSubscriptions = () => {
  localStorage.removeItem("pushSubscriptions");
  toast.info("Assinaturas de push removidas.");
};