function(doc) {
 
   'use strict';

    if (doc.schema === 'page' && doc.link === 'special') {
        emit(doc.schema, null);
    }

    if (doc.schema === 'event' && doc.category === 'Special Events') {
        emit(doc.start, null);
    }

}
