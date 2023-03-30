import { Module } from "@nestjs/common";
import { LogService } from "./log.service";
import { LOGGER } from "@shared/modules/logger/log.constants";

@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: LogService,
    },
  ],
  exports: [
    LOGGER,
  ],
})
export class LogModule {
}
