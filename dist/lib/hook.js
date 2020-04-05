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
var react_1 = require("react");
var _1 = require(".");
function useMachine(machineDef) {
    var service = react_1.useState(function () { return _1.interpret(machineDef); })[0];
    var _a = react_1.useState({
        path: service.path(),
        context: service.context(),
    }), state = _a[0], setState = _a[1];
    react_1.useEffect(function () { return service.onTransition(function (context, path) {
        setState({ context: context, path: path });
    }); }, [service, setState]);
    return [
        __assign(__assign({}, state), { matchesOne: service.matchesOne, matchesNone: service.matchesNone }),
        service.send,
    ];
}
exports.useMachine = useMachine;
//# sourceMappingURL=hook.js.map