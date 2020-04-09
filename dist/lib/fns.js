"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = function (def) { return def; };
exports.Next = function (fn) { return fn; };
exports.State = function (def) { return def; };
exports.Machine = function (def) { return def; };
exports.DeferredNextEvent = function (nextEventName, deferredFn) { return exports.Event({
    next: exports.Next(function (ctx, payload) { return [
        nextEventName,
        deferredFn(ctx, payload),
    ]; }),
}); };
//# sourceMappingURL=fns.js.map