// $.SchemaHelper
(function (window, undefined) {

    'use strict';

    var SchemaHelper = {

        defaults : {
            text: {
                tpl: '<li><label>{{name}}</label> <input type="text" name="{{name}}" value="{{value}}" {{required}} /></li>'
            },
            hidden: {
                tpl: '<li class="hidden"><input type="hidden" name="{{name}}" value="{{value}}" {{required}}/></li>'
            },
            textarea: {
                tpl: '<li><label>{{name}}</label> <textarea name="{{name}}" {{required}}>{{value}}</textarea></li>'
            },
            date: {
                tpl: '<li><label>{{name}}</label> <input type="text" name="{{name}}" value="{{value}}" {{required}} /></li>', 
                render: function ($self) {
                    $self.datepicker({
                        dateFormat: 'yy-mm-dd'
                    });
                    if (!$self.val()) {
                        $self.datepicker('setDate', new Date());
                    }
                },
                submit: function($self) {
                    return  new Date($self.val());
                }
            }
        },

        options: undefined,

        emptyForm: function () {
            var self = SchemaHelper;
            // Hide delete button and wipe out form
            self.options.$delete.hide();
            self.options.$save.hide();
            self.options.$form.html('');
       },

        toJSON : function (callback) {
            var self = SchemaHelper, obj = {};

            // Loop through all controls in the form
            self.options.$form.find('[name]').each(function () {
                var
                    $this = $(this),
                    name = $this.attr('name');
                // Check if control has needs to run a submit function                
                if (self.options.map[name] && self.options.map[name].submit) {
                    obj[name] = self.options.map[name].submit($this);
                } else if ($this.val()) {
                    obj[name] = $this.val();
                }

            });

            $.ajax({
                url: '/api/' + obj._id,
                data: JSON.stringify(obj),
                type: 'PUT',
                dataType: 'json',
                success: function (response) {
                    // updae revision
                    self.options.$form.find('[name=_rev]').val(response.rev);
                    callback(response);
                },
                error: function (e) {
                    callback(JSON.parse(e.responseText));
                }
            });
 
        },

        toForm: function(schema, name, instance) {
            var
                self = SchemaHelper,
                $ul = $(document.createElement('ul')),
                method = instance ? 'Create a new ' : 'Edit ';

            self.emptyForm();

            // Create a descriptive legend
            self.options.$form.append($(document.createElement('legend'))
                .html(method + '<span class="schema-name">'+name+'</span>'));

            // Loop through all of the schema's properties
            $.each(schema.properties, function(index) {
                var
                    property = schema.properties[index],
                    view = {
                        name: index,
                        schema: name,
                        required: property.required ? 'required': null,
                        value: instance && instance[index] ?
                            instance[index]: null
                    };

                // Do we have special options for this proerty?
                if (self.options.map.hasOwnProperty(index)) {
                    $ul.append(Mustache.render(self.options.map[index].tpl, view));
                    if (self.options.map[index].render) {
                        self.options.map[index].render($ul.find('[name='+index+']'));
                    }
                } else {
                    $ul.append(Mustache.render(self.defaults.text.tpl, view));
                }
            });

            $ul.appendTo(self.options.$form);
            self.options.$form.parents().show();
            self.options.$save.show();
            if (instance) {
                self.options.$delete.show();
            }
        } 
    };

    window.SchemaHelper = SchemaHelper;
    
}(window));
