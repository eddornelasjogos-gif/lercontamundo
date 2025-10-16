import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Star, Trophy, CheckCircle } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import mathImage from "@/assets/math-numbers.png";
import ColorHeader from "../components/ColorHeader.tsx";
import LevelSelector from "@/components/LevelSelector";
import { useState, useEffect } from "react";
import mascotBackground from "@/assets/mascot-owl.png"; // Importando a imagem do mascote

type Difficulty = "easy" | "medium" | "hard" | "very-hard";
const STORAGE_KEY = "userDifficulty";

const Math = () => {
  const { progress, completeExercise } = useProgress();

  const initialDifficulty = (localStorage.getItem(STORAGE_KEY) as Difficulty) || "easy";
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedDifficulty);
  }, [selectedDifficulty]);

  const handleCompleteExercise = (exerciseId: number, xpReward: number) => {
    completeExercise(exerciseId, xpReward);
    toast.success(`🎉 Parabéns! Você ganhou ${xpReward} XP!`);
  };

  const exercisesByDifficulty: Record<Difficulty, Array<any>> = {
    easy: [
      { id: 1, title: "Soma Divertida", description: "Pratique adições básicas", difficulty: "Fácil", exercises: 10, xp: 40, completed: false },
      { id: 2, title: "Subtração Mágica", description: "Aprenda a subtrair", difficulty: "Fácil", exercises: 10, xp: 40, completed: false },
      { id: 3, title: "Contando com Objetos", description: "Quantos são?", difficulty: "Fácil", exercises: 8, xp: 30, completed: false },
      { id: 4, title: "Formas e Números", description: "Combina formas com números", difficulty: "Fácil", exercises: 6, xp: 25, completed: false },
    ],
    medium: [
      { id: 10, title: "Multiplicação Estelar", description: "Tabuada interativa", difficulty: "Médio", exercises: 15, xp: 60, completed: false },
      { id: 11, title: "Divisão Espacial", description: "Divida e conquiste", difficulty: "Médio", exercises: 15, xp: 60, completed: false },
      { id: 12, title: "Frações Simples", description: "Aprenda frações básicas", difficulty: "Médio", exercises: 12, xp: 55, completed: false },
      { id: 13, title: "Medidas e Unidades", description: "Compreendendo medidas", difficulty: "Médio", exercises: 10, xp: 50, completed: false },
    ],
    hard: [
      { id: 20, title: "Proporções e Razões", description: "Problemas de proporção", difficulty: "Difícil", exercises: 12, xp: 90, completed: false },
      { id: 21, title: "Equações Básicas", description: "Introdução a equações", difficulty: "Difícil", exercises: 14, xp: 100, completed: false },
      { id: 22, title: "Problemas de Texto", description: "Resolver usando lógica", difficulty: "Difícil", exercises: 16, xp: 110, completed: false },
      { id: 23, title: "Geometria Básica", description: "Perímetros e áreas", difficulty: "Difícil", exercises: 12, xp: 95, completed: false },
    ],
    "very-hard": [
      { id: 30, title: "Desafios Avançados", description: "Problemas complexos", difficulty: "Muito Difícil", exercises: 20, xp: 150, completed: false },
      { id: 31, title: "Raciocínio Lógico Avançado", description: "Desafios de lógica", difficulty: "Muito Difícil", exercises: 18, xp: 140, completed: false },
      { id: 32, title: "Mistura de Operações", description: "Misture tudo e resolva", difficulty: "Muito Difícil", exercises: 20, xp: 160, completed: false },
    ],
  };

  const exercises = exercisesByDifficulty[selectedDifficulty];

  const difficultyColors: Record<string, string> = {
    Fácil: "text-success bg-success/10 border-success",
    Médio: "text-secondary bg-secondary/10 border-secondary",
    Difícil: "text-accent bg-accent/10 border-accent",
    "Muito Difícil": "text-primary bg-primary/10 border-primary",
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      {/* HERO COLORIDO DO TOPO (com Header colorido ao lado) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(202,95%,84%)] via-[hsl(288,95%,86%)] to-[hsl(145,90%,84%)] shadow-soft">
        {/* Mascote de fundo no HERO */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${mascotBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -top-12 right-4 h-56 w-56 rounded-full bg-[hsl(286,100%,85%)] opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-y-1/4 rounded-full bg-[hsl(145,95%,80%)] opacity-60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(52,100%,90%)] opacity-60 blur-3xl" />
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
            <div className="flex flex-col items-center gap-3">
              <LevelSelector value={selectedDifficulty} onChange={(d) => setSelectedDifficulty(d)} />
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div>
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(210,95%,82%)] via-[hsl(286,90%,80%)] to-[hsl(145,90%,78%)] px-6 py-12 shadow-glow md:px-12 md:py-16">
          {/* Mascote de fundo na seção principal */}
          <div
            className="absolute inset-0 opacity-20 z-0"
            style={{
              backgroundImage: `url(${mascotBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          
          <div className="absolute -top-24 -right-16 h-60 w-60 rounded-full bg-[hsl(286,100%,85%)] opacity-70 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 -translate-y-1/4 -translate-x-1/4 rounded-full bg-[hsl(145,95%,80%)] opacity-70 blur-3xl" />
          <div className="absolute top-1/2 left-12 h-48 w-48 -translate-y-1/2 rounded-full bg-[hsl(52,100%,88%)] opacity-80 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle cx=%2740%27 cy=%2780%27 r=%2716%27 fill=%27%23ffffff33%27/%3E%3Ccircle cx=%27150%27 cy=%2740%27 r=%2712%27 fill=%27%23ffffff2d%27/%3E%3Ccircle cx=%2790%27 cy=%27160%27 r=%2724%27 fill=%27%23ffffff2d%27/%3E%3C/svg%3E')] opacity-40" />

          <div className="relative z-10 space-y-8">
            {exercises.map((exercise) => {
              const isCompleted = progress.completedExercises.includes(exercise.id);

              return (
                <Card key={exercise.id} className={`p-6 hover:shadow-glow transition-smooth cursor-pointer border-2 animate-scale-in group ${isCompleted ? "border-success bg-success/5" : "border-border hover:border-primary"}`}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-body font-semibold text-accent uppercase">
                          {exercise.difficulty}
                        </span>
                        <h3 className="text-xl font-display font-bold text-foreground group-hover:text-secondary transition-smooth">
                          {exercise.title}
                        </h3>
                      </div>
                      <div className={`p-2 rounded-full ${isCompleted ? "bg-success/20" : "bg-primary/10"}`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Calculator className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{exercise.exercises} exercícios</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-secondary fill-secondary" />
                        <span>{exercise.xp} XP</span>
                      </div>
                    </div>

                    <Button
                      variant={isCompleted ? "outline" : "secondary"}
                      className="w-full"
                      onClick={() => !isCompleted && handleCompleteExercise(exercise.id, exercise.xp)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? "✓ Completado" : "Começar Desafio"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Math;