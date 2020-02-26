import { FlclError } from './flclError';

export default class FlclCriticalError extends FlclError {
    errorType: string;
    constructor(args: Object | string) {
        if(typeof args == 'string')
            args = {message: args};
        
        super(args);
        this.errorType = 'critical';
    }
}