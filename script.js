const chapters = [
  {
    name: "The moth",
    eyebrow: "Where silk begins",
    description: "The journey begins with a small silk moth.",
    factTop: "4–6 days",
    factBottom: "life of a silk moth",
  },
  {
    name: "The eggs",
    eyebrow: "On mulberry leaves",
    description: "It lays hundreds of tiny eggs on soft mulberry leaves.",
    factTop: "300–500",
    factBottom: "eggs from one moth",
  },
  {
    name: "The silkworm",
    eyebrow: "Days of growing",
    description: "The eggs hatch. The silkworms feed on mulberry leaves and grow quickly.",
    factTop: "10,000×",
    factBottom: "its first weight",
  },
  {
    name: "The cocoon",
    eyebrow: "Spinning the cocoon",
    description: "Each silkworm wraps one continuous thread around itself to form a cocoon.",
    factTop: "2–3 days",
    factBottom: "to spin a cocoon",
  },
  {
    name: "The thread",
    eyebrow: "Unwinding the thread",
    description: "Warm water softens the cocoon, allowing its fine silk thread to be gently unwound.",
    factTop: "Up to 1 km",
    factBottom: "thread from one cocoon",
  },
  {
    name: "The colour",
    eyebrow: "Adding colour",
    description: "The threads are cleaned, twisted and dipped into rich colour.",
    factTop: "Many shades",
    factBottom: "held by silk",
  },
  {
    name: "The weaving",
    eyebrow: "At the loom",
    description: "In the artisan's hands, warp and weft cross again and again until fabric appears.",
    factTop: "Warp + weft",
    factBottom: "become one cloth",
  },
  {
    name: "The silk",
    eyebrow: "The journey complete",
    description: "Thousands of threads, patient hands and time come together as silk fabric.",
    factTop: "One journey",
    factBottom: "from moth to silk",
  },
];

const selectors = {
  moon: [".moon", ".moon-halo", ".moon-crater"],
  branch: [".branch-scene"],
  moth: [".moth", ".flight-path"],
  eggs: [".egg-scene"],
  worm: [".worm-scene"],
  cocoon: [".cocoon-scene"],
  reel: [".reel-scene"],
  dye: [".dye-scene"],
  loom: [".loom-scene"],
  fabric: [".fabric-scene", ".final-moth"],
};

const els = {
  root: document.documentElement,
  body: document.body,
  story: document.querySelector(".story"),
  scrollSpace: document.querySelector(".scroll-space"),
  visual: document.querySelector("#silkVisual"),
  moth: document.querySelector("#moth"),
  flightPath: document.querySelector("#flightPath"),
  chapterNumber: document.querySelector("#chapterNumber"),
  chapterName: document.querySelector("#chapterName"),
  eyebrow: document.querySelector("#eyebrow"),
  description: document.querySelector("#description"),
  titles: [...document.querySelectorAll(".title")],
  factCard: document.querySelector("#factCard"),
  factIndex: document.querySelector(".fact-index"),
  factStrong: document.querySelector(".fact-card strong"),
  factText: document.querySelector(".fact-card p span"),
  dots: [...document.querySelectorAll(".timeline-dot")],
  replayButton: document.querySelector("#replayButton"),
  cursor: document.querySelector(".cursor"),
  spinningThread: document.querySelector("#spinningThread"),
  longThread: document.querySelector("#longThread"),
  shuttle: document.querySelector("#shuttle"),
  wovenLines: [...document.querySelectorAll(".woven-lines path")],
  eggs: [...document.querySelectorAll(".eggs circle")],
  bites: [...document.querySelectorAll(".bite")],
  eggCracks: document.querySelector(".egg-cracks"),
  dyeThreads: [...document.querySelectorAll(".dye-thread")],
  transitionBloom: document.querySelector("#transitionBloom"),
  transitionRing: document.querySelector("#transitionRing"),
  metamorphPath: document.querySelector("#metamorphPath"),
  metamorphParticles: document.querySelector("#metamorphParticles"),
  cursorTrailPath: document.querySelector("#cursorTrailPath"),
  fabricScene: document.querySelector(".fabric-scene"),
};

