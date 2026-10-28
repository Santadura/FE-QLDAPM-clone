import test from "node:test";
import assert from "node:assert/strict";
import { buildDayAgenda, visibleDayAgenda } from "./dayAgenda.js";

test("three assigned shifts stay individually visible without increasing grid height", () => {
  const assignments = [
    { id: "a", startTime: "08:30", endTime: "11:30" },
    { id: "b", startTime: "14:00", endTime: "17:00" },
    { id: "c", startTime: "18:00", endTime: "20:00" },
  ];
  const items = buildDayAgenda([], assignments, () => "Hỗ trợ lớp");
  assert.equal(items.length, 3);
  assert.deepEqual(items.map((x) => x.key), ["schedule:a", "schedule:b", "schedule:c"]);
  assert.equal(visibleDayAgenda(items).remaining, 0);
});

test("overflow does not drop schedules or pending approval actions", () => {
  const availabilities = [
    { id: "free-a", status: "APPROVED", startTime: "08:00", endTime: "12:00" },
    { id: "pending-b", status: "PENDING", startTime: "18:00", endTime: "21:00" },
  ];
  const assignments = Array.from({length: 4}, (_, i) => ({
    id: String(i), startTime: "18:00", endTime: "20:00",
  }));
  const items = buildDayAgenda(availabilities, assignments);
  const result = visibleDayAgenda(items);
  assert.equal(result.shown.length, 3);
  assert.equal(result.remaining, 3);
  assert.equal(items.filter((x) => x.type === "schedule").length, 4);
  assert.ok(items.some((x) => x.key === "availability:pending-b" && x.status === "Chờ duyệt"));
});

test("each availability retains original reference and status", () => {
  const slot = { id: "slot-1", status: "PENDING", startTime: "08:30", endTime: "11:30" };
  const items = buildDayAgenda([slot]);
  assert.equal(items[0].data, slot);
  assert.equal(items[0].status, "Chờ duyệt");
});
