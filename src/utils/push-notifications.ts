/**
 * Helper to show local notification (for dev)
 * @param {any} message
 */
const showLocalNotification = (message: any) => {
  const notification = new Notification(message.title, {
    body: message.body,
    icon: message.icon,
    // Removido: badge e actions (não suportados em TS padrão para Notification)
    requireInteraction: true,
    silent: false
  });

  // Handle notification clicks (já existe, mantém ações via onclick)
  notification.onclick = () => {
    notification.close();
    if (window.focus) {
      window.focus();
    }

    // Navigate based on action (usar tag ou lógica customizada)
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

// Stub functions to resolve compilation errors
export const subscribeToPush = async (userId: string): Promise<PushSubscription | null> => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY, // Ensure this is set in .env
      });
      // Send subscription to server (stub)
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      });
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  return null;
};

export const sendTestNotification = (type: string): void => {
  // Stub: Show local notification for testing
  const messages = {
    dailyReward: { title: 'Recompensa Diária!', body: 'Você ganhou 25 XP!' },
    newStory: { title: 'Nova História!', body: 'Descubra a nova aventura!' },
    mathChallenge: { title: 'Desafio de Matemática!', body: 'Tente o próximo nível!' },
    achievementUnlocked: { title: 'Conquista Desbloqueada!', body: 'Parabéns!' },
    reminder: { title: 'Lembrete!', body: 'Pratique hoje!' },
  };
  const message = messages[type as keyof typeof messages] || { title: 'Teste', body: 'Notificação de teste' };
  showLocalNotification({ ...message, tag: type });
};

export const clearSubscriptions = (): void => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    });
  }
  // Clear local storage if needed
  localStorage.removeItem('pushSubscriptions');
};

export const NOTIFICATION_MESSAGES = {
  dailyReward: {
    title: "🎁 Recompensa Diária!",
    body: "Você ganhou 25 XP por voltar ao Planeta Sorrisos hoje! Continue aprendendo!",
    actions: [{ action: 'view', title: 'Ver Progresso' }]
  },
  newStory: {
    title: "📚 Nova História Disponível!",
    body: "Descubra a aventura de 'A Cigarra e a Formiga' no nível fácil. Clique para ler!",
    actions: [{ action: 'read', title: 'Ler Agora' }]
  },
  mathChallenge: {
    title: "🧮 Desafio de Matemática!",
    body: "Você completou 5 exercícios! Tente o próximo nível para ganhar mais XP.",
    actions: [{ action: 'math', title: 'Praticar Mais' }]
  },
  achievementUnlocked: {
    title: "🏆 Conquista Desbloqueada!",
    body: "Parabéns! Você desbloqueou 'Leitor Iniciante'. Veja seu perfil!",
    actions: [{ action: 'profile', title: 'Ver Perfil' }]
  },
  reminder: {
    title: "🌟 Lembrete do Planeta Sorrisos",
    body: "Não esqueça de praticar leitura ou matemática hoje para manter sua sequência!",
    actions: []
  }
};

export const getStoredSubscriptions = (): any[] => {
  // Stub: Return empty array or load from localStorage if implemented
  return [];
};