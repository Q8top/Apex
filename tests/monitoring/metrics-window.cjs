"use strict";
/* P2-12 metrics ?minutes=N test. */
var path = require("path");
var ROOT = path.resolve(__dirname, "../..");
var sqlite = require("node:sqlite");

if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require("crypto").webcrypto;
}
if (typeof globalThis.window === "undefined") globalThis.window = globalThis;

function makeD1(db) {
  function makeStmt(sql) {
    var args = [];
    var obj = {
      _sql: sql, _args: null,
      bind: function () { args = Array.prototype.slice.call(arguments); obj._args = args; return obj; },
      first: function () { var s = db.prepare(sql); return args ? s.get.apply(s, args) : s.get(); },
      run: function () { var s = db.prepare(sql); var r = args ? s.run.apply(s, args) : s.run(); return { meta: { changes: r.changes } }; },
      all: function () { var s = db.prepare(sql); return { results: (args ? s.all.apply(s, args) : s.all()) || [] }; }
    };
    return obj;
  }
  return {
    prepare: makeStmt,
    batch: async function (stmts) {
      db.exec("BEGIN");
      try {
        var out = [];
        for (var i = 0; i < stmts.length; i++) {
          var s = db.prepare(stmts[i]._sql);
          var r = s.run.apply(s, stmts[i]._args || []);
          out.push({ meta: { changes: r.changes } });
        }
        db.exec("COMMIT");
        return out;
      } catch (e) { try { db.exec("ROLLBACK"); } catch (_) {} throw e; }
    }
  };
}

function bootstrapDb() {
  var mem = new sqlite.DatabaseSync(":memory:");
  mem.exec("PRAGMA foreign_keys = ON;");
  var b = require(ROOT + "/tests/settlement/bootstrap.cjs");
  var res = b.applyCuratedMigrations(mem, ROOT);
  if (res.failed.length > 0) { console.error("mig fail:", res.failed); process.exit(2); }
  return mem;
}

(async function () {
  var mod = await import(path.join(ROOT, "functions/api/metrics.js"));
  var onRequestGet = mod.onRequestGet;

  var pass = 0, fail = 0;
  function t(name, cond, extra) {
    if (cond) { pass++; console.log("  ok   " + name); }
    else { fail++; console.log("  FAIL " + name + (extra ? " :: " + extra : "")); }
  }

  var TOKEN = "apex-test-tok-1234";
  var mem = bootstrapDb();
  mem.prepare("INSERT INTO users (username,email,password_hash,wallet_balance) VALUES (?,?,?,?)")
    .run("p12","p12@e.com","h",1000000);
  var uid = mem.prepare("SELECT id FROM users WHERE username='p12'").get().id;

  var env = { apex_db: makeD1(mem), METRICS_TOKEN: TOKEN };

  // ---- 1) hours default (no param) ----
  console.log("\n=== 1) default hours ===");
  var req1 = new Request("https://apextop.cc.cd/api/metrics", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r1 = await onRequestGet({ request: req1, env: env, data: {} });
  t("1a status 200", r1.status === 200);
  var b1 = await r1.json();
  t("1b hours=24", b1.window.hours === 24);
  t("1c minutes=1440", b1.window.minutes === 1440);

  // ---- 2) minutes=5 ----
  console.log("\n=== 2) minutes=5 ===");
  var req2 = new Request("https://apextop.cc.cd/api/metrics?minutes=5", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r2 = await onRequestGet({ request: req2, env: env, data: {} });
  var b2 = await r2.json();
  t("2a minutes=5", b2.window.minutes === 5);
  t("2b hours=5/60", Math.abs(b2.window.hours - 5/60) < 1e-9);

  // ---- 3) minutes=1 (realtime window) ----
  console.log("\n=== 3) minutes=1 realtime ===");
  var req3 = new Request("https://apextop.cc.cd/api/metrics?minutes=1", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r3 = await onRequestGet({ request: req3, env: env, data: {} });
  var b3 = await r3.json();
  t("3a minutes=1", b3.window.minutes === 1);

  // ---- 4) hours still works ----
  console.log("\n=== 4) hours=6 backward compat ===");
  var req4 = new Request("https://apextop.cc.cd/api/metrics?hours=6", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r4 = await onRequestGet({ request: req4, env: env, data: {} });
  var b4 = await r4.json();
  t("4a hours=6", b4.window.hours === 6);
  t("4b minutes=360", b4.window.minutes === 360);

  // ---- 5) minutes cap ----
  console.log("\n=== 5) minutes cap ===");
  var req5 = new Request("https://apextop.cc.cd/api/metrics?minutes=999999", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r5 = await onRequestGet({ request: req5, env: env, data: {} });
  var b5 = await r5.json();
  t("5a capped at 30 days (43200 min)", b5.window.minutes === 43200, "got " + b5.window.minutes);

  // ---- 6) invalid minutes -> fallback to 1h ----
  console.log("\n=== 6) invalid minutes ===");
  var req6 = new Request("https://apextop.cc.cd/api/metrics?minutes=abc", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r6 = await onRequestGet({ request: req6, env: env, data: {} });
  var b6 = await r6.json();
  t("6a invalid -> 60min fallback", b6.window.minutes === 60, "got " + b6.window.minutes);

  var req6b = new Request("https://apextop.cc.cd/api/metrics?minutes=-5", {
    method: "GET", headers: { "X-Metrics-Token": TOKEN }
  });
  var r6b = await onRequestGet({ request: req6b, env: env, data: {} });
  var b6b = await r6b.json();
  t("6b negative -> 60min", b6b.window.minutes === 60);

  // ---- 7) no token -> 401 ----
  console.log("\n=== 7) auth ===");
  var req7 = new Request("https://apextop.cc.cd/api/metrics?minutes=5", { method: "GET" });
  var r7 = await onRequestGet({ request: req7, env: env, data: {} });
  t("7a no token -> 401", r7.status === 401);

  console.log("\n========== metrics-window ==========");
  console.log("pass: " + pass + "  fail: " + fail);
  process.exit(fail > 0 ? 1 : 0);
})();
