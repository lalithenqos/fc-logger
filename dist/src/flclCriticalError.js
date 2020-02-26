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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxjbENyaXRpY2FsRXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmxjbENyaXRpY2FsRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBd0M7QUFFeEMsTUFBcUIsaUJBQWtCLFNBQVEscUJBQVM7SUFFcEQsWUFBWSxJQUFxQjtRQUM3QixJQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVE7WUFDdEIsSUFBSSxHQUFHLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDO1FBRTNCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLENBQUM7Q0FDSjtBQVRELG9DQVNDIn0=