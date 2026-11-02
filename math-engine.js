/**
 * MATH-ENGINE.JS
 * Procedural Math Question Generator & Dynamic Difficulty Adjustment (DDA) AI Engine.
 * Covers: Mental Arithmetic, Percentages, Fractions, Basic Algebra, Prime Numbers, Sequences.
 */

const MathEngine = (() => {
  // Prime number lookup table up to 100
  const primesUnder100 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const compositesUnder100 = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78, 80, 81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 98, 99];

  // Helper: random integer in range [min, max] inclusive
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Helper: shuffle array
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // DDA AI State Tracker
  const aiState = {
    ageBracket: 'intermediate', // 'junior', 'intermediate', 'senior'
    difficultyTier: 2,          // 1 (Gentle) to 5 (Overdrive)
    streak: 0,
    consecutiveFails: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    avgResponseTime: 4.5,
    recentTimes: [],
    flowStateActive: false,
    aiMessage: 'AI System Online: Calibrated for optimal learning & engagement.'
  };

  function setAgeBracket(bracket) {
    if (['junior', 'intermediate', 'senior'].includes(bracket)) {
      aiState.ageBracket = bracket;
      aiState.difficultyTier = bracket === 'junior' ? 1 : bracket === 'intermediate' ? 2 : 3;
      aiState.streak = 0;
      aiState.consecutiveFails = 0;
      aiState.aiMessage = `AI Calibrated for [${bracket.toUpperCase()}] tier. Ready for battle!`;
    }
  }

  // Feed result to DDA to update tier and adapt in real-time
  function recordAnswer(isCorrect, timeTakenSeconds, allocatedTime) {
    aiState.totalAttempts++;
    aiState.recentTimes.push(timeTakenSeconds);
    if (aiState.recentTimes.length > 5) aiState.recentTimes.shift();

    const avgTime = aiState.recentTimes.reduce((a, b) => a + b, 0) / aiState.recentTimes.length;
    aiState.avgResponseTime = Math.round(avgTime * 10) / 10;

    if (isCorrect) {
      aiState.totalCorrect++;
      aiState.streak++;
      aiState.consecutiveFails = 0;

      // Fast response bonus
      const speedRatio = timeTakenSeconds / allocatedTime;
      if (speedRatio < 0.4 && aiState.streak >= 2) {
        if (aiState.difficultyTier < 5) {
          aiState.difficultyTier++;
          aiState.aiMessage = `⚡ AI DDA: Rapid cognition (${timeTakenSeconds.toFixed(1)}s)! Tier elevated to ${aiState.difficultyTier} (+Damage Boost).`;
        } else {
          aiState.flowStateActive = true;
          aiState.aiMessage = `🔥 AI DDA: FLOW STATE ACTIVE! Max multiplier & combo bonus enabled!`;
        }
      } else if (aiState.streak >= 4 && aiState.difficultyTier < 5) {
        aiState.difficultyTier++;
        aiState.aiMessage = `🧠 AI DDA: 4-Streak detected. Raising challenge to Tier ${aiState.difficultyTier}.`;
      } else {
        aiState.aiMessage = `✨ AI DDA: Excellent solution. Momentum streak: ${aiState.streak}x.`;
      }
    } else {
      aiState.streak = 0;
      aiState.consecutiveFails++;
      aiState.flowStateActive = false;

      if (aiState.consecutiveFails >= 2 && aiState.difficultyTier > 1) {
        aiState.difficultyTier--;
        aiState.consecutiveFails = 0;
        aiState.aiMessage = `🛡️ AI DDA: Recalibrating to Tier ${aiState.difficultyTier} to reinforce fundamental mastery. Hint enabled!`;
      } else {
        aiState.aiMessage = `💡 AI DDA: Analyzing calculation error. Don't worry, keep focus!`;
      }
    }

    return {
      tier: aiState.difficultyTier,
      streak: aiState.streak,
      flowState: aiState.flowStateActive,
      aiMessage: aiState.aiMessage
    };
  }

  // GENERATOR 1: FIREBALL (Fast Mental Arithmetic & 3-Step Operations)
  function generateFireballQuestion() {
    const tier = aiState.difficultyTier;
    const bracket = aiState.ageBracket;
    let prompt = '', answer = 0, hint = '', explanation = '';

    if (bracket === 'junior') {
      if (tier <= 2) {
        // Simple 2 or 3 term arithmetic
        const a = randInt(5, 20);
        const b = randInt(3, 15);
        const c = randInt(2, 9);
        const isAddSub = Math.random() > 0.5;
        if (isAddSub) {
          prompt = `${a} + ${b} - ${c} = ?`;
          answer = a + b - c;
        } else {
          const m1 = randInt(2, 6);
          const m2 = randInt(2, 5);
          prompt = `${m1} × ${m2} + ${a} = ?`;
          answer = m1 * m2 + a;
        }
        hint = "Solve multiplication first, then add or subtract left to right!";
      } else {
        // 3-step with missing number or brackets
        const x = randInt(3, 9);
        const y = randInt(2, 6);
        const z = randInt(10, 30);
        prompt = `(${x} × ${y}) + ${z} = ?`;
        answer = (x * y) + z;
        hint = "Work out the brackets first: calculate the multiplication then add!";
      }
    } else if (bracket === 'intermediate') {
      if (tier <= 2) {
        const a = randInt(12, 45);
        const b = randInt(3, 8);
        const c = randInt(4, 9);
        prompt = `${a} - (${b} × ${c}) = ?`;
        answer = a - (b * c);
        hint = "Order of operations (BODMAS / PEMDAS): multiply before subtracting!";
      } else {
        const a = randInt(4, 12);
        const b = randInt(3, 7);
        const c = randInt(15, 60);
        const d = randInt(2, 5);
        prompt = `(${a} × ${b}) - (${c} ÷ ${d * (c % d === 0 ? 1 : 1)})`;
        // Ensure clean division
        const div = randInt(2, 5);
        const dividend = div * randInt(3, 9);
        prompt = `(${a} × ${b}) - (${dividend} ÷ ${div}) = ?`;
        answer = (a * b) - (dividend / div);
        hint = "Evaluate both parentheses first: multiply left, divide right, then subtract!";
      }
    } else {
      // Senior
      const a = randInt(6, 15);
      const b = randInt(4, 12);
      const c = randInt(2, 8);
      const d = randInt(2, 4);
      if (tier <= 3) {
        prompt = `(${a} × ${b}) + (${c}² - 10) = ?`;
        answer = (a * b) + (c * c - 10);
        hint = "Calculate square first, then the products, then sum!";
      } else {
        const p1 = randInt(3, 6);
        prompt = `3 × (4² - 7) + √${a * a} = ?`;
        answer = 3 * (16 - 7) + a;
        hint = "Evaluate powers/roots: 4² = 16, then inside bracket (16 - 7 = 9), then multiply!";
      }
    }

    explanation = `The exact solution is ${answer}.`;
    const options = generateDistinctOptions(answer);

    return {
      type: 'fireball',
      spellName: '🔥 FIREBALL',
      topic: 'Speed Arithmetic',
      prompt,
      answer,
      options,
      correctIndex: options.indexOf(answer),
      timeLimit: 10,
      hint,
      explanation
    };
  }

  // GENERATOR 2: SHIELD / HEAL (Primes, Percentages, and Fractions)
  function generateShieldQuestion() {
    const bracket = aiState.ageBracket;
    const tier = aiState.difficultyTier;
    const categoryChoice = Math.random();

    // 1. Prime Number Identification (40% chance)
    if (categoryChoice < 0.4) {
      const isJunior = bracket === 'junior';
      const primePool = isJunior ? primesUnder100.filter(p => p < 35) : primesUnder100;
      const compositePool = isJunior ? compositesUnder100.filter(c => c < 35) : compositesUnder100;

      const correctPrime = primePool[randInt(0, primePool.length - 1)];
      const wrongList = shuffle(compositePool).slice(0, 3);
      const options = shuffle([correctPrime, ...wrongList]);

      return {
        type: 'shield',
        spellName: '🛡️ AEGIS SHIELD',
        topic: 'Prime Numbers',
        prompt: `Which of the following is a PRIME number?`,
        answer: correctPrime,
        options,
        correctIndex: options.indexOf(correctPrime),
        timeLimit: 12,
        hint: `A prime number has exactly TWO factors: 1 and itself (it cannot be divided evenly by 2, 3, 5, etc.)!`,
        explanation: `${correctPrime} is prime because it is only divisible by 1 and ${correctPrime}.`
      };
    }

    // 2. Percentages (30% chance)
    if (categoryChoice < 0.7) {
      let percent = 50, base = 80, ans = 40;
      if (bracket === 'junior') {
        const simplePercents = [10, 20, 25, 50];
        percent = simplePercents[randInt(0, simplePercents.length - 1)];
        base = randInt(2, 10) * (percent === 25 ? 4 : 10);
        ans = (percent / 100) * base;
      } else if (bracket === 'intermediate') {
        const midPercents = [15, 20, 25, 30, 40, 75];
        percent = midPercents[randInt(0, midPercents.length - 1)];
        base = randInt(2, 12) * 20;
        ans = (percent / 100) * base;
      } else {
        const advPercents = [12, 15, 35, 45, 65, 85];
        percent = advPercents[randInt(0, advPercents.length - 1)];
        base = randInt(5, 20) * 20;
        ans = (percent / 100) * base;
      }

      const prompt = `What is ${percent}% of ${base}?`;
      const options = generateDistinctOptions(ans);

      return {
        type: 'shield',
        spellName: '🛡️ AEGIS SHIELD',
        topic: 'Percentages',
        prompt,
        answer: ans,
        options,
        correctIndex: options.indexOf(ans),
        timeLimit: 14,
        hint: `${percent}% is the same as (${percent}/100) × ${base}. (Tip: find 10% first, then scale!)`,
        explanation: `${percent}% of ${base} = (${percent} ÷ 100) × ${base} = ${ans}.`
      };
    }

    // 3. Fractions (30% chance)
    let prompt = '', answerStr = '', options = [], hint = '', explanation = '';
    if (bracket === 'junior') {
      const fracPairs = [
        { q: "Which fraction is equivalent to 1/2?", correct: "4/8", wrong: ["2/5", "3/8", "1/3"] },
        { q: "Which fraction is equivalent to 3/4?", correct: "6/8", wrong: ["3/8", "5/8", "4/6"] },
        { q: "Calculate: 1/4 + 2/4 = ?", correct: "3/4", wrong: ["3/8", "2/4", "4/4"] },
        { q: "Which fraction is the LARGEST?", correct: "3/4", wrong: ["1/2", "1/4", "1/8"] }
      ];
      const selected = fracPairs[randInt(0, fracPairs.length - 1)];
      prompt = selected.q;
      answerStr = selected.correct;
      options = shuffle([selected.correct, ...selected.wrong]);
      hint = "When denominators are the same, just add the numerators! To compare, check which covers more of a whole circle.";
    } else {
      const fracPairs = [
        { q: "Calculate: 1/3 + 1/6 = ?", correct: "1/2", wrong: ["2/9", "3/6", "2/6"] },
        { q: "Calculate: 3/5 - 1/10 = ?", correct: "1/2", wrong: ["2/5", "2/10", "4/10"] },
        { q: "What is 2/3 of 45?", correct: "30", wrong: ["15", "25", "35"] },
        { q: "Which fraction is LARGER than 2/3?", correct: "3/4", wrong: ["1/2", "3/5", "5/8"] }
      ];
      const selected = fracPairs[randInt(0, fracPairs.length - 1)];
      prompt = selected.q;
      answerStr = selected.correct;
      options = shuffle([selected.correct, ...selected.wrong]);
      hint = "Find a common denominator before adding or comparing!";
    }

    explanation = `The correct answer is ${answerStr}.`;
    return {
      type: 'shield',
      spellName: '🛡️ AEGIS SHIELD',
      topic: 'Fractions',
      prompt,
      answer: answerStr,
      options,
      correctIndex: options.indexOf(answerStr),
      timeLimit: 14,
      hint,
      explanation
    };
  }

  // GENERATOR 3: CRITICAL STRIKE (Algebra & Equation Solving)
  function generateCriticalQuestion() {
    const bracket = aiState.ageBracket;
    const tier = aiState.difficultyTier;
    let prompt = '', x = 0, hint = '', explanation = '';

    if (bracket === 'junior') {
      // Missing number / simple 1-step linear
      x = randInt(3, 18);
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const b = randInt(5, 25);
        prompt = `Solve for x:   x + ${b} = ${x + b}`;
        hint = `Subtract ${b} from both sides to find x!`;
      } else {
        const mult = randInt(2, 6);
        prompt = `Solve for x:   ${mult}x = ${mult * x}`;
        hint = `Divide both sides by ${mult} to isolate x!`;
      }
    } else if (bracket === 'intermediate') {
      // 2-step linear equation: ax + b = c or a(x - b) = c
      x = randInt(2, 12);
      const a = randInt(2, 6);
      const b = randInt(3, 15);
      const isMinus = Math.random() > 0.5;

      if (isMinus) {
        const c = a * x - b;
        prompt = `Solve for x:   ${a}x - ${b} = ${c}`;
        hint = `Step 1: Add ${b} to both sides (${a}x = ${c + b}). Step 2: Divide by ${a}.`;
      } else {
        const c = a * x + b;
        prompt = `Solve for x:   ${a}x + ${b} = ${c}`;
        hint = `Step 1: Subtract ${b} from both sides (${a}x = ${c - b}). Step 2: Divide by ${a}.`;
      }
    } else {
      // Senior: Variables on both sides or quadratics
      x = randInt(2, 10);
      if (tier <= 3) {
        const a1 = randInt(4, 7);
        const a2 = randInt(2, a1 - 1);
        const b = randInt(2, 10);
        const c = (a1 - a2) * x - b;
        const cSign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
        prompt = `Solve for x:   ${a1}x - ${b} = ${a2}x ${cSign}`;
        hint = `Collect like terms: subtract ${a2}x from both sides, then add ${b} to isolate x!`;
      } else {
        // Simple quadratic difference of squares or factored
        const roots = [3, 4, 5, 6, 7, 8, 9];
        x = roots[randInt(0, roots.length - 1)];
        prompt = `If x > 0 and x² - ${x * x} = 0, what is x?`;
        hint = `x² = ${x * x}. Take the positive square root of ${x * x}!`;
      }
    }

    explanation = `Substituting x = ${x} balances the equation!`;
    const options = generateDistinctOptions(x);

    return {
      type: 'critical',
      spellName: '⚡ CRITICAL STRIKE',
      topic: 'Algebra',
      prompt,
      answer: x,
      options,
      correctIndex: options.indexOf(x),
      timeLimit: 15,
      hint,
      explanation
    };
  }

  // GENERATOR 4: TIME WARP / FREEZE (Sequences & Pattern Recognition)
  function generateFreezeQuestion() {
    const bracket = aiState.ageBracket;
    let seq = [], nextVal = 0, patternRule = '';

    const seqType = Math.random();
    if (seqType < 0.5) {
      // Arithmetic progression (+d)
      const start = randInt(3, 20);
      const diff = randInt(3, 9);
      seq = [start, start + diff, start + diff * 2, start + diff * 3];
      nextVal = start + diff * 4;
      patternRule = `Adding ${diff} each step.`;
    } else {
      // Geometric or square progression
      if (bracket === 'junior') {
        const factor = randInt(2, 3);
        const start = randInt(2, 4);
        seq = [start, start * factor, start * factor * factor, start * factor * factor * factor];
        nextVal = start * factor * factor * factor * factor;
        patternRule = `Multiplying by ${factor} each step.`;
      } else {
        // Squares or powers of 2
        const base = randInt(2, 5);
        seq = [base * base, (base + 1) * (base + 1), (base + 2) * (base + 2), (base + 3) * (base + 3)];
        nextVal = (base + 4) * (base + 4);
        patternRule = `Consecutive squares (${base + 4}² = ${nextVal}).`;
      }
    }

    const prompt = `What number comes next in the sequence?\n${seq.join(',  ')},  [ ? ]`;
    const options = generateDistinctOptions(nextVal);

    return {
      type: 'freeze',
      spellName: '❄️ TIME WARP',
      topic: 'Pattern Sequences',
      prompt,
      answer: nextVal,
      options,
      correctIndex: options.indexOf(nextVal),
      timeLimit: 12,
      hint: `Look at the difference or ratio between consecutive numbers to find the pattern rule!`,
      explanation: `Pattern: ${patternRule} Next is ${nextVal}.`
    };
  }

  // Helper to generate 4 distinct multiple-choice options around the answer
  function generateDistinctOptions(correctAnswer) {
    const opts = new Set([correctAnswer]);
    const isNumeric = typeof correctAnswer === 'number';

    let attempts = 0;
    while (opts.size < 4 && attempts < 30) {
      attempts++;
      if (isNumeric) {
        const offset = randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1);
        const fake = correctAnswer + offset;
        if (fake >= 0) opts.add(fake);
      } else {
        opts.add(`${correctAnswer} (Alt)`);
      }
    }

    // Safety fallback
    let fallbackOffset = 1;
    while (opts.size < 4) {
      opts.add(isNumeric ? correctAnswer + fallbackOffset : `${correctAnswer}#${fallbackOffset}`);
      fallbackOffset++;
    }

    return shuffle(Array.from(opts));
  }

  return {
    setAgeBracket,
    recordAnswer,
    generateFireballQuestion,
    generateShieldQuestion,
    generateCriticalQuestion,
    generateFreezeQuestion,
    getAiState: () => ({ ...aiState })
  };
})();

// Attach to global for browser and runtime access
const globalScopeMath = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
if (globalScopeMath) {
  globalScopeMath.MathEngine = MathEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathEngine;
}
