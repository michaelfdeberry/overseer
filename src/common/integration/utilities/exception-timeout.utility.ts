export interface ExceptionTimeoutContext {
  exceptionCount: number;
  maxExceptionCount: number;
  timeoutDuration: number;
  lastException: number;
}

export async function withExceptionTimeout<T>(context: ExceptionTimeoutContext, process: () => Promise<T>, defaultValue?: T): Promise<T> {
  if (context.lastException && Date.now() - this.lastException < this.timeoutDuration) {
    return defaultValue;
  }

  try {
    const result = process();
    context.exceptionCount = 0;
    context.lastException = undefined;

    return result;
  } catch {
    if (++context.exceptionCount >= context.maxExceptionCount) {
      this.lastException = Date.now();
    }

    return defaultValue;
  }
}
