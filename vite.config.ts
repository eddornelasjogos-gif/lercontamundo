import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
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
        orientation: "portrait",
        background_color: "#FFF8E1",
        theme_color: "#FFB300",
        description: "Um mundo de diversão, aprendizado e alegria para as crianças no Planeta Sorrisos!",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/mascot-owl-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
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