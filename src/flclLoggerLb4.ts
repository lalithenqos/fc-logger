import { BunyanClient } from './bunyanClient';
let globals = require('../globals');
const DEFAULT_LOG_ROOT_PATH = require('app-root-path') + '/logs/';
import { ValidObject } from './types';
import { FlclMsgController } from './flclMsgHandler';
import { bind, inject, CoreBindings } from '@loopback/core';
import { RestBindings } from '@loopback/rest';
import _ from 'lodash';

let CUSTOM_LEVELS = {
  SECURITY_ERROR: 61,
  SECURITY_INFO: 31,
  NOTICE: 41,
  SERIOUS_ERROR: 55, //High Priority Error - To get notified in email as priority,
  VALIDATION_ERROR: 45
};

export class FlclLoggerLb4 {
  logger: ValidObject; //Bunyun;
  requestId?: string;
  rootRequestId?: string;
  forwardedRequestId?: string;
  flclMsgController?: FlclMsgController;
  constructor(@inject(RestBindings.Http.CONTEXT) public httpContext: ValidObject,
  @inject(CoreBindings.APPLICATION_CONFIG) private appConfig: ValidObject,
  @inject('flcl.logger.options') private options: ValidObject ) {
    if(options.errorMsgCategoryList)
        globals.errorMsgCategoryList = options.errorMsgCategoryList;
      if (this.appConfig.flclLogger) {
        this.logger = this.appConfig.flclLogger;
      } else {
        this.logger = new BunyanClient(options.logRootPath, options).createLogger();
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

  private getCustomLevel(level: number) {
    return (msg: string | ValidObject, ...args: any[]) => {
      let theArgs: ValidObject;
      if (typeof msg === 'string') {
        theArgs = { level: level, msg, ...args };
      } else if (typeof msg === 'object') {
        theArgs = { level: level, ...msg, ...args };
      } else {
        throw new Error('Invalid arguments provided');
      }
      if (theArgs)
        this.logger.fatal(theArgs);
    };
  }

  public setRequestId(requestId: string) {
      this.requestId = requestId;
  }

  private getRequestId() {
    return this.httpContext.name;
  }

  private getrootRequestId() {
    return this.httpContext.rootRequestId;
  }

  private getForwardedRequestId() {
    return this.httpContext.forwardedRequestId;
  }

  private structurizeArg(data: ValidObject) {
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
            } else if (typeof data == 'string' || typeof data == 'number') {
                let msgText = data;
                data = {
                    FlclMsg: msgText,
                    requestId: requestId,
                    rootRequestId: rootRequestId,
                    forwardedRequestId: forwardedRequestId
                };
            };
        }
    } catch (e) {
      console.error(e);
    } finally {
      return data;
    };
  }


  private cleanObj(data: ValidObject) {
    let cleanedObj: ValidObject = {};
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
        } else {
          cleanedObj.FlclMsg = cleanedObj.FlclMsg || {};
          cleanedObj.FlclMsg[key] = propVal;
        }
      });
      cleanedObj.FlclMsg = this._getStringified(cleanedObj.FlclMsg);
      cleanedObj = this.trimLargeText(cleanedObj, data.trim, data.charLimit);
    } catch (e: any) {
      cleanedObj['logdata-parse-error'] = true;
      cleanedObj['logdata-parse-error-msg'] = e.message;
      cleanedObj['logdata-parse-error-stack'] = e.stack;
    } finally {
      return cleanedObj;
    }
  }

  private _getStringified(jsonObj: ValidObject) {
    let stringified: string = '';
    try {
      stringified = JSON.stringify(jsonObj, FlclLoggerLb4.replacer, 4);
    } catch (e) {
      if (jsonObj && jsonObj.response && jsonObj.response.data) {
        stringified = this._getStringified(jsonObj.response.data);
      } else {
        stringified = JSON.stringify({ identifier: 'INVALID_JSON_CIRCULAR_JSON', message: jsonObj.message || 'This is circular json. Could not able to convert', stackTrace: this._getStackTrace() }, FlclLoggerLb4.replacer, 4);
      }
    } finally {
      return stringified;
    }
  }

  static replacer(key: any, data: any) {

    /**
     * ERROR object is non-enumerable, and JSON.stringify() could not able to return stringified version of it.
     * So, using Object.getOwnPropertyNames().forEach(()=>{}), cloning its non-enumerable properties into other object as enumerable properties, and returning that new object.
     */
    if (data instanceof Error) {
      let cleanData: ValidObject = {};
      Object.getOwnPropertyNames(data).forEach((key) => {
        cleanData[key] = data[key];
      });
      data = cleanData;
    } else if (typeof data === 'string') { // If its already stringified object, then parse it(since the parent stringify will take care of stringifying it)
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = data;
      }
    }

    return data;
  }

  trimLargeText(cleanedObj: ValidObject, trim: boolean, charLimit: number) {
    if(trim == undefined)
        trim = true;
    let keys = ['FlclMsg', 'propertyValue'];
    if(trim) {
        charLimit = charLimit || 15000;
        _.each(keys, (key: string, index: number) => {
            if(cleanedObj[key] && typeof cleanedObj[key] == 'string' && cleanedObj[key].length > charLimit)
                cleanedObj[key] = cleanedObj[key].substring(0, charLimit) + ' (-----TRUNCATED----- )';
        });
    }
    return cleanedObj;
}

  private displayInRootLevel(key: string) {
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

  private canStringify(key: string) {
    let stringifyProps = [
      'propertyValue',
    ];
    if (stringifyProps.indexOf(key) != -1)
      return true;
    else
      return false;
  }

  private _getStackTrace() {
    let obj: ValidObject = {};
    Error.captureStackTrace(obj, this._getStackTrace);
    return obj.stack;
  }

  trace(args: any) {
    this.logger.trace(this.structurizeArg(args));
  }

  debug(args: any) {
    this.logger.debug(this.structurizeArg(args));
  }

  info(args: any) {
    this.logger.info(this.structurizeArg(args));
  }

  warn(args: any) {
    this.logger.warn(this.structurizeArg(args));
  }

  error(args: any) {
    if (args && args.errorType == 'critical' || (this.flclMsgController && this.flclMsgController.isCriticalError(args)))
      this.critical(args);
    else if (args && args.errorType == 'validation' || (this.flclMsgController && this.flclMsgController.isValidationError(args)) )
      this.validation(args);
    else
      this.logger.error(this.structurizeArg(args));
  }

  validation(args: any) {
    this.logger.validationError(this.structurizeArg(args));
  }

  critical(args: any) {
    this.logger.criticalError(this.structurizeArg(args));
  }

  fatal(args: any) {
    this.logger.fatal(this.structurizeArg(args));
  }
}
