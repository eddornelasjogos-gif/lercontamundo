import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import ColorHeader from "@/components/ColorHeader";
import { Gamepad2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDivideIoProgress } from "@/hooks/useDivideIoProgress";
import DivideIoGame from "@/components/games/divide-io/DivideIoGame";

type GameStatus = "menu" | "playing" | "gameover";
type Difficulty = "easy" | "medium" | "hard";

const Games = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");
  const { highScore, lastDifficulty, setDifficulty, updateHighScore } = useDivideIoProgress();
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(lastDifficulty);
  const [lastScore, setLastScore] = useState(0);

  const handlePlay = () => {
    setDifficulty(currentDifficulty);
    setGameStatus("playing");
  };

  const handleGameOver = (score: number) => {
    setLastScore(score);
    updateHighScore(score);
    setGameStatus("gameover");
  };

  const handlePlayAgain = () => {
    setGameStatus("playing");
  };

  const handleBackToMenu = () => {
    setGameStatus("menu");
  };

  if (gameStatus === "playing") {
    return <DivideIoGame difficulty={currentDifficulty} onGameOver={handleGameOver} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20 flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-6 md:p-10 shadow-glow border-2 border-primary/20 bg-white/50 backdrop-blur-lg animate-scale-in">
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

              <div className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
                <Trophy className="w-6 h-6 text-amber-500" />
                <span>Recorde: {highScore}</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-display font-semibold text-foreground">Escolha a Dificuldade</h3>
                <div className="flex justify-center gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <Button
                      key={d}
                      variant={currentDifficulty === d ? "gradient" : "outline"}
                      onClick={() => setCurrentDifficulty(d)}
                    >
                      {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {gameStatus === "menu" && (
                  <Button size="lg" className="w-full sm:w-auto" onClick={handlePlay}>
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Games;