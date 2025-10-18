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