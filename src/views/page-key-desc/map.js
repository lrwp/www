function(doc) {
    'use strict';

    if (doc.schema === 'page') {
        emit(doc.link,{
            title: doc.title,
            keywords: doc.keywords ? doc.keywords.split(',') : [doc.title],
            description: doc.description
        });
    }

}
