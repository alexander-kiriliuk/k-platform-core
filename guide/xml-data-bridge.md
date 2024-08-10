# XML data-bridge

## Import data

This module allows you to import and export any database data using special XML markup. Also, there is support for exporting/importing a file archive of data including associated static files (e.g. Media entities). The ability to execute SQL queries using XML markup is supported.

A basic XML file with markup looks like this:

    <?xml version="1.0" encoding="UTF-8"?>
    <schema>
        <!-- Place commands here -->
    </schema>

> Using the import form in the [admin-panel](https://github.com/alexander-kiriliuk/k-platform-client) `/system/import-data` section, you don't have to write this wrapper, but paste in the command input field directly.

Next, let's look at the various import commands in detail. 

### InsertUpdate

This command creates a new record if it does not exist in the database or updates an existing one. Let's consider a simple example that involves creating a new user:

    <InsertUpdate target="UserEntity">
        <row>
            <login>test</login>
            <password>1234</password>
            <firstName>New</firstName>
            <lastName>User</lastName>
            <active>true</active>
        </row>
    </InsertUpdate>

After importing this markup, a new record will appear in the database, the created user, you can be seen in the admin panel in the `/section/users` section. Please note that during this import the user password will be stored in the database in encrypted form, because in this case the entity `UserEntity` and its subscriber `UserSubscriber` will be involved which is responsible for encrypting. \
In the current example, the `target` attribute of the `InsertUpdate` tag contains the name of the database entity (the name of the class decorated by the `@Entity()` TypeORM decorator), the child node `<row>` informs that a record will be imported (there can be several rows), the entity data is located inside `<row>`, the tag names correspond to the names of the fields of the `UserEntity` class (decorated by the `@Entity()` TypeORM decorator), and the contents of these tags are their values.\
Now let's try to update the user's first and last name:

    <InsertUpdate target="UserEntity">
        <row>
            <login>test</login>
            <firstName>John</firstName>
            <lastName>Ivanov</lastName>
        </row>
    </InsertUpdate>

In this case we have left the `<login>` field as the system identifies the record as existing by primary and unique indexes, and in this case `login` is a primary key field.

Next we will assign roles to the created user, we will use the existing ones by default, `root` and `admin`:

    <InsertUpdate target="UserEntity">
        <row>
            <login>test</login>
            <roles key="code">
                <row>root</row>
                <row>admin</row>
            </roles>
        </row>
    </InsertUpdate>

In this example, the `key` attribute contains the name of the index of the child entity to be linked to, in `UserRoleEntity` this is the `code` field. The `roles` node itself contains the child nodes `row` with values for their codes, because the `roles` field of `UserEntity` is a list, and the `ManyToMany` relationship is used here. Otherwise, if the field were not a list, we wouldn't use `row`, but would just put in the index value.
Now let's add one more role:

    <InsertUpdate target="UserEntity">
        <row>
            <login>test</login>
            <roles key="code" mode="push">
                <row>manager</row>
            </roles>
        </row>
    </InsertUpdate>

Note the `mode="push"` attribute, it indicates that the entry should be added to the existing list of roles. If you remove the `mode` flag in this example, the `roles` value will be overwritten and the user will have only one `manager` role.

Also, it should be noted that the values `true`, `false`, `null` are supported. These values are not recognised as strings in fields with corresponding types.

### Remove

Deleting a record works on the same principle as `InsertUpdate`. In this example, the `target` attribute of the `Remove` tag contains the name of a database entity (the name of a class decorated with the `@Entity()` TypeORM decorator), the child node `<row>` informs that a record will be deleted (there can be several rows), the entity data is inside `<row>`, the tag names correspond to the field names of the `UserEntity` class (decorated with the `@Entity()` TypeORM decorator), and the contents of these tags are their values.

    <Remove target="UserEntity">
        <row>
            <login>test</login>
        </row>
    </Remove>

In this case we use `<login>` field as the system identifies the record by primary and unique indexes, and in this case `login` is a primary key field.

### Media

To import images, the `Media` command is used to create or update an existing `MediaEntity`. The principle of operation is the same as `InsertUpdate`, but there are some differences. Let's consider a simple example:

    <Media>
        <row>
            <code>test-image</code>
            <type>default</type>
            <file>/test-dir/test.png</file>
        </row>
    </Media>

In this example:

- `code` is the unique index of `MediaEntity`. \
- `type` is a reference to a media type (`MediaTypeEntity`), in this case `default` is the specific type code that contains the image encoding and thumbnail creation parameters. Unlike `InsertUpdate`, the `key` parameter is not required here.
- `file` is the path to the image source file relative to the project root.

For detailed information about all media attributes and how they are organised, see the [section media](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/media.md).

### File
To import any files, the `File` command is used to create or update an existing `FileEntity`. The principle of operation is the same as that of `Media`. Let's consider a simple example:

    <File>
        <row>
            <code>test-file</code>
            <file>/test-dir/test.txt</file>
        </row>
    </File>

In this example:

- `code` is the unique index of `FileEntity`. \
- `file` is the path to the image source file relative to the project root.

For details of all the file features and how they are organised, see [file section](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/files.md).
 
### Include

The `Include` command is required to include another xml configuration inside one xml configuration. For example:

    <Include read="/test-dir/test.xml"/>.

This command has only one `read` attribute, which contains the path to the imported configuration relative to the project root. This is useful when you have several large configurations performing different operations, and you need to import them at the same time. As an illustrative example, [initial-data.xml](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/examples/web-server/res/initial-data.xml) creates default data on the system to initialise a web server example project.

### Query

This command is necessary to execute SQL queries directly to the database, bypassing ORM. Let's consider a simple example:

    <Query content="UPDATE users SET first_name='test updated' WHERE login='test'" />

This command has only one `content` attribute, which contains the SQL query.

> A large number of examples of XML configurations can be found in the [simple web server example](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/examples/web-server/res).
 
## Export data

Data export is a helper function that is designed to simplify the creation of configuration files. For example, you can create your test user as in the examples above or export any other user (or any other entity in the system). For example, go to the users section, find your user with the login `test` and click the `Export` button.

![export-dialog.png](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/res/export-dialog.png)

In the window that appears, tick the following fields in the `Exclude fields to export` list: `ID` - because this is a generated primary key, and we won't need it, `New password` - this is a virtual field, `Created date` - this is an automatically filled field, and we won't need it either. Next, click the `Export` button at the top of the dialogue box. You will get approximately this XML markup:

    <?xml version="1.0" encoding="UTF-8"?>
    
    <schema>
    
        <InsertUpdate target="UserEntity">
            <row>
                <login>test</login>
                <email>null</email>
                <phone>null</phone>
                <firstName>test updated</firstName>
                <lastName>User</lastName>
                <active>true</active>
                <avatar>null</avatar>
            </row>
        </InsertUpdate>
    
    </schema>

You can edit that (for example, by removing optional fields) and use it to transfer your data to another server.
In the export dialogue box there is also such a field as `Depth` - here you can set the depth of the entity dependencies search, by default the system will find all dependencies of the entity starting from the root and going to the last one in the hierarchy. The `Export files` flag tells the system to return an archive with all dependencies and associated static files instead of an XML file and then the whole archive can be imported with all its contents. This is useful when exporting entities that have such entities as `MediaEntity` or `FileEntity` as dependencies, then a configuration for importing such entities will be created in the archive and the dependent file will be read from the imported archive. For an illustrative example, you can export a user who has an avatar, and if you unzip the resulting archive, you will see something like:

    <Media>
        <row>
            <code>admin-avatar</code>
            <type>default</type>
            <file>@zip:/5491018796962664.png</file>
        </row>
    </Media>

    <InsertUpdate target="UserEntity">
        <row>
            <login>admin</login>
            <avatar key="code">admin-avatar</avatar>
        </row>
    </InsertUpdate>

Here we see that the user avatar was saved to the archive as a regular file, but in the generated XML, the path to it starts with the prefix `@zip:/` - this indicates that this file will be read from the root of the archive.

