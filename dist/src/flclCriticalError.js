"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flclError_1 = require("./flclError");
class FlclCriticalError extends flclError_1.FlclError {
    constructor(args) {
        if (typeof args == 'string')
            args = { message: args };
        super(args);
        this.errorType = 'critical';
    }
}
exports.default = FlclCriticalError;
//# sourceMappingURL=flclCriticalError.js.map