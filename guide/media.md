# Media

This module provides image uploading, thumbnail slicing, automatic creation of optimized copies (using such libraries as pngquant, cjpeg) and saving copies in modern formats such as WEBP. It is possible to configure parameters of copy slicing, quality of image compression in output media containers. Work with vector images is supported. Extended file metadata such as GPS, ICC, EXIF, etc. are stored in the created media containers.

## Media-types

Each media object has a type (`MediaTypeEntity`), which in turn is some configuration set. Let's consider one of the types from the web server example project, let's go to `/object/media-type/responsive`:

![media-type-responsive.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/media-type-responsive.png)

Let's consider the fields of this object:

- `Code` - symbolic identifier of the type
- `Name` - type name
- `Quality` - defines the quality of image compression
- `WEBP` - specifies whether additional copies of the image and its thumbnails should be stored in `webp` format
- `Formats` - defines what thumbnails will be created within the media object (their sizes)
- `Extension` - file extension, characterizes the conversion of the incoming file.
- `Prvate` - the active state of this flag indicates that physical image files will be placed in a private directory on the server (set in the configuration)

The default types are `default` and `vector`. The `vector` type is used if the incoming image file is vector, and the `svg` extension is used for it.

## Media-formats

The format (`MediaFormatEntity`) defines the size of the sliced thumbnails within the media object, as mentioned above - included in the media-type configuration set. Open some format such as `/object/media-format/xs`, here you can see the `Width` and `Height` fields which define the desired width and height of the media thumbnail. The formats coded `thumb` and `original` are the default formats, they do not need to be explicitly specified in the `Formats` list in media-type.

## Example

Let's create a new media object. Let's go to `/section/media` section, click ‘New media’ button, select ‘responsive’ type, in the file selection interface that appears, select some file on the device. The object has been created, the result looks like this:

![media-test.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/media-test.png)

We can see that thumbnails have been created according to the `responsive` type, but sometimes we may need to change the type of existing media object, to do this select a different type in the `Type` field, for example `default`, save the object using the `Save` button and then click the `Recreate thumbs` button and confirm the action:

![media-recreate.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/media-recreate.png)

As a result, we can see that the system has recreated a thumbnail for this media object.

It is also possible to replace the original image file itself. To do this, press the `Update media-file` button, select the file on the device and upload it. As a result you will see that the media file has been replaced and thumbnails have been created for it according to the set `media-type`.

The `Remove object` button in the media object interface is a special action that removes the media object from the database along with the associated files on the server hard drive. 
