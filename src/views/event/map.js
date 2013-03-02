function(doc) {
 
   'use strict';

    if (doc.schema === 'event') {
        emit(doc.start, null);
    }

}
