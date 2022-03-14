"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlclError = void 0;
const tslib_1 = require("tslib");
let VError = require('verror');
/**
 * Custom error message class. The idea is to add more functionality when needed
 */
const errorTypes = [
    'FlclError',
    'FlclValidationError',
    'FlclDataError'
];
const DEFAULT_ERROR_TYPE = 'FlclError';
const _ = require('lodash');
const rootLevelNodes_json_1 = tslib_1.__importDefault(require("./rootLevelNodes.json"));
class FlclError extends VError.WError {
    /**
     * @param [] args can contain the following
     * cause - error object
     * message - error message string
     * className - The classname on which the error occured
     * methodName - the function name on which the error occured
     * propertyName - the input argument or property name which caused the error
     * propertyValue - the value of the property that caused the error
     * usage example - All fields are optional
     *  flclError = new FlclError({message: 'Hello World', name: 'New error', className: 'Server', methodName: 'app start', propertyName: 'test', propertyValue: "hey"});
     *  logger.error(flclError);
     */
    constructor(args = '') {
        if (typeof args == 'string')
            args = { message: args };
        let cause = FlclError.parseCause(args);
        super(cause, args['message']);
        this.className = (args['className']) ? args['className'] : null;
        this.methodName = (args['methodName']) ? args['methodName'] : null;
        if (args['propertyName'])
            this.propertyName = (args['propertyName']);
        if (args['propertyValue'])
            this.propertyValue = (args['propertyValue']);
        this.message = this.getMsgBasedOnArgs(args);
        if (args['identifier'])
            this.identifier = args['identifier'];
        if (args['identifier'])
            this.identifier = args['identifier'];
        Object.keys(args).forEach((key, val) => {
            if (rootLevelNodes_json_1.default.indexOf(key) && !this[key])
                this[key] = args[key];
        });
    }
    static create(args) {
        if (typeof args == 'string')
            args = { message: args };
        else if (args.cause || args.message)
            args = args;
        else
            args = { cause: args };
        let errType = FlclError.getErrorType(args.cause || '');
        let err = new (eval(errType))(args);
        return err;
    }
    /**
     * We were using WError, so chaining of messages will not be done by WError as like VError. So doing it manually based on specific flag in 'args'
     */
    getMsgBasedOnArgs(args) {
        let msg = this.message;
        if (msg == 'undefined' || msg == null)
            msg = '';
        if (args['appendChildMsg'])
            msg += FlclError.getMessageFromCause(this.jse_cause);
        return msg;
    }
    static getMessageFromCause(cause = {}) {
        if (cause && cause.message)
            return ':: ' + cause.message;
        else
            return '';
    }
    /**
     * Basically, the args['cause'] should be an instance of generic 'Error' class. Because, the 'VError' lib will add a property 'jse_cause'(in FLCLError obj instance) only if args['cause'] is an instance of Error class.
     * So, for us to get the 'jse_cause', we have verify the type of args['cause'], if it is not an instacnce of Error, make it as an instance of Error.
     */
    static parseCause(args) {
        let cause = args['cause'] || null;
        try {
            if (!(cause instanceof Error) && cause !== null)
                cause = new Error(JSON.stringify(cause, FlclError.replacer, 4));
            if (!FlclError.isValidCause(cause)) {
                let nestedCause = FlclError.getCauseFromInsideObject(cause);
                if (nestedCause) {
                    cause = FlclError.parseCause({ cause: nestedCause });
                }
                else {
                    cause = FlclError.formCustomErrObj(cause);
                }
            }
        }
        catch (e) {
            cause = FlclError.formCustomErrObj(cause);
        }
        finally {
            return cause;
        }
    }
    static isValidCause(cause) {
        try {
            let strigified = JSON.stringify(cause, FlclError.replacer, 4);
            return true;
        }
        catch (e) {
            //if (e.message && e.message.toLowerCase() === 'converting circular structure to json')
            return false;
        }
    }
    static getCauseFromInsideObject(inValidCause) {
        let validCause = null;
        if (inValidCause) {
            if (inValidCause.response && inValidCause.response.data) {
                if (FlclError.isValidCause(inValidCause.response.data))
                    validCause = inValidCause.response.data;
            }
            else if (inValidCause.cause && inValidCause.cause.response && inValidCause.cause.response.data) {
                if (FlclError.isValidCause(inValidCause.cause.response.data))
                    validCause = inValidCause.cause.response.data;
            }
        }
        return validCause;
    }
    static formCustomErrObj(theCause) {
        theCause = theCause || {};
        let cause = {
            message: theCause.message || 'UNKNOWN - from FlclError - since it received inValidCause',
            stack: theCause.stack
        };
        cause = new Error(JSON.stringify(cause, FlclError.replacer, 4));
        return cause;
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
        else if (typeof data == 'string') { //  If its already stringified object, then parse it(since the parent stringify will take care of stringifying it)
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                data = data;
            }
        }
        return data;
    }
    getCause(cause) {
        //Skipping to add 'cause', since the vError will add 'jse_cause' if the cause is of type 'Error'. So, to avoid duplicates, we making FLCLError 'cause' as 'null'
        if (cause instanceof Error)
            cause = null;
        return cause;
    }
    //Checks whether the error is an instane of any user-defined type(any FLCL created error class)
    static isErrorTypeFLCL(err) {
        let isErrorTypeFlcl = false;
        if (Array.isArray(err)) {
            let tempBuffer = [];
            _.each(err, (anErr, index) => {
                let theError = anErr.e;
                _.each(errorTypes, (anErrorType, index) => {
                    if (theError.constructor.name == anErrorType)
                        isErrorTypeFlcl = true;
                });
                tempBuffer.push(isErrorTypeFlcl);
            });
            if (tempBuffer.indexOf(false) != -1)
                isErrorTypeFlcl = false;
        }
        else {
            _.each(errorTypes, (anErrorType, index) => {
                if (err.constructor.name == anErrorType)
                    isErrorTypeFlcl = true;
            });
        }
        return isErrorTypeFlcl;
    }
    static isValidationError(err) {
        let isValidationError = false;
        if (err.constructor.name == 'FlclValidationError')
            isValidationError = true;
        return isValidationError;
    }
    static isDataError(err) {
        let isDataError = false;
        if (err.constructor.name == 'FlclDataError')
            isDataError = true;
        return isDataError;
    }
    static addContext(err = {}, params) {
        let appendChildMsg = params.appendChildMsg || false;
        Object.getOwnPropertyNames(params).forEach((key) => {
            if (key == 'message' && appendChildMsg)
                err[key] = params[key] + FlclError.getMessageFromCause(err['jse_cause']);
            else
                err[key] = params[key];
        });
        return err;
    }
    static getErrorType(err) {
        let defaultErrorType = 'FlclError';
        let errorType = '';
        try {
            if (!FlclError.isErrorTypeFLCL(err))
                errorType = defaultErrorType;
            else if (Array.isArray(err)) {
                errorType = FlclError.getErrorTypeFromArr(err);
            }
            else {
                errorType = err.constructor.name;
            }
        }
        catch (e) {
            errorType = defaultErrorType;
        }
        finally {
            return errorType;
        }
    }
    //If array of errors is passed as 'cause', then get common 'error' type, else return 'DEFAULT_ERROR_TYPE'
    static getErrorTypeFromArr(err) {
        let errorTypes = [];
        _.each(err, (anError, index) => {
            if (anError && anError.e)
                errorTypes.push(anError.e.constructor.name);
        });
        let uniqErrorTypes = _.uniq(errorTypes);
        if (uniqErrorTypes.length > 1)
            return DEFAULT_ERROR_TYPE;
        else
            return uniqErrorTypes[0];
    }
}
exports.FlclError = FlclError;
//# sourceMappingURL=flclError.js.map