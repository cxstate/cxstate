"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
/**
 * Internprets a machine-definition. Returns a ready to use machine-service.
 */
function interpret(machineDef) {
    var stateConfigs = [];
    var buildStateConfigs = function (basePath, name, state) {
        var absolute = lib_1.resolvePath(basePath, name);
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
    var initial = lib_1.initialStateName(machineDef.initial, machineDef.context);
    var initialAbsPath = initial.startsWith('/') ? initial : "/" + initial;
    var initialState = stateConfigs.find(function (sp) { return sp.path.absolute === initialAbsPath; });
    if (initialState) {
        var initialChild = lib_1.findInitialChildState(machineDef.context, stateConfigs, initialState);
        if (initialChild) {
            initialState = initialChild;
        }
        return makeService(stateConfigs, machineDef.context, initialState);
    }
    else {
        throw new Error("Initial state \"" + initial + "\" doesn't match any of the definitions");
    }
}
exports.interpret = interpret;
function makeService(stateConfigs, initialContext, initialState) {
    var _this = this;
    var activeStates = lib_1.rebuildActiveStates(initialState, [], stateConfigs);
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
    var transitionToTarget = function (target, from, srcEvent) {
        if (target) {
            var fsp = from.path;
            var targetPath_1 = lib_1.resolvePath(fsp.absolute + "/", target);
            var targetConfig = stateConfigs.find(function (sc) { return sc.path.absolute === targetPath_1; });
            if (targetConfig) {
                transitionToState(targetConfig, srcEvent);
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
    var transitionToState = function (parent, srcEvent) {
        var child = lib_1.findInitialChildState(currentContext, stateConfigs, parent);
        var transitionTargetState = child ? child : parent;
        var rebuiltActiveStates = lib_1.rebuildActiveStates(transitionTargetState, activeStates, stateConfigs);
        if (rebuiltActiveStates !== activeStates) {
            activeStates = rebuiltActiveStates;
            matcherMemoization = {};
            isDirty = true;
            processCurrentStateEntryEvent(srcEvent);
        } /* TODO: temporary state. Else case is important for it. */
        if (isDirty)
            informListeners();
    };
    // EVENT PROCESSING
    var processCurrentStateEntryEvent = function (srcEvent) {
        var cs = currentState();
        if (cs.state.entry)
            processAnyEventHandler(cs.state.entry, cs, srcEvent);
    };
    var processAnyEventHandler = function (anyHandler, from, event) {
        if (typeof anyHandler === 'string') {
            transitionToTarget(anyHandler, from, event);
        }
        else if (anyHandler instanceof Array) {
            processEvents(anyHandler, from, event);
        }
        else {
            processEvents([anyHandler], from, event);
        }
    };
    var processEvents = function (defs, from, event) {
        var mutate = function (def) {
            if (def.update) {
                var update = lib_1.updateContext(currentContext, def, event);
                if (update) {
                    currentContext = update;
                    isDirty = true;
                }
            }
            else if (def.replace) {
                var replacement = def.replace(currentContext, event);
                if (replacement !== currentContext) {
                    currentContext = replacement;
                    isDirty = true;
                }
            }
        };
        var dispatch = function (def) {
            if (typeof def.next === 'string')
                send(def.next, event);
            else if (def.next)
                send.apply(void 0, def.next(currentContext, event));
            else if (isDirty)
                informListeners();
        };
        var transitionOrDispatch = function (def) {
            if (def.target && !def.next)
                transitionToTarget(def.target, from, event);
            else if (!def.target && def.next)
                dispatch(def);
            else if (isDirty)
                informListeners();
        };
        for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
            var def = defs_1[_i];
            if (def.cond && def.cond(currentContext, event)) {
                mutate(def);
                transitionOrDispatch(def);
                break;
            }
            else if (!def.cond) {
                mutate(def);
                transitionOrDispatch(def);
            }
        }
    };
    var send = function (name, event) {
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
        if (event instanceof Promise) {
            eventPayloadPromises.set(name, event);
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var success, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, event];
                        case 1:
                            success = _a.sent();
                            if (eventPayloadPromises.get(name) === event) {
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
            continueWithPayload(name, event);
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
                var absToMatch = lib_1.resolvePath(cs.path.absolute, toMatch);
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
//# sourceMappingURL=index.js.map