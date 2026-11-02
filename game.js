/**
 * GAME.JS
 * Core RPG Turn-Based Battle Controller for "Algorithm Boss Battle: Speed Math RPG"
 * Coordinates spells, turns, animations, DDA AI status, dedicated Victory/Defeat pages,
 * points breakdown, live rankings, and official TEGAS prize claim tickets.
 */

const GameApp = (() => {
  // Boss configurations
  const BOSSES = [
    {
      id: 'imp',
      name: 'VECTOR IMP',
      subtitle: 'The Glitch Sprite (ROUND 1/3)',
      maxHp: 220,
      atkMin: 10,
      atkMax: 18,
      spriteKey: 'imp',
      bgClass: 'arena-catacombs',
      introQuote: '01100010 01101111 01101111! Your calculations cannot fathom my glitch speed!',
      taunts: [
        'Vector Imp throws a pixel disruptor!',
        'Vector Imp divides your defenses by zero!',
        'Vector Imp glitches into the shadows and strikes!'
      ]
    },
    {
      id: 'golem',
      name: 'MATRIX GOLEM',
      subtitle: 'The Logic Titan (ROUND 2/3)',
      maxHp: 380,
      atkMin: 18,
      atkMax: 26,
      spriteKey: 'golem',
      bgClass: 'arena-matrix',
      introQuote: 'Calculating human defeat probability: 99.4%. Matrix logic is absolute.',
      taunts: [
        'Matrix Golem slams the ground with binary shockwaves!',
        'Matrix Golem fires a cascading emerald laser beam!',
        'Matrix Golem re-factors its stone armor and smashes!'
      ]
    },
    {
      id: 'dragon',
      name: 'DERIVATIVE DRAGON',
      subtitle: 'Calculus Overlord (FINAL BOSS - ROUND 3/3)',
      maxHp: 540,
      atkMin: 24,
      atkMax: 35,
      spriteKey: 'dragon',
      bgClass: 'arena-singularity',
      introQuote: 'I am the limit as x approaches infinity! No mere student shall claim the Prize Vault!',
      taunts: [
        'Derivative Dragon exhales a blast of Mathematical Plasma!',
        'Derivative Dragon curves spacetime with infinite asymptotes!',
        'Derivative Dragon summons a storm of flaming algebraic matrices!'
      ]
    }
  ];

  // Game state
  let state = {
    playerName: 'Cyber Mage',
    schoolName: 'TEGAS Challenger',
    playerContact: '',
    ageBracket: 'intermediate',
    currentBossIdx: 0,
    playerHp: 100,
    playerMaxHp: 100,
    playerShield: 0,
    bossHp: 220,
    bossMaxHp: 220,
    isFrozen: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    startTime: null,
    isTurnLocked: false,
    currentQuestion: null,
    timerInterval: null,
    timeRemaining: 0,
    allocatedTime: 10,
    ticketId: ''
  };

  // DOM Elements cache
  let dom = {};

  function init() {
    cacheDom();
    bindEvents();
    renderInitialSprites();
    loadHallOfFame();
    initDialogFallbacks();

    // Automatically prompt Challenger Setup on launch
    if (dom.startModal && typeof dom.startModal.showModal === 'function') {
      try {
        dom.startModal.showModal();
      } catch (err) {
        startGame();
      }
    } else {
      startGame();
    }
  }

  function cacheDom() {
    dom = {
      // Screens & Dedicated Views
      viewBattle: document.getElementById('view-battle'),
      viewVictory: document.getElementById('view-victory'),
      viewDefeat: document.getElementById('view-defeat'),

      // Modals
      startModal: document.getElementById('start-modal'),
      questionModal: document.getElementById('question-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      rulesModal: document.getElementById('rules-modal'),

      // Battle Arena & Characters
      battleContainer: document.getElementById('battle-screen'),
      arenaStage: document.getElementById('arena-stage'),
      heroSprite: document.getElementById('hero-sprite'),
      bossSprite: document.getElementById('boss-sprite'),
      heroName: document.getElementById('hero-name'),
      heroGradeTag: document.getElementById('hero-grade-tag'),
      heroHpBar: document.getElementById('hero-hp-bar'),
      heroHpText: document.getElementById('hero-hp-text'),
      heroShieldBadge: document.getElementById('hero-shield-badge'),
      bossHpBar: document.getElementById('boss-hp-bar'),
      bossHpText: document.getElementById('boss-hp-text'),
      bossName: document.getElementById('boss-name'),
      bossSubtitle: document.getElementById('boss-subtitle'),
      combatLog: document.getElementById('combat-log-text'),
      turnIndicator: document.getElementById('turn-indicator'),

      // HUD & DDA AI
      scoreDisplay: document.getElementById('score-val'),
      comboDisplay: document.getElementById('combo-val'),
      ddaTierDisplay: document.getElementById('dda-tier-val'),
      aiMessageBar: document.getElementById('ai-message-text'),

      // Question Elements
      qSpellBadge: document.getElementById('q-spell-badge'),
      qTopicBadge: document.getElementById('q-topic-badge'),
      qTimerBar: document.getElementById('q-timer-bar'),
      qTimerText: document.getElementById('q-timer-text'),
      qPrompt: document.getElementById('q-prompt'),
      qOptionsGrid: document.getElementById('q-options-grid'),
      qHintBox: document.getElementById('q-hint-box'),
      qHintText: document.getElementById('q-hint-text'),

      // Spells
      spellFireball: document.getElementById('spell-fireball'),
      spellShield: document.getElementById('spell-shield'),
      spellCritical: document.getElementById('spell-critical'),
      spellFreeze: document.getElementById('spell-freeze'),

      // Floating VFX Container
      vfxContainer: document.getElementById('vfx-container'),

      // Audio & Modals
      btnMute: document.getElementById('btn-mute'),
      btnBgm: document.getElementById('btn-bgm'),
      btnHelp: document.getElementById('btn-help'),
      btnHof: document.getElementById('btn-hof')
    };
  }

  // VIEW TRANSITIONS WITH ACCESSIBILITY ROUTING (Same Document Transitions API)
  function switchView(targetViewId) {
    const views = ['view-battle', 'view-victory', 'view-defeat'];

    const updateDOM = () => {
      views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (id === targetViewId) {
            el.style.display = 'block';
            el.classList.add('active-view');
          } else {
            el.style.display = 'none';
            el.classList.remove('active-view');
          }
        }
      });
    };

    if (!document.startViewTransition) {
      updateDOM();
      routeAccessibilityFocus(targetViewId);
      return;
    }

    const transition = document.startViewTransition(() => {
      updateDOM();
    });

    transition.finished.finally(() => {
      routeAccessibilityFocus(targetViewId);
    });
  }

  function routeAccessibilityFocus(viewId) {
    if (viewId === 'view-victory') {
      document.getElementById('victory-heading')?.focus();
    } else if (viewId === 'view-defeat') {
      document.getElementById('defeat-heading')?.focus();
    } else if (viewId === 'view-battle') {
      dom.heroName?.focus();
    }
  }

  function renderInitialSprites() {
    if (dom.heroSprite && window.SvgAssets) {
      dom.heroSprite.innerHTML = window.SvgAssets.getHeroSprite('idle', 5);
    }
    updateBossDisplay();

    if (window.SvgAssets) {
      const fbIcon = document.getElementById('icon-fireball');
      const shIcon = document.getElementById('icon-shield');
      const crIcon = document.getElementById('icon-critical');
      const frIcon = document.getElementById('icon-freeze');
      if (fbIcon) fbIcon.innerHTML = window.SvgAssets.getFireballSvg(28);
      if (shIcon) shIcon.innerHTML = window.SvgAssets.getShieldSvg(28);
      if (crIcon) crIcon.innerHTML = window.SvgAssets.getLightningSvg(28);
      if (frIcon) frIcon.innerHTML = window.SvgAssets.getFreezeSvg(28);
    }
  }

  function bindEvents() {
    // Start form
    const startForm = document.getElementById('start-form');
    if (startForm) {
      startForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const heroNameInput = document.getElementById('input-hero-name').value.trim();
        const bracketSelect = document.getElementById('select-grade').value;
        state.playerName = heroNameInput || 'Cyber Mage';
        state.ageBracket = bracketSelect;
        window.MathEngine.setAgeBracket(bracketSelect);

        dom.startModal.close();
        startGame();
      });
    }

    if (dom.startModal) {
      dom.startModal.addEventListener('close', () => {
        if (!state.startTime) {
          startGame();
        }
      });
    }

    // Spell Buttons
    dom.spellFireball.addEventListener('click', () => handleSelectSpell('fireball'));
    dom.spellShield.addEventListener('click', () => handleSelectSpell('shield'));
    dom.spellCritical.addEventListener('click', () => handleSelectSpell('critical'));
    dom.spellFreeze.addEventListener('click', () => handleSelectSpell('freeze'));

    // Audio controls
    dom.btnMute.addEventListener('click', () => {
      const isMuted = window.SoundEngine.toggleMute();
      dom.btnMute.textContent = isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
      dom.btnMute.classList.toggle('active', !isMuted);
    });

    dom.btnBgm.addEventListener('click', () => {
      if (dom.btnBgm.dataset.active === 'true') {
        window.SoundEngine.stopBgm();
        dom.btnBgm.dataset.active = 'false';
        dom.btnBgm.textContent = '🎵 BGM OFF';
        dom.btnBgm.classList.remove('active');
      } else {
        window.SoundEngine.startBgm();
        dom.btnBgm.dataset.active = 'true';
        dom.btnBgm.textContent = '🎶 BGM ON';
        dom.btnBgm.classList.add('active');
      }
    });

    // Modals
    dom.btnHelp.addEventListener('click', () => {
      window.SoundEngine.playBlip();
      dom.rulesModal.showModal();
    });

    dom.btnHof.addEventListener('click', () => {
      window.SoundEngine.playBlip();
      renderHallOfFameTable('hof-table-body');
      dom.leaderboardModal.showModal();
    });

    // Close buttons for native dialogs
    document.querySelectorAll('.btn-close-dialog').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SoundEngine.playBlip();
        const dialog = btn.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    // Victory Page Actions
    const btnVicPlayAgain = document.getElementById('btn-vic-play-again');
    if (btnVicPlayAgain) {
      btnVicPlayAgain.addEventListener('click', () => {
        window.SoundEngine.playBlip();
        startGame();
      });
    }

    // Defeat Page Actions
    const btnDefRetry = document.getElementById('btn-def-retry');
    if (btnDefRetry) {
      btnDefRetry.addEventListener('click', () => {
        window.SoundEngine.playBlip();
        startGame();
      });
    }

    const btnDefChangeGrade = document.getElementById('btn-def-change-grade');
    if (btnDefChangeGrade) {
      btnDefChangeGrade.addEventListener('click', () => {
        window.SoundEngine.playBlip();
        dom.startModal.showModal();
      });
    }

    // Prize Claim Form
    const claimForm = document.getElementById('claim-form');
    if (claimForm) {
      claimForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitPrizeClaim();
      });
    }

    // Print Voucher Button
    const btnPrint = document.getElementById('btn-print-voucher');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Fallback for browsers without native <dialog closedby="any"> support
  function initDialogFallbacks() {
    document.querySelectorAll('dialog[closedby="any"]').forEach(dialog => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (isDialogContent) return;
          dialog.close();
        });
      }
    });
  }

  function startGame() {
    state.currentBossIdx = 0;
    state.playerHp = state.playerMaxHp;
    state.playerShield = 0;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.correctAnswers = 0;
    state.totalAnswers = 0;
    state.isTurnLocked = false;
    state.startTime = Date.now();
    state.ticketId = generateClaimToken();

    // Reset Hero name display
    if (dom.heroName) dom.heroName.textContent = state.playerName.toUpperCase();
    if (dom.heroGradeTag) {
      const gradeLabels = {
        junior: 'Junior Apprentice (Ages 9-12)',
        intermediate: 'Intermediate Mage (Ages 13-15)',
        senior: 'Master Arithmancer (Ages 16-18+)'
      };
      dom.heroGradeTag.textContent = gradeLabels[state.ageBracket] || 'Math Challenger';
    }

    updatePlayerStats();
    loadBoss(0);
    switchView('view-battle');
    logMessage(`⚔️ BATTLE START! ${state.playerName} enters the arena against ${BOSSES[0].name}!`);
    window.SoundEngine.playBlip();

    if (dom.startModal.open) dom.startModal.close();
  }

  function loadBoss(idx) {
    state.currentBossIdx = idx;
    const boss = BOSSES[idx];
    state.bossMaxHp = boss.maxHp;
    state.bossHp = boss.maxHp;
    state.isFrozen = false;

    // Arena styling
    dom.arenaStage.className = `arena-stage ${boss.bgClass}`;
    updateBossDisplay();
    logMessage(`⚡ A formidable foe emerges: [${boss.name}] - "${boss.introQuote}"`);
  }

  function updateBossDisplay() {
    const boss = BOSSES[state.currentBossIdx];
    dom.bossName.textContent = boss.name;
    dom.bossSubtitle.textContent = boss.subtitle;

    // Sprite
    if (window.SvgAssets) {
      if (boss.spriteKey === 'imp') {
        dom.bossSprite.innerHTML = window.SvgAssets.getImpSprite(6);
      } else if (boss.spriteKey === 'golem') {
        dom.bossSprite.innerHTML = window.SvgAssets.getGolemSprite(6);
      } else {
        dom.bossSprite.innerHTML = window.SvgAssets.getDragonSprite(6);
      }
    }

    const pct = Math.max(0, Math.round((state.bossHp / state.bossMaxHp) * 100));
    dom.bossHpBar.style.width = `${pct}%`;
    dom.bossHpText.textContent = `${state.bossHp} / ${state.bossMaxHp} HP`;
  }

  function updatePlayerStats() {
    const pct = Math.max(0, Math.round((state.playerHp / state.playerMaxHp) * 100));
    dom.heroHpBar.style.width = `${pct}%`;
    dom.heroHpText.textContent = `${state.playerHp} / ${state.playerMaxHp} HP`;

    if (state.playerShield > 0) {
      dom.heroShieldBadge.style.display = 'inline-flex';
      dom.heroShieldBadge.textContent = `🛡️ SHIELD: +${state.playerShield}`;
    } else {
      dom.heroShieldBadge.style.display = 'none';
    }

    dom.scoreDisplay.textContent = state.score.toLocaleString();
    dom.comboDisplay.textContent = `${state.combo}x`;
    if (state.combo >= 3) {
      dom.comboDisplay.classList.add('fire-combo');
    } else {
      dom.comboDisplay.classList.remove('fire-combo');
    }

    const dda = window.MathEngine.getAiState();
    dom.ddaTierDisplay.textContent = `T${dda.difficultyTier}`;
    dom.aiMessageBar.textContent = dda.aiMessage;
  }

  function logMessage(msg) {
    if (dom.combatLog) {
      dom.combatLog.innerHTML = `<span class="log-prefix">&gt;</span> ${msg}`;
    }
  }

  // SPELL SELECTION & QUESTION TRIGGER
  function handleSelectSpell(spellType) {
    if (state.isTurnLocked) return;
    window.SoundEngine.playBlip();

    let question = null;
    if (spellType === 'fireball') {
      question = window.MathEngine.generateFireballQuestion();
    } else if (spellType === 'shield') {
      question = window.MathEngine.generateShieldQuestion();
    } else if (spellType === 'critical') {
      question = window.MathEngine.generateCriticalQuestion();
    } else if (spellType === 'freeze') {
      question = window.MathEngine.generateFreezeQuestion();
    }

    if (!question) return;
    state.currentQuestion = question;
    openQuestionModal(question);
  }

  function openQuestionModal(q) {
    state.isTurnLocked = true;
    dom.qSpellBadge.textContent = q.spellName;
    dom.qTopicBadge.textContent = `TOPIC: ${q.topic.toUpperCase()}`;
    dom.qPrompt.textContent = q.prompt;

    dom.qHintBox.style.display = 'none';
    dom.qHintText.textContent = q.hint;

    dom.qOptionsGrid.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-option-choice';
      btn.innerHTML = `<span class="opt-key">[${['A', 'B', 'C', 'D'][idx]}]</span> <span class="opt-text">${opt}</span>`;
      btn.addEventListener('click', () => handleOptionChosen(idx));
      dom.qOptionsGrid.appendChild(btn);
    });

    state.allocatedTime = q.timeLimit;
    state.timeRemaining = q.timeLimit;
    updateTimerDisplay();

    if (state.timerInterval) clearInterval(state.timerInterval);
    const startTime = Date.now();

    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      state.timeRemaining = Math.max(0, state.allocatedTime - elapsed);
      updateTimerDisplay();

      if (state.timeRemaining < state.allocatedTime * 0.35) {
        dom.qHintBox.style.display = 'block';
      }

      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        handleTimeOut();
      }
    }, 100);

    dom.questionModal.showModal();
  }

  function updateTimerDisplay() {
    const pct = (state.timeRemaining / state.allocatedTime) * 100;
    dom.qTimerBar.style.width = `${pct}%`;
    dom.qTimerText.textContent = `${Math.ceil(state.timeRemaining)}s`;

    if (pct < 30) {
      dom.qTimerBar.classList.add('urgent');
    } else {
      dom.qTimerBar.classList.remove('urgent');
    }
  }

  function handleOptionChosen(chosenIndex) {
    if (!state.currentQuestion) return;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    const q = state.currentQuestion;
    const timeTaken = Math.max(0.5, state.allocatedTime - state.timeRemaining);
    const isCorrect = (chosenIndex === q.correctIndex);
    state.totalAnswers++;

    const buttons = dom.qOptionsGrid.querySelectorAll('.btn-option-choice');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === chosenIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    setTimeout(() => {
      dom.questionModal.close();
      resolveTurnOutcome(isCorrect, timeTaken, q);
    }, 900);
  }

  function handleTimeOut() {
    const q = state.currentQuestion;
    state.totalAnswers++;

    const buttons = dom.qOptionsGrid.querySelectorAll('.btn-option-choice');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) btn.classList.add('correct');
    });

    logMessage(`⏳ TIME OUT on ${q.spellName}! The math spell dissipated!`);
    window.SoundEngine.playWrong();

    setTimeout(() => {
      dom.questionModal.close();
      resolveTurnOutcome(false, state.allocatedTime, q);
    }, 1200);
  }

  // RESOLVE PLAYER ACTION & ENEMY REACTION
  function resolveTurnOutcome(isCorrect, timeTaken, q) {
    const ddaResult = window.MathEngine.recordAnswer(isCorrect, timeTaken, state.allocatedTime);

    if (isCorrect) {
      state.correctAnswers++;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      const comboMult = 1 + (state.combo - 1) * 0.25;
      const speedBonus = timeTaken < 3.5 ? 1.3 : 1.0;
      let damage = 0;

      if (window.SvgAssets) dom.heroSprite.innerHTML = window.SvgAssets.getHeroSprite('cast', 5);

      if (q.type === 'fireball') {
        window.SoundEngine.playFireball();
        spawnVfx('fireball');
        damage = Math.round((65 + Math.random() * 20) * comboMult * speedBonus);
        applyBossDamage(damage, 'FIRE DAMAGE');
      } else if (q.type === 'shield') {
        window.SoundEngine.playShield();
        spawnVfx('shield');
        const heal = 25;
        const shieldGain = 30;
        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + heal);
        state.playerShield += shieldGain;
        showFloatingText(dom.heroSprite, `+${heal} HP / +${shieldGain} SHIELD!`, '#06b6d4');
        logMessage(`🛡️ AEGIS BARRIER! Restored ${heal} HP and gained ${shieldGain} Shield Points!`);
      } else if (q.type === 'critical') {
        window.SoundEngine.playLightning();
        spawnVfx('lightning');
        damage = Math.round((110 + Math.random() * 30) * comboMult * speedBonus);
        applyBossDamage(damage, 'CRITICAL ALGEBRA STRIKE');
      } else if (q.type === 'freeze') {
        window.SoundEngine.playCorrect();
        spawnVfx('freeze');
        damage = Math.round(45 * comboMult);
        state.isFrozen = true;
        applyBossDamage(damage, 'TIME WARP CHILL');
        logMessage(`❄️ TIME WARP! The boss's circuits are frozen for 1 turn!`);
      }

      const points = Math.round((damage > 0 ? damage : 50) * 10 * ddaResult.tier * comboMult);
      state.score += points;
      updatePlayerStats();

      setTimeout(() => {
        if (window.SvgAssets) dom.heroSprite.innerHTML = window.SvgAssets.getHeroSprite('idle', 5);
      }, 400);

    } else {
      state.combo = 0;
      window.SoundEngine.playWrong();
      logMessage(`❌ MISFIRE: Incorrect! [${q.explanation}]`);
      updatePlayerStats();
    }

    setTimeout(() => {
      if (state.bossHp <= 0) {
        handleBossDefeated();
      } else {
        bossActionTurn();
      }
    }, 1000);
  }

  function applyBossDamage(damage, attackName) {
    state.bossHp = Math.max(0, state.bossHp - damage);
    updateBossDisplay();

    window.SoundEngine.playHit();
    screenShake();
    dom.bossSprite.classList.add('hurt');
    setTimeout(() => dom.bossSprite.classList.remove('hurt'), 400);

    const isCrit = damage > 90;
    showFloatingText(dom.bossSprite, `-${damage} ${isCrit ? 'CRITICAL!' : ''}`, isCrit ? '#facc15' : '#ef4444');
    logMessage(`💥 ${attackName}! Dealt ${damage} damage to ${BOSSES[state.currentBossIdx].name}!`);
  }

  // BOSS ENEMY ATTACK TURN
  function bossActionTurn() {
    if (state.isFrozen) {
      logMessage(`❄️ ${BOSSES[state.currentBossIdx].name} is frozen and skips their counterattack!`);
      state.isFrozen = false;
      state.isTurnLocked = false;
      return;
    }

    const boss = BOSSES[state.currentBossIdx];
    const rawDamage = Math.floor(Math.random() * (boss.atkMax - boss.atkMin + 1)) + boss.atkMin;
    const randomTaunt = boss.taunts[Math.floor(Math.random() * boss.taunts.length)];

    logMessage(`⚠️ ENEMY TURN: ${randomTaunt}`);

    dom.bossSprite.classList.add('attack-lunge');
    setTimeout(() => {
      dom.bossSprite.classList.remove('attack-lunge');
      window.SoundEngine.playHit();
      screenShake();

      let remainingDamage = rawDamage;
      if (state.playerShield > 0) {
        if (state.playerShield >= remainingDamage) {
          state.playerShield -= remainingDamage;
          remainingDamage = 0;
          showFloatingText(dom.heroSprite, `SHIELD BLOCKED!`, '#38bdf8');
          logMessage(`🛡️ Your Aegis Shield absorbed the full ${rawDamage} damage!`);
        } else {
          remainingDamage -= state.playerShield;
          state.playerShield = 0;
          showFloatingText(dom.heroSprite, `SHIELD BROKEN! -${remainingDamage} HP`, '#f97316');
          logMessage(`🛡️ Shield absorbed part of the blow! Took ${remainingDamage} remaining damage!`);
        }
      }

      if (remainingDamage > 0) {
        state.playerHp = Math.max(0, state.playerHp - remainingDamage);
        dom.heroSprite.classList.add('hurt');
        setTimeout(() => dom.heroSprite.classList.remove('hurt'), 400);
        showFloatingText(dom.heroSprite, `-${remainingDamage} HP`, '#ef4444');
      }

      updatePlayerStats();

      if (state.playerHp <= 0) {
        showDefeatPage();
      } else {
        state.isTurnLocked = false;
      }
    }, 600);
  }

  function handleBossDefeated() {
    const currentBoss = BOSSES[state.currentBossIdx];
    logMessage(`🏆 VICTORY! You have vanquished ${currentBoss.name}!`);
    window.SoundEngine.playVictory();

    dom.bossSprite.classList.add('defeated');

    setTimeout(() => {
      dom.bossSprite.classList.remove('defeated');

      if (state.currentBossIdx < BOSSES.length - 1) {
        state.currentBossIdx++;
        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 45);
        state.playerShield += 15;
        updatePlayerStats();
        loadBoss(state.currentBossIdx);
        state.isTurnLocked = false;
      } else {
        // FINAL BOSS OVERTHROWN: TRANSITION TO DEDICATED VICTORY PAGE!
        showVictoryPage();
      }
    }, 1500);
  }

  // DYNAMIC RANK COMPUTATION
  function computeRank(score) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('tegas_math_hof')) || [];
    } catch (e) {
      list = [];
    }
    const allScores = list.map(item => item.score).sort((a, b) => b - a);
    let rank = 1;
    for (let i = 0; i < allScores.length; i++) {
      if (score >= allScores[i]) {
        rank = i + 1;
        break;
      }
      rank = allScores.length + 1;
    }

    let badge = `#${rank}`;
    let desc = 'CONTENDER';
    if (rank === 1) {
      badge = '🥇 RANK #1';
      desc = 'S-TIER GRANDMASTER';
    } else if (rank === 2) {
      badge = '🥈 RANK #2';
      desc = 'HIGH ARITHMANCER';
    } else if (rank === 3) {
      badge = '🥉 RANK #3';
      desc = 'MATH KNIGHT';
    } else if (rank <= 5) {
      badge = `🎖️ RANK #${rank}`;
      desc = 'CYBER SCHOLAR (TOP 20%)';
    } else {
      badge = `🏅 RANK #${rank}`;
      desc = 'APPRENTICE CONTENDER';
    }

    return { rank, badge, desc };
  }

  // =========================================================================
  // DEDICATED FULL-PAGE VICTORY SCREEN
  // =========================================================================
  function showVictoryPage() {
    state.isTurnLocked = true;
    window.SoundEngine.playVictory();

    const dda = window.MathEngine.getAiState();
    const acc = state.totalAnswers > 0 ? Math.round((state.correctAnswers / state.totalAnswers) * 100) : 100;
    const basePts = Math.round(state.score * 0.7);
    const speedBonus = state.score - basePts;
    const rankInfo = computeRank(state.score);

    // Populate Score Breakdown
    document.getElementById('vic-total-score').textContent = state.score.toLocaleString();
    document.getElementById('vic-base-pts').textContent = basePts.toLocaleString();
    document.getElementById('vic-speed-bonus').textContent = `+${speedBonus.toLocaleString()}`;
    document.getElementById('vic-max-combo').textContent = `${state.maxCombo}x`;
    document.getElementById('vic-accuracy').textContent = `${acc}%`;
    document.getElementById('vic-tier-badge').textContent = `TIER ${dda.difficultyTier} (${dda.difficultyTier >= 4 ? 'OVERDRIVE' : 'ADVANCED'})`;

    // Populate Rank Info
    document.getElementById('vic-rank-badge').textContent = rankInfo.badge;
    document.getElementById('vic-rank-desc').textContent = rankInfo.desc;

    // Prefill Claim Form & Ticket
    document.getElementById('claim-student-name').value = state.playerName;
    document.getElementById('claim-school-name').value = state.schoolName;

    generateVoucherPreview();

    // Auto-save this run to Hall of Fame
    saveToHallOfFame({
      ticketId: state.ticketId,
      name: state.playerName,
      school: state.schoolName,
      score: state.score,
      maxCombo: state.maxCombo,
      bracket: state.ageBracket,
      date: new Date().toLocaleDateString()
    });

    // Render live leaderboard right on the victory page, with current player highlighted
    renderHallOfFameTable('vic-hof-table-body', state.score);

    // Transition to Victory View
    switchView('view-victory');
  }

  // =========================================================================
  // DEDICATED FULL-PAGE DEFEAT SCREEN
  // =========================================================================
  function showDefeatPage() {
    state.isTurnLocked = true;
    window.SoundEngine.playWrong();

    const currentBoss = BOSSES[state.currentBossIdx];
    const dda = window.MathEngine.getAiState();
    const acc = state.totalAnswers > 0 ? Math.round((state.correctAnswers / state.totalAnswers) * 100) : 0;
    const rankInfo = computeRank(state.score);

    // Header & Subtitle
    document.getElementById('defeat-stage-badge').textContent = `FELL AT ${currentBoss.subtitle}`;
    document.getElementById('defeat-subtitle').textContent = `Vanquished by ${currentBoss.name} with ${state.score.toLocaleString()} points. Analyze the AI Coach Diagnostic below and strike back!`;

    // Score & Performance
    document.getElementById('def-total-score').textContent = state.score.toLocaleString();
    document.getElementById('def-rounds-cleared').textContent = `${state.currentBossIdx} / 3`;
    document.getElementById('def-max-combo').textContent = `${state.maxCombo}x`;
    document.getElementById('def-accuracy').textContent = `${acc}%`;
    document.getElementById('def-avg-time').textContent = `${dda.avgResponseTime || 4.2}s`;
    document.getElementById('def-tier-badge').textContent = `TIER ${dda.difficultyTier}`;

    // Rank Callout
    document.getElementById('def-rank-callout').textContent = rankInfo.badge;
    document.getElementById('def-rank-desc').textContent = rankInfo.desc;

    // Tailored AI Coach Strategy
    let coachMsg = '';
    if (state.currentBossIdx === 0) {
      coachMsg = `Vector Imp capitalized on mental arithmetic speed! Tip: Practice 3-step arithmetic with parentheses (BODMAS/PEMDAS) and answer within 5 seconds to unlock Rapid Cognition burst damage!`;
    } else if (state.currentBossIdx === 1) {
      coachMsg = `Matrix Golem delivers heavy binary shockwaves! Tip: When you see prime numbers or percentage questions, cast Aegis Shield! It heals 25 HP and absorbs up to 30 damage, saving you from defeat.`;
    } else {
      coachMsg = `The Derivative Dragon curves spacetime! Tip: Focus on isolating x in linear equations and identifying pattern sequence limits. Use Time Warp to freeze its counterattacks!`;
    }
    document.getElementById('def-coach-advice').textContent = coachMsg;

    // Save score to Hall of Fame if greater than 0
    if (state.score > 0) {
      saveToHallOfFame({
        ticketId: state.ticketId,
        name: state.playerName,
        school: state.schoolName,
        score: state.score,
        maxCombo: state.maxCombo,
        bracket: state.ageBracket,
        date: new Date().toLocaleDateString()
      });
    }

    // Render live leaderboard on defeat page
    renderHallOfFameTable('def-hof-table-body', state.score);

    // Transition to Defeat View
    switchView('view-defeat');
  }

  // TICKET & VOUCHER GENERATION
  function generateVoucherPreview() {
    if (!state.ticketId) state.ticketId = generateClaimToken();
    const studentName = document.getElementById('claim-student-name')?.value || state.playerName;
    const school = document.getElementById('claim-school-name')?.value || state.schoolName || 'TEGAS Challenger';
    const acc = state.totalAnswers > 0 ? Math.round((state.correctAnswers / state.totalAnswers) * 100) : 100;

    document.getElementById('ticket-code-val').textContent = state.ticketId;
    document.getElementById('ticket-name-val').textContent = studentName;
    document.getElementById('ticket-school-val').textContent = school;
    document.getElementById('ticket-score-val').textContent = state.score.toLocaleString();
    document.getElementById('ticket-combo-val').textContent = `${state.maxCombo}x`;
    document.getElementById('ticket-accuracy-val').textContent = `${acc}%`;
    document.getElementById('ticket-tier-val').textContent = state.ageBracket.toUpperCase();
    document.getElementById('ticket-date-val').textContent = new Date().toLocaleDateString();

    const qrContainer = document.getElementById('ticket-qr-container');
    if (qrContainer && window.SvgAssets) {
      const qrPayload = `https://tegas.org.my/verify?ticket=${state.ticketId}&student=${encodeURIComponent(studentName)}&score=${state.score}`;
      qrContainer.innerHTML = window.SvgAssets.generateTicketQrSvg(qrPayload, 140);
    }
  }

  function generateClaimToken() {
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    return `TEGAS-AI-${state.ageBracket.substring(0, 3).toUpperCase()}-${randomHex}`;
  }

  function submitPrizeClaim() {
    const studentName = document.getElementById('claim-student-name').value.trim() || state.playerName;
    const school = document.getElementById('claim-school-name').value.trim() || 'TEGAS Digital Hub';
    state.playerName = studentName;
    state.schoolName = school;

    generateVoucherPreview();

    saveToHallOfFame({
      ticketId: state.ticketId,
      name: studentName,
      school,
      score: state.score,
      maxCombo: state.maxCombo,
      bracket: state.ageBracket,
      date: new Date().toLocaleDateString()
    });

    renderHallOfFameTable('vic-hof-table-body', state.score);
    alert(`🎉 Congratulations ${studentName}!\nYour prize voucher [${state.ticketId}] has been registered and verified on the official Leaderboard! Present this pass to TEGAS staff to claim your prize!`);
  }

  // HALL OF FAME LEADERBOARD MANAGEMENT
  function loadHallOfFame() {
    const defaultScores = [
      { ticketId: 'TEGAS-AI-INT-A89F21', name: 'Ahmad Faiz', school: 'SMK Petra Jaya', score: 14200, maxCombo: 9, bracket: 'intermediate', date: '2026-10-18' },
      { ticketId: 'TEGAS-AI-SEN-B41C90', name: 'Grace Tan', school: 'SMK Lodge', score: 12850, maxCombo: 7, bracket: 'senior', date: '2026-10-19' },
      { ticketId: 'TEGAS-AI-JUN-E55D12', name: 'Dayang Nurul', school: 'SK Abang Ali', score: 11400, maxCombo: 8, bracket: 'junior', date: '2026-10-20' },
      { ticketId: 'TEGAS-AI-INT-99B411', name: 'Alvin Lee', school: 'Kolej Vokasional Kuching', score: 9800, maxCombo: 5, bracket: 'intermediate', date: '2026-10-21' }
    ];

    const stored = localStorage.getItem('tegas_math_hof');
    if (!stored) {
      localStorage.setItem('tegas_math_hof', JSON.stringify(defaultScores));
    }
  }

  function saveToHallOfFame(entry) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('tegas_math_hof')) || [];
    } catch (e) {
      list = [];
    }

    // Check if this ticket already saved, update instead of duplicating
    const existingIdx = list.findIndex(item => item.ticketId === entry.ticketId);
    if (existingIdx !== -1) {
      list[existingIdx] = entry;
    } else {
      list.push(entry);
    }

    list.sort((a, b) => b.score - a.score);
    if (list.length > 25) list = list.slice(0, 25);
    localStorage.setItem('tegas_math_hof', JSON.stringify(list));
  }

  function renderHallOfFameTable(targetTbodyId = 'hof-table-body', highlightScore = null) {
    const tableBody = document.getElementById(targetTbodyId);
    if (!tableBody) return;

    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('tegas_math_hof')) || [];
    } catch (e) {
      list = [];
    }

    tableBody.innerHTML = '';
    list.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const isCurrentPlayer = (highlightScore !== null && entry.score === highlightScore && entry.name === state.playerName);
      if (isCurrentPlayer) tr.className = 'current-player-row';

      const rankBadge = idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`;
      tr.innerHTML = `
        <td class="hof-rank">${rankBadge}</td>
        <td class="hof-name"><strong>${entry.name}</strong><br><small class="text-muted">${entry.school}</small></td>
        <td class="hof-tier"><span class="badge-tag">${entry.bracket.toUpperCase()}</span></td>
        <td class="hof-combo">${entry.maxCombo}x</td>
        <td class="hof-score"><strong>${entry.score.toLocaleString()}</strong></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // VISUAL JUICE: FLOATING NUMBERS, SHAKE, VFX
  function showFloatingText(targetEl, text, color = '#ffffff') {
    const rect = targetEl.getBoundingClientRect();
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-damage-number';
    floatEl.style.left = `${rect.left + rect.width / 2}px`;
    floatEl.style.top = `${rect.top + 20}px`;
    floatEl.style.color = color;
    floatEl.textContent = text;
    document.body.appendChild(floatEl);

    setTimeout(() => {
      if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
    }, 1200);
  }

  function screenShake() {
    dom.battleContainer.classList.add('screen-shake');
    setTimeout(() => dom.battleContainer.classList.remove('screen-shake'), 300);
  }

  function spawnVfx(spellType) {
    if (!dom.vfxContainer || !window.SvgAssets) return;
    const vfxEl = document.createElement('div');
    vfxEl.className = `spell-vfx vfx-${spellType}`;

    if (spellType === 'fireball') {
      vfxEl.innerHTML = window.SvgAssets.getFireballSvg(72);
    } else if (spellType === 'shield') {
      vfxEl.innerHTML = window.SvgAssets.getShieldSvg(72);
    } else if (spellType === 'lightning') {
      vfxEl.innerHTML = window.SvgAssets.getLightningSvg(80);
    } else if (spellType === 'freeze') {
      vfxEl.innerHTML = window.SvgAssets.getFreezeSvg(72);
    }

    dom.vfxContainer.appendChild(vfxEl);
    setTimeout(() => {
      if (vfxEl.parentNode) vfxEl.parentNode.removeChild(vfxEl);
    }, 600);
  }

  return {
    init,
    showVictoryPage,
    showDefeatPage,
    startGame,
    generateVoucherPreview
  };
})();

// Attach to global for browser and runtime access
const globalScopeGame = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
if (globalScopeGame) {
  globalScopeGame.GameApp = GameApp;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameApp;
}

// Initialize on DOMContentLoaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    GameApp.init();
  });
}
