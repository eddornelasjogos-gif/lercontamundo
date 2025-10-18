import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import cigarraAudio from "@/assets/audio/cigarra-formiga.m4a";
import lebreAudio from "@/assets/audio/lebre-tartaruga.m4a";
import leaoAudio from "@/assets/audio/leao-rato.m4a";
import raposaAudio from "@/assets/audio/raposa-uvas.m4a";
import galinhaAudio from "@/assets/audio/galinha-ovos-ouro.m4a";
import patinhoFeioAudio from "@/assets/audio/patinho-feio.m4a";
import joaoPeDeFeijaoAudio from "@/assets/audio/joao-pe-de-feijao.m4a";
import cinderelaAudio from "@/assets/audio/cinderela.m4a";
import brancaDeNeveAudio from "@/assets/audio/branca-de-neve.m4a";
import flautistaHamelinAudio from "@/assets/audio/flautista-hamelin.m4a";
import chapeuzinhoAudio from "@/assets/audio/chapeuzinho-vermelho.m4a";
import belaAdormecidaAudio from "@/assets/audio/bela-adormecida.m4a";
import rapunzelAudio from "@/assets/audio/rapunzel.m4a";
import pequenaSereiaAudio from "@/assets/audio/pequena-sereia.m4a";
import principeSapoAudio from "@/assets/audio/principe-sapo.m4a";
import rumpelstiltskinAudio from "@/assets/audio/rumpelstiltskin.m4a";
import rainhaDaNeveAudio from "@/assets/audio/rainha-da-neve.m4a";
import gataBorralheiraAudio from "@/assets/audio/gata-borralheira.m4a";
import magicoDeOzAudio from "@/assets/audio/magico-de-oz.m4a";
import pequenoPolegarAudio from "@/assets/audio/pequeno-polegar.m4a";
import tresPorquinhosAudio from "@/assets/audio/tres-porquinhos.m4a";
import pedroLoboAudio from "@/assets/audio/pedro-lobo.m4a";
import simbadMarinheiroAudio from "@/assets/audio/simbad-marinheiro.m4a";
import aliBabaAudio from "@/assets/audio/ali-baba-ladroes.m4a";
import oRouxinolAudio from "@/assets/audio/o-rouxinol.m4a";
import barbaAzulAudio from "@/assets/audio/barba-azul.m4a";
import aFadaVoadoraAudio from "@/assets/audio/a-fada-voadora.m4a";
import oCavaloEOHomemAudio from "@/assets/audio/o-cavalo-e-o-homem.m4a";
import aLendaDaLuaAudio from "@/assets/audio/a-lenda-da-lua.m4a";
import oPescadorEOGenioAudio from "@/assets/audio/o-pescador-e-o-genio.m4a";
import pinocchioAudio from "@/assets/audio/pinocchio.m4a";
import aliceAudio from "@/assets/audio/alice-pais-maravilhas.m4a";
import robinsonCrusoeAudio from "@/assets/audio/robinson-crusoe.m4a";
import ilhaDoTesouroAudio from "@/assets/audio/ilha-do-tesouro.m4a";
import medicoMonstroAudio from "@/assets/audio/medico-monstro.m4a";
import voltaAoMundo80DiasAudio from "@/assets/audio/volta-ao-mundo-80-dias.m4a";
import heidiAudio from "@/assets/audio/heidi.m4a";
import tomSawyerAudio from "@/assets/audio/tom-sawyer.m4a";
import corcundaNotreDameAudio from "@/assets/audio/corcunda-notre-dame.m4a";
import grimmHistoriasSelecionadasAudio from "@/assets/audio/grimm-historias-selecionadas.m4a";
import domQuixoteAudio from "@/assets/audio/dom-quixote.m4a";
import mobyDickAudio from "@/assets/audio/moby-dick.m4a";
import guerraEPazAudio from "@/assets/audio/guerra-e-paz.m4a";
import irmaosKaramazovAudio from "@/assets/audio/irmaos-karamazov.m4a";
import crimeECastigoAudio from "@/assets/audio/crime-e-castigo.m4a";
import raposaUvasImage from "@/assets/raposa-uvas.png";
import galinhaOvosOuroImage from "@/assets/galinha-ovos-ouro.png";
import principeSapoImage from "@/assets/principe-sapo.png";
import rumpelstiltskinImage from "@/assets/rumpelstiltskin.png";
import rainhaDaNeveImage from "@/assets/rainha-da-neve.png";
import gataBorralheiraImage from "@/assets/gata-borralheira.png";
import magicoDeOzImage from "@/assets/magico-de-oz.png";
import pequenoPolegarImage from "@/assets/pequeno-polegar.png";
import tresPorquinhosImage from "@/assets/tres-porquinhos.png";
import pedroLoboImage from "@/assets/pedro-e-o-lobo.png";
import simbadMarinheiroImage from "@/assets/simbad-marinheiro.png";
import aliBabaLadroesImage from "@/assets/ali-baba-ladroes.png";
import oRouxinolImage from "@/assets/o-rouxinol.png";
import barbaAzulImage from "@/assets/barba-azul.png";
import aFadaVoadoraImage from "@/assets/a-fada-voadora.png";
import oCavaloEOHomemImage from "@/assets/o-cavalo-e-o-homem.png";
import aLendaDaLuaImage from "@/assets/a-lenda-da-lua.png";
import oPescadorEOGenioImage from "@/assets/o-pescador-e-o-genio.png";
import cigarraFormigaImage from "@/assets/a-cigarra-e-a-formiga.png";
import lebreTartarugaImage from "@/assets/a-lebre-e-a-tartaruga.png";
import leaoRatoImage from "@/assets/o-leao-e-o-rato.png"; // NOVO: Imagem de O Leão e o Rato

type Difficulty = "easy" | "medium" | "hard" | "very-hard";
const STORAGE_KEY = "userDifficulty";

interface StoryMetadata {
  id: number;
  title: string;
  category: string;
  xp: number;
  stars: number;
}

