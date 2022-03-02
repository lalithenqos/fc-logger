"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlclLoggerLb4 = void 0;
const tslib_1 = require("tslib");
const bunyanClient_1 = require("./bunyanClient");
let globals = require('../globals');
const DEFAULT_LOG_ROOT_PATH = require('app-root-path') + '/logs/';
const core_1 = require("@loopback/core");
const rest_1 = require("@loopback/rest");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
let CUSTOM_LEVELS = {
    SECURITY_ERROR: 61,
    SECURITY_INFO: 31,
    NOTICE: 41,
    SERIOUS_ERROR: 55,
    VALIDATION_ERROR: 45
};
let FlclLoggerLb4 = class FlclLoggerLb4 {
    constructor(httpContext, appConfig, options) {
        this.httpContext = httpContext;
        this.appConfig = appConfig;
        this.options = options;
        if (options.errorMsgCategoryList)
            globals.errorMsgCategoryList = options.errorMsgCategoryList;
        if (this.appConfig.flclLogger) {
            this.logger = this.appConfig.flclLogger;
        }
        else {
            this.logger = new bunyanClient_1.BunyanClient(options.logRootPath, options).createLogger();
            this.info({ identifier: 'flclLogger-instance', propertyName: 'Logger Instantiation', data: { msg: 'New Flcl-logger instance has been created!' } });
            this.appConfig.flclLogger = this.logger;
            this.bindCustomLevelLogs();
        }
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
        return this.httpContext.name;
    }
    getrootRequestId() {
        return this.httpContext.rootRequestId;
    }
    getForwardedRequestId() {
        return this.httpContext.forwardedRequestId;
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
            cleanedObj = this.trimLargeText(cleanedObj, data.trim, data.charLimit);
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
            stringified = JSON.stringify(jsonObj, FlclLoggerLb4.replacer, 4);
        }
        catch (e) {
            if (jsonObj && jsonObj.response && jsonObj.response.data) {
                stringified = this._getStringified(jsonObj.response.data);
            }
            else {
                stringified = JSON.stringify({ identifier: 'INVALID_JSON_CIRCULAR_JSON', message: jsonObj.message || 'This is circular json. Could not able to convert', stackTrace: this._getStackTrace() }, FlclLoggerLb4.replacer, 4);
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
    trimLargeText(cleanedObj, trim, charLimit) {
        if (trim == undefined)
            trim = true;
        let keys = ['FlclMsg', 'propertyValue'];
        if (trim) {
            charLimit = charLimit || 15000;
            lodash_1.default.each(keys, (key, index) => {
                if (cleanedObj[key] && typeof cleanedObj[key] == 'string' && cleanedObj[key].length > charLimit)
                    cleanedObj[key] = cleanedObj[key].substring(0, charLimit) + ' (-----TRUNCATED----- )';
            });
        }
        return cleanedObj;
    }
    displayInRootLevel(key) {
        let rootLevels = [
            'userAgent', 'host',
            'req', 'res', 'err',
            'appId', 'userId', 'customerName', 'companyName', 'customerId', 'companyName', 'orderReference', 'fromCity', 'fromCountry', 'toCity', 'toCountry', 'route', 'FlclMsg',
            'className', 'class', 'methodName', 'propertyValue', 'propertyName', 'level',
            'requestId', 'rootRequestId', 'forwardedRequestId', 'earlierRequestId', 'isNewRequest', 'isEndOfResponse', 'inTime', 'inTimeDate', 'elapsedTime',
            'workerName', 'action',
            'errorType', 'identifier', 'carrierList', 'carrierList2', 'rateAPIFlag', 'rateEntryLog',
            'newOrder', 'orderRateProvider', 'orderGateway', 'processedOrderStatus', 'usedFlavorCloudRate', 'carrier', 'shippingLineDetail', 'order',
            'shipmentLogContext', 'browserLog', 'severity', 'msgFromContext4', 'xShopifyOrderId', 'xShopifyDomain', 'xShopifyTopic', 'awsRequestId',
            'npm', 'stateId', 'stateKey'
        ];
        if (rootLevels.indexOf(key) != -1)
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
};
FlclLoggerLb4 = (0, tslib_1.__decorate)([
    (0, tslib_1.__param)(0, (0, core_1.inject)(rest_1.RestBindings.Http.CONTEXT)),
    (0, tslib_1.__param)(1, (0, core_1.inject)(core_1.CoreBindings.APPLICATION_CONFIG)),
    (0, tslib_1.__param)(2, (0, core_1.inject)('flcl.logger.options')),
    (0, tslib_1.__metadata)("design:paramtypes", [Object, Object, Object])
], FlclLoggerLb4);
exports.FlclLoggerLb4 = FlclLoggerLb4;
//# sourceMappingURL=flclLoggerLb4.js.map