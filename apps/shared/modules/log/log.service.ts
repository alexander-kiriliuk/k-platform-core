import { Logger } from "@nestjs/common";

export class LogService extends Logger {

  log(message: string) {
    const ctx = this.getCallingContext();
    super.log(`${message}`, ctx.methodName);
  }

  error(message: string, trace?: string) {
    const ctx = this.getCallingContext();
    super.error(`${message}`, trace, `${ctx?.filePath}:${ctx?.lineNumber} > ${ctx?.methodName}`);
  }

  warn(message: string) {
    const ctx = this.getCallingContext();
    super.warn(`${message}`, `${ctx?.filePath}:${ctx?.lineNumber} > ${ctx?.methodName}`);
  }

  verbose(message: string) {
    const ctx = this.getCallingContext();
    super.verbose(`${message}`, `${ctx?.filePath}:${ctx?.lineNumber} > ${ctx?.methodName}`);
  }

  debug(message: string) {
    const ctx = this.getCallingContext();
    super.debug(`${message}`, `${ctx?.filePath}:${ctx?.lineNumber} > ${ctx?.methodName}`);
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
    return null;
  }

}
