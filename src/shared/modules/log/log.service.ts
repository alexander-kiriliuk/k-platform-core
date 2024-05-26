import { Logger } from "@nestjs/common";
import { ObjectUtils } from "../../utils/object.utils";
import inspect = ObjectUtils.inspect;

/**
 * Log service that extends the built-in Nest Logger.
 */
export class LogService extends Logger {
  log<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.log(this.prepareMessage(message, data), ctx.methodName);
  }

  error(message: string, trace?: string) {
    const ctx = this.getCallingContext();
    super.error(this.prepareMessage(message), trace, this.patchFromCtx(ctx));
  }

  warn<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.warn(this.prepareMessage(message, data), this.patchFromCtx(ctx));
  }

  verbose<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.verbose(this.prepareMessage(message, data), this.patchFromCtx(ctx));
  }

  debug<T = any>(message: string, data: T) {
    const ctx = this.getCallingContext();
    super.debug(this.prepareMessage(message, data), this.patchFromCtx(ctx));
  }

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
