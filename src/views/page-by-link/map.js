 // This is a special view for the homepage
function(doc) {
 
   'use strict';
    
    if (doc.schema === 'page') {
        emit(doc.link, null);
    }

}
