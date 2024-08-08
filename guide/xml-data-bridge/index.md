# XML data-bridge

This module allows you to import and export any database data using special XML markup. Also, there is support for exporting/importing a file archive of data including associated static files (e.g. Media entities). The ability to execute SQL queries using XML markup is supported.

A basic XML file with markup looks like this:

    <?xml version="1.0" encoding="UTF-8"?>
    <schema>
        <!-- Place commands here -->
    </schema>

> Using the import form in the [admin-panel](https://github.com/alexander-kiriliuk/k-platform-client) `/system/import-data` section, you don't have to write this wrapper, but paste in the command input field directly.

Next, let's look at the various import commands in detail. 

## InsertUpdate

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

## Remove
todo

## Media
todo

## File
todo

## Include
todo

## Query
todo

