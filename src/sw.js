/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and reference it in your sw.js file.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Start serving your content in an
 * HTTP server and customize the Web Workbox service worker by adding or modifying
 * the following lines.
 */

// Check if the service worker is already registered
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('SW registered: ', registration);
    }, function(err) {
      console.log('SW registration failed: ', err);
    });
  });
}

// Handle push events
self.addEventListener('push', function(event) {
  console.log('Push received: ', event);

  // Parse the push data (assuming JSON payload from server)
  let data;
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Could not parse push data', e);
    data = {};
  }

  const title = data.title || 'Planeta Sorrisos';
  const options = {
    body: data.body || 'Você tem uma nova mensagem!',
    icon: '/icons/mascot-panda-192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100], // Vibration pattern for mobile
    data: {
      url: data.url || '/',
      action: data.action || 'view'
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver Agora',
        icon: '/icons/star.png'
      }
    ],
    requireInteraction: true, // Keep notification open until user interacts
    silent: false,
    tag: data.tag || 'default' // To avoid duplicate notifications
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked: ', event);

  const notification = event.notification;
  const action = event.action || 'view';

  // Close the notification
  notification.close();

  // Focus the client (open the app)
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      let client;
      if (clientList.length > 0) {
        client = clientList[0];
        // Focus the client if it's open
        client.focus();
      } else {
        // Open a new window if none is open
        clients.openWindow('/');
      }

      // Handle specific actions
      if (action === 'view') {
        // Navigate to profile or specific page
        client.postMessage({
          type: 'navigate',
          path: '/profile'
        });
      } else if (action === 'read') {
        client.postMessage({
          type: 'navigate',
          path: '/reading'
        });
      } else if (action === 'math') {
        client.postMessage({
          type: 'navigate',
          path: '/math'
        });
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed: ', event);
  // Optional: Track notification close events
});

// Handle sync events (for background sync if needed)
self.addEventListener('sync', function(event) {
  if (event.tag === 'daily-reward-sync') {
    event.waitUntil(
      // Simulate daily reward sync
      clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({
            type: 'daily-reward',
            message: 'Recompensa diária sincronizada!'
          });
        });
      })
    );
  }
});

// Extend the default Workbox logic here if needed
// (The default Workbox code would go here, but since it's generated, this SW focuses on push handling)