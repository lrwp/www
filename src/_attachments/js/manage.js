$(function (){
    'use strict';
    var
        schemaList = null,
        $new = $('.schema-new'),
        $form = $('#schema-form'),
        $nav = $('#nav'),
        $login = $('#login'),
        $user = $('#user'),
        $logout = $('#logout'),
        userCtx,
        defaults = {
            text: '<li><label>{{name}}</label> <input type="text" name="{{name}}" value="{{value}}" {{required}} /></li>',
            hidden: '<li class="hidden"><input type="hidden" name="{{name}}" value="{{value}}" {{required}}/></li>',
            textarea: '<li><label>{{name}}</label> <textarea name="{{name}}" {{required}}>{{value}}</textarea></li>'
        },
        el = {
            _id: {
                tpl: defaults.hidden
            },
            _rev: {
                tpl: defaults.hidden
            },
            _revisions: {
                tpl: null
            },
            content: {
                tpl: defaults.textarea
            },
            schema: {
                tpl: '<li class="hidden"><input type="hidden" name="{{name}}" value="{{schema}}" {{required}}/></li>'
            },
            author: {
                tpl: '<li class="hidden"><input type="hidden" name="{{name}}" value="{{value}}" {{required}}/></li>',
                render: function ($self) {
                    $self.val(userCtx.name);
                }
            },
            created: {
                tpl: '<li><label>{{name}}</label> <input type="text" class="x-date" name="{{name}}" value="{{value}}" {{required}}/></li>',
                render: function($self) {
                    $self.datepicker();
                    if (!$self.val()) {
                        $self.datepicker('setDate', new Date());
                    }
                }
            }
        },
        schema2form = function (schema) {
            var $ul = $(document.createElement('ul'));
            $form.html('').parents().hide();
            $form.append($(document.createElement('legend')).html('Create a new <span class="schema-name">'+schema+'</span>'));
            $.each(schemaList[schema].properties, function(index) {
                var
                    property = schemaList[schema].properties[index],
                    view = {
                        name: index,
                        schema: schema,
                        required: property.required ? 'required': null
                    };

                if (el.hasOwnProperty(index)) {
                    $ul.append(Mustache.render(el[index].tpl, view));
                    if (el[index].render) {
                        el[index].render($ul.find('[name='+index+']'));
                    }
                } else {
                    $ul.append(Mustache.render(defaults.text, view));
                }
            });

            $ul.appendTo($form);
            $form.parents().show();
        },
        form2json = function ($form) {
            var obj = {};
            $form.find('[name]').each(function() {
                var $this = $(this);

                if (el[$this.attr('name')] && el[$this.attr('name')].submit) {
                    el[$this.attr('name')].submit($this);
                }

                if ($this.val()) {
                    obj[$this.attr('name')] = $this.val();
                }
            });
            return obj;
        };

    $new.click(function () {
        var schema = $(this).attr('data-schema');
        if (!schemaList) {
            $.getJSON('/_show/schema', function(response) {
                schemaList = response.schema;
                schema2form(schema);
            });
            return;
        }
        schema2form(schema);
    });

    $form.parent().submit(function () {
        console.log(form2json($(this)));
        return false;
    });

    $logout.click(function (){
        $.ajax({
            url: '_session',
            type: 'DELETE',
            success: function (response) {
                console.log(response);
                window.location = '/';
            }
        });
    });
    
    $.getJSON('_session', function(response) {
        userCtx = response.userCtx;
        if (userCtx.roles.indexOf('_admin') !== -1 || userCtx.roles.indexOf('lrwp') !== -1) {
            $user.text(userCtx.name);
            $nav.fadeIn();
       } else {
            $login.modal({
                keyboard: false,
                backdrop: 'static'
            });
       }
    });

});
