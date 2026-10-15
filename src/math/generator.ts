import { DifficultyLevel, Question, SolutionStep } from '../types';
import { Fraction } from './fraction';
import { TOPICS, getTopicById } from './topics';

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNonZeroInt(min: number, max: number): number {
  let val = 0;
  while (val === 0) {
    val = randomInt(min, max);
  }
  return val;
}

// Helper to format monomial in positive exponent standard form
// e.g., coeff * var1^exp1 * var2^exp2
function formatMonomial(
  coeff: Fraction,
  vars: { [v: string]: Fraction },
  positiveExponentsOnly: boolean = true
): string {
  // If coeff is zero
  if (coeff.isZero()) return '0';

  // Separate into numerator and denominator variables
  const numVars: { name: string; exp: Fraction }[] = [];
  const denVars: { name: string; exp: Fraction }[] = [];

  for (const [v, exp] of Object.entries(vars)) {
    if (exp.isZero()) continue;
    if (positiveExponentsOnly && exp.isNegative()) {
      denVars.push({ name: v, exp: exp.abs() });
    } else {
      numVars.push({ name: v, exp });
    }
  }

  const formatVarList = (list: { name: string; exp: Fraction }[]): string => {
    return list
      .map(item => {
        if (item.exp.isOne()) {
          return item.name;
        }
        return `${item.name}^{${item.exp.toExponentTeX()}}`;
      })
      .join(' ');
  };

  const numVarStr = formatVarList(numVars);
  const denVarStr = formatVarList(denVars);

  if (denVars.length === 0 && coeff.den === 1) {
    // Pure numerator integer
    if (numVars.length === 0) return `${coeff.num}`;
    if (coeff.num === 1) return numVarStr;
    if (coeff.num === -1) return `-${numVarStr}`;
    return `${coeff.num} ${numVarStr}`;
  }

  // Fraction format
  let numPart = '';
  if (Math.abs(coeff.num) === 1 && numVars.length > 0) {
    numPart = (coeff.num < 0 ? '-' : '') + numVarStr;
  } else if (numVars.length === 0) {
    numPart = `${coeff.num}`;
  } else {
    numPart = `${coeff.num} ${numVarStr}`;
  }

  let denPart = '';
  if (coeff.den === 1) {
    denPart = denVarStr;
  } else if (denVars.length === 0) {
    denPart = `${coeff.den}`;
  } else {
    denPart = `${coeff.den} ${denVarStr}`;
  }

  if (denPart === '') {
    return numPart;
  }

  return `\\frac{${numPart}}{${denPart}}`;
}

// Shuffle array helper
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate unique options list ensuring distractors don't match correct or each other
function assembleOptions(
  correctLatex: string,
  rawDistractors: { latex: string; errorType?: string }[]
): { options: { latex: string; isCorrect: boolean; errorType?: string }[]; correctIndex: number } {
  const uniqueDistractors: { latex: string; errorType?: string }[] = [];
  const seen = new Set<string>([correctLatex]);

  for (const d of rawDistractors) {
    const trimmed = d.latex.trim();
    if (!seen.has(trimmed) && trimmed !== '') {
      seen.add(trimmed);
      uniqueDistractors.push(d);
    }
  }

  // Fallback if needed to reach 3 distractors
  let fallbackCount = 1;
  while (uniqueDistractors.length < 3) {
    const alt = `${correctLatex} + ${fallbackCount}`;
    if (!seen.has(alt)) {
      seen.add(alt);
      uniqueDistractors.push({ latex: alt, errorType: 'Alternative distractor' });
    }
    fallbackCount++;
  }

  const selectedDistractors = uniqueDistractors.slice(0, 3);
  const allChoices = [
    { latex: correctLatex, isCorrect: true, errorType: undefined },
    ...selectedDistractors.map(d => ({ latex: d.latex, isCorrect: false, errorType: d.errorType }))
  ];

  const shuffled = shuffle(allChoices);
  const correctIndex = shuffled.findIndex(c => c.isCorrect);

  return { options: shuffled, correctIndex };
}

// -------------------------------------------------------------
// TOPIC GENERATORS
// -------------------------------------------------------------

function generateProductOfPowers(level: DifficultyLevel): Question {
  const v = randomChoice(['x', 'y', 'a', 'b', 'm']);
  let promptText = 'Simplify the expression completely using the Product of Powers rule:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];
  let commonMistake = '';

  if (level === 1) {
    const m = randomInt(2, 6);
    const n = randomInt(2, 6);
    const sum = m + n;
    expressionLatex = `${v}^{${m}} \\cdot ${v}^{${n}}`;
    correctLatex = `${v}^{${sum}}`;
    distractors = [
      { latex: `${v}^{${m * n}}`, errorType: 'Multiplied exponents instead of adding them' },
      { latex: `${v}^{${Math.abs(m - n) || 1}}`, errorType: 'Subtracted exponents instead of adding them' },
      { latex: `${v}^{${sum + 1}}`, errorType: 'Arithmetic addition error' }
    ];
    steps.push({
      step: 1,
      title: 'Identify the common base',
      latex: `\\text{Base} = ${v}`,
      explanation: `Both factors share the same base ${v}, so the product rule applies: a^m \\cdot a^n = a^{m+n}.`
    });
    steps.push({
      step: 2,
      title: 'Add the exponents',
      latex: `${v}^{${m} + ${n}} = ${v}^{${sum}}`,
      explanation: `Calculate ${m} + ${n} = ${sum}.`
    });
    commonMistake = `Common mistake: Multiplying the exponents (${m} \\times ${n} = ${m * n}) instead of adding them. Remember: powers of the same base combine by adding exponents!`;
  } else if (level === 2) {
    const m = randomInt(3, 7);
    const n = -randomInt(1, 4);
    const sum = m + n;
    expressionLatex = `${v}^{${m}} \\cdot ${v}^{${n}}`;
    if (sum > 0) {
      correctLatex = sum === 1 ? v : `${v}^{${sum}}`;
    } else if (sum === 0) {
      correctLatex = '1';
    } else {
      correctLatex = `\\frac{1}{${v}^{${Math.abs(sum)}}}`;
    }
    distractors = [
      { latex: `${v}^{${m - n}}`, errorType: 'Subtracted a negative instead of adding: m - (-n)' },
      { latex: `${v}^{${m * n}}`, errorType: 'Multiplied exponents' },
      { latex: `\\frac{1}{${v}^{${Math.abs(sum) + 2}}}`, errorType: 'Incorrect negative exponent simplification' }
    ];
    steps.push({
      step: 1,
      title: 'Apply Product of Powers rule',
      latex: `${v}^{${m} + (${n})}`,
      explanation: `Add the positive and negative exponent: ${m} + (${n}) = ${sum}.`
    });
    steps.push({
      step: 2,
      title: 'Express with positive exponents',
      latex: correctLatex,
      explanation: sum < 0 ? `Convert ${v}^{${sum}} into positive exponent form: \\frac{1}{${v}^{${Math.abs(sum)}}}.` : `Simplified power.`
    });
    commonMistake = 'Careful with signs when adding negative integers: adding a negative is subtracting its absolute value.';
  } else if (level === 3) {
    // Coefficients and multiple factors
    const c1 = randomInt(2, 4);
    const c2 = randomInt(2, 5);
    const m = randomInt(2, 5);
    const n = randomInt(2, 4);
    const p = -randomInt(1, 3);
    const netExp = m + n + p;
    const coeff = c1 * c2;
    expressionLatex = `(${c1}${v}^{${m}})(${c2}${v}^{${n}} \\cdot ${v}^{${p}})`;
    correctLatex = formatMonomial(Fraction.fromInt(coeff), { [v]: Fraction.fromInt(netExp) });
    distractors = [
      { latex: formatMonomial(Fraction.fromInt(c1 + c2), { [v]: Fraction.fromInt(netExp) }), errorType: 'Added coefficients instead of multiplying them' },
      { latex: formatMonomial(Fraction.fromInt(coeff), { [v]: Fraction.fromInt(m * n + p) }), errorType: 'Multiplied first two exponents' },
      { latex: formatMonomial(Fraction.fromInt(coeff), { [v]: Fraction.fromInt(netExp + 2) }), errorType: 'Incorrect sum of exponents' }
    ];
    steps.push({
      step: 1,
      title: 'Multiply numerical coefficients',
      latex: `${c1} \\cdot ${c2} = ${coeff}`,
      explanation: 'Numerical coefficients multiply normally.'
    });
    steps.push({
      step: 2,
      title: 'Combine exponents of the variable',
      latex: `${v}^{${m} + ${n} + (${p})} = ${v}^{${netExp}}`,
      explanation: `Add all exponents of base ${v}: ${m} + ${n} + (${p}) = ${netExp}.`
    });
    steps.push({
      step: 3,
      title: 'Combine into final simplified expression',
      latex: correctLatex,
      explanation: 'Write coefficients and variable terms in standard simplified form.'
    });
  } else if (level === 4) {
    // Multiple variables with fractional exponents
    const u = v === 'x' ? 'y' : 'x';
    const numF1 = new Fraction(randomChoice([1, 3]), 2);
    const numF2 = new Fraction(randomChoice([1, 5]), 2);
    const expU1 = randomInt(2, 4);
    const expU2 = -randomInt(1, 3);
    const sumF = numF1.add(numF2);
    const sumU = expU1 + expU2;
    expressionLatex = `(${v}^{${numF1.toExponentTeX()}} ${u}^{${expU1}})(${v}^{${numF2.toExponentTeX()}} ${u}^{${expU2}})`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: sumF, [u]: Fraction.fromInt(sumU) });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: numF1.mul(numF2), [u]: Fraction.fromInt(sumU) }), errorType: 'Multiplied the fractional exponents' },
      { latex: formatMonomial(Fraction.one(), { [v]: sumF, [u]: Fraction.fromInt(expU1 * expU2) }), errorType: 'Multiplied the integer exponents' },
      { latex: formatMonomial(Fraction.one(), { [v]: sumF.add(1), [u]: Fraction.fromInt(sumU) }), errorType: 'Arithmetic error when adding rational exponents' }
    ];
    steps.push({
      step: 1,
      title: `Group like bases (${v} and ${u})`,
      latex: `(${v}^{${numF1.toExponentTeX()}} \\cdot ${v}^{${numF2.toExponentTeX()}})(${u}^{${expU1}} \\cdot ${u}^{${expU2}})`,
      explanation: 'Rearrange using associative and commutative properties of multiplication.'
    });
    steps.push({
      step: 2,
      title: `Add fractional exponents for base ${v}`,
      latex: `${numF1.toTeX()} + ${numF2.toTeX()} = ${sumF.toTeX()}`,
      explanation: 'Add fractions with common denominator.'
    });
    steps.push({
      step: 3,
      title: `Add exponents for base ${u}`,
      latex: `${expU1} + (${expU2}) = ${sumU}`,
      explanation: 'Combine exponents for base ' + u + '.'
    });
  } else {
    // Level 5: Difficult multi-factor rational exponents with 3 factors
    const u = 'y';
    const f1 = new Fraction(randomChoice([-3, -1, 3]), 4);
    const f2 = new Fraction(randomChoice([1, 5]), 4);
    const f3 = new Fraction(randomChoice([1, 3]), 2); // 2/4 or 6/4
    const totalV = f1.add(f2).add(f3);
    const g1 = new Fraction(randomChoice([2, -2]), 3);
    const g2 = new Fraction(randomChoice([1, 4]), 3);
    const totalU = g1.add(g2);
    expressionLatex = `${v}^{${f1.toExponentTeX()}} ${u}^{${g1.toExponentTeX()}} \\cdot ${v}^{${f2.toExponentTeX()}} \\cdot (${v}^{${f3.toExponentTeX()}} ${u}^{${g2.toExponentTeX()}})`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: totalV, [u]: totalU });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: f1.add(f2), [u]: totalU }), errorType: 'Omitted the third factor of base ' + v },
      { latex: formatMonomial(Fraction.one(), { [v]: totalV, [u]: g1.mul(g2) }), errorType: 'Multiplied fractional exponents for ' + u },
      { latex: formatMonomial(Fraction.one(), { [v]: totalV.neg(), [u]: totalU }), errorType: 'Sign reversal on overall exponent' }
    ];
    steps.push({
      step: 1,
      title: 'Collect factors by base',
      latex: `(${v}^{${f1.toExponentTeX()}} \\cdot ${v}^{${f2.toExponentTeX()}} \\cdot ${v}^{${f3.toExponentTeX()}}) \\cdot (${u}^{${g1.toExponentTeX()}} \\cdot ${u}^{${g2.toExponentTeX()}})`,
      explanation: 'Group terms having identical bases.'
    });
    steps.push({
      step: 2,
      title: `Sum rational exponents for ${v}`,
      latex: `\\left(${f1.toTeX()}\\right) + \\left(${f2.toTeX()}\\right) + \\left(${f3.toTeX()}\\right) = ${totalV.toTeX()}`,
      explanation: 'Find LCD (4) and sum numerators.'
    });
    steps.push({
      step: 3,
      title: `Sum rational exponents for ${u}`,
      latex: `\\left(${g1.toTeX()}\\right) + \\left(${g2.toTeX()}\\right) = ${totalU.toTeX()}`,
      explanation: 'Combine thirds.'
    });
    steps.push({
      step: 4,
      title: 'Format with positive exponents',
      latex: correctLatex,
      explanation: 'Move any factors with negative exponents to denominator.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'product-powers',
    topicName: 'Product of Powers',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: 'Product of Powers: a^m \\cdot a^n = a^{m+n}',
    commonMistakeExplanation: commonMistake || undefined,
    domainRestrictions: `${v} \\neq 0`
  };
}

