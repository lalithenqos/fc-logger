"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxjbEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZsY2xFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQjs7R0FFRztBQUNILE1BQU0sVUFBVSxHQUFHO0lBQ2pCLFdBQVc7SUFDWCxxQkFBcUI7SUFDckIsZUFBZTtDQUNoQixDQUFDO0FBRUYsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUM7QUFDdkMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTVCLE1BQWEsU0FBVSxTQUFRLE1BQU0sQ0FBQyxNQUFNO0lBTzFDOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsWUFBWSxPQUFZLEVBQUU7UUFDeEIsSUFBSSxPQUFPLElBQUksSUFBSSxRQUFRO1lBQ3pCLElBQUksR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUMzQixJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25FLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENB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