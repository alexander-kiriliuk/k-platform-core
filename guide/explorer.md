# Explorer

## General
This module automates the data management of DB entities by automatically generating user interfaces for their administration. It analyses the structure of database entities and creates metadata for data display, link lookup, page navigation and filtering. The module also provides advanced rendering settings and a flexible API for complete customisation of interface components.

Next, we will look at the explorer module on a small example in order to get a clear idea of its capabilities.

Let's create a simple object and connect it to ORM:

    @Entity("test_product")
    export class ProductEntity {
        @PrimaryGeneratedColumn({ zerofill: true })
        id: number;
        
        @Index({ unique: true })
        @Column("varchar", { nullable: true })
        code: string;
        
        @Column("varchar", { nullable: true })
        name: string;
        
        @Index()
        @Column("decimal", { unsigned: true, precision: 10, scale: 2, default: 0 })
        price: number;
        
        @Index()
        @Column("boolean", { name: "in_stock", default: true })
        inStock: boolean;
    }    

After that, let's go to `/system/entities`, and find it there:

![system-test-entity.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/system-test-entity.png)

In the entity editor, we can observe the structure of the entity:

![system-test-entity-editor.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/system-test-entity-editor.png)

In the entity column editor, we can observe some metadata:

![system-test-entity-column-editor.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/system-test-entity-column-editor.png)