const sceneElements = Object.fromEntries(
  Object.entries(selectors).map(([key, values]) => [
    key,
    values.flatMap((selector) => [...document.querySelectorAll(selector)]),
  ]),
);

let maxScroll = 1;
let currentProgress = 0;
let targetProgress = 0;
let currentChapter = -1;
let animationFrame = 0;
let previewProgress = null;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mix = (start, end, amount) => start + (end - start) * amount;
const smoothstep = (start, end, value) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
const windowed = (progress, start, peakIn, peakOut, end) =>
  smoothstep(start, peakIn, progress) * (1 - smoothstep(peakOut, end, progress));

const metamorphKeyframes = [
  [360, 480, 480, 150, 760, 200, 700, 450],
  [340, 390, 420, 315, 565, 525, 650, 380],
  [285, 435, 382, 326, 548, 492, 652, 348],
  [594, 360, 704, 284, 706, 526, 520, 558],
  [72, 314, 252, 152, 535, 578, 812, 244],
  [132, 194, 336, 346, 607, 250, 784, 188],
  [208, 292, 348, 292, 532, 462, 692, 448],
  [232, 282, 380, 218, 564, 220, 720, 282],
];

const transitionCenters = [
  [472, 420],
  [475, 408],
  [482, 420],
  [605, 390],
  [478, 430],
  [495, 385],
  [482, 388],
];

const eggMorphTargets = [
  [-66, -3], [-55, 1], [-44, 10], [49, -27],
  [57, -49], [63, -71], [-52, -62], [77, -93],
];

function setOpacity(group, opacity) {
  sceneElements[group].forEach((el) => {
    el.style.opacity = clamp(opacity);
  });
}

function setTransform(elements, transform) {
  elements.forEach((el) => {
    el.style.transform = transform;
  });
}

function createStars() {
  const group = document.querySelector("#stars");
  const points = [
    [384, 151, 2], [456, 104, 1.5], [555, 123, 2.2], [662, 166, 1.2],
    [739, 253, 1.8], [805, 343, 1.3], [712, 497, 1.8], [585, 565, 1.2],
    [352, 211, 1.2], [315, 331, 1.8], [770, 126, 1.1], [834, 226, 1.5],
  ];

  points.forEach(([cx, cy, r], index) => {
    const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    star.setAttribute("cx", cx);
    star.setAttribute("cy", cy);
    star.setAttribute("r", r);
    star.style.animationDelay = `${index * -0.31}s`;
    group.appendChild(star);
  });
}

function createMetamorphParticles() {
  for (let index = 0; index < 26; index += 1) {
    const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    particle.setAttribute("cx", "0");
    particle.setAttribute("cy", "0");
    particle.setAttribute("r", String(1.3 + (index % 4) * .65));
    particle.dataset.angle = String((Math.PI * 2 * index) / 26);
    particle.dataset.distance = String(42 + (index % 7) * 15);
    els.metamorphParticles.appendChild(particle);
  }
}

function updateMetamorphosis(progress) {
  const scaled = progress * 7;
  const pathIndex = Math.min(6, Math.floor(scaled));
  const pathProgress = smoothstep(0, 1, scaled - pathIndex);
  const from = metamorphKeyframes[pathIndex];
  const to = metamorphKeyframes[pathIndex + 1];
  const values = from.map((value, index) => mix(value, to[index], pathProgress));
  els.metamorphPath.setAttribute(
    "d",
    `M${values[0]} ${values[1]}C${values[2]} ${values[3]} ${values[4]} ${values[5]} ${values[6]} ${values[7]}`,
  );

  const nearestBoundary = Math.round(scaled);
  const boundaryIsValid = nearestBoundary > 0 && nearestBoundary < 8;
  const boundaryDistance = Math.abs(scaled - nearestBoundary);
  const strength = boundaryIsValid ? 1 - smoothstep(.08, .42, boundaryDistance) : 0;
  const center = transitionCenters[clamp(nearestBoundary - 1, 0, 6)];
  const pulse = .94 + Math.sin(progress * 88) * .06;

  els.metamorphPath.style.opacity = String(.08 + strength * .68);
  els.metamorphPath.style.strokeDashoffset = String(-progress * 980);
  els.transitionBloom.setAttribute("cx", center[0]);
  els.transitionBloom.setAttribute("cy", center[1]);
  els.transitionRing.setAttribute("cx", center[0]);
  els.transitionRing.setAttribute("cy", center[1]);
  els.transitionBloom.style.opacity = String(strength * .9);
  els.transitionBloom.style.transform = `scale(${mix(.2, 2.2, strength) * pulse})`;
  els.transitionRing.style.opacity = String(strength * .8);
  els.transitionRing.style.transform = `scale(${mix(.5, 2.65, strength)}) rotate(${progress * 120}deg)`;

  [...els.metamorphParticles.children].forEach((particle, index) => {
    const angle = Number(particle.dataset.angle) + progress * (4 + (index % 3));
    const distance = Number(particle.dataset.distance) * mix(.35, 1.35, strength);
    const x = center[0] + Math.cos(angle) * distance;
    const y = center[1] + Math.sin(angle) * distance * .68;
    particle.style.opacity = String(strength * (.38 + (index % 4) * .14));
    particle.style.transform = `translate(${x}px, ${y}px) scale(${mix(.4, 1.45, strength)})`;
  });
}

