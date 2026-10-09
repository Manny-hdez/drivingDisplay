import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { duration, sampleAt, trajectory } from "./replay.js";
import "./style.css";

document.querySelector("#app").innerHTML = `
  <header><a class="brand" href="/">◈ <span>DRIVING DISPLAY</span></a><span class="divider">/</span><span>Replay lab</span><span class="local"><i></i> LOCAL WORKSPACE</span></header>
  <main><aside><div class="eyebrow">WORKSPACE / 01</div><h1>Observe.<br>Understand.<br>Replay.</h1><p class="intro">Explore vehicle behavior, one moment at a time.</p>
  <div class="section-label">SCENARIO</div><div class="scenario"><span class="scenario-icon">╋</span><div><strong>Intersection approach</strong><small>Recorded demo · 14 seconds</small></div><span class="selected">●</span></div>
  <div class="section-label">RECORDING DETAILS</div><dl><dt>Vehicle</dt><dd>Ego / 01</dd><dt>Environment</dt><dd>Urban intersection</dd><dt>Samples</dt><dd>7 keyframes</dd><dt>Source</dt><dd>Synthetic fixture</dd></dl>
  <div class="note"><span>01 / FIRST PRINCIPLE</span><h3>Time drives motion.</h3><p>Frames show a position in the recording. More frames make playback smoother, not faster.</p><button id="learn">Explore the interpolation ↗</button></div><div class="aside-footer">REPLAY WORKBENCH <span>v0.1</span></div></aside>
  <section class="workspace"><div class="view-header"><div><span class="eyebrow">SCENARIO VIEW</span><h2>Intersection approach <span>DEMO</span></h2></div><div class="camera-buttons"><button id="orbit" class="active">Perspective</button><button id="top">Top view</button><button id="reset">Reset view</button></div></div>
  <div id="viewport"><div class="scene-label"><i></i> <span id="state">READY</span><span class="label-divider">|</span> EGO TRAJECTORY</div><div class="legend"><span class="dot"></span> Ego vehicle <span class="line"></span> Recorded path</div><div class="scene-hint">Drag to orbit · Scroll to zoom</div><div class="compass">N<br>↑</div></div>
  <div class="transport"><div class="transport-top"><div class="playback"><button id="restart" aria-label="Restart replay">↤</button><button id="play" aria-label="Play replay">▶</button><span id="time">00.00</span><span class="muted">/ 14.00 s</span></div><label class="speed-label">Playback <select id="rate" aria-label="Playback speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div><input id="timeline" aria-label="Replay time in seconds" type="range" min="0" max="14" step="0.01" value="0"><div class="ticks"><span>0 s</span><button data-seek="5">5 s · stop begins</button><button data-seek="7">7 s · depart</button><span>14 s</span></div></div>
  <div class="metrics"><article><span>VELOCITY</span><strong id="velocity">8.0 <small>m/s</small></strong><p>Current trajectory segment</p></article><article><span>POSITION · X</span><strong id="position">−42.0 <small>m</small></strong><p>World-space coordinate</p></article><article><span>REPLAY PROGRESS</span><strong id="progress">0 <small>%</small></strong><p id="phase">Approaching intersection</p></article></div>
  <details id="lesson"><summary>Under the hood <span>How the replay finds a position</span></summary><div class="lesson-body"><p>The car is between two recorded samples. We calculate how far the replay time lies between their timestamps, then blend their positions by that fraction.</p><code id="formula"></code><p><strong>Try it:</strong> scrub to 6 seconds. The timestamps change, but both surrounding positions are −8 meters. Why does the car stay still?</p></div></details>
  </section></main>`;

