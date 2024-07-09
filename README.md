<h1>
    <img src="https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/kp-logo.png" alt="logo" height="20"/> K-Platform is a framework for the rapid development of modern applications
</h1>

## Embedded platform's modules

- [Explorer](guide/explorer/index.md): analyzes the database schema and dynamically updates the admin-panel UI for CRUD operations, paginated displaying of entity data with their relationships etc., providing flexibility and extensibility with TypeORM integration.
- [XML data-bridge](guide/xml-data-bridge/index.md): automates the data management process, simplifying the tasks of importing and exporting data. Uses specific XML-markup to transfer the state of the database or pinpoint transfer of certain records in tables between different servers.
- [Background processes](guide/process/index.md): module for management of background tasks, providing features like automatic startup, dynamic control, and comprehensive logging. Enabling efficient and reliable handling of recurring tasks through advanced cron-job scheduling and inter-module communication.
- [Media](guide/media/index.md): provides powerful capabilities for working with various types of media files. It supports uploading, thumbnail slicing, automatic creation of optimized copies, as well as storing copies in modern formats such as WEBP. It is able to work with vector images. Stores metadata of files, including extend metadata such as GPS, ICC, EXIF etc.
- [Files](guide/files/index.md): provides easy integration and powerful file management, including uploading, storing in public and private directories. Support storing extended metadata for images, audio and video files.
- [Users](guide/users/index.md): provide scalable functionality for managing system users. Supports password encrypting, user profile management with role-based access control.
- [Authorization](guide/auth/index.md): provides a OAuth 2.0 mechanism for authentication and authorization of users in the system, as well as protection against brute-force attacks.
- [Captcha](guide/captcha/index.md): represents two built-in CAPTCHA-types: Google reCAPTCHA and standard graphical CAPTCHA. You can also extend the module with your own CAPTCHA implementation.
- [Configuration](guide/config/index.md): allows you to effectively manage the application settings using .properties files, supports real-time dynamic configuration change and type safety through automatic generation of TypeScript files. Also supports local and global overrides, which allow you to flexibly adapt the configuration for different environments.

> **Admin-panel** of application is based on Angular,
> please [read more details about here](https://github.com/alexander-kiriliuk/k-platform-client).

## Documentation

Please navigate to [guides folder](guide) for read detailed documentations of application and also visit [codebase documentations website](https://alexander-kiriliuk.github.io/k-platform-core)

## Fast start

todo 


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
