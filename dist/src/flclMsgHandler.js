"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const i18nClient_1 = __importDefault(require("./i18nClient"));
let globals = require('../globals');
/**
 * @class FlclMessage
 */
class FlclMessage {
    /**
     * Creates an instance of MESSAGES.
     * @param {*} code
     * @param {*} critical
     * @memberof MESSAGES
     */
    constructor(code, options = {}) {
        this.CODE = code;
        this.critical = options.critical || false;
        this.validation = options.validation || false;
    }
    /**
     * @return {code}
     * @memberof MESSAGES
     */
    getCode() {
        return `${this.CODE}`;
    }
    /**
     * @return {*}
     * @memberof MESSAGES
     */
    isCritical() {
        return `${this.critical}`;
    }
    isValidation() {
        return `${this.validation}`;
    }
    value() {
        return (this.originalValue || `${globals.i18nCli.__(this.CODE)}`);
    }
}
exports.FlclMessage = FlclMessage;
class FlclMsgController {
    constructor(options) {
        this.parseString = (msg = '') => {
            let exactMsg = msg;
            let theIndex = msg.lastIndexOf('::');
            if (theIndex !== -1)
                exactMsg = msg.substring(theIndex + 2);
            return exactMsg.trim();
        };
        if (options.localesFilePath) {
            globals.localesFilePath = options.localesFilePath;
            let i18nClientObj = new i18nClient_1.default(globals.localesFilePath);
            globals.i18nCli = i18nClientObj.connect('en-us');
        }
        if (options.errorMsgCategoryList)
            globals.errorMsgCategoryList = options.errorMsgCategoryList;
        this.normalErrorCodeList = [];
        this.validationErrorCodeList = [];
        this.criticalErrorCodeList = ['UNKNOWN'];
        this.messages = this.getStructuredMessages();
    }
    getStructuredMessages() {
        this.normalErrorCodeList.push(...globals.errorMsgCategoryList.normalErrorCodeList);
        this.criticalErrorCodeList.push(...globals.errorMsgCategoryList.criticalErrorCodeList);
        this.validationErrorCodeList.push(...globals.errorMsgCategoryList.validationErrorCodeList);
        this.messages = {};
        _.each(this.normalErrorCodeList, (aCode, index) => {
            this.messages[aCode] = new FlclMessage(aCode);
        });
        _.each(this.criticalErrorCodeList, (aCode, index) => {
            this.messages[aCode] = new FlclMessage(aCode, { critical: true });
        });
        _.each(this.validationErrorCodeList, (aCode, index) => {
            this.messages[aCode] = new FlclMessage(aCode, { validation: true });
        });
        return this.messages;
    }
    getErrorCode(err) {
        let errorCode = this.messages.UNKNOWN;
        try {
            let anError = this.parseErrorData(err);
            if (typeof anError === 'object') {
                errorCode = this.getErrorCodeFromCustomObject(anError);
            }
            else if (typeof anError === 'string') {
                errorCode = this.getErrorCodeFromString(anError);
            }
            if (!errorCode) {
                let message = String(anError);
                errorCode = new FlclMessage(message, { options: true });
            }
        }
        catch (e) {
            console.log('Exception occured in the message controller - GetErrorCode method');
            console.log(e);
        }
        finally {
            return errorCode;
        }
        ;
    }
    ;
    isCriticalError(err) {
        let code = this.getErrorCode(err);
        return code.critical;
    }
    ;
    isValidationError(err) {
        let code = this.getErrorCode(err);
        return code.validation;
    }
    ;
    parseErrorData(err) {
        let parsedErr = err;
        try {
            if (typeof err == 'string')
                parsedErr = JSON.parse(err);
            if (parsedErr)
                parsedErr = parsedErr.message || parsedErr;
        }
        catch (e) {
            parsedErr = err;
        }
        finally {
            return parsedErr;
        }
    }
    ;
    getErrorCodeFromCustomObject(errObj) {
    }
    ;
    getErrorCodeFromString(errStr = '') {
        let errCode;
        errStr = this.parseString(errStr); //TODO: add comment
        let list = [...this.normalErrorCodeList, ...this.validationErrorCodeList, ...this.criticalErrorCodeList];
        _.each(list, (aCode, index) => {
            if (String(errStr).indexOf(globals.i18nCli.__(aCode)) != -1)
                errCode = this.messages[aCode];
        });
        /* if (!errCode) {
          if (errStr.indexOf('Results not found, Error at query SELECT Provider') !== -1) {
            errCode = this.messages.INVALID_RATES;
            errCode.critical = true;
            errCode.originalValue = globals.i18nCli.__(errCode.CODE);
          } else if (errStr.indexOf('PhoneNumber') !== -1 || errStr.indexOf('phone') !== -1) {
            errCode = this.messages.PHONE_NUMBER_MISSING;
            errCode.critical = true;
            errCode.originalValue = globals.i18nCli.__(errCode.CODE);
          } else if (errStr.indexOf('postal code') !== -1) {
            errCode = this.messages.ZIP_CODE_MISSING;
            errCode.critical = true;
            errCode.originalValue = globals.i18nCli.__(errCode.CODE);
          } else {
            globals.i18nCli.__(errStr);
            errCode = this.messages.DEFAULT_ERROR_MESSAGE;
            errCode.critical = true;
            errCode.originalValue = globals.i18nCli.__(errCode.CODE);
          }
        } */
        return errCode;
    }
    ;
}
exports.FlclMsgController = FlclMsgController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxjbE1zZ0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmxjbE1zZ0hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUIsOERBQXNDO0FBRXRDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUVwQzs7R0FFRztBQUNILE1BQWEsV0FBVztJQUtwQjs7Ozs7T0FLRztJQUVILFlBQVksSUFBWSxFQUFFLFVBQXVCLEVBQUU7UUFDakQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0lBQ2hELENBQUM7SUFDRDs7O09BR0c7SUFDSCxPQUFPO1FBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVTtRQUNSLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCxLQUFLO1FBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDSjtBQXhDRCxrQ0F3Q0M7QUFFRCxNQUFhLGlCQUFpQjtJQU0xQixZQUFZLE9BQW9CO1FBa0VoQyxnQkFBVyxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUUsRUFBRTtZQUMvQixJQUFJ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