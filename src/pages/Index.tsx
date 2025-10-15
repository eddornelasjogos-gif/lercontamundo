import { useNavigate } from "react-router-dom";
import { DifficultyCard } from "@/components/DifficultyCard";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Rocket, Zap, BookOpen, Calculator } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import mascotBackground from "@/assets/mascot-owl.png";

const Index = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const difficulties = [
    {
      id: "easy",
      title: "Fácil",
      description: "Perfeito para começar a aventura!",
      ageRange: "7-8 anos",
      icon: Sparkles,
      color: "border-success hover:border-success",
      background: "bg-gradient-to-br from-emerald-300 via-emerald-200 to-emerald-100 hover:brightness-105",
    },
    {
      id: "medium",
      title: "Médio",
      description: "Para quem já está crescendo!",
      ageRange: "9-10 anos",
      icon: Star,
      color: "border-secondary hover:border-secondary",
      background: "bg-gradient-to-br from-sky-300 via-sky-200 to-sky-100 hover:brightness-105",
    },
    {
      id: "hard",
      title: "Difícil",
      description: "Desafios emocionantes te esperam!",
      ageRange: "11-12 anos",
      icon: Rocket,
      color: "border-accent hover:border-accent",
      background: "bg-gradient-to-br from-cyan-300 via-teal-200 to-emerald-100 hover:brightness-105",
    },
    {
      id: "very-hard",
      title: "Muito Difícil",
      description: "Para verdadeiros campeões!",
      ageRange: "13-14 anos",
      icon: Zap,
      color: "border-primary hover:border-primary",
      background: "bg-gradient-to-br from-violet-300 via-fuchsia-200 to-pink-100 hover:brightness-105",
    },
  ];

  const handleDifficultySelect = (difficultyId: string) => {
    setSelectedDifficulty(difficultyId);
    localStorage.setItem("userDifficulty", difficultyId);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${mascotBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <Mascot message="Olá! Vamos aprender juntos?" />
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground animate-scale-in">
              Lêr + Conta{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Mundo
              </span>
            </h1>
            <p className="text-lg md:text-xl font-body text-muted-foreground max-w-2xl mx-auto">
              Uma aventura mágica de aprendizado através da leitura e matemática!
              Escolha seu nível e comece a explorar.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Escolha Seu Nível
          </h2>
          <p className="text-muted-foreground font-body">
            Selecione o nível que melhor combina com você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {difficulties.map((difficulty) => (
            <DifficultyCard
              key={difficulty.id}
              {...difficulty}
              onClick={() => handleDifficultySelect(difficulty.id)}
            />
          ))}
        </div>

        {selectedDifficulty && (
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 animate-scale-in">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate("/reading")}
              className="font-display"
            >
              <BookOpen className="mr-2" />
              Começar a Ler
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/math")}
              className="font-display"
            >
              <Calculator className="mr-2" />
              Praticar Matemática
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;