function generateQuotientOfPowers(level: DifficultyLevel): Question {
  const v = randomChoice(['x', 'y', 'a', 'b']);
  let promptText = 'Simplify the expression completely using the Quotient of Powers rule:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];

  if (level === 1) {
    const m = randomInt(5, 9);
    const n = randomInt(2, 4);
    const diff = m - n;
    expressionLatex = `\\frac{${v}^{${m}}}{${v}^{${n}}}`;
    correctLatex = diff === 1 ? v : `${v}^{${diff}}`;
    distractors = [
      { latex: `${v}^{${m + n}}`, errorType: 'Added exponents instead of subtracting them' },
      { latex: `${v}^{${Math.floor(m / n) || 1}}`, errorType: 'Divided the exponents' },
      { latex: `${v}^{${m * n}}`, errorType: 'Multiplied the exponents' }
    ];
    steps.push({
      step: 1,
      title: 'Apply Quotient of Powers rule',
      latex: `\\frac{a^m}{a^n} = a^{m-n} \\implies ${v}^{${m} - ${n}}`,
      explanation: `Subtract denominator exponent from numerator exponent: ${m} - ${n} = ${diff}.`
    });
    steps.push({
      step: 2,
      title: 'Final result',
      latex: correctLatex,
      explanation: `Result is ${v}^{${diff}}.`
    });
  } else if (level === 2) {
    // Smaller numerator exponent yielding negative exponent or fraction
    const m = randomInt(2, 4);
    const n = randomInt(5, 8);
    const diff = m - n; // negative
    expressionLatex = `\\frac{${v}^{${m}}}{${v}^{${n}}}`;
    correctLatex = `\\frac{1}{${v}^{${Math.abs(diff)}}}`;
    distractors = [
      { latex: `${v}^{${Math.abs(diff)}}`, errorType: 'Forgot that the exponent is negative (subtracted backwards)' },
      { latex: `-${v}^{${Math.abs(diff)}}`, errorType: 'Mistook negative exponent for negative sign on expression' },
      { latex: `\\frac{1}{${v}^{${m + n}}}`, errorType: 'Added exponents in denominator' }
    ];
    steps.push({
      step: 1,
      title: 'Subtract exponents',
      latex: `${v}^{${m} - ${n}} = ${v}^{${diff}}`,
      explanation: `${m} - ${n} = ${diff}.`
    });
    steps.push({
      step: 2,
      title: 'Apply negative exponent definition',
      latex: `${v}^{${diff}} = \\frac{1}{${v}^{${Math.abs(diff)}}}`,
      explanation: `a^{-n} = \\frac{1}{a^n}.`
    });
  } else if (level === 3) {
    // Multiple variables and coefficients
    const u = v === 'x' ? 'y' : 'x';
    const cNum = randomChoice([6, 12, 15, 18]);
    const cDen = randomChoice([2, 3]);
    const cReduced = cNum / cDen;
    const vm = randomInt(3, 6);
    const vn = randomInt(1, 3);
    const vDiff = vm - vn;
    const um = randomInt(1, 3);
    const un = randomInt(4, 6);
    const uDiff = um - un;
    expressionLatex = `\\frac{${cNum}${v}^{${vm}} ${u}^{${um}}}{${cDen}${v}^{${vn}} ${u}^{${un}}}`;
    correctLatex = `\\frac{${cReduced}${v}^{${vDiff}}}{${u}^{${Math.abs(uDiff)}}}`;
    distractors = [
      { latex: `\\frac{${cNum - cDen}${v}^{${vDiff}}}{${u}^{${Math.abs(uDiff)}}}`, errorType: 'Subtracted coefficients instead of dividing' },
      { latex: `${cReduced}${v}^{${vDiff}} ${u}^{${Math.abs(uDiff)}}`, errorType: 'Failed to place negative power in denominator' },
      { latex: `\\frac{${cReduced}${v}^{${vm + vn}}}{${u}^{${um + un}}}`, errorType: 'Added exponents instead of subtracting' }
    ];
    steps.push({
      step: 1,
      title: 'Divide coefficients',
      latex: `\\frac{${cNum}}{${cDen}} = ${cReduced}`,
      explanation: 'Numerical coefficients divide normally.'
    });
    steps.push({
      step: 2,
      title: `Apply quotient rule to each variable`,
      latex: `${v}^{${vm}-${vn}} = ${v}^{${vDiff}}, \\quad ${u}^{${um}-${un}} = ${u}^{${uDiff}} = \\frac{1}{${u}^{${Math.abs(uDiff)}}}`,
      explanation: 'Subtract exponents separately for each variable base.'
    });
    steps.push({
      step: 3,
      title: 'Combine into simplified fraction',
      latex: correctLatex,
      explanation: 'Write with positive exponents only.'
    });
  } else if (level === 4) {
    // Fractional exponents in quotient
    const fNum = new Fraction(randomChoice([5, 7]), 2);
    const fDen = new Fraction(randomChoice([1, 3]), 2);
    const diff = fNum.sub(fDen);
    expressionLatex = `\\frac{${v}^{${fNum.toExponentTeX()}}}{${v}^{${fDen.toExponentTeX()}}}`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: diff });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: fNum.add(fDen) }), errorType: 'Added rational exponents' },
      { latex: formatMonomial(Fraction.one(), { [v]: fNum.div(fDen) }), errorType: 'Divided rational exponents' },
      { latex: formatMonomial(Fraction.one(), { [v]: diff.sub(1) }), errorType: 'Arithmetic mistake during subtraction' }
    ];
    steps.push({
      step: 1,
      title: 'Apply Quotient Rule to rational exponents',
      latex: `${v}^{${fNum.toTeX()} - ${fDen.toTeX()}}`,
      explanation: 'Subtract the denominator exponent from the numerator exponent.'
    });
    steps.push({
      step: 2,
      title: 'Compute difference of fractions',
      latex: `${fNum.toTeX()} - ${fDen.toTeX()} = ${diff.toTeX()}`,
      explanation: `Subtract numerators: \\frac{${fNum.num} - ${fDen.num}}{2} = ${diff.toTeX()}.`
    });
  } else {
    // Level 5: Nested negative and fractional powers in multi-variable quotient
    const u = 'y';
    const fVnum = new Fraction(randomChoice([-3, -1]), 2);
    const fVden = new Fraction(randomChoice([1, 3]), 4);
    const diffV = fVnum.sub(fVden); // negative fraction
    const fUnum = new Fraction(randomChoice([2, 5]), 3);
    const fUden = new Fraction(randomChoice([-1, -2]), 3);
    const diffU = fUnum.sub(fUden); // positive fraction
    expressionLatex = `\\frac{${v}^{${fVnum.toExponentTeX()}} ${u}^{${fUnum.toExponentTeX()}}}{${v}^{${fVden.toExponentTeX()}} ${u}^{${fUden.toExponentTeX()}}}`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: diffV, [u]: diffU });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: fVnum.add(fVden), [u]: diffU }), errorType: 'Added exponents of ' + v },
      { latex: formatMonomial(Fraction.one(), { [v]: diffV, [u]: fUnum.sub(fUden.abs()) }), errorType: 'Mishandled double negative in exponent of ' + u },
      { latex: formatMonomial(Fraction.one(), { [v]: diffV.abs(), [u]: diffU }), errorType: 'Ignored negative sign on ' + v }
    ];
    steps.push({
      step: 1,
      title: `Compute exponent difference for ${v}`,
      latex: `\\left(${fVnum.toTeX()}\\right) - \\left(${fVden.toTeX()}\\right) = ${diffV.toTeX()}`,
      explanation: 'Convert to common denominator 4 and subtract.'
    });
    steps.push({
      step: 2,
      title: `Compute exponent difference for ${u}`,
      latex: `\\left(${fUnum.toTeX()}\\right) - \\left(${fUden.toTeX()}\\right) = \\left(${fUnum.toTeX()}\\right) + \\left(${fUden.abs().toTeX()}\\right) = ${diffU.toTeX()}`,
      explanation: 'Subtracting a negative exponent yields addition.'
    });
    steps.push({
      step: 3,
      title: 'Express with positive exponents',
      latex: correctLatex,
      explanation: 'Place factor with negative power in the denominator.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `quot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'quotient-powers',
    topicName: 'Quotient of Powers',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Quotient of Powers: } \\frac{a^m}{a^n} = a^{m-n}',
    domainRestrictions: `${v} \\neq 0`
  };
}

