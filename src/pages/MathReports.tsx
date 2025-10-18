import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, User, Clock, CheckCircle, XCircle, TrendingUp, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type MathSession = Tables<'math_sessions'>;

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
  "very-hard": "Muito Difícil",
};

const OPERATION_LABELS: Record<string, string> = {
    addition: "Soma",
    subtraction: "Subtração",
    multiplication: "Multiplicação",
    division: "Divisão",
    equation: "Equação",
};

const fetchMathReports = async (): Promise<MathSession[]> => {
  const { data, error } = await supabase
    .from('math_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const MathReports = () => {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  const { data: sessions, isLoading, error, refetch } = useQuery<MathSession[], Error>({
    queryKey: ['mathReports'],
    queryFn: fetchMathReports,
  });
  
  const playerNames = Array.from(new Set(sessions?.map(s => s.player_name) || []));
  
  const filteredSessions = sessions?.filter(s => selectedPlayer === null || s.player_name === selectedPlayer) || [];
  
  const getPerformanceData = (sessions: MathSession[]) => {
    const aggregated: Record<string, { correct: number; total: number }> = {};
    
    sessions.forEach(session => {
        const performance = session.performance_data as Record<string, { correct: number; total: number }>;
        if (performance) {
            Object.entries(performance).forEach(([op, data]) => {
                if (data.total > 0) {
                    if (!aggregated[op]) {
                        aggregated[op] = { correct: 0, total: 0 };
                    }
                    aggregated[op].correct += data.correct;
                    aggregated[op].total += data.total;
                }
            });
        }
    });
    
    return Object.entries(aggregated).map(([op, data]) => ({
        name: OPERATION_LABELS[op] || op,
        Precisão: data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0,
        Total: data.total,
    }));
  };
  
  const performanceData = getPerformanceData(filteredSessions);
  
  const getLevelAccuracyData = (sessions: MathSession[]) => {
    const levels: Record<string, { correct: number; total: number }> = {};
    
    sessions.forEach(session => {
        const level = DIFFICULTY_LABELS[session.difficulty] || session.difficulty;
        if (!levels[level]) {
            levels[level] = { correct: 0, total: 0 };
        }
        levels[level].correct += session.correct_answers;
        levels[level].total += session.total_questions;
    });
    
    return Object.entries(levels).map(([level, data]) => ({
        name: level,
        Precisão: data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0,
    }));
  };
  
  const levelAccuracyData = getLevelAccuracyData(filteredSessions);

  if (error) {
    toast.error("Erro ao carregar relatórios: " + error.message);
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />
      
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(202,95%,84%)] via-[hsl(288,95%,86%)] to-[hsl(145,90%,84%)] shadow-soft">
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-12 h-12 text-primary fill-primary/20" />
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Relatórios de Matemática</h1>
              <p className="text-sm md:text-base text-muted-foreground">Acompanhe o desempenho dos alunos.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
                <Button 
                    variant={selectedPlayer === null ? "gradient" : "outline"} 
                    onClick={() => setSelectedPlayer(null)}
                    size="sm"
                >
                    Todos
                </Button>
                {playerNames.map(name => (
                    <Button 
                        key={name} 
                        variant={selectedPlayer === name ? "gradient" : "outline"} 
                        onClick={() => setSelectedPlayer(name)}
                        size="sm"
                    >
                        <User className="w-4 h-4 mr-1" /> {name}
                    </Button>
                ))}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                    Atualizar
                </Button>
                <Button variant="secondary" onClick={() => navigate('/math')}>
                    Voltar para Matemática
                </Button>
            </div>
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-80 w-full rounded-xl" />
                <Skeleton className="h-80 w-full rounded-xl" />
            </div>
        ) : filteredSessions.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-border">
                <p className="text-muted-foreground">Nenhum relatório encontrado para {selectedPlayer || 'todos os alunos'}.</p>
            </Card>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gráfico de Precisão por Tipo de Operação */}
                <Card className="p-6 shadow-card border-2 border-border">
                    <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Precisão por Tipo de Operação
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" stroke="#333" />
                            <YAxis unit="%" domain={[0, 100]} stroke="#333" />
                            <Tooltip formatter={(value: number) => [`${value}%`, 'Precisão']} />
                            <Bar dataKey="Precisão" fill="#00B4D8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                {/* Gráfico de Precisão por Nível */}
                <Card className="p-6 shadow-card border-2 border-border">
                    <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                        Precisão por Nível de Dificuldade
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={levelAccuracyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" stroke="#333" />
                            <YAxis unit="%" domain={[0, 100]} stroke="#333" />
                            <Tooltip formatter={(value: number) => [`${value}%`, 'Precisão']} />
                            <Bar dataKey="Precisão" fill="#F6C90E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                {/* Histórico de Sessões */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-foreground">Histórico Recente</h2>
                    {filteredSessions.map((session, index) => (
                        <Card key={session.id} className="p-4 border-2 border-border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-display font-bold text-lg">{session.player_name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(session.created_at).toLocaleDateString('pt-BR')} - {new Date(session.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-4 text-center border-t pt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Nível</p>
                                    <p className="font-semibold">{DIFFICULTY_LABELS[session.difficulty]}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Acertos</p>
                                    <p className="font-semibold text-success">{session.correct_answers} / {session.total_questions}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Tempo Total</p>
                                    <p className="font-semibold">{session.time_spent_seconds}s</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MathReports;