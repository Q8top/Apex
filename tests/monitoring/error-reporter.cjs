"use strict";
var path = require("path");
var fs = require("fs");
var vm = require("vm");
var ROOT = path.resolve(__dirname, "../..");

if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = require("crypto").webcrypto;
}

var SRC = fs.readFileSync(path.join(ROOT, "src/js/presentation/error-reporter.js"), "utf8");

var fail = 0;
function t(name, cond, extra) {
  if (cond) { console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? " :: " + extra : "")); }
}

function freshEnv() {
  var listeners = {};
  global.window = {
    addEventListener: function (name, fn) {
      (listeners[name] = listeners[name] || []).push(fn);
    }
  };
  global.location = { href: "https://apextop.cc.cd/sweet-demo?mode=demo" };
  vm.runInThisContext(SRC, { filename: "error-reporter.js" });
  return { listeners: listeners, ER: global.window.ApexErrorReporter };
}

var consoleWarns = [];
var origWarn = console.warn;
console.warn = function () { consoleWarns.push(Array.prototype.slice.call(arguments)); };

console.log("\n=== 0) mount ===");
var e0 = freshEnv();
t("0a mounted", !!e0.ER);
t("0b frozen", Object.isFrozen(e0.ER));
t("0c has install", typeof e0.ER.install === "function");

console.log("\n=== 1) demo mode ===");
var e1 = freshEnv();
consoleWarns = [];
var sent1 = [];
var r1 = e1.ER.install({ mode: "demo", send: function (p) { sent1.push(p); } });
t("1a frozen", Object.isFrozen(r1));
t("1b mode demo", r1.mode === "demo");
t("1c isInstalled true", r1.isInstalled() === true);
t("1d install again false", r1.install() === false);
e1.listeners["error"][0]({ message: "Boom", filename: "app.js", lineno: 42 });
t("1e demo nothing sent", sent1.length === 0);
t("1f demo console warn", consoleWarns.length >= 1);
t("1g count 1", r1.count() === 1);
e1.listeners["unhandledrejection"][0]({ reason: new Error("rej 1") });
t("1h count 2", r1.count() === 2);
t("1i still nothing sent", sent1.length === 0);

console.log("\n=== 2) real mode ===");
var e2 = freshEnv();
var sent2 = [];
var r2 = e2.ER.install({ mode: "real", send: function (p) { sent2.push(p); } });
e2.listeners["error"][0]({ message: "Err 1", filename: "x.js", lineno: 10 });
t("2a sent 1", sent2.length === 1);
t("2b type js_error", sent2[0].type === "js_error");
t("2c msg has Err 1", sent2[0].message.indexOf("Err 1") >= 0);
t("2d url correct", sent2[0].url === global.location.href);
t("2e file:line in msg", sent2[0].message.indexOf("x.js:10") >= 0);
e2.listeners["unhandledrejection"][0]({ reason: { message: "PRej" } });
t("2f rejection sends", sent2.length === 2);
t("2g type promise_rejection", sent2[1].type === "promise_rejection");
t("2h msg has PRej", sent2[1].message.indexOf("PRej") >= 0);

console.log("\n=== 3) dedup ===");
var e3 = freshEnv();
var fakeNow = 1000;
var sent3 = [];
var r3 = e3.ER.install({
  mode: "real", dedupMs: 5000,
  now: function () { return fakeNow; },
  send: function (p) { sent3.push(p); }
});
e3.listeners["error"][0]({ message: "Same", filename: "f", lineno: 1 });
t("3a first sends", sent3.length === 1);
e3.listeners["error"][0]({ message: "Same", filename: "f", lineno: 1 });
t("3b dup skipped", sent3.length === 1);
fakeNow += 6000;
e3.listeners["error"][0]({ message: "Same", filename: "f", lineno: 1 });
t("3c after window sends", sent3.length === 2);
e3.listeners["error"][0]({ message: "Other", filename: "f", lineno: 1 });
t("3d different sends", sent3.length === 3);

console.log("\n=== 4) maxErrors ===");
var e4 = freshEnv();
var sent4 = [];
var tNow = 1000;
var r4 = e4.ER.install({
  mode: "real", maxErrors: 3, dedupMs: 1,
  now: function () { return tNow++; },
  send: function (p) { sent4.push(p); }
});
for (var k = 0; k < 10; k++) {
  e4.listeners["error"][0]({ message: "E" + k, filename: "f", lineno: k });
}
t("4a sent = 3", sent4.length === 3, "got " + sent4.length);
t("4b count = 3", r4.count() === 3);

console.log("\n=== 5) edge cases ===");
var e5 = freshEnv();
var sent5 = [];
var r5 = e5.ER.install({ mode: "real", send: function (p) { sent5.push(p); } });
t("5a empty false", r5.report("error", "") === false);
t("5b null false", r5.report("error", null) === false);
t("5c undefined false", r5.report("error", undefined) === false);
t("5d nothing sent", sent5.length === 0);
t("5e normal true", r5.report("error", "hello") === true);
t("5f sent 1", sent5.length === 1);

console.log("\n=== 6) send throws ===");
var e6 = freshEnv();
var r6 = e6.ER.install({ mode: "real", send: function () { throw new Error("boom"); } });
var threw = false;
try { e6.listeners["error"][0]({ message: "X", filename: "f", lineno: 1 }); }
catch (e) { threw = true; }
t("6a no propagate", threw === false);
t("6b count 1", r6.count() === 1);

console.log("\n=== 7) truncate ===");
var e7 = freshEnv();
var long = new Array(1000).join("A");
var sent7 = [];
e7.ER.install({ mode: "real", send: function (p) { sent7.push(p); } });
e7.listeners["error"][0]({ message: long, filename: "f", lineno: 1 });
t("7a sent", sent7.length === 1);
t("7b <= 500", sent7[0].message.length <= 500, "got " + sent7[0].message.length);

console.log("\n=== 8) no window ===");
var oldWin = global.window;
global.window = null;
var threw2 = false;
try { vm.runInThisContext(SRC, { filename: "error-reporter.js" }); }
catch (e) { threw2 = true; }
t("8a no window no crash", threw2 === false);
global.window = oldWin;

console.warn = origWarn;
console.log("");
console.log("total: 35, failed: " + fail);
process.exit(fail > 0 ? 1 : 0);
