 // This is a special view for the homepage
function(doc) {
    'use strict';

    // We don't care about schemaless documents or pages
    if (doc.schema && doc.schema !== 'page' && doc.created) {

        var obj = {
            title: doc.title,
            schema: doc.schema
        },

        // Each doc type might use a different key
        key = (doc.key) ? doc[doc.key] : doc.created;

        if (doc.schema === 'event') {

            // Some events dont get shown on the homepage
            if (doc.category === 'Little River Ramblers' || doc.category === 'Breakfast on the Marsh') {
                return;
            }

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

        emit(key, obj);
    }
}
