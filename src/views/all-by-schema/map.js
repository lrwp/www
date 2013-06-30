function(doc) {
    'use strict';

    if (doc.schema && !doc.archive) {
        emit(doc.schema, {
            schema: doc.schema,
            title: doc.title || doc.common,
            created: new Date(doc.created),
            author: doc.author
        });
    }
}
