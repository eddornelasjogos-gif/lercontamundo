import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Calculator, Star, Trophy, CheckCircle, BarChart3 } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import mathImage from "@/assets/math-numbers.png";
import ColorHeader from "../components/ColorHeader";
import { useState, useEffect, useCallback } from "react";
import mascotBackground from "@/assets/mascot-owl.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/Mascot";
import { useNavigate, useLocation } from "react-router-dom";
import MathGame from "@/components/math/MathGame";
import LevelSelector from "@/components/LevelSelector";
import { ExitConfirmationModal } from "@/components/math/ExitConfirmationModal"; // Importando o modal

type Difficulty = "easy" | "medium" | "hard" | "very-hard";
type MathStatus = "menu" | "playing";

const STORAGE_KEY_DIFFICULTY = "mathDifficulty";
const STORAGE_KEY_PLAYER_NAME = "mathPlayerName";
const GLOBAL_DIFFICULTY_KEY = "userDifficulty";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  "very-hard": "Muito Difícil",
};

const Math = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();
  const location = useLocation(); // Usado para detectar mudanças de rota

  const initialDifficulty = (localStorage.getItem(GLOBAL_DIFFICULTY_KEY) as Difficulty) || "easy";
  const initialPlayerName = localStorage.getItem(STORAGE_KEY_PLAYER_NAME) || "Aluno(a)";
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(initialDifficulty);
  const [playerName, setPlayerName] = useState<string>(initialPlayerName);
  const [mathStatus, setMathStatus] = useState<MathStatus>("menu");
  
  // Estado para o modal de confirmação de saída
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // 1. Sincronizar a dificuldade selecionada com a chave global
  useEffect(() => {
    localStorage.setItem(GLOBAL_DIFFICULTY_KEY, selectedDifficulty);
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, playerName);
  }, [selectedDifficulty, playerName]);
  
  // 2. Atualizar o estado local se a chave global mudar
  useEffect(() => {
    const currentGlobalDifficulty = (localStorage.getItem(GLOBAL_DIFFICULTY_KEY) as Difficulty) || "easy";
    if (currentGlobalDifficulty !== selectedDifficulty) {
        setSelectedDifficulty(currentGlobalDifficulty);
    }
  }, []);

  // 3. Lógica de Interceptação de Navegação
  useEffect(() => {
    if (mathStatus !== 'playing') return;

    // Esta função será chamada quando o usuário tentar navegar para fora da página
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ''; // Mensagem padrão do navegador
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // O React Router v6 não tem um hook nativo para bloquear a navegação de forma simples
    // em componentes de rota, mas podemos usar o estado para gerenciar a navegação interna.
    
    // Nota: A navegação via <Navigation /> será tratada pelo componente Navigation
    // que agora aceitará uma função de bloqueio.
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mathStatus]);


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
  
  // Função passada para o Navigation para verificar se a saída deve ser bloqueada
  const checkNavigationBlock = useCallback((targetPath: string): boolean => {
    if (mathStatus === 'playing' && targetPath !== location.pathname) {
      setShowExitModal(true);
      setPendingPath(targetPath);
      return true; // Bloqueia a navegação
    }
    return false; // Permite a navegação
  }, [mathStatus, location.pathname]);
  
  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (pendingPath) {
      setMathStatus("menu"); // Reseta o estado do jogo
      navigate(pendingPath);
      setPendingPath(null);
    }
  };
  
  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingPath(null);
  };

  if (mathStatus === "playing") {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
        <Navigation checkBlock={checkNavigationBlock} />
        <div className="container mx-auto px-4 py-8">
          <MathGame 
            difficulty={selectedDifficulty} 
            playerName={playerName} 
            onBackToMenu={handleBackToMenu}
          />
        </div>
        <ExitConfirmationModal 
            isOpen={showExitModal}
            onConfirmExit={handleConfirmExit}
            onCancel={handleCancelExit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation checkBlock={checkNavigationBlock} />

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
              {/* Envolve o ColorHeader em um Card/Div com fundo mais opaco */}
              <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-md border border-white/50">
                <ColorHeader
                  title="Área de Matemática"
                  subtitle={`Nível selecionado: ${DIFFICULTY_LABELS[selectedDifficulty]}`}
                  gradientFrom="#93c5fd"
                  gradientTo="#f472b6"
                />
              </div>
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
      <ExitConfirmationModal 
          isOpen={showExitModal}
          onConfirmExit={handleConfirmExit}
          onCancel={handleCancelExit}
      />
    </div>
  );
};

export default Math;