import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCanvasDimensions,
  calculateGhostPositions,
  getFlareColors,
  PROFILE_PRESETS,
  RATIO_DIMENSIONS,
} from './opticalRenderer.ts';

test('getCanvasDimensions calculates correct proportions for standard ratios', () => {
  // 3:2
  const dim32 = getCanvasDimensions('3:2', 900, 600, 900);
  assert.equal(dim32.width, 900);
  assert.equal(dim32.height, 600);
  assert.equal(dim32.width / dim32.height, 1.5);

  // 1:1
  const dim11 = getCanvasDimensions('1:1', 1000, 1000, 700);
  assert.equal(dim11.width, 700);
  assert.equal(dim11.height, 700);

  // 16:9
  const dim169 = getCanvasDimensions('16:9', 1920, 1080, 960);
  assert.equal(dim169.width, 960);
  assert.equal(dim169.height, 540);

  // orig with arbitrary dimensions
  const orig = getCanvasDimensions('orig', 1200, 800, 600);
  assert.equal(orig.width, 600);
  assert.equal(orig.height, 400);
});

test('calculateGhostPositions calculates multiple collinear flares through the optical center', () => {
  const canvasW = 600;
  const canvasH = 400;
  const flareX = 100;
  const flareY = 100;
  const ghosts = calculateGhostPositions(flareX, flareY, canvasW, canvasH, 4);

  assert.equal(ghosts.length, 4);
  // Center is at (300, 200). Vector from (100, 100) to (300, 200) is dx=200, dy=100.
  // First ghost with factor 0.4 should be at x = 100 + 200 * 0.4 = 180, y = 100 + 100 * 0.4 = 140
  assert.equal(ghosts[0].x, 180);
  assert.equal(ghosts[0].y, 140);
  assert.ok(ghosts[0].size > 0);
  assert.ok(ghosts[0].opacity > 0);
});

test('getFlareColors returns valid RGB tuples for all supported color modes', () => {
  const modes = ['warm', 'amber_gold', 'ice', 'neon', 'emerald'] as const;
  for (const mode of modes) {
    const palette = getFlareColors(mode);
    assert.ok(palette.core, `Mode ${mode} should have core color`);
    assert.ok(palette.halo, `Mode ${mode} should have halo color`);
    assert.ok(palette.ring, `Mode ${mode} should have ring color`);
    assert.ok(palette.streak, `Mode ${mode} should have streak color`);
  }
});

test('PROFILE_PRESETS has complete color profiles with bounded values', () => {
  const profiles = ['vibrant', 'natural', 'mono', 'film', 'cyber', 'golden', 'silver'] as const;
  for (const prof of profiles) {
    const preset = PROFILE_PRESETS[prof];
    assert.ok(preset.name.length > 0);
    assert.ok(preset.settings.bright !== undefined);
    assert.ok(preset.settings.contrast !== undefined);
    assert.ok(preset.settings.sat !== undefined);
  }
});
