function(doc) {

   'use strict';
 
   if (doc.schema && !doc.archive) {
        if (doc.schema === 'news' || doc.schema === 'brief' || doc.schema === 'newsletter') {
            emit(doc[doc.key], null);
        }
    }
}
