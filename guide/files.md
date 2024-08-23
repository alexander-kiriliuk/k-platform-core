# File

This module provides file management. It allows you to upload and store files in public and private directories. It supports storage of advanced metadata for images, audio and video files.

To upload a new file to the system, go to `/section/files` section, click `Create file` button, select the file on your device in the window that appears. If you want the file to be private, deactivate the `Public` flag.

![files.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/files.png)

The `Delete file` button in the file UI is a special action that deletes a file record from the database (`FileEntity`) along with its associated file on the server's hard drive. 
