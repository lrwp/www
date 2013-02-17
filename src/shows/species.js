function(doc, req) {

    return {
        headers: {'Content-Type' : 'text/html'},
        body: doc.content
    };
}
