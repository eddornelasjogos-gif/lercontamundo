import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question, getHelpContent } from "@/utils/math-generator";
import { Lightbulb, CheckCircle, XCircle } from "lucide-react";
import HelpModal from "./HelpModal";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean, timeTaken: number, usedHelp: boolean) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [startTime] = useState(Date.now());
  const [usedHelp, setUsedHelp] = useState(false);

  const handleAnswer = (answer: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const correct = answer === question.answer;
    setIsCorrect(correct);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    // Delay para o feedback visual antes de chamar o callback
    setTimeout(() => {
      onAnswer(correct, timeTaken, usedHelp);
    }, 1500);
  };
  
  const handleShowHelp = () => {
    setUsedHelp(true);
    setShowHelp(true);
  };

  const helpContent = getHelpContent(question);

  return (
    <Card className="p-6 md:p-8 shadow-soft border-2 border-primary/30 bg-white/80 backdrop-blur-sm animate-scale-in space-y-6">
      
      {/* Enunciado */}
      <div className="text-center space-y-4">
        <p className="text-lg font-body text-muted-foreground">Questão {question.id}</p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          {question.questionText}
        </h2>
        <div className="text-4xl md:text-5xl font-display font-extrabold text-primary/90 p-4 bg-primary/5 rounded-xl border border-primary/10">
          {question.expression} = ?
        </div>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === question.answer;
          
          let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
          let icon = null;
          
          if (isAnswered) {
            if (isCorrectOption) {
              variant = "default";
              icon = <CheckCircle className="w-5 h-5 mr-2" />;
            } else if (isSelected) {
              variant = "destructive";
              icon = <XCircle className="w-5 h-5 mr-2" />;
            } else {
              variant = "outline";
            }
          } else if (isSelected) {
            variant = "secondary";
          }

          return (
            <Button
              key={option}
              variant={variant}
              size="lg"
              className={cn(
                "font-display text-lg py-8 transition-all duration-300",
                isAnswered && isCorrectOption && "gradient-success text-white shadow-soft",
                isAnswered && isSelected && !isCorrect && "bg-destructive/80 text-white shadow-soft",
                !isAnswered && "hover:bg-primary/10"
              )}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
            >
              {icon}
              {option}
            </Button>
          );
        })}
      </div>
      
      {/* Feedback e Ajuda */}
      <div className="flex justify-between items-center pt-4">
        {isAnswered && (
          <div className={cn(
            "text-xl font-display font-bold transition-opacity duration-500",
            isCorrect ? "text-success" : "text-destructive"
          )}>
            {isCorrect ? "✅ Parabéns!" : "❌ Tente novamente!"}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShowHelp}
          className="text-primary hover:bg-primary/10"
          disabled={isAnswered}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Como resolver?
        </Button>
      </div>
      
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
        helpContent={helpContent} 
      />
    </Card>
  );
};

export default QuestionCard;