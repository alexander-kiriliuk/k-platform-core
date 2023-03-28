import { Logger, Module } from "@nestjs/common";
import { LogService } from "./log.service";

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
