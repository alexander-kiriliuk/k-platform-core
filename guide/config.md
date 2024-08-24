# Configuration 

The module allows you to effectively manage application settings using `.properties` files, as well as allows you to change the configuration in real time. For the convenience of developers there is a possibility to perform local and global overrides of configuration files, it allows flexible adaptation of configuration to different environments.

Go to the configuration management UI `/system/config`, here you can find, edit or create the required property:

![config.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/config.png)

When you create a `.properties` file, the system generates a `.config.ts` file based on that file during build. For example, for such a file [auth.properties](https://alexander-kiriliuk.github.io/k-platform-core/additional-documentation/properties/auth.properties.html), `auth.config.ts` will be generated:

    export namespace AuthConfig {
        export const JWT_SECRET = "config:auth.jwt.secret";
        export const ACCESS_TOKEN_EXPIRATION = "config:auth.access.token.expiration";
        export const REFRESH_TOKEN_EXPIRATION = "config:auth.refresh.token.expiration";
    }

You can then read such properties programmatically in your application using `CacheService`, for example like this:

    const exp = await this.cacheService.getNumber(AuthConfig.ACCESS_TOKEN_EXPIRATION)

To create and update configuration files, use the `npm run init:config` command. This reads data from `.properties` files, writes it to redis storage (the default), and generates `.config.ts` files.

To override the configuration in the generated file on a particular machine, use `local.properties` files, create them next to the file whose properties you want to override. Such files will overwrite the properties you want and will not be included in the VCS, because they are excluded in the `.gitignore` file.

You can also create a file named `kp.properties` in the root of the project. All properties described in it will override any properties in the whole application. No special `.config.ts` file will be generated for it, as it is intended only for global setting of configuration properties.