import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Star, Trophy, CheckCircle } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import mathImage from "@/assets/math-numbers.png";

const Math = () => {
  const { progress, completeExercise } = useProgress();

  const handleCompleteExercise = (exerciseId: number, xpReward: number) => {
    completeExercise(exerciseId, xpReward);
    toast.success(`🎉 Parabéns! Você ganhou ${xpReward} XP!`);
  };
  const exercises = [
    {
      id: 1,
      title: "Soma Divertida",
      description: "Pratique adições básicas",
      difficulty: "Fácil",
      exercises: 10,
      xp: 40,
      completed: false,
    },
    {
      id: 2,
      title: "Subtração Mágica",
      description: "Aprenda a subtrair",
      difficulty: "Fácil",
      exercises: 10,
      xp: 40,
      completed: false,
    },
    {
      id: 3,
      title: "Multiplicação Estelar",
      description: "Tabuada interativa",
      difficulty: "Médio",
      exercises: 15,
      xp: 60,
      completed: false,
    },
    {
      id: 4,
      title: "Divisão Espacial",
      description: "Divida e conquiste",
      difficulty: "Médio",
      exercises: 15,
      xp: 60,
      completed: false,
    },
  ];

  const difficultyColors: Record<string, string> = {
    Fácil: "text-success bg-success/10 border-success",
    Médio: "text-secondary bg-secondary/10 border-secondary",
    Difícil: "text-accent bg-accent/10 border-accent",
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <img src={mathImage} alt="Matemática" className="w-20 h-20" />
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">
                Área de Matemática
              </h1>
              <p className="text-muted-foreground font-body">
                Resolva desafios e torne-se um mestre dos números!
              </p>
            </div>
          </div>
          <Mascot message="Matemática é divertida!" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => {
            const isCompleted = progress.completedExercises.includes(exercise.id);
            
            return (
              <Card
                key={exercise.id}
                className={`p-6 hover:shadow-glow transition-smooth cursor-pointer border-2 animate-scale-in group ${
                  isCompleted ? "border-success bg-success/5" : "border-border hover:border-secondary"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-body font-bold px-3 py-1 rounded-full border ${
                            difficultyColors[exercise.difficulty]
                          }`}
                        >
                          {exercise.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-foreground group-hover:text-secondary transition-smooth">
                        {exercise.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {exercise.description}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${isCompleted ? "bg-success/20" : "bg-secondary/10"}`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Calculator className="w-5 h-5 text-secondary" />
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
      </div>
    </div>
  );
};

export default Math;
