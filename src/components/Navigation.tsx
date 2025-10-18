import { Home, BookOpen, Calculator, User, Gamepad2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import React from "react";

interface NavigationProps {
  // Função que retorna true se a navegação deve ser bloqueada (e o modal exibido)
  checkBlock?: (targetPath: string) => boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ checkBlock }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Gamepad2, label: "Jogos", path: "/games" },
    { icon: BookOpen, label: "Leitura", path: "/reading" },
    { icon: Calculator, label: "Matemática", path: "/math" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];
  
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    // Se a função de bloqueio existir e retornar true, impede a navegação padrão
    if (checkBlock && checkBlock(path)) {
      e.preventDefault();
      // A lógica de navegação real será tratada pelo modal na página Math.tsx
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/70 shadow-soft md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center md:justify-center md:gap-8 py-3">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <a
                key={path}
                href={path}
                onClick={(e) => handleNavigation(e, path)}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full transition-smooth",
                  isActive
                    ? "gradient-primary text-white shadow-soft"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/15"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs md:text-sm font-body font-semibold">
                  {label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};