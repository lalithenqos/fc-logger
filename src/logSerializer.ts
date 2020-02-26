let VError = require('verror');
import { FlclError } from './flclError';
import { FlclLogger } from './flclLogger';
//import { ValidObject } from '../../types';
//import { Serializer, Serializers } from 'bunyan';

/**
 * Custom serializer for Bunyan client
 */
class LogSerializer {
  err: any;
  req: any;
  res: any;

  /* Builds the LogSerializer object
   */
  constructor() {
    this.err = this.getErrorSerializer();
    this.req = this.getRequestSerializer();
    this.res = this.getResponseSerializer();
  }
  /**
   * error serializer for bunyan
   */
  getErrorSerializer() {
    return ((err: any) => {
      if (!(err instanceof Error)) {
        return err;
      }
      let logErrorObj: any;

      if (err instanceof FlclError) {
        if (err.className) logErrorObj.className = (err.className) ? (err.className.toLowerCase()) : '';
        if (err.methodName) logErrorObj.methodName = err.methodName;
        if (err.propertyName) logErrorObj.propertyName = err.propertyName;
        if (err.propertyValue) logErrorObj.propertyValue = err.propertyValue;
      }
      logErrorObj.message = err.message;
      logErrorObj.name = err.name;
      // logErrorObj.code = err.code;
      // logErrorObj.signal = err.signal;
      logErrorObj.stack = VError.fullStack(err);
      return logErrorObj;
    });
  }
  /**
   * request serializer for bunyan
   */
  getRequestSerializer() {
    return ((req: any) => {
      let returnVal: any = null;
      if (!req)
        returnVal = req;
      else if (!req.connection)
        returnVal = { custom: JSON.stringify(req, undefined, 4) };
      else {
        returnVal = {
          method: req.method,
          url: req.url,
          headers: JSON.stringify(req.headers, undefined, 4),
          remoteAddress: req.connection.remoteAddress,
          remotePort: req.connection.remotePort,
          body: JSON.stringify(req.body, undefined, 4),
        };
      }
      return returnVal;
      // Trailers: Skipping for speed. If you need trailers in your app, then uncomment
      //if (Object.keys(trailers).length > 0) {
      //  obj.trailers = req.trailers;
      //}
    });
  }
  /**
   * response serializer for bunyan
   */
  getResponseSerializer() {
    // Serialize an HTTP response.
    return ((res: any) => {
      let returnVal: any = null;
      if (!res)
        returnVal = res;
      else if (!res.statusCode)
        returnVal = { custom: JSON.stringify(res, FlclLogger.replacer, 4) };
      else {
        returnVal = {
          statusCode: res.statusCode,
          header: res._header,
          resData: JSON.stringify(res.resData, FlclLogger.replacer, 4),
        };
      }
      return returnVal;
    });
  }
}

module.exports = LogSerializer;