// Metadados das histórias para determinar a ordem e a categoria
const STORY_METADATA_BY_DIFFICULTY: Record<Difficulty, StoryMetadata[]> = {
    easy: [
      // Fábulas
      { id: 104, title: "A Raposa e as Uvas", category: "Fábulas", xp: 25, stars: 2 },
      { id: 105, title: "A Galinha dos Ovos de Ouro", category: "Fábulas", xp: 35, stars: 2 },
      // Contos Clássicos
      { id: 205, title: "O Príncipe Sapo", category: "Contos Clássicos", xp: 65, stars: 3 },
      { id: 206, title: "Rumpelstiltskin", category: "Contos Clássicos", xp: 70, stars: 3 },
      { id: 207, title: "A Rainha da Neve (trechos)", category: "Contos Clássicos", xp: 80, stars: 3 },
      { id: 208, title: "A Gata Borralheira (versão clássica)", category: "Contos Clássicos", xp: 70, stars: 3 },
      { id: 209, title: "O Mágico de Oz (trechos)", category: "Contos Clássicos", xp: 90, stars: 4 },
      { id: 210, title: "O Pequeno Polegar", category: "Contos Clássicos", xp: 65, stars: 3 },
      // Contos
      { id: 211, title: "Os Três Porquinhos", category: "Contos", xp: 60, stars: 3 },
      { id: 212, title: "Pedro e o Lobo", category: "Contos", xp: 55, stars: 3 },
      { id: 213, title: "Simbad, o Marinheiro (trechos)", category: "Contos", xp: 95, stars: 4 },
      { id: 214, title: "Ali Babá e os Quarenta Ladrões (trechos)", category: "Contos", xp: 95, stars: 4 },
      { id: 215, title: "O Rouxinol", category: "Contos", xp: 65, stars: 3 },
      { id: 216, title: "Barba Azul (resumo)", category: "Contos", xp: 65, stars: 3 },
      { id: 217, title: "A Fada Voadora", category: "Contos", xp: 60, stars: 3 },
      { id: 218, title: "O Cavalo e o Homem", category: "Contos", xp: 60, stars: 3 },
      { id: 219, title: "A Lenda da Lua", category: "Contos", xp: 65, stars: 3 },
      { id: 220, title: "O Pescador e o Gênio", category: "Contos", xp: 70, stars: 3 },
    ],
    medium: [
      // Fábulas
      { id: 101, title: "A Cigarra e a Formiga", category: "Fábulas", xp: 35, stars: 2 },
      { id: 102, title: "A Lebre e a Tartaruga", category: "Fábulas", xp: 30, stars: 2 },
      { id: 103, title: "O Leão e o Rato", category: "Fábulas", xp: 30, stars: 2 },
      // Contos
      { id: 111, title: "O Patinho Feio", category: "Contos", xp: 45, stars: 3 },
      { id: 112, title: "João e o Pé de Feijão", category: "Contos", xp: 50, stars: 3 },
      { id: 113, title: "Cinderela", category: "Contos", xp: 55, stars: 3 },
      { id: 114, title: "Branca de Neve", category: "Contos", xp: 55, stars: 3 },
      { id: 115, title: "O Flautista de Hamelin", category: "Contos", xp: 45, stars: 3 },
      // Contos Clássicos
      { id: 201, title: "Chapeuzinho Vermelho", category: "Contos Clássicos", xp: 70, stars: 3 },
      { id: 202, title: "A Bela Adormecida", category: "Contos Clássicos", xp: 75, stars: 3 },
      { id: 203, title: "Rapunzel", category: "Contos Clássicos", xp: 70, stars: 3 },
      { id: 204, title: "A Pequena Sereia (versão resumida)", category: "Contos Clássicos", xp: 80, stars: 3 },
    ],
    hard: [
      // Clássicos (301-310)
      { id: 301, title: "Pinóquio", category: "Clássicos", xp: 120, stars: 4 },
      { id: 302, title: "Alice no País das Maravilhas", category: "Clássicos", xp: 130, stars: 4 },
      { id: 303, title: "As Aventuras de Robinson Crusoé", category: "Clássicos", xp: 150, stars: 4 },
      { id: 304, title: "A Ilha do Tesouro", category: "Clássicos", xp: 140, stars: 4 },
      { id: 305, title: "O Médico e o Monstro (trecho)", category: "Clássicos", xp: 125, stars: 4 },
      { id: 306, title: "A Volta ao Mundo em 80 Dias (trechos)", category: "Clássicos", xp: 150, stars: 4 },
      { id: 307, title: "Heidi (trechos)", category: "Clássicos", xp: 120, stars: 4 },
      { id: 308, title: "A História de Tom Sawyer (trechos)", category: "Clássicos", xp: 130, stars: 4 },
      { id: 309, title: "O Corcunda de Notre-Dame (trechos)", category: "Clássicos", xp: 140, stars: 4 },
      { id: 310, title: "Grimm: Histórias Selecionadas (trechos)", category: "Clássicos", xp: 125, stars: 4 },
    ],
    "very-hard": [
      // Clássicos (trechos) (401-405)
      { id: 401, title: "Dom Quixote (trechos)", category: "Clássicos", xp: 180, stars: 5 },
      { id: 402, title: "Moby Dick (trechos)", category: "Clássicos", xp: 200, stars: 5 },
      { id: 403, title: "Guerra e Paz (trecho simplificado)", category: "Clássicos", xp: 200, stars: 5 },
      { id: 404, title: "Os Irmãos Karamázov (trecho)", category: "Clássicos", xp: 200, stars: 5 },
      { id: 405, title: "Crime e Castigo (trecho)", category: "Clássicos", xp: 180, stars: 5 },
    ],
} as const;


const STORY_CONTENT: Record<
  number,
  { id: number; title: string; category: string; xp: number; text: string }
