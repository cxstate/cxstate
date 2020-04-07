"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.rebuildActiveStates = rebuildActiveStates;
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
exports.findInitialChildState = findInitialChildState;
function hasChildStates(state) {
    return !!(state.states && Object.values(state.states).length);
}
function updateContext(ctx, def, event) {
    console.log('UPDATING CONTEXT');
    var update = __assign({}, ctx);
    var didUpdate = false;
    for (var propName in def.update) {
        var anyFn = def.update[propName];
        if (typeof anyFn === 'function') {
            var fn = anyFn;
            var changedValue = fn(update, event);
            if (changedValue !== update[propName]) {
                update[propName] = changedValue;
                didUpdate = true;
            }
        }
    }
    if (didUpdate)
        return update;
}
exports.updateContext = updateContext;
function initialStateName(initial, ctx) {
    return (typeof initial === 'string') ? initial : initial(ctx);
}
exports.initialStateName = initialStateName;
function resolvePath(base, relativeComp) {
    if (!base.startsWith('/'))
        throw new Error('Base component of path must start with /');
    var host = 'http://con5.app';
    var url = (new URL(relativeComp, "" + host + base)).href;
    return url.slice(host.length);
}
exports.resolvePath = resolvePath;
//# sourceMappingURL=lib.js.map