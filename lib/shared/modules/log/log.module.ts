import { Module } from "@nestjs/common";
import { LogService } from "./log.service";
import { LOGGER } from "./log.constants";

/**
 * A module that provides logging functionality using the LogService.
 */
@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: LogService,
    },
  ],
  exports: [LOGGER],
})
export class LogModule {}
