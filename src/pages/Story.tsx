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

  /* Nível médio (201–220) - textos completos */
  201: {
    id: 201,
    title: "Chapeuzinho Vermelho",
    category: "Contos Clássicos",
    duration: "8 min",
    xp: 70,
    text:
      "Era uma vez uma menina muito querida por todos, que ganhou de sua avó um capuz vermelho. Desde então, passou a usá-lo sempre, e logo ficou conhecida como Chapeuzinho Vermelho.\n\nCerto dia, sua mãe pediu que levasse uma cesta de bolo e mel para a avó doente, que morava do outro lado da floresta. A mãe alertou: “Não fale com estranhos e não saia do caminho.” No percurso, Chapeuzinho encontrou um lobo muito esperto. Inocente, contou para onde ia e o que levava. O lobo sugeriu que ela colhesse flores para alegrar a avó e tomou um atalho.\n\nO lobo chegou primeiro, fingiu ser a neta e entrou na casa. Trancou a avó no armário (ou a devorou, em algumas versões) e vestiu suas roupas, deitando-se na cama. Quando Chapeuzinho entrou, estranhou: “Vovó, que olhos grandes!” “É para te ver melhor.” “Que orelhas grandes!” “É para te ouvir melhor.” “Que boca grande!” “É para te devorar!” Saltando, o lobo avançou sobre a menina.\n\nUm caçador que passava ouviu a confusão, entrou, salvou Chapeuzinho e libertou a avó. O lobo foi impedido de fazer mais maldades. Chapeuzinho prometeu não conversar com estranhos e seguir sempre os conselhos de quem a ama. E, desde então, as visitas à avó foram mais cuidadosas e felizes.",
  },

  202: {
    id: 202,
    title: "A Bela Adormecida",
    category: "Contos Clássicos",
    duration: "9 min",
    xp: 75,
    text:
      "Num reino distante, nasceu uma princesa tão esperada que o rei realizou uma grande festa e chamou fadas madrinhas para conceder dons. Uma fada ressentida, não convidada, lançou uma maldição: ao completar quinze anos, a princesa espetaria o dedo num fuso e cairia em sono profundo.\n\nO rei mandou destruir todos os fusos do reino, mas no dia do aniversário, a princesa encontrou uma velha fiandeira numa torre e, curiosa, tocou o fuso. Caiu adormecida, e todo o castelo mergulhou em sono mágico. Uma floresta espessa cresceu ao redor, protegendo o lugar.\n\nTempos depois, muitos príncipes tentaram atravessar a mata e falharam. Um dia, um jovem príncipe chegou quando a floresta se abriu como por encanto. Ao ver a princesa, comovido, beijou-a. O feitiço se quebrou, todos despertaram e o castelo ganhou vida novamente.\n\nHouve festa, casamento e reconciliação. O reino aprendeu que nem todas as maldições são eternas e que paciência, coragem e cuidado podem acordar o que parece perdido.",
  },

  203: {
    id: 203,
    title: "Rapunzel",
    category: "Contos Clássicos",
    duration: "8 min",
    xp: 70,
    text:
      "Um casal desejava muito um filho. Durante a gravidez, a mulher ansiou por comer rapôncios (rapunzéis) do jardim de uma feiticeira. O marido pegou escondido, foi descoberto e, para evitar a fúria da bruxa, prometeu entregar a criança quando nascesse.\n\nA menina cresceu linda e recebeu o nome de Rapunzel. A feiticeira a criou numa torre sem portas, apenas com uma janela alta. “Rapunzel, jogue suas tranças!”, dizia a bruxa para subir. Um príncipe ouviu o canto da jovem, aprendeu o segredo das tranças e subiu. Eles se apaixonaram e planejaram fugir.\n\nA bruxa descobriu, cortou os cabelos de Rapunzel e a levou para o deserto. Quando o príncipe subiu, foi enganado e caiu sobre espinhos, ficando cego. Mesmo assim, ele vagou guiado pela lembrança da voz de Rapunzel.\n\nAnos depois, reencontraram-se. As lágrimas de Rapunzel curaram os olhos do príncipe. Eles voltaram ao reino, construíram uma vida livre e compreenderam que amor e esperança podem vencer o isolamento.",
  },

  204: {
    id: 204,
    title: "A Pequena Sereia (versão resumida)",
    category: "Contos Clássicos",
    duration: "9 min",
    xp: 80,
    text:
      "No fundo do mar vivia uma jovem sereia curiosa, fascinada pelo mundo dos humanos. Em uma tempestade, salvou um príncipe e, desde então, desejou reencontrá-lo na superfície.\n\nDeterminada, procurou a bruxa do mar, que ofereceu um feitiço: pernas humanas em troca de sua voz. Cada passo doeria como lâminas, e se o príncipe amasse outra, a sereia se desfaria em espuma. Mesmo assim, ela aceitou. Na terra, fez amizade com o príncipe, mas ele não reconheceu que fora ela quem o salvara.\n\nSeduzido por outra princesa, o príncipe se casou. À sereia restou a chance de voltar ao mar se ferisse o amado, mas ela escolheu o amor e a bondade. Em algumas versões, tornou-se espuma; em outras, ganhou uma nova forma de existir e aprender.\n\nSeu destino, ainda que doloroso, fala de identidade, sacrifício e da busca por um lugar no mundo — e lembra que escolhas feitas por amor têm valor próprio.",
  },

  205: {
    id: 205,
    title: "O Príncipe Sapo",
    category: "Contos Clássicos",
    duration: "7 min",
    xp: 65,
    text:
      "Uma princesa deixou cair sua bola de ouro no lago. Um sapo apareceu e ofereceu ajuda em troca de amizade e hospitalidade no castelo. A princesa prometeu, mas ao recuperar a bola tentou fugir do acordo.\n\nO sapo foi até o castelo e pediu o combinado. A contragosto, a princesa o deixou comer à sua mesa e descansar em seu quarto. Em algumas versões, um gesto de ternura — um beijo, um abraço ou cumprir a palavra — quebra o encanto e transforma o sapo em príncipe.\n\nA princesa aprendeu sobre respeito às promessas e sobre olhar para além das aparências. O príncipe, libertado, mostrou gentileza e gratidão. Juntos, tornaram-se exemplo de responsabilidade e empatia.",
  },

  206: {
    id: 206,
    title: "Rumpelstiltskin",
    category: "Contos Clássicos",
    duration: "8 min",
    xp: 70,
    text:
      "Um moleiro gabou-se ao rei dizendo que sua filha transformava palha em ouro. O rei, ávido, trancou a jovem num celeiro e exigiu o impossível. Desesperada, ela recebeu a visita de um homenzinho misterioso, que fez o milagre em troca de seus colares, anéis e, por fim, da promessa do primeiro filho.\n\nQuando a moça casou com o rei e teve um bebê, o ser voltou para cobrar. Com pena, ofereceu-lhe um acordo: se ela descobrisse seu nome em três dias, ficaria com a criança. Mensageiros rodaram o reino até flagrarem o homenzinho dançando no bosque e cantando: “Ninguém sabe que me chamo Rumpelstiltskin.”\n\nAo ouvir o nome, o pacto se desfez. O pequeno enfureceu-se e desapareceu. A rainha salvou o filho e entendeu o peso das palavras — e de nunca aceitar acordos sem saber o preço.",
  },

  207: {
    id: 207,
    title: "A Rainha da Neve (trechos)",
    category: "Contos Clássicos",
    duration: "9 min",
    xp: 80,
    text:
      "Cacos de um espelho mágico caíram nos olhos e no coração do menino Kai, tornando-o frio com quem amava. A Rainha da Neve o levou para um palácio gelado, onde tudo parecia perfeito, mas nada aquecia a alma.\n\nGerda, sua amiga, partiu numa longa jornada. Encontrou ajudantes inesperados — um corvo falante, uma senhora do jardim, um príncipe bondoso e até ladrões — e nunca desistiu. Cada gesto gentil abria um caminho.\n\nNo palácio, as lágrimas de Gerda caíram sobre Kai e derreteram o gelo do coração. Ele voltou a enxergar o mundo com calor e verdade. De mãos dadas, os dois regressaram, provando que amizade e amor vencem a frieza da indiferença.",
  },

  208: {
    id: 208,
    title: "A Gata Borralheira (versão clássica)",
    category: "Contos Clássicos",
    duration: "8 min",
    xp: 70,
    text:
      "Após a morte do pai, Cinderela ficou sob a tirania da madrasta e das irmãs, que a obrigavam a viver junto às cinzas da lareira. Mesmo assim, manteve a bondade.\n\nQuando o rei anunciou um baile, uma fada madrinha transformou abóbora em carruagem, ratos em cocheiros e trapos em vestido. A única condição: voltar antes da meia-noite. No baile, Cinderela encantou o príncipe, mas correu ao soar das doze badaladas, deixando um sapatinho de cristal.\n\nO príncipe procurou a dona do sapato por todo o reino. Ao encontrá-la, o calçado serviu. Cinderela foi reconhecida, casou-se com o príncipe e mostrou que gentileza e coragem podem superar a injustiça.",
  },

  209: {
    id: 209,
    title: "O Mágico de Oz (trechos)",
    category: "Contos Clássicos",
    duration: "10 min",
    xp: 90,
    text:
      "Um ciclone levou Dorothy e seu cão Totó do Kansas para a Terra de Oz. Na estrada de tijolos amarelos, ela conheceu o Espantalho, que queria um cérebro, o Homem de Lata, que queria um coração, e o Leão, que buscava coragem.\n\nJuntos, enfrentaram perigos e foram ao encontro do Mágico na Cidade das Esmeraldas. Depois de muitas provas, descobriram que o Mágico era apenas um homem comum. Ainda assim, compreenderam que já possuíam aquilo que tanto buscavam: o Espantalho tinha ideias, o Homem de Lata era sensível, e o Leão, valente.\n\nCom a ajuda de sapatos mágicos, Dorothy voltou para casa e entendeu que não há lugar como o lar — e que nossas qualidades florescem quando caminhamos com amigos.",
  },

  210: {
    id: 210,
    title: "O Pequeno Polegar",
    category: "Contos Clássicos",
    duration: "7 min",
    xp: 65,
    text:
      "Pequeno no tamanho, grande na esperteza: assim era o Pequeno Polegar. Em tempos de fome, ele percebeu que os pais planejavam abandonar os filhos na floresta e tentou marcar o caminho com migalhas, que os pássaros comeram.\n\nPerdidos, os irmãos enfrentaram perigos e a casa de um ogro. Com astúcia, o menino trocou gorros, enganou inimigos e salvou a todos. Ao final, recuperou riquezas do ogro e levou a família à segurança.\n\nA história mostra que coragem e inteligência podem proteger quem amamos mesmo nas maiores dificuldades.",
  },

  211: {
    id: 211,
    title: "Os Três Porquinhos",
    category: "Contos",
    duration: "6 min",
    xp: 60,
    text:
      "Três porquinhos resolveram construir suas casas. Um usou palha, outro madeira e o terceiro, tijolos. Logo apareceu um lobo, que soprou e derrubou as duas primeiras casas.\n\nOs porquinhos correram para a casa de tijolos, que resistiu a todos os sopros. Furioso, o lobo tentou entrar pela chaminé, mas queimou o rabo e fugiu.\n\nAssim, eles aprenderam que trabalho cuidadoso e planejamento dão segurança — e que pressa pode sair caro.",
  },

  212: {
    id: 212,
    title: "Pedro e o Lobo",
    category: "Contos",
    duration: "6 min",
    xp: 55,
    text:
      "Pedro vivia perto de um bosque com seu avô, que o alertava sobre os perigos do lobo. Curioso e corajoso, Pedro ignorou os avisos e saltou a cerca.\n\nQuando o lobo apareceu, ameaçando os animais, Pedro montou um plano com a ajuda do pássaro e capturou o lobo sem ferir ninguém. A aldeia o aplaudiu, mas ele reconheceu o valor dos conselhos do avô.\n\nA aventura ensina a equilibrar ousadia e prudência, e a proteger os amigos com inteligência.",
  },

  213: {
    id: 213,
    title: "Simbad, o Marinheiro (trechos)",
    category: "Contos",
    duration: "10 min",
    xp: 95,
    text:
      "Simbad contou sete grandes viagens: em uma, amarrou-se ao pé de uma ave roc para escapar de uma ilha perigosa; em outra, enfrentou criaturas marinhas gigantes e tempestades que engoliam navios.\n\nEm cada aventura, usou coragem e inteligência para retornar com tesouros e histórias. Conheceu reis, mercadores e povos distantes, aprendendo que o mar exige respeito e preparo.\n\nDe volta a Bagdá, partilhava suas riquezas e lembrava que a melhor fortuna é a experiência conquistada com coragem e prudência.",
  },

  214: {
    id: 214,
    title: "Ali Babá e os Quarenta Ladrões (trechos)",
    category: "Contos",
    duration: "10 min",
    xp: 95,
    text:
      "Ali Babá descobriu por acaso uma caverna que se abria com as palavras mágicas “Abre-te, Sésamo”. Ali, os quarenta ladrões escondiam tesouros. Ele pegou um pouco para sua família, sem ambição cega.\n\nQuando os ladrões suspeitaram, tentaram invadir a casa de Ali Babá. A esperteza de Morgiana, a criada leal, frustrou os planos mais de uma vez, salvando a todos.\n\nPor fim, os ladrões foram derrotados. Ali Babá compreendeu que riqueza sem justiça é perigosa — e que a lealdade pode valer mais do que ouro.",
  },

  215: {
    id: 215,
    title: "O Rouxinol",
    category: "Contos",
    duration: "7 min",
    xp: 65,
    text:
      "O imperador apaixonou-se pelo canto de um rouxinol que vivia nos jardins do palácio. Encantado por um pássaro mecânico luxuoso, esqueceu o rouxinol verdadeiro, que partiu entristecido.\n\nQuando o imperador adoeceu, o pássaro mecânico não pôde ajudá-lo. O rouxinol real voltou, cantou para ele e trouxe esperança e cura.\n\nDesde então, o imperador passou a valorizar a beleza autêntica e a simplicidade que tocam o coração.",
  },

  216: {
    id: 216,
    title: "Barba Azul (resumo)",
    category: "Contos",
    duration: "7 min",
    xp: 65,
    text:
      "Barba Azul era um homem rico e temido, com um passado cercado de mistérios. Antes de viajar, entregou à esposa todas as chaves, proibindo-a de abrir um pequeno quarto.\n\nMovida pela curiosidade, ela abriu a porta e encontrou provas dos crimes do marido. Barba Azul descobriu e quis puni-la, mas os irmãos da moça chegaram a tempo, o derrotaram e a libertaram.\n\nLivre, ela dividiu os bens com a família e usou sua experiência para ajudar outras pessoas a reconhecerem sinais de perigo e a pedirem ajuda.",
  },

  217: {
    id: 217,
    title: "A Fada Voadora",
    category: "Contos",
    duration: "6 min",
    xp: 60,
    text:
      "Numa aldeia cercada por campos, uma fadinha apareceu e prometeu ajudar se todos cuidassem da natureza e uns dos outros. Com pequenos encantos, ensinou as crianças a plantar, a dividir e a escutar.\n\nUm forasteiro ganancioso tentou explorar o vilarejo. A fada, com astúcia e união dos moradores, mostrou que egoísmo seca as fontes. O visitante aprendeu a lição e partiu.\n\nA aldeia prosperou com cooperação, e a fada seguiu viagem, deixando sementes de gentileza por onde passava.",
  },

  218: {
    id: 218,
    title: "O Cavalo e o Homem",
    category: "Contos",
    duration: "6 min",
    xp: 60,
    text:
      "Um jovem lavrador e seu cavalo formavam uma dupla inseparável. Entre enchentes e estradas lamacentas, aprenderam a confiar um no outro.\n\nCerta vez, num torneio de resistência, o cavalo salvou o dono de um acidente, preferindo protegê-lo a vencer a prova. A coragem silenciosa do animal comoveu a vila.\n\nDesde então, todos compreenderam que amizade e cuidado valem mais do que troféus.",
  },

  219: {
    id: 219,
    title: "A Lenda da Lua",
    category: "Contos",
    duration: "7 min",
    xp: 65,
    text:
      "Diziam que um velho guardião cuidava da lua e escolhia, a cada década, um mensageiro para ouvir as histórias do povo. Um jovem curioso atravessou vales e rios para chegar até ele.\n\nNo caminho, recolheu relatos de pescadores, artesãos e viajantes, percebendo que a luz da lua parecia mais brilhante quanto mais histórias guardava. Ao encontrar o guardião, entendeu: a lua refletia a memória das pessoas.\n\nO jovem voltou e passou a preservar contos e canções, iluminando a sua comunidade com lembranças que não se apagam.",
  },

  220: {
    id: 220,
    title: "O Pescador e o Gênio",
    category: "Contos",
    duration: "8 min",
    xp: 70,
    text:
      "Um pescador humilde encontrou uma ânfora selada. Ao abri-la, libertou um gênio que, enfurecido por séculos de prisão, ameaçou castigá-lo. O pescador, sereno, propôs um teste: se o gênio era tão poderoso, seria capaz de caber novamente na ânfora?\n\nVanglorioso, o gênio entrou — e o pescador o fechou de novo. Só então negociou sua liberdade em troca de um juramento de proteção. O gênio, impressionado com a inteligência do homem, cumpriu a palavra e concedeu um presente útil à aldeia.\n\nAssim, o pescador mostrou que prudência e inteligência podem transformar perigos em oportunidades para o bem comum.",
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