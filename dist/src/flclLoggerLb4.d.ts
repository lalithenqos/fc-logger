import { ValidObject } from './types';
import { FlclMsgController } from './flclMsgHandler';
export declare class FlclLoggerLb4 {
    httpContext: ValidObject;
    private appConfig;
    private options;
    logger: ValidObject;
    requestId?: string;
    rootRequestId?: string;
    forwardedRequestId?: string;
    flclMsgController?: FlclMsgController;
    constructor(httpContext: ValidObject, appConfig: ValidObject, options: ValidObject);
    bindCustomLevelLogs(): void;
    private getCustomLevel;
    setRequestId(requestId: string): void;
    private getRequestId;
    private getrootRequestId;
    private getForwardedRequestId;
    private structurizeArg;
    private cleanObj;
    private _getStringified;
    static replacer(key: any, data: any): any;
    trimLargeText(cleanedObj: ValidObject, trim: boolean, charLimit: number): ValidObject;
    private displayInRootLevel;
    private canStringify;
    private _getStackTrace;
    trace(args: any): void;
    debug(args: any): void;
    info(args: any): void;
    warn(args: any): void;
    error(args: any): void;
    validation(args: any): void;
    critical(args: any): void;
    fatal(args: any): void;
}
