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
// ... (restante do código)