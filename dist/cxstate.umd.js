(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.cxstate = {})));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    function rebuildActiveStates(currentState, previousActiveStates, statePaths) {
        if (previousActiveStates[previousActiveStates.length - 1] === currentState) {
            return previousActiveStates;
        }
        var comps = currentState.path.absolute.split('/').filter(function (c) { return c.length; });
        var acc = [];
        var _loop_1 = function (i) {
            var path = "/" + comps.slice(0, i).join('/');
            var parentResult = previousActiveStates.find(function (sp) { return sp.path.absolute === path; });
            var result = parentResult || statePaths.find(function (sp) { return sp.path.absolute === path; });
            if (result)
                acc.push(result);
            else
                throw new Error("No state found for path \"" + path + "\"");
        };
        for (var i = 1; i <= comps.length; i++) {
            _loop_1(i);
        }
        return acc;
    }
    function findInitialChildState(ctx, statePaths, parent) {
        if (hasChildStates(parent.state)) {
            if (parent.state.initial) {
                var initial = initialStateName(parent.state.initial, ctx);
                var basePath = parent.path.absolute.endsWith('/')
                    ? parent.path.absolute
                    : parent.path.absolute + "/";
                var absolutePath_1 = resolvePath(basePath, initial);
                var child = statePaths.find(function (sp) { return sp.path.absolute === absolutePath_1; });
                if (child) {
                    if (hasChildStates(child.state)) {
                        return findInitialChildState(ctx, statePaths, child);
                    }
                    else {
                        return child;
                    }
                }
                else {
                    throw new Error("State \"" + parent.path.absolute + "\" initial state \"" + initial + "\" doesn't match any of the definitions");
                }
            }
            else {
                throw new Error("State \"" + parent.path.absolute + "\" has child-states, but doesn't define initial");
            }
        }
    }
    function hasChildStates(state) {
        return !!(state.states && Object.values(state.states).length);
    }
    function updateContext(ctx, def, payload) {
        var update = __assign({}, ctx);
        var didUpdate = false;
        for (var propName in def.update) {
            var anyFn = def.update[propName];
            if (typeof anyFn === 'function') {
                var fn = anyFn;
                var changedValue = fn(update, payload);
                if (changedValue !== update[propName]) {
                    update[propName] = changedValue;
                    didUpdate = true;
                }
            }
        }
        if (didUpdate)
            return update;
    }
    function initialStateName(initial, ctx) {
        return (typeof initial === 'string') ? initial : initial(ctx);
    }
    function resolvePath(base, relativeComp) {
        if (!base.startsWith('/'))
            throw new Error('Base component of path must start with /');
        var host = 'http://con5.app';
        var url = (new URL(relativeComp, "" + host + base)).href;
        return url.slice(host.length);
    }

    /**
     * Internprets a machine-definition. Returns a ready to use machine-service.
     */
    function interpret(machineDef) {
        var stateConfigs = [];
        var buildStateConfigs = function (basePath, name, state) {
            var absolute = resolvePath(basePath, name);
            stateConfigs.push({ state: state, path: { name: name, absolute: absolute } });
            if (state.states && Object.values(state.states).length) {
                // Check minimum state validity
                if (!state.initial)
                    throw new Error("State \"" + absolute + "\" has child-states, but doesn't define initial");
                // Check minimum validity of events
                if (state.on)
                    Object.entries(state.on).forEach(function (_a) {
                        var eventName = _a[0], eventDef = _a[1];
                        var checkEvent = function (ed) {
                            if (typeof ed !== 'string') {
                                if (ed.replace && ed.update)
                                    throw new Error("State\"" + absolute + "\" / Event \"" + eventName + "\": <replace> and <update> are mutually exclusive");
                                if (ed.target && ed.next)
                                    throw new Error("State\"" + absolute + "\" / Event \"" + eventName + "\": <target> and <next> are mutually exclusive");
                            }
                        };
                        if (eventDef instanceof Array)
                            eventDef.forEach(checkEvent);
                        else
                            checkEvent(eventDef);
                    });
                var nextBasePath = absolute.endsWith('/') ? absolute : absolute + "/";
                for (var _i = 0, _a = Object.entries(state.states); _i < _a.length; _i++) {
                    var _b = _a[_i], stateName = _b[0], stateDef = _b[1];
                    buildStateConfigs(nextBasePath, stateName, stateDef);
                }
            }
        };
        for (var _i = 0, _a = Object.entries(machineDef.states); _i < _a.length; _i++) {
            var _b = _a[_i], stateName = _b[0], stateDef = _b[1];
            buildStateConfigs('/', stateName, stateDef);
        }
        var initial = initialStateName(machineDef.initial, machineDef.context);
        var initialAbsPath = initial.startsWith('/') ? initial : "/" + initial;
        var initialState = stateConfigs.find(function (sp) { return sp.path.absolute === initialAbsPath; });
        if (initialState) {
            var initialChild = findInitialChildState(machineDef.context, stateConfigs, initialState);
            if (initialChild) {
                initialState = initialChild;
            }
            return makeService(stateConfigs, machineDef.context, initialState);
        }
        else {
            throw new Error("Initial state \"" + initial + "\" doesn't match any of the definitions");
        }
    }
    function makeService(stateConfigs, initialContext, initialState) {
        var _this = this;
        var activeStates = rebuildActiveStates(initialState, [], stateConfigs);
        var currentContext = initialContext;
        var listeners = [];
        var matcherMemoization = {};
        var eventPayloadPromises = new Map();
        var isDirty = true;
        var currentState = function () { return activeStates[activeStates.length - 1]; };
        var findEventHandlerAndStateConfig = function (eventName) {
            for (var i = activeStates.length; i--;) {
                var config = activeStates[i];
                if (config.state.on) {
                    var handler = config.state.on[eventName];
                    if (handler)
                        return [handler, config];
                }
            }
            return [null, null];
        };
        var informListeners = function () {
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var callback = listeners_1[_i];
                callback(currentContext, currentState().path.absolute);
            }
            isDirty = false;
        };
        // TRANSITION HANDLING
        var onTransition = function (callback) {
            listeners.push(callback);
            return function () {
                var idx = listeners.indexOf(callback);
                if (idx > -1)
                    listeners.splice(idx, 1);
            };
        };
        // from: state path in which the event handler was found
        var transitionToTarget = function (target, from, srcPayload) {
            if (target) {
                var fsp = from.path;
                var targetPath_1 = resolvePath(fsp.absolute + "/", target);
                var targetConfig = stateConfigs.find(function (sc) { return sc.path.absolute === targetPath_1; });
                if (targetConfig) {
                    transitionToState(targetConfig, srcPayload);
                }
                else {
                    throw new Error("No state defined for path \"" + targetPath_1 + "\"");
                }
            }
            else if (isDirty) {
                informListeners();
            }
        };
        // ACTIVE STATE HANDLING
        var transitionToState = function (parent, srcPayload) {
            var child = findInitialChildState(currentContext, stateConfigs, parent);
            var transitionTargetState = child ? child : parent;
            var rebuiltActiveStates = rebuildActiveStates(transitionTargetState, activeStates, stateConfigs);
            if (rebuiltActiveStates !== activeStates) {
                activeStates = rebuiltActiveStates;
                matcherMemoization = {};
                isDirty = true;
                processCurrentStateEntryEvent(srcPayload);
            } /* TODO: temporary state. Else case is important for it. */
            if (isDirty)
                informListeners();
        };
        // EVENT PROCESSING
        var processCurrentStateEntryEvent = function (srcPayload) {
            var cs = currentState();
            if (cs.state.entry)
                processAnyEventHandler(cs.state.entry, cs, srcPayload);
        };
        var processAnyEventHandler = function (anyHandler, from, payload) {
            if (typeof anyHandler === 'string') {
                transitionToTarget(anyHandler, from, payload);
            }
            else if (anyHandler instanceof Array) {
                processEvents(anyHandler, from, payload);
            }
            else {
                processEvents([anyHandler], from, payload);
            }
        };
        var processEvents = function (defs, from, payload) {
            var mutate = function (def) {
                if (def.update) {
                    var update = updateContext(currentContext, def, payload);
                    if (update) {
                        currentContext = update;
                        isDirty = true;
                    }
                }
                else if (def.replace) {
                    var replacement = def.replace(currentContext, payload);
                    if (replacement !== currentContext) {
                        currentContext = replacement;
                        isDirty = true;
                    }
                }
            };
            var tap = function (def) {
                if (def.tap)
                    def.tap(currentContext, payload);
            };
            var dispatch = function (def) {
                if (typeof def.next === 'string')
                    send(def.next, payload);
                else if (def.next)
                    send.apply(void 0, def.next(currentContext, payload));
                else if (isDirty)
                    informListeners();
            };
            var transitionOrDispatch = function (def) {
                if (def.target && !def.next)
                    transitionToTarget(def.target, from, payload);
                else if (!def.target && def.next)
                    dispatch(def);
                else if (isDirty)
                    informListeners();
            };
            for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
                var def = defs_1[_i];
                if (def.cond && def.cond(currentContext, payload)) {
                    mutate(def);
                    tap(def);
                    transitionOrDispatch(def);
                    break;
                }
                else if (!def.cond) {
                    mutate(def);
                    tap(def);
                    transitionOrDispatch(def);
                }
                else if (isDirty) {
                    informListeners();
                }
            }
        };
        var send = function (name, payload) {
            var continueWithPayload = function (eventName, eventPayload) {
                var _a = findEventHandlerAndStateConfig(eventName), anyHandler = _a[0], config = _a[1];
                if (anyHandler && config) {
                    if (eventPayload && ('error' in eventPayload)) {
                        processAnyEventHandler(anyHandler, config, eventPayload);
                    }
                    else {
                        processAnyEventHandler(anyHandler, config, eventPayload);
                    }
                }
            };
            if (payload instanceof Promise) {
                eventPayloadPromises.set(name, payload);
                if (isDirty) {
                    // In case the event originated in a next, we should transitions before waiting for the promise to resolve
                    informListeners();
                }
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var success, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, payload];
                            case 1:
                                success = _a.sent();
                                if (eventPayloadPromises.get(name) === payload) {
                                    eventPayloadPromises.delete(name);
                                    continueWithPayload(name, success);
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                eventPayloadPromises.delete(name);
                                continueWithPayload(name, { error: error_1 });
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })();
            }
            else {
                continueWithPayload(name, payload);
            }
        };
        processCurrentStateEntryEvent({});
        // PATH MATCHING
        var matches = function (positivMatchValue, paths) {
            var memoKey = JSON.stringify(__spreadArrays([positivMatchValue ? 1 : 0], paths));
            var memoValue = matcherMemoization[memoKey];
            if (memoValue)
                return memoValue.result;
            var cs = currentState();
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var toMatch = paths_1[_i];
                if (toMatch.startsWith('/')) {
                    var toMatchComps = toMatch.split('/');
                    var toMatchCompsLen = toMatchComps.length - 1; // LEADING "/" CAUSES 1 COMP OVERFLOW
                    if (toMatchCompsLen === activeStates.length) {
                        if (toMatch === cs.path.absolute) {
                            matcherMemoization[memoKey] = { result: positivMatchValue };
                            return positivMatchValue;
                        }
                    }
                    else if (toMatchCompsLen < activeStates.length) {
                        var foundMismatch = false;
                        for (var i = 1; i < toMatchComps.length; i++) { // LEADING "/" CAUSES 1 COMP OVERFLOW
                            if (toMatchComps[i] !== activeStates[i - 1].path.name) { // LEADING "/" CAUSES 1 COMP OVERFLOW
                                foundMismatch = true;
                                break;
                            }
                        }
                        if (!foundMismatch) {
                            matcherMemoization[memoKey] = { result: positivMatchValue };
                            return positivMatchValue;
                        }
                    }
                }
                else {
                    var absToMatch = resolvePath(cs.path.absolute, toMatch);
                    if (absToMatch === cs.path.absolute) {
                        matcherMemoization[memoKey] = { result: positivMatchValue };
                        return positivMatchValue;
                    }
                }
            }
            matcherMemoization[memoKey] = { result: !positivMatchValue };
            return !positivMatchValue;
        };
        return {
            context: function () { return currentContext; },
            path: function () { return currentState().path.absolute; },
            send: send,
            matchesOne: function () {
                var paths = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    paths[_i] = arguments[_i];
                }
                return matches(true, paths);
            },
            matchesNone: function () {
                var paths = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    paths[_i] = arguments[_i];
                }
                return matches(false, paths);
            },
            onTransition: onTransition,
        };
    }

    // Machine definition typing helper functions
    var Event = function (def) { return def; };
    var Next = function (fn) { return fn; };
    var State = function (def) { return def; };
    var Machine = function (def) { return def; };
    var DeferredNextEvent = function (nextEventName, deferredFn) { return Event({
        next: Next(function (ctx, payload) { return [
            nextEventName,
            deferredFn(ctx, payload),
        ]; }),
    }); };
    // Parallel service constructor
    var parallelize = function () {
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

    exports.interpret = interpret;
    exports.Event = Event;
    exports.Next = Next;
    exports.State = State;
    exports.Machine = Machine;
    exports.DeferredNextEvent = DeferredNextEvent;
    exports.parallelize = parallelize;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cxstate.umd.js.map
