function(doc) {
 
   'use strict';

    // Grab the event page   
    if (doc.schema === 'page' && doc.link === 'events') {
        emit(doc.schema, null);
    }

    if (doc.schema === 'event') {
        emit(doc.start, null);
    }

}
