# CAPTCHA Configuration

The `captcha.properties` configuration file contains settings for CAPTCHA generation and validation.

- **captcha.enabled**
    - **Description:** Boolean flag indicating if CAPTCHA is enabled.
    - **Type:** boolean
    - **Example:** `true`

- **captcha.expiration**
    - **Description:** Expiration time for CAPTCHA entries.
    - **Type:** number
    - **Example:** `300`
    - **Note:** The CAPTCHA will be valid for 5 minutes (300 seconds).

- **captcha.font.path**
    - **Description:** Path to the font file used for graphical CAPTCHA.
    - **Type:** string
    - **Example:** `/lib/common/captcha/montserrat.ttf`

- **captcha.font.family**
    - **Description:** Font family used for graphical CAPTCHA.
    - **Type:** string
    - **Example:** `Montserrat`

- **captcha.type**
    - **Description:** Type of CAPTCHA to be used.
    - **Type:** string
    - **Example:** `default`

- **captcha.google.public.key**
    - **Description:** Public key for Google reCAPTCHA.
    - **Type:** string
    - **Example:** `abc123456`

- **captcha.google.secret.key**
    - **Description:** Secret key for Google reCAPTCHA.
    - **Type:** string
    - **Example:** `abc123456`
