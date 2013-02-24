$(function () {
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
        $attach = $('#attach'),
        $docs = $('#docs'),
        $docsShow = $('#show-docs'),
        userCtx,
        ids = [], parts,
        getIds = function(callback) {
            $.getJSON('/_uuids?count=25', function(response){ 
                ids = response.uuids;
                callback();
            }); 
        },
        docListTpl = '<li role="menuitem"><a data-schema="{{schema}}" class="schema-edit" title="Created {{created}} by {{author}}" id="{{id}}">{{title}}</a></li>',
        updateDocs = function (schema) {
           $.getJSON('_view/all-by-schema?key="'+schema+'"', function (response) {
                var $doclist = $('.doclist[data-schema='+schema+']');
                $doclist.nextAll('li').remove();
                $.each(response.rows, function(i) {
                    response.rows[i].value.id = response.rows[i].id;
                    $doclist.parent().append(Mustache.render(docListTpl, response.rows[i].value));
                });
           }); 
        },
        getCurrentId = function () {
            return $form.find('[name=_id]').val();
        },
        getCurrentRev = function () {
            return $form.find('[name=_rev]').val();
        };

    $form.on('hover', '.label-upload', function () {
        var
            id = getCurrentId(),
            $this = $(this),
            name = $this.attr('data-title');

        $this.attr('data-content', '<img src="'+'/api/'+ id + '/' + name +'"/>');

        if (!$this.attr('data-init')) {
            
            $this.popover({
                html: true,
                trigger: 'hover',
                placement: 'bottom'
            }).popover('show');
            
            $this.attr('data-init', 1);
        }
    });

    var UploadHelper = {
        options: {},
        init: function() {
            var self = UploadHelper;
            if (self.options.value) {
                $.each(self.options.value, function (index) {
                    self.options.input.parent().append('<span class="label label-info label-upload" data-title="'+index+'"> '+index+' <button type="btn" class="close">&times;</button></span>');
                });
                self.options.input.val(JSON.stringify(self.options.value));
            }                
            self.options.input.parent().append('<button type="button" class="uploader btn">Upload</button>');
        }
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
            rank: SchemaHelper.defaults.number,
            key: {
                tpl: '<li class="hidden"><input type="hidden" name="key" value="{{#value}}{{value}}{{/value}}" {{required}}/></li>'
            },
            category: SchemaHelper.defaults.select,
            type: SchemaHelper.defaults.select,
            link: {
                tpl: '<li><label>{{name}}</label> <input name="{{name}}" type="text" placeholder="some-page-name" value="{{value}}" {{required}} data-content="{{description}}"/></li>'
            },
            _attachments: {
                tpl: '<li class="attachment-li"><label>Image</label> <input name="{{name}}" type="hidden"/></li>',
                render: function ($self, value) {
                    UploadHelper.options = {
                        input: $self,
                        value: value 
                    };
                    UploadHelper.init();
                },
                submit: function($self) {
                    return $self.val() ? JSON.parse($self.val()) : null;
                }
            },
            title: {
                tpl: '<li><label>{{name}}</label> <input class="input-xxlarge" type="text" name="{{name}}" value="{{value}}" {{required}} data-content="{{description}}"/></li>'
            },
            content: {
                tpl: '<li class="wysiwyg"><label data-content="{{description}}">{{name}}</label> <textarea name="{{name}}" {{required}}>{{value}}</textarea></li>',
                render: function ($self) {
                    CKEDITOR.replace($self[0]);
                },
                submit: function ($self) {
                    return CKEDITOR.instances[$self.attr('name')].getData();
                }
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
            start: SchemaHelper.defaults.date,
            end: SchemaHelper.defaults.date,
            modified: {
                tpl: SchemaHelper.defaults.hidden.tpl, 
                submit: function ($self) {
                   return (new Date()).toISOString(); 
                }
            }
        }
    };

    $new.click(function () {
        $docs.hide();
        var name = $(this).attr('data-schema');
        SchemaHelper.toForm(schemaList[name], name);
    });

   $form.parent().submit(function () {
        var
            $this = $(this),
            callback = function (response) {
                if (response.error) {
                    alert(response.error +': '+ response.reason);
                } else {
                    updateDocs(response.schema);
                    $save.popover({
                        placement: 'top',
                        html: true,
                        title: '<i class="icon-ok"></i> Saved',
                        content: 'This document has been saved.',
                        trigger: 'manual'
                    });
                 
                    $save.popover('show');

                    setTimeout(function() {
                        $delete.fadeIn();
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
        $docs.hide();
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

    $save.click(function(){
        $form.parent().submit();
    });

    $form.on('click', '.uploader', function () {
        var id = getCurrentId(), rev = getCurrentRev();

        if (getCurrentId()) {
            $attach.attr('action', 'api/' + id);
            $attach.find('[name=_rev]').val(rev);
            $attach.modal();
        } else {
            alert('You must save the document before you may upload.');
        }
    });

    $form.on('click', '.close', function () {
        // get _attachments
        var _att = JSON.parse($form.find('[name=_attachments]').val());
        delete _att[$(this).parent().attr('data-title')];
        $form.find('[name=_attachments]').val(JSON.stringify(_att));
        $(this).parent().popover('hide').remove();
    });


    $attach.submit(function () {
        var $this = $(this), $frame = $(document.createElement('iframe')).attr({ id : 'uploadFrame', name: 'uploadFrame'}).css({ 'display' : 'none' });
        $frame.appendTo(document.body);
        $this.attr({ target : 'uploadFrame'});
        $frame.load(function () {
            var result = JSON.parse($frame.contents().text());
            $frame.remove();
            if (result.error) {
                alert(result.error + ': ' + result.reason);
            } else {
                $attach.modal('hide');
                $('#' + getCurrentId()).click();
            }
        });
    });

    $docsShow.click(function () {
        $form.parent().hide();
        $save.hide();
        $delete.hide();
        $docs.fadeIn();
    });

    $.getJSON('_session', function(response) {
        userCtx = response.userCtx;
        if (userCtx.roles.indexOf('_admin') !== -1 || userCtx.roles.indexOf('lrwp') !== -1) {
            $user.text(userCtx.name);
            $.getJSON('/_show/schema', function(response) {
                schemaList = response.schema;
                $nav.fadeIn();

                // Handle situation when someon clicks 'edit page'
                if (window.location.hash) {
                    $(window.location.hash).click();
                } else {
                    $docs.fadeIn();
                }
            });
       } else {
            $login.modal({
                keyboard: false,
                backdrop: 'static'
            });
       }
    });

});
