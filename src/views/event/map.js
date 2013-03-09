function(doc) {
 
   'use strict';

    if (doc.schema && doc.schema === 'event') {
        emit(doc.start, null);
    }

}
