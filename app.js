const MIN_DICE = 1;
const MAX_DICE = 6;

const PALETTE = [
  { name: "Red",    hex: "#e5484d", pip: "#ffffff" },
  { name: "Orange", hex: "#f5a524", pip: "#1a1a1a" },
  { name: "Yellow", hex: "#f6e05e", pip: "#1a1a1a" },
  { name: "Green",  hex: "#46a758", pip: "#ffffff" },
  { name: "Blue",   hex: "#3b82f6", pip: "#ffffff" },
  { name: "Purple", hex: "#9d5bd2", pip: "#ffffff" },
];

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

let dice = [];

function randomFace() {
  return 1 + Math.floor(Math.random() * 6);
}

function createDie(colorIndex) {
  return { value: randomFace(), colorIndex };
}

function setDiceCount(count) {
  count = Math.max(MIN_DICE, Math.min(MAX_DICE, count));
  if (count > dice.length) {
    while (dice.length < count) {
      dice.push(createDie(dice.length % PALETTE.length));
    }
  } else {
    dice.length = count;
  }
  document.getElementById("count-value").textContent = String(count);
  document.getElementById("count-down").disabled = count <= MIN_DICE;
  document.getElementById("count-up").disabled = count >= MAX_DICE;
  renderTray();
}

function pipSvg(value, colorIndex) {
  const color = PALETTE[colorIndex];
  const pips = PIP_LAYOUTS[value]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${color.pip}"/>`)
    .join("");
  return `
    <svg class="die-face" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="18" fill="${color.hex}"/>
      ${pips}
    </svg>`;
}

function swatchRow(die, index) {
  return PALETTE.map((c, i) => `
    <button class="swatch${i === die.colorIndex ? " selected" : ""}"
      style="background:${c.hex}"
      data-die-index="${index}" data-color-index="${i}"
      aria-label="${c.name}"></button>
  `).join("");
}

function renderTray() {
  const tray = document.getElementById("dice-tray");
  tray.innerHTML = dice.map((die, index) => `
    <div class="die" data-index="${index}">
      <div class="die-face-wrap">${pipSvg(die.value, die.colorIndex)}</div>
      <div class="swatches">${swatchRow(die, index)}</div>
    </div>
  `).join("");
}

function rollAll() {
  const dieEls = document.querySelectorAll(".die");
  dieEls.forEach((el) => el.classList.add("rolling"));

  const flickerMs = 60;
  const durationMs = 500;
  const flickerInterval = setInterval(() => {
    dice.forEach((die) => { die.value = randomFace(); });
    dieEls.forEach((el, i) => {
      el.querySelector(".die-face-wrap").innerHTML = pipSvg(dice[i].value, dice[i].colorIndex);
    });
  }, flickerMs);

  setTimeout(() => {
    clearInterval(flickerInterval);
    dice.forEach((die) => { die.value = randomFace(); });
    renderTray();
  }, durationMs);
}

document.getElementById("count-up").addEventListener("click", () => setDiceCount(dice.length + 1));
document.getElementById("count-down").addEventListener("click", () => setDiceCount(dice.length - 1));
document.getElementById("roll-btn").addEventListener("click", rollAll);

document.getElementById("dice-tray").addEventListener("click", (e) => {
  const swatch = e.target.closest(".swatch");
  if (!swatch) return;
  const dieIndex = Number(swatch.dataset.dieIndex);
  const colorIndex = Number(swatch.dataset.colorIndex);
  dice[dieIndex].colorIndex = colorIndex;
  renderTray();
});

setDiceCount(2);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
