# Driving Display — Replay Lab

A local Three.js workbench for exploring a prerecorded driving trajectory. This first milestone is a visual replay, not a physics simulator or a trained driving model.

## Run

Requires Node.js 22.12+ or 24.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use play/pause, the timeline, playback speed, and camera presets. Drag to orbit and scroll to zoom. A hidden browser tab pauses the replay clock.

```sh
npm test
npm run build
```

## Learn through the code

1. `src/replay.js`: recorded samples and interpolation. Predict `sampleAt(1.5).x`, then verify it. Explain what `blend` measures.
2. `src/main.js`: scene setup and playback clock. Find the conversion from milliseconds to seconds. Predict what happens if it is removed.
3. `src/replay.test.js`: verify that rendering frequency does not change position. Explain why a stationary segment has zero speed.
4. Change one recorded position and predict which section of the replay changes before running it.
5. Implement a button that advances replay time by one second, keeping time within the recording and playback paused.

The UI uses a synthetic seven-sample recording. The velocity readout is the current segment's average speed (zero after completion). Traffic lights are decorative. There is no collision evaluation, server, cloud infrastructure, or AI inference yet.

## Next milestones

Load a trajectory from JSON, add multiple vehicles and event markers, then introduce Django and containerized simulation jobs when the replay needs real generated data.

Three.js setup reference: https://threejs.org/manual/pages/installation.html
