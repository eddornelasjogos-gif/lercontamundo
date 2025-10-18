// vite.config.ts
import { defineConfig } from "file:///C:/Users/Ed/dyad-apps/learn-count-world-main/node_modules/.pnpm/vite@5.4.20_@types+node@22.18.10_terser@5.44.0/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Ed/dyad-apps/learn-count-world-main/node_modules/.pnpm/@vitejs+plugin-react-swc@3._19f1cd5594f0ad066bdac13963a5ef2c/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Ed/dyad-apps/learn-count-world-main/node_modules/.pnpm/lovable-tagger@1.1.11_vite@_28495e62cdcd9e878039fb8ad7ae1c68/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///C:/Users/Ed/dyad-apps/learn-count-world-main/node_modules/.pnpm/vite-plugin-pwa@1.1.0_vite@_6d492e8ef474f396a453a5203375699e/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Ed\\dyad-apps\\learn-count-world-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Adiciona a configuração do VitePWA
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // Aumenta o limite de tamanho de arquivo para 5 MiB (5 * 1024 * 1024 bytes)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Cache de todos os ativos estáticos (JS, CSS, HTML, Imagens, Áudios)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,m4a,mp3,woff,woff2,ttf,otf}"],
        // Estratégia de cache para ativos dinâmicos (imagens e áudios)
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image" || request.destination === "audio",
            handler: "CacheFirst",
            options: {
              cacheName: "asset-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 dias
              }
            }
          }
        ]
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
        description: "Um mundo de divers\xE3o, aprendizado e alegria para as crian\xE7as no Planeta Sorrisos!",
        dir: "ltr",
        prefer_related_applications: false,
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
            name: "Come\xE7ar Leitura",
            short_name: "Leitura",
            description: "Acesse as hist\xF3rias e f\xE1bulas.",
            url: "/reading",
            icons: [{ src: "/icons/mascot-panda-192.png", sizes: "192x192" }]
          },
          {
            name: "Praticar Matem\xE1tica",
            short_name: "Matem\xE1tica",
            description: "Inicie um desafio de matem\xE1tica.",
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
            label: "Tela inicial de sele\xE7\xE3o de n\xEDvel."
          },
          {
            src: "/screenshots/screenshot-01.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu de sele\xE7\xE3o de n\xEDvel de leitura."
          },
          {
            src: "/screenshots/screenshot-02.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu de categorias de hist\xF3rias."
          },
          {
            src: "/screenshots/screenshot-03.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Visualiza\xE7\xE3o de uma hist\xF3ria com imagem e \xE1udio."
          },
          {
            src: "/screenshots/screenshot-04.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Conte\xFAdo da hist\xF3ria e navega\xE7\xE3o."
          },
          {
            src: "/screenshots/screenshot-05.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Menu principal da \xE1rea de matem\xE1tica."
          },
          {
            src: "/screenshots/screenshot-06.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Tela de jogo de matem\xE1tica com barra de progresso."
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
            label: "Tela de perfil e progresso de n\xEDvel."
          },
          {
            src: "/screenshots/screenshot-10.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Estat\xEDsticas de leitura, exerc\xEDcios e sequ\xEAncia de dias."
          },
          {
            src: "/screenshots/screenshot-11.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Visualiza\xE7\xE3o das pr\xF3ximas conquistas."
          },
          {
            src: "/screenshots/screenshot-12.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "wide",
            label: "Op\xE7\xE3o de resetar o progresso."
          },
          // Adicionando as capturas de tela 'narrow' (duplicando as existentes)
          {
            src: "/screenshots/screenshot-00.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Tela inicial de sele\xE7\xE3o de n\xEDvel."
          },
          {
            src: "/screenshots/screenshot-01.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu de sele\xE7\xE3o de n\xEDvel de leitura."
          },
          {
            src: "/screenshots/screenshot-02.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu de categorias de hist\xF3rias."
          },
          {
            src: "/screenshots/screenshot-03.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Visualiza\xE7\xE3o de uma hist\xF3ria com imagem e \xE1udio."
          },
          {
            src: "/screenshots/screenshot-04.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Conte\xFAdo da hist\xF3ria e navega\xE7\xE3o."
          },
          {
            src: "/screenshots/screenshot-05.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Menu principal da \xE1rea de matem\xE1tica."
          },
          {
            src: "/screenshots/screenshot-06.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Tela de jogo de matem\xE1tica com barra de progresso."
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
            label: "Tela de perfil e progresso de n\xEDvel."
          },
          {
            src: "/screenshots/screenshot-10.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Estat\xEDsticas de leitura, exerc\xEDcios e sequ\xEAncia de dias."
          },
          {
            src: "/screenshots/screenshot-11.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Visualiza\xE7\xE3o das pr\xF3ximas conquistas."
          },
          {
            src: "/screenshots/screenshot-12.jpeg",
            sizes: "1080x2340",
            type: "image/jpeg",
            platform: "narrow",
            label: "Op\xE7\xE3o de resetar o progresso."
          }
        ],
        lang: "pt-BR",
        scope: "/",
        id: "/",
        categories: ["education", "kids", "entertainment"]
      },
      devOptions: {
        enabled: mode === "development"
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFZFxcXFxkeWFkLWFwcHNcXFxcbGVhcm4tY291bnQtd29ybGQtbWFpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcRWRcXFxcZHlhZC1hcHBzXFxcXGxlYXJuLWNvdW50LXdvcmxkLW1haW5cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0VkL2R5YWQtYXBwcy9sZWFybi1jb3VudC13b3JsZC1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksIFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBBZGljaW9uYSBhIGNvbmZpZ3VyYVx1MDBFN1x1MDBFM28gZG8gVml0ZVBXQVxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmplY3RSZWdpc3RlcjogJ2F1dG8nLFxuICAgICAgd29ya2JveDoge1xuICAgICAgICAvLyBBdW1lbnRhIG8gbGltaXRlIGRlIHRhbWFuaG8gZGUgYXJxdWl2byBwYXJhIDUgTWlCICg1ICogMTAyNCAqIDEwMjQgYnl0ZXMpXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXG4gICAgICAgIC8vIENhY2hlIGRlIHRvZG9zIG9zIGF0aXZvcyBlc3RcdTAwRTF0aWNvcyAoSlMsIENTUywgSFRNTCwgSW1hZ2VucywgXHUwMEMxdWRpb3MpXG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2ZyxqcGcsanBlZyx3ZWJwLG00YSxtcDMsd29mZix3b2ZmMix0dGYsb3RmfSddLFxuICAgICAgICAvLyBFc3RyYXRcdTAwRTlnaWEgZGUgY2FjaGUgcGFyYSBhdGl2b3MgZGluXHUwMEUybWljb3MgKGltYWdlbnMgZSBcdTAwRTF1ZGlvcylcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAoeyByZXF1ZXN0IH0pID0+IHJlcXVlc3QuZGVzdGluYXRpb24gPT09ICdpbWFnZScgfHwgcmVxdWVzdC5kZXN0aW5hdGlvbiA9PT0gJ2F1ZGlvJyxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnYXNzZXQtY2FjaGUnLFxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogNTAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzAsIC8vIDMwIGRpYXNcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiBcIlBsYW5ldGEgU29ycmlzb3NcIixcbiAgICAgICAgc2hvcnRfbmFtZTogXCJTb3JyaXNvc1wiLFxuICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxuICAgICAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcbiAgICAgICAgZGlzcGxheV9vdmVycmlkZTogW1wic3RhbmRhbG9uZVwiLCBcIm1pbmltYWwtdWlcIl0sXG4gICAgICAgIG9yaWVudGF0aW9uOiBcInBvcnRyYWl0XCIsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiI0ZGRjhFMVwiLFxuICAgICAgICB0aGVtZV9jb2xvcjogXCIjRkZCMzAwXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVtIG11bmRvIGRlIGRpdmVyc1x1MDBFM28sIGFwcmVuZGl6YWRvIGUgYWxlZ3JpYSBwYXJhIGFzIGNyaWFuXHUwMEU3YXMgbm8gUGxhbmV0YSBTb3JyaXNvcyFcIixcbiAgICAgICAgZGlyOiBcImx0clwiLFxuICAgICAgICBwcmVmZXJfcmVsYXRlZF9hcHBsaWNhdGlvbnM6IGZhbHNlLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvaWNvbnMvbWFzY290LXBhbmRhLTE5Mi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICBwdXJwb3NlOiBcImFueSBtYXNrYWJsZVwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL2ljb25zL21hc2NvdC1wYW5kYS01MTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgcHVycG9zZTogXCJhbnkgbWFza2FibGVcIlxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgc2hvcnRjdXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJDb21lXHUwMEU3YXIgTGVpdHVyYVwiLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogXCJMZWl0dXJhXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJBY2Vzc2UgYXMgaGlzdFx1MDBGM3JpYXMgZSBmXHUwMEUxYnVsYXMuXCIsXG4gICAgICAgICAgICB1cmw6IFwiL3JlYWRpbmdcIixcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6IFwiL2ljb25zL21hc2NvdC1wYW5kYS0xOTIucG5nXCIsIHNpemVzOiBcIjE5MngxOTJcIiB9XVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJQcmF0aWNhciBNYXRlbVx1MDBFMXRpY2FcIixcbiAgICAgICAgICAgIHNob3J0X25hbWU6IFwiTWF0ZW1cdTAwRTF0aWNhXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJJbmljaWUgdW0gZGVzYWZpbyBkZSBtYXRlbVx1MDBFMXRpY2EuXCIsXG4gICAgICAgICAgICB1cmw6IFwiL21hdGhcIixcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6IFwiL2ljb25zL21hc2NvdC1wYW5kYS0xOTIucG5nXCIsIHNpemVzOiBcIjE5MngxOTJcIiB9XVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJKb2dhciBEaXZpZGUuaW9cIixcbiAgICAgICAgICAgIHNob3J0X25hbWU6IFwiSm9nb3NcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkpvZ3VlIG8gRGl2aWRlLmlvIGUgc3ViYSBubyBwbGFjYXIuXCIsXG4gICAgICAgICAgICB1cmw6IFwiL2dhbWVzXCIsXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiBcIi9pY29ucy9tYXNjb3QtcGFuZGEtMTkyLnBuZ1wiLCBzaXplczogXCIxOTJ4MTkyXCIgfV1cbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHNjcmVlbnNob3RzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTAwLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJ3aWRlXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJUZWxhIGluaWNpYWwgZGUgc2VsZVx1MDBFN1x1MDBFM28gZGUgblx1MDBFRHZlbC5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTAxLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJ3aWRlXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJNZW51IGRlIHNlbGVcdTAwRTdcdTAwRTNvIGRlIG5cdTAwRUR2ZWwgZGUgbGVpdHVyYS5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTAyLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJ3aWRlXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJNZW51IGRlIGNhdGVnb3JpYXMgZGUgaGlzdFx1MDBGM3JpYXMuXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0wMy5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwid2lkZVwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiVmlzdWFsaXphXHUwMEU3XHUwMEUzbyBkZSB1bWEgaGlzdFx1MDBGM3JpYSBjb20gaW1hZ2VtIGUgXHUwMEUxdWRpby5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTA0LmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJ3aWRlXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJDb250ZVx1MDBGQWRvIGRhIGhpc3RcdTAwRjNyaWEgZSBuYXZlZ2FcdTAwRTdcdTAwRTNvLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDUuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIndpZGVcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIk1lbnUgcHJpbmNpcGFsIGRhIFx1MDBFMXJlYSBkZSBtYXRlbVx1MDBFMXRpY2EuXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0wNi5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwid2lkZVwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiVGVsYSBkZSBqb2dvIGRlIG1hdGVtXHUwMEUxdGljYSBjb20gYmFycmEgZGUgcHJvZ3Jlc3NvLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDcuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIndpZGVcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIk1lbnUgcHJpbmNpcGFsIGRvIGpvZ28gRGl2aWRlLmlvLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDguanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIndpZGVcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIkdhbWVwbGF5IGRvIGpvZ28gRGl2aWRlLmlvIGNvbSBwbGFjYXIuXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0wOS5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwid2lkZVwiLFxuICAgICAgICAgICAgbGFiZWw6IFwiVGVsYSBkZSBwZXJmaWwgZSBwcm9ncmVzc28gZGUgblx1MDBFRHZlbC5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTEwLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJ3aWRlXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJFc3RhdFx1MDBFRHN0aWNhcyBkZSBsZWl0dXJhLCBleGVyY1x1MDBFRGNpb3MgZSBzZXF1XHUwMEVBbmNpYSBkZSBkaWFzLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMTEuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIndpZGVcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIlZpc3VhbGl6YVx1MDBFN1x1MDBFM28gZGFzIHByXHUwMEYzeGltYXMgY29ucXVpc3Rhcy5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTEyLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJ3aWRlXCIsXG4gICAgICAgICAgICBsYWJlbDogXCJPcFx1MDBFN1x1MDBFM28gZGUgcmVzZXRhciBvIHByb2dyZXNzby5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gQWRpY2lvbmFuZG8gYXMgY2FwdHVyYXMgZGUgdGVsYSAnbmFycm93JyAoZHVwbGljYW5kbyBhcyBleGlzdGVudGVzKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0wMC5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwibmFycm93XCIsXG4gICAgICAgICAgICBsYWJlbDogXCJUZWxhIGluaWNpYWwgZGUgc2VsZVx1MDBFN1x1MDBFM28gZGUgblx1MDBFRHZlbC5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTAxLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJuYXJyb3dcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIk1lbnUgZGUgc2VsZVx1MDBFN1x1MDBFM28gZGUgblx1MDBFRHZlbCBkZSBsZWl0dXJhLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDIuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIm5hcnJvd1wiLFxuICAgICAgICAgICAgbGFiZWw6IFwiTWVudSBkZSBjYXRlZ29yaWFzIGRlIGhpc3RcdTAwRjNyaWFzLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDMuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIm5hcnJvd1wiLFxuICAgICAgICAgICAgbGFiZWw6IFwiVmlzdWFsaXphXHUwMEU3XHUwMEUzbyBkZSB1bWEgaGlzdFx1MDBGM3JpYSBjb20gaW1hZ2VtIGUgXHUwMEUxdWRpby5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTA0LmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJuYXJyb3dcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIkNvbnRlXHUwMEZBZG8gZGEgaGlzdFx1MDBGM3JpYSBlIG5hdmVnYVx1MDBFN1x1MDBFM28uXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0wNS5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwibmFycm93XCIsXG4gICAgICAgICAgICBsYWJlbDogXCJNZW51IHByaW5jaXBhbCBkYSBcdTAwRTFyZWEgZGUgbWF0ZW1cdTAwRTF0aWNhLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDYuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIm5hcnJvd1wiLFxuICAgICAgICAgICAgbGFiZWw6IFwiVGVsYSBkZSBqb2dvIGRlIG1hdGVtXHUwMEUxdGljYSBjb20gYmFycmEgZGUgcHJvZ3Jlc3NvLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDcuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIm5hcnJvd1wiLFxuICAgICAgICAgICAgbGFiZWw6IFwiTWVudSBwcmluY2lwYWwgZG8gam9nbyBEaXZpZGUuaW8uXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0wOC5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwibmFycm93XCIsXG4gICAgICAgICAgICBsYWJlbDogXCJHYW1lcGxheSBkbyBqb2dvIERpdmlkZS5pbyBjb20gcGxhY2FyLlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL3NjcmVlbnNob3RzL3NjcmVlbnNob3QtMDkuanBlZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTA4MHgyMzQwXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL2pwZWdcIixcbiAgICAgICAgICAgIHBsYXRmb3JtOiBcIm5hcnJvd1wiLFxuICAgICAgICAgICAgbGFiZWw6IFwiVGVsYSBkZSBwZXJmaWwgZSBwcm9ncmVzc28gZGUgblx1MDBFRHZlbC5cIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9zY3JlZW5zaG90cy9zY3JlZW5zaG90LTEwLmpwZWdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjEwODB4MjM0MFwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9qcGVnXCIsXG4gICAgICAgICAgICBwbGF0Zm9ybTogXCJuYXJyb3dcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIkVzdGF0XHUwMEVEc3RpY2FzIGRlIGxlaXR1cmEsIGV4ZXJjXHUwMEVEY2lvcyBlIHNlcXVcdTAwRUFuY2lhIGRlIGRpYXMuXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0xMS5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwibmFycm93XCIsXG4gICAgICAgICAgICBsYWJlbDogXCJWaXN1YWxpemFcdTAwRTdcdTAwRTNvIGRhcyBwclx1MDBGM3hpbWFzIGNvbnF1aXN0YXMuXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvc2NyZWVuc2hvdHMvc2NyZWVuc2hvdC0xMi5qcGVnXCIsXG4gICAgICAgICAgICBzaXplczogXCIxMDgweDIzNDBcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvanBlZ1wiLFxuICAgICAgICAgICAgcGxhdGZvcm06IFwibmFycm93XCIsXG4gICAgICAgICAgICBsYWJlbDogXCJPcFx1MDBFN1x1MDBFM28gZGUgcmVzZXRhciBvIHByb2dyZXNzby5cIlxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgbGFuZzogXCJwdC1CUlwiLFxuICAgICAgICBzY29wZTogXCIvXCIsXG4gICAgICAgIGlkOiBcIi9cIixcbiAgICAgICAgY2F0ZWdvcmllczogW1wiZWR1Y2F0aW9uXCIsIFwia2lkc1wiLCBcImVudGVydGFpbm1lbnRcIl1cbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1UsU0FBUyxvQkFBb0I7QUFDN1YsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUE7QUFBQSxJQUUxQyxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxnQkFBZ0I7QUFBQSxNQUNoQixTQUFTO0FBQUE7QUFBQSxRQUVQLCtCQUErQixJQUFJLE9BQU87QUFBQTtBQUFBLFFBRTFDLGNBQWMsQ0FBQyx5RUFBeUU7QUFBQTtBQUFBLFFBRXhGLGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQSxZQUNFLFlBQVksQ0FBQyxFQUFFLFFBQVEsTUFBTSxRQUFRLGdCQUFnQixXQUFXLFFBQVEsZ0JBQWdCO0FBQUEsWUFDeEYsU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxjQUNoQztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULGtCQUFrQixDQUFDLGNBQWMsWUFBWTtBQUFBLFFBQzdDLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLEtBQUs7QUFBQSxRQUNMLDZCQUE2QjtBQUFBLFFBQzdCLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLFFBQ0EsV0FBVztBQUFBLFVBQ1Q7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFlBQVk7QUFBQSxZQUNaLGFBQWE7QUFBQSxZQUNiLEtBQUs7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUssK0JBQStCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDbEU7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPLENBQUMsRUFBRSxLQUFLLCtCQUErQixPQUFPLFVBQVUsQ0FBQztBQUFBLFVBQ2xFO0FBQUEsVUFDQTtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sWUFBWTtBQUFBLFlBQ1osYUFBYTtBQUFBLFlBQ2IsS0FBSztBQUFBLFlBQ0wsT0FBTyxDQUFDLEVBQUUsS0FBSywrQkFBK0IsT0FBTyxVQUFVLENBQUM7QUFBQSxVQUNsRTtBQUFBLFFBQ0Y7QUFBQSxRQUNBLGFBQWE7QUFBQSxVQUNYO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBO0FBQUEsVUFFQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixVQUFVO0FBQUEsWUFDVixPQUFPO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsUUFDQSxNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsUUFDUCxJQUFJO0FBQUEsUUFDSixZQUFZLENBQUMsYUFBYSxRQUFRLGVBQWU7QUFBQSxNQUNuRDtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUyxTQUFTO0FBQUEsTUFDcEI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
