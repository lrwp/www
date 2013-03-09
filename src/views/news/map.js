function(doc) {
 
   'use strict';

    if (doc.schema && doc.schema === 'news' || doc.schema === 'brief') {
        emit(doc.rank, null);
    }

}
