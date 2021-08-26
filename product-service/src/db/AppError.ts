class AppError extends Error {
  statusCode: number;
  status: string;
  code: string;
  isOperational: boolean;

  constructor(message: string = "", statusCode: number, code: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "FAIL" : "ERROR";
    this.code = code;

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
