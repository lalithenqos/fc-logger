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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxjbFZhbGlkYXRpb25FcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mbGNsVmFsaWRhdGlvbkVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQXdDO0FBRXhDLE1BQXFCLG1CQUFvQixTQUFRLHFCQUFTO0lBRXRELFlBQVksSUFBcUI7UUFDN0IsSUFBRyxPQUFPLElBQUksSUFBSSxRQUFRO1lBQ3RCLElBQUksR0FBRyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQztRQUUzQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUFURCxzQ0FTQyJ9