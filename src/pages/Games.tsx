import { useState, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Gamepad2, Trophy, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDivideIoProgress } from "@/hooks/useDivideIoProgress";
import DivideIoGame from "@/components/games/divide-io/DivideIoGame";
import { ScrollArea } from "@/components/ui/scroll-area";
import MagicBubblesMenu from "@/components/games/magic-bubbles/MagicBubblesMenu";
import MagicBubblesGame from "@/components/games/magic-bubbles/MagicBubblesGame";
import { Difficulty as BubbleDifficulty, GameMode as BubbleGameMode, GAME_SETTINGS } from "@/components/games/magic-bubbles/types";
import { useMagicBubblesProgress } from "@/hooks/useMagicBubblesProgress";
import { cn } from "@/lib/utils";

type GameStatus = "menu" | "playing";
type GameType = "divide-io" | "magic-bubbles";
type DivideIoDifficulty = "easy" | "medium" | "hard";

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>("divide-io");
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");
  
  // --- Divide.io State ---
  const { 
    highScore: dioHighScore, 
    lastDifficulty: dioLastDifficulty, 
    playerName: dioPlayerName, 
    leaderboard: dioLeaderboard, 
    setDifficulty: dioSetDifficulty, 
    updateHighScore: dioUpdateHighScore, 
    setPlayerName: dioSetPlayerName,
    updateLeaderboard: dioUpdateLeaderboard
  } = useDivideIoProgress();
  
  const [dioCurrentDifficulty, setDioCurrentDifficulty] = useState<DivideIoDifficulty>(dioLastDifficulty);
  const [dioLastScore, setDioLastScore] = useState(0);
  const [dioInputName, setDioInputName] = useState(dioPlayerName);

  // --- Magic Bubbles State ---
  const { setLastSettings: mbSetLastSettings, updateHighScore: mbUpdateHighScore } = useMagicBubblesProgress();
  const [mbSettings, setMbSettings] = useState<GameSettings | null>(null);
  const [mbLastScore, setMbLastScore] = useState(0);
  
  // --- Handlers Divide.io ---
  
  const handleDioPlay = () => {
    if (dioInputName.trim() === "") {
      alert("Por favor, digite seu nome para começar a jogar!");
      return;
    }
    dioSetPlayerName(dioInputName.trim());
    dioSetDifficulty(dioCurrentDifficulty);
    setGameStatus("playing");
  };

  const handleDioGameOver = (score: number) => {
    setDioLastScore(score);
    dioUpdateHighScore(score);
    dioUpdateLeaderboard(dioInputName.trim(), score);
    setGameStatus("menu"); // Volta para o menu após o game over
  };

  // --- Handlers Magic Bubbles ---
  
  const handleMbStartGame = useCallback((difficulty: BubbleDifficulty, mode: BubbleGameMode) => {
    const settings = { ...GAME_SETTINGS[difficulty], mode };
    setMbSettings(settings);
    mbSetLastSettings(difficulty, mode);
    setGameStatus("playing");
  }, [mbSetLastSettings]);
  
  const handleMbGameOver = useCallback((score: number) => {
    setMbLastScore(score);
    setGameStatus("menu");
    // High score update handled inside MagicBubblesGame
  }, []);
  
  const handleMbGameWon = useCallback((score: number) => {
    setMbLastScore(score);
    setGameStatus("menu");
    // High score update handled inside MagicBubblesGame
  }, []);


  if (gameStatus === "playing") {
    if (selectedGame === "divide-io") {
      return <DivideIoGame difficulty={dioCurrentDifficulty} onGameOver={handleDioGameOver} playerName={dioInputName.trim()} />;
    }
    if (selectedGame === "magic-bubbles" && mbSettings) {
      return <MagicBubblesGame settings={mbSettings} onGameOver={handleMbGameOver} onGameWon={handleMbGameWon} />;
    }
  }
  
  // --- Menu Principal ---

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20 flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          
          {/* Seletor de Jogo */}
          <div className="max-w-2xl mx-auto mb-6 flex justify-center gap-4">
            <Button 
                variant={selectedGame === 'divide-io' ? 'gradient' : 'outline'}
                onClick={() => setSelectedGame('divide-io')}
                className={cn(selectedGame === 'divide-io' && 'shadow-soft')}
            >
                <Gamepad2 className="w-5 h-5 mr-2" /> Divide.io
            </Button>
            <Button 
                variant={selectedGame === 'magic-bubbles' ? 'gradient' : 'outline'}
                onClick={() => setSelectedGame('magic-bubbles')}
                className={cn(selectedGame === 'magic-bubbles' && 'shadow-soft')}
            >
                <Sparkles className="w-5 h-5 mr-2" /> Bolhas Mágicas
            </Button>
          </div>
          
          {/* Menu do Jogo Selecionado */}
          {selectedGame === "divide-io" && (
            <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-glow border-2 border-primary/20 bg-white/50 backdrop-blur-lg animate-scale-in">
              <div className="text-center space-y-6">
                <div className="flex justify-center items-center gap-4">
                  <Gamepad2 className="w-12 h-12 text-primary" />
                  <div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">Divide.io</h1>
                    <p className="text-muted-foreground font-body">Coma, cresça e sobreviva!</p>
                  </div>
                </div>

                {dioLastScore > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg animate-scale-in">
                    <h2 className="text-2xl font-display font-bold text-primary">Última Pontuação: {dioLastScore}</h2>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <span>Recorde Pessoal: {dioHighScore}</span>
                </div>
                
                {/* Input de Nome */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <label htmlFor="playerName" className="text-sm font-body font-semibold text-foreground">Qual é o seu nome?</label>
                  </div>
                  <Input
                    id="playerName"
                    value={dioInputName}
                    onChange={(e) => setDioInputName(e.target.value)}
                    placeholder="Digite seu nome"
                    maxLength={15}
                    className="max-w-xs mx-auto text-center font-display font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-display font-semibold text-foreground">Escolha a Dificuldade</h3>
                  <div className="flex justify-center gap-3">
                    {(['easy', 'medium', 'hard'] as DivideIoDifficulty[]).map((d) => (
                      <Button
                        key={d}
                        variant={dioCurrentDifficulty === d ? "gradient" : "outline"}
                        onClick={() => setDioCurrentDifficulty(d)}
                      >
                        {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="w-full sm:w-auto" onClick={handleDioPlay} disabled={dioInputName.trim() === ""}>
                    Jogar
                  </Button>
                </div>
                
                {/* Leaderboard */}
                {dioLeaderboard.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-2xl font-display font-bold text-foreground mb-4">Placar de Líderes (Top 10)</h3>
                    <ScrollArea className="h-60 w-full rounded-md border p-4 bg-white/70">
                      <div className="space-y-2">
                        {dioLeaderboard.map((entry, index) => (
                          <div key={index} className={`flex justify-between items-center p-2 rounded-lg ${entry.name === dioPlayerName ? 'bg-primary/10 font-bold' : 'hover:bg-muted/50'}`}>
                            <span className="text-sm font-body">
                              {index + 1}. {entry.name}
                            </span>
                            <span className="text-sm font-display font-bold text-primary">
                              {entry.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {selectedGame === "magic-bubbles" && (
            <MagicBubblesMenu onStartGame={handleMbStartGame} />
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Games;