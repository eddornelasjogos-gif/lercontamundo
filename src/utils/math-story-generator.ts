import { Question, OperationType } from './math-generator';

// Lista de textos de problemas baseados em histórias, categorizados por operação.
// Cada função recebe os números (num1, num2) e a resposta (answer) para criar o texto.

const STORY_PROBLEMS: Record<OperationType, ((num1: number, num2: number, answer: number) => string)[]> = {
    addition: [
        (num1, num2, answer) => `A Rapunzel tinha ${num1} metros de trança. Ela deixou crescer mais ${num2} metros. Qual o comprimento total da trança?`,
        (num1, num2, answer) => `O Patinho Feio encontrou ${num1} peixes no lago e depois achou mais ${num2}. Quantos peixes ele tem agora?`,
        (num1, num2, answer) => `O João subiu ${num1} degraus no pé de feijão e depois subiu mais ${num2}. Quantos degraus ele subiu no total?`,
        (num1, num2, answer) => `A Cinderela perdeu ${num1} sapatos de cristal e a Bela Adormecida perdeu ${num2}. Quantos sapatos foram perdidos no total?`,
        (num1, num2, answer) => `O Leão e o Rato juntaram ${num1} pedaços de queijo e ${num2} pedaços de pão. Quantos itens eles têm para comer?`,
    ],
    subtraction: [
        (num1, num2, answer) => `O Pinóquio tinha ${num1} moedas de ouro, mas gastou ${num2} na Ilha dos Prazeres. Quantas moedas sobraram?`,
        (num1, num2, answer) => `O Flautista de Hamelin levou ${num1} ratos para o rio. Se ${num2} voltaram, quantos ratos se afogaram?`,
        (num1, num2, answer) => `A Branca de Neve colheu ${num1} maçãs. Se ela deu ${num2} para os anões, quantas maçãs restaram?`,
        (num1, num2, answer) => `O Robinson Crusoé tinha ${num1} cocos e comeu ${num2}. Quantos cocos ele ainda tem na ilha?`,
        (num1, num2, answer) => `O Pequeno Polegar tinha ${num1} migalhas de pão, mas os pássaros comeram ${num2}. Quantas migalhas sobraram?`,
    ],
    multiplication: [
        (num1, num2, answer) => `O Simbad, o Marinheiro, fez ${num1} viagens, e em cada uma ele encontrou ${num2} tesouros. Quantos tesouros ele encontrou no total?`,
        (num1, num2, answer) => `O Lobo Mau tentou soprar ${num1} casas, e em cada casa havia ${num2} porquinhos. Quantos porquinhos ele tentou assustar?`,
        (num1, num2, answer) => `O Capitão Ahab do Pequod precisa de ${num1} barris de óleo de baleia, e cada baleia dá ${num2} barris. Quantos barris ele terá?`,
        (num1, num2, answer) => `A Galinha dos Ovos de Ouro botou ${num1} ovos por ${num2} dias. Quantos ovos de ouro ela botou?`,
        (num1, num2, answer) => `O Ali Babá encontrou ${num1} sacos de ouro, e cada saco tinha ${num2} moedas. Quantas moedas no total?`,
    ],
    division: [
        (num1, num2, answer) => `O Mágico de Oz tinha ${num1} esmeraldas para dividir igualmente entre ${num2} amigos. Quantas esmeraldas cada um recebeu?`,
        (num1, num2, answer) => `O fidalgo Dom Quixote tinha ${num1} moedas para dividir com ${num2} camponeses. Quantas moedas cada camponês recebeu?`,
        (num1, num2, answer) => `A Heidi colheu ${num1} flores para dividir em ${num2} vasos. Quantas flores em cada vaso?`,
        (num1, num2, answer) => `O Gênio do jarro tinha ${num1} desejos para dividir entre ${num2} pescadores. Quantos desejos para cada um?`,
        (num1, num2, answer) => `O Dr. Jekyll tinha ${num1} mililitros de soro para dividir em ${num2} frascos. Quantos mililitros em cada frasco?`,
    ],
    equation: [
        (a, b, c) => `O fidalgo Dom Quixote tinha um número misterioso (x) de livros. Se ${a} vezes esse número, mais ${b}, é igual a ${c}, quantos livros ele tinha?`,
        (a, b, c) => `O Gato de Cheshire disse que o número de chás (x) que ele bebeu, multiplicado por ${a} e somado a ${b}, é igual a ${c}. Quantos chás ele bebeu?`,
        (a, b, c) => `O Pinóquio disse que o número de mentiras (x) que ele contou, multiplicado por ${a} e somado a ${b}, é igual a ${c}. Quantas mentiras ele contou?`,
        (a, b, c) => `O Simbad, o Marinheiro, disse que o número de dias (x) que ele passou no mar, multiplicado por ${a} e somado a ${b}, é igual a ${c}. Quantos dias ele passou no mar?`,
    ]
};

let usedProblemIndices: Record<OperationType, number[]> = {
    addition: [],
    subtraction: [],
    multiplication: [],
    division: [],
    equation: [],
};

const getNextProblemText = (operation: OperationType, num1: number, num2: number, answer: number): string => {
    const problems = STORY_PROBLEMS[operation];
    if (!problems || problems.length === 0) {
        return `Calcule: ${num1} ${operation === 'subtraction' ? '-' : operation === 'multiplication' ? 'x' : operation === 'division' ? '÷' : '+'} ${num2}`;
    }

    let availableIndices = problems.map((_, i) => i).filter(i => !usedProblemIndices[operation].includes(i));

    if (availableIndices.length === 0) {
        // Se todos foram usados, reinicia a lista de usados para esta operação
        usedProblemIndices[operation] = [];
        availableIndices = problems.map((_, i) => i);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedProblemIndices[operation].push(randomIndex);

    const generator = problems[randomIndex];
    
    if (operation === 'equation') {
        // Para equações, num1 é 'a', num2 é 'b', e answer é 'x' (o resultado)
        // O terceiro parâmetro é 'c' (o resultado da expressão)
        const a = num1;
        const b = num2;
        const c = a * answer + b;
        return generator(a, b, c);
    }
    
    return generator(num1, num2, answer);
};

export const generateStoryQuestionText = (question: Question): string => {
    const { operation, expression, answer } = question;
    
    // Extrai os números da expressão
    // Corrigido: Removido o escape hexadecimal incorreto (\x)
    const parts = expression.split(/[\s\+\-\÷\=x]+/g).filter(Boolean);
    
    let num1 = parseFloat(parts[0]);
    let num2 = parseFloat(parts[1]);
    
    if (operation === 'equation') {
        // Para equações (ax + b = c), num1 é 'a' e num2 é 'b'
        const a = parseInt(parts[0].replace('x', ''));
        const b = parseInt(parts[1]);
        return getNextProblemText(operation, a, b, answer);
    }
    
    return getNextProblemText(operation, num1, num2, answer);
};

// Função para resetar o estado de problemas usados (útil ao iniciar uma nova sessão)
export const resetStoryProblemUsage = () => {
    usedProblemIndices = {
        addition: [],
        subtraction: [],
        multiplication: [],
        division: [],
        equation: [],
    };
};