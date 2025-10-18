import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Calculator, Star, Trophy, CheckCircle, BarChart3 } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import mathImage from "@/assets/math-numbers.png";
import ColorHeader from "../components/ColorHeader";
import { useState, useEffect } from "react";
import mascotBackground from "@/assets/mascot-owl.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/Mascot";
import { useNavigate } from "react-router-dom";
import MathGame from "@/components/math/MathGame";
import LevelSelector from "@/components/LevelSelector"; // Importando LevelSelector

type Difficulty = "easy" | "medium" | "hard" | "very-hard";
type MathStatus = "menu" | "playing";

const STORAGE_KEY_DIFFICULTY = "mathDifficulty";
const STORAGE_KEY_PLAYER_NAME = "mathPlayerName";
const GLOBAL_DIFFICULTY_KEY = "userDifficulty"; // Chave global usada no Index e Reading

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  "very-hard": "Muito Difícil",
};

const Math = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  // 1. Ler a dificuldade inicial da chave global (definida no Index/Reading)
  const initialDifficulty = (localStorage.getItem(GLOBAL_DIFFICULTY_KEY) as Difficulty) || "easy";
  const initialPlayerName = localStorage.getItem(STORAGE_KEY_PLAYER_NAME) || "Aluno(a)";
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [playerName, setPlayerName] = useState<string>(initialPlayerName);
  const [mathStatus, setMathStatus] = useState<MathStatus>("menu");

  // 2. Sincronizar a dificuldade selecionada com a chave global
  useEffect(() => {
    localStorage.setItem(GLOBAL_DIFFICULTY_KEY, selectedDifficulty);
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, playerName);
  }, [selectedDifficulty, playerName]);
  
  // 3. Atualizar o estado local se a chave global mudar (ex: se o usuário voltar do Index)
  useEffect(() => {
    const currentGlobalDifficulty = (localStorage.getItem(GLOBAL_DIFFICULTY_KEY) as Difficulty) || "easy";
    if (currentGlobalDifficulty !== selectedDifficulty) {
        setSelectedDifficulty(currentGlobalDifficulty);
    }
  }, []);


  const handleStartGame = () => {
    if (playerName.trim() === "") {
      alert("Por favor, digite seu nome para começar!");
      return;
    }
    setMathStatus("playing");
  };
  
  const handleDifficultyChange = (d: Difficulty) => {
    setSelectedDifficulty(d);
  };
  
  const handleBackToMenu = () => {
    setMathStatus("menu");
  };

  if (mathStatus === "playing") {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <MathGame 
            difficulty={selectedDifficulty} 
            playerName={playerName} 
            onBackToMenu={handleBackToMenu} // Passando a função de volta ao menu
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      {/* HERO COLORIDO DO TOPO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(202,95%,84%)] via-[hsl(288,95%,86%)] to-[hsl(145,90%,84%)] shadow-soft">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${mascotBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -top-12 right-4 h-56 w-56 rounded-full bg-[hsl(286,100%,85%)] opacity-60 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={mathImage} alt="Matemática" className="w-20 h-20" />
              <ColorHeader
                title="Área de Matemática"
                subtitle={`Nível selecionado: ${DIFFICULTY_LABELS[selectedDifficulty]}`}
                gradientFrom="#93c5fd"
                gradientTo="#f472b6"
              />
            </div>
            <div className="flex flex-col items-center gap-3">
                <LevelSelector value={selectedDifficulty} onChange={handleDifficultyChange} />
                <Button 
                    variant="secondary" 
                    onClick={() => navigate('/math/reports')}
                    className="shadow-soft"
                >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Relatórios
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div>
          <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(210,95%,82%)] via-[hsl(286,90%,80%)] to-[hsl(145,90%,78%)] px-6 py-12 shadow-glow md:px-12 md:py-16">
          <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: `url(${mascotBackground})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            
            <div className="text-center space-y-4">
                <Mascot message={`Pronto para o desafio ${DIFFICULTY_LABELS[selectedDifficulty]}? Digite seu nome e comece!`} className="mx-auto" />
                <h2 className="text-3xl font-display font-bold text-foreground">Iniciar Desafio</h2>
            </div>
            
            {/* Input de Nome e Botão Iniciar */}
            <Card className="p-6 border-2 border-primary/30 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Input
                        placeholder="Seu nome (para o relatório)"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="flex-grow font-body font-semibold text-center"
                        maxLength={20}
                    />
                    <Button 
                        size="lg" 
                        onClick={handleStartGame} 
                        disabled={playerName.trim() === ""}
                        className="w-full sm:w-auto gradient-primary shadow-soft"
                    >
                        Começar Nível {DIFFICULTY_LABELS[selectedDifficulty]}
                    </Button>
                </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Math;