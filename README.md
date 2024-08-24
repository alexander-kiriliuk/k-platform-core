<h1>
    <img src="https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/kp-logo.png" alt="logo" height="20"/> K-Platform is a framework for the rapid development of modern applications
</h1>

## Embedded platform's modules

- [Explorer](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/explorer.md): analyzes the database schema and dynamically updates the admin-panel UI for CRUD operations, paginated displaying of entity data with their relationships etc., providing flexibility and extensibility with TypeORM integration.
- [XML data-bridge](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/xml-data-bridge.md): automates the data management process, simplifying the tasks of importing and exporting data. Uses specific XML-markup to transfer the state of the database or pinpoint transfer of certain records in tables between different servers.
- [Background processes](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/process.md): module for management of background tasks, providing features like automatic startup, dynamic control, and comprehensive logging. Enabling efficient and reliable handling of recurring tasks through advanced cron-job scheduling and inter-module communication.
- [Media](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/media.md): provides powerful capabilities for working with various types of media files. It supports uploading, thumbnail slicing, automatic creation of optimized copies, as well as storing copies in modern formats such as WEBP. It is able to work with vector images. Stores metadata of files, including extend metadata such as GPS, ICC, EXIF etc.
- [Files](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/files.md): provides easy integration and powerful file management, including uploading, storing in public and private directories. Support storing extended metadata for images, audio and video files.
- [Users](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/users.md): provide scalable functionality for managing system users. Supports password encrypting, user profile management with role-based access control.
- [Authorization](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/auth.md): provides a OAuth 2.0 mechanism for authentication and authorization of users in the system, as well as protection against brute-force attacks.
- [CAPTCHA](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/captcha.md): represents two built-in CAPTCHA-types: Google reCAPTCHA and standard graphical CAPTCHA. You can also extend the module with your own CAPTCHA implementation.
- [Configuration](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/config.md): allows you to effectively manage the application settings using .properties files, supports real-time dynamic configuration change and type safety through automatic generation of TypeScript files. Also supports local and global overrides, which allow you to flexibly adapt the configuration for different environments.

> **Admin-panel** of application is based on Angular,
> please [read more details about here](https://github.com/alexander-kiriliuk/k-platform-client).

## Documentation

Please navigate to [guides folder](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide) for read detailed documentations of application and also visit [codebase documentations website](https://alexander-kiriliuk.github.io/k-platform-core)

## Fast start

Before installing the platform, make sure that you have Node.js, Redis installed and one of the supported DBMS.

Now let's set up the configuration.

The connection settings to Redis are stored in the `default.env`, that file located in the root directory, use the properties `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_USER`, `REDIS_PASSWORD`. You can change it or create a `local.env` file to override some properties on your local machine.

Next, go to the `./examples/web-server` directory, here you will find the `db.properties` file. Inside that, you will find the DBMS connection settings, you can change it or create a `local.properties` file to override some properties on your local machine (the names of all properties in the file match the [TypeORM data source options](https://typeorm.io/data-source-options)).

Now that all the preinstallation recommendations are done, you can install the platform.
- Run `npm i` command for install all dependencies
- Run `npm run init:web-app` for generate configuration files, build sources and fill cache DB, and import default state of DB from default XML-configuration
- Run  `npm run start:web-app` for start example web-application server

Now you can proceed to the installation of the client application, which is an admin panel for system management. To do this, visit the repository [@k-platform/client](https://github.com/alexander-kiriliuk/k-platform-client).

> Recommendation: use Postgres or MySQL as a DBMS, and in the future you can replace Radius with the desired to if necessary by writing your own custom interaction service.

> Note: all modules has been tested only with Postgres and MySQL database systems.

### Based on

<a target="_blank" href="https://nestjs.com" rel="nofollow">
    <img height="30" title="NestJs" src="https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/nestjs-logo.svg"/>
</a>
&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="https://typeorm.io" rel="nofollow">
    <img height="30" title="TypeORM" src="https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/typeorm-logo.png"/>
</a>
&nbsp; &nbsp; &nbsp; &nbsp;
<a target="_blank" href="https://redis.io" rel="nofollow">
    <img height="30" title="Redis" src="https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/redis-logo.svg"/>
</a>
