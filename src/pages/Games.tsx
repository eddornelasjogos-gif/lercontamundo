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
import { Difficulty as BubbleDifficulty, GameMode as BubbleGameMode, GAME_SETTINGS, GameSettings } from "@/components/games/magic-bubbles/types";
import { useMagicBubblesProgress } from "@/hooks/useMagicBubblesProgress";
import { cn } from "@/lib/utils";

type GameStatus = "menu" | "playing";

interface LeaderboardEntry {
  name: string;
  score: number;
}

// Placeholder para o componente Games
const Games = () => {
  const navigate = (path: string) => console.log(`Navigating to ${path}`);
  const { playerName: dioPlayerName, setPlayerName: dioSetPlayerName, lastDifficulty: dioLastDifficulty, setDifficulty: dioSetDifficulty, updateHighScore: dioUpdateHighScore, leaderboard: dioLeaderboard } = useDivideIoProgress();
  const { lastDifficulty: mbLastDifficulty, lastMode: mbLastMode, setLastSettings: mbSetLastSettings, updateHighScore: mbUpdateHighScore, highScores: mbHighScores } = useMagicBubblesProgress();
  
  const [selectedGame, setSelectedGame] = useState<"divide-io" | "magic-bubbles" | null>(null);
  const [dioStatus, setDioStatus] = useState<GameStatus>("menu");
  const [mbStatus, setMbStatus] = useState<GameStatus>("menu");
  
  // Divide.io State
  const [dioDifficulty, setDioDifficulty] = useState<'easy' | 'medium' | 'hard'>(dioLastDifficulty);
  const [dioLastScore, setDioLastScore] = useState(0);
  
  // Magic Bubbles State
  const [mbSettings, setMbSettings] = useState<GameSettings | null>(null);
  const [mbLastScore, setMbLastScore] = useState(0);
  
  const handleDioStart = useCallback(() => {
    if (dioPlayerName.trim() === "") {
      alert("Por favor, digite seu nome para começar!");
      return;
    }
    dioSetDifficulty(dioDifficulty);
    setDioStatus("playing");
  }, [dioPlayerName, dioDifficulty, dioSetDifficulty]);
  
  const handleDioGameOver = useCallback((score: number) => {
    dioUpdateHighScore(score);
    setDioLastScore(score);
    setDioStatus("menu");
  }, [dioUpdateHighScore]);
  
  const handleMbStart = useCallback((difficulty: BubbleDifficulty, mode: BubbleGameMode) => {
    const settings = GAME_SETTINGS[difficulty];
    setMbSettings({ ...settings, mode });
    mbSetLastSettings(difficulty, mode);
    setMbStatus("playing");
  }, [mbSetLastSettings]);
  
  const handleMbGameOver = useCallback((score: number) => {
    setMbLastScore(score);
    setMbStatus("menu");
  }, []);
  
  const handleMbGameWon = useCallback((score: number) => {
    setMbLastScore(score);
    setMbStatus("menu");
  }, []);

  if (dioStatus === "playing") {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <DivideIoGame 
            difficulty={dioDifficulty} 
            onGameOver={handleDioGameOver} 
            playerName={dioPlayerName} 
          />
        </div>
      </div>
    );
  }
  
  if (mbStatus === "playing" && mbSettings) {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <MagicBubblesGame 
            settings={mbSettings} 
            onGameOver={handleMbGameOver} 
            onGameWon={handleMbGameWon}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(280,95%,88%)] via-[hsl(200,95%,86%)] to-[hsl(45,90%,84%)] shadow-soft">
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-4">
            <Gamepad2 className="w-12 h-12 text-primary fill-primary/20" />
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Área de Jogos</h1>
              <p className="text-sm md:text-base text-muted-foreground">Aprenda se divertindo com nossos jogos educativos!</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Seleção de Jogo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            onClick={() => setSelectedGame("divide-io")}
            className={cn(
              "p-6 text-center cursor-pointer transition-smooth hover:scale-[1.02] hover:shadow-glow border-2",
              selectedGame === "divide-io" ? "border-primary/80 bg-primary/5" : "border-border"
            )}
          >
            <h2 className="text-2xl font-display font-bold text-foreground">Divide.io</h2>
            <p className="text-muted-foreground">Jogo de estratégia e divisão de células.</p>
          </Card>
          <Card 
            onClick={() => setSelectedGame("magic-bubbles")}
            className={cn(
              "p-6 text-center cursor-pointer transition-smooth hover:scale-[1.02] hover:shadow-glow border-2",
              selectedGame === "magic-bubbles" ? "border-primary/80 bg-primary/5" : "border-border"
            )}
          >
            <h2 className="text-2xl font-display font-bold text-foreground">Bolhas Mágicas</h2>
            <p className="text-muted-foreground">Quebra-cabeça de cores e raciocínio rápido.</p>
          </Card>
        </div>

        {/* Conteúdo do Jogo Selecionado */}
        {selectedGame === "divide-io" && (
          <Card className="p-6 md:p-10 shadow-soft border-2 border-primary/30 bg-white/80 backdrop-blur-sm animate-scale-in space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-display font-bold text-foreground">Divide.io - Menu</h3>
              <p className="text-muted-foreground font-body">Tente sobreviver e crescer no campo de batalha!</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Input
                    placeholder="Seu nome"
                    value={dioPlayerName}
                    onChange={(e) => dioSetPlayerName(e.target.value)}
                    className="flex-grow font-body font-semibold text-center"
                    maxLength={20}
                />
                <Button 
                    size="lg" 
                    onClick={handleDioStart} 
                    disabled={dioPlayerName.trim() === ""}
                    className="w-full sm:w-auto gradient-primary shadow-soft"
                >
                    Iniciar Jogo
                </Button>
            </div>
            
            <div className="space-y-4">
                <h4 className="text-lg font-display font-semibold text-foreground">Recordes</h4>
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                    {dioLeaderboard.length > 0 ? (
                        dioLeaderboard.map((entry, index) => (
                            <div key={index} className="flex justify-between py-1 text-sm font-body">
                                <span className="font-bold">{index + 1}. {entry.name}</span>
                                <span>{entry.score} pontos</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center pt-4">Nenhum recorde ainda.</p>
                    )}
                </ScrollArea>
            </div>
            
            {dioLastScore > 0 && (
                <div className="text-center text-lg font-display font-bold text-primary">
                    Última Pontuação: {dioLastScore}
                </div>
            )}
          </Card>
        )}

        {selectedGame === "magic-bubbles" && (
          <MagicBubblesMenu onStartGame={handleMbStart} />
        )}
      </div>
    </div>
  );
};

export default Games;