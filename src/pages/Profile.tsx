import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trophy, BookOpen, Calculator, Award } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";

const Profile = () => {
  const { progress, resetProgress } = useProgress();

  const achievements = [
    {
      id: "first-read",
      title: "Primeiro Passo",
      description: "Complete sua primeira leitura",
      icon: BookOpen,
      unlocked: progress.achievements.includes("first-read"),
      color: "text-success",
    },
    {
      id: "number-master",
      title: "Mestre dos Números",
      description: "Resolva 50 exercícios de matemática",
      icon: Calculator,
      unlocked: progress.achievements.includes("number-master"),
      color: "text-secondary",
    },
    {
      id: "dedicated-reader",
      title: "Leitor Dedicado",
      description: "Leia 10 histórias completas",
      icon: Trophy,
      unlocked: progress.achievements.includes("dedicated-reader"),
      color: "text-accent",
    },
    {
      id: "star-bright",
      title: "Estrela Brilhante",
      description: "Alcance o nível 5",
      icon: Star,
      unlocked: progress.level >= 5,
      color: "text-primary",
    },
  ];

  const stats = [
    { label: "Histórias Lidas", value: progress.storiesRead.toString(), icon: BookOpen, color: "gradient-primary" },
    { label: "Exercícios Completos", value: progress.exercisesCompleted.toString(), icon: Calculator, color: "gradient-secondary" },
    { label: "XP Total", value: progress.xp.toString(), icon: Star, color: "gradient-success" },
    { label: "Conquistas", value: `${progress.achievements.length}/4`, icon: Award, color: "gradient-primary" },
  ];

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todo o seu progresso?")) {
      resetProgress();
      toast.success("Progresso resetado com sucesso!");
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8 space-y-6">
          <Mascot className="mx-auto" />
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground font-body">
              Acompanhe seu progresso e conquistas!
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="p-6 shadow-card border-2 border-primary/20">
            <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 text-center hover:shadow-glow transition-smooth border-2 border-border"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 mx-auto rounded-full ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-display font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs font-body text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
            Conquistas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-6 transition-smooth border-2 ${
                  achievement.unlocked
                    ? "border-primary shadow-card hover:shadow-glow"
                    : "border-border opacity-50 grayscale"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      achievement.unlocked ? "gradient-primary" : "bg-muted"
                    }`}
                  >
                    <achievement.icon
                      className={`w-6 h-6 ${
                        achievement.unlocked ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-foreground mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <div className="mt-2 flex items-center gap-1 text-success">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold">Desbloqueado!</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={handleReset}>
            Resetar Progresso
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
