/* Apex Game Runtime · Event Bus
 * 发布订阅，用于 Runtime 与 Presentation 解耦
 */
(function () {
  'use strict';

  function EventBus() {
    var map = {};
    return {
      on: function (name, fn) {
        if (typeof fn !== 'function') return;
        if (!map[name]) map[name] = [];
        map[name].push(fn);
      },
      off: function (name, fn) {
        if (!map[name]) return;
        if (!fn) { delete map[name]; return; }
        map[name] = map[name].filter(function (f) { return f !== fn; });
      },
      emit: function (name, data) {
        var list = map[name];
        if (!list) return;
        for (var i = 0; i < list.length; i++) {
          try { list[i](data); } catch (e) {
            console.error('[EventBus] handler error on "' + name + '":', e);
          }
        }
      },
      clear: function () { map = {}; }
    };
  }

  window.ApexEventBus = EventBus;
})();
