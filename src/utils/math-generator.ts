import { shuffle } from 'lodash';
import { generateStoryQuestionText, resetStoryProblemUsage } from './math-story-generator';

export type Difficulty = "easy" | "medium" | "hard" | "very-hard";
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'equation';

export interface Question {
  id: number;
  operation: OperationType;
  questionText: string;
  expression: string;
  answer: number;
  options: number[];
  xpReward: number;
}

export interface HelpStep {
  text: string;
  visualAid?: string; // Ex: 'blocks', 'fingers', 'decimal_shift'
}

export interface HelpContent {
  title: string;
  steps: HelpStep[];
}

const generateRandomNumber = (min: number, max: number, isDecimal: boolean = false): number => {
  if (isDecimal) {
    const integerPart = Math.floor(Math.random() * (max - min + 1)) + min;
    const decimalPart = Math.floor(Math.random() * 100) / 100;
    return parseFloat((integerPart + decimalPart).toFixed(2));
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateOptions = (correctAnswer: number, difficulty: Difficulty): number[] => {
  const options: number[] = [correctAnswer];
  const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
  
  while (options.length < 4) {
    let deviation = generateRandomNumber(-range, range);
    
    // Evita zero ou números muito distantes
    if (Math.abs(deviation) < 1) deviation = deviation > 0 ? 1 : -1;
    
    let option = correctAnswer + deviation;
    
    if (difficulty === 'easy' || difficulty === 'medium') {
        option = Math.round(option);
    } else {
        option = parseFloat(option.toFixed(2));
    }
    
    if (option > 0 && !options.includes(option)) {
      options.push(option);
    }
  }
  
  return shuffle(options);
};

const generateEasyQuestion = (id: number): Omit<Question, 'questionText'> => {
  const isAddition = Math.random() < 0.5;
  const xpReward = 40;
  
  if (isAddition) {
    const num1 = generateRandomNumber(10, 90);
    const num2 = generateRandomNumber(1, 100 - num1);
    const answer = num1 + num2;
    return {
      id,
      operation: 'addition',
      expression: `${num1} + ${num2}`,
      answer,
      options: generateOptions(answer, 'easy'),
      xpReward,
    };
  } else {
    const num1 = generateRandomNumber(20, 100);
    const num2 = generateRandomNumber(1, num1 - 10);
    const answer = num1 - num2;
    return {
      id,
      operation: 'subtraction',
      expression: `${num1} - ${num2}`,
      answer,
      options: generateOptions(answer, 'easy'),
      xpReward,
    };
  }
};

const generateMediumQuestion = (id: number): Omit<Question, 'questionText'> => {
  const isMultiplication = Math.random() < 0.5;
  const xpReward = 60;
  
  if (isMultiplication) {
    const num1 = generateRandomNumber(2, 12);
    const num2 = generateRandomNumber(2, 12);
    const answer = num1 * num2;
    return {
      id,
      operation: 'multiplication',
      expression: `${num1} x ${num2}`,
      answer,
      options: generateOptions(answer, 'medium'),
      xpReward,
    };
  } else {
    const num2 = generateRandomNumber(2, 10);
    const num1 = num2 * generateRandomNumber(2, 10);
    const answer = num1 / num2;
    return {
      id,
      operation: 'division',
      expression: `${num1} ÷ ${num2}`,
      answer,
      options: generateOptions(answer, 'medium'),
      xpReward,
    };
  }
};

const generateHardQuestion = (id: number): Omit<Question, 'questionText'> => {
  const isMultiplication = Math.random() < 0.5;
  const xpReward = 90;
  
  if (isMultiplication) {
    const num1 = generateRandomNumber(1, 10, true);
    const num2 = generateRandomNumber(1, 10, true);
    const answer = parseFloat((num1 * num2).toFixed(2));
    return {
      id,
      operation: 'multiplication',
      expression: `${num1} x ${num2}`,
      answer,
      options: generateOptions(answer, 'hard'),
      xpReward,
    };
  } else {
    const num2 = generateRandomNumber(1, 5, true);
    const answer = generateRandomNumber(1, 10, true);
    const num1 = parseFloat((num2 * answer).toFixed(2));
    return {
      id,
      operation: 'division',
      expression: `${num1} ÷ ${num2}`,
      answer,
      options: generateOptions(answer, 'hard'),
      xpReward,
    };
  }
};

const generateVeryHardQuestion = (id: number, operationType: OperationType): Omit<Question, 'questionText'> => {
  const xpReward = 120;
  
  if (operationType === 'equation') {
    // Equação simples: ax + b = c
    const a = generateRandomNumber(2, 5);
    const b = generateRandomNumber(1, 10);
    const answer = generateRandomNumber(2, 10);
    const c = a * answer + b;
    
    return {
      id,
      operation: 'equation',
      expression: `${a}x + ${b} = ${c}`,
      answer,
      options: generateOptions(answer, 'very-hard'),
      xpReward,
    };
  } else if (operationType === 'multiplication') {
    // Multiplicação de números grandes (inteiros)
    const num1 = generateRandomNumber(10, 50);
    const num2 = generateRandomNumber(10, 50);
    const answer = num1 * num2;
    return {
      id,
      operation: 'multiplication',
      expression: `${num1} x ${num2}`,
      answer,
      options: generateOptions(answer, 'very-hard'),
      xpReward,
    };
  } else { // division
    // Divisão de números grandes (inteiros)
    const num2 = generateRandomNumber(10, 20);
    const answer = generateRandomNumber(10, 30);
    const num1 = num2 * answer;
    return {
      id,
      operation: 'division',
      expression: `${num1} ÷ ${num2}`,
      answer,
      options: generateOptions(answer, 'very-hard'),
      xpReward,
    };
  }
};

export const generateMathQuestions = (difficulty: Difficulty): Question[] => {
  let questions: Omit<Question, 'questionText'>[] = [];
  let idCounter = 1;
  
  // Resetar o uso de problemas de história ao gerar um novo conjunto
  resetStoryProblemUsage();
  
  switch (difficulty) {
    case 'easy':
      // 10 somas + 10 subtrações
      for (let i = 0; i < 10; i++) {
        questions.push(generateEasyQuestion(idCounter++));
      }
      for (let i = 0; i < 10; i++) {
        questions.push(generateEasyQuestion(idCounter++));
      }
      // Garante 10 de cada
      questions = questions.filter(q => q.operation === 'addition').slice(0, 10)
        .concat(questions.filter(q => q.operation === 'subtraction').slice(0, 10));
      break;
      
    case 'medium':
      // 10 multiplicações + 10 divisões
      for (let i = 0; i < 10; i++) {
        questions.push(generateMediumQuestion(idCounter++));
      }
      for (let i = 0; i < 10; i++) {
        questions.push(generateMediumQuestion(idCounter++));
      }
      questions = questions.filter(q => q.operation === 'multiplication').slice(0, 10)
        .concat(questions.filter(q => q.operation === 'division').slice(0, 10));
      break;
      
    case 'hard':
      // 10 multiplicações + 10 divisões (decimais)
      for (let i = 0; i < 10; i++) {
        questions.push(generateHardQuestion(idCounter++));
      }
      for (let i = 0; i < 10; i++) {
        questions.push(generateHardQuestion(idCounter++));
      }
      questions = questions.filter(q => q.operation === 'multiplication').slice(0, 10)
        .concat(questions.filter(q => q.operation === 'division').slice(0, 10));
      break;
      
    case 'very-hard':
      // 10 multiplicações + 10 divisões + 5 equações (Total 25)
      for (let i = 0; i < 10; i++) {
        questions.push(generateVeryHardQuestion(idCounter++, 'multiplication'));
      }
      for (let i = 0; i < 10; i++) {
        questions.push(generateVeryHardQuestion(idCounter++, 'division'));
      }
      for (let i = 0; i < 5; i++) {
        questions.push(generateVeryHardQuestion(idCounter++, 'equation'));
      }
      break;
  }
  
  // Garante que o total seja 20 (Easy, Medium, Hard) ou 25 (Very Hard)
  const targetCount = difficulty === 'very-hard' ? 25 : 20;
  questions = shuffle(questions.slice(0, targetCount));
  
  // Re-indexa IDs após o shuffle e adiciona o texto da história
  return questions.map((q, index) => {
      const questionWithText: Question = {
          ...q,
          id: index + 1,
          questionText: generateStoryQuestionText(q as Question),
      };
      return questionWithText;
  });
};

export const getHelpContent = (question: Question): HelpContent => {
  const { operation, expression, answer } = question;
  const [num1Str, op, num2Str, eq, resultStr] = expression.split(' ').filter(Boolean);
  
  const num1 = parseFloat(num1Str);
  const num2 = parseFloat(num2Str);
  
  switch (operation) {
    case 'addition':
      return {
        title: `Como somar ${num1} + ${num2}?`,
        steps: [
          { text: `1. Pense em ${num1} blocos.`, visualAid: 'blocks' },
          { text: `2. Adicione ${num2} blocos a eles.`, visualAid: 'blocks' },
          { text: `3. Conte o total: ${num1} + ${num2} = ${answer}.`, visualAid: 'blocks' },
        ],
      };
    case 'subtraction':
      return {
        title: `Como subtrair ${num1} - ${num2}?`,
        steps: [
          { text: `1. Comece com ${num1} bolinhas.`, visualAid: 'fingers' },
          { text: `2. Retire ${num2} bolinhas.`, visualAid: 'fingers' },
          { text: `3. O que sobrou é a resposta: ${num1} - ${num2} = ${answer}.`, visualAid: 'fingers' },
        ],
      };
    case 'multiplication':
      if (question.options.some(opt => opt % 1 !== 0)) { // Decimais (Hard/Very Hard)
        return {
          title: `Como multiplicar ${num1} x ${num2}?`,
          steps: [
            { text: `1. Multiplique os números como se não tivessem vírgula: ${num1Str.replace('.', '')} x ${num2Str.replace('.', '')}.`, visualAid: 'decimal_shift' },
            { text: `2. Conte quantas casas decimais (depois da vírgula) existem nos dois números juntos.`, visualAid: 'decimal_shift' },
            { text: `3. Coloque a vírgula no resultado, contando da direita para a esquerda, o número de casas que você contou. O resultado é ${answer}.`, visualAid: 'decimal_shift' },
          ],
        };
      } else { // Inteiros (Medium/Very Hard)
        return {
          title: `Como multiplicar ${num1} x ${num2}?`,
          steps: [
            { text: `1. Multiplicar é somar o número ${num1} por ele mesmo, ${num2} vezes.`, visualAid: 'groups' },
            { text: `2. Imagine ${num2} grupos, cada um com ${num1} itens.`, visualAid: 'groups' },
            { text: `3. O total é ${answer}.`, visualAid: 'groups' },
          ],
        };
      }
    case 'division':
      if (question.options.some(opt => opt % 1 !== 0)) { // Decimais (Hard/Very Hard)
        return {
          title: `Como dividir ${num1} ÷ ${num2}?`,
          steps: [
            { text: `1. Transforme o divisor (${num2}) em um número inteiro, movendo a vírgula. Faça o mesmo com o dividendo (${num1}).`, visualAid: 'decimal_shift' },
            { text: `2. Agora, divida os novos números normalmente.`, visualAid: 'division_long' },
            { text: `3. O resultado é ${answer}.`, visualAid: 'division_long' },
          ],
        };
      } else { // Inteiros (Medium/Very Hard)
        return {
          title: `Como dividir ${num1} ÷ ${num2}?`,
          steps: [
            { text: `1. Dividir é distribuir ${num1} itens em ${num2} grupos iguais.`, visualAid: 'groups' },
            { text: `2. Quantas vezes o número ${num2} cabe dentro do número ${num1}?`, visualAid: 'groups' },
            { text: `3. A resposta é ${answer}.`, visualAid: 'groups' },
          ],
        };
      }
    case 'equation':
      // Ex: ax + b = c
      const [aStr, , bStr, , cStr] = expression.split(' ').filter(Boolean);
      const a = parseInt(aStr.replace('x', ''));
      const b = parseInt(bStr);
      const c = parseInt(cStr);
      
      return {
        title: `Resolvendo ${expression}`,
        steps: [
          { text: `1. Isole o termo com 'x': Subtraia ${b} dos dois lados: ${a}x = ${c} - ${b}.`, visualAid: 'balance' },
          { text: `2. Calcule a subtração: ${a}x = ${c - b}.`, visualAid: 'balance' },
          { text: `3. Divida o resultado por ${a} para encontrar 'x': x = ${c - b} ÷ ${a}.`, visualAid: 'balance' },
          { text: `4. O número misterioso é x = ${answer}.`, visualAid: 'balance' },
        ],
      };
    default:
      return { title: "Ajuda Indisponível", steps: [{ text: "Não foi possível gerar a ajuda para esta operação.", visualAid: '' }] };
  }
};