function generatePowerOfPower(level: DifficultyLevel): Question {
  const v = randomChoice(['x', 'y', 'a', 'p']);
  let promptText = 'Simplify the expression completely using the Power of a Power rule:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];

  if (level === 1) {
    const m = randomInt(2, 5);
    const n = randomInt(2, 4);
    const prod = m * n;
    expressionLatex = `(${v}^{${m}})^{${n}}`;
    correctLatex = `${v}^{${prod}}`;
    distractors = [
      { latex: `${v}^{${m + n}}`, errorType: 'Added exponents instead of multiplying them' },
      { latex: `${v}^{${Math.pow(m, n)}}`, errorType: 'Raised inner exponent to power of outer exponent' },
      { latex: `${v}^{${prod + 2}}`, errorType: 'Multiplication error' }
    ];
    steps.push({
      step: 1,
      title: 'Apply Power of a Power rule',
      latex: `(a^m)^n = a^{m \\cdot n} \\implies ${v}^{${m} \\cdot ${n}}`,
      explanation: 'Multiply the inner exponent by the outer exponent.'
    });
    steps.push({
      step: 2,
      title: 'Compute product',
      latex: `${v}^{${prod}}`,
      explanation: `${m} \\times ${n} = ${prod}.`
    });
  } else if (level === 2) {
    const m = -randomInt(2, 4);
    const n = randomInt(2, 4);
    const prod = m * n;
    expressionLatex = `(${v}^{${m}})^{${n}}`;
    correctLatex = `\\frac{1}{${v}^{${Math.abs(prod)}}}`;
    distractors = [
      { latex: `${v}^{${Math.abs(prod)}}`, errorType: 'Forgot negative sign in product of exponents' },
      { latex: `${v}^{${m + n}}`, errorType: 'Added exponents instead of multiplying' },
      { latex: `-${v}^{${Math.abs(prod)}}`, errorType: 'Moved negative exponent to front of expression' }
    ];
    steps.push({
      step: 1,
      title: 'Multiply exponents',
      latex: `(${m}) \\cdot (${n}) = ${prod}`,
      explanation: 'A negative times a positive is negative.'
    });
    steps.push({
      step: 2,
      title: 'Express with positive exponent',
      latex: `${v}^{${prod}} = \\frac{1}{${v}^{${Math.abs(prod)}}}`,
      explanation: 'Use rule a^{-n} = 1 / a^n.'
    });
  } else if (level === 3) {
    // Nested powers with negative outer and inner exponents: ((x^m)^n)^p
    const m = randomInt(2, 3);
    const n = -randomInt(2, 3);
    const p = -1;
    const prod = m * n * p;
    expressionLatex = `\\left[(${v}^{${m}})^{${n}}\\right]^{${p}}`;
    correctLatex = `${v}^{${prod}}`;
    distractors = [
      { latex: `\\frac{1}{${v}^{${prod}}}`, errorType: 'Sign error multiplying (-n) * (-1)' },
      { latex: `${v}^{${m + n + p}}`, errorType: 'Added exponents instead of multiplying' },
      { latex: `${v}^{${m * n}}`, errorType: 'Forgot outer exponent' }
    ];
    steps.push({
      step: 1,
      title: 'Multiply all exponents in sequence',
      latex: `${v}^{(${m}) \\cdot (${n}) \\cdot (${p})}`,
      explanation: 'When powers are nested repeatedly, all exponents are multiplied together.'
    });
    steps.push({
      step: 2,
      title: 'Calculate product',
      latex: `(${m}) \\cdot (${n}) \\cdot (${p}) = ${prod}`,
      explanation: `Negative times negative is positive: ${n} \\cdot ${p} = ${n * p}, then multiplied by ${m} gives ${prod}.`
    });
  } else if (level === 4) {
    // Fractional exponent raised to integer power
    const num = randomInt(2, 4);
    const den = randomChoice([3, 5]);
    const outer = randomChoice([den, den * 2]);
    const f = new Fraction(num, den);
    const resultF = f.mul(outer);
    expressionLatex = `\\left(${v}^{${f.toExponentTeX()}}\\right)^{${outer}}`;
    correctLatex = `${v}^{${resultF.num}}`;
    distractors = [
      { latex: `${v}^{${f.toExponentTeX()}}`, errorType: 'Did not apply outer exponent' },
      { latex: `${v}^{${f.add(outer).toExponentTeX()}}`, errorType: 'Added fraction and integer instead of multiplying' },
      { latex: `${v}^{${num * outer}}`, errorType: 'Forgot to divide by denominator of fraction' }
    ];
    steps.push({
      step: 1,
      title: 'Multiply fraction by outer power',
      latex: `${f.toTeX()} \\cdot ${outer} = \\frac{${num} \\cdot ${outer}}{${den}}`,
      explanation: 'Multiply the fractional exponent by the integer exponent.'
    });
    steps.push({
      step: 2,
      title: 'Simplify fraction',
      latex: `${v}^{${resultF.num}}`,
      explanation: `${den} cancels out, leaving integer exponent ${resultF.num}.`
    });
  } else {
    // Level 5: Nested powers with negative fractional exponents: [(x^{a/b})^c]^{d/e}
    const f1 = new Fraction(randomChoice([2, 3]), randomChoice([3, 4]));
    const c = -randomInt(2, 4);
    const f3 = new Fraction(randomChoice([-1, -3]), randomChoice([2, 5]));
    const totalExp = f1.mul(c).mul(f3);
    expressionLatex = `\\left[ \\left(${v}^{${f1.toExponentTeX()}}\\right)^{${c}} \\right]^{${f3.toExponentTeX()}}`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: totalExp });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: totalExp.neg() }), errorType: 'Sign mistake with three negative factors' },
      { latex: formatMonomial(Fraction.one(), { [v]: f1.mul(c) }), errorType: 'Forgot outermost rational exponent' },
      { latex: formatMonomial(Fraction.one(), { [v]: totalExp.reciprocal() }), errorType: 'Inverted the resulting exponent' }
    ];
    steps.push({
      step: 1,
      title: 'Combine nested exponents into a single product',
      latex: `\\text{Exponent} = \\left(${f1.toTeX()}\\right) \\cdot (${c}) \\cdot \\left(${f3.toTeX()}\\right)`,
      explanation: 'By the generalized power of a power property, multiply all nested exponents.'
    });
    steps.push({
      step: 2,
      title: 'Multiply signs and fractions',
      latex: `(${c} \\times ${f3.toTeX()}) = ${new Fraction(c).mul(f3).toTeX()}, \\quad \\text{then} \\times ${f1.toTeX()} = ${totalExp.toTeX()}`,
      explanation: 'Reduce by greatest common factor.'
    });
    steps.push({
      step: 3,
      title: 'Write final simplified power',
      latex: correctLatex,
      explanation: 'Express in standard positive exponent notation.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `powpow-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'power-power',
    topicName: 'Power of a Power',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Power of a Power: } (a^m)^n = a^{mn}',
    domainRestrictions: `${v} \\neq 0`
  };
}

function generatePowerOfProduct(level: DifficultyLevel): Question {
  const v = 'x';
  const u = 'y';
  let promptText = 'Simplify the expression completely using the Power of a Product rule:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];

  if (level === 1) {
    const c = randomInt(2, 5);
    const p = randomChoice([2, 3]);
    const cPow = Math.pow(c, p);
    expressionLatex = `(${c}${v})^{${p}}`;
    correctLatex = `${cPow}${v}^{${p}}`;
    distractors = [
      { latex: `${c}${v}^{${p}}`, errorType: 'Did not raise the coefficient to the power' },
      { latex: `${c * p}${v}^{${p}}`, errorType: 'Multiplied coefficient by power instead of raising it' },
      { latex: `${cPow}${v}`, errorType: 'Did not raise the variable to the power' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute exponent to every factor inside parentheses',
      latex: `(${c})^{${p}} \\cdot (${v})^{${p}}`,
      explanation: 'The power applies to both the coefficient and the variable.'
    });
    steps.push({
      step: 2,
      title: 'Compute numerical power',
      latex: `${c}^{${p}} = ${cPow}`,
      explanation: `${c} raised to the power ${p} equals ${cPow}.`
    });
    steps.push({
      step: 3,
      title: 'Combine factors',
      latex: correctLatex,
      explanation: 'Final simplified expression.'
    });
  } else if (level === 2) {
    const c = randomChoice([2, 3]);
    const expV = randomInt(2, 3);
    const expU = randomInt(2, 4);
    const p = 2;
    const cPow = Math.pow(c, p);
    expressionLatex = `(${c}${v}^{${expV}} ${u}^{${expU}})^{${p}}`;
    correctLatex = `${cPow}${v}^{${expV * p}} ${u}^{${expU * p}}`;
    distractors = [
      { latex: `${c}${v}^{${expV * p}} ${u}^{${expU * p}}`, errorType: 'Failed to square coefficient' },
      { latex: `${cPow}${v}^{${expV + p}} ${u}^{${expU + p}}`, errorType: 'Added outer power instead of multiplying' },
      { latex: `${c * p}${v}^{${expV * p}} ${u}^{${expU * p}}`, errorType: 'Multiplied coefficient by 2 instead of squaring' }
    ];
    steps.push({
      step: 1,
      title: 'Apply power to all three factors',
      latex: `${c}^{${p}} \\cdot (${v}^{${expV}})^{${p}} \\cdot (${u}^{${expU}})^{${p}}`,
      explanation: 'Distribute outer power 2.'
    });
    steps.push({
      step: 2,
      title: 'Evaluate each factor',
      latex: `${c}^{2} = ${cPow}, \\quad ${v}^{${expV} \\cdot 2} = ${v}^{${expV * 2}}, \\quad ${u}^{${expU} \\cdot 2} = ${u}^{${expU * 2}}`,
      explanation: 'Multiply variable exponents and evaluate constant power.'
    });
  } else if (level === 3) {
    // Negative exponents inside product raised to power
    const c = randomChoice([2, 3]);
    const expV = -randomInt(1, 3);
    const expU = randomInt(2, 3);
    const p = randomChoice([2, 3]);
    const cPow = Math.pow(c, p);
    expressionLatex = `(${c}${v}^{${expV}} ${u}^{${expU}})^{${p}}`;
    correctLatex = `\\frac{${cPow}${u}^{${expU * p}}}{${v}^{${Math.abs(expV * p)}}}`;
    distractors = [
      { latex: `${cPow}${v}^{${expV * p}} ${u}^{${expU * p}}`, errorType: 'Left negative exponent in numerator' },
      { latex: `\\frac{${c}${u}^{${expU * p}}}{${v}^{${Math.abs(expV * p)}}}`, errorType: 'Forgot to raise coefficient' },
      { latex: `\\frac{${cPow}}{${v}^{${Math.abs(expV * p)}} ${u}^{${expU * p}}}`, errorType: 'Moved positive power to denominator' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute exponent',
      latex: `${c}^{${p}} \\cdot ${v}^{(${expV}) \\cdot ${p}} \\cdot ${u}^{${expU} \\cdot ${p}} = ${cPow} ${v}^{${expV * p}} ${u}^{${expU * p}}`,
      explanation: 'Multiply each inner exponent by outer exponent.'
    });
    steps.push({
      step: 2,
      title: 'Rewrite with positive exponents',
      latex: correctLatex,
      explanation: `Since ${v}^{${expV * p}} has a negative power, move it to the denominator as ${v}^{${Math.abs(expV * p)}}.`
    });
  } else if (level === 4) {
    // Negative outer exponent on product
    const c = randomChoice([2, 4]);
    const expV = randomInt(2, 4);
    const expU = -randomInt(1, 3);
    const p = -2;
    // (c * x^expV * y^expU)^(-2) = c^(-2) * x^(-2*expV) * y^(-2*expU)
    // = y^(2*|expU|) / (c^2 * x^(2*expV))
    const cSq = c * c;
    expressionLatex = `(${c}${v}^{${expV}} ${u}^{${expU}})^{${p}}`;
    correctLatex = `\\frac{${u}^{${Math.abs(expU * p)}}}{${cSq} ${v}^{${Math.abs(expV * p)}}}`;
    distractors = [
      { latex: `-\\frac{${u}^{${Math.abs(expU * p)}}}{${cSq} ${v}^{${Math.abs(expV * p)}}}`, errorType: 'Made the entire fraction negative' },
      { latex: `\\frac{${cSq} ${u}^{${Math.abs(expU * p)}}}{${v}^{${Math.abs(expV * p)}}}`, errorType: 'Kept coefficient in numerator' },
      { latex: `\\frac{1}{${c * 2} ${v}^{${Math.abs(expV * p)}} ${u}^{${Math.abs(expU * p)}}}`, errorType: 'Multiplied c by 2 and misassigned y position' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute outer negative exponent',
      latex: `${c}^{${p}} \\cdot ${v}^{${expV} \\cdot (${p})} \\cdot ${u}^{${expU} \\cdot (${p})} = ${c}^{-2} ${v}^{${expV * p}} ${u}^{${expU * p}}`,
      explanation: 'Every factor gets multiplied by -2.'
    });
    steps.push({
      step: 2,
      title: 'Evaluate coefficient power',
      latex: `${c}^{-2} = \\frac{1}{${c}^2} = \\frac{1}{${cSq}}`,
      explanation: 'Negative power moves constant to denominator.'
    });
    steps.push({
      step: 3,
      title: 'Assemble final fraction',
      latex: correctLatex,
      explanation: 'Factors with positive exponents stay in numerator; negative exponents go to denominator.'
    });
  } else {
    // Level 5: Fractional powers and 3 variables
    const w = 'z';
    const fV = new Fraction(randomChoice([2, 4]), 3);
    const fU = new Fraction(-randomChoice([1, 2]), 3);
    const fW = new Fraction(randomChoice([1, 3]), 2);
    const outer = -3;
    const resV = fV.mul(outer);
    const resU = fU.mul(outer);
    const resW = fW.mul(outer);
    expressionLatex = `(${v}^{${fV.toExponentTeX()}} ${u}^{${fU.toExponentTeX()}} ${w}^{${fW.toExponentTeX()}})^{${outer}}`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: resV, [u]: resU, [w]: resW });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: resV.neg(), [u]: resU.neg(), [w]: resW.neg() }), errorType: 'Inverted all exponent signs' },
      { latex: formatMonomial(Fraction.one(), { [v]: fV.mul(3), [u]: fU.mul(3), [w]: fW.mul(3) }), errorType: 'Ignored negative on outer exponent' },
      { latex: formatMonomial(Fraction.one(), { [v]: resV, [u]: resU }), errorType: 'Omitted third variable ' + w }
    ];
    steps.push({
      step: 1,
      title: 'Distribute exponent to all three variables',
      latex: `${v}^{${fV.toTeX()} \\cdot (${outer})} \\cdot ${u}^{${fU.toTeX()} \\cdot (${outer})} \\cdot ${w}^{${fW.toTeX()} \\cdot (${outer})}`,
      explanation: 'Multiply each rational exponent by outer integer -3.'
    });
    steps.push({
      step: 2,
      title: 'Simplify each exponent',
      latex: `${v}^{${resV.toTeX()}} \\cdot ${u}^{${resU.toTeX()}} \\cdot ${w}^{${resW.toTeX()}}`,
      explanation: 'Reduce fraction products.'
    });
    steps.push({
      step: 3,
      title: 'Rewrite with positive exponents',
      latex: correctLatex,
      explanation: 'Move negative exponents into denominator.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `powprod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'power-product',
    topicName: 'Power of a Product',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Power of a Product: } (ab)^n = a^n b^n',
    domainRestrictions: `${v} \\neq 0, \\; ${u} \\neq 0`
  };
}