const viewport = document.querySelector("#viewport");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#131d26");
scene.fog = new THREE.Fog("#131d26", 105, 210);
const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 350);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.prepend(renderer.domElement);
renderer.domElement.setAttribute(
  "aria-label",
  "3D replay of a car crossing an urban intersection",
);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.minDistance = 20;
controls.maxDistance = 145;
function setCamera(top = false) {
  camera.position.set(...(top ? [0, 100, 0.01] : [58, 57, 64]));
  controls.target.set(0, 0, 0);
  controls.update();
  document.querySelector("#top").classList.toggle("active", top);
  document.querySelector("#orbit").classList.toggle("active", !top);
}
setCamera();
scene.add(new THREE.HemisphereLight(0xc3e6ff, 0x263b36, 2.5));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(20, 55, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -65,
  right: 65,
  top: 65,
  bottom: -65,
});
scene.add(sun);
function box(w, h, d, color, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
box(220, 0.3, 220, "#1b2930", 0, -0.3, 0);
const grid = new THREE.GridHelper(220, 55, "#304049", "#24353c");
grid.position.y = -0.13;
scene.add(grid);
box(120, 0.08, 12, "#303c46", 0, 0, 0);
box(12, 0.09, 120, "#303c46", 0, 0, 0);
for (const side of [-1, 1]) {
  for (const end of [-1, 1]) {
    box(45, 0.24, 1.6, "#637078", end * 30, 0.04, side * 7);
    box(1.6, 0.24, 45, "#637078", side * 7, 0.04, end * 30);
    box(
      18,
      4 + (end + 1) * 3,
      16,
      "#34434c",
      end * 23,
      2 + (end + 1) * 1.5,
      side * 25,
    );
    box(15, 3, 12, "#293a44", end * 44, 1.5, side * 24);
    for (let i = 0; i < 5; i++) {
      box(0.65, 0.035, 3.1, "#a2b1b9", -4 + i * 2, 0.08, side * 10);
      box(3.1, 0.035, 0.65, "#a2b1b9", side * 10, 0.08, -4 + i * 2);
    }
  }
}
for (let n = -56; n < 58; n += 6)
  if (Math.abs(n) > 12) {
    box(3, 0.02, 0.12, "#b8a766", n, 0.09, 0);
    box(0.12, 0.02, 3, "#b8a766", 0, 0.09, n);
  }
for (const [x, z] of [
  [-13, -13],
  [13, 13],
  [-13, 13],
  [13, -13],
]) {
  box(0.18, 5, 0.18, "#71818a", x, 2.5, z);
  box(0.7, 1.5, 0.5, "#151f27", x, 5, z);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshBasicMaterial({ color: "#6ae0b2" }),
  );
  lamp.position.set(x, 5.4, z + 0.28);
  scene.add(lamp);
}
const path = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(
    trajectory.map((p) => new THREE.Vector3(p.x, 0.16, p.z)),
  ),
  new THREE.LineDashedMaterial({
    color: "#66e2b8",
    dashSize: 0.65,
    gapSize: 0.45,
  }),
);
path.computeLineDistances();
scene.add(path);
trajectory.forEach((p) => {
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.46, 24),
    new THREE.MeshBasicMaterial({ color: "#66e2b8", side: THREE.DoubleSide }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(p.x, 0.17, p.z);
  scene.add(marker);
});
const car = new THREE.Group();
scene.add(car);
box(4.4, 0.85, 1.95, "#5fe3b5", 0, 0.8, 0, car);
box(2.25, 0.65, 1.7, "#213d49", -0.3, 1.5, 0, car);
box(0.12, 0.2, 1.5, "#effff4", 2.22, 0.87, 0, car);
for (const x of [-1.35, 1.35])
  for (const z of [-1, 1]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.23, 16),
      new THREE.MeshStandardMaterial({ color: "#10181e" }),
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.43, z);
    car.add(wheel);
  }

let time = 0,
  playing = false,
  rate = 1,
  lastTimestamp;
const $ = (selector) => document.querySelector(selector);
function update() {
  const p = sampleAt(time);
  car.position.set(p.x, 0, p.z);
  $("#timeline").value = time;
  $("#time").textContent = time.toFixed(2).padStart(5, "0");
  $("#velocity").innerHTML =
    `${time === duration ? "0.0" : p.speed.toFixed(1)} <small>m/s</small>`;
  $("#position").innerHTML = `${p.x.toFixed(1)} <small>m</small>`;
  $("#progress").innerHTML =
    `${Math.round((time / duration) * 100)} <small>%</small>`;
  $("#phase").textContent =
    time < 5
      ? "Approaching intersection"
      : time < 7
        ? "Recorded stop"
        : time < duration
          ? "Crossing and departing"
          : "Recording complete";
  $("#state").textContent = playing
    ? "PLAYING"
    : time === duration
      ? "COMPLETE"
      : "PAUSED";
  $("#play").textContent = playing ? "Ⅱ" : "▶";
  $("#play").setAttribute(
    "aria-label",
    playing ? "Pause replay" : "Play replay",
  );
  $("#formula").textContent =
    `Time ${time.toFixed(2)} s → samples ${p.start.t}–${p.end.t} s → blend ${(p.blend * 100).toFixed(0)}% → x = ${p.x.toFixed(2)} m`;
}
$("#play").onclick = () => {
  if (time >= duration) time = 0;
  playing = !playing;
  update();
};
$("#restart").onclick = () => {
  time = 0;
  playing = false;
  update();
};
$("#timeline").oninput = (e) => {
  time = Number(e.target.value);
  playing = false;
  update();
};
$("#rate").onchange = (e) => {
  rate = Number(e.target.value);
};
document.querySelectorAll("[data-seek]").forEach(
  (button) =>
    (button.onclick = () => {
      time = Number(button.dataset.seek);
      playing = false;
      update();
    }),
);
$("#top").onclick = () => setCamera(true);
$("#orbit").onclick = $("#reset").onclick = () => setCamera();
$("#learn").onclick = () => {
  $("#lesson").open = true;
  $("#lesson").scrollIntoView({ behavior: "smooth", block: "center" });
};
document.addEventListener("visibilitychange", () => {
  lastTimestamp = undefined;
});
new ResizeObserver(() => {
  const { width, height } = viewport.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}).observe(viewport);
function animate(timestamp) {
  const delta =
    lastTimestamp === undefined ? 0 : (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  if (playing) {
    time = Math.min(duration, time + delta * rate);
    if (time >= duration) playing = false;
    update();
  }
  controls.update();
  renderer.render(scene, camera);
}
update();
renderer.setAnimationLoop(animate);
