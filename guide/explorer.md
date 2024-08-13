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

## Sections and Objects
In the entity editor, click on the arrow next to the entity's name or go to `/section/ProductEntity`:

![section-test-entity.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity.png)

The section will display a list of entity records, click `Create` and create multiple records:

![section-test-entity-create.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity-create.png)

To speed up the creation process, use the `Duplicate' button in the object's user interface to create a copy of an existing record. As a result, the list of this section will look as follows:

![section-test-entity-created.png](https://raw.githubusercontent.com/alexander-kiriliuk/k-platform-core/master/guide/res/section-test-entity-created.png)

// todo describe all section features  

## Objects
todo

### Tabs
todo

## Renderers
todo

### Default renderers
todo
// describe all default renderers

### Custom renderers
todo
// custom renderer example

## Actions
todo

### Default actions
todo

### Custom actions
todo

