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
            <h1 className="text-4xl md:text-6xl font-display font-bold text-emerald-600 animate-scale-in">
              Lêr + Conta Mundo
            </h1>
            <p className="text-lg md:text-xl font-body text-emerald-600 max-w-2xl mx-auto">
              Uma aventura mágica de aprendizado através da leitura e matemática! Escolha seu nível e comece a explorar.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 md:pb-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(320,100%,83%)] via-[hsl(45,100%,78%)] to-[hsl(198,95%,80%)] px-6 py-12 shadow-glow md:px-12 md:py-16">
          <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-[hsl(280,100%,80%)] opacity-70 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-y-1/3 rounded-full bg-[hsl(198,100%,82%)] opacity-80 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(45,100%,90%)] opacity-60 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle cx=%2750%27 cy=%2750%27 r=%2720%27 fill=%27%23ffffff33%27/%3E%3Ccircle cx=%27160%27 cy=%2790%27 r=%2715%27 fill=%27%23ffffff33%27/%3E%3Ccircle cx=%2790%27 cy=%27160%27 r=%2725%27 fill=%27%23ffffff33%27/%3E%3C/svg%3E')] opacity-40" />

          <div className="relative z-10 mx-auto max-w-7xl space-y-10">
            <div className="text-center text-foreground">
              <h2 className="text-3xl font-display font-bold mb-2">
                Escolha Seu Nível
              </h2>
              <p className="text-muted-foreground font-body">
                Selecione o nível que melhor combina com você
              </p>
            </div>

            <div className="rounded-3xl bg-white/60 p-6 md:p-8 shadow-soft backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        </section>
      </div>
    </div>
  );
};

export default Index;