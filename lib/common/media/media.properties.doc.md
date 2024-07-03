### Media Configuration

The `media.properties` configuration file contains settings for managing the directories where public and private media files are stored.

- **media.public.dir**
    - **Description:** The directory where public media files are stored.
    - **Type:** string
    - **Example:** `/static/media`
    - **Note:** This directory is accessible to all users and serves public media content.

- **media.private.dir**
    - **Description:** The directory where private media files are stored.
    - **Type:** string
    - **Example:** `/static/private/media`
    - **Note:** This directory is restricted and serves private media content only accessible to authorized users.
