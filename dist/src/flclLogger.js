"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlclLogger = void 0;
const tslib_1 = require("tslib");
const bunyanClient_1 = require("./bunyanClient");
let globals = require('../globals');
const DEFAULT_LOG_ROOT_PATH = require('app-root-path') + '/logs/';
const rootLevelNodes_json_1 = tslib_1.__importDefault(require("./rootLevelNodes.json"));
let CUSTOM_LEVELS = {
    SECURITY_ERROR: 61,
    SECURITY_INFO: 31,
    NOTICE: 41,
    SERIOUS_ERROR: 55,
    VALIDATION_ERROR: 45
};
class FlclLogger {
    constructor(options) {
        if (!options.logRootPath)
            options.logRootPath = DEFAULT_LOG_ROOT_PATH;
        if (options.requestId)
            this.setRequestId(options.requestId);
        if (options.rootRequestId)
            this.rootRequestId = options.rootRequestId;
        if (options.forwardedRequestId)
            this.forwardedRequestId = options.forwardedRequestId;
        if (options.errorMsgCategoryList)
            globals.errorMsgCategoryList = options.errorMsgCategoryList;
        this.logger = new bunyanClient_1.BunyanClient(options.logRootPath, options).createLogger();
        this.info({ identifier: 'flclLogger-instance', propertyName: 'Logger Instantiation', data: { msg: 'New Flcl-logger instance has been created!' } });
        this.bindCustomLevelLogs();
    }
    bindCustomLevelLogs() {
        this.logger.notice = this.getCustomLevel(CUSTOM_LEVELS.NOTICE);
        this.logger.securityError = this.getCustomLevel(CUSTOM_LEVELS.SECURITY_ERROR);
        this.logger.securityInfo = this.getCustomLevel(CUSTOM_LEVELS.SECURITY_INFO);
        this.logger.criticalError = this.getCustomLevel(CUSTOM_LEVELS.SERIOUS_ERROR);
        this.logger.validationError = this.getCustomLevel(CUSTOM_LEVELS.VALIDATION_ERROR);
    }
    getCustomLevel(level) {
        return (msg, ...args) => {
            let theArgs;
            if (typeof msg === 'string') {
                theArgs = { level: level, msg, ...args };
            }
            else if (typeof msg === 'object') {
                theArgs = { level: level, ...msg, ...args };
            }
            else {
                throw new Error('Invalid arguments provided');
            }
            if (theArgs)
                this.logger.fatal(theArgs);
        };
    }
    setRequestId(requestId) {
        this.requestId = requestId;
    }
    getRequestId() {
        return this.requestId;
    }
    getrootRequestId() {
        return this.rootRequestId;
    }
    getForwardedRequestId() {
        return this.forwardedRequestId;
    }
    structurizeArg(data) {
        try {
            let requestId = this.getRequestId();
            let rootRequestId = this.getrootRequestId();
            let forwardedRequestId = this.getForwardedRequestId();
            if (data) {
                if (typeof data == 'object') {
                    data = this.cleanObj(data);
                    data.requestId = requestId;
                    data.rootRequestId = rootRequestId;
                    data.forwardedRequestId = forwardedRequestId;
                }
                else if (typeof data == 'string' || typeof data == 'number') {
                    let msgText = data;
                    data = {
                        FlclMsg: msgText,
                        requestId: requestId,
                        rootRequestId: rootRequestId,
                        forwardedRequestId: forwardedRequestId
                    };
                }
                ;
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            return data;
        }
        ;
    }
    cleanObj(data) {
        let cleanedObj = {};
        try {
            /**
             * The 'data' might have 'non-enumerable' properties.
             * The normal loop methods like 'forLoop' or '_.each" will not look on the non-enumerable properties, and hence those properties will get skipped in our log information.
             * Hence, we are Iterating 'data' using Object.getOwnPropertyNames().forEach(()=>{}) syntax (to iterate over non-enumerable properties as well)
             * Ex: 'FlclError' object instance has a property named 'stack', which is non-enumerable
             */
            Object.getOwnPropertyNames(data).forEach((key) => {
                let propVal = data[key];
                if (this.displayInRootLevel(key)) {
                    if (typeof propVal != 'string' && this.canStringify(key))
                        cleanedObj[key] = this._getStringified(propVal);
                    else
                        cleanedObj[key] = propVal;
                }
                else {
                    cleanedObj.FlclMsg = cleanedObj.FlclMsg || {};
                    cleanedObj.FlclMsg[key] = propVal;
                }
            });
            cleanedObj.FlclMsg = this._getStringified(cleanedObj.FlclMsg);
        }
        catch (e) {
            cleanedObj['logdata-parse-error'] = true;
            cleanedObj['logdata-parse-error-msg'] = e.message;
            cleanedObj['logdata-parse-error-stack'] = e.stack;
        }
        finally {
            return cleanedObj;
        }
    }
    _getStringified(jsonObj) {
        let stringified = '';
        try {
            stringified = JSON.stringify(jsonObj, FlclLogger.replacer, 4);
        }
        catch (e) {
            if (jsonObj && jsonObj.response && jsonObj.response.data) {
                stringified = this._getStringified(jsonObj.response.data);
            }
            else {
                stringified = JSON.stringify({ identifier: 'INVALID_JSON_CIRCULAR_JSON', message: jsonObj.message || 'This is circular json. Could not able to convert', stackTrace: this._getStackTrace() }, FlclLogger.replacer, 4);
            }
        }
        finally {
            return stringified;
        }
    }
    static replacer(key, data) {
        /**
         * ERROR object is non-enumerable, and JSON.stringify() could not able to return stringified version of it.
         * So, using Object.getOwnPropertyNames().forEach(()=>{}), cloning its non-enumerable properties into other object as enumerable properties, and returning that new object.
         */
        if (data instanceof Error) {
            let cleanData = {};
            Object.getOwnPropertyNames(data).forEach((key) => {
                cleanData[key] = data[key];
            });
            data = cleanData;
        }
        else if (typeof data === 'string') { // If its already stringified object, then parse it(since the parent stringify will take care of stringifying it)
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                data = data;
            }
        }
        return data;
    }
    displayInRootLevel(key) {
        if (rootLevelNodes_json_1.default.indexOf(key) != -1)
            return true;
        else
            return false;
    }
    canStringify(key) {
        let stringifyProps = [
            'propertyValue',
        ];
        if (stringifyProps.indexOf(key) != -1)
            return true;
        else
            return false;
    }
    _getStackTrace() {
        let obj = {};
        Error.captureStackTrace(obj, this._getStackTrace);
        return obj.stack;
    }
    trace(args) {
        this.logger.trace(this.structurizeArg(args));
    }
    debug(args) {
        this.logger.debug(this.structurizeArg(args));
    }
    info(args) {
        this.logger.info(this.structurizeArg(args));
    }
    warn(args) {
        this.logger.warn(this.structurizeArg(args));
    }
    error(args) {
        if (args && args.errorType == 'critical' || (this.flclMsgController && this.flclMsgController.isCriticalError(args)))
            this.critical(args);
        else if (args && args.errorType == 'validation' || (this.flclMsgController && this.flclMsgController.isValidationError(args)))
            this.validation(args);
        else
            this.logger.error(this.structurizeArg(args));
    }
    validation(args) {
        this.logger.validationError(this.structurizeArg(args));
    }
    critical(args) {
        this.logger.criticalError(this.structurizeArg(args));
    }
    fatal(args) {
        this.logger.fatal(this.structurizeArg(args));
    }
}
exports.FlclLogger = FlclLogger;
//# sourceMappingURL=flclLogger.js.map