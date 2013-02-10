function(doc){
    var schemas = ['brief', 'news', 'slide', 'event', 'page'];  
    if (doc.schema && schemas.indexOf(doc.schema) !== -1) {
        emit(doc.schema, {
            title: doc.title,
            created: new Date(doc.created),
            author: doc.author
        });
    }
}
