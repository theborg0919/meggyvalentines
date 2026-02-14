import { content } from "./content.config.js";

const STORAGE_KEYS = {
  completed: "valentine_v1_completed",
  progress: "valentine_v1_progress",
};

const app = document.querySelector("#app");
const text = content.uiText;

const flow = [
  { type: "welcome" },
  { type: "scene", sceneIndex: 0 },
  { type: "game", gameId: "heartCatch" },
  { type: "scene", sceneIndex: 1 },
  { type: "scene", sceneIndex: 2 },
  { type: "game", gameId: "memoryMatch" },
  { type: "scene", sceneIndex: 3 },
  { type: "final" },
];

const state = {
  stepIndex: 0,
  completed: false,
  gameScores: {
    heartCatch: 0,
    memoryMatch: 0,
  },
  unlockedSteps: 0,
  startedAt: Date.now(),
  showCompletedLanding: false,
};

let cleanupCurrentStep = null;

init();

function init() {
  document.title = content.appMeta.title;
  hydrateState();
  render();
}

function hydrateState() {
  const completed = localStorage.getItem(STORAGE_KEYS.completed) === "true";
  if (completed) {
    state.completed = true;
    state.showCompletedLanding = true;
    state.stepIndex = flow.length - 1;
    state.unlockedSteps = flow.length - 1;
    return;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.progress);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.stepIndex === "number") {
      state.stepIndex = clamp(parsed.stepIndex, 0, flow.length - 1);
    }
    if (typeof parsed.unlockedSteps === "number") {
      state.unlockedSteps = clamp(parsed.unlockedSteps, 0, flow.length - 1);
    }
    if (parsed.gameScores && typeof parsed.gameScores === "object") {
      state.gameScores.heartCatch = Number(parsed.gameScores.heartCatch || 0);
      state.gameScores.memoryMatch = Number(parsed.gameScores.memoryMatch || 0);
    }
    if (typeof parsed.startedAt === "number") {
      state.startedAt = parsed.startedAt;
    }
  } catch (error) {
    console.warn("Could not read progress:", error);
  }
}

function saveProgress() {
  if (state.completed) return;
  const data = {
    stepIndex: state.stepIndex,
    unlockedSteps: state.unlockedSteps,
    gameScores: state.gameScores,
    startedAt: state.startedAt,
  };
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(data));
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEYS.progress);
}

function markCompleted() {
  state.completed = true;
  localStorage.setItem(STORAGE_KEYS.completed, "true");
  clearProgress();
}

function resetForReplay(toFinal = false) {
  state.completed = false;
  state.showCompletedLanding = false;
  state.gameScores = { heartCatch: 0, memoryMatch: 0 };
  state.unlockedSteps = toFinal ? flow.length - 1 : 0;
  state.stepIndex = toFinal ? flow.length - 1 : 0;
  state.startedAt = Date.now();
  localStorage.removeItem(STORAGE_KEYS.completed);
  if (!toFinal) {
    saveProgress();
  } else {
    clearProgress();
  }
}

function goNext() {
  if (state.stepIndex >= flow.length - 1) return;
  state.stepIndex += 1;
  state.unlockedSteps = Math.max(state.unlockedSteps, state.stepIndex);
  saveProgress();
  render();
}

function render() {
  if (cleanupCurrentStep) {
    cleanupCurrentStep();
    cleanupCurrentStep = null;
  }

  if (state.showCompletedLanding) {
    renderCompletedLanding();
    return;
  }

  const step = flow[state.stepIndex];
  preloadUpcomingImages(state.stepIndex);

  switch (step.type) {
    case "welcome":
      renderWelcome();
      break;
    case "scene":
      renderScene(step.sceneIndex);
      break;
    case "game":
      if (step.gameId === "heartCatch") {
        cleanupCurrentStep = renderHeartCatchGame();
      } else if (step.gameId === "memoryMatch") {
        cleanupCurrentStep = renderMemoryGame();
      }
      break;
    case "final":
      renderFinal();
      break;
    default:
      renderWelcome();
      break;
  }
}

