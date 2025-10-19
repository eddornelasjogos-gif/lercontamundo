"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Gamepad2, Trophy, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDivideIoProgress } from "@/hooks/useDivideIoProgress";
import DivideIoGame from "@/components/games/divide-io/DivideIoGame";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mascot } from "@/components/Mascot";
import { cn } from "@/lib/utils";

type GameStatus = "menu" | "playing" | "gameover";
type Difficulty = "very-easy" | "easy" | "medium" | "hard";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    'very-easy': 'Muito Fácil',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
};

const Games = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");
  const { 
    highScore, 
    lastDifficulty, 
    playerName, 
    leaderboard, 
    setDifficulty, 
    updateHighScore,
    setPlayerName,
    updateLeaderboard
  } = useDivideIoProgress();
  
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(lastDifficulty);
  const [lastScore, setLastScore] = useState(0);
  const [inputName, setInputName] = useState(playerName);
  const [isVictory, setIsVictory] = useState(false); // Novo estado para vitória

  const handlePlay = () => {
    if (inputName.trim() === "") {
      alert("Por favor, digite seu nome para começar a jogar!");
      return;
    }
    setPlayerName(inputName.trim());
    setDifficulty(currentDifficulty);
    setGameStatus("playing");
  };

  const handleGameOver = (score: number, victory: boolean) => {
    setLastScore(score);
    updateHighScore(score);
    updateLeaderboard(inputName.trim(), score);
    setIsVictory(victory);
    setGameStatus("gameover");
  };

  const handlePlayAgain = () => {
    setGameStatus("playing");
  };

  const handleBackToMenu = () => {
    setGameStatus("menu");
  };

  if (gameStatus === "playing") {
    // Retorna apenas o jogo para ocupar a tela inteira, sem a navegação
    return <DivideIoGame difficulty={currentDifficulty} onGameOver={handleGameOver} playerName={inputName.trim()} />;
  }
  
  const renderGameOverScreen = () => {
    if (isVictory) {
        return (
            <div className="text-center space-y-6 p-4 bg-success/10 rounded-lg animate-scale-in border border-success/30">
                <Trophy className="w-16 h-16 mx-auto text-amber-500 fill-amber-200 animate-bounce-gentle" />
                <h2 className="text-3xl font-display font-bold text-success">VITÓRIA!</h2>
                <p className="text-lg font-body text-foreground">Você dominou {DIFFICULTY_LABELS[currentDifficulty]}!</p>
                <p className="text-md font-body text-muted-foreground">Pontuação Final: <span className="font-bold text-xl text-foreground">{lastScore}</span></p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button size="lg" className="w-full sm:w-auto gradient-primary" onClick={handlePlayAgain}>
                        Jogar Novamente
                    </Button>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={handleBackToMenu}>
                        Mudar Nível
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 bg-destructive/10 rounded-lg animate-scale-in border border-destructive/30">
            <h2 className="text-2xl font-display font-bold text-destructive">Fim de Jogo!</h2>
            <p className="text-lg font-body text-foreground">Sua pontuação: <span className="font-bold">{lastScore}</span></p>
        </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20 flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-glow border-2 border-primary/20 bg-white/80 backdrop-blur-lg animate-scale-in">
            <div className="text-center space-y-6">
              <div className="flex justify-center items-center gap-4">
                <Gamepad2 className="w-12 h-12 text-primary" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">Divide.io</h1>
                  <p className="text-muted-foreground font-body">Coma, cresça e sobreviva!</p>
                </div>
              </div>

              {gameStatus === "gameover" && renderGameOverScreen()}
              
              {gameStatus === "menu" && (
                <Mascot message="Pronto para dominar o mapa?" className="mx-auto" />
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <label htmlFor="playerName" className="text-sm font-body font-semibold text-foreground">Qual é o seu nome?</label>
                </div>
                <Input
                  id="playerName"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Digite seu nome"
                  maxLength={15}
                  className="max-w-xs mx-auto text-center font-display font-bold"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-display font-semibold text-foreground">Escolha a Dificuldade</h3>
                <div className="grid grid-cols-2 gap-3 justify-items-center">
                  {(['very-easy', 'easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <Button
                      key={d}
                      variant={currentDifficulty === d ? "gradient" : "outline"}
                      onClick={() => setCurrentDifficulty(d)}
                      className="w-full max-w-xs font-display font-semibold"
                    >
                      {DIFFICULTY_LABELS[d]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {gameStatus === "menu" && (
                  <Button size="lg" className="w-full sm:w-auto" onClick={handlePlay} disabled={inputName.trim() === ""}>
                    Jogar
                  </Button>
                )}
                {gameStatus === "gameover" && !isVictory && (
                  <>
                    <Button size="lg" className="w-full sm:w-auto" onClick={handlePlayAgain}>
                      Jogar Novamente
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleBackToMenu}>
                      Voltar ao Menu
                    </Button>
                  </>
                )}
                {/* Se for vitória, as opções de botão já estão no renderGameOverScreen */}
              </div>
              
              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-4">Placar de Líderes (Top 10)</h3>
                  <ScrollArea className="h-60 w-full rounded-md border p-4 bg-white/70">
                    <div className="space-y-2">
                      {leaderboard.map((entry, index) => (
                        <div key={index} className={`flex justify-between items-center p-2 rounded-lg ${entry.name === playerName ? 'bg-primary/10 font-bold' : 'hover:bg-muted/50'}`}>
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
        </div>
      </div>
    </div>
  );
};

export default Games;