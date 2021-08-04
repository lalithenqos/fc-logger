import { FlclError } from './flclError';
export default class FlclValidationError extends FlclError {
    errorType: string;
    constructor(args: Object | string);
}
