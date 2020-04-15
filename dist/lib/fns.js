"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Machine definition typing helper functions
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
// Parallel service constructor
exports.parallelize = function () {
    var services = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        services[_i] = arguments[_i];
    }
    var context = function () {
        return Object.assign.apply(Object, __spreadArrays([{}], services.map(function (s) { return s.context(); })));
    };
    var paths = function () { return services.map(function (s) { return s.path(); }); };
    var send = function (name, payload) {
        return services.forEach(function (s) { return s.send(name, payload); });
    };
    var makeMatchesFn = function (positivMatchValue, fns) { return function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i] = arguments[_i];
        }
        for (var _a = 0, fns_1 = fns; _a < fns_1.length; _a++) {
            var fn = fns_1[_a];
            if (fn.apply(void 0, paths))
                return positivMatchValue;
        }
        return !positivMatchValue;
    }; };
    var matchesOne = makeMatchesFn(true, services.map(function (s) { return s.matchesOne; }));
    var matchesNone = makeMatchesFn(false, services.map(function (s) { return s.matchesNone; }));
    var onTransition = function (callback) {
        var unsubscribers = services.map(function (s) { return s.onTransition(function () {
            callback(context(), paths());
        }); });
        return function () { return unsubscribers.forEach(function (u) { return u(); }); };
    };
    return { context: context, paths: paths, send: send, matchesOne: matchesOne, matchesNone: matchesNone, onTransition: onTransition };
};
//# sourceMappingURL=fns.js.map