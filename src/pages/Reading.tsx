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

const Reading = () => {
  const { progress, completeStory } = useProgress();

  const stories = [
    {
      id: 1,
      title: "A Cigarra e a Formiga",
      category: "Fábulas",
      duration: "5 min",
      xp: 50,
      stars: 3,
      completed: false,
    },
    {
      id: 2,
      title: "Chapeuzinho Vermelho",
      category: "Contos Clássicos",
      duration: "8 min",
      xp: 75,
      stars: 3,
      completed: false,
    },
    {
      id: 3,
      title: "Os Três Porquinhos",
      category: "Contos",
      duration: "6 min",
      xp: 60,
      stars: 3,
      completed: false,
    },
    {
      id: 4,
      title: "A Lebre e a Tartaruga",
      category: "Fábulas",
      duration: "4 min",
      xp: 40,
      stars: 3,
      completed: false,
    },
  ];

  const categories = ["Fábulas", "Contos Clássicos", "Contos", "Fábulas"];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  const handleCompleteStory = (storyId: number, xpReward: number) => {
    completeStory(storyId, xpReward);
    toast.success(`🎉 Parabéns! Você ganhou ${xpReward} XP!`);
  };

  const filteredStories = stories.filter((story) => story.category === selectedCategory);

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <img src={readingImage} alt="Leitura" className="w-20 h-20" />
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">
                Área de Leitura
              </h1>
              <p className="text-muted-foreground font-body">
                Explore histórias mágicas e aprenda se divertindo!
              </p>
            </div>
          </div>
          <Mascot message="Vamos ler juntos!" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        {/* Categories */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category, index) => {
              const uniqueKey = `${category}-${index}`;
              const isActive = selectedCategory === category;
              return (
                <Button
                  key={uniqueKey}
                  variant={isActive ? "gradient" : "outline"}
                  className="min-w-[160px] font-body font-semibold"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stories Grid */}
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
  );
};

export default Reading;