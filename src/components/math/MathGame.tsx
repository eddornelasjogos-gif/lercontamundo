import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import { Difficulty, generateMathQuestions, Question, OperationType } from "@/utils/math-generator";
import QuestionCard from "./QuestionCard";
import ResultScreen from "./ResultScreen";
import { Calculator, Clock, Star } from "lucide-react";
import { Mascot } from "@/components/Mascot";

interface MathGameProps {
  difficulty: Difficulty;
  playerName: string;
}

interface SessionProgress {
  currentQuestionIndex: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  questions: Question[];
  performance: Record<OperationType, { correct: number; total: number; time: number }>;
  usedHelp: boolean;
}

const INITIAL_PERFORMANCE: Record<OperationType, { correct: number; total: number; time: number }> = {
    addition: { correct: 0, total: 0, time: 0 },
    subtraction: { correct: 0, total: 0, time: 0 },
    multiplication: { correct: 0, total: 0, time: 0 },
    division: { correct: 0, total: 0, time: 0 },
    equation: { correct: 0, total: 0, time: 0 },
};

const MathGame: React.FC<MathGameProps> = ({ difficulty, playerName }) => {
  const navigate = useNavigate();
  const { progress, addXP } = useProgress();
  
  // Usamos um contador para forçar a regeneração das perguntas quando o jogo é reiniciado
  const [gameKey, setGameKey] = useState(0); 
  
  const questions = useMemo(() => generateMathQuestions(difficulty), [difficulty, gameKey]);
  const totalQuestions = questions.length;

  const [session, setSession] = useState<SessionProgress>(() => ({
    currentQuestionIndex: 0,
    correctAnswers: 0,
    totalTimeSeconds: 0,
    questions,
    performance: INITIAL_PERFORMANCE,
    usedHelp: false,
  }));
  
  const [gameStatus, setGameStatus] = useState<'playing' | 'finished'>('playing');
  const [startTime, setStartTime] = useState(Date.now());

  // Resetar o estado da sessão quando as perguntas mudam (ou seja, quando gameKey muda)
  useEffect(() => {
    setSession({
        currentQuestionIndex: 0,
        correctAnswers: 0,
        totalTimeSeconds: 0,
        questions,
        performance: INITIAL_PERFORMANCE,
        usedHelp: false,
    });
    setGameStatus('playing');
    setStartTime(Date.now());
  }, [questions]);


  const currentQuestion = session.questions[session.currentQuestionIndex];

  const handleRestart = () => {
    // Força a regeneração das perguntas e o reset do estado
    setGameKey(prev => prev + 1);
  };

  const handleAnswer = (isCorrect: boolean, timeTaken: number, usedHelp: boolean) => {
    const question = session.questions[session.currentQuestionIndex];
    const operation = question.operation;
    
    let xpGained = 0;
    
    setSession(prev => {
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const newTotalTime = prev.totalTimeSeconds + timeTaken;
      
      const newPerformance = { ...prev.performance };
      newPerformance[operation] = {
          correct: prev.performance[operation].correct + (isCorrect ? 1 : 0),
          total: prev.performance[operation].total + 1,
          time: prev.performance[operation].time + timeTaken,
      };
      
      if (isCorrect) {
          xpGained = question.xpReward;
          if (usedHelp) {
              xpGained = Math.floor(xpGained * 0.5); // Reduz XP se usou ajuda
          }
          addXP(xpGained);
      }
      
      // Feedback visual e sonoro (se tivéssemos áudio)
      if (isCorrect) {
          toast.success(`+${xpGained} XP! Resposta correta!`);
      } else {
          toast.error("Resposta incorreta. Tente a próxima!");
      }

      // Próxima questão ou fim do jogo
      if (prev.currentQuestionIndex < totalQuestions - 1) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          correctAnswers: newCorrectAnswers,
          totalTimeSeconds: newTotalTime,
          performance: newPerformance,
          usedHelp: false, // Reset help status for the next question
        };
      } else {
        // Fim do jogo
        setGameStatus('finished');
        return {
          ...prev,
          correctAnswers: newCorrectAnswers,
          totalTimeSeconds: newTotalTime,
          performance: newPerformance,
        };
      }
    });
  };
  
  if (gameStatus === 'finished') {
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    return (
      <ResultScreen 
        difficulty={difficulty}
        playerName={playerName}
        session={{
            ...session,
            totalTimeSeconds: finalTime,
            totalQuestions: totalQuestions,
        }}
        onRestart={handleRestart} // Passa a função de reinício
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="p-6 shadow-card border-2 border-primary/20">
        <ProgressBar currentXP={progress.xp} requiredXP={500} level={progress.level} />
      </Card>
      
      <div className="flex justify-between items-center text-sm font-body font-semibold text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calculator className="w-4 h-4" />
          <span>{session.correctAnswers} Acertos</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Tempo: {session.totalTimeSeconds}s</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>XP: {progress.xp}</span>
        </div>
      </div>

      {currentQuestion ? (
        <QuestionCard 
          key={currentQuestion.id}
          question={currentQuestion} 
          onAnswer={handleAnswer} 
        />
      ) : (
        <Card className="p-8 text-center">
          <Mascot message="Carregando próxima questão..." />
        </Card>
      )}
      
      <div className="text-center">
        <p className="text-sm font-body font-medium text-foreground">
          Progresso: {session.currentQuestionIndex + 1} / {totalQuestions}
        </p>
      </div>
    </div>
  );
};

export default MathGame;