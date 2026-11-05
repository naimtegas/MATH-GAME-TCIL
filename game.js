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

  // Cyber Relics Catalog (Rogue-lite Run Modifiers)
  const RELICS = {
    nanite_edge: {
      id: 'nanite_edge',
      name: 'Nanite Edge',
      desc: '+35% bonus spell damage when solving under 3.5 seconds!'
    },
    kinetic_barrier: {
      id: 'kinetic_barrier',
      name: 'Kinetic Barrier',
      desc: 'Start every boss battle with +50 Shield Points!'
    },
    overclock_coil: {
      id: 'overclock_coil',
      name: 'Overclock Coil',
      desc: 'QTE sweet spot is 60% wider & Mega-Crit deals +50% extra damage!'
    },
    vampiric_equations: {
      id: 'vampiric_equations',
      name: 'Vampiric Equations',
      desc: 'Every correct calculation drains boss energy and heals you for +15 HP!'
    },
    chronos_shard: {
      id: 'chronos_shard',
      name: 'Chronos Shard',
      desc: 'Freezes question timer completely for the first 3 seconds!'
    }
  };

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
    ticketId: '',
    isHypercharge: false,
    isEnraged: false,
    isMegaCrit: false,
    relics: [],
    bossCharging: false,
    bossChargeRemaining: 0,
    bossChargeMax: 5.0,
    bossChargeInterval: null,
    qteActive: false,
    qtePos: 0,
    onQteHit: null
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
      viewCastle: document.getElementById('view-castle'),
      viewBattle: document.getElementById('view-battle'),
      viewVictory: document.getElementById('view-victory'),
      viewDefeat: document.getElementById('view-defeat'),

      // Castle Exploration HUD & Controls
      castleCanvas: document.getElementById('castle-canvas'),
      castlePlayerName: document.getElementById('castle-player-name'),
      castleHpBar: document.getElementById('castle-hp-bar'),
      castleHpText: document.getElementById('castle-hp-text'),
      castleCoinsVal: document.getElementById('castle-coins-val'),
      castleWingTag: document.getElementById('castle-wing-tag'),
      castleActionPrompt: document.getElementById('castle-action-prompt'),
      dpadUp: document.getElementById('dpad-up'),
      dpadDown: document.getElementById('dpad-down'),
      dpadLeft: document.getElementById('dpad-left'),
      dpadRight: document.getElementById('dpad-right'),
      dpadAction: document.getElementById('dpad-action'),

      // Modals
      startModal: document.getElementById('start-modal'),
      questionModal: document.getElementById('question-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      rulesModal: document.getElementById('rules-modal'),

      // Battle Arena & Characters
      battleContainer: document.getElementById('battle-screen'),
      arenaStage: document.getElementById('arena-stage'),
      hyperchargeBanner: document.getElementById('hypercharge-banner'),
      bossEnrageBanner: document.getElementById('boss-enrage-banner'),
      heroSprite: document.getElementById('hero-sprite'),
      bossSprite: document.getElementById('boss-sprite'),
      heroName: document.getElementById('hero-name'),
      heroGradeTag: document.getElementById('hero-grade-tag'),
      heroHpBar: document.getElementById('hero-hp-bar'),
      heroHpGhost: document.getElementById('hero-hp-ghost'),
      heroHpText: document.getElementById('hero-hp-text'),
      heroShieldBadge: document.getElementById('hero-shield-badge'),
      bossHpBar: document.getElementById('boss-hp-bar'),
      bossHpGhost: document.getElementById('boss-hp-ghost'),
      bossHpText: document.getElementById('boss-hp-text'),
      bossName: document.getElementById('boss-name'),
      bossSubtitle: document.getElementById('boss-subtitle'),
      combatLog: document.getElementById('combat-log-text'),
      turnIndicator: document.getElementById('turn-indicator'),

      // In-Arena Holographic HUD
      arenaHoloConsole: document.getElementById('arena-holo-console'),
      holoSpellTag: document.getElementById('holo-spell-tag'),
      holoTimerBar: document.getElementById('holo-timer-bar'),
      holoTimerText: document.getElementById('holo-timer-text'),
      holoPromptText: document.getElementById('holo-prompt-text'),
      holoHintBox: document.getElementById('holo-hint-box'),
      holoHintText: document.getElementById('holo-hint-text'),

      // Boss Charge Box
      bossChargeBox: document.getElementById('boss-charge-box'),
      chargeSpellName: document.getElementById('charge-spell-name'),
      chargeTimerVal: document.getElementById('charge-timer-val'),
      chargeBarInner: document.getElementById('charge-bar-inner'),

      // Action Deck Dual Mode
      deckTitleText: document.getElementById('deck-title-text'),
      deckSpellGrid: document.getElementById('deck-spell-grid'),
      deckMathOptionsContainer: document.getElementById('deck-math-options-container'),
      deckOptionsGrid: document.getElementById('deck-options-grid'),
      btnCancelSpell: document.getElementById('btn-cancel-spell'),

      // Anime Cut-in & QTE & Combo Callout
      animeCutin: document.getElementById('anime-cutin'),
      cutinSvgBox: document.getElementById('cutin-svg-box'),
      cutinTextMain: document.getElementById('cutin-text-main'),
      cutinTextSub: document.getElementById('cutin-text-sub'),

      qteContainer: document.getElementById('qte-container'),
      qteZoneCrit: document.getElementById('qte-zone-crit'),
      qteCursor: document.getElementById('qte-cursor'),
      btnQteHit: document.getElementById('btn-qte-hit'),

      arcadeComboCallout: document.getElementById('arcade-combo-callout'),
      arcadeComboBadge: document.getElementById('arcade-combo-badge'),

      // Relics
      activeRelicsBar: document.getElementById('active-relics-bar'),
      relicsList: document.getElementById('relics-list'),
      relicModal: document.getElementById('relic-modal'),
      relicOptionsGrid: document.getElementById('relic-options-grid'),

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
    const views = ['view-castle', 'view-battle', 'view-victory', 'view-defeat'];

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
    } else if (viewId === 'view-castle') {
      dom.castleCanvas?.focus();
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

    // Cancel Spell button
    if (dom.btnCancelSpell) {
      dom.btnCancelSpell.addEventListener('click', () => {
        window.SoundEngine.playBlip();
        cancelCurrentSpell();
      });
    }

    // QTE Strike Button
    if (dom.btnQteHit) {
      dom.btnQteHit.addEventListener('click', () => {
        if (state.onQteHit) state.onQteHit();
      });
    }

    // Global Action Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Spacebar QTE Hit
      if (state.qteActive && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        if (state.onQteHit) state.onQteHit();
        return;
      }

      // In-Arena Math Option Selection (1, 2, 3, 4 or A, B, C, D)
      if (state.isTurnLocked && state.currentQuestion && dom.deckMathOptionsContainer && dom.deckMathOptionsContainer.style.display !== 'none') {
        const key = e.key.toLowerCase();
        if (key === '1' || key === 'a') {
          e.preventDefault();
          handleOptionChosen(0);
        } else if (key === '2' || key === 'b') {
          e.preventDefault();
          handleOptionChosen(1);
        } else if (key === '3' || key === 'c') {
          e.preventDefault();
          handleOptionChosen(2);
        } else if (key === '4' || key === 'd') {
          e.preventDefault();
          handleOptionChosen(3);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelCurrentSpell();
        }
      }
    });

    // Print Voucher Button
    const btnPrint = document.getElementById('btn-print-voucher');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Castle Exploration Mobile/Tablet Touch D-Pad Events
    const dpadButtons = [
      { el: dom.dpadUp, dir: 'up' },
      { el: dom.dpadDown, dir: 'down' },
      { el: dom.dpadLeft, dir: 'left' },
      { el: dom.dpadRight, dir: 'right' }
    ];

    dpadButtons.forEach(({ el, dir }) => {
      if (!el) return;
      const press = (e) => {
        e.preventDefault();
        if (window.CastleEngine) window.CastleEngine.handleDpadPress(dir, true);
      };
      const release = (e) => {
        e.preventDefault();
        if (window.CastleEngine) window.CastleEngine.handleDpadPress(dir, false);
      };
      el.addEventListener('mousedown', press);
      el.addEventListener('mouseup', release);
      el.addEventListener('mouseleave', release);
      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release, { passive: false });
    });

    if (dom.dpadAction) {
      dom.dpadAction.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.CastleEngine) window.CastleEngine.handleDpadPress('action', true);
      });
      dom.dpadAction.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (window.CastleEngine) window.CastleEngine.handleDpadPress('action', true);
      }, { passive: false });
    }

    if (dom.castleActionPrompt) {
      dom.castleActionPrompt.addEventListener('click', () => {
        if (window.CastleEngine) window.CastleEngine.handleDpadPress('action', true);
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
    state.isHypercharge = false;
    state.isEnraged = false;
    state.isMegaCrit = false;
    state.relics = [];
    updateRelicsBar();

    if (dom.battleContainer) dom.battleContainer.classList.remove('hypercharge-active');
    if (dom.hyperchargeBanner) dom.hyperchargeBanner.style.display = 'none';
    if (dom.bossEnrageBanner) dom.bossEnrageBanner.style.display = 'none';

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

    if (window.CastleEngine && dom.castleCanvas) {
      window.CastleEngine.init(dom.castleCanvas);
      window.CastleEngine.setPlayerHp(state.playerHp);
      window.CastleEngine.loadWing(1);
      window.CastleEngine.startLoop();
      updateCastleHud();
      switchView('view-castle');
      logMessage(`🏰 CASTLE EXPLORATION! Explore the halls, defeat roaming bots, and breach the Boss Chambers!`);
    } else {
      loadBoss(0);
      switchView('view-battle');
      logMessage(`⚔️ BATTLE START! ${state.playerName} enters the arena against ${BOSSES[0].name}!`);
    }

    window.SoundEngine.playBlip();

    if (dom.startModal && dom.startModal.open) dom.startModal.close();
  }

  function updateCastleHud() {
    if (dom.castlePlayerName) dom.castlePlayerName.textContent = state.playerName.toUpperCase();
    const pct = Math.max(0, Math.round((state.playerHp / state.playerMaxHp) * 100));
    if (dom.castleHpBar) dom.castleHpBar.style.width = `${pct}%`;
    if (dom.castleHpText) dom.castleHpText.textContent = `${state.playerHp}/${state.playerMaxHp} HP`;
    if (dom.castleCoinsVal) dom.castleCoinsVal.textContent = state.score.toLocaleString();
    if (dom.castleWingTag) dom.castleWingTag.textContent = `WING ${state.currentBossIdx + 1}/3`;
  }

  function addExplorationScore(points) {
    state.score += points;
    updateCastleHud();
    if (dom.scoreDisplay) dom.scoreDisplay.textContent = state.score.toLocaleString();
  }

  function syncHeroHp(hp) {
    state.playerHp = Math.max(0, Math.min(state.playerMaxHp, hp));
    updateCastleHud();
    updatePlayerStats();
    if (state.playerHp <= 0) {
      showDefeatPage();
    }
  }

  function transitionToBossArena(bossIdx) {
    if (window.CastleEngine) {
      window.CastleEngine.stopLoop();
    }
    state.currentBossIdx = bossIdx;
    loadBoss(bossIdx);
    updatePlayerStats();
    switchView('view-battle');
    triggerAnimeCutIn('⚠️ BOSS SANCTUARY! ⚠️', `${BOSSES[bossIdx].name} CHALLENGES YOU!`);
    logMessage(`⚔️ BOSS ENCOUNTER! ${state.playerName} enters the sanctum of [${BOSSES[bossIdx].name}]!`);
  }

  function returnToCastleAfterBoss() {
    state.isTurnLocked = false;
    stopBossChargeTelegraph();
    switchView('view-castle');
    if (window.CastleEngine) {
      window.CastleEngine.setPlayerHp(state.playerHp);
      window.CastleEngine.unlockNextWing();
      window.CastleEngine.startLoop();
    }
    updateCastleHud();
    logMessage(`🏰 Conquered Boss ${state.currentBossIdx}! Wing ${state.currentBossIdx + 1} unlocked. Explore the halls!`);
    setTimeout(() => {
      openRelicModal();
    }, 600);
  }

  function loadBoss(idx) {
    state.currentBossIdx = idx;
    const boss = BOSSES[idx];
    state.bossMaxHp = boss.maxHp;
    state.bossHp = boss.maxHp;
    state.isFrozen = false;
    state.isEnraged = false;
    stopBossChargeTelegraph();

    if (dom.bossSprite) dom.bossSprite.classList.remove('boss-enraged');
    if (dom.bossEnrageBanner) dom.bossEnrageBanner.style.display = 'none';

    // Relic perk: Kinetic Barrier (+50 starting shield)
    if (hasRelic('kinetic_barrier')) {
      state.playerShield = Math.max(state.playerShield, 50);
      updatePlayerStats();
    }

    // Arena styling
    dom.arenaStage.className = `arena-stage ${boss.bgClass}`;
    updateBossDisplay();
    logMessage(`⚡ A formidable foe emerges: [${boss.name}] - "${boss.introQuote}"`);

    // Reward: prompt Cyber Relic selection on round transitions (Boss 2 and Boss 3)
    if (idx > 0) {
      setTimeout(() => {
        openRelicModal();
      }, 700);
    }
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

    if (dom.bossHpGhost) {
      setTimeout(() => {
        if (dom.bossHpGhost) dom.bossHpGhost.style.width = `${pct}%`;
      }, 250);
    }
  }

  function updatePlayerStats() {
    const pct = Math.max(0, Math.round((state.playerHp / state.playerMaxHp) * 100));
    dom.heroHpBar.style.width = `${pct}%`;
    dom.heroHpText.textContent = `${state.playerHp} / ${state.playerMaxHp} HP`;

    if (dom.heroHpGhost) {
      setTimeout(() => {
        if (dom.heroHpGhost) dom.heroHpGhost.style.width = `${pct}%`;
      }, 250);
    }

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

  // RELICS SYSTEM HELPERS
  function hasRelic(id) {
    return state.relics && state.relics.includes(id);
  }

  function openRelicModal() {
    if (!dom.relicModal || !dom.relicOptionsGrid) return;
    window.SoundEngine.playRelicChime();
    dom.relicOptionsGrid.innerHTML = '';

    const allKeys = Object.keys(RELICS);
    const available = allKeys.filter(k => !state.relics.includes(k));
    const choices = (available.length > 0 ? available : allKeys).sort(() => 0.5 - Math.random()).slice(0, 3);

    choices.forEach(key => {
      const relic = RELICS[key];
      const card = document.createElement('div');
      card.className = 'relic-card';
      const iconSvg = window.SvgAssets.getRelicSvg ? window.SvgAssets.getRelicSvg(relic.id, 44) : '💎';
      card.innerHTML = `
        <div class="relic-icon-box">${iconSvg}</div>
        <span class="relic-title">${relic.name}</span>
        <span class="relic-desc">${relic.desc}</span>
        <button type="button" class="btn-retro btn-retro-gold" style="width: 100%; margin-top: 6px;">EQUIP RELIC</button>
      `;
      card.addEventListener('click', () => {
        equipRelic(relic.id);
        dom.relicModal.close();
      });
      dom.relicOptionsGrid.appendChild(card);
    });

    try {
      dom.relicModal.showModal();
    } catch (e) {}
  }

  function equipRelic(id) {
    if (!state.relics.includes(id)) {
      state.relics.push(id);
    }
    window.SoundEngine.playCorrect();
    updateRelicsBar();
    showFloatingText(dom.heroSprite, `💎 RELIC: ${RELICS[id].name}!`, '#f9e60b');
    logMessage(`💎 CYBER RELIC EQUIPPED: [${RELICS[id].name}] — ${RELICS[id].desc}`);
  }

  function updateRelicsBar() {
    if (!dom.activeRelicsBar || !dom.relicsList) return;
    if (!state.relics || state.relics.length === 0) {
      dom.activeRelicsBar.style.display = 'none';
      return;
    }
    dom.activeRelicsBar.style.display = 'flex';
    dom.relicsList.innerHTML = '';
    state.relics.forEach(id => {
      const r = RELICS[id];
      if (r) {
        const chip = document.createElement('span');
        chip.className = 'relic-chip';
        chip.innerHTML = `💎 <strong>${r.name}</strong>`;
        chip.title = r.desc;
        dom.relicsList.appendChild(chip);
      }
    });
  }

  // BOSS CHARGE (DOOM GAUGE) MECHANIC
  function startBossChargeTelegraph() {
    if (state.isFrozen || state.bossHp <= 0) return;
    state.bossCharging = true;
    state.bossChargeMax = 5.0;
    state.bossChargeRemaining = 5.0;

    const boss = BOSSES[state.currentBossIdx];
    const doomSpells = ['GLITCH NOVA', 'BINARY CATACLYSM', 'ASYMPTOTE OBLIVION'];
    const spellName = doomSpells[state.currentBossIdx] || 'DOOM CANNON';

    if (dom.bossChargeBox) dom.bossChargeBox.style.display = 'flex';
    if (dom.chargeSpellName) dom.chargeSpellName.textContent = `⚠️ CHARGING: ${spellName}`;
    if (dom.chargeTimerVal) dom.chargeTimerVal.textContent = `${state.bossChargeRemaining.toFixed(1)}s`;
    if (dom.chargeBarInner) dom.chargeBarInner.style.width = '0%';

    window.SoundEngine.playBossCharge();

    if (state.bossChargeInterval) clearInterval(state.bossChargeInterval);
    const startT = Date.now();

    state.bossChargeInterval = setInterval(() => {
      const elapsed = (Date.now() - startT) / 1000;
      state.bossChargeRemaining = Math.max(0, state.bossChargeMax - elapsed);
      const pct = (elapsed / state.bossChargeMax) * 100;
      if (dom.chargeBarInner) dom.chargeBarInner.style.width = `${Math.min(100, pct)}%`;
      if (dom.chargeTimerVal) dom.chargeTimerVal.textContent = `${state.bossChargeRemaining.toFixed(1)}s`;

      if (state.bossChargeRemaining <= 0) {
        clearInterval(state.bossChargeInterval);
        state.bossChargeInterval = null;
        logMessage(`⚠️ ${boss.name}'s ultimate is FULLY CHARGED! Solve now to interrupt!`);
      }
    }, 100);
  }

  function stopBossChargeTelegraph() {
    state.bossCharging = false;
    if (state.bossChargeInterval) {
      clearInterval(state.bossChargeInterval);
      state.bossChargeInterval = null;
    }
    if (dom.bossChargeBox) dom.bossChargeBox.style.display = 'none';
  }

  // ANIME CUT-IN PRESENTATION
  function triggerAnimeCutIn(mainText = '⚡ CRITICAL FOCUS! ⚡', subText = 'TEGAS OVERDRIVE STRIKE') {
    if (!dom.animeCutin) return;
    window.SoundEngine.playCutIn();
    if (dom.cutinTextMain) dom.cutinTextMain.textContent = mainText;
    if (dom.cutinTextSub) dom.cutinTextSub.textContent = subText;
    if (dom.cutinSvgBox && window.SvgAssets) {
      dom.cutinSvgBox.innerHTML = window.SvgAssets.getCutInEyesSvg();
    }
    dom.animeCutin.style.display = 'flex';
    setTimeout(() => {
      dom.animeCutin.style.display = 'none';
    }, 650);
  }

  // ARCADE COMBO CALLOUT STAMP
  function triggerArcadeComboCallout(combo) {
    if (combo < 2 || !dom.arcadeComboCallout || !dom.arcadeComboBadge) return;
    let text = 'GOOD!';
    let cls = 'stamp-good';
    let soundLevel = 'good';

    if (combo === 2) {
      text = 'GOOD!';
      cls = 'stamp-good';
      soundLevel = 'good';
    } else if (combo === 3) {
      text = 'SUPER!';
      cls = 'stamp-super';
      soundLevel = 'super';
    } else if (combo === 4) {
      text = 'HYPER!';
      cls = 'stamp-hyper';
      soundLevel = 'hyper';
    } else {
      text = '🔥 GODLIKE!';
      cls = 'stamp-godlike';
      soundLevel = 'godlike';
    }

    dom.arcadeComboBadge.textContent = text;
    dom.arcadeComboBadge.className = `arcade-stamp ${cls}`;
    dom.arcadeComboCallout.style.display = 'block';

    window.SoundEngine.playComboFanfare(soundLevel);

    setTimeout(() => {
      dom.arcadeComboCallout.style.display = 'none';
    }, 750);
  }

  // QUICK-TIME EVENT (QTE) MEGA-CRIT STRIKE
  function triggerQteSequence(callback) {
    state.qteActive = true;
    if (dom.qteContainer) dom.qteContainer.style.display = 'block';

    const hasOverclock = hasRelic('overclock_coil');
    const zoneWidth = hasOverclock ? 26 : 16;
    const zoneLeft = (100 - zoneWidth) / 2;
    if (dom.qteZoneCrit) {
      dom.qteZoneCrit.style.width = `${zoneWidth}%`;
      dom.qteZoneCrit.style.left = `${zoneLeft}%`;
    }

    let pos = 0;
    let dir = 2.4;
    state.qtePos = 0;

    const qteTimer = setInterval(() => {
      pos += dir;
      if (pos >= 100) {
        pos = 100;
        dir = -2.4;
      } else if (pos <= 0) {
        pos = 0;
        dir = 2.4;
      }
      state.qtePos = pos;
      if (dom.qteCursor) dom.qteCursor.style.left = `${pos}%`;
    }, 16);

    const finishQte = (hitSweetSpot) => {
      if (!state.qteActive) return;
      state.qteActive = false;
      clearInterval(qteTimer);
      if (dom.qteContainer) dom.qteContainer.style.display = 'none';

      if (hitSweetSpot) {
        state.isMegaCrit = true;
        window.SoundEngine.playQteMegaCrit();
        triggerAnimeCutIn('⚡ MEGA CRITICAL! ⚡', 'PERFECT CALCULATION TIMING!');
        screenShake('heavy');
      } else {
        state.isMegaCrit = false;
        window.SoundEngine.playQteHit();
      }

      callback();
    };

    const autoTimeout = setTimeout(() => {
      finishQte(false);
    }, 1400);

    state.onQteHit = () => {
      clearTimeout(autoTimeout);
      const isInside = (state.qtePos >= zoneLeft && state.qtePos <= (zoneLeft + zoneWidth));
      finishQte(isInside);
    };
  }

  // SEAMLESS IN-ARENA COMBAT FLOW (KILL THE MODAL)
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
    openInArenaConsole(question);
  }

  function openInArenaConsole(q) {
    state.isTurnLocked = true;

    // Switch action deck to In-Arena Options
    if (dom.deckSpellGrid) dom.deckSpellGrid.style.display = 'none';
    if (dom.deckMathOptionsContainer) dom.deckMathOptionsContainer.style.display = 'flex';
    if (dom.deckTitleText) dom.deckTitleText.textContent = `CASTING: ${q.spellName.toUpperCase()}`;

    // Show In-Arena Holographic Math Console
    if (dom.arenaHoloConsole) {
      dom.arenaHoloConsole.style.display = 'flex';
      dom.holoSpellTag.textContent = q.spellName;
      dom.holoPromptText.textContent = q.prompt;
      dom.holoHintBox.style.display = 'none';
      dom.holoHintText.textContent = q.hint;
    }

    // Populate In-Arena Options Buttons
    if (dom.deckOptionsGrid) {
      dom.deckOptionsGrid.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-math-opt';
        const keyLabel = ['1/A', '2/B', '3/C', '4/D'][idx];
        btn.innerHTML = `<span class="opt-badge-key">[${keyLabel}]</span> <span class="opt-text">${opt}</span>`;
        btn.addEventListener('click', () => handleOptionChosen(idx));
        dom.deckOptionsGrid.appendChild(btn);
      });
    }

    // Start Boss Doom Cannon charge telegraph
    startBossChargeTelegraph();

    // Chronos Shard relic check: freeze timer for first 3 seconds
    const hasChronos = hasRelic('chronos_shard');
    let timerFrozenSeconds = hasChronos ? 3.0 : 0;

    state.allocatedTime = state.isEnraged ? Math.max(6, Math.round(q.timeLimit * 0.8)) : q.timeLimit;
    state.timeRemaining = state.allocatedTime;
    updateInArenaTimerDisplay();

    if (state.timerInterval) clearInterval(state.timerInterval);
    const startTime = Date.now();

    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (timerFrozenSeconds > 0 && elapsed < timerFrozenSeconds) {
        if (dom.holoTimerText) dom.holoTimerText.textContent = `❄️ ${Math.ceil(state.allocatedTime)}s`;
        return;
      }
      const activeElapsed = timerFrozenSeconds > 0 ? (elapsed - timerFrozenSeconds) : elapsed;
      state.timeRemaining = Math.max(0, state.allocatedTime - activeElapsed);
      updateInArenaTimerDisplay();

      if (state.timeRemaining < state.allocatedTime * 0.35) {
        if (dom.holoHintBox) dom.holoHintBox.style.display = 'block';
      }

      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        handleTimeOut();
      }
    }, 100);
  }

  function updateInArenaTimerDisplay() {
    const pct = (state.timeRemaining / state.allocatedTime) * 100;
    if (dom.holoTimerBar) dom.holoTimerBar.style.width = `${pct}%`;
    if (dom.holoTimerText) dom.holoTimerText.textContent = `${Math.ceil(state.timeRemaining)}s`;

    if (pct < 30) {
      dom.holoTimerBar?.classList.add('urgent');
    } else {
      dom.holoTimerBar?.classList.remove('urgent');
    }
  }

  function cancelCurrentSpell() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    stopBossChargeTelegraph();
    closeInArenaConsole();
    state.isTurnLocked = false;
    logMessage('↩️ Spell casting cancelled. Choose an attack spell!');
  }

  function closeInArenaConsole() {
    if (dom.arenaHoloConsole) dom.arenaHoloConsole.style.display = 'none';
    if (dom.deckMathOptionsContainer) dom.deckMathOptionsContainer.style.display = 'none';
    if (dom.deckSpellGrid) dom.deckSpellGrid.style.display = 'grid';
    if (dom.deckTitleText) dom.deckTitleText.textContent = 'SELECT YOUR MATH ATTACK';
  }

  function handleOptionChosen(chosenIndex) {
    if (!state.currentQuestion) return;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    stopBossChargeTelegraph();

    const q = state.currentQuestion;
    const timeTaken = Math.max(0.5, state.allocatedTime - state.timeRemaining);
    const isCorrect = (chosenIndex === q.correctIndex);
    state.totalAnswers++;

    // Highlight chosen button in-arena
    if (dom.deckOptionsGrid) {
      const buttons = dom.deckOptionsGrid.querySelectorAll('.btn-math-opt');
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.correctIndex) {
          btn.classList.add('correct');
        } else if (idx === chosenIndex && !isCorrect) {
          btn.classList.add('wrong');
        }
      });
    }

    setTimeout(() => {
      closeInArenaConsole();

      // Trigger QTE Mega-Crit if Critical Strike OR high streak
      if (isCorrect && (q.type === 'critical' || state.combo >= 2)) {
        triggerQteSequence(() => {
          resolveTurnOutcome(isCorrect, timeTaken, q);
        });
      } else {
        resolveTurnOutcome(isCorrect, timeTaken, q);
      }
    }, 550);
  }

  function handleTimeOut() {
    const q = state.currentQuestion;
    state.totalAnswers++;
    stopBossChargeTelegraph();

    if (dom.deckOptionsGrid) {
      const buttons = dom.deckOptionsGrid.querySelectorAll('.btn-math-opt');
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.correctIndex) btn.classList.add('correct');
      });
    }

    logMessage(`⏳ TIME OUT on ${q.spellName}! The math spell dissipated!`);
    window.SoundEngine.playWrong();

    setTimeout(() => {
      closeInArenaConsole();
      resolveTurnOutcome(false, state.allocatedTime, q);
    }, 900);
  }

  // RESOLVE PLAYER ACTION & ENEMY REACTION
  function resolveTurnOutcome(isCorrect, timeTaken, q) {
    const ddaResult = window.MathEngine.recordAnswer(isCorrect, timeTaken, state.allocatedTime);

    if (isCorrect) {
      state.correctAnswers++;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      // Boss Stagger check: if boss was charging Doom Gauge
      if (state.bossCharging || (dom.bossChargeBox && dom.bossChargeBox.style.display !== 'none')) {
        stopBossChargeTelegraph();
        window.SoundEngine.playStagger();
        screenShake('heavy');
        showFloatingText(dom.bossSprite, '⚡ BOSS STAGGERED! ⚡', '#f9e60b');
        logMessage(`💥 STAGGER! Interrupted ${BOSSES[state.currentBossIdx].name}'s ultimate attack!`);
      }

      // TEGAS HYPERCHARGE ACTIVATION (Streak >= 3)
      if (state.combo >= 3) {
        if (!state.isHypercharge) {
          state.isHypercharge = true;
          if (dom.battleContainer) dom.battleContainer.classList.add('hypercharge-active');
          if (dom.hyperchargeBanner) dom.hyperchargeBanner.style.display = 'flex';
          window.SoundEngine.playHypercharge();
          triggerAnimeCutIn('⚡ HYPERCHARGE! ⚡', '1.5x MULTIPLIER ACTIVE');
          screenShake('heavy');
          showFloatingText(dom.heroSprite, '⚡ TEGAS HYPERCHARGE! ⚡', '#f9e60b');
          logMessage('⚡ TEGAS HYPERCHARGE ACTIVE! 1.5x Spell Damage & High-Voltage Rush!');
        }
      }

      // Trigger Arcade Combo Callout (GOOD, SUPER, HYPER, GODLIKE)
      triggerArcadeComboCallout(state.combo);

      // Relic: Vampiric Equations (+15 HP on correct calculation)
      if (hasRelic('vampiric_equations')) {
        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 15);
        showFloatingText(dom.heroSprite, '+15 HP VAMPIRIC DRAIN!', '#4ade80');
      }

      const comboMult = 1 + (state.combo - 1) * 0.25;
      const hyperMult = state.isHypercharge ? 1.5 : 1.0;
      let speedBonus = timeTaken < 3.5 ? 1.3 : 1.0;

      // Relic: Nanite Edge (+35% extra speed damage)
      if (hasRelic('nanite_edge') && timeTaken < 3.5) {
        speedBonus += 0.35;
      }

      let damage = 0;

      if (window.SvgAssets) dom.heroSprite.innerHTML = window.SvgAssets.getHeroSprite('cast', 5);

      if (q.type === 'fireball') {
        window.SoundEngine.playFireball();
        spawnVfx('fireball');
        damage = Math.round((70 + Math.random() * 20) * comboMult * speedBonus * hyperMult);
        applyBossDamage(damage, 'FIRE DAMAGE');
      } else if (q.type === 'shield') {
        window.SoundEngine.playShield();
        spawnVfx('shield');
        const heal = 25;
        const shieldGain = Math.round(30 * hyperMult);
        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + heal);
        state.playerShield += shieldGain;
        showFloatingText(dom.heroSprite, `+${heal} HP / +${shieldGain} SHIELD!`, '#06b6d4');
        logMessage(`🛡️ AEGIS BARRIER! Restored ${heal} HP and gained ${shieldGain} Shield Points!`);
      } else if (q.type === 'critical') {
        window.SoundEngine.playLightning();
        spawnVfx('lightning');
        damage = Math.round((115 + Math.random() * 30) * comboMult * speedBonus * hyperMult);
        applyBossDamage(damage, 'CRITICAL ALGEBRA STRIKE');
      } else if (q.type === 'freeze') {
        window.SoundEngine.playCorrect();
        spawnVfx('freeze');
        damage = Math.round(50 * comboMult * hyperMult);
        state.isFrozen = true;
        applyBossDamage(damage, 'TIME WARP CHILL');
        logMessage(`❄️ TIME WARP! The boss's circuits are frozen for 1 turn!`);
      }

      let points = Math.round((damage > 0 ? damage : 50) * 10 * ddaResult.tier * comboMult * hyperMult);
      if (state.isEnraged && state.bossHp <= 0) {
        points += 500;
        showFloatingText(dom.bossSprite, '+500 ENRAGED SLAYER BONUS!', '#f9e60b');
      }
      state.score += points;
      updatePlayerStats();

      setTimeout(() => {
        if (window.SvgAssets) dom.heroSprite.innerHTML = window.SvgAssets.getHeroSprite('idle', 5);
      }, 400);

    } else {
      state.combo = 0;
      if (state.isHypercharge) {
        state.isHypercharge = false;
        if (dom.battleContainer) dom.battleContainer.classList.remove('hypercharge-active');
        if (dom.hyperchargeBanner) dom.hyperchargeBanner.style.display = 'none';
        logMessage('💔 HYPERCHARGE LOST! Calculation streak broken.');
      }
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
    // QTE Mega-Crit Multiplier check
    if (state.isMegaCrit) {
      const critMultiplier = hasRelic('overclock_coil') ? 3.2 : 2.4;
      damage = Math.round(damage * critMultiplier);
      state.isMegaCrit = false;
    }

    state.bossHp = Math.max(0, state.bossHp - damage);
    updateBossDisplay();

    const isCrit = damage > 90;
    window.SoundEngine.playHit();
    screenShake(isCrit ? 'heavy' : 'normal');
    dom.bossSprite.classList.add('hurt');
    setTimeout(() => dom.bossSprite.classList.remove('hurt'), 400);

    // BOSS ENRAGED PHASE TRIGGER (HP <= 35%)
    if (state.bossHp > 0 && state.bossHp <= state.bossMaxHp * 0.35 && !state.isEnraged) {
      state.isEnraged = true;
      if (dom.bossSprite) dom.bossSprite.classList.add('boss-enraged');
      if (dom.bossEnrageBanner) dom.bossEnrageBanner.style.display = 'flex';
      window.SoundEngine.playEnrage();
      triggerAnimeCutIn('⚠️ ENRAGED PHASE! ⚠️', `${BOSSES[state.currentBossIdx].name} OVERCHARGED!`);
      screenShake('heavy');
      showFloatingText(dom.bossSprite, '⚠️ BOSS ENRAGED! ⚠️', '#ea2527');
      logMessage(`⚠️ WARNING: ${BOSSES[state.currentBossIdx].name} is ENRAGED! Attacks boosted by 40% and question timer accelerated!`);
    }

    showFloatingText(dom.bossSprite, `-${damage} ${isCrit ? 'CRITICAL!' : ''}`, isCrit ? '#f9e60b' : '#ea2527');
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
    let rawDamage = Math.floor(Math.random() * (boss.atkMax - boss.atkMin + 1)) + boss.atkMin;
    if (state.isEnraged) {
      rawDamage = Math.round(rawDamage * 1.4);
    }
    const randomTaunt = boss.taunts[Math.floor(Math.random() * boss.taunts.length)];

    logMessage(`⚠️ ENEMY TURN: ${randomTaunt}`);

    dom.bossSprite.classList.add('attack-lunge');
    setTimeout(() => {
      dom.bossSprite.classList.remove('attack-lunge');
      window.SoundEngine.playHit();
      screenShake(state.isEnraged ? 'heavy' : 'normal');

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

    state.isEnraged = false;
    if (dom.bossSprite) dom.bossSprite.classList.remove('boss-enraged');
    if (dom.bossEnrageBanner) dom.bossEnrageBanner.style.display = 'none';

    dom.bossSprite.classList.add('defeated');

    setTimeout(() => {
      dom.bossSprite.classList.remove('defeated');

      if (state.currentBossIdx < BOSSES.length - 1) {
        state.currentBossIdx++;
        state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 45);
        state.playerShield += 15;
        updatePlayerStats();
        returnToCastleAfterBoss();
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
    if (window.CastleEngine) window.CastleEngine.stopLoop();
    stopBossChargeTelegraph();
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
    if (window.CastleEngine) window.CastleEngine.stopLoop();
    stopBossChargeTelegraph();
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

  function screenShake(intensity = 'normal') {
    dom.battleContainer.classList.add('screen-shake');
    setTimeout(() => dom.battleContainer.classList.remove('screen-shake'), 350);

    // HAPTIC FEEDBACK (Feature A2: Mobile & Tablet Vibration)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (intensity === 'heavy') {
          navigator.vibrate([50, 40, 80]);
        } else {
          navigator.vibrate([30, 20, 40]);
        }
      } catch (e) {}
    }
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
    generateVoucherPreview,
    addExplorationScore,
    syncHeroHp,
    openRelicModal,
    transitionToBossArena,
    returnToCastleAfterBoss,
    updateCastleHud
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
