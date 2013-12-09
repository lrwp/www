 // This is a special view for the homepage
function(doc) {
    'use strict';

    var schemas = ['slide', 'species', 'news', 'brief'];

    if (doc.schema && (schemas.indexOf(doc.schema) !== -1) && doc.created && !doc.archive) {

        var obj = {
            title: doc.title,
            schema: doc.schema
        },

        // Each doc type might use a different key
        key = (doc.key) ? doc[doc.key] : doc.created;

        if (doc.schema === 'slide') {
            obj.content = doc.content;
            obj._attachments = doc._attachments;
            obj.link = doc.link;
        }

        if (doc.schema === 'species' && doc.active) {
            obj.common = doc.common;
            obj.content = doc.content;
            obj.type = doc.type;
            obj._attachments = doc._attachments;
            obj.latin = doc.latin;
            obj.active = doc.active;
        }

        emit(key, obj);
    }
}