> = {
  101: {
    id: 101,
    title: "A Cigarra e a Formiga",
    category: "Fábulas",
    xp: 35,
    text:
      "No coração de um prado dourado, viviam uma cigarra e uma formiga. A cigarra passava os dias cantando e apreciando o sol, enquanto a formiga trabalhava sem parar, carregando pequenas sementes e grãos para o seu formigueiro.\n\nQuando o verão avançou, o prado estava cheio de flores e música. A cigarra cantava alegremente a cada manhã, e a formiga a observava de longe, concentrada em seu trabalho. A cigarra perguntou à formiga: “Por que você trabalha tanto? Venha cantar comigo.” A formiga respondeu: “Eu guardo comida para o inverno.” A cigarra riu e disse que havia muito tempo até o inverno chegar.\n\nO tempo passou e logo a estação mudou. Um frio cortante se espalhou pelo prado; as flores murcharam e as folhas caíram. A cigarra, sem reservas, sentiu fome e frio. Ela foi bater à porta do formigueiro e pediu abrigo e comida. A formiga abriu e disse com calma: “Enquanto cantava, você não guardou nada para as estações frias.”\n\nA cigarra aprendeu a lição: prazer sem preparo pode trazer dificuldades no futuro. A formiga compartilhou um pouco de alimento, mas lembrou que o equilíbrio entre alegria e responsabilidade ajuda a manter a vida segura. Desde então, a cigarra passou a cantar, mas também a juntar pequenas provisões para os dias frios.",
  },

  102: {
    id: 102,
    title: "A Lebre e a Tartaruga",
    category: "Fábulas",
    xp: 30,
    text:
      "Numa clareira ensolarada, uma lebre famosa por sua rapidez vangloriava-se de sua velocidade. Cansada das repetições, a tartaruga, conhecida por sua calma, disse uma vez: “Vamos ver quem chega primeiro ao grande carvalho.” A lebre riu, convencida da facilidade da prova.\n\nNo dia da corrida, todos os animais se reuniram. A lebre disparou como uma flecha e logo deixou a tartaruga para trás. Confiante de sua vitória, a lebre decidiu descansar sob uma árvore e fechou os olhos por um momento. A lenta e constante tartaruga seguiu andando sem parar.\n\nEnquanto a lebre dormia, a tartaruga avançava passo a passo, sem pressa. Quando a lebre acordou, viu a tartaruga perto do carvalho. Mesmo correndo ao máximo, a lebre não conseguiu alcançá-la a tempo. A tartaruga tocou o tronco e venceu.\n\nA lição ficou clara para todos: velocidade sem constância e disciplina não garante vitória; persistência e dedicação trazem resultados. A lebre aprendeu a respeitar quem trabalha com paciência, e a clareira celebrou a determinação da pequena tartaruga.",
  },

  103: {
    id: 103,
    title: "O Leão e o Rato",
    category: "Fábulas",
    xp: 30,
    text:
      "Certa manhã, um leão grande e poderoso dormia uma sesta à sombra de uma rocha. Um pequeno rato, curioso e inseguro, correu pelo seu dorso e despertou o leão. Irritado, o leão prendeu o rato com sua enorme pata.\n\nO rato, com voz trêmula, implorou pela vida: “Por favor, me solte. Um dia eu posso retribuir sua bondade.” O leão riu, achando a ideia absurda, mas acabou soltando o pequeno roedor por achar pouca ameaça em poupá-lo.\n\nAlgum tempo depois, o leão foi pego numa armadilha de caçadores: uma rede o prendeu e ele não tinha como se soltar. O rato, ao ouvir os rugidos, correu até lá. Rapidamente, começou a roer as cordas da rede. Com pequenas mordidas e muita coragem, o rato libertou o leão.\n\nO leão, livre e emocionado, agradeceu o rato. Ambos aprenderam que tamanho e força não são a única medida de valor; pequenos atos de bondade e coragem podem salvar o dia. O prado celebrou a amizade improvável entre opostos.",
  },

  104: {
    id: 104,
    title: "A Raposa e as Uvas",
    category: "Fábulas",
    xp: 25,
    text:
      "Atrás de um muro, uma videira carregada de uvas maduras chamava atenção. Uma raposa faminta caminhou por baixo da videira e saltou para alcançar os cachos, tentando com todas as suas forças. Saltou uma vez, duas vezes — mas não conseguiu.\n\nCansada e frustrada, a raposa olhou para as uvas e disse em voz alta: “Estão verdes e azedas. Eu não as quero.” Ela se afastou com o rabo erguido, fingindo desprezo.\n\nA moral que ficou foi simples: às vezes, quando não conseguimos algo, tendemos a desvalorizar o que não alcançamos para salvar nossa autoestima. A raposa aprendeu, por fim, que é mais honesto admitir a própria limitação do que fingir indiferença.",
  },

  105: {
    id: 105,
    title: "A Galinha dos Ovos de Ouro",
    category: "Fábulas",
    xp: 35,
    text:
      "Um fazendeiro tinha uma galinha especial: todos os dias, ela botava um ovo de ouro. Cada ovo trazia prosperidade à família, que começou a viver melhor graças à sorte inesperada.\n\nCom o tempo, a ganância tomou conta do fazendeiro. Ele imaginava que, se abrisse a galinha, encontraria um grande tesouro dentro e resolveria sua pobreza de uma vez. Cegado pelo desejo, decidiu matar a galinha para pegar todos os ovos de ouro.\n\nPara sua surpresa e tristeza, ao abrir a galinha não encontrou nada de especial — era apenas uma ave como as outras. Perdeu, assim, a sua fonte diária de riqueza.\n\nA lição permaneceu clara: a impaciência e a ganância podem destruir aquilo que vinha assegurando prosperidade. O fazendeiro aprendeu que cuidar e valorizar o que se tem frequentemente traz mais frutos do que a busca por ganhos rápidos e imprudentes.",
  },

  111: {
    id: 111,
    title: "O Patinho Feio",
    category: "Contos",
    xp: 45,
    text:
      "Num lago tranquilo, uma ninhada de patinhos nasceu e brincava sob a proteção da mãe. Entre eles, havia um filhote maior e desajeitado, de penas acinzentadas — diferente dos outros. Os irmãos e vizinhos o apelidaram de patinho feio e o rejeitaram.\n\nTriste e solitário, o patinho feio deixou o lago e vagou por campos e fazendas, enfrentando olhares e insultos. Tentou se esconder, mas era constantemente lembrado de sua aparência. O tempo passou e o patinho suportou muitos desafios, sempre buscando um lugar para pertencer.\n\nQuando o frio chegou, o patinho encontrou refúgio em um lago distante, onde cresceu em silêncio. Com o passar das estações, suas penas mudaram; ele descobriu que estava se transformando em um belo cisne. Um dia, ao aproximar-se de um grupo de cisnes, foi acolhido com surpresa e admiração.\n\nAssim, o patinho percebeu que a diferença que o isolara era, na verdade, sua verdadeira beleza emergindo. A história ensina sobre aceitação e paciência: cada um tem seu tempo de florescer, e aquilo que hoje é motivo de tristeza pode se tornar fonte de orgulho amanhã.",
  },

  112: {
    id: 112,
    title: "João e o Pé de Feijão",
    category: "Contos",
    xp: 50,
    text:
      "João vivia com sua mãe em uma pequena casa de chão batido. Um dia, por necessidade, ela pediu que João vendesse a última vaca da família. No caminho, um homem misterioso ofereceu a João alguns feijões em troca da vaca, prometendo que eram mágicos.\n\nAo voltar, a mãe, enfurecida com a troca, jogou os feijões pela janela e mandou João para sua cama sem jantar. Durante a noite, algo incrível aconteceu: um pé de feijão gigantesco cresceu até as nuvens. Curioso, João escalou a planta e chegou a um reino nas nuvens, lar de um gigante e seus tesouros.\n\nCom coragem e esperteza, João descobriu riquezas e um ganso que botava ovos de ouro. Ele roubou alguns tesouros e voltou para a terra firme para ajudar sua mãe. O gigante perseguiu João, mas o jovem cortou o pé de feijão, fazendo com que o gigante caísse e sumisse.\n\nJoão e sua mãe conheceram prosperidade, mas aprenderam também sobre responsabilidade e medidas: a aventura trouxe bênçãos, mas também mostrou que escolhas perigosas exigem coragem e prudência. A história celebra curiosidade, astúcia e a chance de transformar a sorte com coragem.",
  },

  113: {
    id: 113,
    title: "Cinderela",
    category: "Contos",
    xp: 55,
    text:
      "Cinderela vivia com sua madrasta e meias-irmãs, que a obrigavam a fazer todo o trabalho da casa. Apesar disso, ela mantinha o coração gentil e sonhava com dias melhores. Um anúncio real convidou todas as jovens do reino para um baile onde o príncipe escolheria sua companheira.\n\nAs irmãs riram da ideia de Cinderela ir ao baile, mas uma fada apareceu e, com mágica, transformou sua roupa simples em um vestido deslumbrante e um par de sapatos de cristal. A fada advertiu: a magia terminaria à meia-noite.\n\nCinderela foi ao baile e encantou o príncipe, que passou a noite inteira conversando com ela. Ao soar a meia-noite, Cinderela saiu às pressas e, ao correr, deixou cair um sapato de cristal. O príncipe, determinado a encontrá-la, percorreu o reino com o sapato em mãos.\n\nAo provar o sapato em muitas jovens, finalmente chegou à casa de Cinderela. O sapato calçou perfeitamente e o príncipe reconheceu-a. Eles se casaram e Cinderela deixou para trás a vida de servidão, mostrando que bondade e coragem podem transformar destinos.",
  },

  114: {
    id: 114,
    title: "Branca de Neve",
    category: "Contos",
    xp: 55,
    text:
      "Branca de Neve era uma princesa cuja beleza despertava a inveja da rainha, sua madrasta. Ao saber que Branca era mais bela, a rainha ordenou que ela fosse levada à floresta e nunca mais vista. O caçador, comovido, deixou-la fugir, e Branca encontrou abrigo numa casinha habitada por sete anões.\n\nOs anões a acolheram com carinho, e Branca contribuiu com alegria nas tarefas do lar. A rainha, ao descobrir que Branca ainda vivia, preparou-se com artimanhas: disfarçada, ofereceu-lhe uma maçã envenenada. Ao morder, Branca caiu em sono profundo.\n\nQuando os anões a encontraram, acreditaram que havia morrido. A colocaram num caixão de cristal. Um príncipe que passava viu Branca e, tocado por sua inocência, pediu para levá-la consigo. No caminho, em alguns contos, o movimento do transporte fez com que o pedaço envenenado saísse da garganta de Branca; em outros, o beijo do príncipe despertou-a.\n\nBranca despertou e foi levada ao castelo, onde encontrou um novo começo. A história fala sobre amizade verdadeira, a luta contra a inveja e a força do amor que supera perigos e mentiras.",
  },

  115: {
    id: 115,
    title: "O Flautista de Hamelin",
    category: "Contos",
    xp: 45,
    text:
      "A cidade de Hamelin foi invadida por ratos que devoravam colheitas e incomodavam os moradores. Um flautista vestindo roupas coloridas ofereceu-se para livrar a cidade do problema em troca de pagamento. O assentimento veio, e com sua flauta ele encantou os ratos, que o seguiram até o rio, onde se afogaram.\n\nOs cidadãos, satisfeitos, prometeram pagar ao flautista, mas, quando a tarefa foi cumprida, recusaram-se a honrar o acordo. Sentindo-se enganado e humilhado, o flautista planejou uma última demonstração de seu poder.\n\nEle tocou novamente sua flauta, porém desta vez suas melodias enfeitiçaram as crianças da cidade; elas o seguiram até uma montanha ou uma caverna, dependendo da versão, e desapareceram. A cidade ficou devastada pela perda e pelo remorso.\n\nA história é um lembrete sobre a importância de cumprir promessas e de tratar com justiça aqueles que ajudam. Mostra também o perigo da ingratidão e como ações sem honra podem trazer consequências dolorosas.",
  },

  /* Nível médio (201–220) - textos completos */
  201: {
    id: 201,
    title: "Chapeuzinho Vermelho",
    category: "Contos Clássicos",
    xp: 70,
    text:
      "Era uma vez uma menina muito querida por todos, que ganhou de sua avó um capuz vermelho. Desde então, passou a usá-lo sempre, e logo ficou conhecida como Chapeuzinho Vermelho.\n\nCerto dia, sua mãe pediu que levasse uma cesta de bolo e mel para a avó doente, que morava do outro lado da floresta. A mãe alertou: “Não fale com estranhos e não saia do caminho.” No percurso, Chapeuzinho encontrou um lobo muito esperto. Inocente, contou para onde ia e o que levava. O lobo sugeriu que ela colhesse flores para alegrar a avó e tomou um atalho.\n\nO lobo chegou primeiro, fingiu ser a neta e entrou na casa. Trancou a avó no armário (ou a devorou, em algumas versões) e vestiu suas roupas, deitando-se na cama. Quando Chapeuzinho entrou, estranhou: “Vovó, que olhos grandes!” “É para te ver melhor.” “Que orelhas grandes!” “É para te ouvir melhor.” “Que boca grande!” “É para te devorar!” Saltando, o lobo avançou sobre a menina.\n\nUm caçador que passava ouviu a confusão, entrou, salvou Chapeuzinho e libertou a avó. O lobo foi impedido de fazer mais maldades. Chapeuzinho prometeu não conversar com estranhos e seguir sempre os conselhos de quem a ama. E, desde então, as visitas à avó foram mais cuidadosas e felizes.",
  },

  202: {
    id: 202,
    title: "A Bela Adormecida",
    category: "Contos Clássicos",
    xp: 75,
    text:
      "Num reino distante, nasceu uma princesa tão esperada que o rei realizou uma grande festa e chamou fadas madrinhas para conceder dons. Uma fada ressentida, não convidada, lançou uma maldição: ao completar quinze anos, a princesa espetaria o dedo num fuso e cairia em sono profundo.\n\nO rei mandou destruir todos os fusos do reino, mas no dia do aniversário, a princesa encontrou uma velha fiandeira numa torre e, curiosa, tocou o fuso. Caiu adormecida, e todo o castelo mergulhou em sono mágico. Uma floresta espessa cresceu ao redor, protegendo o lugar.\n\nTempos depois, muitos príncipes tentaram atravessar a mata e falharam. Um dia, um jovem príncipe chegou quando a floresta se abriu como por encanto. Ao ver a princesa, comovido, beijou-a. O feitiço se quebrou, todos despertaram e o castelo ganhou vida novamente.\n\nHouve festa, casamento e reconciliação. O reino aprendeu que nem todas as maldições são eternas e que paciência, coragem e cuidado podem acordar o que parece perdido.",
  },

  203: {
    id: 203,
    title: "Rapunzel",
    category: "Contos Clássicos",
    xp: 70,
    text:
      "Um casal desejava muito um filho. Durante a gravidez, a mulher ansiou por comer rapôncios (rapunzéis) do jardim de uma feiticeira. O marido pegou escondido, foi descoberto e, para evitar a fúria da bruxa, prometeu entregar a criança quando nascesse.\n\nA menina cresceu linda e recebeu o nome de Rapunzel. A feiticeira a criou numa torre sem portas, apenas com uma janela alta. “Rapunzel, jogue suas tranças!”, dizia a bruxa para subir. Um príncipe ouviu o canto da jovem, aprendeu o segredo das tranças e subiu. Eles se apaixonaram e planejaram fugir.\n\nA bruxa descobriu, cortou os cabelos de Rapunzel e a levou para o deserto. Quando o príncipe subiu, foi enganado e caiu sobre espinhos, ficando cego. Mesmo assim, ele vagou guiado pela lembrança da voz de Rapunzel.\n\nAnos depois, reencontraram-se. As lágrimas de Rapunzel curaram os olhos do príncipe. Eles voltaram ao reino, construíram uma vida livre e compreenderam que amor e esperança podem vencer o isolamento.",
  },

  204: {
    id: 204,
    title: "A Pequena Sereia (versão resumida)",
    category: "Contos Clássicos",
    xp: 80,
    text:
      "No fundo do mar vivia uma jovem sereia curiosa, fascinada pelo mundo dos humanos. Em uma tempestade, salvou um príncipe e, desde então, desejou reencontrá-lo na superfície.\n\nDeterminada, procurou a bruxa do mar, que ofereceu um feitiço: pernas humanas em troca de sua voz. Cada passo doeria como lâminas, e se o príncipe amasse outra, a sereia se desfaria em espuma. Mesmo assim, ela aceitou. Na terra, fez amizade com o príncipe, mas ele não reconheceu que fora ela quem o salvara.\n\nSeduzido por outra princesa, o príncipe se casou. À sereia restou a chance de voltar ao mar se ferisse o amado, mas ela escolheu o amor e a bondade. Em algumas versões, tornou-se espuma; em outras, ganhou uma nova forma de existir e aprender.\n\nSeu destino, ainda que doloroso, fala de identidade, sacrifício e da busca por um lugar no mundo — e lembra que escolhas feitas por amor têm valor próprio.",
  },

  205: {
    id: 205,
    title: "O Príncipe Sapo",
    category: "Contos Clássicos",
    xp: 65,
    text:
      "Uma princesa deixou cair sua bola de ouro no lago. Um sapo apareceu e ofereceu ajuda em troca de amizade e hospitalidade no castelo. A princesa prometeu, mas ao recuperar a bola tentou fugir do acordo.\n\nO sapo foi até o castelo e pediu o combinado. A contragosto, a princesa o deixou comer à sua mesa e descansar em seu quarto. Em algumas versões, um gesto de ternura — um beijo, um abraço ou cumprir a palavra — quebra o encanto e transforma o sapo em príncipe.\n\nA princesa aprendeu sobre respeito às promessas e sobre olhar para além das aparências. O príncipe, libertado, mostrou gentileza e gratidão. Juntos, tornaram-se exemplo de responsabilidade e empatia.",
  },

  206: {
    id: 206,
    title: "Rumpelstiltskin",
    category: "Contos Clássicos",
    xp: 70,
    text:
      "Um moleiro gabou-se ao rei dizendo que sua filha transformava palha em ouro. O rei, ávido, trancou a jovem num celeiro e exigiu o impossível. Desesperada, ela recebeu a visita de um homenzinho misterioso, que fez o milagre em troca de seus colares, anéis e, por fim, da promessa do primeiro filho. Quando a moça casou com o rei e teve um bebê, o ser voltou para cobrar. Com pena, ofereceu-lhe um acordo: se ela descobrisse seu nome em três dias, ficaria com a criança. Mensageiros rodaram o reino até flagrarem o homenzinho dançando no bosque e cantando: “Ninguém sabe que me chamo Rumpelstiltskin.” Ao ouvir o nome, o pacto se desfez. O pequeno enfureceu-se e desapareceu. A rainha salvou o filho e entendeu o peso das palavras — e de nunca aceitar acordos sem saber o preço.",
  },

  207: {
    id: 207,
    title: "A Rainha da Neve (trechos)",
    category: "Contos Clássicos",
    xp: 80,
    text:
      "Cacos de um espelho mágico caíram nos olhos e no coração do menino Kai, tornando-o frio com quem amava. A Rainha da Neve o levou para um palácio gelado, onde tudo parecia perfeito, mas nada aquecia a alma.\n\nGerda, sua amiga, partiu numa longa jornada. Encontrou ajudantes inesperados — um corvo falante, uma senhora do jardim, um príncipe bondoso e até ladrões — e nunca desistiu. Cada gesto gentil abria um caminho.\n\nNo palácio, as lágrimas de Gerda caíram sobre Kai e derreteram o gelo do coração. Ele voltou a enxergar o mundo com calor e verdade. De mãos dadas, os dois regressaram, provando que amizade e amor vencem a frieza da indiferença.",
  },

  208: {
    id: 208,
    title: "A Gata Borralheira (versão clássica)",
    category: "Contos Clássicos",
    xp: 70,
    text:
      "Após a morte do pai, Cinderela ficou sob a tirania da madrasta e das irmãs, que a obrigavam a viver junto às cinzas da lareira. Mesmo assim, manteve a bondade.\n\nQuando o rei anunciou um baile, uma fada madrinha transformou abóbora em carruagem, ratos em cocheiros e trapos em vestido. A única condição: voltar antes da meia-noite. No baile, Cinderela encantou o príncipe, mas correu ao soar das doze badaladas, deixando um sapatinho de cristal. O príncipe procurou a dona do sapato por todo o reino. Ao encontrá-la, o calçado serviu. Cinderela foi reconhecida, casou-se com o príncipe e mostrou que gentileza e coragem podem superar a injustiça.",
  },

  209: {
    id: 209,
    title: "O Mágico de Oz (trechos)",
    category: "Contos Clássicos",
    xp: 90,
    text:
      "Um ciclone levou Dorothy e seu cão Totó do Kansas para a Terra de Oz. Na estrada de tijolos amarelos, ela conheceu o Espantalho, que queria um cérebro, o Homem de Lata, que queria um coração, e o Leão, que buscava coragem.\n\nJuntos, enfrentaram perigos e foram ao encontro do Mágico na Cidade das Esmeraldas. Depois de muitas provas, descobriram que o Mágico era apenas um homem comum. Ainda assim, compreenderam que já possuíam aquilo que tanto buscavam: o Espantalho tinha ideias, o Homem de Lata era sensível, e o Leão, valente.\n\nCom a ajuda de sapatos mágicos, Dorothy voltou para casa e entendeu que não há lugar como o lar — e que nossas qualidades florescem quando caminhamos com amigos.",
  },

  210: {
    id: 210,
    title: "O Pequeno Polegar",
    category: "Contos Clássicos",
    xp: 65,
    text:
      "Pequeno no tamanho, grande na esperteza: assim era o Pequeno Polegar. Em tempos de fome, ele percebeu que os pais planejavam abandonar os filhos na floresta e tentou marcar o caminho com migalhas, que os pássaros comeram.\n\nPerdidos, os irmãos enfrentaram perigos e a casa de um ogro. Com astúcia, o menino trocou gorros, enganou inimigos e salvou a todos. Ao final, recuperou riquezas do ogro e levou a família à segurança.\n\nA história mostra que coragem e inteligência podem proteger quem amamos mesmo nas maiores dificuldades.",
  },
  
  211: {
    id: 211,
    title: "Os Três Porquinhos",
    category: "Contos",
    xp: 60,
    text:
      "Três porquinhos, Cícero, Heitor e Prático, deixaram a casa da mãe para construir suas próprias moradias. Cícero, o mais preguiçoso, fez sua casa de palha. Heitor, um pouco mais cuidadoso, usou madeira. Prático, o mais esperto e trabalhador, construiu a sua com tijolos resistentes.\n\nLogo, o Lobo Mau apareceu. Ele soprou a casa de palha de Cícero e a de madeira de Heitor, que correram apavorados para a casa de Prático. O Lobo tentou soprar a casa de tijolos, mas ela permaneceu firme. Furioso, ele tentou entrar pela chaminé.\n\nPrático, prevendo a astúcia do Lobo, colocou um caldeirão de água fervente na lareira. O Lobo caiu dentro e fugiu, queimado e derrotado. Os três porquinhos viveram seguros, e Cícero e Heitor aprenderam que o trabalho duro e a prudência são a melhor defesa contra o perigo.",
  },
  212: {
    id: 212,
    title: "Pedro e o Lobo",
    category: "Contos",
    "xp": 55,
    text:
      "Pedro, um jovem pastor, vivia perto de uma floresta perigosa. Para se divertir, ele gritava que o lobo estava atacando, fazendo com que os aldeões corressem para ajudá-lo. Depois de ser enganado algumas vezes, os aldeões pararam de acreditar em Pedro.\n\nUm dia, o lobo de verdade apareceu e começou a ameaçar o rebanho. Pedro gritou por socorro, mas ninguém veio. Os aldeões pensaram que era mais uma de suas brincadeiras. O lobo conseguiu levar algumas ovelhas.\n\nTriste e arrependido, Pedro aprendeu uma lição dolorosa: a mentira destrói a confiança. Ele prometeu nunca mais enganar ninguém e, com o tempo e a verdade, reconquistou a confiança dos aldeões, mostrando que a honestidade é mais valiosa que qualquer piada.",
  },
  213: {
    id: 213,
    title: "Simbad, o Marinheiro (trechos)",
    category: "Contos",
    xp: 95,
    text:
      "Simbad, um mercador de Bagdá, herdou uma fortuna, mas a gastou rapidamente. Decidiu então embarcar em viagens perigosas para recuperar sua riqueza. Em sua primeira viagem, foi abandonado em uma ilha que era, na verdade, uma baleia adormecida.\n\nEm outras jornadas, Simbad enfrentou aves gigantes, serpentes marinhas e ilhas cheias de diamantes guardadas por criaturas terríveis. Ele usou sua inteligência e coragem para escapar de cada perigo, sempre voltando para casa com mais riquezas e histórias incríveis.\n\nSimbad aprendeu que a vida é uma aventura constante, cheia de riscos e recompensas. Ele usou sua experiência para se tornar um homem sábio e generoso, ensinando que a perseverança e a astúcia são essenciais para navegar pelos desafios da vida.",
  },
  214: {
    id: 214,
    title: "Ali Babá e os Quarenta Ladrões (trechos)",
    category: "Contos",
    xp: 95,
    text:
      "Ali Babá, um pobre lenhador, descobriu por acaso o esconderijo secreto de quarenta ladrões. Ele ouviu a senha mágica, 'Abre-te Sésamo', que abria a porta de uma caverna cheia de tesouros. Ali Babá levou um pouco do ouro para casa, mas manteve o segredo.\n\nSeu irmão, Cássim, ganancioso, forçou Ali Babá a revelar o segredo. Cássim entrou na caverna, mas esqueceu a senha para sair e foi capturado pelos ladrões. Ali Babá, com a ajuda de sua esperta serva Morgiana, conseguiu enganar os ladrões e recuperar o corpo do irmão.\n\nOs ladrões tentaram se vingar, mas Morgiana, com sua inteligência e lealdade, frustrou todos os planos deles, salvando a vida de Ali Babá. A história mostra que a ganância pode levar à ruína, e que a lealdade e a inteligência são tesouros inestimáveis.",
  },
  215: {
    id: 215,
    title: "O Rouxinol",
    category: "Contos",
    xp: 65,
    text:
      "O Imperador da China amava o canto de um rouxinol que vivia na floresta. O pássaro era simples, mas sua música era a mais bela do mundo, capaz de tocar o coração de todos. Um dia, o Imperador recebeu um rouxinol mecânico, cravejado de joias, que cantava sempre a mesma melodia.\n\nO rouxinol de verdade, sentindo-se esquecido, voou para longe. O pássaro mecânico quebrou, e o Imperador adoeceu de tristeza. Quando estava à beira da morte, o rouxinol de verdade voltou e cantou. Sua música trouxe vida e alegria de volta ao Imperador.\n\nO Imperador aprendeu que a beleza e a arte verdadeiras vêm da natureza e do coração, e não de imitações luxuosas. Ele convidou o rouxinol a voltar, e o pássaro aceitou, contanto que pudesse cantar sobre a vida simples do povo, lembrando ao Imperador a importância da humildade.",
  },
  216: {
    id: 216,
    title: "Barba Azul (resumo)",
    category: "Contos",
    xp: 65,
    text:
      "Barba Azul era um homem rico e poderoso, mas temido por sua barba azul. Ele se casou com uma jovem, e logo após o casamento, precisou viajar. Deu à esposa as chaves do castelo, permitindo que ela abrisse todos os cômodos, exceto um pequeno quarto secreto, cuja chave era pequena e dourada.\n\nA curiosidade da esposa foi maior que a obediência. Ela abriu o quarto proibido e descobriu os corpos das esposas anteriores de Barba Azul. Horrorizada, deixou cair a chave no sangue, manchando-a permanentemente.\n\nBarba Azul voltou, descobriu a mancha na chave e soube da desobediência. Quando ele estava prestes a matá-la, os irmãos da esposa chegaram e a salvaram. A história é um conto de advertência sobre a curiosidade perigosa e a importância de confiar nos instintos, mas também sobre a tirania e a busca por justiça.",
  },
  217: {
    id: 217,
    title: "A Fada Voadora",
    category: "Contos",
    xp: 60,
    text:
      "Em um jardim mágico, vivia uma fada que não conseguia voar. Enquanto as outras fadas dançavam no ar, ela ficava no chão, triste. Um dia, um velho sábio disse que ela só voaria se ajudasse alguém sem esperar nada em troca.\n\nA fada encontrou um pássaro ferido e cuidou dele com carinho e paciência. Ela o alimentou e protegeu até que ele pudesse voar novamente. Quando o pássaro se curou e voou para o céu, a fada sentiu uma leveza no coração.\n\nNesse momento, suas asas brilharam e ela conseguiu voar pela primeira vez. A fada descobriu que a verdadeira magia não estava em suas asas, mas na bondade de seu coração. Ela passou a voar pelo jardim, ajudando todos que precisavam, e sua alegria se espalhou por todo o reino.",
  },
  218: {
    id: 218,
    title: "O Cavalo e o Homem",
    category: "Contos",
    xp: 60,
    text:
      "Um cavalo selvagem vivia livre e feliz, mas era constantemente ameaçado por um leão. Para se proteger, o cavalo pediu ajuda a um homem, que prometeu afastar o leão em troca de permissão para colocar um freio e uma sela no cavalo.\n\nO cavalo concordou. O homem montou nele, perseguiu o leão e o afugentou. Quando o perigo passou, o cavalo pediu ao homem para remover o freio e a sela, mas o homem se recusou. Ele havia gostado de ter o controle.\n\nO cavalo percebeu que, ao buscar proteção, havia perdido sua liberdade. A fábula ensina que, ao aceitar ajuda, devemos ser cautelosos para não trocar um perigo por outro, e que a liberdade é um bem que deve ser protegido a todo custo.",
  },
  219: {
    id: 219,
    title: "A Lenda da Lua",
    category: "Contos",
    xp: 65,
    text:
      "Há muito tempo, o Sol e a Lua eram amantes. O Sol era quente e brilhante, e a Lua, fria e misteriosa. Eles se amavam profundamente, mas não podiam ficar juntos, pois se o fizessem, o mundo seria destruído pelo calor e pela escuridão.\n\nOs deuses, com pena, permitiram que eles se vissem apenas por um breve momento no horizonte, durante o nascer e o pôr do sol. Mas isso não era suficiente. A Lua, triste, começou a chorar, e suas lágrimas caíram na Terra, formando os rios e os oceanos.\n\nPara confortá-la, os deuses criaram as estrelas, para que a Lua nunca se sentisse sozinha. E assim, a Lua brilha à noite, refletindo a luz do Sol, lembrando a todos que o amor verdadeiro pode existir mesmo na distância, e que a saudade pode criar beleza no mundo.",
  },
  220: {
    id: 220,
    title: "O Pescador e o Gênio",
    category: "Contos",
    xp: 70,
    text:
      "Um pobre pescador lançou sua rede e, em vez de peixes, pescou um jarro de cobre selado. Ao abri-lo, um Gênio enorme e furioso saiu, prometendo matar o pescador por tê-lo libertado após séculos de prisão. O pescador, esperto, não se desesperou.\n\nEle duvidou que o Gênio fosse tão grande a ponto de caber de volta no jarro. O Gênio, ofendido, demonstrou seu poder voltando para o jarro. O pescador selou o jarro rapidamente, prendendo o Gênio novamente.\n\nO Gênio implorou para ser libertado, prometendo riquezas. O pescador, após negociar, libertou-o, mas exigiu que o Gênio o ajudasse a pescar. O Gênio, humilhado, cumpriu a promessa. O pescador aprendeu que a inteligência e a calma são mais poderosas que a força bruta, e que a astúcia pode transformar a ameaça em oportunidade.",
  },

  /* Nível difícil (301–310) - textos completos */
  301: {
    id: 301,
    title: "Pinóquio",
    category: "Clássicos",
    xp: 120,
    text:
      "Gepeto, um carpinteiro bondoso, construiu um boneco de madeira e desejou que ele virasse um menino de verdade. Numa noite estrelada, uma fada atendeu ao pedido: deu vida ao boneco e o chamou de Pinóquio, pedindo que fosse corajoso, sincero e gentil. Sempre que mentisse, seu nariz cresceria.\n\nCurioso e impulsivo, Pinóquio faltou à escola e caiu em encrencas: foi preso por um titereiro ambicioso, enganado por uma raposa e um gato interesseiros e levado à Ilha dos Prazeres, onde meninos viravam burros por viverem de travessuras. Arrependido de suas escolhas, Pinóquio lembrou das palavras da fada e decidiu procurar Gepeto, que havia desaparecido ao tentar salvá-lo.\n\nNo mar, Pinóquio encontrou o pai dentro de uma enorme baleia. Com coragem, ajudou Gepeto a escapar e os dois voltaram para casa. O boneco passou a trabalhar, estudar e cuidar de quem amava. Por sua bravura e bondade, a fada o transformou em um menino de verdade, realizando o sonho de Gepeto.",
  },

  302: {
    id: 302,
    title: "Alice no País das Maravilhas",
    category: "Clássicos",
    xp: 130,
    text:
      "Em uma tarde preguiçosa, Alice viu um Coelho Branco correndo, olhando o relógio e murmurando que estava atrasado. Intrigada, ela o seguiu e caiu em uma toca que parecia não ter fim, entrando em um lugar estranho onde crescer e encolher era possível com um gole ou uma mordida.\n\nAlice encontrou criaturas excêntricas: o Gato de Cheshire, que desaparecia deixando apenas o sorriso; o Chapeleiro Maluco e a Lebre de Março, que viviam uma festa do chá sem fim; e uma rainha barulhenta que mandava cortar cabeças ao menor contragosto. Em cada encontro, Alice tentava entender as regras daquele mundo, que pareciam mudar a cada minuto.\n\nEm um julgamento confuso no castelo da Rainha de Copas, Alice percebeu que todos agiam como num sonho. Ao reivindicar sua própria voz, tudo começou a se desfazer. Ela acordou no campo, ao lado da irmã, levando consigo a lembrança de que a imaginação pode tornar qualquer dia extraordinário.",
  },

  303: {
    id: 303,
    title: "As Aventuras de Robinson Crusoé",
    category: "Clássicos",
    xp: 150,
    text:
      "Desejando ver o mundo, Robinson Crusoé embarcou contra a vontade da família. Em uma tempestade devastadora, seu navio naufragou e ele foi parar sozinho em uma ilha deserta. Sem ninguém por perto, precisou aprender a sobreviver.\n\nCom engenho e paciência, construiu abrigo, plantou, caçou e aproveitou o que restara do navio. Ao longo dos anos, registrou seus dias, manteve a fé e descobriu sinais de outros humanos: pegadas na areia e fogueiras distantes. Em certo dia, salvou um homem de um perigo e passou a chamá-lo de Sexta-Feira. Juntos, trabalharam, aprenderam um com o outro e transformaram a ilha em lar.\n\nQuando um navio surgiu no horizonte, Robinson e Sexta-Feira ajudaram a impedir um motim a bordo e conquistaram a viagem de volta. Robinson retornou à civilização, mais maduro e grato, levando como tesouro as lições de coragem, amizade e perseverança que a ilha lhe deu.",
  },

  304: {
    id: 304,
    title: "A Ilha do Tesouro",
    category: "Clássicos",
    xp: 140,
    text:
      "Jim Hawkins encontrou, entre os pertences de um velho marinheiro, um mapa que marcava o local de um tesouro enterrado. Com o doutor Livesey e o cavaleiro Trelawney, organizou uma expedição em um navio tripulado por homens misteriosos.\n\nA bordo, Jim descobriu que o cozinheiro, Long John Silver, era um astuto pirata que planejava um motim para tomar o mapa e a fortuna. Em terra, a tripulação se dividiu em dois grupos. Entre emboscadas, refúgios improvisados e coragem inesperada, Jim e seus amigos lutaram para manter o mapa seguro.\n\nApós confrontos e reviravoltas, o grupo de Jim localizou o esconderijo e recuperou o tesouro. Long John Silver escapou com uma parte do ouro, e Jim voltou para casa mais sábio, sabendo que aventura e ambição podem caminhar juntas — mas que lealdade e amizade valem mais do que baús cheios.",
  },

  305: {
    id: 305,
    title: "O Médico e o Monstro (trecho)",
    category: "Clássicos",
    xp: 125,
    text:
      "Em Londres, o respeitado Dr. Jekyll pesquisava a natureza do bem e do mal no coração humano. Obcecado por separar essas forças, criou um soro capaz de mudar sua forma e seus impulsos.\n\nAo ingerir a fórmula, Jekyll transformava-se no Sr. Hyde, uma versão sombria e descontrolada de si mesmo, que buscava prazeres e cometia violências. A cada transformação, Hyde ganhava força, enquanto Jekyll perdia o controle do próprio destino. Amigos e colegas percebiam mudanças estranhas, mas não entendiam o que se passava.\n\nEm cartas reveladas no desfecho, Jekyll confessou a verdade: o experimento libertou impulsos que não podia dominar. Sem conseguir reverter os efeitos, ele deixou um alerta — reconhecer nossa dupla natureza é parte do caminho para fazer escolhas responsáveis. A história permanece como um espelho sobre ética e autocontrole.",
  },

  306: {
    id: 306,
    title: "A Volta ao Mundo em 80 Dias (trechos)",
    category: "Clássicos",
    xp: 150,
    text:
      "Phileas Fogg, um cavalheiro britânico de hábitos precisos, apostou no clube que conseguiria dar a volta ao mundo em 80 dias. Partiu imediatamente com seu criado, Passepartout, levando um plano e um relógio impecável.\n\nTrem, navio, elefante e improvisos: a dupla cruzou continentes, salvou Aouda de um perigo e ganhou uma companheira de viagem. Um detetive, Fix, seguiu Fogg acreditando, por engano, que ele era um ladrão. Atrasos, tempestades e contratempos quase destruíram a aposta.\n\nDe volta a Londres, Fogg pensou ter perdido por alguns minutos. Porém, ao atravessar os fusos horários rumo ao leste, ganhara um dia. Descoberta a diferença, venceu a aposta. Mais importante, percebeu que a maior conquista foi encontrar amor e amizade no caminho, casando-se com Aouda.",
  },

  307: {
    id: 307,
    title: "Heidi (trechos)",
    category: "Clássicos",
    xp: 120,
    text:
      "Heidi, uma menina órfã, foi morar com o avô nas montanhas suíças. Entre cabras, prados e céu aberto, descobriu liberdade e afeto, fazendo amizade com Pedro, o pastor, e aprendendo a amar a vida simples.\n\nLevada à cidade para fazer companhia a Clara, uma menina frágil que vivia numa casa elegante, Heidi sentiu saudade das montanhas. Ainda assim, sua alegria iluminou os dias de Clara. Com cartas, lembranças e esperança, Heidi manteve vivo o sonho de voltar.\n\nDe volta aos Alpes, a menina recuperou o brilho, e Clara foi visitá-la. O ar puro e o esforço paciente ajudaram Clara a ganhar força e dar passos novamente. Entre risos, o avô percebeu que o coração encontra casa onde há amor, amizade e natureza.",
  },

  308: {
    id: 308,
    title: "A História de Tom Sawyer (trechos)",
    category: "Clássicos",
    xp: 130,
    text:
      "Tom Sawyer vivia aventuras às margens do rio Mississippi. Arteiro e imaginativo, trocou elogios por trabalho quando convenceu os amigos de que pintar a cerca era um privilégio raro.\n\nCom Huck Finn e Becky, Tom explorou cavernas, ouviu conversas perigosas e testemunhou um crime cometido por Injun Joe. Entre sumiços e retornos triunfais, aprendeu a diferenciar bravura de imprudência.\n\nDepois de enfrentar medos e labirintos, Tom e Huck encontraram um tesouro escondido. A cidade os recebeu como heróis. Entre responsabilidades novas e desejo por aventuras, Tom entendeu que crescer é equilibrar imaginação com escolhas certas.",
  },

  309: {
    id: 309,
    title: "O Corcunda de Notre-Dame (trechos)",
    category: "Clássicos",
    xp: 140,
    text:
      "Em Paris, o bondoso Quasímodo, sineiro da catedral de Notre-Dame, vivia isolado por sua aparência. Ao conhecer Esmeralda, uma jovem dançarina livre e generosa, descobriu carinho e respeito que nunca havia sentido.\n\nO severo Frollo, consumido por obsessão, tentou controlar o destino de Esmeralda. A cidade ferveu em mal-entendidos, perseguições e julgamentos injustos. Quasímodo ofereceu abrigo na catedral, buscando protegê-la do mundo que a condenava sem ouvir seu coração.\n\nEm um desfecho doloroso, a injustiça e o fanatismo levaram à tragédia. Ainda assim, a história deixou uma luz: a verdadeira beleza está na compaixão e na capacidade de enxergar a humanidade no outro, para além de aparência e preconceito.",
  },

  310: {
    id: 310,
    title: "Grimm: Histórias Selecionadas (trechos)",
    category: "Clássicos",
    xp: 125,
    text:
      "Uma coletânea de contos dos Irmãos Grimm convida a conhecer heróis humildes e corajosos: o Alfaiate Valente que derrota gigantes com astúcia, João e Maria que enfrentam uma casa de doces perigosa e um príncipe que aprende a ver além das aparências.\n\nEm cada história, provações pedem escolhas: seguir um caminho escuro, cumprir promessas difíceis ou dividir o pouco que se tem. A esperteza e a bondade, quando andam juntas, viram ferramentas poderosas contra a ganância e a mentira.\n\nAo final, não é a força que vence, mas a coragem aliada à compaixão. Quem ajuda o próximo encontra ajuda, quem cumpre a palavra encontra confiança, e quem aprende com os tropeços volta para casa transformado — pronto para escrever o próximo capítulo.",
  },

  /* Nível muito difícil (401–405) - textos completos */
  401: {
    id: 401,
    title: "Dom Quixote (trechos)",
    category: "Clássicos",
    xp: 180,
    text:
      "Alonso Quixano, um fidalgo que adorava ler livros de cavalaria, decidiu tornar-se cavaleiro andante com o nome de Dom Quixote. Montado em Rocinante e com uma bacia de barbeiro como elmo, partiu pelo campo em busca de aventuras, levando no coração a ideia de defender os fracos e honrar sua dama, Dulcineia.\n\nAcompanhado de Sancho Pança, um vizinho leal e divertido, Quixote enfrentou “gigantes” que eram moinos de vento, “exércitos” que eram rebanhos e “castelos” que eram estalagens. Entre confusões e boas intenções, Sancho tentava equilibrar fantasia e realidade, aprendendo sobre amizade e coragem no caminho.\n\nDom Quixote retornou à sua aldeia, cansado e doente. Recuperou a lucidez, reconheceu seus enganos e se despediu das aventuras com serenidade. Sua história lembra que a imaginação pode nos levar longe, mas é a prudência e o cuidado com os outros que nos mantêm no caminho certo.",
  },

  402: {
    id: 402,
    title: "Moby Dick (trechos)",
    category: "Clássicos",
    xp: 200,
    text:
      "Ishmael, em busca de trabalho e de mar aberto, embarcou no baleeiro Pequod. O capitão Ahab revelou uma missão pessoal: caçar Moby Dick, a grande baleia branca que o havia ferido, e que agora simbolizava sua obsessão.\n\nPelo mundo, a tripulação enfrentou tempestades e mares gelados, avistando baleias e ouvindo presságios. Starbuck, o imediato, temia que a fúria de Ahab colocasse todos em risco. Ainda assim, o capitão seguia firme, cada encontro com o oceano alimentando seu desejo de vingança.\n\nAo finalmente encontrarem Moby Dick, travou-se uma batalha feroz. A baleia destruiu o navio e afundou o Pequod. Apenas Ishmael sobreviveu, agarrado a um caixote-boia, para contar a história. A aventura mostra como a obsessão pode engolir tudo ao redor e como a humildade diante da natureza é essencial.",
  },

  403: {
    id: 403,
    title: "Guerra e Paz (trecho simplificado)",
    category: "Clássicos",
    xp: 200,
    text:
      "Em meio às guerras napoleônicas, famílias russas como os Bolkonsky e os Rostov viviam entre bailes, estudos e sonhos. Pierre, Andrei e Natasha buscavam sentido para a vida, enquanto o país se preparava para tempos difíceis.\n\nA guerra trouxe perdas, coragem e escolhas. Andrei enfrentou o campo de batalha; Pierre questionou quem desejava ser; Natasha amadureceu entre erros e perdões. Em cada mudança, amizade e compaixão mantiveram acesa a esperança.\n\nCom a paz, veio também a reconstrução. Os personagens encontraram novos caminhos, percebendo que o valor da vida está nas pessoas que amamos, na responsabilidade com a comunidade e na capacidade de recomeçar com humildade e esperança.",
  },

  404: {
    id: 404,
    title: "Os Irmãos Karamázov (trecho)",
    category: "Clássicos",
    xp: 200,
    text:
      "Em uma família cheia de conflitos, o pai, Fiódor Karamázov, vivia em desordem, e seus filhos — Dmitri, Ivan e Aliócha — seguiam caminhos diferentes: paixão e impulsos, razão e dúvidas, fé e bondade.\n\nDesentendimentos e ressentimentos cresceram até um crime abalar a cidade. Enquanto suspeitas surgiam e perguntas sobre culpa, justiça e perdão apareciam, Aliócha procurava agir com gentileza, guiado por valores de empatia e cuidado.\n\nA busca pela verdade levou a julgamentos e escolhas difíceis. Mesmo em meio à dor, Aliócha continuou a ajudar os que sofriam, especialmente os jovens, mostrando que responsabilidade, compaixão e amizade podem iluminar tempos sombrios.",
  },

  405: {
    id: 405,
    title: "Crime e Castigo (trecho)",
    category: "Clássicos",
    xp: 180,
    text:
      "Em São Petersburgo, Raskólnikov, um estudante pobre e angustiado, acreditou que algumas pessoas teriam o direito de ultrapassar regras em nome de um bem maior. Em crise, decidiu cometer um crime terrível.\n\nApós o ato, o remorso e o medo tomaram conta dele. Doente e dividido por dentro, Raskólnikov conheceu Sônia, uma jovem de coração generoso, que o escutou e o incentivou a buscar a verdade e a assumir a responsabilidade por seus atos.\n\nRaskólnikov confessou e foi condenado à Sibéria. Com o tempo e com o apoio de Sônia, começou uma lenta transformação interior, encontrando no reconhecimento da culpa o primeiro passo para a renovação e para uma vida mais honesta.",
  },
};

