export class ApiError extends Error {
    status: number;
    errors: any[];
    constructor(status: number, message: string, errors: any[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
    static UnauthorizedError() {
        return new ApiError(401, "Пользователь не авторизован!");
    }
    static BadRequest(message: string, errors: any[] = []) {
        return new ApiError(400, message, errors);
    }
    static RuntimeError(message: string, errors: any[] = []) {
        return new ApiError(400, message, errors);
    }
    static UnrealizedError(message?: string) {
        return new ApiError(
            501,
            message || "Данный функционал ещё не реализован!"
        );
    }
}
