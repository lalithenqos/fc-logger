"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bunyan = __importStar(require("bunyan"));
let RotatingFileStream = require('bunyan-rotating-file-stream');
let appRoot = require('app-root-path') + '/';
let LogSerializer = require('./logSerializer');
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;
class BunyanClient {
    constructor(logFilePath, options) {
        options = options || {};
        this.name = options.name || 'Flcl-Logger-npm';
        this.type = options.type || 'raw';
        this.period = options.period || '1d';
        this.count = options.count || 50;
        this.threshold = options.threshold || '10m';
        this.totalSize = options.totalSize || '500m';
        this.logFilePath = logFilePath || appRoot;
        this.streamInfo = {
            target: 'console'
        };
        if (options.streamInfo) {
            if (options.streamInfo.target == 's3') {
                if (options.streamInfo.bucket && options.streamInfo.access_key_id && options.streamInfo.secret_access_key)
                    this.streamInfo = options.streamInfo;
            }
            else if (options.streamInfo.target == 'local')
                this.streamInfo.target = options.streamInfo.target;
        }
    }
    createLogger() {
        if (this.logger) {
            console.log('BunyanClient: CreateLogger -> Returning existing logger object...');
            return this.logger;
        }
        else {
            console.log('BunyanClient: CreateLogger -> Creating new logger object...');
            let bunyanOptions = {
                name: this.name,
                serializers: {
                    req: new LogSerializer().req,
                    res: new LogSerializer().res,
                    err: new LogSerializer().err,
                },
                streams: [
                    {
                        level: 10,
                        stream: this.getStreamObj('trace')
                    }
                ]
            };
            if (this.streamInfo.target !== 'console') {
                bunyanOptions.streams.push({
                    level: 30,
                    stream: this.getStreamObj('info')
                }, {
                    level: 50,
                    stream: this.getStreamObj('error')
                }, {
                    level: 20,
                    stream: this.getStreamObj('debug')
                }, {
                    level: 40,
                    stream: this.getStreamObj('warn')
                }, {
                    level: 60,
                    stream: this.getStreamObj('fatal')
                });
            }
            else {
                console.log('Mainting only one stream, TRACE');
            }
            ;
            this.logger = Bunyan.createLogger(bunyanOptions);
            return this.logger;
        }
    }
    getStreamObj(identifier) {
        let stream;
        if (this.streamInfo.target == 's3') {
            let streamParams = {
                bucket: this.streamInfo.bucket,
                access_key_id: this.streamInfo.access_key_id,
                secret_access_key: this.streamInfo.secret_access_key,
                name_format: (this.streamInfo.name_format_prefix || `%Y-%m-%d-%H-%M-%S-%L`) + `-${identifier}.log`,
                rotate_every: this.streamInfo.rotate_every || "day",
                upload_every: this.streamInfo.upload_every || 20 * 1000 //20 seconds
            };
            stream = new S3StreamLogger(streamParams);
            stream.on('error', function (err) {
                console.log('BUNYANCLIENT - S3 logger - Failure', err);
            });
        }
        else if (this.streamInfo.target == 'local') {
            let streamParams = {
                path: this.logFilePath + `${identifier}.log`,
                period: this.period,
                totalFiles: this.count,
                rotateExisting: true,
                threshold: this.threshold,
                totalSize: this.totalSize,
                gzip: false,
                shared: true,
            };
            stream = new RotatingFileStream(streamParams);
        }
        else {
            if (identifier == 'trace' || identifier == 'info' || identifier == 'debug')
                stream = process.stdout;
            else
                stream = process.stderr;
        }
        return stream;
    }
}
exports.BunyanClient = BunyanClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVueWFuQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2J1bnlhbkNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFFakMsSUFBSSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUNoRSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzdDLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQy9DLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUUvRCxNQUFhLFlBQVk7SUFVdkIsWUFBWSxXQUFtQixFQUFFLE9BQW9CO1FBQ2pELE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxpQkFBaUIsQ0FBQztRQUM5QyxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssR0FBSSxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksS0FBSyxDQUFDO1FBQzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLElBQUksT0FBTyxDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLEdBQUc7WUFDaEIsTUFBTSxFQUFFLFNBQVM7U0FDbEIsQ0FBQTtRQUNELElBQUcsT0FBTyxDQUFDLFVBQVUsRUFB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