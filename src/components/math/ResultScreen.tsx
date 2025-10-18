import React, { useEffect, useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckCircle, XCircle, Star, Save } from "lucide-react";
import { Difficulty, OperationType } from "@/utils/math-generator";
import { Mascot } from "@/components/Mascot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SessionData {
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  performance: Record<OperationType, { correct: number; total: number; time: number }>;
}

interface MathReportEntry extends SessionData {
    id: string;
    playerName: string;
    difficulty: Difficulty;
    created_at: string;
}

interface ResultScreenProps {
  difficulty: Difficulty;
  playerName: string;
  session: SessionData;
  onRestart: () => void;
  onBackToMenu: () => void; // Nova prop
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

const LOCAL_STORAGE_REPORTS_KEY = 'math_reports';

const ResultScreen: React.FC<ResultScreenProps> = ({ difficulty, playerName, session, onRestart, onBackToMenu }) => {
  const navigate = useNavigate();
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

  const handleSaveAndFinish = useCallback(() => {
    if (isSaved) {
        navigate('/math/reports');
        return;
    }
    
    setIsSaving(true);
    try {
      const existingReportsString = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
      const existingReports: MathReportEntry[] = existingReportsString ? JSON.parse(existingReportsString) : [];
      
      const newReport: MathReportEntry = {
          id: Date.now().toString(), // Usar timestamp como ID único
          playerName: playerName,
          difficulty: difficulty,
          created_at: new Date().toISOString(),
          ...session,
      };
      
      existingReports.unshift(newReport); // Adiciona no início para mostrar o mais recente primeiro
      
      // Limita o número de relatórios salvos (ex: 50)
      const updatedReports = existingReports.slice(0, 50); 
      
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(updatedReports));
      
      setIsSaved(true);
      toast.success("Relatório de desempenho salvo com sucesso!");
      
      // Navega para a tela de relatórios após salvar
      navigate('/math/reports');
      
    } catch (error) {
      console.error("Erro ao salvar sessão no localStorage:", error);
      toast.error("Erro ao salvar o relatório. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }, [session, difficulty, playerName, isSaved, navigate]);


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
        <Button 
            variant="secondary" 
            onClick={handleSaveAndFinish} 
            disabled={isSaving} 
            className="w-full shadow-soft"
        >
            <Save className={cn("w-5 h-5 mr-2", isSaving && "animate-spin")} />
            {isSaving ? "Salvando Desempenho..." : "Salvar Desempenho e Ver Relatórios"}
        </Button>
        <Button variant="outline" onClick={onBackToMenu} className="w-full">
          Voltar para Seleção de Nível
        </Button>
      </div>
    </Card>
  );
};

export default ResultScreen;