import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProgressProvider } from "@/contexts/ProgressContext";
import Index from "./pages/Index";
import Reading from "./pages/Reading";
import Math from "./pages/Math";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Story from "./pages/Story";
import ScrollToTop from "./components/ScrollToTop";
import Games from "./pages/Games";
import MathReports from "./pages/MathReports";
import { Navigation } from "./components/Navigation";

const queryClient = new QueryClient();

// Componente Wrapper para a navegação
const NavigationWrapper = () => {
  const location = useLocation();
  
  // A página Math.tsx gerencia seu próprio estado de bloqueio e renderiza a Navigation.
  // A página Games.tsx gerencia a exibição da navegação com base no status do jogo.
  // Se a rota for /math ou /games, a Navigation é renderizada DENTRO da página.
  
  if (location.pathname.startsWith('/math') || location.pathname.startsWith('/games')) {
    // A Navigation será renderizada dentro de Math.tsx ou Games.tsx
    return null; 
  }
  
  // Para todas as outras páginas, renderizamos a navegação padrão
  return <Navigation />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProgressProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <NavigationWrapper /> 
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/reading/:id" element={<Story />} />
            <Route path="/math" element={<Math />} />
            <Route path="/math/reports" element={<MathReports />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProgressProvider>
  </QueryClientProvider>
);

export default App;