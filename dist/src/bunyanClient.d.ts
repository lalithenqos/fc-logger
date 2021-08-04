import * as Bunyan from 'bunyan';
import { ValidObject } from './types';
export declare class BunyanClient {
    name: string;
    type: string;
    period: string;
    count: number;
    threshold: string;
    totalSize: string;
    logger?: Bunyan;
    logFilePath: string;
    streamInfo: ValidObject;
    constructor(logFilePath: string, options: ValidObject);
    createLogger(): Bunyan;
    getStreamObj(identifier: String): ValidObject;
}
