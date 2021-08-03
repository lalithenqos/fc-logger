"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flclError_1 = require("./flclError");
class FlclValidationError extends flclError_1.FlclError {
    constructor(args) {
        if (typeof args == 'string')
            args = { message: args };
        super(args);
        this.errorType = 'validation';
    }
}
exports.default = FlclValidationError;
//# sourceMappingURL=flclValidationError.js.map