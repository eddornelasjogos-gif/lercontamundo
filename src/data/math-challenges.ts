export interface MathChallenge {
  id: number;
  title: string;
  description: string;
  difficulty: "Fácil" | "Médio" | "Difícil" | "Muito Difícil";
  exercises: number;
  xp: number;
}

export const mathChallenges: MathChallenge[] = [
  // Easy
  { id: 1, title: "Soma Divertida", description: "Pratique adições básicas", difficulty: "Fácil", exercises: 10, xp: 40 },
  { id: 2, title: "Subtração Mágica", description: "Aprenda a subtrair", difficulty: "Fácil", exercises: 10, xp: 40 },
  { id: 3, title: "Contando com Objetos", description: "Quantos são?", difficulty: "Fácil", exercises: 8, xp: 30 },
  { id: 4, title: "Formas e Números", description: "Combina formas com números", difficulty: "Fácil", exercises: 6, xp: 25 },
  // Medium
  { id: 10, title: "Multiplicação Estelar", description: "Tabuada interativa", difficulty: "Médio", exercises: 15, xp: 60 },
  { id: 11, title: "Divisão Espacial", description: "Divida e conquiste", difficulty: "Médio", exercises: 15, xp: 60 },
  { id: 12, title: "Frações Simples", description: "Aprenda frações básicas", difficulty: "Médio", exercises: 12, xp: 55 },
  { id: 13, title: "Medidas e Unidades", description: "Compreendendo medidas", difficulty: "Médio", exercises: 10, xp: 50 },
  // Hard
  { id: 20, title: "Proporções e Razões", description: "Problemas de proporção", difficulty: "Difícil", exercises: 12, xp: 90 },
  { id: 21, title: "Equações Básicas", description: "Introdução a equações", difficulty: "Difícil", exercises: 14, xp: 100 },
  { id: 22, title: "Problemas de Texto", description: "Resolver usando lógica", difficulty: "Difícil", exercises: 16, xp: 110 },
  { id: 23, title: "Geometria Básica", description: "Perímetros e áreas", difficulty: "Difícil", exercises: 12, xp: 95 },
  // Very Hard
  { id: 30, title: "Desafios Avançados", description: "Problemas complexos", difficulty: "Muito Difícil", exercises: 20, xp: 150 },
  { id: 31, title: "Raciocínio Lógico Avançado", description: "Desafios de lógica", difficulty: "Muito Difícil", exercises: 18, xp: 140 },
  { id: 32, title: "Mistura de Operações", description: "Misture tudo e resolva", difficulty: "Muito Difícil", exercises: 20, xp: 160 },
];