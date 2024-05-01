/*
 * Copyright 2023 Alexander Kiriliuk
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

export * from "./shared/constants";

// auth module
export * from "./common/auth/auth.constants";
export * from "./common/auth/auth.module";
export * from "./common/auth/auth.types";

// captcha module
export * from "./common/captcha/captcha.constants";
export * from "./common/captcha/captcha.module";
export * from "./common/captcha/captcha.types";
export * from "./common/captcha/google-captcha.service";
export * from "./common/captcha/graphic-captcha.service";

// config module
export * from "./common/config/config.constants";
export * from "./common/config/config.module";
export * from "./common/config/config.service";
export * from "./common/config/config.types";
export * from "./common/config/init";

// explorer module
export * from "./common/explorer/basic-explorer.service";
export * from "./common/explorer/explorer.constants";
export * from "./common/explorer/explorer.module";
export * from "./common/explorer/explorer.types";
export * from "./common/explorer/entity/explorer-action.entity";
export * from "./common/explorer/entity/explorer-column.entity";
export * from "./common/explorer/entity/explorer-column-renderer.entity";
export * from "./common/explorer/entity/explorer-tab.entity";
export * from "./common/explorer/entity/explorer-target.entity";
export * from "./common/explorer/handlers/user-entity-pwd-and-roles.save-handler";

// file module
export * from "./common/file/file.constants";
export * from "./common/file/file.module";
export * from "./common/file/file.service";
export * from "./common/file/file.types";
export * from "./common/file/file-metadata.service";
export * from "./common/file/entity/audio-file-metadata.entity";
export * from "./common/file/entity/exif-file-metadata.entity";
export * from "./common/file/entity/file.entity";
export * from "./common/file/entity/file-metadata.entity";
export * from "./common/file/entity/gps-file-metadata.entity";
export * from "./common/file/entity/icc-file-metadata.entity";
export * from "./common/file/entity/image-file-metadata.entity";
export * from "./common/file/entity/video-file-metadata.entity";

// media module
export * from "./common/media/media.constants";
export * from "./common/media/media.module";
export * from "./common/media/media.service";
export * from "./common/media/media.types";
export * from "./common/media/entity/media.entity";
export * from "./common/media/entity/media-ext.entity";
export * from "./common/media/entity/media-file.entity";
export * from "./common/media/entity/media-format.entity";
export * from "./common/media/entity/media-type.entity";

// process module
export * from "./common/process/abstract-process";
export * from "./common/process/process.constants";
export * from "./common/process/process.module";
export * from "./common/process/process.types";
export * from "./common/process/process-manager.service";
export * from "./common/process/process-register.service";
export * from "./common/process/default/tmp-dir-cleaner.process";
export * from "./common/process/entity/process.unit.entity";
export * from "./common/process/entity/process.log.entity";

// user module
export * from "./common/user/abstract-user-subscriber";
export * from "./common/user/user.constants";
export * from "./common/user/user.module";
export * from "./common/user/user.types";
export * from "./common/user/user-service-basic.service";
export * from "./common/user/entity/user.entity";
export * from "./common/user/entity/user-role.entity";
export * from "./common/user/entity/user.subscriber";

// xml-data-bridge module
export * from "./common/xml-data-bridge/xml-data-bridge.constants";
export * from "./common/xml-data-bridge/xml-data-bridge.middleware";
export * from "./common/xml-data-bridge/xml-data-bridge.module";
export * from "./common/xml-data-bridge/xml-data-bridge.types";
export * from "./common/xml-data-bridge/xml-data-bridge-export.service";
export * from "./common/xml-data-bridge/xml-data-bridge-file-schema";
export * from "./common/xml-data-bridge/xml-data-bridge-import.service";

// cache shared module
export * from "./shared/modules/cache/cache.constants";
export * from "./shared/modules/cache/cache.module";
export * from "./shared/modules/cache/cache.types";
export * from "./shared/modules/cache/redis.module";
export * from "./shared/modules/cache/redis-cache.service";

// category shared module
export * from "./shared/modules/category/category.constants";
export * from "./shared/modules/category/category.module";
export * from "./shared/modules/category/category.service";
export * from "./shared/modules/category/entity/category.entity";

// locale shared module
export * from "./shared/modules/locale/locale.module";
export * from "./shared/modules/locale/locale.service";
export * from "./shared/modules/locale/locale.types";
export * from "./shared/modules/locale/entity/locale-subscriber";
export * from "./shared/modules/locale/entity/language.entity";
export * from "./shared/modules/locale/entity/localized-media.entity";
export * from "./shared/modules/locale/entity/localized-string.entity";

// log shared module
export * from "./shared/modules/log/log.module";
export * from "./shared/modules/log/log.service";
export * from "./shared/modules/log/log.constants";

// messages-broker shared module
export * from "./shared/modules/messages-broker/messages-broker.module";
export * from "./shared/modules/messages-broker/messages-broker.constants";
export * from "./shared/modules/messages-broker/messages-broker.service";
export * from "./shared/modules/messages-broker/messages-broker.types";

// ms-client shared module
export * from "./shared/modules/ms-client/ms-client";
export * from "./shared/modules/ms-client/ms-client.constants";
export * from "./shared/modules/ms-client/ms-client.module";
export * from "./shared/modules/ms-client/ms-client.types";

// pageable shared module
export * from "./shared/modules/pageable/pageable.types";

// warlock shared module
export * from "./shared/modules/warlock/warlock.constants";
export * from "./shared/modules/warlock/warlock.types";
export * from "./shared/modules/warlock/warlock.module";

// decorators
export * from "./shared/decorators/access-token.decorator";
export * from "./shared/decorators/current-user.decorator";
export * from "./shared/decorators/for-roles.decorator";
export * from "./shared/decorators/response-dto.decorator";

// exceptions
export * from "./shared/exceptions/forbidden-ms.exception";
export * from "./shared/exceptions/ms.exception";
export * from "./shared/exceptions/bad-request-ms.exception";
export * from "./shared/exceptions/unauthorized-ms.exception";
export * from "./shared/exceptions/not-found-ms.exception";
export * from "./shared/exceptions/invalid-token-ms.exception";
export * from "./shared/exceptions/too-many-requests-ms.exception";

// filters
export * from "./shared/filters/db-exception-filter";

// interceptors
export * from "./shared/interceptors/dto.interceptor";

// transformers
export * from "./shared/transformers/simple-json.transformer";

// pipes
export * from "./shared/pipes/not-empty.pipe";

// guards
export * from "./shared/guards/auth.guard";
export * from "./shared/guards/roles.guard";
export * from "./shared/guards/abstract-auth.guard";
export * from "./shared/guards/lite-auth.guard";

// utils
export * from "./shared/utils/number.utils";
export * from "./shared/utils/string.utils";
export * from "./shared/utils/common.utils";
export * from "./shared/utils/files.utils";
export * from "./shared/utils/json.utils";
export * from "./shared/utils/env.loader";
export * from "./shared/utils/object.utils";
export * from "./shared/utils/transform.utils";
export * from "./shared/utils/user.utils";
