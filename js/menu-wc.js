'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">@k-platform/core documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#additional-pages"'
                            : 'data-bs-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Additional documentation</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="chapter inner">
                                        <a data-type="chapter-link" href="additional-documentation/properties.html" data-context-id="additional">
                                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#additional-page-8f57e17a600e822d85a7841746a5549f05f5b80ec8f4484e94ab417bde3888cba1b4ae9467f1827fa3157aff70ad581bb65453c2bc33da8c0c912c019da707cc"' : 'data-bs-target="#xs-additional-page-8f57e17a600e822d85a7841746a5549f05f5b80ec8f4484e94ab417bde3888cba1b4ae9467f1827fa3157aff70ad581bb65453c2bc33da8c0c912c019da707cc"' }>
                                                <span class="link-name">Properties</span>
                                                <span class="icon ion-ios-arrow-down"></span>
                                            </div>
                                        </a>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="additional-page-8f57e17a600e822d85a7841746a5549f05f5b80ec8f4484e94ab417bde3888cba1b4ae9467f1827fa3157aff70ad581bb65453c2bc33da8c0c912c019da707cc"' : 'id="xs-additional-page-8f57e17a600e822d85a7841746a5549f05f5b80ec8f4484e94ab417bde3888cba1b4ae9467f1827fa3157aff70ad581bb65453c2bc33da8c0c912c019da707cc"' }>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/properties/kp.properties.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">kp.properties</a>
                                            </li>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/properties/auth.properties.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">auth.properties</a>
                                            </li>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/properties/bruteforce.properties.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">bruteforce.properties</a>
                                            </li>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/properties/captcha.properties.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">captcha.properties</a>
                                            </li>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/properties/file.properties.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">file.properties</a>
                                            </li>
                                            <li class="link for-chapter2">
                                                <a href="additional-documentation/properties/media.properties.html" data-type="entity-link" data-context="sub-entity" data-context-id="additional">media.properties</a>
                                            </li>
                                        </ul>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CacheModule.html" data-type="entity-link" >CacheModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CaptchaModule.html" data-type="entity-link" >CaptchaModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CategoryModule.html" data-type="entity-link" >CategoryModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CategoryModule-7c62fd2683bf499864b9a89d683180f9fa462aec94360bbe0fd759cc31b9c7145797037446ee302ba7c9f669c554f243cad8f96bc124e2bdaf9da8d97ab9eed4"' : 'data-bs-target="#xs-injectables-links-module-CategoryModule-7c62fd2683bf499864b9a89d683180f9fa462aec94360bbe0fd759cc31b9c7145797037446ee302ba7c9f669c554f243cad8f96bc124e2bdaf9da8d97ab9eed4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CategoryModule-7c62fd2683bf499864b9a89d683180f9fa462aec94360bbe0fd759cc31b9c7145797037446ee302ba7c9f669c554f243cad8f96bc124e2bdaf9da8d97ab9eed4"' :
                                        'id="xs-injectables-links-module-CategoryModule-7c62fd2683bf499864b9a89d683180f9fa462aec94360bbe0fd759cc31b9c7145797037446ee302ba7c9f669c554f243cad8f96bc124e2bdaf9da8d97ab9eed4"' }>
                                        <li class="link">
                                            <a href="injectables/CategoryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ConfigModule.html" data-type="entity-link" >ConfigModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ConfigModule-e25c2b168d23d45d9578d516742cc573d2c8bbfc1691df43a79242f1966cf11cbbef89c0c92d923be16b723d06979c4fd4488a52ca33efd54e012c42dc2aabb4"' : 'data-bs-target="#xs-injectables-links-module-ConfigModule-e25c2b168d23d45d9578d516742cc573d2c8bbfc1691df43a79242f1966cf11cbbef89c0c92d923be16b723d06979c4fd4488a52ca33efd54e012c42dc2aabb4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ConfigModule-e25c2b168d23d45d9578d516742cc573d2c8bbfc1691df43a79242f1966cf11cbbef89c0c92d923be16b723d06979c4fd4488a52ca33efd54e012c42dc2aabb4"' :
                                        'id="xs-injectables-links-module-ConfigModule-e25c2b168d23d45d9578d516742cc573d2c8bbfc1691df43a79242f1966cf11cbbef89c0c92d923be16b723d06979c4fd4488a52ca33efd54e012c42dc2aabb4"' }>
                                        <li class="link">
                                            <a href="injectables/ConfigService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfigService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExplorerModule.html" data-type="entity-link" >ExplorerModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/FileModule.html" data-type="entity-link" >FileModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/LocaleModule.html" data-type="entity-link" >LocaleModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LocaleModule-79b78294b7acdebe50a184e127fb9f5d7ded7294e9c40f6d55ec35eb3aab1fa18ec596b79c8c9acc59d63472697cc95b94d2f2aeb74dc3f1b6b9a68774a4c508"' : 'data-bs-target="#xs-injectables-links-module-LocaleModule-79b78294b7acdebe50a184e127fb9f5d7ded7294e9c40f6d55ec35eb3aab1fa18ec596b79c8c9acc59d63472697cc95b94d2f2aeb74dc3f1b6b9a68774a4c508"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LocaleModule-79b78294b7acdebe50a184e127fb9f5d7ded7294e9c40f6d55ec35eb3aab1fa18ec596b79c8c9acc59d63472697cc95b94d2f2aeb74dc3f1b6b9a68774a4c508"' :
                                        'id="xs-injectables-links-module-LocaleModule-79b78294b7acdebe50a184e127fb9f5d7ded7294e9c40f6d55ec35eb3aab1fa18ec596b79c8c9acc59d63472697cc95b94d2f2aeb74dc3f1b6b9a68774a4c508"' }>
                                        <li class="link">
                                            <a href="injectables/LocaleService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocaleService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LogModule.html" data-type="entity-link" >LogModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MediaModule.html" data-type="entity-link" >MediaModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MessagesBrokerModule.html" data-type="entity-link" >MessagesBrokerModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MsClientModule.html" data-type="entity-link" >MsClientModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProcessModule.html" data-type="entity-link" >ProcessModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProcessModule-3b7ed2200b198fc55256ce6982cd35d0a424ea0d64c6336b9da22948972fbbe81d29f82f62e9a6ce3b0c32589eca2000827f2d8efe36d066faf5752194335fe2"' : 'data-bs-target="#xs-injectables-links-module-ProcessModule-3b7ed2200b198fc55256ce6982cd35d0a424ea0d64c6336b9da22948972fbbe81d29f82f62e9a6ce3b0c32589eca2000827f2d8efe36d066faf5752194335fe2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProcessModule-3b7ed2200b198fc55256ce6982cd35d0a424ea0d64c6336b9da22948972fbbe81d29f82f62e9a6ce3b0c32589eca2000827f2d8efe36d066faf5752194335fe2"' :
                                        'id="xs-injectables-links-module-ProcessModule-3b7ed2200b198fc55256ce6982cd35d0a424ea0d64c6336b9da22948972fbbe81d29f82f62e9a6ce3b0c32589eca2000827f2d8efe36d066faf5752194335fe2"' }>
                                        <li class="link">
                                            <a href="injectables/ProcessManagerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProcessManagerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProcessRegisterService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProcessRegisterService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RedisModule.html" data-type="entity-link" >RedisModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/WarlockModule.html" data-type="entity-link" >WarlockModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/XmlDataBridgeModule.html" data-type="entity-link" >XmlDataBridgeModule</a>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/AudioFileMetadataEntity.html" data-type="entity-link" >AudioFileMetadataEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/CategoryEntity.html" data-type="entity-link" >CategoryEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/CategoryRestrictionEntity.html" data-type="entity-link" >CategoryRestrictionEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExifFileMetadataEntity.html" data-type="entity-link" >ExifFileMetadataEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExplorerActionEntity.html" data-type="entity-link" >ExplorerActionEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExplorerColumnEntity.html" data-type="entity-link" >ExplorerColumnEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExplorerColumnRendererEntity.html" data-type="entity-link" >ExplorerColumnRendererEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExplorerTabEntity.html" data-type="entity-link" >ExplorerTabEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExplorerTargetEntity.html" data-type="entity-link" >ExplorerTargetEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/FileEntity.html" data-type="entity-link" >FileEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/FileMetadataEntity.html" data-type="entity-link" >FileMetadataEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/GpsFileMetadataEntity.html" data-type="entity-link" >GpsFileMetadataEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/IccFileMetadataEntity.html" data-type="entity-link" >IccFileMetadataEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ImageFileMetadataEntity.html" data-type="entity-link" >ImageFileMetadataEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/LanguageEntity.html" data-type="entity-link" >LanguageEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/LocalizedMediaEntity.html" data-type="entity-link" >LocalizedMediaEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/LocalizedStringEntity.html" data-type="entity-link" >LocalizedStringEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/MediaEntity.html" data-type="entity-link" >MediaEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/MediaExtEntity.html" data-type="entity-link" >MediaExtEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/MediaFileEntity.html" data-type="entity-link" >MediaFileEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/MediaFormatEntity.html" data-type="entity-link" >MediaFormatEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/MediaTypeEntity.html" data-type="entity-link" >MediaTypeEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ProcessLogEntity.html" data-type="entity-link" >ProcessLogEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ProcessUnitEntity.html" data-type="entity-link" >ProcessUnitEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/UserEntity.html" data-type="entity-link" >UserEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/UserRoleEntity.html" data-type="entity-link" >UserRoleEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/VideoFileMetadataEntity.html" data-type="entity-link" >VideoFileMetadataEntity</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AbstractProcess.html" data-type="entity-link" >AbstractProcess</a>
                            </li>
                            <li class="link">
                                <a href="classes/AbstractUserSubscriber.html" data-type="entity-link" >AbstractUserSubscriber</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthService.html" data-type="entity-link" >AuthService</a>
                            </li>
                            <li class="link">
                                <a href="classes/BadRequestMsException.html" data-type="entity-link" >BadRequestMsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/CacheService.html" data-type="entity-link" >CacheService</a>
                            </li>
                            <li class="link">
                                <a href="classes/CaptchaRequest.html" data-type="entity-link" >CaptchaRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/CaptchaService.html" data-type="entity-link" >CaptchaService</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryEntity.html" data-type="entity-link" >CategoryEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/DbExceptionFilter.html" data-type="entity-link" >DbExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExchangeTokenPayload.html" data-type="entity-link" >ExchangeTokenPayload</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExplorerService.html" data-type="entity-link" >ExplorerService</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileEntity.html" data-type="entity-link" >FileEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileManager.html" data-type="entity-link" >FileManager</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileMd.html" data-type="entity-link" >FileMd</a>
                            </li>
                            <li class="link">
                                <a href="classes/ForbiddenMsException.html" data-type="entity-link" >ForbiddenMsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/GoogleCaptchaService.html" data-type="entity-link" >GoogleCaptchaService</a>
                            </li>
                            <li class="link">
                                <a href="classes/GraphicCaptchaService.html" data-type="entity-link" >GraphicCaptchaService</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidTokenMsException.html" data-type="entity-link" >InvalidTokenMsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtDto.html" data-type="entity-link" >JwtDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginPayload.html" data-type="entity-link" >LoginPayload</a>
                            </li>
                            <li class="link">
                                <a href="classes/LogService.html" data-type="entity-link" >LogService</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaDto.html" data-type="entity-link" >MediaDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaEntity.html" data-type="entity-link" >MediaEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaFileDto.html" data-type="entity-link" >MediaFileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaFormatDto.html" data-type="entity-link" >MediaFormatDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaManager.html" data-type="entity-link" >MediaManager</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaTypeDto.html" data-type="entity-link" >MediaTypeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MsClient.html" data-type="entity-link" >MsClient</a>
                            </li>
                            <li class="link">
                                <a href="classes/MsException.html" data-type="entity-link" >MsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotFoundMsException.html" data-type="entity-link" >NotFoundMsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/PageableData.html" data-type="entity-link" >PageableData</a>
                            </li>
                            <li class="link">
                                <a href="classes/PageableParams.html" data-type="entity-link" >PageableParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/Roles.html" data-type="entity-link" >Roles</a>
                            </li>
                            <li class="link">
                                <a href="classes/TmpDirCleanerProcess.html" data-type="entity-link" >TmpDirCleanerProcess</a>
                            </li>
                            <li class="link">
                                <a href="classes/TooManyRequestsMsException.html" data-type="entity-link" >TooManyRequestsMsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnauthorizedMsException.html" data-type="entity-link" >UnauthorizedMsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserEntity.html" data-type="entity-link" >UserEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserRoleDto.html" data-type="entity-link" >UserRoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserService.html" data-type="entity-link" >UserService</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserSubscriber.html" data-type="entity-link" >UserSubscriber</a>
                            </li>
                            <li class="link">
                                <a href="classes/XdbExportService.html" data-type="entity-link" >XdbExportService</a>
                            </li>
                            <li class="link">
                                <a href="classes/XdbImportService.html" data-type="entity-link" >XdbImportService</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthorizationService.html" data-type="entity-link" >AuthorizationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BasicExplorerService.html" data-type="entity-link" >BasicExplorerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BasicUserService.html" data-type="entity-link" >BasicUserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DtoInterceptor.html" data-type="entity-link" >DtoInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileMetadataService.html" data-type="entity-link" >FileMetadataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileService.html" data-type="entity-link" >FileService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LiteAuthGuard.html" data-type="entity-link" >LiteAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocaleSubscriber.html" data-type="entity-link" >LocaleSubscriber</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MediaService.html" data-type="entity-link" >MediaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessagesBrokerService.html" data-type="entity-link" >MessagesBrokerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotEmptyPipe.html" data-type="entity-link" >NotEmptyPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RedisCacheService.html" data-type="entity-link" >RedisCacheService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserEntityPwdAndRolesSaveHandler.html" data-type="entity-link" >UserEntityPwdAndRolesSaveHandler</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/XmlDataBridgeExportService.html" data-type="entity-link" >XmlDataBridgeExportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/XmlDataBridgeImportService.html" data-type="entity-link" >XmlDataBridgeImportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/XmlDataBridgeMiddleware.html" data-type="entity-link" >XmlDataBridgeMiddleware</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AbstractAuthGuard.html" data-type="entity-link" >AbstractAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AudioFileMetadata.html" data-type="entity-link" >AudioFileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigItem.html" data-type="entity-link" >ConfigItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DirectoryStructure.html" data-type="entity-link" >DirectoryStructure</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EntitySaveHandler.html" data-type="entity-link" >EntitySaveHandler</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExifFileMetadata.html" data-type="entity-link" >ExifFileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExplorerAction.html" data-type="entity-link" >ExplorerAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExplorerColumn.html" data-type="entity-link" >ExplorerColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExplorerColumnRenderer.html" data-type="entity-link" >ExplorerColumnRenderer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExplorerTab.html" data-type="entity-link" >ExplorerTab</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExplorerTarget.html" data-type="entity-link" >ExplorerTarget</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/File.html" data-type="entity-link" >File</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FileMetadata.html" data-type="entity-link" >FileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GpsFileMetadata.html" data-type="entity-link" >GpsFileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IccFileMetadata.html" data-type="entity-link" >IccFileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImageFileMetadata.html" data-type="entity-link" >ImageFileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Language.html" data-type="entity-link" >Language</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocalizedMedia.html" data-type="entity-link" >LocalizedMedia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocalizedString.html" data-type="entity-link" >LocalizedString</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Media.html" data-type="entity-link" >Media</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MediaExt.html" data-type="entity-link" >MediaExt</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MediaFile.html" data-type="entity-link" >MediaFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MediaFormat.html" data-type="entity-link" >MediaFormat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MediaType.html" data-type="entity-link" >MediaType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageBus.html" data-type="entity-link" >MessageBus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessagesBroker.html" data-type="entity-link" >MessagesBroker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessLog.html" data-type="entity-link" >ProcessLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessUnit.html" data-type="entity-link" >ProcessUnit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TargetData.html" data-type="entity-link" >TargetData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpsertMediaRequest.html" data-type="entity-link" >UpsertMediaRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRole.html" data-type="entity-link" >UserRole</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserUpdateRequest.html" data-type="entity-link" >UserUpdateRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VideoFileMetadata.html" data-type="entity-link" >VideoFileMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/XdbRequest.html" data-type="entity-link" >XdbRequest</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});