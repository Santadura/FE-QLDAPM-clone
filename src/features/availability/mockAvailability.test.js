import assert from "node:assert/strict";
import test from "node:test";
import { applyAvailabilityShift, shiftDefinitions } from "./mockAvailability.js";

test("changing shift uses its advertised time range", () => {
  const original = {
    day: "mon", shift: "morning", start: "09:00", end: "10:00",
    type: "Lịch rảnh định kỳ", campus: "Cơ sở chính", note: "Keep me",
  };

  for (const shift of shiftDefinitions.filter((item) => item.key !== original.shift)) {
    const next = applyAvailabilityShift(original, shift.key);
    const [start, end] = shift.range.split(" – ");
    assert.equal(next.shift, shift.key);
    assert.equal(next.start, start);
    assert.equal(next.end, end);
    assert.equal(next.day, original.day);
    assert.equal(next.note, original.note);
    assert.equal(next.type, original.type);
  }

  assert.equal(original.start, "09:00");
  assert.equal(original.end, "10:00");
});

test("same shift preserves manually entered hours", () => {
  const form = { shift: "evening", start: "18:30", end: "20:30" };
  assert.strictEqual(applyAvailabilityShift(form, "evening"), form);
});

test("unknown shift does not alter form", () => {
  const form = { shift: "morning", start: "08:30", end: "11:30" };
  assert.strictEqual(applyAvailabilityShift(form, "unknown"), form);
});
