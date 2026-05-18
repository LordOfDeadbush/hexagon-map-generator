const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const seedInput = document.getElementById("seedInput");

const COLORS = [
    "#e74c3c", // red
    "#3498db", // blue
    "#2ecc71", // green
    "#f1c40f", // yellow
    "#9b59b6", // purple
    "#e67e22"  // orange
];

// ======================
// SETTINGS
// ======================

const HEX_SIZE = 40;
const ROWS = 8;
const COLS = 10;

// ======================
// SEEDED RNG
// ======================

// Convert string -> numeric seed
function hashString(str) {

    let h = 1779033703;

    for (let i = 0; i < str.length; i++) {

        h = Math.imul(
            h ^ str.charCodeAt(i),
            3432918353
        );

        h = (h << 13) | (h >>> 19);
    }

    return function() {

        h = Math.imul(
            h ^ (h >>> 16),
            2246822507
        );

        h = Math.imul(
            h ^ (h >>> 13),
            3266489909
        );

        return (h ^= h >>> 16) >>> 0;
    };
}

// Deterministic PRNG
function mulberry32(a) {

    return function() {

        let t = a += 0x6D2B79F5;

        t = Math.imul(
            t ^ (t >>> 15),
            t | 1
        );

        t ^= t + Math.imul(
            t ^ (t >>> 7),
            t | 61
        );

        return (
            (t ^ (t >>> 14)) >>> 0
        ) / 4294967296;
    };
}

// ======================
// DRAW HEXAGON
// ======================

function drawHex(x, y, size, color) {

    ctx.beginPath();

    for (let i = 0; i < 6; i++) {

        const angle =
            Math.PI / 180 * (60 * i - 30);

        const px =
            x + size * Math.cos(angle);

        const py =
            y + size * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    ctx.stroke();
}

// ======================
// GENERATE MAP
// ======================

function generateMap(seedString) {

    // Clear old map
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Create seeded RNG
    const seedFunc = hashString(seedString);

    const rand = mulberry32(
        seedFunc()
    );

    // Smaller circular-ish map
    // Radius 2 = classic small Catan-like shape
    const MAP_RADIUS = 2;

    const hexWidth =
        HEX_SIZE * Math.sqrt(3);

    const hexHeight =
        HEX_SIZE * 2;

    const centerX =
        canvas.width / 2;

    const centerY =
        canvas.height / 2;

    // Axial coordinates
    for (let q = -MAP_RADIUS; q <= MAP_RADIUS; q++) {

        const r1 = Math.max(
            -MAP_RADIUS,
            -q - MAP_RADIUS
        );

        const r2 = Math.min(
            MAP_RADIUS,
            -q + MAP_RADIUS
        );

        for (let r = r1; r <= r2; r++) {

            // Convert axial -> pixel
            const x =
                centerX +
                hexWidth * (
                    q + r / 2
                );

            const y =
                centerY +
                HEX_SIZE * 1.5 * r;

            const colorIndex =
                Math.floor(
                    rand() * COLORS.length
                );

            const color =
                COLORS[colorIndex];

            drawHex(
                x,
                y,
                HEX_SIZE,
                color
            );
        }
    }

    console.log(
        "Generated with seed:",
        seedString
    );
}

// ======================
// RANDOM SEED
// ======================

function randomSeed() {

    return Math.random()
        .toString(36)
        .substring(2, 12);
}

// ======================
// BUTTON EVENTS
// ======================

document
.getElementById("randomBtn")
.addEventListener("click", () => {

    const seed = randomSeed();

    seedInput.value = seed;

    generateMap(seed);
});

document
.getElementById("generateBtn")
.addEventListener("click", () => {

    let seed =
        seedInput.value.trim();

    if (!seed) {

        seed = randomSeed();

        seedInput.value = seed;
    }

    generateMap(seed);
});

// ======================
// INITIAL MAP
// ======================

const initialSeed = randomSeed();

seedInput.value = initialSeed;

generateMap(initialSeed);