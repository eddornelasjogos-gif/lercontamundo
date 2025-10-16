import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Clock, CheckCircle } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import readingImage from "@/assets/reading-books.png";
import ColorHeader from "@/components/ColorHeader";

const Reading = () => {
  const { progress, completeStory } = useProgress();

  // Read the user's selected difficulty from localStorage (defaults to 'easy')
  const userDifficulty = (localStorage.getItem("userDifficulty") as
    | "easy"
    | "medium"
    | "hard"
    | "very-hard") || "easy";

  // Predefined lists with popular/known story titles for each difficulty level
  const storiesByDifficulty = {
    easy: [
      { id: 101, title: "A Cigarra e a Formiga", category: "Fábulas", duration: "5 min", xp: 50, stars: 3 },
      { id: 102, title: "A Lebre e a Tartaruga", category: "Fábulas", duration: "4 min", xp: 40, stars: 3 },
      { id: 103, title: "O Patinho Feio", category: "Contos", duration: "6 min", xp: 45, stars: 3 },
      { id: 104, title: "João e o Pé de Feijão", category: "Contos", duration: "7 min", xp: 55, stars: 3 },
    ],
    medium: [
      { id: 201, title: "Chapeuzinho Vermelho", category: "Contos Clássicos", duration: "8 min", xp: 75, stars: 3 },
      { id: 202, title: "Os Três Porquinhos", category: "Contos", duration: "6 min", xp: 60, stars: 3 },
      { id: 203, title: "Pedro e o Lobo", category: "Música & Contos", duration: "6 min", xp: 50, stars: 3 },
      { id: 204, title: "A Bela Adormecida", category: "Contos Clássicos", duration: "9 min", xp: 80, stars: 3 },
    ],
    hard: [
      { id: 301, title: "Pinóquio", category: "Clássicos", duration: "12 min", xp: 120, stars: 4 },
      { id: 302, title: "Alice no País das Maravilhas", category: "Fantasia", duration: "14 min", xp: 130, stars: 4 },
      { id: 303, title: "A Ilha do Tesouro", category: "Aventura", duration: "15 min", xp: 140, stars: 4 },
      { id: 304, title: "As Aventuras de Robinson Crusoé", category: "Aventura", duration: "16 min", xp: 150, stars: 4 },
    ],
    "very-hard": [
      { id: 401, title: "Dom Quixote (trechos)", category: "Clássicos", duration: "18 min", xp: 180, stars: 5 },
      { id: 402, title: "As Viagens de Gulliver (trechos)", category: "Clássicos", duration: "18 min", xp: 180, stars: 5 },
      { id: 403, title: "Moby Dick (trechos)", category: "Aventura", duration: "20 min", xp: 200, stars: 5 },
      { id: 404, title: "Sherlock Holmes (contos)", category: "Mistério", duration: "18 min", xp: 190, stars: 5 },
    ],
  } as const;

  const stories = storiesByDifficulty[userDifficulty];

  // Derive categories from the selected difficulty's stories
  const categories = Array.from(new Set(stories.map((s) => s.category)));
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  const handleCompleteStory = (storyId: number, xpReward: number) => {
    completeStory(storyId, xpReward);
    toast.success(`🎉 Parabéns! Você ganhou ${xpReward} XP!`);
  };

  const filteredStories = stories.filter((story) => story.category === selectedCategory);

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      {/* HERO COLORIDO DO TOPO (com Header colorido ao lado) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(302,95%,88%)] via-[hsl(48,100%,86%)] to-[hsl(198,95%,82%)] shadow-soft">
        <div className="absolute -top-14 -left-16 h-64 w-64 rounded-full bg-[hsl(320,100%,86%)] opacity-60 blur-3xl" />
        <div className="absolute top-10 right-[-40px] h-56 w-56 rounded-full bg-[hsl(45,100%,88%)] opacity-60 blur-3xl" />
        <div className="absolute bottom-[-40px] left-10 h-72 w-72 rounded-full bg-[hsl(198,100%,84%)] opacity-60 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={readingImage} alt="Leitura" className="w-20 h-20" />
              <ColorHeader
                title="Área de Leitura"
                subtitle={`Nível selecionado: ${userDifficulty === "easy" ? "Fácil" : userDifficulty === "medium" ? "Médio" : userDifficulty === "hard" ? "Difícil" : "Muito Difícil"}`}
                gradientFrom="#93c5fd"
                gradientTo="#c4b5fd"
              />
            </div>
            <Mascot message="Vamos ler juntos!" />
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Progress */}
        <div>
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        {/* Stories Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(198,95%,80%)] via-[hsl(315,93%,82%)] to-[hsl(45,98%,75%)] px-6 py-10 shadow-glow md:px-12 md:py-14">
          <div className="absolute -top-24 -left-14 h-60 w-60 rounded-full bg-[hsl(200,100%,82%)] opacity-70 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-y-1/3 rounded-full bg-[hsl(315,93%,78%)] opacity-70 blur-3xl" />
          <div className="absolute top-1/2 left-12 h-48 w-48 -translate-y-1/2 rounded-full bg-[hsl(45,100%,88%)] opacity-80 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%27160%27 height=%27160%27 viewBox=%270 0 200 200%27 fill=%27none%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle cx=%2740%27 cy=%2780%27 r=%2716%27 fill=%27%23ffffff33%27/%3E%3Ccircle cx=%27150%27 cy=%2740%27 r=%2712%27 fill=%27%23ffffff2d%27/%3E%3Ccircle cx=%2790%27 cy=%27160%27 r=%2724%27 fill=%27%23ffffff2d%27/%3E%3C/svg%3E')] opacity-40" />

          <div className="relative z-10 space-y-8">
            {/* Categories */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <Button
                    key={category}
                    variant={isActive ? "gradient" : "outline"}
                    className="min-w-[160px] font-body font-semibold shadow-soft"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                );
              })}
            </div>

            {/* Stories Grid */}
            <div className="rounded-3xl bg-white/65 p-6 md:p-8 shadow-soft backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => {
                  const isCompleted = progress.completedStories.includes(story.id);

                  return (
                    <Card
                      key={story.id}
                      className={`p-6 hover:shadow-glow transition-smooth cursor-pointer border-2 animate-scale-in group ${
                        isCompleted ? "border-success bg-success/5" : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="text-xs font-body font-semibold text-accent uppercase">
                              {story.category}
                            </span>
                            <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-smooth">
                              {story.title}
                            </h3>
                          </div>
                          <div className={`p-2 rounded-full ${isCompleted ? "bg-success/20" : "bg-primary/10"}`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{story.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-secondary fill-secondary" />
                            <span>{story.xp} XP</span>
                          </div>
                        </div>

                        <Button
                          variant={isCompleted ? "outline" : "gradient"}
                          className="w-full"
                          onClick={() => !isCompleted && handleCompleteStory(story.id, story.xp)}
                          disabled={isCompleted}
                        >
                          {isCompleted ? "✓ Completado" : "Começar Leitura"}
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

export default Reading;