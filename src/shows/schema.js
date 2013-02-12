function(doc, req) {

    var
        body = {
            schema: this.schema
        };

    return {
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(body)
    };
}
