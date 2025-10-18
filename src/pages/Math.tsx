import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Calculator, Star, Trophy, CheckCircle, BarChart3 } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import mathImage from "@/assets/math-numbers.png";
import ColorHeader from "../components/ColorHeader";
import { useState, useEffect } from "react";
import mascotBackground from "@/assets/mascot-owl.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/Mascot";
import { useNavigate } from "react-router-dom";
import MathGame from "@/components/math/MathGame";
import { DifficultyCard } from "@/components/DifficultyCard";

type Difficulty = "easy" | "medium" | "hard" | "very-hard";
type MathStatus = "menu" | "playing";

const STORAGE_KEY_DIFFICULTY = "mathDifficulty";
const STORAGE_KEY_PLAYER_NAME = "mathPlayerName";

const Math = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  const initialDifficulty = (localStorage.getItem(STORAGE_KEY_DIFFICULTY) as Difficulty) || "easy";
  const initialPlayerName = localStorage.getItem(STORAGE_KEY_PLAYER_NAME) || "Aluno(a)";
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [playerName, setPlayerName] = useState<string>(initialPlayerName);
  const [mathStatus, setMathStatus] = useState<MathStatus>("menu");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIFFICULTY, selectedDifficulty);
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, playerName);
  }, [selectedDifficulty, playerName]);

  const handleStartGame = () => {
    if (playerName.trim() === "") {
      alert("Por favor, digite seu nome para começar!");
      return;
    }
    setMathStatus("playing");
  };
  
  const difficulties = [
    {
      id: "easy",
      title: "Fácil",
      description: "Soma e Subtração (até 100)",
      ageRange: "7-8 anos",
      icon: Star,
      color: "border-success hover:border-success",
      background: "bg-gradient-to-br from-emerald-300/50 via-emerald-200/50 to-emerald-100/50",
    },
    {
      id: "medium",
      title: "Médio",
      description: "Multiplicação e Divisão (inteiros)",
      ageRange: "9-10 anos",
      icon: Trophy,
      color: "border-secondary hover:border-secondary",
      background: "bg-gradient-to-br from-sky-300/50 via-sky-200/50 to-sky-100/50",
    },
    {
      id: "hard",
      title: "Difícil",
      description: "Multiplicação e Divisão (decimais)",
      ageRange: "11-12 anos",
      icon: Calculator,
      color: "border-accent hover:border-accent",
      background: "bg-gradient-to-br from-cyan-300/50 via-teal-200/50 to-emerald-100/50",
    },
    {
      id: "very-hard",
      title: "Muito Difícil",
      description: "Números grandes e Equações (com 'x')",
      ageRange: "13-14 anos",
      icon: CheckCircle,
      color: "border-primary hover:border-primary",
      background: "bg-gradient-to-br from-violet-300/50 via-fuchsia-200/50 to-pink-100/50",
    },
  ];

  if (mathStatus === "playing") {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <MathGame difficulty={selectedDifficulty} playerName={playerName} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      {/* HERO COLORIDO DO TOPO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(202,95%,84%)] via-[hsl(288,95%,86%)] to-[hsl(145,90%,84%)] shadow-soft">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${mascotBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -top-12 right-4 h-56 w-56 rounded-full bg-[hsl(286,100%,85%)] opacity-60 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={mathImage} alt="Matemática" className="w-20 h-20" />
              <ColorHeader
                title="Área de Matemática"
                subtitle="Resolva desafios e torne-se um mestre dos números!"
                gradientFrom="#93c5fd"
                gradientTo="#f472b6"
              />
            </div>
            <Button 
                variant="secondary" 
                onClick={() => navigate('/math/reports')}
                className="shadow-soft"
            >
                <BarChart3 className="w-5 h-5 mr-2" />
                Relatórios
            </Button>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div>
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(210,95%,82%)] via-[hsl(286,90%,80%)] to-[hsl(145,90%,78%)] px-6 py-12 shadow-glow md:px-12 md:py-16">
          <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: `url(${mascotBackground})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            
            <div className="text-center space-y-4">
                <Mascot message="Escolha seu nível e vamos começar a calcular!" className="mx-auto" />
                <h2 className="text-3xl font-display font-bold text-foreground">Selecione o Desafio</h2>
            </div>
            
            {/* Seleção de Nível */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {difficulties.map((d) => (
                    <DifficultyCard
                        key={d.id}
                        {...d}
                        onClick={() => setSelectedDifficulty(d.id as Difficulty)}
                        className={selectedDifficulty === d.id ? "border-4 border-primary shadow-glow" : ""}
                    />
                ))}
            </div>
            
            {/* Input de Nome e Botão Iniciar */}
            <Card className="p-6 border-2 border-primary/30 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Input
                        placeholder="Seu nome (para o relatório)"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="flex-grow font-body font-semibold text-center"
                        maxLength={20}
                    />
                    <Button 
                        size="lg" 
                        onClick={handleStartGame} 
                        disabled={playerName.trim() === ""}
                        className="w-full sm:w-auto gradient-primary shadow-soft"
                    >
                        Começar Nível {difficulties.find(d => d.id === selectedDifficulty)?.title || 'Fácil'}
                    </Button>
                </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Math;