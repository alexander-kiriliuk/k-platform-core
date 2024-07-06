import { Logger } from "@nestjs/common";
import { ObjectUtils } from "../../utils/object.utils";
import inspect = ObjectUtils.inspect;

/**
 * Log service that extends the built-in Nest Logger, providing additional functionality and context.
 */
export class LogService extends Logger {
  /**
   * Logs a message at the log level.
   * @param message - The message to log.
   * @param data - Additional data to log.
   */
  log<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.log(this.prepareMessage(message, data), ctx.methodName);
  }

  /**
   * Logs an error message.
   * @param message - The error message.
   * @param trace - Optional stack trace.
   */
  error(message: string, trace?: string) {
    const ctx = this.getCallingContext();
    super.error(this.prepareMessage(message), trace, this.patchFromCtx(ctx));
  }

  /**
   * Logs a warning message.
   * @param message - The warning message.
   * @param data - Additional data to log.
   */
  warn<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.warn(this.prepareMessage(message, data), this.patchFromCtx(ctx));
  }

  /**
   * Logs a verbose message.
   * @param message - The verbose message.
   * @param data - Additional data to log.
   */
  verbose<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.verbose(this.prepareMessage(message, data), this.patchFromCtx(ctx));
  }

  /**
   * Logs a debug message.
   * @param message - The debug message.
   * @param data - Additional data to log.
   */
  debug<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.debug(this.prepareMessage(message, data), this.patchFromCtx(ctx));
  }

  /**
   * Patches the calling context for display in log messages.
   * @param ctx - The calling context object.
   * @returns A formatted string representing the calling context.
   */
  private patchFromCtx(ctx: {
    filePath: string;
    methodName: string;
    lineNumber: string;
  }) {
    let p = `${ctx?.filePath}:${ctx?.lineNumber} > ${ctx?.methodName}`;
    if (p === "undefined:undefined > undefined") {
      p = "unknown";
    }
    return p;
  }

  /**
   * Prepares the log message by combining the main message with additional data.
   * @param message - The main log message.
   * @param data - Additional data to log.
   * @returns The prepared log message.
   */
  private prepareMessage<T = any>(message: string, data?: T) {
    let m = inspect(message);
    if (
      (m.startsWith(`'`) && m.endsWith(`'`)) ||
      (m.startsWith(`"`) && m.endsWith(`"`))
    ) {
      m = m.substring(1, m.length - 1);
    }
    if (data) {
      m += inspect(data);
    }
    return m;
  }

  /**
   * Retrieves the calling context (file path, method name, line number) from the stack trace.
   * @returns An object containing the file path, method name, and line number.
   */
  private getCallingContext() {
    const stackTrace = new Error().stack;
    if (stackTrace) {
      const lines = stackTrace.split("\n");
      // The calling context is located in the fourth line of the stack trace
      if (lines.length >= 4) {
        const matches = lines[3].match(/at\s+(.+?)\s+\((.+):(\d+):\d+\)/);
        if (matches && matches.length > 3) {
          const filePath = matches[2].split("/").slice(-2).join("/");
          const methodName = matches[1];
          const lineNumber = matches[3];
          return { filePath, methodName, lineNumber };
        }
      }
    }
    return {
      filePath: "Unknown path",
      methodName: "Anonymous context",
      lineNumber: "Unknown line",
    };
  }
}
