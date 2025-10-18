"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X } from "lucide-react";
import { Star, Trophy as TrophyIcon, BookOpen, Calculator, Award, Flame, Library, BrainCircuit } from "lucide-react";
import { Trophy } from "@/components/Trophy";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import { Mascot } from "@/components/Mascot";

const Profile = () => {
  const { progress, resetProgress } = useProgress();

  // Estado para o nome do usuário (global, salvo no localStorage)
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('userName') || '';
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(!userName); // Edita se não houver nome

  // Carrega o nome do localStorage ao montar
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
      setIsEditingName(false);
    }
  }, []);

  // Salva o nome no localStorage e atualiza estado
  const handleSaveName = () => {
    if (userName.trim().length < 3) {
      toast.error("O nome deve ter pelo menos 3 caracteres!");
      return;
    }
    localStorage.setItem('userName', userName.trim());
    setIsEditingName(false);
    toast.success(`Nome "${userName.trim()}" salvo com sucesso!`);
  };

  // Cancela edição
  const handleCancelEdit = () => {
    const savedName = localStorage.getItem('userName') || '';
    setUserName(savedName);
    setIsEditingName(false);
  };

  // Definição completa de todas as conquistas
  const allAchievements = [
    // Base
    { id: "star-bright", title: "Estrela Brilhante", description: "Alcance o nível 5", icon: Star },
    // Leitura
    { id: 'reading-1', title: 'Iniciante na Leitura', description: 'Leia 5 histórias', icon: BookOpen },
    { id: 'reading-2', title: 'Leitor Casual', description: 'Leia 10 histórias', icon: BookOpen },
    { id: 'reading-3', title: 'Leitor Voraz', description: 'Leia 25 histórias', icon: Library },
    { id: 'reading-4', title: 'Devorador de Livros', description: 'Leia 50 histórias', icon: Library },
    // Matemática
    { id: 'math-1', title: 'Iniciante nos Números', description: 'Resolva 5 exercícios', icon: Calculator },
    { id: 'math-2', title: 'Matemático Casual', description: 'Resolva 10 exercícios', icon: Calculator },
    { id: 'math-3', title: 'Mestre da Lógica', description: 'Resolva 25 exercícios', icon: BrainCircuit },
    { id: 'math-4', title: 'Gênio dos Cálculos', description: 'Resolva 50 exercícios', icon: BrainCircuit },
    // Sequência
    { id: "streak-3", title: "Consistente", description: "Acesse por 3 dias seguidos", icon: Flame },
    { id: "streak-7", title: "Determinado", description: "Acesse por 7 dias seguidos", icon: Flame },
    { id: "streak-15", title: "Imparável", description: "Acesse por 15 dias seguidos", icon: Flame },
  ];

  const getVisibleAchievements = (seriesIds: string[]) => {
    let lastUnlockedIndex = -1;
    for (let i = seriesIds.length - 1; i >= 0; i--) {
      if (progress.achievements.includes(seriesIds[i])) {
        lastUnlockedIndex = i;
        break;
      }
    }
    
    const visibleIds = seriesIds.slice(0, lastUnlockedIndex + 2);
    return allAchievements.filter(ach => visibleIds.includes(ach.id));
  };

  const readingAchievements = getVisibleAchievements(['reading-1', 'reading-2', 'reading-3', 'reading-4']);
  const mathAchievements = getVisibleAchievements(['math-1', 'math-2', 'math-3', 'math-4']);
  const streakAchievements = getVisibleAchievements(['streak-3', 'streak-7', 'streak-15']);
  const baseAchievements = allAchievements.filter(ach => ach.id === 'star-bright');

  const achievementsToDisplay = [...baseAchievements, ...readingAchievements, ...mathAchievements, ...streakAchievements].map(ach => ({
    ...ach,
    unlocked: progress.achievements.includes(ach.id) || (ach.id === 'star-bright' && progress.level >= 5)
  }));

  const unlockedAchievements = achievementsToDisplay.filter(ach => ach.unlocked);
  const lockedAchievements = achievementsToDisplay.filter(ach => !ach.unlocked);

  const stats = [
    { label: "Histórias Lidas", value: progress.storiesRead.toString(), icon: BookOpen, color: "gradient-primary" },
    { label: "Exercícios Completos", value: progress.exercisesCompleted.toString(), icon: Calculator, color: "gradient-secondary" },
    { label: "Dias Consecutivos", value: progress.consecutiveDays.toString(), icon: Flame, color: "gradient-success" },
    { label: "Conquistas", value: `${unlockedAchievements.length}/${allAchievements.length}`, icon: Award, color: "gradient-primary" },
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

      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(48,99%,86%)] via-[hsl(322,94%,86%)] to-[hsl(198,95%,84%)] shadow-soft">
        <div className="absolute -top-16 -left-10 h-64 w-64 rounded-full bg-[hsl(320,100%,80%)] opacity-60 blur-3xl" />
        <div className="absolute top-1/2 right-[-40px] h-72 w-72 -translate-y-1/2 rounded-full bg-[hsl(198,100%,84%)] opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 translate-y-1/3 rounded-full bg-[hsl(48,100%,90%)] opacity-70 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 py-10 md:py-14">
          <div className="text-center">
            <div className="inline-block rounded-2xl border border-white/80 px-5 py-4 shadow-card" style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)" }}>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-2 leading-tight">Meu Perfil</h1>
              <p className="text-white/90 font-body">Acompanhe seu progresso e conquistas!</p>
            </div>
          </div>

          {/* Seção de Edição de Nome */}
          <div className="mt-6 max-w-md mx-auto">
            <Card className="p-6 shadow-card border-2 border-primary/20">
              <div className="space-y-4">
                <h2 className="text-xl font-display font-bold text-foreground text-center">Seu Nome</h2>
                {isEditingName ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Digite seu nome"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full font-body font-semibold text-center"
                      maxLength={20}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-display font-bold text-primary">
                      {userName || 'Nome não definido'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingName(true)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 shadow-card border-2 border-primary/20">
            <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
          </Card>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(48,99%,82%)] via-[hsl(322,94%,82%)] to-[hsl(198,95%,78%)] px-6 py-12 shadow-soft md:px-12 md:py-16">
          <div className="absolute -top-20 -left-16 h-60 w-60 rounded-full bg-[hsl(320,100%,86%)] opacity-70 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 translate-x-1/4 rounded-full bg-[hsl(198,100%,82%)] opacity-70 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 translate-y-1/3 rounded-full bg-[hsl(48,100%,88%)] opacity-70 blur-3xl" />
          <div className="relative z-10 max-w-6xl mx-auto space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground">Suas Estatísticas</h2>
              <p className="text-sm md:text-base text-foreground/80 font-body">Veja como você está progredindo em sua jornada de aprendizado!</p>
            </div>

            <div className="rounded-3xl bg-white/65 p-6 md:p-8 shadow-soft backdrop-blur-sm space-y-12">
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
                <h3 className="text-2xl font-display font-bold text-foreground text-center">Galeria de Troféus</h3>
                {unlockedAchievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {unlockedAchievements.map((achievement) => (
                      <Trophy key={achievement.id} {...achievement} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mascot message="Sua galeria está vazia. Continue jogando para conquistar o primeiro troféu!" />
                  </div>
                )}
              </div>

              {lockedAchievements.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-display font-bold text-foreground text-center">Próximas Conquistas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {lockedAchievements.map((achievement) => (
                      <Trophy key={achievement.id} {...achievement} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

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