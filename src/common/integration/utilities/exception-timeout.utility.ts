export interface ExceptionTimeoutContext {
  exceptionCount: number;
  maxExceptionCount: number;
  timeoutDuration: number;
  lastException: number;
}

export async function withExceptionTimeout<T>(context: ExceptionTimeoutContext, process: () => Promise<T>, defaultValue?: T): Promise<T> {
  if (context.lastException && Date.now() - context.lastException < context.timeoutDuration) {
    return defaultValue;
  }

  try {
    const result = await process();
    context.exceptionCount = 0;
    context.lastException = undefined;

    return result;
  } catch {
    if (++context.exceptionCount >= context.maxExceptionCount) {
      context.lastException = Date.now();
    }

    return defaultValue;
  }
}
