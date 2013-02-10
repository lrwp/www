function(doc) {
    'use strict';

    if (doc.schema) {
        emit(doc.schema, {
            schema: doc.schema,
            title: doc.title,
            created: new Date(doc.created),
            author: doc.author
        });
    }
}
