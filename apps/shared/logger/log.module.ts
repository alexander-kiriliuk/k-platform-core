import { Global, Logger, Module } from "@nestjs/common";
import { LogService } from "./log.service";

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useClass: LogService,
    },
  ],
  exports: [
    Logger,
  ],
})
export class LogModule {
}
