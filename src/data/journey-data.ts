import { BookOpen, Calculator, BrainCircuit, Library } from "lucide-react";

export interface JourneyStage {
  id: string;
  type: "reading" | "math";
  targetId: number;
  title: string;
  icon: React.ElementType;
  position: {
    top: string;
    left: string;
  };
}

export const journeyPath: JourneyStage[] = [
  { id: 'stage-1', type: 'reading', targetId: 102, title: 'A Lebre e a Tartaruga', icon: BookOpen, position: { top: '80%', left: '15%' } },
  { id: 'stage-2', type: 'math', targetId: 1, title: 'Soma Divertida', icon: Calculator, position: { top: '70%', left: '30%' } },
  { id: 'stage-3', type: 'reading', targetId: 103, title: 'O Leão e o Rato', icon: BookOpen, position: { top: '75%', left: '50%' } },
  { id: 'stage-4', type: 'math', targetId: 2, title: 'Subtração Mágica', icon: Calculator, position: { top: '60%', left: '65%' } },
  { id: 'stage-5', type: 'reading', targetId: 111, title: 'O Patinho Feio', icon: BookOpen, position: { top: '45%', left: '50%' } },
  { id: 'stage-6', type: 'math', targetId: 10, title: 'Multiplicação Estelar', icon: BrainCircuit, position: { top: '50%', left: '30%' } },
  { id: 'stage-7', type: 'reading', targetId: 201, title: 'Chapeuzinho Vermelho', icon: Library, position: { top: '35%', left: '15%' } },
  { id: 'stage-8', type: 'math', targetId: 11, title: 'Divisão Espacial', icon: BrainCircuit, position: { top: '20%', left: '30%' } },
  { id: 'stage-9', type: 'reading', targetId: 301, title: 'Pinóquio', icon: Library, position: { top: '15%', left: '50%' } },
  { id: 'stage-10', type: 'math', targetId: 20, title: 'Proporções e Razões', icon: BrainCircuit, position: { top: '25%', left: '70%' } },
];