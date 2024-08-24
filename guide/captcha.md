# CAPTCHA

The module has two built-in CAPTCHA types: Google reCAPTCHA and standard graphical CAPTCHA.

You can set some configuration parameters for this module using the [captcha.properties](https://alexander-kiriliuk.github.io/k-platform-core/additional-documentation/properties/captcha.properties.html) files, or you can change these attributes in the `/system/config` section at runtime.

If you prefer to use Google reCAPTCHA, set the `captcha.type=google` parameter and also fill in the `captcha.google.public.key`, `captcha.google.secret.key` parameters according to your admin account. If you want to use the standard graphical CAPTCHA set the `captcha.type=default` parameter.

In addition to `GoogleCaptchaService` and `GraphicCaptchaService` you can also extend the module with your own CAPTCHA implementation.
