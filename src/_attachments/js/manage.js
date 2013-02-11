$(function (){
    'use strict';
    var
        schemaList = null,
        $new = $('.schema-new'),
        $form = $('#schema-form'),
        $edit = $('.schema-actions'),
        $nav = $('#nav'),
        $login = $('#login'),
        $user = $('#user'),
        $logout = $('#logout'),
        $save = $('#save'),
        $delete = $('#delete'),
        userCtx,
        ids = [],
        getIds = function(callback) {
            $.getJSON('/_uuids?count=25', function(response){ 
                ids = response.uuids;
                callback();
            }); 
        },
        docListTpl = '<li role="menuitem"><a data-schema="{{schema}}" class="schema-edit" title="Created {{created}} by {{author}}" id="{{id}}">{{title}}</a></li>',
        updateDocs = function (schema) {
           $.getJSON('_view/all-by-schema?key="'+schema+'"', function (response) {
                var i, $doclist = $('.doclist[data-schema='+schema+']');
                $doclist.nextAll('li').remove();
                for (i in response.rows) {
                    response.rows[i].value.id = response.rows[i].id;
                    $doclist.parent().append(Mustache.render(docListTpl, response.rows[i].value));
                }
           }); 
        };

    SchemaHelper.options = {
        $form: $form,
        $delete: $delete,
        $save: $save,
        map : {
            _id: {
                tpl: SchemaHelper.defaults.hidden.tpl,
                submit: function ($self) {
                    if (!$self.val()) {
                       $self.val(ids.pop()); 
                    }
                    return $self.val();
                }
            },
            _rev: {
                tpl: SchemaHelper.defaults.hidden.tpl
            },
            _revisions: {
                tpl: null
            },
            content: {
                tpl: SchemaHelper.defaults.textarea.tpl
            },
            schema: {
                tpl: '<li class="hidden"><input type="hidden" name="{{name}}" value="{{schema}}" {{required}}/></li>'
            },
            author: {
                tpl: SchemaHelper.defaults.hidden.tpl,
                render: function ($self) {
                    $self.val(userCtx.name);
                }
            },
            created: SchemaHelper.defaults.date,
            modified: SchemaHelper.defaults.date
        }
    };
    $new.click(function () {
        var name = $(this).attr('data-schema');
        SchemaHelper.toForm(schemaList[name], name);
    });

   $form.parent().submit(function () {
        var
            $this = $(this),
            callback = function (response) {
                if (response.error) {
                    alert('Error ' + response.error +': '+ response.reason);
                } else {
                    updateDocs(response.schema);
                    $save.popover({
                        placement: 'top',
                        title: 'Ok',
                        content: 'Document Saved.',
                        trigger: 'manual'
                    });
                 
                    $save.popover('show');

                    setTimeout(function() {
                        $save.popover('hide');
                    }, 2500);
                }
            };

        // Make sure we have some IDs available
        if (!ids.length) {
            getIds(function() {
                SchemaHelper.toJSON(callback);
            });
            return false;
        }
        SchemaHelper.toJSON(callback);
        return false;
    });

    $logout.click(function (){
        $.ajax({
            url: '_session',
            type: 'DELETE',
            success: function (response) {
                window.location = '/';
            }
        });
    });

    $edit.on('click', '.schema-edit', function () {
        var $this = $(this);
        $.getJSON('/api/' + this.id, function(response){
            SchemaHelper.toForm(schemaList[response.schema], response.schema, response); 
        });
     });

    $delete.click(function () {
        if (confirm('Are you sure you want to delete this item?')) {
            $.ajax({
                url: 'api/' + $form.find('[name=_id]').val() + '?rev=' + $form.find('[name=_rev]').val(),
                type: 'DELETE',
                success: function () {
                    updateDocs($form.find('[name=schema]').val());
                    SchemaHelper.emptyForm();
                },
                error: function(response) {
                    alert('Error ' + response.error +': '+ response.reason);
                }
            });
        }
        return false;
    });

    $.getJSON('_session', function(response) {
        userCtx = response.userCtx;
        if (userCtx.roles.indexOf('_admin') !== -1 || userCtx.roles.indexOf('lrwp') !== -1) {
            $user.text(userCtx.name);
            $.getJSON('/_show/schema', function(response) {
                schemaList = response.schema;
                $nav.fadeIn();
            });
       } else {
            $login.modal({
                keyboard: false,
                backdrop: 'static'
            });
       }
    });

});
