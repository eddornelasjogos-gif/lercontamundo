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
      "No coração de um prado dourado, viviam uma cigarra e uma formiga. A cigarra passava os dias cantando e apreciando o sol, enquanto a formiga trabalhava sem parar, carregando pequenas sementes e grãos para o seu formigueiro.\n\nQuando o verão avançou, o prado estava cheio de flores e música. A cigarra cantava alegremente a cada manhã, e a formiga a observava de longe, concentrada em seu trabalho. A cigarra perguntou à formiga: “Por que você trabalha tanto? Venha cantar comigo.” A formiga respondeu: “Eu guardo comida para o inverno.” A cigarra riu e disse que havia muito tempo até o inverno chegar.\n\nO tempo passou e logo a estação mudou. Um frio cortante se espalhou pelo prado; as flores murcharam e as folhas caíram. A cigarra, sem reservas, sentiu fome e frio. Ela foi bater à porta do formigueiro e pediu abrigo e comida. A formiga abriu e disse com calma: “Enquanto cantava, você não guardou nada para as estações frias.”\n\nA cigarra aprendeu a lição: prazer sem preparo pode trazer dificuldades no futuro. A formiga compartilhou um pouco de alimento, mas lembrou que o equilíbrio entre alegria e responsabilidade ajuda a manter a vida segura. Desde então, a cigarra passou a cantar, mas também a juntar pequenas provisões para os dias frios.",
  },

  102: {
    id: 102,
    title: "A Lebre e a Tartaruga",
    category: "Fábulas",
    duration: "4 min",
    xp: 30,
    text:
      "Numa clareira ensolarada, uma lebre famosa por sua rapidez vangloriava-se de sua velocidade. Cansada das repetições, a tartaruga, conhecida por sua calma, disse uma vez: “Vamos ver quem chega primeiro ao grande carvalho.” A lebre riu, convencida da facilidade da prova.\n\nNo dia da corrida, todos os animais se reuniram. A lebre disparou como uma flecha e logo deixou a tartaruga para trás. Confiante de sua vitória, a lebre decidiu descansar sob uma árvore e fechou os olhos por um momento. A lenta e constante tartaruga seguiu andando sem parar.\n\nEnquanto a lebre dormia, a tartaruga avançava passo a passo, sem pressa. Quando a lebre acordou, viu a tartaruga perto do carvalho. Mesmo correndo ao máximo, a lebre não conseguiu alcançá-la a tempo. A tartaruga tocou o tronco e venceu.\n\nA lição ficou clara para todos: velocidade sem constância e disciplina não garante vitória; persistência e dedicação trazem resultados. A lebre aprendeu a respeitar quem trabalha com paciência, e a clareira celebrou a determinação da pequena tartaruga.",
  },

  103: {
    id: 103,
    title: "O Leão e o Rato",
    category: "Fábulas",
    duration: "4 min",
    xp: 30,
    text:
      "Certa manhã, um leão grande e poderoso dormia uma sesta à sombra de uma rocha. Um pequeno rato, curioso e inseguro, correu pelo seu dorso e despertou o leão. Irritado, o leão prendeu o rato com sua enorme pata.\n\nO rato, com voz trêmula, implorou pela vida: “Por favor, me solte. Um dia eu posso retribuir sua bondade.” O leão riu, achando a ideia absurda, mas acabou soltando o pequeno roedor por achar pouca ameaça em poupá-lo.\n\nAlgum tempo depois, o leão foi pego numa armadilha de caçadores: uma rede o prendeu e ele não tinha como se soltar. O rato, ao ouvir os rugidos, correu até lá. Rapidamente, começou a roer as cordas da rede. Com pequenas mordidas e muita coragem, o rato libertou o leão.\n\nO leão, livre e emocionado, agradeceu o rato. Ambos aprenderam que tamanho e força não são a única medida de valor; pequenos atos de bondade e coragem podem salvar o dia. O prado celebrou a amizade improvável entre opostos.",
  },

  104: {
    id: 104,
    title: "A Raposa e as Uvas",
    category: "Fábulas",
    duration: "3 min",
    xp: 25,
    text:
      "Atrás de um muro, uma videira carregada de uvas maduras chamava atenção. Uma raposa faminta caminhou por baixo da videira e saltou para alcançar os cachos, tentando com todas as suas forças. Saltou uma vez, duas vezes — mas não conseguiu.\n\nCansada e frustrada, a raposa olhou para as uvas e disse em voz alta: “Estão verdes e azedas. Eu não as quero.” Ela se afastou com o rabo erguido, fingindo desprezo.\n\nA moral que ficou foi simples: às vezes, quando não conseguimos algo, tendemos a desvalorizar o que não alcançamos para salvar nossa autoestima. A raposa aprendeu, por fim, que é mais honesto admitir a própria limitação do que fingir indiferença.",
  },

  105: {
    id: 105,
    title: "A Galinha dos Ovos de Ouro",
    category: "Fábulas",
    duration: "5 min",
    xp: 35,
    text:
      "Um fazendeiro tinha uma galinha especial: todos os dias, ela botava um ovo de ouro. Cada ovo trazia prosperidade à família, que começou a viver melhor graças à sorte inesperada.\n\nCom o tempo, a ganância tomou conta do fazendeiro. Ele imaginava que, se abrisse a galinha, encontraria um grande tesouro dentro e resolveria sua pobreza de uma vez. Cegado pelo desejo, decidiu matar a galinha para pegar todos os ovos de ouro.\n\nPara sua surpresa e tristeza, ao abrir a galinha não encontrou nada de especial — era apenas uma ave como as outras. Perdeu, assim, a sua fonte diária de riqueza.\n\nA lição permaneceu clara: a impaciência e a ganância podem destruir aquilo que vinha assegurando prosperidade. O fazendeiro aprendeu que cuidar e valorizar o que se tem frequentemente traz mais frutos do que a busca por ganhos rápidos e imprudentes.",
  },

  111: {
    id: 111,
    title: "O Patinho Feio",
    category: "Contos",
    duration: "6 min",
    xp: 45,
    text:
      "Num lago tranquilo, uma ninhada de patinhos nasceu e brincava sob a proteção da mãe. Entre eles, havia um filhote maior e desajeitado, de penas acinzentadas — diferente dos outros. Os irmãos e vizinhos o apelidaram de patinho feio e o rejeitaram.\n\nTriste e solitário, o patinho feio deixou o lago e vagou por campos e fazendas, enfrentando olhares e insultos. Tentou se esconder, mas era constantemente lembrado de sua aparência. O tempo passou e o patinho suportou muitos desafios, sempre buscando um lugar para pertencer.\n\nQuando o frio chegou, o patinho encontrou refúgio em um lago distante, onde cresceu em silêncio. Com o passar das estações, suas penas mudaram; ele descobriu que estava se transformando em um belo cisne. Um dia, ao aproximar-se de um grupo de cisnes, foi acolhido com surpresa e admiração.\n\nAssim, o patinho percebeu que a diferença que o isolara era, na verdade, sua verdadeira beleza emergindo. A história ensina sobre aceitação e paciência: cada um tem seu tempo de florescer, e aquilo que hoje é motivo de tristeza pode se tornar fonte de orgulho amanhã.",
  },

  112: {
    id: 112,
    title: "João e o Pé de Feijão",
    category: "Contos",
    duration: "7 min",
    xp: 50,
    text:
      "João vivia com sua mãe em uma pequena casa de chão batido. Um dia, por necessidade, ela pediu que João vendesse a última vaca da família. No caminho, um homem misterioso ofereceu a João alguns feijões em troca da vaca, prometendo que eram mágicos.\n\nAo voltar, a mãe, enfurecida com a troca, jogou os feijões pela janela e mandou João para sua cama sem jantar. Durante a noite, algo incrível aconteceu: um pé de feijão gigantesco cresceu até as nuvens. Curioso, João escalou a planta e chegou a um reino nas nuvens, lar de um gigante e seus tesouros.\n\nCom coragem e esperteza, João descobriu riquezas e um ganso que botava ovos de ouro. Ele roubou alguns tesouros e voltou para a terra firme para ajudar sua mãe. O gigante perseguiu João, mas o jovem cortou o pé de feijão, fazendo com que o gigante caísse e sumisse.\n\nJoão e sua mãe conheceram prosperidade, mas aprenderam também sobre responsabilidade e medidas: a aventura trouxe bênçãos, mas também mostrou que escolhas perigosas exigem coragem e prudência. A história celebra curiosidade, astúcia e a chance de transformar a sorte com coragem.",
  },

  113: {
    id: 113,
    title: "Cinderela",
    category: "Contos",
    duration: "8 min",
    xp: 55,
    text:
      "Cinderela vivia com sua madrasta e meias-irmãs, que a obrigavam a fazer todo o trabalho da casa. Apesar disso, ela mantinha o coração gentil e sonhava com dias melhores. Um anúncio real convidou todas as jovens do reino para um baile onde o príncipe escolheria sua companheira.\n\nAs irmãs riram da ideia de Cinderela ir ao baile, mas uma fada apareceu e, com mágica, transformou sua roupa simples em um vestido deslumbrante e um par de sapatos de cristal. A fada advertiu: a magia terminaria à meia-noite.\n\nCinderela foi ao baile e encantou o príncipe, que passou a noite inteira conversando com ela. Ao soar a meia-noite, Cinderela saiu às pressas e, ao correr, deixou cair um sapato de cristal. O príncipe, determinado a encontrá-la, percorreu o reino com o sapato em mãos.\n\nAo provar o sapato em muitas jovens, finalmente chegou à casa de Cinderela. O sapato calçou perfeitamente e o príncipe reconheceu-a. Eles se casaram e Cinderela deixou para trás a vida de servidão, mostrando que bondade e coragem podem transformar destinos.",
  },

  114: {
    id: 114,
    title: "Branca de Neve",
    category: "Contos",
    duration: "8 min",
    xp: 55,
    text:
      "Branca de Neve era uma princesa cuja beleza despertava a inveja da rainha, sua madrasta. Ao saber que Branca era mais bela, a rainha ordenou que ela fosse levada à floresta e nunca mais vista. O caçador, comovido, deixou-a fugir, e Branca encontrou abrigo numa casinha habitada por sete anões.\n\nOs anões a acolheram com carinho, e Branca contribuiu com alegria nas tarefas do lar. A rainha, ao descobrir que Branca ainda vivia, preparou-se com artimanhas: disfarçada, ofereceu-lhe uma maçã envenenada. Ao morder, Branca caiu em sono profundo.\n\nQuando os anões a encontraram, acreditaram que havia morrido. A colocaram num caixão de cristal. Um príncipe que passava viu Branca e, tocado por sua inocência, pediu para levá-la consigo. No caminho, em alguns contos, o movimento do transporte fez com que o pedaço envenenado saísse da garganta de Branca; em outros, o beijo do príncipe despertou-a.\n\nBranca despertou e foi levada ao castelo, onde encontrou um novo começo. A história fala sobre amizade verdadeira, a luta contra a inveja e a força do amor que supera perigos e mentiras.",
  },

  115: {
    id: 115,
    title: "O Flautista de Hamelin",
    category: "Contos",
    duration: "6 min",
    xp: 45,
    text:
      "A cidade de Hamelin foi invadida por ratos que devoravam colheitas e incomodavam os moradores. Um flautista vestindo roupas coloridas ofereceu-se para livrar a cidade do problema em troca de pagamento. O assentimento veio, e com sua flauta ele encantou os ratos, que o seguiram até o rio, onde se afogaram.\n\nOs cidadãos, satisfeitos, prometeram pagar ao flautista, mas, quando a tarefa foi cumprida, recusaram-se a honrar o acordo. Sentindo-se enganado e humilhado, o flautista planejou uma última demonstração de seu poder.\n\nEle tocou novamente sua flauta, porém desta vez suas melodias enfeitiçaram as crianças da cidade; elas o seguiram até uma montanha ou uma caverna, dependendo da versão, e desapareceram. A cidade ficou devastada pela perda e pelo remorso.\n\nA história é um lembrete sobre a importância de cumprir promessas e de tratar com justiça aqueles que ajudam. Mostra também o perigo da ingratidão e como ações sem honra podem trazer consequências dolorosas.",
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
              {story.text.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
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