function renderCompletedLanding() {
  app.innerHTML = `
    <section class="card">
      <p class="chip">${escapeHtml(text.completed.chip)}</p>
      <h1 class="title">${escapeHtml(text.completed.titlePrefix)} ${escapeHtml(content.appMeta.recipientName)}.</h1>
      <p class="message">
        ${escapeHtml(text.completed.message)}
      </p>
      <div class="actions">
        <button class="btn btn-primary" id="replayBtn">${escapeHtml(text.completed.replayButton)}</button>
        <button class="btn btn-secondary" id="jumpFinalBtn">${escapeHtml(text.completed.jumpFinalButton)}</button>
      </div>
    </section>
  `;

  app.querySelector("#replayBtn").addEventListener("click", () => {
    resetForReplay(false);
    render();
  });

  app.querySelector("#jumpFinalBtn").addEventListener("click", () => {
    resetForReplay(true);
    render();
  });
}

function renderWelcome() {
  app.innerHTML = `
    <section class="card">
      <p class="chip">${escapeHtml(text.welcome.chipPrefix)} ${escapeHtml(content.appMeta.recipientName)}</p>
      <h1 class="title">${escapeHtml(content.appMeta.title)}</h1>
      <p class="message">
        ${escapeHtml(text.welcome.message)}
      </p>
      <div class="actions">
        <button class="btn btn-primary" id="startBtn">${escapeHtml(text.welcome.startButton)}</button>
      </div>
    </section>
  `;
  app.querySelector("#startBtn").addEventListener("click", goNext);
}

function renderScene(sceneIndex) {
  const scene = content.scenes[sceneIndex];
  const photoIndex = normalizePhotoIndex(scene.photoSlot ?? sceneIndex);

  let imageHtml = "";
  if (sceneIndex === 3) {
    imageHtml = renderPhotoCollage([photoIndex, photoIndex + 1, photoIndex + 2]);
  } else {
    imageHtml = renderSinglePhoto(photoIndex, scene.title);
  }

  app.innerHTML = `
    <section class="card">
      <p class="chip">${escapeHtml(text.scene.chipPrefix)} ${sceneIndex + 1} ${escapeHtml(text.scene.chipConnector)} ${content.scenes.length}</p>
      <h2 class="title">${escapeHtml(scene.title)}</h2>
      <p class="message">${escapeHtml(scene.message)}</p>
      ${imageHtml}
      <div class="actions">
        <button class="btn btn-primary" id="nextSceneBtn">${escapeHtml(text.scene.nextButton)}</button>
      </div>
    </section>
  `;
  addImageFallbackHandlers();
  app.querySelector("#nextSceneBtn").addEventListener("click", goNext);
}

function renderSinglePhoto(photoIndex, altText) {
  const filename = content.photos[normalizePhotoIndex(photoIndex)];
  const caption =
    content.captions?.[normalizePhotoIndex(photoIndex)] || text.photos.fallbackCaption;
  return `
    <figure class="photo-frame">
      <img
        src="${toPhotoPath(filename)}"
        alt="${escapeHtml(altText)}"
        loading="lazy"
        decoding="async"
        class="photo"
        data-photo-fallback="true"
      />
      <figcaption>${escapeHtml(caption)}</figcaption>
    </figure>
  `;
}

function renderPhotoCollage(photoIndexes) {
  const items = photoIndexes
    .map((index, i) => {
      const normalized = normalizePhotoIndex(index);
      const filename = content.photos[normalized];
      const caption =
        content.captions?.[normalized] || `${text.photos.collageCaptionPrefix} ${i + 1}`;
      return `
        <figure class="photo-frame collage-item">
          <img
            src="${toPhotoPath(filename)}"
            alt="${escapeHtml(text.photos.collageAltPrefix)} ${i + 1}"
            loading="lazy"
            decoding="async"
            class="photo"
            data-photo-fallback="true"
          />
          <figcaption>${escapeHtml(caption)}</figcaption>
        </figure>
      `;
    })
    .join("");

  return `<div class="photo-collage">${items}</div>`;
}

