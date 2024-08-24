# Authorization

The module provides OAuth 2.0 mechanism for authentication and authorisation of users in the system, as well as protection against bruteforce attacks.

You can set some configuration parameters for this module using the [auth.properties](https://alexander-kiriliuk.github.io/k-platform-core/additional-documentation/properties/auth.properties.html) and [bruteforce.properties](https://alexander-kiriliuk.github.io/k-platform-core/additional-documentation/properties/bruteforce.properties.html) files, or you can change these attributes in the `/system/config` section in the runtime.

You can use `AuthorisationService` to manage authorisation processes, or implement your own custom service using the `AuthService` interface.