function updateMeasurements() {
  maxScroll = Math.max(1, els.story.offsetHeight - window.innerHeight);
}

function updateChapter(chapterIndex) {
  if (chapterIndex === currentChapter) return;

  currentChapter = chapterIndex;
  const chapter = chapters[chapterIndex];
  els.body.classList.remove(...chapters.map((_, index) => `scene-${index}`));
  els.body.classList.add(`scene-${chapterIndex}`);

  els.titles.forEach((title, index) => {
    title.classList.toggle("is-visible", index === chapterIndex);
    title.classList.toggle("is-past", index < chapterIndex);
  });

  els.description.classList.add("is-changing");
  els.factCard.classList.add("is-changing");

  window.setTimeout(() => {
    els.eyebrow.textContent = chapter.eyebrow;
    els.description.textContent = chapter.description;
    els.chapterNumber.textContent = String(chapterIndex + 1).padStart(2, "0");
    els.chapterName.textContent = chapter.name;
    els.factIndex.textContent = String(chapterIndex + 1).padStart(2, "0");
    els.factStrong.textContent = chapter.factTop;
    els.factText.textContent = chapter.factBottom;
    els.description.classList.remove("is-changing");
    els.factCard.classList.remove("is-changing");
  }, 170);

  els.dots.forEach((dot, index) => dot.classList.toggle("is-active", index <= chapterIndex));
}

