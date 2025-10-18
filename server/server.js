const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../dist')); // Serve o app frontend

// VAPID Keys (use as mesmas do .env do frontend, mas com a privada aqui)
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VITE_VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('VAPID keys must be set in environment variables!');
  process.exit(1);
}

// Configure web-push
webpush.setVapidDetails(
  'mailto:seu-email@example.com', // Substitua pelo seu email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Armazenamento simples de subscrições (use um banco como MongoDB em produção)
let subscriptions = [];

// Endpoint para receber subscrições do frontend
app.post('/api/subscribe', (req, res) => {
  const { userId, subscription } = req.body;

  if (!subscription || !userId) {
    return res.status(400).json({ error: 'Subscription and userId are required' });
  }

  // Remove subscrições antigas do mesmo usuário
  subscriptions = subscriptions.filter(sub => sub.userId !== userId);
  subscriptions.push({ userId, subscription });

  console.log(`New subscription for user: ${userId}`);
  res.status(201).json({ success: true, message: 'Subscription saved' });
});

// Endpoint para enviar notificação de teste
app.post('/api/send-notification', (req, res) => {
  const { userId, type } = req.body; // type: 'dailyReward', 'newStory', etc.

  if (!userId || !type) {
    return res.status(400).json({ error: 'userId and type are required' });
  }

  const subscription = subscriptions.find(sub => sub.userId === userId);
  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Mensagens pré-definidas (mesmas do frontend)
  const messages = {
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

  const payload = JSON.stringify({
    title: messages[type]?.title || 'Nova Notificação!',
    body: messages[type]?.body || 'Você tem uma nova mensagem!',
    icon: '/icons/mascot-panda-192.png',
    actions: messages[type]?.actions || [{ action: 'view', title: 'Abrir App' }],
    tag: type
  });

  webpush.sendNotification(subscription.subscription, payload)
    .then(() => {
      console.log(`Notification sent to ${userId}`);
      res.json({ success: true, message: 'Notification sent' });
    })
    .catch(error => {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    });
});

// Endpoint para listar subscrições (para debug)
app.get('/api/subscriptions', (req, res) => {
  res.json({ subscriptions: subscriptions.map(s => ({ userId: s.userId, timestamp: s.subscription.timestamp })) });
});

// Inicie o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('VAPID Public Key:', VAPID_PUBLIC_KEY);
});