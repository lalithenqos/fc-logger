import * as Bunyan from 'bunyan';
import { ValidObject } from './types';
let RotatingFileStream = require('bunyan-rotating-file-stream');
let appRoot = require('app-root-path') + '/';
let LogSerializer = require('./logSerializer');
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;

export class BunyanClient {
  name: string;
  type: string;
  period: string;
  count: number;
  threshold: string;
  totalSize: string;
  logger?: Bunyan;
  logFilePath: string;
  streamInfo: ValidObject;
  constructor(logFilePath: string, options: ValidObject) {
      options = options || {};
      this.name = options.name || 'Flcl-Logger-npm';
      this.type = options.type || 'raw';
      this.period = options.period || '1d';
      this.count =  options.count || 50;
      this.threshold = options.threshold || '10m';
      this.totalSize = options.totalSize || '500m';
      this.logFilePath = logFilePath || appRoot;
      this.streamInfo = {
        target: 'console'
      }
      if(options.streamInfo) {
          if(options.streamInfo.target == 's3') {
              if(options.streamInfo.bucket && options.streamInfo.access_key_id && options.streamInfo.secret_access_key)
                this.streamInfo = options.streamInfo;
          } else if(options.streamInfo.target == 'local')
            this.streamInfo.target = options.streamInfo.target;
      }
  }

  createLogger() {
      if (this.logger) {
          console.log('BunyanClient: CreateLogger -> Returning existing logger object...');
          return this.logger;
      } else {
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
            if(this.streamInfo.target !== 'console') {
                bunyanOptions.streams.push({
                    level: 30,
                    stream: this.getStreamObj('info')
                },
                {
                    level: 50,
                    stream: this.getStreamObj('error')
                },
                {
                    level: 20,
                    stream: this.getStreamObj('debug')
                },
                {
                    level: 40,
                    stream: this.getStreamObj('warn')
                },
                {
                    level: 60,
                    stream: this.getStreamObj('fatal')
                });
            } else {
                console.log('Mainting only one stream, TRACE');
            };
          this.logger = Bunyan.createLogger(bunyanOptions);
          return this.logger;
      }
  }

  getStreamObj(identifier: String) {
      let stream: ValidObject;
      if(this.streamInfo.target == 's3') {
          let streamParams: ValidObject = {
              bucket: this.streamInfo.bucket,
              access_key_id: this.streamInfo.access_key_id,
              secret_access_key: this.streamInfo.secret_access_key,
              name_format: (this.streamInfo.name_format_prefix || `%Y-%m-%d-%H-%M-%S-%L`) + `-${identifier}.log`,
              rotate_every: this.streamInfo.rotate_every || "day",
              upload_every: this.streamInfo.upload_every || 20*1000 //20 seconds
          };
          stream = new S3StreamLogger(streamParams);
          stream.on('error', function(err:Error|null){
            console.log('BUNYANCLIENT - S3 logger - Failure', err);
        });
      } else if(this.streamInfo.target == 'local') {
          let streamParams: ValidObject = {
              path: this.logFilePath + `${identifier}.log`,
              period: this.period,
              totalFiles: this.count,
              rotateExisting: true,
              threshold: this.threshold,
              totalSize: this.totalSize,
              gzip: false,
              shared: true,
          }
          stream = new RotatingFileStream(streamParams);
      } else {
            if(identifier == 'trace' || identifier == 'info' || identifier == 'debug')
                stream = process.stdout;
            else
                stream = process.stderr;
      }
    return stream;
  }
}
