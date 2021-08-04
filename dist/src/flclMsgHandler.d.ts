import { ValidObject } from './types';
/**
 * @class FlclMessage
 */
export declare class FlclMessage {
    CODE: string;
    critical: boolean;
    validation: boolean;
    originalValue?: string;
    /**
     * Creates an instance of MESSAGES.
     * @param {*} code
     * @param {*} critical
     * @memberof MESSAGES
     */
    constructor(code: string, options?: ValidObject);
    /**
     * @return {code}
     * @memberof MESSAGES
     */
    getCode(): string;
    /**
     * @return {*}
     * @memberof MESSAGES
     */
    isCritical(): string;
    isValidation(): string;
    value(): string;
}
export declare class FlclMsgController {
    messages: ValidObject;
    normalErrorCodeList: any;
    criticalErrorCodeList: any;
    validationErrorCodeList: any;
    constructor(options: ValidObject);
    getStructuredMessages(): ValidObject;
    getErrorCode(err: ValidObject | string): any;
    isCriticalError(err: ValidObject | string): any;
    isValidationError(err: ValidObject | string): any;
    parseString: (msg?: string) => string;
    parseErrorData(err: ValidObject | string): any;
    getErrorCodeFromCustomObject(errObj: ValidObject): void;
    getErrorCodeFromString(errStr?: string): undefined;
}