function generatePowerOfQuotient(level: DifficultyLevel): Question {
  const v = 'x';
  const u = 'y';
  let promptText = 'Simplify the expression completely using the Power of a Quotient rule:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];

  if (level === 1) {
    const p = randomInt(2, 4);
    expressionLatex = `\\left(\\frac{${v}}{${u}}\\right)^{${p}}`;
    correctLatex = `\\frac{${v}^{${p}}}{${u}^{${p}}}`;
    distractors = [
      { latex: `\\frac{${v}^{${p}}}{${u}}`, errorType: 'Applied power to numerator only' },
      { latex: `\\frac{${v}}{${u}^{${p}}}`, errorType: 'Applied power to denominator only' },
      { latex: `${v}^{${p}} ${u}^{${p}}`, errorType: 'Multiplied instead of dividing' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute exponent to both numerator and denominator',
      latex: `\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n} \\implies \\frac{${v}^{${p}}}{${u}^{${p}}}`,
      explanation: 'Every factor in the quotient receives the exponent.'
    });
  } else if (level === 2) {
    const c = randomChoice([2, 3]);
    const expV = randomInt(2, 3);
    const expU = randomInt(2, 3);
    const p = 2;
    const cSq = c * c;
    expressionLatex = `\\left(\\frac{${c}${v}^{${expV}}}{${u}^{${expU}}}\\right)^{${p}}`;
    correctLatex = `\\frac{${cSq}${v}^{${expV * p}}}{${u}^{${expU * p}}}`;
    distractors = [
      { latex: `\\frac{${c}${v}^{${expV * p}}}{${u}^{${expU * p}}}`, errorType: 'Forgot to square the coefficient' },
      { latex: `\\frac{${cSq}${v}^{${expV + p}}}{${u}^{${expU + p}}}`, errorType: 'Added outer power to variable exponents' },
      { latex: `\\frac{${c * p}${v}^{${expV * p}}}{${u}^{${expU * p}}}`, errorType: 'Multiplied coefficient instead of squaring' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute power 2 to all terms',
      latex: `\\frac{(${c})^2 (${v}^{${expV}})^2}{(${u}^{${expU}})^2}`,
      explanation: 'Square numerator coefficient and both variable terms.'
    });
    steps.push({
      step: 2,
      title: 'Simplify powers',
      latex: correctLatex,
      explanation: `${c}^2 = ${cSq}, (${v}^{${expV}})^2 = ${v}^{${expV * 2}}, (${u}^{${expU}})^2 = ${u}^{${expU * 2}}.`
    });
  } else if (level === 3) {
    // Negative outer exponent inverting the fraction
    const expV = randomInt(2, 3);
    const expU = randomInt(2, 4);
    const p = -2;
    expressionLatex = `\\left(\\frac{${v}^{${expV}}}{${u}^{${expU}}}\\right)^{${p}}`;
    correctLatex = `\\frac{${u}^{${expU * 2}}}{${v}^{${expV * 2}}}`;
    distractors = [
      { latex: `\\frac{${v}^{${expV * 2}}}{${u}^{${expU * 2}}}`, errorType: 'Did not invert fraction for negative exponent' },
      { latex: `-\\frac{${u}^{${expU * 2}}}{${v}^{${expV * 2}}}`, errorType: 'Made entire fraction negative' },
      { latex: `\\frac{${u}^{${expU}}}{${v}^{${expV}}}`, errorType: 'Inverted fraction but forgot to apply power 2' }
    ];
    steps.push({
      step: 1,
      title: 'Use negative exponent to invert the fraction',
      latex: `\\left(\\frac{a}{b}\\right)^{-n} = \\left(\\frac{b}{a}\\right)^n \\implies \\left(\\frac{${u}^{${expU}}}{${v}^{${expV}}}\\right)^2`,
      explanation: 'A negative outer exponent flips numerator and denominator and becomes positive.'
    });
    steps.push({
      step: 2,
      title: 'Square numerator and denominator',
      latex: `\\frac{(${u}^{${expU}})^2}{(${v}^{${expV}})^2} = ${correctLatex}`,
      explanation: 'Multiply inner exponents by 2.'
    });
  } else if (level === 4) {
    // Coefficients in both top and bottom with negative outer power
    const cNum = 2;
    const cDen = 3;
    const expV = -randomInt(1, 3);
    const expU = randomInt(2, 3);
    const p = -2;
    // ((2 x^expV) / (3 y^expU))^(-2) = (3 y^expU / (2 x^expV))^2 = 9 y^(2 expU) / (4 x^(2 expV))
    // since expV is negative, x^(2 expV) in denominator moves to numerator as x^(2 |expV|)
    const vPosExp = Math.abs(expV * 2);
    const uPosExp = expU * 2;
    expressionLatex = `\\left(\\frac{${cNum}${v}^{${expV}}}{${cDen}${u}^{${expU}}}\\right)^{${p}}`;
    correctLatex = `\\frac{9 ${v}^{${vPosExp}} ${u}^{${uPosExp}}}{4}`;
    distractors = [
      { latex: `\\frac{9 ${u}^{${uPosExp}}}{4 ${v}^{${vPosExp}}}`, errorType: 'Failed to relocate negative variable exponent to numerator' },
      { latex: `\\frac{4 ${v}^{${vPosExp}}}{9 ${u}^{${uPosExp}}}`, errorType: 'Did not invert numerical coefficients' },
      { latex: `-\\frac{9 ${v}^{${vPosExp}} ${u}^{${uPosExp}}}{4}`, errorType: 'Added unwanted negative sign' }
    ];
    steps.push({
      step: 1,
      title: 'Invert fraction to make outer exponent positive',
      latex: `\\left(\\frac{${cDen}${u}^{${expU}}}{${cNum}${v}^{${expV}}}\\right)^2`,
      explanation: 'Taking the reciprocal flips the sign of the outer exponent from -2 to 2.'
    });
    steps.push({
      step: 2,
      title: 'Square all factors inside',
      latex: `\\frac{${cDen}^2 (${u}^{${expU}})^2}{${cNum}^2 (${v}^{${expV}})^2} = \\frac{9 ${u}^{${uPosExp}}}{4 ${v}^{${expV * 2}}}`,
      explanation: 'Square constants and multiply exponents.'
    });
    steps.push({
      step: 3,
      title: 'Eliminate negative exponent in denominator',
      latex: correctLatex,
      explanation: `${v}^{${expV * 2}} in the denominator has a negative exponent, so it moves to the numerator with a positive exponent.`
    });
  } else {
    // Level 5: Fractional exponents in numerator and denominator raised to fractional power
    const fV = new Fraction(randomChoice([3, 5]), 2);
    const fU = new Fraction(-randomChoice([1, 2]), 3);
    const outerF = new Fraction(2, 3);
    const resV = fV.mul(outerF);
    const resU = fU.mul(outerF); // negative
    expressionLatex = `\\left(\\frac{${v}^{${fV.toExponentTeX()}}}{${u}^{${fU.toExponentTeX()}}}\\right)^{${outerF.toExponentTeX()}}`;
    correctLatex = formatMonomial(Fraction.one(), { [v]: resV, [u]: resU.neg() });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: resV, [u]: resU }), errorType: 'Mishandled sign when denominator variable moved' },
      { latex: formatMonomial(Fraction.one(), { [v]: fV.add(outerF), [u]: fU.add(outerF) }), errorType: 'Added fractional exponents' },
      { latex: formatMonomial(Fraction.one(), { [v]: resV.reciprocal(), [u]: resU.neg() }), errorType: 'Inverted the exponent of ' + v }
    ];
    steps.push({
      step: 1,
      title: 'Multiply outer fractional power to numerator and denominator',
      latex: `\\frac{${v}^{${fV.toTeX()} \\cdot ${outerF.toTeX()}}}{${u}^{${fU.toTeX()} \\cdot ${outerF.toTeX()}}}`,
      explanation: 'Distribute rational power 2/3.'
    });
    steps.push({
      step: 2,
      title: 'Evaluate exponent products',
      latex: `\\text{Numerator: } ${fV.toTeX()} \\cdot ${outerF.toTeX()} = ${resV.toTeX()}, \\quad \\text{Denominator: } ${fU.toTeX()} \\cdot ${outerF.toTeX()} = ${resU.toTeX()}`,
      explanation: 'Cancel common factors.'
    });
    steps.push({
      step: 3,
      title: 'Express with positive exponents',
      latex: correctLatex,
      explanation: 'Since the denominator has a negative exponent, moving it to the numerator changes its sign to positive.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `powquot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'power-quotient',
    topicName: 'Power of a Quotient',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Power of a Quotient: } \\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}',
    domainRestrictions: `${u} \\neq 0`
  };
}

