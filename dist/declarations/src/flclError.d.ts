import { ValidObject } from "./types";
declare let VError: any;
export declare class FlclError extends VError.WError {
    className: string;
    methodName: string;
    propertyName?: string;
    propertyValue?: string;
    message: string;
    identifier?: string;
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
    constructor(args?: any);
    static create(args: {
        [x: string]: any;
    }): any;
    /**
     * We were using WError, so chaining of messages will not be done by WError as like VError. So doing it manually based on specific flag in 'args'
     */
    getMsgBasedOnArgs(args: {
        [x: string]: any;
    }): string;
    static getMessageFromCause(cause?: {
        [x: string]: any;
    }): string;
    /**
     * Basically, the args['cause'] should be an instance of generic 'Error' class. Because, the 'VError' lib will add a property 'jse_cause'(in FLCLError obj instance) only if args['cause'] is an instance of Error class.
     * So, for us to get the 'jse_cause', we have verify the type of args['cause'], if it is not an instacnce of Error, make it as an instance of Error.
     */
    static parseCause(args: {
        [x: string]: any;
    }): any;
    static isValidCause(cause: ValidObject): boolean;
    static getCauseFromInsideObject(inValidCause: ValidObject): ValidObject | null;
    static formCustomErrObj(theCause: ValidObject): ValidObject;
    static replacer(key: any, data: {
        [x: string]: any;
    }): {
        [x: string]: any;
    };
    getCause(cause: {
        [x: string]: any;
    } | null): {
        [x: string]: any;
    } | null;
    static isErrorTypeFLCL(err: any): boolean;
    static isValidationError(err: any): boolean;
    static isDataError(err: any): boolean;
    static addContext(err: any, params: {
        [x: string]: any;
    }): any;
    static getErrorType(err: any): string;
    static getErrorTypeFromArr(err: any): any;
}
export {};
