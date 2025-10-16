import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Star, Trophy, CheckCircle } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import { mathChallenges } from "@/data/math-challenges";
import ColorHeader from "../components/ColorHeader.tsx";
import mascotBackground from "@/assets/mascot-owl.png";

const MathChallengePage = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { progress, completeExercise } = useProgress();

  const challengeIdNum = parseInt(challengeId || "1", 10);
  const challenge = mathChallenges.find((c) => c.id === challengeIdNum);

  if (!challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Desafio não encontrado. Redirecionando...</p>
        {setTimeout(() => navigate("/journey"), 1000)}
      </div>
    );
  }

  const handleCompleteExercise = (exerciseId: number, xpReward: number) => {
    completeExercise(exerciseId, xpReward);
    toast.success(`🎉 Parabéns! Você ganhou ${xpReward} XP!`);
    navigate("/journey");
  };

  const isCompleted = progress.completedExercises.includes(challenge.id);

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(202,95%,84%)] via-[hsl(288,95%,86%)] to-[hsl(145,90%,84%)] shadow-soft">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${mascotBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <ColorHeader
            title={challenge.title}
            subtitle={challenge.description}
            gradientFrom="#93c5fd"
            gradientTo="#f472b6"
          />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className={`p-6 hover:shadow-glow transition-smooth border-2 animate-scale-in group ${isCompleted ? "border-success bg-success/5" : "border-border hover:border-primary"}`}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-body font-semibold text-accent uppercase">
                    {challenge.difficulty}
                  </span>
                  <h3 className="text-xl font-display font-bold text-foreground group-hover:text-secondary transition-smooth">
                    {challenge.title}
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
                  <span>{challenge.exercises} exercícios</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                  <span>{challenge.xp} XP</span>
                </div>
              </div>

              <Button
                variant={isCompleted ? "outline" : "secondary"}
                className="w-full"
                onClick={() => !isCompleted && handleCompleteExercise(challenge.id, challenge.xp)}
                disabled={isCompleted}
              >
                {isCompleted ? "✓ Completado" : "Começar Desafio"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MathChallengePage;