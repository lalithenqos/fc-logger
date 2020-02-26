
let _ = require('lodash');
import I18nClient from './i18nClient';
import { ValidObject, ValidArray } from './types';
let globals = require('../globals');

/**
 * @class FlclMessage
 */
export class FlclMessage {
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

    constructor(code: string, options: ValidObject = {}) {
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

export class FlclMsgController {
    messages: ValidObject;
    normalErrorCodeList: any; //ValidArray;
    criticalErrorCodeList: any; //ValidArray;
    validationErrorCodeList: any; //ValidArray;
    
    constructor(options: ValidObject) {
        if(options.localesFilePath) {
            globals.localesFilePath = options.localesFilePath;
            let i18nClientObj: I18nClient = new I18nClient(globals.localesFilePath);
            globals.i18nCli = i18nClientObj.connect('en-us');
        }
        if(options.errorMsgCategoryList)
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
        _.each(this.normalErrorCodeList, (aCode: string, index: number) => {
            this.messages[aCode] = new FlclMessage(aCode);
        });

        _.each(this.criticalErrorCodeList, (aCode: string, index: number) => {
            this.messages[aCode] = new FlclMessage(aCode, { critical: true});
        });

        _.each(this.validationErrorCodeList, (aCode: string, index: number) => {
            this.messages[aCode] = new FlclMessage(aCode, { validation: true});
        });
        return this.messages;
    }

    getErrorCode(err: ValidObject | string) {
        let errorCode = this.messages.UNKNOWN;
        try {
          let anError = this.parseErrorData(err);
          if (typeof anError === 'object') {
            errorCode = this.getErrorCodeFromCustomObject(anError);
          } else if (typeof anError === 'string') {
            errorCode = this.getErrorCodeFromString(anError);
          }
          if (!errorCode) {
            let message = String(anError);
            errorCode = new FlclMessage(message, { options: true });
          }
        } catch (e) {
          console.log('Exception occured in the message controller - GetErrorCode method');
          console.log(e);
        } finally {
          return errorCode;
        };
    };

    isCriticalError (err: ValidObject | string) {
        let code = this.getErrorCode(err);
        return code.critical;
    };

    isValidationError (err: ValidObject | string) {
        let code = this.getErrorCode(err);
        return code.validation;
    };

    parseString = (msg: string = '') => {
        let exactMsg = msg;
        let theIndex = msg.lastIndexOf('::');
        if (theIndex !== -1)
          exactMsg = msg.substring(theIndex + 2);
        return exactMsg.trim();
    };

    parseErrorData (err: ValidObject | string) { //Parse the input error structure and traverse deep to get the message text from object
        let parsedErr: any = err;
        try {
          if (typeof err == 'string')
            parsedErr = JSON.parse(err);
          if (parsedErr)
            parsedErr = parsedErr.message || parsedErr;
        } catch (e) {
          parsedErr = err;
        } finally {
          return parsedErr;
        }
    };

    getErrorCodeFromCustomObject(errObj: ValidObject) {

    };

    getErrorCodeFromString(errStr: string = '') {
        let errCode;
        errStr = this.parseString(errStr); //TODO: add comment
        let list: string[] = [...this.normalErrorCodeList, ...this.validationErrorCodeList, ...this.criticalErrorCodeList];
        _.each(list, (aCode: string, index: number) => {
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
      };
      
}