function renderHeartCatchGame() {
  const settings = content.miniGames.heartCatch;
  app.innerHTML = `
    <section class="card game-card">
      <p class="chip">${escapeHtml(text.heartCatch.chip)}</p>
      <h2 class="title">${escapeHtml(text.heartCatch.title)}</h2>
      <p class="message">
        ${escapeHtml(text.heartCatch.instructionsPrefix)} ${settings.targetScore} ${escapeHtml(text.heartCatch.instructionsMiddle)}
        ${settings.durationSeconds} ${escapeHtml(text.heartCatch.instructionsSuffix)}
      </p>
      <div class="game-status">
        <span id="heartScore">${escapeHtml(text.heartCatch.scoreLabel)} 0</span>
        <span id="heartTime">${escapeHtml(text.heartCatch.timeLabel)} ${settings.durationSeconds}s</span>
      </div>
      <div class="heart-arena" id="heartArena">
        <button class="heart-target" id="heartTarget" aria-label="${escapeHtml(text.heartCatch.ariaTapHeart)}">${escapeHtml(text.heartCatch.icon)}</button>
      </div>
      <p class="game-note" id="heartNote">${escapeHtml(text.heartCatch.readyNote)}</p>
      <div class="actions">
        <button class="btn btn-secondary" id="startHeartGameBtn">${escapeHtml(text.heartCatch.startButton)}</button>
        <button class="btn btn-primary hidden" id="afterHeartBtn">${escapeHtml(text.heartCatch.continueButton)}</button>
        <button class="btn btn-secondary hidden" id="retryHeartBtn">${escapeHtml(text.heartCatch.retryButton)}</button>
      </div>
    </section>
  `;

  const scoreEl = app.querySelector("#heartScore");
  const timeEl = app.querySelector("#heartTime");
  const noteEl = app.querySelector("#heartNote");
  const arenaEl = app.querySelector("#heartArena");
  const heartEl = app.querySelector("#heartTarget");
  const startBtn = app.querySelector("#startHeartGameBtn");
  const continueBtn = app.querySelector("#afterHeartBtn");
  const retryBtn = app.querySelector("#retryHeartBtn");

  let score = 0;
  let secondsLeft = settings.durationSeconds;
  let canTap = false;
  let tickInterval = null;
  let moveInterval = null;

  const placeHeart = () => {
    const arenaRect = arenaEl.getBoundingClientRect();
    const targetRect = heartEl.getBoundingClientRect();
    const maxX = Math.max(0, arenaRect.width - targetRect.width - 8);
    const maxY = Math.max(0, arenaRect.height - targetRect.height - 8);
    const x = Math.round(Math.random() * maxX);
    const y = Math.round(Math.random() * maxY);
    heartEl.style.left = `${x}px`;
    heartEl.style.top = `${y}px`;
  };

  const stopTimers = () => {
    if (tickInterval) clearInterval(tickInterval);
    if (moveInterval) clearInterval(moveInterval);
    tickInterval = null;
    moveInterval = null;
  };

  const finishGame = () => {
    canTap = false;
    stopTimers();
    const passed = score >= settings.targetScore;
    state.gameScores.heartCatch = score;
    saveProgress();

    if (passed) {
      noteEl.textContent = text.heartCatch.passNote;
      continueBtn.classList.remove("hidden");
      retryBtn.classList.add("hidden");
    } else {
      noteEl.textContent = text.heartCatch.failNote;
      retryBtn.classList.remove("hidden");
      continueBtn.classList.add("hidden");
    }
    startBtn.classList.add("hidden");
  };

  startBtn.addEventListener("click", () => {
    startBtn.classList.add("hidden");
    score = 0;
    secondsLeft = settings.durationSeconds;
    canTap = true;
    scoreEl.textContent = `${text.heartCatch.scoreLabel} ${score}`;
    timeEl.textContent = `${text.heartCatch.timeLabel} ${secondsLeft}s`;
    noteEl.textContent = text.heartCatch.goNote;
    placeHeart();
    moveInterval = setInterval(placeHeart, settings.moveEveryMs);
    tickInterval = setInterval(() => {
      secondsLeft -= 1;
      timeEl.textContent = `${text.heartCatch.timeLabel} ${secondsLeft}s`;
      if (secondsLeft <= 0) {
        finishGame();
      }
    }, 1000);
  });

  heartEl.addEventListener("click", () => {
    if (!canTap) return;
    score += 1;
    scoreEl.textContent = `${text.heartCatch.scoreLabel} ${score}`;
    placeHeart();
  });

  continueBtn.addEventListener("click", goNext);
  retryBtn.addEventListener("click", () => render());

  return stopTimers;
}

