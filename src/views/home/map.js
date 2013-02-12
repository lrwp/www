function(doc) {
    // This is a special view for the homepage
    'use strict';

    // We don't care about schemaless documents or pages
    if (doc.schema && doc.schema !== 'page' && doc.created) {

        var obj = {
            title: doc.title,
            schema: doc.schema
        };

        if (doc.schema === 'event') {
            obj.start = doc.start;
            obj.end = doc.end;
            obj.content = doc.content;
            obj.location = doc.location;
            obj.custom = doc.custom;
            obj.format = doc.format;
        }
        
        if (doc.schema === 'slide') {
            obj.content = doc.content;
        }

        emit(doc.created, obj);
    }
}
