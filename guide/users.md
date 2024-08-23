# Users

A module for managing system users. Role-based access control is supported.

Go to `/section/users` to create a new user or edit an existing user.

![users-1.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/users-1.png)

![users-2.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/users-2.png)

The `Activated` flag controls user access to the system. In the `Roles` field, you can assign an access role or create custom roles (`UserRoleEntity`), and use them to control access at the entity level (in the entity editor), or programmatically for your targets using the `@ForRoles()` and `RolesGuard` decorator.

You can also use `BasicUserService` to manage users, or you can implement your own by implementing interface `UserService`.
