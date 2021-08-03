"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlclMsgController = exports.FlclMessage = void 0;
const tslib_1 = require("tslib");
let _ = require('lodash');
const i18nClient_1 = tslib_1.__importDefault(require("./i18nClient"));
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
//# sourceMappingURL=flclMsgHandler.js.map