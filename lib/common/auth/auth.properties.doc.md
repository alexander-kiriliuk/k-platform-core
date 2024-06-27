# Authorization configuration

The `auth.properties` configuration file contains settings for authentication and authorization using JSON Web Tokens (JWT).

- **auth.jwt.secret**
  - Description: The secret key used to sign the JWT.
  - Type: string
  - Example: `jwt_secret_key`

- **auth.access.token.expiration**
  - Description: The lifetime of the access token.
  - Type: number
  - Example: `600`
- Note: The access token will be valid for 10 minutes (600 seconds).

- **auth.refresh.token.expiration**
  - Description: The lifetime of the update token.
  - Type: number
  - Example: `3600`
- Note: The upgrade token will be valid for 1 hour (600 seconds * 6).