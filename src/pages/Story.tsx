import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";

const STORY_CONTENT: Record<
  number,
  { id: number; title: string; category: string; duration: string; xp: number; text: string }
> = {
  101: {
    id: 101,
    title: "A Cigarra e a Formiga",
    category: "Fábulas",
    duration: "5 min",
    xp: 35,
    text:
      "Era verão, e a cigarra cantava alegremente. A formiga, diligente, guardava comida para o inverno. Quando o frio chegou, a cigarra, sem reservas, pediu ajuda; a formiga lembrou que cantar não enche o celeiro. Moral: Planejamento e trabalho valem a pena.",
  },
  102: {
    id: 102,
    title: "A Lebre e a Tartaruga",
    category: "Fábulas",
    duration: "4 min",
    xp: 30,
    text:
      "A lebre, convencida de sua velocidade, desafiou a tartaruga para uma corrida. Confiando demais, descansou durante a prova. A tartaruga, persistente e constante, venceu. Moral: Devagar e sempre se chega mais longe.",
  },
  103: {
    id: 103,
    title: "O Leão e o Rato",
    category: "Fábulas",
    duration: "4 min",
    xp: 30,
    text:
      "Um rato acordou um leão ao correr sobre ele. O leão o libertou por misericórdia. Mais tarde, o leão ficou preso e foi salvo pelo rato que roeu as cordas. Moral: Pequenos favores podem ser grandes nas horas certas.",
  },
  104: {
    id: 104,
    title: "A Raposa e as Uvas",
    category: "Fábulas",
    duration: "3 min",
    xp: 25,
    text:
      "A raposa tentou pegar uvas num parreiral, mas sem sucesso. Ao desistir, disse que as uvas estavam verdes e azedas. Moral: Às vezes desdenhamos o que não conseguimos alcançar.",
  },
  105: {
    id: 105,
    title: "A Galinha dos Ovos de Ouro",
    category: "Fábulas",
    duration: "5 min",
    xp: 35,
    text:
      "Um fazendeiro tinha uma galinha que botava ovos de ouro. Tomado pela ganância, matou a galinha para pegar todos os ovos de uma vez, e descobriu nada dentro. Moral: Ganância pode destruir o que já funciona.",
  },
  111: {
    id: 111,
    title: "O Patinho Feio",
    category: "Contos",
    duration: "6 min",
    xp: 45,
    text:
      "Um patinho diferente foi rejeitado por parecer estranho. Cresceu e transformou-se em um belo cisne, provando que a beleza e o valor aparecem no tempo certo. Moral: Aceitação e paciência revelam o melhor de cada um.",
  },
  112: {
    id: 112,
    title: "João e o Pé de Feijão",
    category: "Contos",
    duration: "7 min",
    xp: 50,
    text:
      "João trocou uma vaca por feijões mágicos que cresceram até o céu. Lá encontrou um gigante e seus tesouros. Com coragem e esperteza, recuperou riquezas para sua família. Moral: Coragem e curiosidade podem mudar destinos.",
  },
  113: {
    id: 113,
    title: "Cinderela",
    category: "Contos",
    duration: "8 min",
    xp: 55,
    text:
      "Cinderela, maltratada, sonhava com uma vida melhor. Com a ajuda de uma fada, foi ao baile e conquistou o príncipe. Sua bondade foi recompensada. Moral: Gentileza e perseverança abrem portas.",
  },
  114: {
    id: 114,
    title: "Branca de Neve",
    category: "Contos",
    duration: "8 min",
    xp: 55,
    text:
      "Branca de Neve fugiu da rainha má e encontrou abrigo com anões. Depois de muitas provas, foi salva por um príncipe. Moral: Amizade e bravura ajudam a superar perigos.",
  },
  115: {
    id: 115,
    title: "O Flautista de Hamelin",
    category: "Contos",
    duration: "6 min",
    xp: 45,
    text:
      "Uma cidade livre de ratos graças a um flautista que, ao ser traído pela população, levou as crianças embora usando sua música. Moral: Cumprir promessas é essencial.",
  },
};

const Story = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, completeStory } = useProgress();

  const storyId = useMemo(() => (id ? parseInt(id, 10) : NaN), [id]);

  const story = STORY_CONTENT[storyId];

  useEffect(() => {
    if (!story) {
      // If story not found, go back to reading after a short delay
      const t = setTimeout(() => navigate("/reading"), 800);
      return () => clearTimeout(t);
    }
  }, [story, navigate]);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground">História não encontrada. Redirecionando...</p>
      </div>
    );
  }

  const isCompleted = progress.completedStories.includes(storyId);

  const handleComplete = () => {
    if (!isCompleted) {
      completeStory(storyId, story.xp);
      toast.success(`🎉 Você ganhou ${story.xp} XP por ler "${story.title}"!`);
    } else {
      toast(`História já concluída.`);
    }
    navigate("/reading");
  };

  return (
    <div className="min-h-screen pb-10 md:pt-10">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-6 shadow-card border-2 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">{story.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {story.category} • {story.duration} • {story.xp} XP
                </p>
              </div>
              <div>
                <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <article className="prose max-w-none text-foreground">
              <p>{story.text}</p>
              {/* For longer stories you can expand this object with more paragraphs */}
            </article>
          </Card>

          <div className="flex justify-between items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Button variant={isCompleted ? "outline" : "gradient"} onClick={handleComplete}>
              {isCompleted ? "✓ Concluído" : "Concluir Leitura"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;