function generateZeroExponent(level: DifficultyLevel): Question {
  const v = randomChoice(['x', 'y', 'a', 'm']);
  let promptText = 'Evaluate or simplify the expression using the Zero Exponent rule:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];
  let commonMistake = '';

  if (level === 1) {
    const num = randomChoice([4, 7, 12, 25, 99]);
    expressionLatex = `${num}^0`;
    correctLatex = '1';
    distractors = [
      { latex: '0', errorType: 'Confused zero exponent with zero value' },
      { latex: `${num}`, errorType: 'Treated zero exponent as power of 1' },
      { latex: `${num * 0}`, errorType: 'Multiplied base by 0' }
    ];
    steps.push({
      step: 1,
      title: 'Apply Zero Exponent Rule',
      latex: `a^0 = 1 \\quad (a \\neq 0)`,
      explanation: `Any nonzero number raised to the power of 0 equals 1.`
    });
    steps.push({
      step: 2,
      title: 'Evaluate',
      latex: `${num}^0 = 1`,
      explanation: `Since ${num} \\neq 0, the result is exactly 1.`
    });
    commonMistake = 'Common misconception: Thinking a^0 = 0. Exponents count factors multiplied; zero factors in multiplication leave the multiplicative identity, which is 1.';
  } else if (level === 2) {
    const c = randomInt(3, 9);
    expressionLatex = `${c}${v}^0`;
    correctLatex = `${c}`;
    distractors = [
      { latex: '1', errorType: 'Assumed the entire expression was raised to 0' },
      { latex: '0', errorType: 'Assumed variable evaluated to 0 multiplying coefficient to 0' },
      { latex: `${c}${v}`, errorType: 'Ignored zero exponent' }
    ];
    steps.push({
      step: 1,
      title: 'Identify what is raised to the power 0',
      latex: `${c} \\cdot (${v}^0)`,
      explanation: `Only ${v} has the exponent 0, NOT the coefficient ${c}, because there are no parentheses.`
    });
    steps.push({
      step: 2,
      title: 'Substitute zero power value',
      latex: `${c} \\cdot (1) = ${c}`,
      explanation: `${v}^0 = 1, so ${c} \\times 1 = ${c}.`
    });
    commonMistake = `Contrast ${c}${v}^0 = ${c} with (${c}${v})^0 = 1. Without parentheses, exponents bind only to the immediate base!`;
  } else if (level === 3) {
    // Expression inside parentheses raised to 0 minus or plus term
    const c = randomInt(2, 6);
    expressionLatex = `(${c}${v}^2 - 7)^{0} + ${c}${v}^0`;
    const ansNum = 1 + c;
    correctLatex = `${ansNum}`;
    distractors = [
      { latex: `${c}`, errorType: 'Treated first term as 0' },
      { latex: '1', errorType: 'Treated second term as 0' },
      { latex: '2', errorType: 'Evaluated second term as 1 instead of c(1)' }
    ];
    steps.push({
      step: 1,
      title: 'Evaluate first term',
      latex: `(${c}${v}^2 - 7)^0 = 1`,
      explanation: 'The entire parenthesized nonzero expression is raised to 0, which equals 1.'
    });
    steps.push({
      step: 2,
      title: 'Evaluate second term',
      latex: `${c}${v}^0 = ${c}(1) = ${c}`,
      explanation: 'Only the variable is raised to 0.'
    });
    steps.push({
      step: 3,
      title: 'Add results',
      latex: `1 + ${c} = ${ansNum}`,
      explanation: 'Sum the evaluated terms.'
    });
  } else if (level === 4) {
    // Quotient that simplifies to exponent 0
    const m = randomInt(3, 6);
    const u = 'y';
    const n = randomInt(2, 4);
    expressionLatex = `\\frac{${v}^{${m}} ${u}^{${n}}}{${v}^{${m}} ${u}^{${n}}}`;
    correctLatex = '1';
    distractors = [
      { latex: '0', errorType: 'Subtracted to 0 and thought result was 0' },
      { latex: `${v}${u}`, errorType: 'Treated zero exponents as 1st powers' },
      { latex: `${v}^0 ${u}^0`, errorType: 'Left expression unsimplified' }
    ];
    steps.push({
      step: 1,
      title: 'Apply quotient rule to each variable',
      latex: `${v}^{${m}-${m}} ${u}^{${n}-${n}} = ${v}^0 ${u}^0`,
      explanation: 'Subtract identical exponents.'
    });
    steps.push({
      step: 2,
      title: 'Apply zero exponent rule',
      latex: `(1) \\cdot (1) = 1`,
      explanation: 'Both bases raised to 0 equal 1, yielding product 1.'
    });
  } else {
    // Level 5: Conceptual question distinguishing 0^0 from a^0 with variables
    promptText = 'Which statement regarding zero exponents and base conditions is mathematically TRUE?';
    expressionLatex = '\\text{Given: } f(x) = (x - 3)^0';
    correctLatex = 'f(x) = 1 \\text{ for all real } x \\neq 3, \\text{ and is undefined at } x = 3';
    distractors = [
      { latex: 'f(x) = 1 \\text{ for all real numbers including } x = 3', errorType: 'Incorrectly claimed 0^0 = 1 without restriction' },
      { latex: 'f(x) = 0 \\text{ whenever } x = 3, \\text{ and } 1 \\text{ elsewhere}', errorType: 'Claimed 0^0 = 0' },
      { latex: 'f(x) = x - 3 \\text{ for all real numbers}', errorType: 'Treated zero exponent as transparent identity' }
    ];
    steps.push({
      step: 1,
      title: 'State the formal domain condition for zero exponent',
      latex: `a^0 = 1 \\iff a \\neq 0`,
      explanation: 'The law of exponents a^m / a^n = a^{m-n} relies on division by a^n. If a = 0, division by 0 is undefined.'
    });
    steps.push({
      step: 2,
      title: 'Examine base at x = 3',
      latex: `x - 3 = 0 \\implies 0^0`,
      explanation: 'At x = 3, the base becomes 0, producing 0^0 which is indeterminate/undefined in elementary algebra.'
    });
    steps.push({
      step: 3,
      title: 'Conclusion',
      latex: '\\text{Valid for } x \\neq 3 \\text{ only.}',
      explanation: 'Thus f(x) = 1 only when x differs from 3.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `zero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'zero-exponent',
    topicName: 'Zero Exponent',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Zero Exponent: } a^0 = 1 \\; (a \\neq 0)',
    commonMistakeExplanation: commonMistake || undefined,
    domainRestrictions: 'Base must be nonzero.'
  };
}

function generateNegativeExponents(level: DifficultyLevel): Question {
  const v = randomChoice(['x', 'y', 'w', 'b']);
  let promptText = 'Rewrite and simplify the expression using only positive exponents:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];

  if (level === 1) {
    const n = randomInt(2, 6);
    expressionLatex = `${v}^{-${n}}`;
    correctLatex = `\\frac{1}{${v}^{${n}}}`;
    distractors = [
      { latex: `-${v}^{${n}}`, errorType: 'Treated negative exponent as a negative coefficient' },
      { latex: `${v}^{${n}}`, errorType: 'Simply dropped the negative sign' },
      { latex: `-\\frac{1}{${v}^{${n}}}`, errorType: 'Made both base and fraction negative' }
    ];
    steps.push({
      step: 1,
      title: 'Apply Negative Exponent Rule',
      latex: `a^{-n} = \\frac{1}{a^n} \\quad (a \\neq 0)`,
      explanation: 'A negative exponent represents the reciprocal of the base raised to the positive power.'
    });
    steps.push({
      step: 2,
      title: 'Substitute',
      latex: `${v}^{-${n}} = \\frac{1}{${v}^{${n}}}`,
      explanation: 'Move to denominator with positive exponent.'
    });
  } else if (level === 2) {
    const n = randomInt(2, 5);
    expressionLatex = `\\frac{1}{${v}^{-${n}}}`;
    correctLatex = `${v}^{${n}}`;
    distractors = [
      { latex: `\\frac{1}{${v}^{${n}}}`, errorType: 'Kept variable in denominator' },
      { latex: `-${v}^{${n}}`, errorType: 'Moved negative sign outside' },
      { latex: `${v}^{-${n}}`, errorType: 'Left expression unsimplified' }
    ];
    steps.push({
      step: 1,
      title: 'Reciprocal of a negative exponent in denominator',
      latex: `\\frac{1}{a^{-n}} = a^n`,
      explanation: 'A negative exponent in the denominator moves to the numerator as a positive exponent.'
    });
    steps.push({
      step: 2,
      title: 'Result',
      latex: `${v}^{${n}}`,
      explanation: 'Final simplified form.'
    });
  } else if (level === 3) {
    // Coefficients with mixed signs: (3x^-2) / (5 y^-3)
    const c1 = randomInt(2, 5);
    const c2 = randomChoice([3, 7]);
    const expV = -randomInt(2, 4);
    const u = v === 'x' ? 'y' : 'x';
    const expU = -randomInt(2, 4);
    expressionLatex = `\\frac{${c1} ${v}^{${expV}}}{${c2} ${u}^{${expU}}}`;
    correctLatex = `\\frac{${c1} ${u}^{${Math.abs(expU)}}}{${c2} ${v}^{${Math.abs(expV)}}}`;
    distractors = [
      { latex: `\\frac{${c2} ${u}^{${Math.abs(expU)}}}{${c1} ${v}^{${Math.abs(expV)}}}`, errorType: 'Inverted the coefficients as well' },
      { latex: `\\frac{${c1} ${v}^{${Math.abs(expV)}}}{${c2} ${u}^{${Math.abs(expU)}}}`, errorType: 'Simply changed signs without swapping numerator/denominator' },
      { latex: `-\\frac{${c1} ${u}^{${Math.abs(expU)}}}{${c2} ${v}^{${Math.abs(expV)}}}`, errorType: 'Made the entire fraction negative' }
    ];
    steps.push({
      step: 1,
      title: 'Notice coefficients do NOT have negative exponents',
      latex: `\\frac{${c1}}{${c2}} \\text{ remains in place}`,
      explanation: 'Only variables with negative exponents change their position.'
    });
    steps.push({
      step: 2,
      title: 'Move variables to opposite sides to make powers positive',
      latex: `${v}^{${expV}} \\implies \\frac{1}{${v}^{${Math.abs(expV)}}}, \\quad \\frac{1}{${u}^{${expU}}} \\implies ${u}^{${Math.abs(expU)}}`,
      explanation: 'Numerator negative exponent moves down; denominator negative exponent moves up.'
    });
    steps.push({
      step: 3,
      title: 'Combine terms',
      latex: correctLatex,
      explanation: 'Write final fraction.'
    });
  } else if (level === 4) {
    // Product with negative exponents requiring distribution and simplification
    const c = randomChoice([2, 3]);
    const expV = -randomInt(2, 3);
    const expU = randomInt(1, 3);
    const outer = -2;
    // (c * x^-a * y^b)^-2 = c^-2 * x^(2a) * y^(-2b) = x^(2a) / (c^2 * y^(2b))
    const cSq = c * c;
    const vPow = Math.abs(expV * outer);
    const uPow = expU * Math.abs(outer);
    const u = 'y';
    expressionLatex = `(${c} ${v}^{${expV}} ${u}^{${expU}})^{${outer}}`;
    correctLatex = `\\frac{${v}^{${vPow}}}{${cSq} ${u}^{${uPow}}}`;
    distractors = [
      { latex: `\\frac{${cSq} ${v}^{${vPow}}}{${u}^{${uPow}}}`, errorType: 'Kept coefficient squared in numerator' },
      { latex: `\\frac{${v}^{${vPow}} ${u}^{${uPow}}}{${cSq}}`, errorType: 'Kept y in numerator' },
      { latex: `-\\frac{${v}^{${vPow}}}{${cSq} ${u}^{${uPow}}}`, errorType: 'Negative sign attached to fraction' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute outer power -2 to each factor',
      latex: `${c}^{-2} \\cdot ${v}^{(${expV}) \\cdot (-2)} \\cdot ${u}^{${expU} \\cdot (-2)} = \\frac{1}{${cSq}} \\cdot ${v}^{${vPow}} \\cdot ${u}^{-${uPow}}`,
      explanation: 'Multiply inner exponents by -2.'
    });
    steps.push({
      step: 2,
      title: 'Rearrange with positive exponents',
      latex: correctLatex,
      explanation: `${v}^{${vPow}} stays in numerator; ${cSq} and ${u}^{${uPow}} are placed in denominator.`
    });
  } else {
    // Level 5: Complex multi-term negative exponent simplification
    const u = 'y';
    const exp1 = -randomInt(3, 5);
    const exp2 = randomInt(2, 4);
    const exp3 = -randomInt(2, 4);
    const exp4 = -randomInt(1, 3);
    expressionLatex = `\\frac{(${v}^{${exp1}} ${u}^{${exp2}})^{-1}}{${v}^{${exp3}} ${u}^{${exp4}}}`;
    // Top: v^(-exp1) * u^(-exp2) = v^(|exp1|) * u^(-exp2)
    // Over: v^(exp3) * u^(exp4)
    // v: |exp1| - (exp3) = |exp1| + |exp3| > 0
    // u: -exp2 - (exp4) = -exp2 + |exp4|
    const netV = Math.abs(exp1) - exp3;
    const netU = -exp2 - exp4;
    correctLatex = formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netV), [u]: Fraction.fromInt(netU) });
    distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netV), [u]: Fraction.fromInt(-netU) }), errorType: 'Sign mistake on exponent of ' + u },
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(exp1 - exp3), [u]: Fraction.fromInt(exp2 - exp4) }), errorType: 'Forgot outer exponent -1' },
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netV + 1), [u]: Fraction.fromInt(netU) }), errorType: 'Arithmetic error when combining exponents' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute outer exponent -1 to numerator',
      latex: `(${v}^{${exp1}})^{-1} (${u}^{${exp2}})^{-1} = ${v}^{${Math.abs(exp1)}} ${u}^{-${exp2}}`,
      explanation: 'Multiply exponents in numerator by -1.'
    });
    steps.push({
      step: 2,
      title: 'Apply quotient rule to each variable',
      latex: `${v}^{${Math.abs(exp1)} - (${exp3})} = ${v}^{${netV}}, \\quad ${u}^{-${exp2} - (${exp4})} = ${u}^{${netU}}`,
      explanation: 'Subtract denominator exponents.'
    });
    steps.push({
      step: 3,
      title: 'Express with positive exponents',
      latex: correctLatex,
      explanation: 'Place any negative powers into the denominator.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `neg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'negative-exponents',
    topicName: 'Negative Exponents',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Negative Exponents: } a^{-n} = \\frac{1}{a^n} \\; (a \\neq 0)',
    domainRestrictions: `${v} \\neq 0`
  };
}

