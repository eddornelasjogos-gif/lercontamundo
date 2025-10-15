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
    { id: "first-read", title: "Primeiro Passo", description: "Complete sua primeira leitura", icon: BookOpen, unlocked: progress.achievements.includes("first-read"), color: "text-success" },
    { id: "number-master", title: "Mestre dos Números", description: "Resolva 50 exercícios de matemática", icon: Calculator, unlocked: progress.achievements.includes("number-master"), color: "text-secondary" },
    { id: "dedicated-reader", title: "Leitor Dedicado", description: "Leia 10 histórias completas", icon: Trophy, unlocked: progress.achievements.includes("dedicated-reader"), color: "text-accent" },
    { id: "star-bright", title: "Estrela Brilhante", description: "Alcance o nível 5", icon: Star, unlocked: progress.level >= 5, color: "text-primary" },
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

      {/* HERO COLORIDO DO TOPO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(48,99%,86%)] via-[hsl(322,94%,86%)] to-[hsl(198,95%,84%)] shadow-soft">
        <div className="absolute -top-16 -left-10 h-64 w-64 rounded-full bg-[hsl(320,100%,86%)] opacity-60 blur-3xl" />
        <div className="absolute top-1/2 right--0 h-72 w-72 -translate-y-1/2 rounded-full bg-[hsl(198,100%,84%)] opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[hsl(48,100%,90%)] opacity-70 blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle cx=%2740%27 cy=%2780%27 r=%2720%27 fill=%27%23ffffff33%27/%3E%3Ccircle cx=%27150%27 cy=%2740%27 r=%2712%27 fill=%27%23ffffff2d%27/%3E%3Ccircle cx=%2790%27 cy=%27160%27 r=%2724%27 fill=%27%23ffffff2d%27/%3E%3C/svg%3E')] opacity-45" />

        <div className="relative z-10 container mx-auto px-4 py-10 md:py-14">
          <div className="text-center space-y-6">
            <Mascot className="mx-auto" />
            <div className="inline-block rounded-2xl bg-white/95 border border-white/80 px-5 py-4 shadow-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f5ff 40%, #e9f7ff 100%)", border: "1px solid rgba(0,0,0,.08)" }}>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-black mb-2 leading-tight">Meu Perfil</h1>
              <p className="text-black font-body">Acompanhe seu progresso e conquistas!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Progress Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 shadow-card border-2 border-primary/20">
            <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
          </Card>
        </div>

        {/* Stats & Achievements */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(48,99%,82%)] via-[hsl(322,94%,82%)] to-[hsl(198,95%,78%)] px-6 py-12 shadow-glow md:px-12 md:py-16">
          <div className="absolute -top-20 -left-16 h-60 w-60 rounded-full bg-[hsl(320,100%,86%)] opacity-70 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 translate-x-1/4 rounded-full bg-[hsl(198,100%,82%)] opacity-70 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 translate-y-1/3 rounded-full bg-[hsl(48,100%,88%)] opacity-70 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle cx=%2740%27 cy=%2780%27 r=%2720%27 fill=%27%23ffffff33%27/%3E%3Cpath d=%27M150 40a16 16 0 11-32 0 16 16 0 0132 0z%27 fill=%27%23ffffff2d%27/%3E%3Ccircle cx=%27110%27 cy=%27160%27 r=%2730%27 fill=%27%23ffffff33%27/%3E%3C/svg%3E')] opacity-45" />

          <div className="relative z-10 max-w-6xl mx-auto space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground">Suas Conquistas</h2>
              <p className="text-sm md:text-base text-foreground/80 font-body">Continue jogando e lendo para desbloquear todos os prêmios do mundo mágico!</p>
            </div>

            <div className="rounded-3xl bg-white/65 p-6 md:p-8 shadow-soft backdrop-blur-sm space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="p-6 text-center hover:shadow-glow transition-smooth border-2 border-border">
                    <div className="space-y-3">
                      <div className={`w-12 h-12 mx-auto rounded-full ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-display font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs font-body text-muted-foreground">{stat.label}</div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-display font-bold text-foreground text-center">Coleção de Troféus</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className={`p-6 transition-smooth border-2 ${
                        achievement.unlocked ? "border-primary shadow-card hover:shadow-glow" : "border-border opacity-50 grayscale"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${achievement.unlocked ? "gradient-primary" : "bg-muted"}`}>
                          <achievement.icon className={`${achievement.unlocked ? "text-white" : "text-muted-foreground"} w-6 h-6`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-display font-bold text-foreground mb-1">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
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
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" onClick={handleReset}>
            Resetar Progresso
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;