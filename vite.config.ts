import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Adiciona a configuração do VitePWA
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // MUDANÇA: Usar injectManifest para Service Worker customizado
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      workbox: {
        // Aumenta o limite de tamanho de arquivo para 5 MiB (5 * 1024 * 1024 bytes)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Cache de todos os ativos estáticos (JS, CSS, HTML, Imagens, Áudios)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,m4a,mp3,woff,woff2,ttf,otf}'],
        // Estratégia de cache para ativos dinâmicos (imagens e áudios)
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image' || request.destination === 'audio',
            handler: 'CacheFirst',
            options: {
              cacheName: 'asset-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
        ],
      },
      manifest: {
        name: "Planeta Sorrisos",
        short_name: "Sorrisos",
        start_url: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "portrait",
        background_color: "#FFF8E1",
        theme_color: "#FFB300",
        description: "Um mundo de diversão, aprendizado e alegria para as crianças no Planeta Sorrisos!",
        dir: "ltr",
        prefer_related_applications: false,
        related_applications: [
          {
            platform: "play",
            url: "https://play.google.com/store/apps/details?id=com.example.app",
            id: "com.example.app" // Substitua pelo ID real do seu app Android
          },
          {
            platform: "itunes",
            url: "https://itunes.apple.com/app/example-app/id123456789"
          }
        ],
        iarc_rating_id: "9a5e3e64-4d4a-4e3a-8e6f-5b9d6c8d7a4f", // Substitua pelo ID IARC real
        icons: [
          {
            src: "/icons/mascot-panda-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/mascot-panda-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Começar Leitura",
            short_name: "Leitura",
            description: "Acesse as histórias e fábulas.",
            url: "/reading",
            icons: [{ src: "/icons/mascot-panda-192.png", sizes: "192x192" }]
          },
          {
            name: "Praticar Matemática",
            short_name: "Matemática",
            description: "Inicie um desafio de matemática.",
            url: "/math",
            icons: [{ src: "/icons/mascot-panda-192.png", sizes: "192x192" }]
          },
          {
            name: "Jogar Divide.io",
            short_name: "Jogos",
            description: "Jogue o Divide.io e suba no placar.",
            url: "/games",
            icons: [{ src: "/icons/mascot-panda-192.png", sizes: "192x192" }]
          }
        ],
        screenshots: [
          {
            src: "/screenshots/screenshot-00.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Tela inicial de seleção de nível."
          },
          {
            src: "/screenshots/screenshot-01.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu de seleção de nível de leitura."
          },
          {
            src: "/screenshots/screenshot-02.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu de categorias de histórias."
          },
          {
            src: "/screenshots/screenshot-03.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Visualização de uma história com imagem e áudio."
          },
          {
            src: "/screenshots/screenshot-04.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Conteúdo da história e navegação."
          },
          {
            src: "/screenshots/screenshot-05.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu principal da área de matemática."
          },
          {
            src: "/screenshots/screenshot-06.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Tela de jogo de matemática com barra de progresso."
          },
          {
            src: "/screenshots/screenshot-07.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu principal do jogo Divide.io."
          },
          {
            src: "/screenshots/screenshot-08.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Gameplay do jogo Divide.io com placar."
          },
          {
            src: "/screenshots/screenshot-09.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Tela de perfil e progresso de nível."
          },
          {
            src: "/screenshots/screenshot-10.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Estatísticas de leitura, exercícios e sequência de dias."
          },
          {
            src: "/screenshots/screenshot-11.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Visualização das próximas conquistas."
          },
          {
            src: "/screenshots/screenshot-12.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Opção de resetar o progresso."
          },
          // Adicionando as capturas de tela 'narrow' (duplicando as existentes)
          {
            src: "/screenshots/screenshot-00.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Tela inicial de seleção de nível."
          },
          {
            src: "/screenshots/screenshot-01.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu de seleção de nível de leitura."
          },
          {
            src: "/screenshots/screenshot-02.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu de categorias de histórias."
          },
          {
            src: "/screenshots/screenshot-03.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Visualização de uma história com imagem e áudio."
          },
          {
            src: "/screenshots/screenshot-04.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Conteúdo da história e navegação."
          },
          {
            src: "/screenshots/screenshot-05.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu principal da área de matemática."
          },
          {
            src: "/screenshots/screenshot-06.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Tela de jogo de matemática com barra de progresso."
          },
          {
            src: "/screenshots/screenshot-07.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu principal do jogo Divide.io."
          },
          {
            src: "/screenshots/screenshot-08.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Gameplay do jogo Divide.io com placar."
          },
          {
            src: "/screenshots/screenshot-09.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Tela de perfil e progresso de nível."
          },
          {
            src: "/screenshots/screenshot-10.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Estatísticas de leitura, exercícios e sequência de dias."
          },
          {
            src: "/screenshots/screenshot-11.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Visualização das próximas conquistas."
          },
          {
            src: "/screenshots/screenshot-12.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Opção de resetar o progresso."
          }
        ],
        lang: "pt-BR",
        scope: "/",
        id: "/",
        categories: ["education", "kids", "entertainment"]
      },
      devOptions: {
        enabled: mode === 'development',
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));