function generateFractionalExponents(level: DifficultyLevel): Question {
  const v = randomChoice(['x', 'y', 'a']);
  let promptText = 'Convert or simplify the fractional exponent expression:';
  let expressionLatex = '';
  let correctLatex = '';
  let distractors: { latex: string; errorType?: string }[] = [];
  const steps: SolutionStep[] = [];

  if (level === 1) {
    // Basic radical conversion: a^(1/n) = \sqrt[n]{a}
    const n = randomChoice([2, 3, 4, 5]);
    expressionLatex = `${v}^{\\frac{1}{${n}}}`;
    correctLatex = n === 2 ? `\\sqrt{${v}}` : `\\sqrt[${n}]{${v}}`;
    distractors = [
      { latex: `\\frac{1}{${v}^{${n}}}`, errorType: 'Confused fractional exponent with negative exponent' },
      { latex: `${v}^{${n}}`, errorType: 'Treated denominator as integer exponent' },
      { latex: `\\frac{${v}}{${n}}`, errorType: 'Divided variable by denominator' }
    ];
    steps.push({
      step: 1,
      title: 'Apply definition of fractional exponent',
      latex: `a^{1/n} = \\sqrt[n]{a}`,
      explanation: 'The denominator of the fractional exponent is the index of the radical.'
    });
    steps.push({
      step: 2,
      title: 'Write in radical form',
      latex: correctLatex,
      explanation: `Index is ${n}.`
    });
  } else if (level === 2) {
    // Numeric evaluation: e.g. 8^(2/3) or 27^(2/3) or 16^(3/4)
    const baseObj = randomChoice([
      { base: 8, root: 2, n: 3, m: 2, ans: 4 },
      { base: 27, root: 3, n: 3, m: 2, ans: 9 },
      { base: 16, root: 2, n: 4, m: 3, ans: 8 },
      { base: 25, root: 5, n: 2, m: 3, ans: 125 },
      { base: 32, root: 2, n: 5, m: 2, ans: 4 }
    ]);
    expressionLatex = `${baseObj.base}^{\\frac{${baseObj.m}}{${baseObj.n}}}`;
    correctLatex = `${baseObj.ans}`;
    distractors = [
      { latex: `${baseObj.base * baseObj.m / baseObj.n}`, errorType: 'Multiplied base by the fraction' },
      { latex: `${Math.pow(baseObj.base, baseObj.m)}`, errorType: 'Forgot to take the root' },
      { latex: `${baseObj.root}`, errorType: 'Took the root but forgot to raise to the numerator power' }
    ];
    steps.push({
      step: 1,
      title: 'Rewrite using root and power form',
      latex: `a^{m/n} = (\\sqrt[n]{a})^m \\implies (\\sqrt[${baseObj.n}]{${baseObj.base}})^{${baseObj.m}}`,
      explanation: 'Take the root first to keep numbers manageable.'
    });
    steps.push({
      step: 2,
      title: 'Evaluate the root',
      latex: `\\sqrt[${baseObj.n}]{${baseObj.base}} = ${baseObj.root}`,
      explanation: `${baseObj.root}^{${baseObj.n}} = ${baseObj.base}.`
    });
    steps.push({
      step: 3,
      title: 'Raise to the numerator power',
      latex: `${baseObj.root}^{${baseObj.m}} = ${baseObj.ans}`,
      explanation: `Calculate ${baseObj.root} to the power ${baseObj.m}.`
    });
  } else if (level === 3) {
    // Variable expression: (x^(3/2))^4 or (x^6)^(2/3)
    const innerExp = randomChoice([3, 6, 9]);
    const num = 2;
    const den = 3;
    const finalExp = (innerExp * num) / den;
    expressionLatex = `(${v}^{${innerExp}})^{\\frac{${num}}{${den}}}`;
    correctLatex = `${v}^{${finalExp}}`;
    distractors = [
      { latex: `${v}^{${innerExp + num}}`, errorType: 'Added exponents instead of multiplying' },
      { latex: `${v}^{${innerExp * num}}`, errorType: 'Forgot to divide by denominator' },
      { latex: `\\sqrt[${den}]{${v}^{${innerExp}}}`, errorType: 'Did not simplify exponent product' }
    ];
    steps.push({
      step: 1,
      title: 'Multiply inner and outer exponents',
      latex: `${innerExp} \\cdot \\frac{${num}}{${den}} = \\frac{${innerExp * num}}{${den}}`,
      explanation: 'Power of a power rule: multiply exponents.'
    });
    steps.push({
      step: 2,
      title: 'Reduce fraction',
      latex: `\\frac{${innerExp * num}}{${den}} = ${finalExp}`,
      explanation: `${innerExp * num} divided by ${den} is ${finalExp}.`
    });
    steps.push({
      step: 3,
      title: 'Write simplified power',
      latex: correctLatex,
      explanation: 'Result.'
    });
  } else if (level === 4) {
    // Negative fractional exponent evaluation: (16)^(-3/4) or (27)^(-2/3) or variable with negative fractional exponent
    const baseItem = randomChoice([
      { base: 16, n: 4, m: 3, root: 2, ansNum: 1, ansDen: 8 },
      { base: 27, n: 3, m: 2, root: 3, ansNum: 1, ansDen: 9 },
      { base: 8, n: 3, m: 2, root: 2, ansNum: 1, ansDen: 4 },
      { base: 25, n: 2, m: 3, root: 5, ansNum: 1, ansDen: 125 }
    ]);
    expressionLatex = `${baseItem.base}^{-\\frac{${baseItem.m}}{${baseItem.n}}}`;
    correctLatex = `\\frac{${baseItem.ansNum}}{${baseItem.ansDen}}`;
    distractors = [
      { latex: `-${baseItem.ansDen}`, errorType: 'Treated negative exponent as a negative integer multiplier' },
      { latex: `${baseItem.ansDen}`, errorType: 'Ignored negative sign on exponent' },
      { latex: `-\\frac{${baseItem.ansNum}}{${baseItem.ansDen}}`, errorType: 'Attached negative sign to the fraction' }
    ];
    steps.push({
      step: 1,
      title: 'Apply negative exponent rule first',
      latex: `a^{-m/n} = \\frac{1}{a^{m/n}} \\implies \\frac{1}{${baseItem.base}^{${baseItem.m}/${baseItem.n}}}`,
      explanation: 'Take reciprocal to convert to a positive fractional exponent.'
    });
    steps.push({
      step: 2,
      title: 'Evaluate base with positive fractional exponent',
      latex: `${baseItem.base}^{${baseItem.m}/${baseItem.n}} = (\\sqrt[${baseItem.n}]{${baseItem.base}})^{${baseItem.m}} = ${baseItem.root}^{${baseItem.m}} = ${baseItem.ansDen}`,
      explanation: 'Take radical root and raise to power.'
    });
    steps.push({
      step: 3,
      title: 'Combine into reciprocal fraction',
      latex: correctLatex,
      explanation: 'Final simplified rational value.'
    });
  } else {
    // Level 5: Type A - Mixed fractional and negative exponents with multiple variables
    const u = 'y';
    const f1 = new Fraction(-3, 2);
    const f2 = new Fraction(2, 3);
    const outer1 = -2;
    const f3 = new Fraction(1, 2);
    const f4 = new Fraction(-1, 3);
    const outer2 = 3;
    // Top: (x^(-3/2) * y^(2/3))^(-2) = x^3 * y^(-4/3)
    // Bottom: (x^(1/2) * y^(-1/3))^3 = x^(3/2) * y^(-1)
    // x: 3 - 3/2 = 3/2
    // y: -4/3 - (-1) = -4/3 + 1 = -1/3 => y^(1/3) in denominator
    const expV = new Fraction(3, 2);
    const expU = new Fraction(-1, 3);
    expressionLatex = `\\frac{(x^{-\\frac{3}{2}} y^{\\frac{2}{3}})^{-2}}{(x^{\\frac{1}{2}} y^{-\\frac{1}{3}})^3}`;
    correctLatex = `\\frac{x^{\\frac{3}{2}}}{y^{\\frac{1}{3}}}`;
    distractors = [
      { latex: `x^{\\frac{3}{2}} y^{\\frac{1}{3}}`, errorType: 'Mishandled sign of y exponent when subtracting' },
      { latex: `\\frac{y^{\\frac{1}{3}}}{x^{\\frac{3}{2}}}`, errorType: 'Inverted the positions of x and y' },
      { latex: `\\frac{x^{\\frac{9}{2}}}{y^{\\frac{7}{3}}}`, errorType: 'Added exponents in numerator and denominator instead of multiplying' }
    ];
    steps.push({
      step: 1,
      title: 'Distribute outer exponents in numerator and denominator',
      latex: `\\text{Numerator: } x^{(-\\frac{3}{2})(-2)} y^{(\\frac{2}{3})(-2)} = x^3 y^{-\\frac{4}{3}}, \\quad \\text{Denominator: } x^{(\\frac{1}{2})(3)} y^{(-\\frac{1}{3})(3)} = x^{\\frac{3}{2}} y^{-1}`,
      explanation: 'Power of a product rule: multiply inner exponents by outer exponents.'
    });
    steps.push({
      step: 2,
      title: 'Apply quotient rule to base x',
      latex: `x^{3 - \\frac{3}{2}} = x^{\\frac{6}{2} - \\frac{3}{2}} = x^{\\frac{3}{2}}`,
      explanation: 'Subtract denominator power from numerator power.'
    });
    steps.push({
      step: 3,
      title: 'Apply quotient rule to base y',
      latex: `y^{-\\frac{4}{3} - (-1)} = y^{-\\frac{4}{3} + 1} = y^{-\\frac{1}{3}} = \\frac{1}{y^{\\frac{1}{3}}}`,
      explanation: 'Subtracting negative 1 is adding 1.'
    });
    steps.push({
      step: 4,
      title: 'Combine into simplified expression',
      latex: correctLatex,
      explanation: 'Final expression with positive exponents.'
    });
  }

  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `frac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'fractional-exponents',
    topicName: 'Fractional Exponents',
    difficulty: level,
    questionType: 'standard',
    promptText,
    expressionLatex,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: '\\text{Fractional Exponents: } a^{m/n} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m',
    domainRestrictions: 'Expressions assume nonnegative real bases for even roots.'
  };
}

// TOPIC 9 & LEVEL 5 GENERATOR: Combining the Laws of Exponents & Deep Question Types
function generateCombiningLaws(level: DifficultyLevel): Question {
  // Level 1: 2 simple rules combined, e.g. x^2 * x^3 / x^1
  if (level === 1) {
    const v = randomChoice(['x', 'y', 'a']);
    const m = randomInt(2, 4);
    const n = randomInt(2, 4);
    const p = randomInt(1, 2);
    const net = m + n - p;
    const expressionLatex = `\\frac{${v}^{${m}} \\cdot ${v}^{${n}}}{${v}^{${p}}}`;
    const correctLatex = `${v}^{${net}}`;
    const distractors = [
      { latex: `${v}^{${m * n - p}}`, errorType: 'Multiplied exponents in numerator' },
      { latex: `${v}^{${m + n + p}}`, errorType: 'Added denominator exponent instead of subtracting' },
      { latex: `${v}^{${net + 1}}`, errorType: 'Addition mistake' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Combine numerator using Product of Powers',
        latex: `${v}^{${m} + ${n}} = ${v}^{${m + n}}`,
        explanation: 'Add exponents in the numerator.'
      },
      {
        step: 2,
        title: 'Apply Quotient of Powers',
        latex: `\\frac{${v}^{${m + n}}}{${v}^{${p}}} = ${v}^{${m + n} - ${p}} = ${v}^{${net}}`,
        explanation: 'Subtract denominator exponent from numerator exponent.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-1-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 1,
      questionType: 'standard',
      promptText: 'Simplify the mixed expression using the laws of exponents:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Combine Product Rule (a^m \\cdot a^n = a^{m+n}) and Quotient Rule (a^m / a^n = a^{m-n})',
      domainRestrictions: `${v} \\neq 0`
    };
  }

  // Level 2: Power of power combined with product or quotient
  if (level === 2) {
    const v = 'x';
    const m = randomInt(2, 3);
    const n = randomInt(2, 3);
    const p = -randomInt(1, 3);
    const net = m * n + p;
    const expressionLatex = `(${v}^{${m}})^{${n}} \\cdot ${v}^{${p}}`;
    const correctLatex = net >= 0 ? (net === 0 ? '1' : `${v}^{${net}}`) : `\\frac{1}{${v}^{${Math.abs(net)}}}`;
    const distractors = [
      { latex: `${v}^{${(m + n) + p}}`, errorType: 'Added exponents in power of power' },
      { latex: `${v}^{${m * n - p}}`, errorType: 'Subtracted negative exponent instead of adding' },
      { latex: `${v}^{${m * n * p}}`, errorType: 'Multiplied all three exponents' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Apply Power of a Power rule to first factor',
        latex: `(${v}^{${m}})^{${n}} = ${v}^{${m} \\cdot ${n}} = ${v}^{${m * n}}`,
        explanation: 'Multiply inner and outer exponents.'
      },
      {
        step: 2,
        title: 'Apply Product of Powers rule with second factor',
        latex: `${v}^{${m * n}} \\cdot ${v}^{${p}} = ${v}^{${m * n} + (${p})} = ${v}^{${net}}`,
        explanation: 'Add exponents with same base.'
      },
      {
        step: 3,
        title: 'Format with positive exponent',
        latex: correctLatex,
        explanation: net < 0 ? 'Move to denominator.' : 'Final power.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-2-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 2,
      questionType: 'standard',
      promptText: 'Simplify the expression completely using the laws of exponents:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Power of a Power followed by Product Rule',
      domainRestrictions: `${v} \\neq 0`
    };
  }

  // Level 3: Power of product and quotient with two variables
  if (level === 3) {
    const v = 'a';
    const u = 'b';
    const m = randomInt(2, 3);
    const n = -randomInt(1, 2);
    const p = 2;
    const denM = randomInt(1, 3);
    const denN = -randomInt(1, 2);
    // ((a^m * b^n)^p) / (a^denM * b^denN)
    const netM = m * p - denM;
    const netN = n * p - denN;
    const expressionLatex = `\\frac{(${v}^{${m}} ${u}^{${n}})^{${p}}}{${v}^{${denM}} ${u}^{${denN}}}`;
    const correctLatex = formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netM), [u]: Fraction.fromInt(netN) });
    const distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(m * p + denM), [u]: Fraction.fromInt(netN) }), errorType: 'Added denominator exponent of a' },
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt((m + p) - denM), [u]: Fraction.fromInt(netN) }), errorType: 'Added power to m instead of multiplying' },
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netM), [u]: Fraction.fromInt(n * p + denN) }), errorType: 'Sign mistake on b exponent' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Distribute power 2 to numerator factors',
        latex: `(${v}^{${m}})^{${p}} (${u}^{${n}})^{${p}} = ${v}^{${m * p}} ${u}^{${n * p}}`,
        explanation: 'Multiply each inner exponent by 2.'
      },
      {
        step: 2,
        title: `Apply quotient rule for base ${v}`,
        latex: `${v}^{${m * p} - ${denM}} = ${v}^{${netM}}`,
        explanation: 'Subtract denominator exponent.'
      },
      {
        step: 3,
        title: `Apply quotient rule for base ${u}`,
        latex: `${u}^{${n * p} - (${denN})} = ${u}^{${netN}}`,
        explanation: 'Subtracting negative exponent yields addition.'
      },
      {
        step: 4,
        title: 'Combine in positive exponent form',
        latex: correctLatex,
        explanation: 'Write simplified fraction.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-3-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 3,
      questionType: 'standard',
      promptText: 'Simplify completely and express with positive exponents:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Power of a Product + Quotient Rule + Negative Exponents',
      domainRestrictions: `${v} \\neq 0, \\; ${u} \\neq 0`
    };
  }

  // Level 4: Several steps, complex fractions, fractional exponents in meaningful proportion
  if (level === 4) {
    const v = 'x';
    const u = 'y';
    // ((x^(-2) * y^3)^2) / (x^3 * y^(-1))
    // Numerator: x^-4 * y^6
    // Denominator: x^3 * y^-1
    // Net x: -4 - 3 = -7
    // Net y: 6 - (-1) = 7
    // Result: y^7 / x^7
    const expV = -randomInt(1, 3);
    const expU = randomInt(2, 4);
    const p = 2;
    const dV = randomInt(2, 4);
    const dU = -randomInt(1, 2);
    const netV = expV * p - dV;
    const netU = expU * p - dU;
    const expressionLatex = `\\frac{(${v}^{${expV}} ${u}^{${expU}})^{${p}}}{${v}^{${dV}} ${u}^{${dU}}}`;
    const correctLatex = formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netV), [u]: Fraction.fromInt(netU) });
    const distractors = [
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(Math.abs(netV)), [u]: Fraction.fromInt(netU) }), errorType: 'Failed to put negative power of x in denominator' },
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(netV), [u]: Fraction.fromInt(expU * p + dU) }), errorType: 'Added denominator exponent of y' },
      { latex: formatMonomial(Fraction.one(), { [v]: Fraction.fromInt(expV + p - dV), [u]: Fraction.fromInt(netU) }), errorType: 'Added power instead of multiplying' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Power of a Product on numerator',
        latex: `${v}^{(${expV})(2)} ${u}^{(${expU})(2)} = ${v}^{${expV * p}} ${u}^{${expU * p}}`,
        explanation: 'Multiply inner exponents by 2.'
      },
      {
        step: 2,
        title: 'Subtract denominator exponents (Quotient rule)',
        latex: `${v}^{${expV * p} - ${dV}} = ${v}^{${netV}}, \\quad ${u}^{${expU * p} - (${dU})} = ${u}^{${netU}}`,
        explanation: 'Subtract denominator powers.'
      },
      {
        step: 3,
        title: 'Write with positive exponents only',
        latex: correctLatex,
        explanation: 'Move negative exponents into denominator.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-4-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 4,
      questionType: 'standard',
      promptText: 'Simplify the expression completely into positive exponent form:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Power of Product + Quotient Rule + Exponent Sign Normalization',
      domainRestrictions: `${v} \\neq 0, \\; ${u} \\neq 0`
    };
  }

  // -------------------------------------------------------------
  // LEVEL 5: Genuinely Difficult Deep Reasoning Question Types
  // Types A, B, C, D, E, F, G, H
  // -------------------------------------------------------------
  const qType = randomChoice(['TypeB', 'TypeC', 'TypeD', 'TypeE', 'TypeF', 'TypeH']);

  if (qType === 'TypeB') {
    // Type B: Multiple nested powers with mixed fractional powers
    // {[(a^(2/3) * b^(-1/2))^3]}^(-2) / (a^(-5/2) * b^(4/3))
    const a = 'a';
    const b = 'b';
    const expA_in = new Fraction(2, 3);
    const expB_in = new Fraction(-1, 2);
    const nest1 = 3;
    const nest2 = -2;
    const totalOuter = nest1 * nest2; // -6
    const topA = expA_in.mul(totalOuter); // (2/3) * -6 = -4
    const topB = expB_in.mul(totalOuter); // (-1/2) * -6 = 3
    const botA = new Fraction(-5, 2);
    const botB = new Fraction(4, 3);
    const netA = topA.sub(botA); // -4 - (-5/2) = -4 + 5/2 = -3/2
    const netB = topB.sub(botB); // 3 - 4/3 = 5/3
    const expressionLatex = `\\frac{\\left[ (${a}^{\\frac{2}{3}} ${b}^{-\\frac{1}{2}})^3 \\right]^{-2}}{${a}^{-\\frac{5}{2}} ${b}^{\\frac{4}{3}}}`;
    const correctLatex = `\\frac{${b}^{\\frac{5}{3}}}{${a}^{\\frac{3}{2}}}`;
    const distractors = [
      { latex: `${a}^{\\frac{3}{2}} ${b}^{\\frac{5}{3}}`, errorType: 'Ignored negative sign on exponent of a' },
      { latex: `\\frac{${a}^{\\frac{3}{2}}}{${b}^{\\frac{5}{3}}}`, errorType: 'Inverted the fraction' },
      { latex: `\\frac{${b}^{\\frac{1}{3}}}{${a}^{\\frac{13}{2}}}`, errorType: 'Arithmetic mistake when subtracting rational exponents' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Combine nested outer powers in numerator',
        latex: `3 \\cdot (-2) = -6 \\implies (${a}^{\\frac{2}{3}} ${b}^{-\\frac{1}{2}})^{-6}`,
        explanation: 'Power of a power rule: multiply outer exponents 3 and -2.'
      },
      {
        step: 2,
        title: 'Distribute exponent -6 to inner variables',
        latex: `${a}^{(\\frac{2}{3})(-6)} ${b}^{(-\\frac{1}{2})(-6)} = ${a}^{-4} ${b}^3`,
        explanation: 'Multiply each inner fractional exponent by -6.'
      },
      {
        step: 3,
        title: 'Subtract denominator exponents (Quotient Rule)',
        latex: `${a}^{-4 - (-\\frac{5}{2})} = ${a}^{-\\frac{8}{2} + \\frac{5}{2}} = ${a}^{-\\frac{3}{2}}, \\quad ${b}^{3 - \\frac{4}{3}} = ${b}^{\\frac{9}{3} - \\frac{4}{3}} = ${b}^{\\frac{5}{3}}`,
        explanation: 'Subtract denominator rational powers.'
      },
      {
        step: 4,
        title: 'Express with positive exponents',
        latex: correctLatex,
        explanation: 'Place factor with negative power in the denominator.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-5-B-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 5,
      questionType: 'nested-powers',
      promptText: 'Level 5 Deep Challenge — Simplify the multi-nested expression completely:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Nested Powers + Fractional Exponents + Negative Exponents + Quotient Rule',
      domainRestrictions: 'a > 0, \\; b > 0'
    };
  }

  if (qType === 'TypeC') {
    // Type C: Complex algebraic fraction with two products in numerator and rational powers
    // [ (x^(3/4) * y^(-2/3))^2 * (x^(-1/2) * y^(1/3))^(-3) ] / [ x^(5/2) * y^(-4/3) ]
    // Top 1: x^(6/4) * y^(-4/3) = x^(3/2) * y^(-4/3)
    // Top 2: x^(3/2) * y^(-1)
    // Combined Top: x^(3/2 + 3/2) * y^(-4/3 - 1) = x^3 * y^(-7/3)
    // Denominator: x^(5/2) * y^(-4/3)
    // Net x: 3 - 5/2 = 1/2
    // Net y: -7/3 - (-4/3) = -7/3 + 4/3 = -3/3 = -1 => 1/y
    const expressionLatex = `\\frac{(x^{\\frac{3}{4}} y^{-\\frac{2}{3}})^2 (x^{-\\frac{1}{2}} y^{\\frac{1}{3}})^{-3}}{x^{\\frac{5}{2}} y^{-\\frac{4}{3}}}`;
    const correctLatex = `\\frac{x^{\\frac{1}{2}}}{y}`;
    const distractors = [
      { latex: `x^{\\frac{1}{2}} y`, errorType: 'Sign mistake on y exponent' },
      { latex: `\\frac{y}{x^{\\frac{1}{2}}}`, errorType: 'Inverted the quotient' },
      { latex: `\\frac{x^{\\frac{3}{2}}}{y^2}`, errorType: 'Calculation error combining rational exponents' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Distribute exponents in each numerator factor',
        latex: `(x^{\\frac{3}{4}} y^{-\\frac{2}{3}})^2 = x^{\\frac{3}{2}} y^{-\\frac{4}{3}}, \\quad (x^{-\\frac{1}{2}} y^{\\frac{1}{3}})^{-3} = x^{\\frac{3}{2}} y^{-1}`,
        explanation: 'Multiply inner exponents by outer powers 2 and -3.'
      },
      {
        step: 2,
        title: 'Combine numerator factors using Product Rule',
        latex: `x^{\\frac{3}{2} + \\frac{3}{2}} y^{-\\frac{4}{3} + (-1)} = x^3 y^{-\\frac{7}{3}}`,
        explanation: 'Add exponents for like bases in the numerator.'
      },
      {
        step: 3,
        title: 'Divide by denominator using Quotient Rule',
        latex: `x^{3 - \\frac{5}{2}} y^{-\\frac{7}{3} - (-\\frac{4}{3})} = x^{\\frac{1}{2}} y^{-\\frac{3}{3}} = x^{\\frac{1}{2}} y^{-1}`,
        explanation: 'Subtract denominator powers.'
      },
      {
        step: 4,
        title: 'Rewrite with positive exponents',
        latex: correctLatex,
        explanation: 'Move y^{-1} to denominator as y^1.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-5-C-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 5,
      questionType: 'complex-fraction',
      promptText: 'Level 5 Deep Challenge — Simplify the complex algebraic fraction completely:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Product of Powers + Power of a Product + Quotient of Powers + Fractional Exponents',
      domainRestrictions: 'x > 0, \\; y > 0'
    };
  }

  if (qType === 'TypeD') {
    // Type D: Equivalent expression identification
    // Target: (a^(-2/3) * b^(1/2))^(-3) = a^2 * b^(-3/2) = a^2 / b^(3/2)
    const expressionLatex = `\\left(a^{-\\frac{2}{3}} b^{\\frac{1}{2}}\\right)^{-3}`;
    const correctLatex = `\\frac{a^2}{\\sqrt{b^3}}`;
    const distractors = [
      { latex: `\\frac{b^{\\frac{3}{2}}}{a^2}`, errorType: 'Swapped numerator and denominator variables' },
      { latex: `\\frac{1}{a^2 b^{\\frac{3}{2}}}`, errorType: 'Treated exponent of a as negative' },
      { latex: `a^{\\frac{2}{3}} b^{-\\frac{1}{2}}`, errorType: 'Multiplied exponents by -1 instead of -3' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Apply Power of a Product rule',
        latex: `a^{(-\\frac{2}{3})(-3)} \\cdot b^{(\\frac{1}{2})(-3)} = a^2 b^{-\\frac{3}{2}}`,
        explanation: 'Distribute power -3.'
      },
      {
        step: 2,
        title: 'Convert negative exponent into fraction',
        latex: `a^2 b^{-\\frac{3}{2}} = \\frac{a^2}{b^{\\frac{3}{2}}}`,
        explanation: 'Move b to the denominator with positive exponent.'
      },
      {
        step: 3,
        title: 'Express fractional exponent in radical form',
        latex: `b^{\\frac{3}{2}} = \\sqrt{b^3} \\implies ${correctLatex}`,
        explanation: 'Denominator 2 represents square root.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-5-D-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 5,
      questionType: 'equivalent-expression',
      promptText: 'Which of the following expressions is mathematically equivalent to the given expression for all positive a and b?',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Power of a Product + Negative Exponent + Radical Form Equivalence',
      domainRestrictions: 'a > 0, \\; b > 0'
    };
  }

  if (qType === 'TypeE') {
    // Type E: Work backward
    // Prompt: Which of the following expressions simplifies to (y^7 / x^5)?
    const expressionLatex = `\\text{Target Simplified Result: } \\frac{y^7}{x^5}`;
    const correctLatex = `\\frac{(x^{-2}y^3)^2}{x y^{-1}}`;
    const distractors = [
      { latex: `\\frac{(x^{-2}y^3)^2}{x^{-1} y}`, errorType: 'Yields y^5 / x^3 instead of y^7 / x^5' },
      { latex: `\\frac{(x^2 y^{-3})^2}{x y^{-1}}`, errorType: 'Has inverted signs in numerator' },
      { latex: `\\frac{(x^{-1}y^4)^2}{x^3 y}`, errorType: 'Yields y^7 / x^5 with incorrect intermediate steps' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Test candidate numerator: (x^{-2}y^3)^2',
        latex: `x^{(-2)(2)} y^{(3)(2)} = x^{-4} y^6`,
        explanation: 'Square the factors in parentheses.'
      },
      {
        step: 2,
        title: 'Divide by candidate denominator: x y^{-1}',
        latex: `x^{-4 - 1} y^{6 - (-1)} = x^{-5} y^7`,
        explanation: 'Subtract denominator exponents: -4 - 1 = -5, and 6 - (-1) = 7.'
      },
      {
        step: 3,
        title: 'Convert negative exponent',
        latex: `x^{-5} y^7 = \\frac{y^7}{x^5}`,
        explanation: 'Matches the target result exactly.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-5-E-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 5,
      questionType: 'work-backward',
      promptText: 'Working Backward — Which original expression simplifies to the target result for all nonzero x and y?',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Multi-rule Backward Verification',
      domainRestrictions: 'x \\neq 0, \\; y \\neq 0'
    };
  }

  if (qType === 'TypeF') {
    // Type F: Find an unknown exponent k
    // e.g. ( (x^(3/2))^4 ) / x^k = x^(-1)
    // Numerator: x^((3/2)*4) = x^6
    // Expression: x^(6 - k) = x^(-1)
    // 6 - k = -1 => k = 7
    const expressionLatex = `\\frac{(x^{\\frac{3}{2}})^4}{x^k} = x^{-1}`;
    const correctLatex = 'k = 7';
    const distractors = [
      { latex: 'k = 5', errorType: 'Computed 6 - 1 instead of 6 - (-1)' },
      { latex: 'k = -7', errorType: 'Sign reversal' },
      { latex: 'k = 6', errorType: 'Set exponent equal to numerator power' }
    ];
    const steps: SolutionStep[] = [
      {
        step: 1,
        title: 'Simplify the numerator using Power of a Power',
        latex: `\\left(x^{\\frac{3}{2}}\\right)^4 = x^{\\frac{3}{2} \\cdot 4} = x^6`,
        explanation: 'Multiply 3/2 by 4.'
      },
      {
        step: 2,
        title: 'Apply Quotient of Powers to the left side',
        latex: `\\frac{x^6}{x^k} = x^{6 - k}`,
        explanation: 'Subtract the denominator exponent k.'
      },
      {
        step: 3,
        title: 'Equate exponents on both sides of the identity',
        latex: `6 - k = -1`,
        explanation: 'Since bases are equal, exponents must be equal.'
      },
      {
        step: 4,
        title: 'Solve linear equation for k',
        latex: `-k = -1 - 6 = -7 \\implies k = 7`,
        explanation: 'Add k and 1 to both sides to find k = 7.'
      }
    ];
    const { options, correctIndex } = assembleOptions(correctLatex, distractors);
    return {
      id: `comb-5-F-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topicId: 'combining-laws',
      topicName: 'Combining the Laws of Exponents',
      difficulty: 5,
      questionType: 'find-k',
      promptText: 'Find the unknown exponent value k that makes the identity true for all positive real x:',
      expressionLatex,
      options,
      correctIndex,
      solutionSteps: steps,
      ruleSummary: 'Power of a Power + Quotient Rule + Exponent Equation Solving',
      domainRestrictions: 'x > 0'
    };
  }

  // Type H: Error analysis
  // Show 4 steps of a student's simplification and ask where the first error occurred
  const expressionLatex = `\\text{Problem: Simplify } \\frac{(2a^{-2}b^3)^3}{4a^2 b^{-1}}`;
  const correctLatex = '\\text{Step 1: The coefficient 2 was not cubed into 8}';
  const distractors = [
    { latex: '\\text{Step 2: Exponents of base } a \\text{ were subtracted incorrectly}', errorType: 'Step 2 was mathematically valid based on Step 1' },
    { latex: '\\text{Step 3: Exponents of base } b \\text{ were subtracted incorrectly}', errorType: 'Step 3 was mathematically valid based on Step 1' },
    { latex: '\\text{The student made no errors; the simplification is correct}', errorType: 'Overlooked the uncubed coefficient in Step 1' }
  ];
  const steps: SolutionStep[] = [
    {
      step: 1,
      title: 'Analyze Student Step 1',
      latex: `\\text{Student wrote: } \\frac{2a^{-6}b^9}{4a^2 b^{-1}}`,
      explanation: 'Error found in Step 1! The student applied the outer power 3 to the variables (-2 \\times 3 = -6 and 3 \\times 3 = 9), but forgot to cube the coefficient: 2^3 should be 8, not 2.'
    },
    {
      step: 2,
      title: 'Correct Step 1',
      latex: `\\frac{2^3 a^{-6} b^9}{4a^2 b^{-1}} = \\frac{8a^{-6} b^9}{4a^2 b^{-1}}`,
      explanation: 'Power of a product applies to ALL factors inside parentheses.'
    },
    {
      step: 3,
      title: 'Proceed with correct steps',
      latex: `\\frac{8}{4} \\cdot a^{-6 - 2} \\cdot b^{9 - (-1)} = 2a^{-8}b^{10} = \\frac{2b^{10}}{a^8}`,
      explanation: 'Correct final simplified form.'
    }
  ];
  const { options, correctIndex } = assembleOptions(correctLatex, distractors);
  return {
    id: `comb-5-H-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    topicId: 'combining-laws',
    topicName: 'Combining the Laws of Exponents',
    difficulty: 5,
    questionType: 'error-analysis',
    promptText: 'Error Analysis — In which step did the student make their first error, and what was the mistake?',
    expressionLatex: `\\begin{aligned} &\\text{Expression: } \\frac{(2a^{-2}b^3)^3}{4a^2 b^{-1}} \\\\[4pt] &\\textbf{Step 1: } \\frac{2a^{-6}b^9}{4a^2 b^{-1}} \\\\[4pt] &\\textbf{Step 2: } \\frac{1}{2} a^{-6 - 2} b^9 (b^1) \\\\[4pt] &\\textbf{Step 3: } \\frac{b^{10}}{2a^8} \\end{aligned}`,
    options,
    correctIndex,
    solutionSteps: steps,
    ruleSummary: 'Power of a Product: (ca)^n = c^n a^n (Coefficients must be raised to the power)',
    domainRestrictions: 'a \\neq 0, \\; b \\neq 0'
  };
}

// -------------------------------------------------------------
// MASTER QUESTION GENERATOR
// -------------------------------------------------------------
export function generateQuestion(topicId: string, difficulty: DifficultyLevel): Question {
  switch (topicId) {
    case 'product-powers':
      return generateProductOfPowers(difficulty);
    case 'quotient-powers':
      return generateQuotientOfPowers(difficulty);
    case 'power-power':
      return generatePowerOfPower(difficulty);
    case 'power-product':
      return generatePowerOfProduct(difficulty);
    case 'power-quotient':
      return generatePowerOfQuotient(difficulty);
    case 'zero-exponent':
      return generateZeroExponent(difficulty);
    case 'negative-exponents':
      return generateNegativeExponents(difficulty);
    case 'fractional-exponents':
      return generateFractionalExponents(difficulty);
    case 'combining-laws':
      return generateCombiningLaws(difficulty);
    default:
      return generateCombiningLaws(difficulty);
  }
}
