# Brute force protection configuration

The `bruteforce.properties` configuration file contains settings for protecting against brute force attacks.

- **bruteforce.enabled**
  - Description: Enables or disables brute force protection.
  - Type: boolean
  - Example: `true`

- **bruteforce.max.attempts**
  - Description: Maximum number of login attempts before blocking.
  - Type: number
  - Example: `3`

- **bruteforce.block.duration**
  - Description: Duration for which a user is blocked after exceeding the maximum number of attempts.
  - Type: number
  - Example: `300`
  - Note: The user will be blocked for 5 minutes (300 seconds).
