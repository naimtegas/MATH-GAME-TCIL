/**
 * SVG-ASSETS.JS
 * Pure pixelated SVG asset library for "Algorithm Boss Battle: Speed Math RPG"
 * All sprites, icons, spell effects, and QR codes rendered via crisp pixel SVGs.
 */

const SvgAssets = (() => {
  // Helper to convert an array of color-mapped pixel rows into an SVG string
  function createPixelSprite(width, height, pixelMap, palette, scale = 4) {
    let rects = '';
    for (let y = 0; y < pixelMap.length; y++) {
      const row = pixelMap[y];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        if (char !== '.' && palette[char]) {
          rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${palette[char]}" />`;
        }
      }
    }
    const svgWidth = width * scale;
    const svgHeight = height * scale;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" shape-rendering="crispEdges">${rects}</svg>`;
  }

  // 1. HERO SPRITE (CYBER MATH MAGE) - 20x24 pixels
  const heroPalette = {
    'K': '#0f172a', // Dark outline
    'B': '#1e3a8a', // Deep robe blue
    'C': '#06b6d4', // Bright cyan glow
    'S': '#fde047', // Staff gold / hair
    'W': '#ffffff', // Highlight white
    'F': '#fed7aa', // Skin tone
    'R': '#ef4444', // Red gem / accent
    'P': '#a855f7', // Staff magic crystal
  };

  const heroIdlePixels = [
    "........KKKK........",
    ".......KSSSSK.......",
    "......KSSSSSSK......",
    "......KFFKFKFK......",
    "......KFFFFFFK......",
    "......KFWFFWFK......",
    "......KCCCCCCK......",
    ".....KCCCCCCCCK.PP..",
    "....KBBBBBBBBBBKPWP.",
    "...KBBBWBBBWBBBKPP..",
    "...KBBCWBBBWCBK.KK..",
    "...KBBBWWWWBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBCCCCCCBBK.KK..",
    "...KBCCKCCKCCBK.KK..",
    "...KBBKKKKKKBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "....KBBBBBBBBK..KK..",
    "....KKKKKKKKKK..KK..",
    ".....KFFK..KFFK.KK..",
    ".....KKKK..KKKK.KK.."
  ];

  const heroCastPixels = [
    "........KKKK....PP..",
    ".......KSSSSK..PWWP.",
    "......KSSSSSSK..PP..",
    "......KFFKFKFK..KK..",
    "......KFFFFFFK..KK..",
    "......KFWFFWFK..KK..",
    "......KCCCCCCK..KK..",
    ".....KCCCCCCCCK.KK..",
    "....KBBBBBBBBBBKKK..",
    "...KBBBWBBBWBBBBK...",
    "...KBBCWBBBWCBK.....",
    "...KBBBWWWWBBBK.PP..",
    "...KBBBBBBBBBBKPWWP.",
    "...KBBCCCCCCBBK.PP..",
    "...KBCCKCCKCCBK.KK..",
    "...KBBKKKKKKBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "...KBBBBBBBBBBK.KK..",
    "....KBBBBBBBBK..KK..",
    "....KKKKKKKKKK..KK..",
    ".....KFFK..KFFK.KK..",
    ".....KKKK..KKKK.KK.."
  ];

  // 2. BOSS 1: VECTOR IMP (The Glitch Sprite) - 22x22 pixels
  const impPalette = {
    'K': '#18181b', // Outline
    'P': '#7c3aed', // Purple body
    'L': '#a855f7', // Light purple
    'G': '#22c55e', // Glitch neon green
    'W': '#ffffff', // White eyes
    'R': '#ef4444', // Red horn tips
    'Y': '#facc15', // Yellow sparks
  };

  const impPixels = [
    "..RR..........RR....",
    ".RKKR........RKKR...",
    ".KPPR........RPPK...",
    ".KPPPKKKKKKKKPPPK...",
    ".KPPLLLLLLLLPPPK....",
    "..KPLGGLGGLGPK......",
    "..KPLWWLWWLGPK......",
    "..KPLWKLWKLGPK..YY..",
    "..KPLLLLLLLLPK.YGGY.",
    "..KPLLGGGGLLPK..YY..",
    "..KPPLLLLLLPPK......",
    "...KKKKKKKKKK.......",
    "..KPPPPPPPPPPK......",
    ".KPPKPPPPPPKPPK.....",
    "KPPLKPPPPPPKLPK.....",
    "KPP.KPPPPPPK.PPK....",
    "KK..KPPPPPPK..KK....",
    "....KPPKKPPK........",
    "....KPK..KPK........",
    "...KPPR..RPPK.......",
    "...KKKK..KKKK.......",
    "...................."
  ];

  // 3. BOSS 2: MATRIX GOLEM (The Logic Titan) - 24x26 pixels
  const golemPalette = {
    'K': '#0f172a', // Obsidian outline
    'S': '#334155', // Slate stone dark
    'L': '#64748b', // Slate stone mid
    'G': '#10b981', // Neon matrix green
    'W': '#ecfdf5', // Core bright green/white
    'C': '#06b6d4', // Cyan matrix rune
  };

  const golemPixels = [
    ".......KKKKKKKKKK.......",
    ".....KKSSSSSSSSSSKK.....",
    "....KSSLLLLLLLLSSSK.....",
    "....KSLKGGKKGGKLSSK.....",
    "....KSLKWWKKWWKLSSK.....",
    "....KSLKGGKKGGKLSSK.....",
    "....KSSLLLLLLLLSSSK.....",
    "....KSSLLGGGGLLSSSK.....",
    "....KSSSLLLLLLSSSK......",
    "....KKKKKKKKKKKKKK......",
    "..KKSSLLSSSSSSLLSSKK....",
    ".KSSSSLLGGGGGGLLSSSSK...",
    "KSSLLSSSSGGGGSSSSLLSSK..",
    "KSLKKSSGGWWWWGGSSKKLSSK.",
    "KSLKSSGGWWWWWWGGSSKLSSK.",
    "KSLKKSSGGWWWWGGSSKKLSSK.",
    "KSSLLSSSSGGGGSSSSLLSSK..",
    ".KSSSSLLLLLLLLLLSSSSK...",
    "..KKSSLLSSSSSSLLSSKK....",
    "...KKSSSLLSSLLSSSKK.....",
    "....KSSSLLSSLLSSSK......",
    "....KSSSLLSSLLSSSK......",
    "....KSSSKK..KKSSSK......",
    "...KSSSSK....KSSSSK.....",
    "...KLLLLK....KLLLLK.....",
    "...KKKKKK....KKKKKK....."
  ];

  // 4. BOSS 3: DERIVATIVE DRAGON (Calculus Overlord) - 28x28 pixels
  const dragonPalette = {
    'K': '#0f0f1b', // Outline
    'D': '#3b0764', // Deep dark dragon purple
    'M': '#7e22ce', // Mid violet
    'B': '#a855f7', // Bright purple scale
    'C': '#06b6d4', // Cyber cyan horn / wings
    'W': '#ffffff', // Eye / fangs / highlights
    'Y': '#facc15', // Golden math flame
    'R': '#f43f5e', // Crimson tongue / runes
  };

  const dragonPixels = [
    "...CC...................CC..",
    "..CKKC.................CKKC.",
    "..CKKKC...............CKKKC.",
    "...CKKKKKKKKKKKKKKKKKKKKKC..",
    "....KDDDDDMMMMMMDDDDDDDK....",
    "...KDDMMBBBBBBBBBMMDDDDK....",
    "..KDDMBKKKKBBKKKKBBMDDDDK...",
    "..KDMBKWWWWKBKWWWWKBMDDDK...",
    "..KDMBKWCWKKBKCWWKKBBMDDDK..",
    "..KDDMBKKKKBBKKKKBBMDDDDK...",
    "..KDDMMBBBBBBBBBMMDDDDDK....",
    "...KDDDMMBRRRRBMMDDDDDK.....",
    "....KDDMMBWWWWBMDDDDDK......",
    ".....KKKKKKKKKKKKKKKK.......",
    "..CCCC..KDDDDDDDDDK..CCCC...",
    ".CKKKKC.KDDMBBBMDDK.CKKKKC..",
    "CKKDDDKCKDDMBBBMDDKCKDDDDKC.",
    "CKDDMMDKKDDMBBBMDDKKDDMMDKC.",
    "CKDMMBBMKDDMBBBMDDKMDMMBBMKC",
    "CKDMMBBMKDDMBBBMDDKMDMMBBMKC",
    ".KDDMMDKKDDMBBBMDDKKDDMMDK..",
    "..KKKK..KDDMMMMMDDK..KKKK...",
    "........KDDDDDDDDDK.........",
    ".......KDDMMK..KMMDDK.......",
    "......KDMMBBK..KBBMMDK......",
    ".....KDMMBBK....KBBMMDK.....",
    ".....KCCCCCCK..KCCCCCCK.....",
    "......KKKKKK....KKKKKK......"
  ];

  // SPELL EFFECTS & ICONS
  function getFireballSvg(size = 64) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="5" y="1" width="6" height="2" fill="#ef4444"/>
      <rect x="3" y="3" width="10" height="2" fill="#f97316"/>
      <rect x="2" y="5" width="12" height="6" fill="#f97316"/>
      <rect x="4" y="6" width="8" height="4" fill="#fde047"/>
      <rect x="6" y="7" width="4" height="2" fill="#ffffff"/>
      <rect x="1" y="7" width="2" height="2" fill="#ef4444"/>
      <rect x="13" y="7" width="2" height="2" fill="#ef4444"/>
      <rect x="3" y="11" width="10" height="2" fill="#f97316"/>
      <rect x="5" y="13" width="6" height="2" fill="#ef4444"/>
      <rect x="7" y="15" width="2" height="1" fill="#ea580c"/>
    </svg>`;
  }

  function getShieldSvg(size = 64) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="2" y="1" width="12" height="2" fill="#0284c7"/>
      <rect x="1" y="3" width="14" height="2" fill="#0ea5e9"/>
      <rect x="1" y="5" width="14" height="4" fill="#38bdf8"/>
      <rect x="4" y="5" width="8" height="4" fill="#bae6fd"/>
      <rect x="6" y="6" width="4" height="2" fill="#ffffff"/>
      <rect x="2" y="9" width="12" height="2" fill="#0ea5e9"/>
      <rect x="3" y="11" width="10" height="2" fill="#0284c7"/>
      <rect x="5" y="13" width="6" height="2" fill="#0369a1"/>
      <rect x="7" y="15" width="2" height="1" fill="#075985"/>
    </svg>`;
  }

  function getLightningSvg(size = 64) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="8" y="0" width="4" height="3" fill="#fde047"/>
      <rect x="6" y="3" width="5" height="3" fill="#facc15"/>
      <rect x="4" y="6" width="6" height="2" fill="#eab308"/>
      <rect x="2" y="8" width="12" height="2" fill="#fef08a"/>
      <rect x="5" y="8" width="6" height="2" fill="#ffffff"/>
      <rect x="6" y="10" width="5" height="3" fill="#facc15"/>
      <rect x="7" y="13" width="3" height="3" fill="#eab308"/>
      <rect x="8" y="15" width="1" height="1" fill="#ca8a04"/>
    </svg>`;
  }

  function getFreezeSvg(size = 64) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="7" y="0" width="2" height="16" fill="#a5f3fc"/>
      <rect x="0" y="7" width="16" height="2" fill="#a5f3fc"/>
      <rect x="2" y="2" width="2" height="2" fill="#38bdf8"/>
      <rect x="12" y="2" width="2" height="2" fill="#38bdf8"/>
      <rect x="2" y="12" width="2" height="2" fill="#38bdf8"/>
      <rect x="12" y="12" width="2" height="2" fill="#38bdf8"/>
      <rect x="5" y="5" width="6" height="6" fill="#cffafe"/>
      <rect x="7" y="7" width="2" height="2" fill="#ffffff"/>
    </svg>`;
  }

  function getHeartSvg(size = 24) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="2" y="2" width="4" height="2" fill="#ef4444"/>
      <rect x="10" y="2" width="4" height="2" fill="#ef4444"/>
      <rect x="1" y="4" width="6" height="4" fill="#ef4444"/>
      <rect x="9" y="4" width="6" height="4" fill="#ef4444"/>
      <rect x="2" y="5" width="2" height="2" fill="#fca5a5"/>
      <rect x="2" y="8" width="12" height="2" fill="#ef4444"/>
      <rect x="3" y="10" width="10" height="2" fill="#dc2626"/>
      <rect x="5" y="12" width="6" height="2" fill="#b91c1c"/>
      <rect x="7" y="14" width="2" height="2" fill="#991b1b"/>
    </svg>`;
  }

  function getManaSvg(size = 24) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="7" y="1" width="2" height="2" fill="#38bdf8"/>
      <rect x="5" y="3" width="6" height="2" fill="#0284c7"/>
      <rect x="3" y="5" width="10" height="4" fill="#0ea5e9"/>
      <rect x="5" y="6" width="3" height="2" fill="#ffffff"/>
      <rect x="4" y="9" width="8" height="3" fill="#0284c7"/>
      <rect x="6" y="12" width="4" height="2" fill="#0369a1"/>
      <rect x="7" y="14" width="2" height="1" fill="#075985"/>
    </svg>`;
  }

  function getTrophySvg(size = 32) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="2" y="1" width="12" height="2" fill="#eab308"/>
      <rect x="3" y="3" width="10" height="4" fill="#facc15"/>
      <rect x="5" y="4" width="3" height="2" fill="#fef08a"/>
      <rect x="1" y="3" width="2" height="3" fill="#ca8a04"/>
      <rect x="13" y="3" width="2" height="3" fill="#ca8a04"/>
      <rect x="4" y="7" width="8" height="2" fill="#eab308"/>
      <rect x="6" y="9" width="4" height="3" fill="#ca8a04"/>
      <rect x="4" y="12" width="8" height="2" fill="#854d0e"/>
      <rect x="3" y="14" width="10" height="2" fill="#713f12"/>
    </svg>`;
  }

  function getTicketSvg(size = 32) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect x="1" y="3" width="14" height="10" fill="#f59e0b"/>
      <rect x="3" y="4" width="10" height="8" fill="#fef3c7"/>
      <rect x="1" y="7" width="2" height="2" fill="#0f172a"/>
      <rect x="13" y="7" width="2" height="2" fill="#0f172a"/>
      <rect x="5" y="6" width="6" height="1" fill="#d97706"/>
      <rect x="6" y="8" width="4" height="1" fill="#d97706"/>
      <rect x="5" y="10" width="6" height="1" fill="#d97706"/>
    </svg>`;
  }

  // Pure SVG QR Code Generator (Standard Model 2 QR representation for ticket verification)
  // Generates a valid pixel matrix with corner position locators, timing patterns, and data hash
  function generateTicketQrSvg(dataString, size = 160) {
    const matrixSize = 25; // 25x25 QR matrix (Version 2)
    const grid = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));

    // Place 7x7 Finder Pattern helper
    function placeFinder(row, col) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[row + r][col + c] = 1;
          } else {
            grid[row + r][col + c] = 0;
          }
        }
      }
    }

    placeFinder(0, 0); // Top-left
    placeFinder(0, matrixSize - 7); // Top-right
    placeFinder(matrixSize - 7, 0); // Bottom-left

    // Separators (white space around finders)
    for (let i = 0; i < 8; i++) {
      grid[7][i] = 0;
      grid[i][7] = 0;
      grid[7][matrixSize - 1 - i] = 0;
      grid[i][matrixSize - 8] = 0;
      grid[matrixSize - 8][i] = 0;
      grid[matrixSize - 1 - i][7] = 0;
    }

    // Timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      grid[6][i] = (i % 2 === 0) ? 1 : 0;
      grid[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Alignment pattern for V2 (at row 18, col 18)
    const alRow = 18, alCol = 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          grid[alRow + r][alCol + c] = 1;
        } else {
          grid[alRow + r][alCol + c] = 0;
        }
      }
    }

    // Hash the input string to deterministically fill the payload area
    let hash = 2166136261;
    for (let i = 0; i < dataString.length; i++) {
      hash ^= dataString.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    // Fill remaining data modules with deterministic pseudo-random bits based on hash
    let lcg = Math.abs(hash);
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip reserved finder / alignment / timing areas
        const isFinderTL = (r < 9 && c < 9);
        const isFinderTR = (r < 9 && c >= matrixSize - 8);
        const isFinderBL = (r >= matrixSize - 8 && c < 9);
        const isTiming = (r === 6 || c === 6);
        const isAlign = (r >= 16 && r <= 20 && c >= 16 && c <= 20);

        if (!isFinderTL && !isFinderTR && !isFinderBL && !isTiming && !isAlign) {
          lcg = (lcg * 1664525 + 1013904223) % 4294967296;
          grid[r][c] = (lcg % 2 === 0) ? 1 : 0;
        }
      }
    }

    // Convert grid to crisp SVG
    const moduleSize = 6;
    const padding = 12;
    const totalPx = matrixSize * moduleSize + padding * 2;
    let rects = `<rect width="${totalPx}" height="${totalPx}" fill="#ffffff" />`;

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (grid[r][c] === 1) {
          const x = padding + c * moduleSize;
          const y = padding + r * moduleSize;
          rects += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="#0f172a" />`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalPx} ${totalPx}" width="${size}" height="${size}" shape-rendering="crispEdges">${rects}</svg>`;
  }

  // ANIME-STYLE CUT-IN EYE BANNER SVG
  function getCutInEyesSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" width="100%" height="60" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cutin-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ea2527" stop-opacity="0.95"/>
          <stop offset="40%" stop-color="#12151f" stop-opacity="0.95"/>
          <stop offset="70%" stop-color="#100e0c" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#f9e60b" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <polygon points="0,0 400,0 370,60 0,60" fill="url(#cutin-bg)"/>
      <line x1="0" y1="2" x2="400" y2="2" stroke="#f9e60b" stroke-width="2"/>
      <line x1="0" y1="58" x2="370" y2="58" stroke="#ea2527" stroke-width="2"/>
      <!-- Speed lines -->
      <line x1="10" y1="15" x2="120" y2="15" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
      <line x1="40" y1="30" x2="200" y2="30" stroke="#f9e60b" stroke-width="2" opacity="0.8"/>
      <line x1="15" y1="45" x2="150" y2="45" stroke="#ffffff" stroke-width="1.5" opacity="0.5"/>
      <!-- Glowing Eyes -->
      <polygon points="230,22 270,22 280,32 235,32" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)"/>
      <polygon points="295,32 340,22 350,22 305,32" fill="#00f0ff" filter="drop-shadow(0 0 6px #00f0ff)"/>
      <polygon points="250,25 265,25 260,30 252,30" fill="#ffffff"/>
      <polygon points="315,25 330,25 325,30 317,30" fill="#ffffff"/>
    </svg>`;
  }

  // CYBER RELIC ICONS
  function getRelicSvg(relicId, size = 48) {
    if (relicId === 'nanite_edge') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect x="7" y="1" width="2" height="10" fill="#f9e60b"/>
        <rect x="6" y="3" width="4" height="2" fill="#ffffff"/>
        <rect x="5" y="11" width="6" height="2" fill="#ea2527"/>
        <rect x="7" y="13" width="2" height="3" fill="#38bdf8"/>
      </svg>`;
    } else if (relicId === 'kinetic_barrier') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect x="2" y="2" width="12" height="12" fill="none" stroke="#38bdf8" stroke-width="2"/>
        <rect x="5" y="5" width="6" height="6" fill="#06b6d4"/>
        <rect x="7" y="7" width="2" height="2" fill="#ffffff"/>
      </svg>`;
    } else if (relicId === 'overclock_coil') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect x="4" y="2" width="8" height="2" fill="#f9e60b"/>
        <rect x="2" y="4" width="4" height="4" fill="#f97316"/>
        <rect x="10" y="8" width="4" height="4" fill="#f97316"/>
        <rect x="4" y="12" width="8" height="2" fill="#f9e60b"/>
        <rect x="6" y="6" width="4" height="4" fill="#ffffff"/>
      </svg>`;
    } else if (relicId === 'vampiric_equations') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect x="4" y="3" width="8" height="2" fill="#ea2527"/>
        <rect x="3" y="5" width="10" height="4" fill="#ef4444"/>
        <rect x="5" y="9" width="6" height="4" fill="#b91c1c"/>
        <rect x="7" y="13" width="2" height="2" fill="#7f1d1d"/>
        <rect x="6" y="5" width="4" height="2" fill="#ffffff"/>
      </svg>`;
    } else {
      // chronos_shard
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect x="4" y="2" width="8" height="2" fill="#a855f7"/>
        <rect x="3" y="4" width="10" height="2" fill="#c084fc"/>
        <rect x="5" y="6" width="6" height="4" fill="#e9d5ff"/>
        <rect x="7" y="7" width="2" height="2" fill="#ffffff"/>
        <rect x="3" y="10" width="10" height="2" fill="#c084fc"/>
        <rect x="4" y="12" width="8" height="2" fill="#a855f7"/>
      </svg>`;
    }
  }

  // PUBLIC SPRITE GETTERS
  return {
    getHeroSprite: (pose = 'idle', scale = 5) => {
      return createPixelSprite(20, 24, pose === 'cast' ? heroCastPixels : heroIdlePixels, heroPalette, scale);
    },
    getImpSprite: (scale = 6) => {
      return createPixelSprite(22, 22, impPixels, impPalette, scale);
    },
    getGolemSprite: (scale = 6) => {
      return createPixelSprite(24, 26, golemPixels, golemPalette, scale);
    },
    getDragonSprite: (scale = 6) => {
      return createPixelSprite(28, 28, dragonPixels, dragonPalette, scale);
    },
    getFireballSvg,
    getShieldSvg,
    getLightningSvg,
    getFreezeSvg,
    getHeartSvg,
    getManaSvg,
    getTrophySvg,
    getTicketSvg,
    generateTicketQrSvg,
    getCutInEyesSvg,
    getRelicSvg
  };
})();

// Attach to global for browser and runtime access
const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
if (globalScope) {
  globalScope.SvgAssets = SvgAssets;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SvgAssets;
}
