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
    { id: 1, title: "Soma Divertida", description: "Pratique adições básicas", difficulty: "Fácil", exercises: 10, xp: 40, completed: false },
    { id: 2, title: "Subtração Mágica", description: "Aprenda a subtrair", difficulty: "Fácil", exercises: 10, xp: 40, completed: false },
    { id: 3, title: "Multiplicação Estelar", description: "Tabuada interativa", difficulty: "Médio", exercises: 15, xp: 60, completed: false },
    { id: 4, title: "Divisão Espacial", description: "Divida e conquiste", difficulty: "Médio", exercises: 15, xp: 60, completed: false },
  ];

  const difficultyColors: Record<string, string> = {
    Fácil: "text-success bg-success/10 border-success",
    Médio: "text-secondary bg-secondary/10 border-secondary",
    Difícil: "text-accent bg-accent/10 border-accent",
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      {/* HERO COLORIDO DO TOPO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(202,95%,84%)] via-[hsl(288,95%,86%)] to-[hsl(145,90%,84%)] shadow-soft">
        <div className="absolute -top-12 right-4 h-56 w-56 rounded-full bg-[hsl(286,100%,85%)] opacity-60 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-20px] h-72 w-72 rounded-full bg-[hsl(145,95%,80%)] opacity-60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(52,100%,90%)] opacity-60 blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M100 40c0 11-9 20-20 20S60 51 60 40s9-20 20-20 20 9 20 20z%27 fill=%27%23ffffff29%27/%3E%3Ccircle cx=%2790%27 cy=%27155%27 r=%2726%27 fill=%27%23ffffff33%27/%3E%3C/svg%3E')] opacity-45" />

        <div className="relative z-10 container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={mathImage} alt="Matemática" className="w-20 h-20" />
              <div className="rounded-2xl bg-white/95 border border-white/80 px-4 py-3 md:px-6 md:py-4 shadow-card">
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-black leading-tight">
                  Área de Matemática
                </h1>
                <p className="text-black font-body">
                  Resolva desafios e torne-se um mestre dos números!
                </p>
              </div>
            </div>
            <Mascot message="Matemática é divertida!" />
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Progress */}
        <div>
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        {/* Exercises Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(210,95%,82%)] via-[hsl(286,90%,80%)] to-[hsl(145,90%,78%)] px-6 py-12 shadow-glow md:px-12 md:py-16">
          <div className="absolute -top-24 -right-16 h-60 w-60 rounded-full bg-[hsl(286,100%,85%)] opacity-70 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 -translate-y-1/4 -translate-x-1/4 rounded-full bg-[hsl(145,95%,80%)] opacity-70 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(52,100%,88%)] opacity-60 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M100 40c0 11-9 20-20 20S60 51 60 40s9-20 20-20 20 9 20 20z%27 fill=%27%23ffffff33%27/%3E%3Cpath d=%27M170 120c0 9.94-8.06 18-18 18s-18-8.06-18-18 8.06-18 18-18 18 8.06 18 18z%27 fill=%27%23ffffff29%27/%3E%3Ccircle cx=%2790%27 cy=%27155%27 r=%2726%27 fill=%27%23ffffff33%27/%3E%3C/svg%3E')] opacity-45" />

          <div className="relative z-10 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground">Desafios Disponíveis</h2>
              <p className="text-sm md:text-base text-foreground/80 font-body">
                Escolha um desafio e acumule pontos para subir de nível!
              </p>
            </div>

            <div className="rounded-3xl bg-white/65 p-6 md:p-8 shadow-soft backdrop-blur-sm">
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
        </section>
      </div>
    </div>
  );
};

export default Math;