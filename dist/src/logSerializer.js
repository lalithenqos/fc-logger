"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let VError = require('verror');
const flclError_1 = require("./flclError");
const flclLogger_1 = require("./flclLogger");
//import { ValidObject } from '../../types';
//import { Serializer, Serializers } from 'bunyan';
/**
 * Custom serializer for Bunyan client
 */
class LogSerializer {
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
        return ((err) => {
            if (!(err instanceof Error)) {
                return err;
            }
            let logErrorObj;
            if (err instanceof flclError_1.FlclError) {
                if (err.className)
                    logErrorObj.className = (err.className) ? (err.className.toLowerCase()) : '';
                if (err.methodName)
                    logErrorObj.methodName = err.methodName;
                if (err.propertyName)
                    logErrorObj.propertyName = err.propertyName;
                if (err.propertyValue)
                    logErrorObj.propertyValue = err.propertyValue;
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
        return ((req) => {
            let returnVal = null;
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
        return ((res) => {
            let returnVal = null;
            if (!res)
                returnVal = res;
            else if (!res.statusCode)
                returnVal = { custom: JSON.stringify(res, flclLogger_1.FlclLogger.replacer, 4) };
            else {
                returnVal = {
                    statusCode: res.statusCode,
                    header: res._header,
                    resData: JSON.stringify(res.resData, flclLogger_1.FlclLogger.replacer, 4),
                };
            }
            return returnVal;
        });
    }
}
module.exports = LogSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nU2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dTZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLDJDQUF3QztBQUN4Qyw2Q0FBMEM7QUFDMUMsNENBQTRDO0FBQzVDLG1EQUFtRDtBQUVuRDs7R0FFRztBQUNILE1BQU0sYUFBYTtJQUtqQjtPQUNHO0lBQ0g7UUFDRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBQ0Q7O09BRUc7SUFDSCxrQkFBa0I7UUFDaEIsT0FBTyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixPQUFPLEdBQUcsQ0FBQzthQUNaO1lBQ0QsSUFBSSxXQUFnQixDQUFDO1lBRXJCLElBQUksR0FBRyxZQUFZLHFCQUFTLEVBQUU7Z0JBQzVCLElBQUksR0FBRyxDQUFDLFNBQVM7b0JBQUUsV0FBVyxDQUFDLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDaEcsSUFBSSxHQUFHLENBQUMsVUFBVTtvQkFBRSxXQUFXLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7Z0JBQzVELElBQUksR0FBRyxDQUFDLFlBQVk7b0JBQUUsV0FBVyxDQUFDLFlBQVksR0FBRyxH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