function renderMemoryGame() {
  const settings = content.miniGames.memoryMatch;
  const pairCount = settings.pairs;
  const icons = text.memoryMatch.icons;
  const selected = shuffle(icons).slice(0, pairCount);
  const deck = shuffle([...selected, ...selected]).map((value, index) => ({
    id: index,
    value,
    matched: false,
  }));

  app.innerHTML = `
    <section class="card game-card">
      <p class="chip">${escapeHtml(text.memoryMatch.chip)}</p>
      <h2 class="title">${escapeHtml(text.memoryMatch.title)}</h2>
      <p class="message">
        ${escapeHtml(text.memoryMatch.instructionsPrefix)} ${pairCount}
        ${escapeHtml(text.memoryMatch.instructionsMiddle)} ${escapeHtml(text.memoryMatch.instructionsSuffix)}
      </p>
      <div class="game-status">
        <span id="memoryPairs">${escapeHtml(text.memoryMatch.pairsLeftLabel)} ${pairCount}</span>
        <span id="memoryTime">${escapeHtml(text.memoryMatch.timeLabel)} ${settings.durationSeconds}s</span>
      </div>
      <div class="memory-grid" id="memoryGrid" role="grid" aria-label="${escapeHtml(text.memoryMatch.gridAriaLabel)}"></div>
      <p class="game-note" id="memoryNote">${escapeHtml(text.memoryMatch.noteStart)}</p>
      <div class="actions">
        <button class="btn btn-primary hidden" id="afterMemoryBtn">${escapeHtml(text.memoryMatch.continueButton)}</button>
        <button class="btn btn-secondary hidden" id="retryMemoryBtn">${escapeHtml(text.memoryMatch.retryButton)}</button>
      </div>
    </section>
  `;

  const gridEl = app.querySelector("#memoryGrid");
  const pairsEl = app.querySelector("#memoryPairs");
  const timeEl = app.querySelector("#memoryTime");
  const noteEl = app.querySelector("#memoryNote");
  const continueBtn = app.querySelector("#afterMemoryBtn");
  const retryBtn = app.querySelector("#retryMemoryBtn");

  let secondsLeft = settings.durationSeconds;
  let timerStarted = false;
  let timer = null;
  let lock = false;
  let matches = 0;
  let firstCard = null;
  let secondCard = null;
  let attempts = 0;

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    timer = setInterval(() => {
      secondsLeft -= 1;
      timeEl.textContent = `${text.memoryMatch.timeLabel} ${secondsLeft}s`;
      if (secondsLeft <= 0) {
        loseGame();
      }
    }, 1000);
  }

  function winGame() {
    stopTimer();
    state.gameScores.memoryMatch = attempts;
    saveProgress();
    noteEl.textContent = text.memoryMatch.noteWin;
    continueBtn.classList.remove("hidden");
  }

  function loseGame() {
    stopTimer();
    lock = true;
    noteEl.textContent = text.memoryMatch.noteLose;
    retryBtn.classList.remove("hidden");
  }

  function onCardClick(cardEl, cardData) {
    if (lock || cardData.matched || cardEl.classList.contains("flipped")) return;
    startTimer();

    cardEl.classList.add("flipped");
    cardEl.querySelector(".card-face--front").textContent = cardData.value;

    if (!firstCard) {
      firstCard = { cardEl, cardData };
      return;
    }

    if (firstCard.cardData.id === cardData.id) return;
    secondCard = { cardEl, cardData };
    lock = true;
    attempts += 1;

    const isMatch = firstCard.cardData.value === secondCard.cardData.value;
    if (isMatch) {
      firstCard.cardData.matched = true;
      secondCard.cardData.matched = true;
      firstCard.cardEl.classList.add("matched");
      secondCard.cardEl.classList.add("matched");
      matches += 1;
      pairsEl.textContent = `${text.memoryMatch.pairsLeftLabel} ${pairCount - matches}`;
      resetTurn();
      if (matches === pairCount) {
        winGame();
      }
    } else {
      setTimeout(() => {
        firstCard.cardEl.classList.remove("flipped");
        secondCard.cardEl.classList.remove("flipped");
        firstCard.cardEl.querySelector(".card-face--front").textContent = "";
        secondCard.cardEl.querySelector(".card-face--front").textContent = "";
        resetTurn();
      }, 700);
    }
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  deck.forEach((cardData) => {
    const button = document.createElement("button");
    button.className = "memory-card";
    button.type = "button";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", text.memoryMatch.cardAriaLabel);
    button.innerHTML = `
      <span class="card-face card-face--front" aria-hidden="true"></span>
      <span class="card-face card-face--back" aria-hidden="true">${escapeHtml(text.memoryMatch.cardBackLabel)}</span>
    `;
    button.addEventListener("click", () => onCardClick(button, cardData));
    gridEl.appendChild(button);
  });

  continueBtn.addEventListener("click", goNext);
  retryBtn.addEventListener("click", () => render());

  return stopTimer;
}

