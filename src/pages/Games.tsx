"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Gamepad2, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDivideIoProgress } from "@/hooks/useDivideIoProgress";
import DivideIoGame from "@/components/games/divide-io/DivideIoGame";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type GameStatus = "menu" | "playing" | "gameover";
type Difficulty = "very-easy" | "easy" | "medium" | "hard";

const Games = () => {
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
  
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(lastDifficulty);
  const [lastScore, setLastScore] = useState(0);
  const [inputName, setInputName] = useState(playerName); // Usa o nome salvo como estado inicial

  const handlePlay = () => {
    if (inputName.trim() === "") {
      alert("Por favor, digite seu nome para começar a jogar!");
      return;
    }
    setPlayerName(inputName.trim());
    setDifficulty(currentDifficulty);
    setGameStatus("playing");
  };

  // Esta função é chamada pelo DivideIoGame quando o jogo termina (morte) ou quando o usuário
  // clica em 'Reiniciar' (score 0) ou 'Voltar ao Menu' (score > 0, mas não morte)
  const handleGameOver = (score: number) => {
    if (score === 0) {
        // Sinal de Reinício (vindo de handleRestart no DivideIoGame)
        setGameStatus("playing");
        return;
    }
    
    // Fim de Jogo (Morte ou Saída)
    setLastScore(score);
    updateHighScore(score);
    updateLeaderboard(inputName.trim(), score);
    setGameStatus("gameover");
  };

  const handlePlayAgain = () => {
    // Ao jogar novamente, o estado do jogo deve ser limpo pelo DivideIoGame
    setGameStatus("playing");
  };

  const handleBackToMenu = () => {
    setGameStatus("menu");
  };

  if (gameStatus === "playing") {
    // O DivideIoGame agora gerencia o estado de pausa/retomada internamente.
    // Se ele for montado, ele tentará carregar o estado salvo ou iniciar um novo.
    return <DivideIoGame difficulty={currentDifficulty} onGameOver={handleGameOver} playerName={inputName.trim()} />;
  }

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

              {gameStatus === "gameover" && (
                <div className="p-4 bg-primary/10 rounded-lg animate-scale-in">
                  <h2 className="text-2xl font-display font-bold text-primary">Fim de Jogo!</h2>
                  <p className="text-lg font-body text-foreground">Sua pontuação: <span className="font-bold">{lastScore}</span></p>
                </div>
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
                      {d === 'very-easy' ? 'Muito Fácil' : d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil'}
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
                {gameStatus === "gameover" && (
                  <>
                    <Button size="lg" className="w-full sm:w-auto" onClick={handlePlayAgain}>
                      Jogar Novamente
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={handleBackToMenu}>
                      Voltar ao Menu
                    </Button>
                  </>
                )}
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