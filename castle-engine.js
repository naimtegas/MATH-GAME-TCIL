/**
 * CASTLE-ENGINE.JS
 * 2D Retro 8-bit Top-Down Castle Exploration Engine ("Skyrim in 8-bit Math RPG")
 * Features:
 * - Tile-based medieval castle dungeons with ambient lighting, wall torches, and banners
 * - 4-direction pixel player movement (WASD / Arrows / Virtual D-Pad)
 * - Roaming patrol bots with instant "Fast Math Snipes" (no screen break, active blast)
 * - Hidden treasure chests with relic lock puzzles
 * - Grand arched Boss Chamber Gates leading to the cinematic arena
 */

const CastleEngine = (() => {
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let isRunning = false;
  let currentWing = 1; // 1: Crypts, 2: Logic Catacombs, 3: High Dragon Throne

  const TILE_SIZE = 32;
  const COLS = 25;
  const ROWS = 16;
  const CANVAS_WIDTH = COLS * TILE_SIZE;  // 800
  const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 512

  // Camera & Zoom Settings ("zoom in a lil bit")
  const ZOOM = 1.25;
  const camera = { x: 0, y: 0 };

  // Input states
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false
  };

  // Particles container
  let particles = [];
  let floatingTexts = [];

  // Active Snipe Combat state (when engaging a roaming bot)
  let activeSnipe = null; // { bot, question, timeRemaining, maxTime, options, correctIndex }
  let activeChest = null; // { chest, question, timeRemaining, options, correctIndex }

  // Player state in castle
  const player = {
    x: 3 * TILE_SIZE,
    y: 8 * TILE_SIZE,
    width: 22,
    height: 24,
    speed: 3.2,
    dir: 'right', // 'down', 'up', 'left', 'right'
    frame: 0,
    animTimer: 0,
    isMoving: false,
    hp: 100,
    maxHp: 100,
    coins: 0
  };

  // Castle Tile Legend:
  // 0: Floor, 1: Wall, 2: Torch Wall, 3: Banner Wall, 4: Pillar, 
  // 5: Boss Gate (Closed), 6: Boss Gate (Open/Conquered), 7: Chest (Closed), 8: Chest (Opened), 9: Carpet
  const MAPS = {
    1: {
      name: 'WING I: THE GLITCH CRYPTS',
      objective: 'Clear roaming bots & breach the Vector Imp Sanctuary',
      bossGate: { x: 22, y: 7, bossIdx: 0, title: 'SANCTUARY OF THE VECTOR IMP' },
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,0,0,0,1,2,0,0,0,1,3,0,0,0,1,2,0,0,0,1,3,0,7,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1],
        [1,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,5,1],
        [1,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,1],
        [1,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,1],
        [1,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,5,1],
        [1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,3,0,7,0,1,2,0,0,0,1,3,0,0,0,1,2,0,0,0,1,3,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      bots: [
        { id: 1, type: 'slime', x: 6 * 32, y: 3 * 32, dir: 1, range: [5 * 32, 9 * 32], axis: 'x', alive: true, name: 'Glitch Slime' },
        { id: 2, type: 'drone', x: 12 * 32, y: 12 * 32, dir: 1, range: [10 * 32, 16 * 32], axis: 'x', alive: true, name: 'Bit Drone' },
        { id: 3, type: 'skeleton', x: 17 * 32, y: 4 * 32, dir: 1, range: [3 * 32, 11 * 32], axis: 'y', alive: true, name: 'Glitch Sentry' },
        { id: 4, type: 'drone', x: 20 * 32, y: 12 * 32, dir: -1, range: [17 * 32, 23 * 32], axis: 'x', alive: true, name: 'Binary Wisp' }
      ]
    },
    2: {
      name: 'WING II: THE MATRIX FOUNDRY',
      objective: 'Solve ancient automatons & breach the Matrix Golem Vault',
      bossGate: { x: 22, y: 7, bossIdx: 1, title: 'VAULT OF THE MATRIX GOLEM' },
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,0,7,0,1,3,0,0,0,1,2,0,7,0,1,3,0,0,0,1,2,0,0,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,1],
        [1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
        [1,1,0,0,1,2,1,0,0,0,1,2,1,0,0,0,1,2,1,0,0,1,1,1,1],
        [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,1],
        [1,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,1],
        [1,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,1],
        [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,1],
        [1,1,0,0,1,2,1,0,0,0,1,2,1,0,0,0,1,2,1,0,0,1,1,1,1],
        [1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
        [1,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,0,0,0,4,0,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,2,0,0,0,1,3,0,0,0,1,2,0,7,0,1,3,0,0,0,1,2,0,7,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      bots: [
        { id: 10, type: 'gargoyle', x: 7 * 32, y: 3 * 32, dir: 1, range: [4 * 32, 10 * 32], axis: 'x', alive: true, name: 'Logic Gargoyle' },
        { id: 11, type: 'automaton', x: 14 * 32, y: 11 * 32, dir: 1, range: [11 * 32, 17 * 32], axis: 'x', alive: true, name: 'Matrix Automaton' },
        { id: 12, type: 'skeleton', x: 18 * 32, y: 4 * 32, dir: 1, range: [3 * 32, 12 * 32], axis: 'y', alive: true, name: 'Code Draugr' },
        { id: 13, type: 'gargoyle', x: 21 * 32, y: 12 * 32, dir: -1, range: [18 * 32, 23 * 32], axis: 'x', alive: true, name: 'Runic Sentinel' }
      ]
    },
    3: {
      name: 'WING III: THE DRAGON THRONE KEEP',
      objective: 'Ascend to the High Throne & slay the Derivative Dragon',
      bossGate: { x: 22, y: 7, bossIdx: 2, title: 'HIGH THRONE OF THE DERIVATIVE DRAGON' },
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,2,0,0,1,3,2,0,0,1,3,2,0,7,1,3,2,0,0,1,3,2,0,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,0,4,0,4,0,0,4,0,4,0,0,4,0,4,0,0,4,0,4,0,0,4,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,1],
        [1,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,1],
        [1,0,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,1],
        [1,2,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,4,0,4,0,0,4,0,4,0,0,4,0,4,0,0,4,0,4,0,0,4,0,1],
        [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
        [1,3,2,0,7,1,3,2,0,0,1,3,2,0,0,1,3,2,0,7,1,3,2,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
      ],
      bots: [
        { id: 20, type: 'wyrmling', x: 6 * 32, y: 4 * 32, dir: 1, range: [4 * 32, 10 * 32], axis: 'x', alive: true, name: 'Plasma Wyrmling' },
        { id: 21, type: 'knight', x: 13 * 32, y: 11 * 32, dir: 1, range: [10 * 32, 16 * 32], axis: 'x', alive: true, name: 'Draugr Arithmancer' },
        { id: 22, type: 'wyrmling', x: 18 * 32, y: 4 * 32, dir: 1, range: [3 * 32, 11 * 32], axis: 'y', alive: true, name: 'Infernal Sprite' },
        { id: 23, type: 'knight', x: 20 * 32, y: 12 * 32, dir: -1, range: [17 * 32, 23 * 32], axis: 'x', alive: true, name: 'High Dread Knight' }
      ]
    }
  };

  let currentMap = MAPS[1];

  let controlsBound = false;

  function init(canvasElement) {
    canvas = canvasElement;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    if (!controlsBound) {
      bindControls();
      controlsBound = true;
    }
    loadWing(1);
    startLoop();
  }

  function loadWing(wingIdx) {
    currentWing = wingIdx;
    currentMap = MAPS[wingIdx] || MAPS[1];
    player.x = 2.5 * TILE_SIZE;
    player.y = 7.5 * TILE_SIZE;
    player.dir = 'right';
    activeSnipe = null;
    activeChest = null;
    particles = [];
    floatingTexts = [];
    updateCamera();

    // Trigger HUD room notification
    showRoomBanner(currentMap.name, currentMap.objective);
  }

  function bindControls() {
    window.addEventListener('keydown', (e) => {
      if (!isRunning) return;
      // Do not intercept if user is typing in form inputs
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') { keys.up = true; e.preventDefault(); }
      if (code === 'KeyS' || code === 'ArrowDown') { keys.down = true; e.preventDefault(); }
      if (code === 'KeyA' || code === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
      if (code === 'KeyD' || code === 'ArrowRight') { keys.right = true; e.preventDefault(); }
      if (code === 'Space' || code === 'KeyE') { keys.action = true; handleActionPress(); e.preventDefault(); }

      // Hotkeys for active snipe combat (1, 2, 3)
      if (activeSnipe) {
        if (e.key === '1') selectSnipeOption(0);
        else if (e.key === '2') selectSnipeOption(1);
        else if (e.key === '3') selectSnipeOption(2);
      } else if (activeChest) {
        if (e.key === '1') selectChestOption(0);
        else if (e.key === '2') selectChestOption(1);
        else if (e.key === '3') selectChestOption(2);
        else if (e.key === '4') selectChestOption(3);
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.down = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.right = false;
      if (code === 'Space' || code === 'KeyE') keys.action = false;
    });

    // Canvas click handling for Snipe Combat Options
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      handleCanvasClick(clickX, clickY);
    });
  }

  function handleActionPress() {
    // Check if player is facing a chest
    const targetTile = getFacingTile();
    if (targetTile && targetTile.val === 7) {
      // Open chest puzzle
      triggerChestPuzzle(targetTile.tx, targetTile.ty);
      return;
    }

    // Check if player is facing Boss Chamber Door
    if (targetTile && (targetTile.val === 5 || targetTile.val === 6)) {
      triggerBossDoorEntry();
      return;
    }
  }

  function getFacingTile() {
    let tx = Math.floor((player.x + player.width / 2) / TILE_SIZE);
    let ty = Math.floor((player.y + player.height / 2) / TILE_SIZE);

    if (player.dir === 'up') ty -= 1;
    else if (player.dir === 'down') ty += 1;
    else if (player.dir === 'left') tx -= 1;
    else if (player.dir === 'right') tx += 1;

    if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
      return { tx, ty, val: currentMap.tiles[ty][tx] };
    }
    return null;
  }

  function isSolid(x, y) {
    const margin = 4;
    const corners = [
      { x: x + margin, y: y + margin },
      { x: x + player.width - margin, y: y + margin },
      { x: x + margin, y: y + player.height - margin },
      { x: x + player.width - margin, y: y + player.height - margin }
    ];

    for (const pt of corners) {
      const tx = Math.floor(pt.x / TILE_SIZE);
      const ty = Math.floor(pt.y / TILE_SIZE);
      if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return true;
      const tile = currentMap.tiles[ty][tx];
      // 1: Wall, 2: Torch Wall, 3: Banner Wall, 4: Pillar, 5: Closed Boss Gate, 7: Closed Chest
      if (tile === 1 || tile === 2 || tile === 3 || tile === 4 || tile === 5 || tile === 7) {
        return true;
      }
    }
    return false;
  }

  function updateCamera() {
    const viewW = CANVAS_WIDTH / ZOOM;
    const viewH = CANVAS_HEIGHT / ZOOM;
    const targetX = (player.x + player.width / 2) - viewW / 2;
    const targetY = (player.y + player.height / 2) - viewH / 2;

    camera.x = Math.max(0, Math.min(CANVAS_WIDTH - viewW, targetX));
    camera.y = Math.max(0, Math.min(CANVAS_HEIGHT - viewH, targetY));
  }

  function update() {
    if (!isRunning) return;

    // If snipe or chest puzzle active, pause player walking
    if (!activeSnipe && !activeChest) {
      updatePlayer();
      updateBots();
    } else if (activeSnipe) {
      updateActiveSnipe();
    } else if (activeChest) {
      updateActiveChest();
    }

    updateCamera();
    updateParticles();
    updateFloatingTexts();
  }

  function updatePlayer() {
    let dx = 0;
    let dy = 0;

    if (keys.up) { dy -= player.speed; player.dir = 'up'; }
    if (keys.down) { dy += player.speed; player.dir = 'down'; }
    if (keys.left) { dx -= player.speed; player.dir = 'left'; }
    if (keys.right) { dx += player.speed; player.dir = 'right'; }

    // Normalize diagonal speed
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    player.isMoving = (dx !== 0 || dy !== 0);

    // Apply movement with horizontal & vertical sliding collision
    if (dx !== 0 && !isSolid(player.x + dx, player.y)) {
      player.x += dx;
    }
    if (dy !== 0 && !isSolid(player.x, player.y + dy)) {
      player.y += dy;
    }

    // Walking animation cycle
    if (player.isMoving) {
      player.animTimer++;
      if (player.animTimer > 8) {
        player.frame = (player.frame + 1) % 4;
        player.animTimer = 0;
      }
    } else {
      player.frame = 0;
    }

    // Check collision with roaming bots
    checkBotCollisions();

    // Check interaction prompt with Boss Gate or Chest
    checkProximityPrompts();
  }

  function updateBots() {
    if (!currentMap.bots) return;

    currentMap.bots.forEach(bot => {
      if (!bot.alive) return;

      const botSpeed = 1.2;
      if (bot.axis === 'x') {
        bot.x += botSpeed * bot.dir;
        if (bot.x <= bot.range[0]) { bot.x = bot.range[0]; bot.dir = 1; }
        else if (bot.x >= bot.range[1]) { bot.x = bot.range[1]; bot.dir = -1; }
      } else {
        bot.y += botSpeed * bot.dir;
        if (bot.y <= bot.range[0]) { bot.y = bot.range[0]; bot.dir = 1; }
        else if (bot.y >= bot.range[1]) { bot.y = bot.range[1]; bot.dir = -1; }
      }
    });
  }

  function checkBotCollisions() {
    if (!currentMap.bots || activeSnipe) return;

    currentMap.bots.forEach(bot => {
      if (!bot.alive) return;

      const dist = Math.hypot(
        (player.x + player.width / 2) - (bot.x + 16),
        (player.y + player.height / 2) - (bot.y + 16)
      );

      // Trigger Fast Math Snipe if player bumps into bot
      if (dist < 28) {
        startBotSnipe(bot);
      }
    });
  }

  function checkProximityPrompts() {
    const facing = getFacingTile();
    const promptEl = document.getElementById('castle-action-prompt');
    if (!promptEl) return;

    if (facing && facing.val === 7) {
      promptEl.innerHTML = `<span>💎 PRESS [E] / TAP TO PICK ANCIENT CHEST</span>`;
      promptEl.style.display = 'block';
    } else if (facing && (facing.val === 5 || facing.val === 6)) {
      promptEl.innerHTML = `<span>⚔️ PRESS [SPACE] / TAP TO ENTER ${currentMap.bossGate.title}</span>`;
      promptEl.style.display = 'block';
    } else {
      promptEl.style.display = 'none';
    }
  }

  // FAST MATH SNIPE COMBAT SYSTEM (IN-WORLD BLASTER)
  function startBotSnipe(bot) {
    if (activeSnipe) return;

    window.SoundEngine.playBlip();
    const q = window.MathEngine.generateBotSnipeQuestion();

    activeSnipe = {
      bot,
      question: q.prompt,
      answer: q.answer,
      options: q.options,
      correctIndex: q.correctIndex,
      timeRemaining: q.timeLimit,
      maxTime: q.timeLimit,
      startTime: Date.now()
    };
  }

  function updateActiveSnipe() {
    if (!activeSnipe) return;
    const elapsed = (Date.now() - activeSnipe.startTime) / 1000;
    activeSnipe.timeRemaining = Math.max(0, activeSnipe.maxTime - elapsed);

    if (activeSnipe.timeRemaining <= 0) {
      // Snipe timed out - Bot strikes player!
      resolveSnipeOutcome(false);
    }
  }

  function selectSnipeOption(index) {
    if (!activeSnipe) return;
    const isCorrect = (index === activeSnipe.correctIndex);
    resolveSnipeOutcome(isCorrect);
  }

  function resolveSnipeOutcome(isCorrect) {
    if (!activeSnipe) return;
    const bot = activeSnipe.bot;

    if (isCorrect) {
      window.SoundEngine.playHit();
      bot.alive = false;
      player.coins += 150;

      // Spawn coin & spark particles at bot position
      for (let i = 0; i < 14; i++) {
        particles.push({
          x: bot.x + 16,
          y: bot.y + 16,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          color: Math.random() > 0.5 ? '#f9e60b' : '#ea2527',
          size: Math.random() * 4 + 2,
          life: 1.0
        });
      }

      spawnFloatingText(bot.x + 16, bot.y, `+150 XP & GOLD!`, '#f9e60b');

      if (window.GameApp && window.GameApp.addExplorationScore) {
        window.GameApp.addExplorationScore(150);
      }
    } else {
      window.SoundEngine.playWrong();
      player.hp = Math.max(10, player.hp - 10);
      spawnFloatingText(player.x + 10, player.y, `-10 HP!`, '#ef4444');
      if (window.GameApp && window.GameApp.syncHeroHp) {
        window.GameApp.syncHeroHp(player.hp);
      }
    }

    activeSnipe = null;
  }

  // TREASURE CHEST PUZZLE SYSTEM
  function triggerChestPuzzle(tx, ty) {
    if (activeChest) return;
    window.SoundEngine.playBlip();

    const q = window.MathEngine.generateChestQuestion();
    activeChest = {
      tx, ty,
      question: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      timeRemaining: q.timeLimit,
      maxTime: q.timeLimit,
      startTime: Date.now()
    };
  }

  function updateActiveChest() {
    if (!activeChest) return;
    const elapsed = (Date.now() - activeChest.startTime) / 1000;
    activeChest.timeRemaining = Math.max(0, activeChest.maxTime - elapsed);

    if (activeChest.timeRemaining <= 0) {
      activeChest = null;
    }
  }

  function selectChestOption(index) {
    if (!activeChest) return;
    const isCorrect = (index === activeChest.correctIndex);
    const { tx, ty } = activeChest;

    if (isCorrect) {
      currentMap.tiles[ty][tx] = 8; // Change tile to open chest
      window.SoundEngine.playRelicChime();
      spawnFloatingText(tx * 32 + 16, ty * 32, `💎 CHEST UNLOCKED!`, '#f9e60b');

      // Prompt relic reward in main game
      if (window.GameApp && window.GameApp.openRelicModal) {
        window.GameApp.openRelicModal();
      }
    } else {
      window.SoundEngine.playWrong();
      spawnFloatingText(tx * 32 + 16, ty * 32, `LOCK JAMMED!`, '#ef4444');
    }

    activeChest = null;
  }

  function triggerBossDoorEntry() {
    const gate = currentMap.bossGate;
    window.SoundEngine.playCutIn();

    // Trigger visual screen wipe transition to Boss Arena
    if (window.GameApp && window.GameApp.transitionToBossArena) {
      window.GameApp.transitionToBossArena(gate.bossIdx);
    }
  }

  function handleCanvasClick(x, y) {
    // Check click on Snipe Option Bubbles (World space with camera zoom)
    if (activeSnipe) {
      const worldX = x / ZOOM + camera.x;
      const worldY = y / ZOOM + camera.y;

      const bx = activeSnipe.bot.x + 16;
      const by = activeSnipe.bot.y - 48;
      const boxY = by - 10;
      const optWidth = 50;
      const optHeight = 22;
      const startX = bx - (activeSnipe.options.length * (optWidth + 6)) / 2;

      for (let i = 0; i < activeSnipe.options.length; i++) {
        const ox = startX + i * (optWidth + 6);
        const oy = boxY + 38;
        if (worldX >= ox && worldX <= ox + optWidth && worldY >= oy && worldY <= oy + optHeight) {
          selectSnipeOption(i);
          return;
        }
      }
    }

    // Check click on Chest Puzzle Options (Screen space modal)
    if (activeChest) {
      const cx = CANVAS_WIDTH / 2;
      const cy = CANVAS_HEIGHT / 2 - 20;
      const optWidth = 80;
      const optHeight = 30;

      for (let i = 0; i < activeChest.options.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ox = cx - 90 + col * 95;
        const oy = cy + 15 + row * 38;
        if (x >= ox && x <= ox + optWidth && y >= oy && y <= oy + optHeight) {
          selectChestOption(i);
          return;
        }
      }
    }
  }

  // RENDERING ENGINE
  function render() {
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply Camera Zoom & Offset for in-world elements
    ctx.save();
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // 1. Render Castle Tiles
    renderMap();

    // 2. Render Roaming Patrol Bots
    renderBots();

    // 3. Render Player Sprite
    renderPlayer();

    // 4. Render Ambient Torches & Dynamic Lighting
    renderLighting();

    // 5. Render In-World Active Snipe Combat Bubble
    if (activeSnipe) {
      renderSnipeBubble();
    }

    // 6. Render Particles & Floating Damage/XP Texts
    renderParticles();
    renderFloatingTexts();

    ctx.restore();

    // 7. Render Chest Lockpick Overlay (Screen-space modal)
    if (activeChest) {
      renderChestOverlay();
    }
  }

  function renderMap() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = currentMap.tiles[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === 0) {
          // Cobblestone Stone Floor
          ctx.fillStyle = '#181b26';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#12151f';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
          // Subtle flagstone crack
          if ((c + r) % 3 === 0) {
            ctx.fillStyle = '#212638';
            ctx.fillRect(x + 4, y + 6, 8, 4);
          }
        } else if (tile === 9) {
          // Royal Carpet Path
          ctx.fillStyle = '#181b26';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#7f1d1d'; // Deep red
          ctx.fillRect(x, y + 2, TILE_SIZE, TILE_SIZE - 4);
          ctx.fillStyle = '#f9e60b'; // Gold trim
          ctx.fillRect(x, y + 2, TILE_SIZE, 2);
          ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 2);
        } else if (tile === 1) {
          // Castle Stone Wall
          ctx.fillStyle = '#262d3d';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#1a1f2c';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = '#0f131c';
          ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
        } else if (tile === 2) {
          // Wall Torch
          ctx.fillStyle = '#262d3d';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          // Torch bracket
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 14, y + 16, 4, 10);
          // Torch Flame
          const flicker = Math.sin(Date.now() / 80) * 2;
          ctx.fillStyle = '#ea2527';
          ctx.fillRect(x + 12, y + 10 + flicker, 8, 8);
          ctx.fillStyle = '#f9e60b';
          ctx.fillRect(x + 14, y + 8 + flicker, 4, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 15, y + 9 + flicker, 2, 3);
        } else if (tile === 3) {
          // TEGAS Castle Banner Wall
          ctx.fillStyle = '#262d3d';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          // Red & Gold Banner
          ctx.fillStyle = '#ea2527';
          ctx.fillRect(x + 8, y + 6, 16, 20);
          ctx.fillStyle = '#f9e60b';
          ctx.fillRect(x + 13, y + 6, 6, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 14, y + 12, 4, 4);
        } else if (tile === 4) {
          // Stone Pillar
          ctx.fillStyle = '#181b26';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 6, y + 4, 20, 24);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 8, y + 6, 16, 20);
        } else if (tile === 5 || tile === 6) {
          // Grand Boss Chamber Gate
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = tile === 6 ? '#22c55e' : '#f9e60b';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          // Gate Runes
          ctx.fillStyle = tile === 6 ? '#22c55e' : '#ea2527';
          ctx.fillRect(x + 10, y + 10, 12, 12);
        } else if (tile === 7) {
          // Closed Treasure Chest
          ctx.fillStyle = '#181b26';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          // Wooden chest with gold straps
          ctx.fillStyle = '#92400e';
          ctx.fillRect(x + 4, y + 8, 24, 18);
          ctx.fillStyle = '#f9e60b';
          ctx.fillRect(x + 14, y + 8, 4, 18);
          ctx.fillRect(x + 14, y + 16, 4, 4);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 4, y + 8, 24, 18);
        } else if (tile === 8) {
          // Opened Chest
          ctx.fillStyle = '#181b26';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 4, y + 12, 24, 14);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(x + 6, y + 4, 20, 8); // Golden loot glow
        }
      }
    }
  }

  function renderBots() {
    if (!currentMap.bots) return;

    currentMap.bots.forEach(bot => {
      if (!bot.alive) return;

      const bx = bot.x;
      const by = bot.y;

      // Draw bot based on type
      if (bot.type === 'slime') {
        // Pixel Slime
        ctx.fillStyle = '#10b981';
        ctx.fillRect(bx + 6, by + 12, 20, 14);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(bx + 8, by + 8, 16, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + 10, by + 12, 4, 4);
        ctx.fillRect(bx + 18, by + 12, 4, 4);
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(bx + 12, by + 14, 2, 2);
        ctx.fillRect(bx + 20, by + 14, 2, 2);
      } else if (bot.type === 'drone') {
        // Binary Drone
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 8, by + 6, 16, 16);
        ctx.fillStyle = '#f9e60b';
        ctx.fillRect(bx + 12, by + 10, 8, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + 14, by + 12, 4, 4); // Glowing red eye
      } else if (bot.type === 'gargoyle' || bot.type === 'wyrmling') {
        // Fire Wyrmling / Gargoyle
        ctx.fillStyle = '#ea2527';
        ctx.fillRect(bx + 6, by + 6, 20, 18);
        ctx.fillStyle = '#f9e60b';
        ctx.fillRect(bx + 10, by + 10, 4, 4);
        ctx.fillRect(bx + 18, by + 10, 4, 4);
      } else {
        // Skeleton / Knight
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx + 8, by + 4, 16, 14);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx + 10, by + 8, 4, 4);
        ctx.fillRect(bx + 18, by + 8, 4, 4);
        ctx.fillStyle = '#475569';
        ctx.fillRect(bx + 8, by + 18, 16, 10);
      }

      // Detection indicator
      const dist = Math.hypot((player.x + 12) - (bx + 16), (player.y + 12) - (by + 16));
      if (dist < 80) {
        ctx.fillStyle = '#ea2527';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('!', bx + 13, by - 4);
      }
    });
  }

  function renderPlayer() {
    const px = player.x;
    const py = player.y;

    // Glowing summoning shadow under player
    ctx.fillStyle = 'rgba(249, 230, 11, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px + 11, py + 22, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 8-bit Cyber Mage Sprite
    ctx.fillStyle = '#1e3a8a'; // Blue Robes
    ctx.fillRect(px + 4, py + 8, 14, 14);
    ctx.fillStyle = '#f9e60b'; // Gold hair / trim
    ctx.fillRect(px + 6, py + 2, 10, 6);
    ctx.fillStyle = '#fed7aa'; // Skin
    ctx.fillRect(px + 7, py + 5, 8, 5);

    // Glowing Cyan Visor / Eyes
    ctx.fillStyle = '#06b6d4';
    if (player.dir === 'left') {
      ctx.fillRect(px + 6, py + 6, 4, 2);
    } else if (player.dir === 'right') {
      ctx.fillRect(px + 12, py + 6, 4, 2);
    } else {
      ctx.fillRect(px + 8, py + 6, 6, 2);
    }

    // Staff in hand
    ctx.fillStyle = '#78350f'; // Wood
    const staffX = player.dir === 'left' ? px : px + 18;
    ctx.fillRect(staffX, py + 4, 3, 18);
    // Glowing Magic Orb atop staff
    ctx.fillStyle = '#f9e60b';
    ctx.fillRect(staffX - 1, py + 1, 5, 5);
  }

  function renderLighting() {
    // Dynamic torch ambient glow
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentMap.tiles[r][c] === 2) {
          const tx = c * TILE_SIZE + 16;
          const ty = r * TILE_SIZE + 14;
          const grad = ctx.createRadialGradient(tx, ty, 6, tx, ty, 65);
          grad.addColorStop(0, 'rgba(249, 230, 11, 0.25)');
          grad.addColorStop(0.5, 'rgba(234, 37, 39, 0.12)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(tx - 65, ty - 65, 130, 130);
        }
      }
    }
  }

  // IN-WORLD FAST MATH SNIPE BUBBLE
  function renderSnipeBubble() {
    const bot = activeSnipe.bot;
    const bx = bot.x + 16;
    const by = bot.y - 48;

    // Background bubble box
    ctx.fillStyle = 'rgba(10, 12, 16, 0.95)';
    ctx.strokeStyle = '#f9e60b';
    ctx.lineWidth = 2;

    const boxW = 190;
    const boxH = 68;
    const boxX = bx - boxW / 2;
    const boxY = by - 10;

    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Question Prompt
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${activeSnipe.question}`, bx, boxY + 20);

    // Timer Bar
    const timerPct = activeSnipe.timeRemaining / activeSnipe.maxTime;
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(boxX + 12, boxY + 26, boxW - 24, 6);
    ctx.fillStyle = timerPct > 0.3 ? '#f9e60b' : '#ea2527';
    ctx.fillRect(boxX + 12, boxY + 26, (boxW - 24) * timerPct, 6);

    // 3 Option Buttons
    const optWidth = 50;
    const optHeight = 22;
    const startX = bx - (activeSnipe.options.length * (optWidth + 6)) / 2;

    activeSnipe.options.forEach((opt, idx) => {
      const ox = startX + idx * (optWidth + 6);
      const oy = boxY + 38;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox, oy, optWidth, optHeight);
      ctx.strokeStyle = '#f9e60b';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, optWidth, optHeight);

      ctx.fillStyle = '#f9e60b';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`[${idx + 1}] ${opt}`, ox + optWidth / 2, oy + 15);
    });
  }

  // CHEST LOCKPICK OVERLAY
  function renderChestOverlay() {
    ctx.fillStyle = 'rgba(10, 12, 16, 0.92)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2 - 20;

    // Ancient Chest console
    ctx.strokeStyle = '#f9e60b';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#12151f';
    ctx.fillRect(cx - 150, cy - 80, 300, 190);
    ctx.strokeRect(cx - 150, cy - 80, 300, 190);

    ctx.fillStyle = '#f9e60b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('💎 ANCIENT CYBER CHEST LOCK', cx, cy - 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.fillText(activeChest.question, cx, cy - 25);

    // 4 Option Buttons
    activeChest.options.forEach((opt, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ox = cx - 90 + col * 95;
      const oy = cy + 15 + row * 38;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox, oy, 80, 30);
      ctx.strokeStyle = '#f9e60b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy, 80, 30);

      ctx.fillStyle = '#f9e60b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`[${idx + 1}] ${opt}`, ox + 40, oy + 19);
    });
  }

  function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({
      x, y,
      text,
      color,
      life: 1.0
    });
  }

  function updateFloatingTexts() {
    floatingTexts.forEach(ft => {
      ft.y -= 0.8;
      ft.life -= 0.02;
    });
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);
  }

  function renderFloatingTexts() {
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
    });
    particles = particles.filter(p => p.life > 0);
  }

  function renderParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });
  }

  function showRoomBanner(title, subtitle) {
    const banner = document.getElementById('castle-room-banner');
    if (!banner) return;
    const titleEl = document.getElementById('castle-room-title');
    const subEl = document.getElementById('castle-room-subtitle');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
    banner.style.display = 'block';
    banner.classList.remove('fade-out');

    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.style.display = 'none', 600);
    }, 2800);
  }

  function startLoop() {
    if (isRunning) return;
    isRunning = true;
    function loop() {
      update();
      render();
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    isRunning = false;
    keys.up = false;
    keys.down = false;
    keys.left = false;
    keys.right = false;
    keys.action = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function unlockNextWing() {
    if (currentWing < 3) {
      loadWing(currentWing + 1);
    }
  }

  // Virtual D-Pad handlers for mobile devices
  function handleDpadPress(dir, pressed) {
    if (dir === 'up') keys.up = pressed;
    if (dir === 'down') keys.down = pressed;
    if (dir === 'left') keys.left = pressed;
    if (dir === 'right') keys.right = pressed;
    if (dir === 'action' && pressed) handleActionPress();
  }

  return {
    init,
    loadWing,
    unlockNextWing,
    startLoop,
    stopLoop,
    handleDpadPress,
    getPlayerState: () => ({ ...player }),
    setPlayerHp: (hp) => { player.hp = hp; },
    addCoins: (c) => { player.coins += c; }
  };
})();

if (typeof window !== 'undefined') {
  window.CastleEngine = CastleEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CastleEngine;
}