function renderFinal() {
  markCompleted();
  app.innerHTML = `
    <section class="card">
      <p class="chip">${escapeHtml(text.final.chip)}</p>
      <h2 class="title">${escapeHtml(content.finalLetter.title)}</h2>
      <div class="letter">
        ${formatLetterMessage(content.finalLetter.message)}
      </div>
      <p class="signature">${escapeHtml(text.final.signaturePrefix)} ${escapeHtml(content.appMeta.senderName)}</p>
      <div class="actions">
        <button class="btn btn-primary" id="replayFinalBtn">${escapeHtml(text.final.replayButton)}</button>
      </div>
    </section>
  `;
  app.querySelector("#replayFinalBtn").addEventListener("click", () => {
    resetForReplay(false);
    render();
  });
}

function formatLetterMessage(message) {
  if (Array.isArray(message)) {
    return message
      .map((line) => `<p>${line ? escapeHtml(line) : "&nbsp;"}</p>`)
      .join("");
  }

  const raw = String(message ?? "").trim();
  if (!raw) return "";

  return raw
    .split(/\r?\n\s*\r?\n/g)
    .map((paragraph) => paragraph.replace(/\r?\n+/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function normalizePhotoIndex(index) {
  if (!content.photos.length) return 0;
  const i = Number(index) || 0;
  return ((i % content.photos.length) + content.photos.length) % content.photos.length;
}

function toPhotoPath(filename) {
  return `assets/photos/${filename}`;
}

function addImageFallbackHandlers() {
  const imgs = app.querySelectorAll('img[data-photo-fallback="true"]');
  imgs.forEach((img) => {
    img.addEventListener("error", () => {
      const frame = img.closest(".photo-frame");
      if (!frame) return;
      frame.innerHTML = `
        <div class="photo-fallback" role="img" aria-label="Missing photo placeholder">
          <span>${escapeHtml(text.photos.missingTitle)}</span>
          <small>${escapeHtml(text.photos.missingHint)}</small>
        </div>
      `;
    });
  });
}

function preloadUpcomingImages(stepIndex) {
  const upcomingScenePhotos = [];
  for (let i = stepIndex + 1; i < Math.min(flow.length, stepIndex + 4); i += 1) {
    const step = flow[i];
    if (step.type === "scene") {
      const slot = content.scenes[step.sceneIndex]?.photoSlot ?? step.sceneIndex;
      upcomingScenePhotos.push(slot);
      if (step.sceneIndex === 3) {
        upcomingScenePhotos.push(slot + 1, slot + 2);
      }
    }
  }

  const unique = [...new Set(upcomingScenePhotos.map(normalizePhotoIndex))].slice(0, 2);
  unique.forEach((photoIndex) => {
    const image = new Image();
    image.src = toPhotoPath(content.photos[photoIndex]);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(array) {
  const next = [...array];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
