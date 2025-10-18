import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { Difficulty, OperationType } from "@/utils/math-generator";
import { Mascot } from "@/components/Mascot";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SessionData {
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  performance: Record<OperationType, { correct: number; total: number; time: number }>;
}

interface ResultScreenProps {
  difficulty: Difficulty;
  playerName: string;
  session: SessionData;
  onRestart: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  "very-hard": "Muito Difícil",
};

const OPERATION_LABELS: Record<OperationType, string> = {
    addition: "Soma",
    subtraction: "Subtração",
    multiplication: "Multiplicação",
    division: "Divisão",
    equation: "Equação",
};

const ResultScreen: React.FC<ResultScreenProps> = ({ difficulty, playerName, session, onRestart }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const percentage = (session.correctAnswers / session.totalQuestions) * 100;
  
  let stars = 0;
  if (percentage >= 90) stars = 3;
  else if (percentage >= 70) stars = 2;
  else if (percentage >= 50) stars = 1;
  
  const starIcons = Array(3).fill(0).map((_, i) => (
    <Star 
      key={i} 
      className={cn("w-8 h-8", i < stars ? "text-amber-400 fill-amber-400" : "text-gray-300")} 
    />
  ));
  
  const averageTime = session.totalTimeSeconds / session.totalQuestions;

  useEffect(() => {
    if (isSaved) return;
    
    const saveSession = async () => {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('math_sessions')
        .insert({
          player_name: playerName,
          difficulty: difficulty,
          total_questions: session.totalQuestions,
          correct_answers: session.correctAnswers,
          time_spent_seconds: session.totalTimeSeconds,
          performance_data: session.performance,
        });
        
      if (error) {
        console.error("Erro ao salvar sessão:", error);
        toast.error("Erro ao salvar o relatório. Tente novamente.");
      } else {
        setIsSaved(true);
        toast.success("Relatório de desempenho salvo com sucesso!");
      }
      setIsSaving(false);
    };
    
    saveSession();
  }, [session, difficulty, playerName, isSaved]);

  const getRecommendation = () => {
    let weakestOperation: OperationType | null = null;
    let minAccuracy = 101;
    
    Object.entries(session.performance).forEach(([op, data]) => {
        if (data.total > 0) {
            const accuracy = (data.correct / data.total) * 100;
            if (accuracy < minAccuracy) {
                minAccuracy = accuracy;
                weakestOperation = op as OperationType;
            }
        }
    });
    
    if (minAccuracy >= 70) {
        return "Excelente trabalho! Você está pronto para o próximo desafio.";
    } else if (weakestOperation) {
        return `Recomendação: Reforçar exercícios de ${OPERATION_LABELS[weakestOperation]}. Sua precisão foi de ${minAccuracy.toFixed(0)}%.`;
    }
    return "Continue praticando para melhorar!";
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 md:p-10 shadow-glow border-2 border-primary/20 bg-white/90 backdrop-blur-lg animate-scale-in space-y-8 text-center">
      <div className="space-y-4">
        <Trophy className="w-16 h-16 mx-auto text-amber-500 fill-amber-200 animate-bounce-gentle" />
        <h1 className="text-4xl font-display font-bold text-foreground">Sessão Concluída!</h1>
        <p className="text-lg font-body text-muted-foreground">Nível: {DIFFICULTY_LABELS[difficulty]}</p>
      </div>

      <div className="flex justify-center gap-2">{starIcons}</div>

      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="p-4 bg-success/10 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <div>
            <p className="text-sm text-muted-foreground">Acertos</p>
            <p className="text-xl font-display font-bold text-foreground">{session.correctAnswers} / {session.totalQuestions}</p>
          </div>
        </div>
        <div className="p-4 bg-destructive/10 rounded-lg flex items-center gap-3">
          <XCircle className="w-6 h-6 text-destructive" />
          <div>
            <p className="text-sm text-muted-foreground">Erros</p>
            <p className="text-xl font-display font-bold text-foreground">{session.totalQuestions - session.correctAnswers}</p>
          </div>
        </div>
        <div className="p-4 bg-secondary/10 rounded-lg col-span-2 flex items-center gap-3">
          <Clock className="w-6 h-6 text-secondary" />
          <div>
            <p className="text-sm text-muted-foreground">Tempo Médio por Questão</p>
            <p className="text-xl font-display font-bold text-foreground">{averageTime.toFixed(1)} segundos</p>
          </div>
        </div>
      </div>
      
      <Card className="p-4 bg-primary/5 border-primary/20 border">
        <p className="font-body font-semibold text-foreground">{getRecommendation()}</p>
      </Card>

      <div className="space-y-4">
        <Button size="lg" onClick={onRestart} className="w-full gradient-primary">
          Jogar Novamente
        </Button>
        <Button variant="outline" onClick={() => onRestart()} className="w-full">
          Voltar para Seleção de Nível
        </Button>
        <Button variant="ghost" onClick={() => navigate('/math/reports')} disabled={isSaving} className="w-full text-sm text-muted-foreground">
          {isSaving ? "Salvando Relatório..." : "Ver Relatórios de Desempenho"}
        </Button>
      </div>
    </Card>
  );
};

export default ResultScreen;