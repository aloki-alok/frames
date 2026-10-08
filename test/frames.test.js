import { test, expect } from 'bun:test';
import { braille, fraction, label, normalize, resample } from '../public/frames.js';

const BOTTOM_ROW_DOTS = [0x40, 0x80];
const TOP_ROW_DOTS = [0x01, 0x08];

test('braille draws one dot per sample at its height (a trace, not an area)', () => {
  expect(braille([0, 1], 1)).toBe(String.fromCharCode(0x2800 + BOTTOM_ROW_DOTS[0] + TOP_ROW_DOTS[1]));
});

test('braille stacks rows top first and pads an odd series', () => {
  const out = braille([1, 0, 0.5], 2).split('\n');
  expect(out).toHaveLength(2);
  expect([...out[0]]).toHaveLength(2);
  expect(out[0].charCodeAt(0) & TOP_ROW_DOTS[0]).toBe(TOP_ROW_DOTS[0]);
  expect(out[1].charCodeAt(0) & TOP_ROW_DOTS[0]).toBe(0);
});

test('braille clamps samples outside 0..1', () => {
  expect(braille([-3, 9], 1)).toBe(braille([0, 1], 1));
});

test('fraction clamps a pointer position to the track', () => {
  const rect = { left: 100, width: 200 };
  expect(fraction(50, rect)).toBe(0);
  expect(fraction(200, rect)).toBe(0.5);
  expect(fraction(999, rect)).toBe(1);
});

test('label renders the value against its max and unit', () => {
  expect(label(0.7625, { max: 800, unit: 'ms' })).toBe('610 ms');
  expect(label(0.38, { unit: '%' })).toBe('38%');
  expect(label(0.5, {})).toBe('50%');
});

test('normalize stretches a narrow series to fill the graph height', () => {
  const out = normalize([0.55, 0.65, 0.75]);
  expect(out).toHaveLength(3);
  [0.1, 0.5, 0.9].forEach((v, i) => expect(out[i]).toBeCloseTo(v));
});

test('normalize keeps a flat series in the middle', () => {
  expect(normalize([0.3, 0.3])).toEqual([0.5, 0.5]);
});

test('resample interpolates a series to the number of points that fit', () => {
  expect(resample([0, 1], 5)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  expect(resample([0, 0.5, 1], 2)).toEqual([0, 1]);
  expect(resample([0.4], 3)).toEqual([0.4, 0.4, 0.4]);
});

test('resample to a single point keeps the latest sample', () => {
  expect(resample([0.2, 0.7], 1)).toEqual([0.7]);
});