const Story = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, completeStory } = useProgress();

  const storyId = useMemo(() => (id ? parseInt(id, 10) : NaN), [id]);
  const story = STORY_CONTENT[storyId];

  // 1. Determinar a dificuldade e categoria atual
  const userDifficulty = (localStorage.getItem(STORAGE_KEY) as Difficulty) || "easy";
  const currentStoryMetadata = STORY_METADATA_BY_DIFFICULTY[userDifficulty].find(
    (meta) => meta.id === storyId
  );

  const storiesInCurrentCategory = useMemo(() => {
    if (!currentStoryMetadata) return [];
    return STORY_METADATA_BY_DIFFICULTY[userDifficulty].filter(
      (meta) => meta.category === currentStoryMetadata.category
    );
  }, [userDifficulty, currentStoryMetadata]);

  const currentStoryIndex = storiesInCurrentCategory.findIndex(
    (meta) => meta.id === storyId
  );

  const nextStoryMetadata =
    currentStoryIndex !== -1 && currentStoryIndex < storiesInCurrentCategory.length - 1
      ? storiesInCurrentCategory[currentStoryIndex + 1]
      : undefined;

  useEffect(() => {
    if (!story) {
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
      toast("História já concluída.");
    }
    navigate("/reading");
  };

  const handleNextStory = () => {
    if (!isCompleted) {
      completeStory(storyId, story.xp);
      toast.success(`🎉 Você ganhou ${story.xp} XP por ler "${story.title}"!`);
    }
    
    if (nextStoryMetadata) {
      navigate(`/reading/${nextStoryMetadata.id}`);
    } else {
      // Se for a última história, volta para a lista de leitura
      navigate("/reading");
    }
  };

  const buttonText = nextStoryMetadata ? "Próxima História" : "Concluir Leitura";
  const buttonAction = nextStoryMetadata ? handleNextStory : handleComplete;
  const buttonVariant = isCompleted ? "outline" : "gradient";

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
                  {story.category} • {story.xp} XP
                </p>
              </div>
              <div>
                <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
              </div>
            </div>
          </Card>

          {/* Imagem de A Cigarra e a Formiga (ID 101) */}
          {storyId === 101 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={cigarraFormigaImage} 
                alt="A Cigarra e a Formiga" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de A Lebre e a Tartaruga (ID 102) */}
          {storyId === 102 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={lebreTartarugaImage} 
                alt="A Lebre e a Tartaruga" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de O Leão e o Rato (ID 103) */}
          {storyId === 103 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={leaoRatoImage} 
                alt="O Leão e o Rato" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}

          {/* Imagem da Raposa e as Uvas (ID 104) */}
          {storyId === 104 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={raposaUvasImage} 
                alt="A Raposa e as Uvas" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem da Galinha dos Ovos de Ouro (ID 105) */}
          {storyId === 105 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={galinhaOvosOuroImage} 
                alt="A Galinha dos Ovos de Ouro" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem do Príncipe Sapo (ID 205) */}
          {storyId === 205 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={principeSapoImage} 
                alt="O Príncipe Sapo" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de Rumpelstiltskin (ID 206) */}
          {storyId === 206 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={rumpelstiltskinImage} 
                alt="Rumpelstiltskin" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem da Rainha da Neve (ID 207) */}
          {storyId === 207 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={rainhaDaNeveImage} 
                alt="A Rainha da Neve" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem da Gata Borralheira (ID 208) */}
          {storyId === 208 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={gataBorralheiraImage} 
                alt="A Gata Borralheira" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem do Mágico de Oz (ID 209) */}
          {storyId === 209 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={magicoDeOzImage} 
                alt="O Mágico de Oz" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem do Pequeno Polegar (ID 210) */}
          {storyId === 210 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={pequenoPolegarImage} 
                alt="O Pequeno Polegar" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}

          {/* Imagem dos Três Porquinhos (ID 211) */}
          {storyId === 211 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={tresPorquinhosImage} 
                alt="Os Três Porquinhos" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de Pedro e o Lobo (ID 212) */}
          {storyId === 212 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={pedroLoboImage} 
                alt="Pedro e o Lobo" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de Simbad, o Marinheiro (ID 213) */}
          {storyId === 213 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={simbadMarinheiroImage} 
                alt="Simbad, o Marinheiro" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de Ali Babá e os Quarenta Ladrões (ID 214) */}
          {storyId === 214 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={aliBabaLadroesImage} 
                alt="Ali Babá e os Quarenta Ladrões" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de O Rouxinol (ID 215) */}
          {storyId === 215 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={oRouxinolImage} 
                alt="O Rouxinol" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de Barba Azul (ID 216) */}
          {storyId === 216 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={barbaAzulImage} 
                alt="Barba Azul" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de A Fada Voadora (ID 217) */}
          {storyId === 217 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={aFadaVoadoraImage} 
                alt="A Fada Voadora" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de O Cavalo e o Homem (ID 218) */}
          {storyId === 218 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={oCavaloEOHomemImage} 
                alt="O Cavalo e o Homem" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de A Lenda da Lua (ID 219) */}
          {storyId === 219 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={aLendaDaLuaImage} 
                alt="A Lenda da Lua" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}
          
          {/* Imagem de O Pescador e o Gênio (ID 220) */}
          {storyId === 220 && (
            <Card className="p-4 shadow-soft">
              <img 
                src={oPescadorEOGenioImage} 
                alt="O Pescador e o Gênio" 
                className="w-full h-auto rounded-xl object-cover"
              />
            </Card>
          )}

          {storyId === 101 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={cigarraAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 102 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={lebreAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 103 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={leaoAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 104 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={raposaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}
          
          {storyId === 105 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={galinhaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}
          
          {storyId === 111 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={patinhoFeioAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 112 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={joaoPeDeFeijaoAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 113 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={cinderelaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 114 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={brancaDeNeveAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 115 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={flautistaHamelinAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}
          
          {storyId === 201 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={chapeuzinhoAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 202 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={belaAdormecidaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 203 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={rapunzelAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 204 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={pequenaSereiaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 205 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={principeSapoAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 206 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={rumpelstiltskinAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 207 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={rainhaDaNeveAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 208 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={gataBorralheiraAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 209 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={magicoDeOzAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 210 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={pequenoPolegarAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}
          
          {storyId === 211 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={tresPorquinhosAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 212 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={pedroLoboAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 213 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={simbadMarinheiroAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 214 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={aliBabaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 215 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={oRouxinolAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 216 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={barbaAzulAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 217 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={aFadaVoadoraAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 218 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={oCavaloEOHomemAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 219 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={aLendaDaLuaAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 220 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={oPescadorEOGenioAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 301 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={pinocchioAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 302 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={aliceAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 303 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={robinsonCrusoeAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 304 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={ilhaDoTesouroAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}
          
          {storyId === 305 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={medicoMonstroAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}
          
          {storyId === 306 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={voltaAoMundo80DiasAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 307 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={heidiAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 308 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={tomSawyerAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 309 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={corcundaNotreDameAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 310 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={grimmHistoriasSelecionadasAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 401 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={domQuixoteAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 402 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={mobyDickAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 403 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={guerraEPazAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 404 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={irmaosKaramazovAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          {storyId === 405 && (
            <Card className="p-6 shadow-soft">
              <div className="space-y-3">
                <h2 className="text-lg font-display font-bold text-foreground">Ouça a história</h2>
                <audio controls preload="metadata" className="w-full">
                  <source src={crimeECastigoAudio} type="audio/mp4" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </Card>
          )}

          <Card className="p-6 shadow-soft">
            <article className="prose max-w-none text-foreground">
              {story.text.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </article>
          </Card>

          <div className="flex justify-between items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/reading")}>
              Voltar
            </Button>
            <Button variant={buttonVariant} onClick={buttonAction}>
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;