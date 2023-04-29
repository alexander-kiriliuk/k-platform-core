**Example XML import-script:**

    <?xml version="1.0" encoding="UTF-8"?>
    
        <schema>
        
            <InsertUpdate target="LocalizedStringEntity">
                <row>
                    <code>test_media_name_1_ru</code>
                    <lang key="id">ru</lang>
                    <value>Тестовое имя медиа объекта</value>
                </row>
                <row>
                    <code>test_media_name_1_en</code>
                    <lang key="id">en</lang>
                    <value>Test media object name</value>
                </row>
                <row>
                    <code>test_file_name_1_ru</code>
                    <lang key="id">ru</lang>
                    <value>Тестовое имя файла</value>
                </row>
                <row>
                    <code>test_file_name_1_en</code>
                    <lang key="id">en</lang>
                    <value>Test file name</value>
                </row>
            </InsertUpdate>
        
            <File>
                <row>
                    <code>test_file_1</code>
                    <public>true</public>
                    <file>/static/media/98/1159303946584370_original.png</file>
                    <name key="code">
                        <row>test_file_name_1_ru</row>
                        <row>test_file_name_1_en</row>
                    </name>
                </row>
            </File>
        
            <Media>
                <row>
                    <code>test_usr_avatar_3</code>
                    <type>responsive</type>
                    <file>/static/media/98/1159303946584370_original.png</file>
                    <name key="code">
                        <row>test_media_name_1_ru</row>
                        <row>test_media_name_1_en</row>
                    </name>
                </row>
            </Media>
        
            <InsertUpdate target="UserEntity">
                <row>
                    <login>x222xxxadmin777111221</login>
                    <name>adm777</name>
                    <password>1111</password>
                    <avatar key="code">testxxx_ava</avatar>
                    <roles key="code">
                        <row>root</row>
                        <row>admin</row>
                    </roles>
                </row>
            </InsertUpdate>
        
            <Remove target="UserEntity">
                <row>
                    <login>x222xxxadmin77711111</login>
                </row>
                <row>
                    <login>x222xxxadmin777111221</login>
                </row>
            </Remove>
        
        </schema>