function updateMoth(progress) {
  const flight = smoothstep(0.035, 0.13, progress);
  if (flight <= 0 || flight >= 1) {
    els.moth.style.removeProperty("transform");
    return;
  }

  const length = els.flightPath.getTotalLength();
  const point = els.flightPath.getPointAtLength(length * flight);
  const nextPoint = els.flightPath.getPointAtLength(Math.min(length, length * flight + 2));
  const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
  const scale = mix(1, 0.52, flight);
  els.moth.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg) scale(${scale})`;
}

function render(progress) {
  const chapterFloat = progress * 7;
  const chapter = Math.min(7, Math.floor(chapterFloat + 0.08));
  const local = chapterFloat - Math.floor(chapterFloat);

  els.root.style.setProperty("--progress", progress.toFixed(4));
  els.root.style.setProperty("--scene-progress", clamp(local).toFixed(4));

  updateChapter(chapter);
  els.body.classList.toggle("has-started", progress > 0.012);
  els.body.classList.toggle("is-complete", progress > 0.985);
  updateMetamorphosis(progress);

  const mothOpacity = 1 - smoothstep(0.1, 0.155, progress);
  const natureOpacity = 1 - smoothstep(0.08, 0.145, progress);
  setOpacity("moon", natureOpacity);
  setOpacity("branch", natureOpacity);
  setOpacity("moth", mothOpacity);
  updateMoth(progress);

  const eggOpacity = windowed(progress, 0.1, 0.145, 0.225, 0.285);
  setOpacity("eggs", eggOpacity);
  const eggScale = mix(0.75, 1, smoothstep(0.11, 0.17, progress));
  setTransform(sceneElements.eggs, `scale(${eggScale})`);
  sceneElements.eggs.forEach((el) => { el.style.transformOrigin = "470px 420px"; });
  els.eggs.forEach((egg, index) => {
    const pop = smoothstep(0.12 + index * 0.004, 0.16 + index * 0.004, progress);
    const hatch = smoothstep(.218 + index * .0015, .278 + index * .0015, progress);
    const [targetX, targetY] = eggMorphTargets[index];
    egg.style.transform = `translate(${targetX * hatch}px, ${targetY * hatch}px) rotate(${hatch * (index % 2 ? -95 : 95)}deg) scale(${mix(pop, 1.52, hatch)})`;
  });
  const crack = smoothstep(.18, .235, progress) * (1 - smoothstep(.252, .282, progress));
  els.eggCracks.style.opacity = String(crack);
  els.eggCracks.style.strokeDashoffset = String(24 * (1 - smoothstep(.18, .228, progress)));

  const wormOpacity = windowed(progress, 0.225, 0.285, 0.36, 0.43);
  setOpacity("worm", wormOpacity);
  const wormGrow = mix(0.58, 1.08, smoothstep(0.245, 0.37, progress));
  const cocoonMorph = smoothstep(.355, .43, progress);
  setTransform(
    sceneElements.worm,
    `translate(${cocoonMorph * 20}px, ${cocoonMorph * 2}px) rotate(${cocoonMorph * 330}deg) scale(${wormGrow * mix(1, .48, cocoonMorph)}, ${wormGrow * mix(1, 1.28, cocoonMorph)})`,
  );
  sceneElements.worm.forEach((el) => { el.style.transformOrigin = "460px 420px"; });
  els.bites.forEach((bite, index) => {
    bite.style.opacity = smoothstep(0.29 + index * 0.025, 0.33 + index * 0.025, progress);
  });

  const cocoonOpacity = windowed(progress, 0.36, 0.425, 0.505, 0.57);
  setOpacity("cocoon", cocoonOpacity);
  const cocoonScale = mix(0.68, 1, smoothstep(0.37, 0.45, progress));
  const cocoonUnwind = smoothstep(.505, .57, progress);
  setTransform(
    sceneElements.cocoon,
    `translate(${cocoonUnwind * 118}px, ${cocoonUnwind * -24}px) scale(${cocoonScale * mix(1, .62, cocoonUnwind)}, ${cocoonScale * mix(1, .82, cocoonUnwind)}) rotate(${mix(-5, 280, cocoonUnwind)}deg)`,
  );
  sceneElements.cocoon.forEach((el) => { el.style.transformOrigin = "479px 250px"; });
  const spin = smoothstep(0.385, 0.49, progress);
  els.spinningThread.style.strokeDashoffset = String(620 * (1 - spin));
  document.querySelector(".thread-tip").style.opacity = spin < 0.98 ? spin : 0;

  const reelOpacity = windowed(progress, 0.505, 0.565, 0.645, 0.71);
  setOpacity("reel", reelOpacity);
  const reelArrival = smoothstep(.505, .565, progress);
  sceneElements.reel.forEach((el) => {
    el.style.transform = `translateX(${mix(-74, 0, reelArrival)}px) scale(${mix(.82, 1, reelArrival)})`;
    el.style.transformOrigin = "520px 390px";
  });
  const threadDraw = smoothstep(0.52, 0.625, progress);
  els.longThread.style.strokeDashoffset = String(970 * (1 - threadDraw));
  const reelRotation = smoothstep(0.52, 0.68, progress) * 80;
  const reel = document.querySelector(".reel");
  reel.style.transform = `translate(608px, 360px) rotate(${reelRotation}deg)`;
  reel.style.transformOrigin = "0 0";

  const dyeOpacity = windowed(progress, 0.645, 0.705, 0.785, 0.85);
  setOpacity("dye", dyeOpacity);
  const dyeArrival = smoothstep(.65, .72, progress);
  const dyeDeparture = smoothstep(.785, .85, progress);
  sceneElements.dye.forEach((el) => {
    el.style.transform = `translateY(${mix(42, -30, dyeDeparture) + mix(28, 0, dyeArrival)}px) scale(${mix(.9, 1, dyeArrival)}, ${mix(1, .74, dyeDeparture)})`;
    el.style.transformOrigin = "480px 420px";
  });
  els.dyeThreads.forEach((thread, index) => {
    const draw = clamp(dyeArrival * 1.4 - index * .075);
    thread.style.strokeDashoffset = String(760 * (1 - draw));
  });

  const loomOpacity = windowed(progress, 0.785, 0.845, 0.925, 0.968);
  setOpacity("loom", loomOpacity);
  const weaving = smoothstep(0.79, 0.94, progress);
  const loomArrival = smoothstep(.785, .845, progress);
  sceneElements.loom.forEach((el) => {
    el.style.transform = `perspective(800px) rotateY(${mix(14, 0, loomArrival)}deg) scale(${mix(.84, 1, loomArrival)})`;
    el.style.transformOrigin = "470px 390px";
  });
  els.wovenLines.forEach((line, index) => {
    const lineProgress = clamp(weaving * 1.45 - index * 0.032);
    line.style.strokeDashoffset = String(480 * (1 - lineProgress));
  });
  const shuttleX = mix(224, 548, (Math.sin(weaving * Math.PI * 10) + 1) / 2);
  const shuttleY = mix(285, 515, weaving);
  els.shuttle.style.transform = `translate(${shuttleX}px, ${shuttleY}px) scale(.74)`;

  const fabricOpacity = smoothstep(0.925, 0.985, progress);
  setOpacity("fabric", fabricOpacity);
  const fabricWave = Math.sin(performance.now() * .0018) * fabricOpacity;
  els.fabricScene.style.transform = `translateY(${mix(-132, 0, fabricOpacity)}px) scale(${mix(.88, 1, fabricOpacity)}, ${mix(.08, 1, fabricOpacity)}) skewY(${fabricWave * .75}deg)`;
  els.fabricScene.style.transformOrigin = "480px 246px";

}

function animate() {
  targetProgress = previewProgress ?? clamp(window.scrollY / maxScroll);
  currentProgress += (targetProgress - currentProgress) * (prefersReducedMotion.matches ? 1 : 0.12);
  if (Math.abs(targetProgress - currentProgress) < 0.0001) currentProgress = targetProgress;
  render(currentProgress);
  animationFrame = requestAnimationFrame(animate);
}

function replay() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupCursor() {
  let cursorX = -100;
  let cursorY = -100;
  let currentX = -100;
  let currentY = -100;
  let hasPointer = false;
  const trailPoints = [];

  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    hasPointer = true;
  });

  function drawCursor() {
    currentX += (cursorX - currentX) * 0.18;
    currentY += (cursorY - currentY) * 0.18;
    els.cursor.style.transform = `translate3d(${currentX - els.cursor.offsetWidth / 2}px, ${currentY - els.cursor.offsetHeight / 2}px, 0)`;
    if (hasPointer) {
      trailPoints.unshift([currentX, currentY]);
      if (trailPoints.length > 18) trailPoints.pop();
      if (trailPoints.length > 2) {
        const path = trailPoints.reduce((result, point, index) => {
          if (index === 0) return `M${point[0]} ${point[1]}`;
          const previous = trailPoints[index - 1];
          const midX = (previous[0] + point[0]) / 2;
          const midY = (previous[1] + point[1]) / 2;
          return `${result}Q${previous[0]} ${previous[1]} ${midX} ${midY}`;
        }, "");
        els.cursorTrailPath.setAttribute("d", path);
      }
    }
    requestAnimationFrame(drawCursor);
  }

  document.querySelectorAll("button, a").forEach((target) => {
    target.addEventListener("pointerenter", () => els.cursor.classList.add("is-hovering"));
    target.addEventListener("pointerleave", () => els.cursor.classList.remove("is-hovering"));
  });

  drawCursor();
}

createStars();
createMetamorphParticles();
updateMeasurements();
updateChapter(0);
const requestedProgress = Number.parseFloat(new URLSearchParams(window.location.search).get("progress"));
if (Number.isFinite(requestedProgress)) {
  const initialProgress = clamp(requestedProgress);
  previewProgress = initialProgress;
  currentProgress = initialProgress;
  targetProgress = initialProgress;
}
render(currentProgress);
animate();
setupCursor();

els.replayButton.addEventListener("click", replay);
window.addEventListener("resize", updateMeasurements);

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") replay();
});

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
});
