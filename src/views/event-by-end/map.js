function(doc) {
 
   'use strict';

    if (doc.schema === 'event') {
        emit(doc.end, doc._rev);
    }

}