You can read some details about this editor [here](https://github.com/alexander-kiriliuk/k-platform-client/blob/master/guide/entity/entity.md). 

## Sections and Objects
In the entity editor, click on the arrow next to the entity's name or go to `/section/ProductEntity`:

![section-test-entity.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity.png)

The section will display a list of entity records, click `Create` and create multiple records:

![section-test-entity-create.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity-create.png)

To speed up the creation process, use the `Duplicate' button in the object's user interface to create a copy of an existing record. As a result, the list of this section will look as follows:

![section-test-entity-created.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity-created.png)

You can customise the appearance of this section, for example, give names to the columns or change their order. To do this, go to `/system/entities` section, find our `ProductEntity` there. In the entity editor you can fill in the name of the entity in the `Name` field, then go to the editor of each column and change the value in the `Section priority` field, according to the order of the columns in the list. The larger the value is, the more to the left the column will be. Here in the `Name` field you can also set a name for each column. The edited parameters can give this appearance:

![section-test-entity-edited.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity-edited.png)

The data in the list can be filtered and sorted using the icon to the right of the column name:

![section-filter-icon.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-filter-icon.png)

The window with filtering parameters looks like this:

![section-filter.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-filter.png)

Note that the URL string contains the filtering options after setting the sort and filter values for the list columns: `/section/ProductEntity?page=1&filter=::name:%257%25::code:%25pro%25::inStock:true&sort=name&order=ASC`

Before we go any further, let's add another test entity to the project:

    @Entity("test_product_showcases")
    export class ProductShowcaseEntity {
        @PrimaryGeneratedColumn({ zerofill: true })
        id: number;
        
        @Index({ unique: true })
        @Column("varchar", { nullable: true })
        code: string;
        
        @ManyToMany(() => LocalizedStringEntity, { cascade: true })
        @JoinTable()
        name: LocalizedStringEntity[];
    }

Now let's extend our `ProductEntity` by adding `picture` fields to store the product image and a `showcases` field to store the newly created `ProductShowcaseEntity`:

    @Entity("test_product")
    export class ProductEntity {
        @PrimaryGeneratedColumn({ zerofill: true })
        id: number;
        
        @Index({ unique: true })
        @Column("varchar", { nullable: true })
        code: string;
        
        @Column("varchar", { nullable: true })
        name: string;
        
        @Index()
        @Column("decimal", { unsigned: true, precision: 10, scale: 2, default: 0 })
        price: number;
        
        @Index()
        @Column("boolean", { name: "in_stock", default: true })
        inStock: boolean;
        
        @ManyToOne(() => MediaEntity, (t) => t.code)
        picture: MediaEntity;
        
        @ManyToMany(() => ProductShowcaseEntity, { cascade: true })
        @JoinTable()
        showcases: ProductShowcaseEntity[];
    }

Let's go to `/system/entities` section and make sure that `ProductShowcaseEntity` has appeared, as well as open the `ProductEntity` entity editor and make sure that new columns have appeared. Let's go to `/section/ProductEntity` and make sure that the new columns appear. Next, go to `/section/ProductShowcaseEntity` and create some items:

![section-showcase.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-showcase.png)

For convenience and quick access to these two sections, let's expand the main menu, to do this let's use the `/section/categories` section and create the appropriate categories for the tree with the main menu, or just import this XML configuration, in section `/system/import-data`:

    <InsertUpdate target="LocalizedStringEntity">
        <row>
            <lang key="id">en</lang>
            <code>a-menu-products-name-en</code>
            <value>Products</value>
        </row>
        <row>
            <lang key="id">ru</lang>
            <code>a-menu-products-name-ru</code>
            <value>Продукты</value>
        </row>
        <row>
            <lang key="id">en</lang>
            <code>a-menu-products-list-name-en</code>
            <value>Product list</value>
        </row>
        <row>
            <lang key="id">ru</lang>
            <code>a-menu-products-list-name-ru</code>
            <value>Список товаров</value>
        </row>
        <row>
            <lang key="id">en</lang>
            <code>a-menu-products-showcases-name-en</code>
            <value>Product showcases</value>
        </row>
        <row>
            <lang key="id">ru</lang>
            <code>a-menu-products-showcases-name-ru</code>
            <value>Эмблемы товаров</value>
        </row>
    </InsertUpdate>

    <InsertUpdate target="CategoryEntity">
        <row>
            <code>a-menu-products</code>
            <parent key="code">a-menu-root</parent>
            <name key="code">
                <row>a-menu-products-name-ru</row>
                <row>a-menu-products-name-en</row>
            </name>
        </row>
        <row>
            <code>a-menu-products-list</code>
            <url>/section/products</url>
            <parent key="code">a-menu-products</parent>
            <priority>2</priority>
            <name key="code">
                <row>a-menu-products-list-name-ru</row>
                <row>a-menu-products-list-name-en</row>
            </name>
        </row>
        <row>
            <code>a-menu-products-showcases</code>
            <url>/section/products-showcases</url>
            <parent key="code">a-menu-products</parent>
            <priority>3</priority>
            <name key="code">
                <row>a-menu-products-showcases-name-ru</row>
                <row>a-menu-products-showcases-name-en</row>
            </name>
        </row>
    </InsertUpdate>

Let's refresh the page and see that there are new items in the menu:

![section-main-menu.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-main-menu.png)

Let's try to go for example to the link of one of the added items `/section/products` and get the error `Not Found 404`, because this link is different from `/section/ProductEntity`. To make our beautiful link work, we need to go to the `/system/entities` section, find `ProductEntity` there and set value `products` in the `Alias` field and in the `ProductShowcaseEntity` set `products-showcases` respectively. Now the links in the main menu `section/products` and `/section/products-showcases` will work.

## Objects

Let's open any of the created products, for example `/object/products/1`, the UI looks like this:

![object-test.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/object-test.png)

Note that for all fields of the `ProductEntity` entity, the edit elements corresponding to their type are displayed in the form. The idea is that all the entity column data types in the database were analysed at the time of the system metadata synchronisation, and were reduced to more simplified types for use with explorer. By default, the system reduces these types to the default set of types: `string`, `number`, `boolean`, `date`, `reference`, `unknown`. Each type can be seen in the `Data type` field by opening the column editor, in the entity editor in the `/system/entities` list. Each default data type has its own default renderer (which will be discussed next), which visualises the corresponding entity edit form control. We have the option to extend the list of data types by adding our own, as well as to override the default renderer for a particular entity column, or to create our own custom renderer.

### Tabs

The entity UI allows you to split the form into tabs for ease of use. To do this, open the entity editor, create a new tab by pressing the corresponding `+` button:

![object-tab.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/object-tab.png)

Next, assign the tab to multiple fields of the entity:

![object-tab-select.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/object-tab-select.png)

![object-tab-selected.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/object-tab-selected.png)

After saving, go to UI edit entity record `/object/products/1`:

![object-tabs-result-1.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/object-tabs-result-1.png)

![object-tabs-result-2.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/object-tabs-result-2.png)

Note that all fields for which no tab was selected are moved to the `Administration` tab (this is the default tab). If there are hasn't fields without tabs, then the `Administration` tab will disappear. We can also see that the created `General` tab has two columns - this is adjusted in the `Size` field when creating the tab, here we see the parameters as a JSON string, where the parameter "desktop" sets the number of tabs for desktop devices, "tablet" - for tablets, and for smartphones there will always be one column. The `Priority` field here characterises the order of tabs.

## Renderers

`ExplorerColumnRendererEntity` is an entity that stores the settings for rendering a column in a section or object. It can store initial parameters for the renderer, which can be overridden for each column in the entity's column editor. The `ExplorerColumnRendererEntity` has a `type` field - which has the options `object` and `section`, to characterise the type of renderer to apply it to the desired location. Field `code` contains a unique character identifier, components in [admin-panel](https://github.com/alexander-kiriliuk/k-platform-client) are bound to specific front-end components of the application that are responsible for displaying the column data, you can read more about the arrangement of the renderer in the client part of the application [here](https://github.com/alexander-kiriliuk/k-platform-client/blob/master/guide/explorer/explorer-renderer.md).

### Default section renderers

To review all renderers for the default section, let's add another field to our `ProductEntity` with the creation date:

    @Index()
    @CreateDateColumn({ name: "ts_created", type: "timestamp" })
    tsCreated: Date;

Let's fill in all the fields in one of the list entries, now the section of this entity looks like this:

![renderers-section-1.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/renderers-section-1.png) 

Columns `id`, `name`, `price`, `code` have data type `string`, for them the system automatically uses `string-section-renderer` to render data. This renderer does not have any parameters, so the data is displayed in the list in the form in which it is stored in the database.

The `stock status` column has the `boolean` type, for it the system automatically uses `boolean-section-renderer` to display the data. Here, depending on the value of `true` or `false`, the corresponding icons `pi-check` or `pi-times` are displayed in the list. This renderer also has no parameters.

The `showcases` column is of type `reference`, for that the system automatically uses `reference-section-renderer` to display the data. This renderer trying to get the metadata of the entity it is trying to display, in order to understand which field of this entity can be used as a name, for this purpose primary or unique indexes of the entity columns can be used, or to identify such a field by the `Named` flag. For the `LocalisedStringEntity` entity reference fields, special processing logic is used to display the required variant taking into account the selected language in the client application.

> Note that for the `reference` type the filtering looks different than for primitive types, for example. First we are offered to select `target field`, then a list with fields of the entity to which our `reference` field refers appears, after selecting such a field we will search by it. For example, this is how the product search by `showcases` field with the code value `new` will look like: _/section/products?page=1&filter=::showcases:%25new%25%25%7BProductShowcaseEntity.code%7D_ \
Same with fields like `boolean` and `date`, they have their own search UIs implemented for convenience.

The `picture` column also has the `reference` type, but refers to the `MediaEntity` entity. If the user does not explicitly specify a renderer, then the system will use `media-section-renderer`. This renderer has no parameters, it renders an image or a list of images if the entity field has a `ManyToMany` relationship for example.

The `tsCreated` column is of `date` type, for which the system automatically uses `date-section-renderer` to render the data. This renderer outputs the date in a format that can be defined in the parameters. For example, open the `ProductEntity` entity column editor, and in the `Section renderer params` field set the value `{"format": "dd.MM.yyyy"}`. Now we will see in the `/section/products` list that the date display format has changed.

### Default object renderers

Fields `id`, `name`, `price`, `code` have data type `string` and the system automatically uses `string-object-renderer` for them. This means that for these fields the usual form element `input` will be used by default. Let's pay attention to the `id` field, it has the `disabled` attribute unlike the others. The system can set this sign if the field has a key with the type "primary", or data type `unknown`, or the renderer parameter `disabled: true`.
This renderer has a possibility to set the following parameters `StringObjectRendererParams`:
- readonly - indicates if the input field is read-only.
- disabled - indicates if the input field is disabled.
- textarea - indicates if the input should be rendered as a textarea.
- textareaAutoResize - indicates if the textarea should automatically resize.

Field `stock status` is of type `boolean`, for it the system automatically uses `boolean-object-renderer` to display data. The `input` of type `checkbox` is displayed, depending on the value of `true` or `false` its sate changes. This renderer does not have any parameters.

The `showcases` field is of type `reference` and the system automatically uses `reference-object-renderer` to display data for it. The system uses the UI component `ref-input` to display a reference to an entity (or a list if the column has the attribute multiple = true, for example when it has a `ManyToMany` relationship). It allows you to clear or select an entity of the type referenced by the field, a search dialogue box is used in the form of a corresponding `section`, with single or multiple selections. This renderer has no parameters.

The `picture` field also has the `reference` type, but it refers to the `MediaEntity` entity. And if the user does not explicitly set a renderer, then in this case the system will use `media-object-renderer`. This renderer displays the image, gives the option to clear the current image or load a new one from the user's device or select an existing media object in the appropriate section. It has one parameter `mediaType: string`, which defines the type for loading new media via the UI component `media-input` (responsible for media file encoding parameters and thumbnail creation, read more [here](https://github.com/alexander-kiriliuk/k-platform-core/blob/master/guide/media.md)). The default value is "default". You can set any type from the `MediaTypeEntity` section using the value of its `code` field.

The `tsCreated` field is of type `date`, for it the system automatically uses `date-object-renderer` to render the data. This renderer displays the date with a calendar to allow changes to the value of this field. This renderer has an option to set `DateObjectRendererParams` display parameters:
- firstDayOfWeek - The first day of the week (0-6). 
- showCalendar - Indicates if the calendar should be displayed (boolean). 
- showTime - Indicates if the time input should be displayed (boolean). 
- showSeconds - Indicates if the seconds input should be displayed (boolean). 
- readonlyInput - Indicates if the input is read-only (boolean). 
- inline - Indicates if the date picker should be inline (boolean).
- dateFormat - The format in which the date should be displayed (string).

### Custom renderers and virtual columns

Before we look at how virtual columns work, let's add another field to our `ProductEntity` with the discount percentage:
    
    @Index()
    @Column("int", { name: "discount_percent", nullable: true })
    discountPercent: number;

All manually created columns (not generated from an entity field) are virtual columns. You can create a new virtual column using the entity editor and the corresponding `+` button. Let's create a new column `discountInfo`:

![virtual-column.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/virtual-column.png)

It now appears in the list of columns, is highlighted with a specific colour and there is an option to delete it unlike the other columns:

![virtual-column-list.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/virtual-column-list.png)

Let's edit this column, give it a name and set the `Available in object` and `Visible in object` flags:

![virtual-column-edit.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/virtual-column-edit.png)

Let's go to any product for example `/object/products/1`. On the `Administration` tab we can see that the `discountInfo` field has appeared as a simple `input` component:

![virtual-column-object.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/virtual-column-object.png)

But this field does not affect anything, as it is virtual and does not exist in the database entity. But, judging by the name of the field, we can understand that it is necessary for displaying information about the discount, for example, it should display the price of goods with the discount. Let's realise this task. We have previously added the field `discountPercent`, fill it, insert for example the value `25`, the field `price` will contain the value `100.00`, save the product.

Now we need to create a custom renderer. Let's go to `/section/ExplorerColumnRendererEntity`, create a new record with the code `virtual-product-discount-info` and type `object`:

![custom-renderer-1.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/custom-renderer-1.png)

Assign it to our virtual column in the `Object renderer` field:

![custom-renderer-2.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/custom-renderer-2.png)

Now if we go to our product `/object/products/1`, we will see that the `discountInfo` field is gone, and the warning `Renderer with code virtual-product-discount-info is not found` appears in the developer console, which says that the renderer was applied to the entity, but the corresponding component is not found on the client side. To create a client-side renderer, use [this instruction](https://github.com/alexander-kiriliuk/k-platform-client/blob/master/guide/explorer/explorer-custom-renderer.md).

After creating the renderer component for the admin panel, the result will look like this:

![custom-renderer-example.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/custom-renderer-example.png)

You can look at other custom renderers in the example project. For example, for `/section/media` section there is a virtual column `Thumbnail` which displays a preview of the media object in the list.

## Actions

Actions are usually buttons in sections or entity objects that perform some procedures on the entity or in its section. As with entity columns, they have their own renderers in which their logic can be implemented.

### Default actions

Unlike columns for default actions, there are no renderers, the logic and UI components of default actions are inbuilt. We have the ability to disable default actions for any entity, by using the flags in the entity editor:

- Create (default action)
- Delete (default action)
- Save (default action)
- Duplicate (default action)

This may be necessary when we want to customise these processes. For example, you can see how the custom action for creating a media object in the example project is organised.

### Custom actions

To create a custom action, go to `/section/ExplorerActionEntity`, create a new record. Let's create an action that will reset the value fields in `price` and `discountPercent` fields:

![custom-action.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/custom-action.png)

Next, let's go to the entity editor, select the created action in the `Actions` field. Let's go to the product `object/products/1`, we don't see the new action, and in the developer console there is a warning: `Action renderer with code reset-product-price-and-discount is not found`, which says that the action renderer was applied to the entity, but the corresponding component is not found on the client application side. To create an action renderer on the client side, use [this instruction](https://github.com/alexander-kiriliuk/k-platform-client/blob/master/guide/explorer/explorer-custom-action-renderer.md).

After creating the renderer component for the admin panel, the result will look like this:

![custom-action-renderer-created.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/custom-action-renderer-created.png)

Click on the "Reset fields" button that appears, the `price` and `discountPercent` fields will be reset.