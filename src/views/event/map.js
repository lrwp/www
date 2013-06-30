function(doc) {
 
   'use strict';

    if (doc.schema && doc.schema === 'event' && !doc.archive) {
        emit(doc.start, null);
    }

}
