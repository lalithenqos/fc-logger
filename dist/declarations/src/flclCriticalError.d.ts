import { FlclError } from './flclError';
export default class FlclCriticalError extends FlclError {
    errorType: string;
    constructor(args: Object | string);
}
