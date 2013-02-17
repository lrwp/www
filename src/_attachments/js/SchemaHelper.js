(function (window, undefined) {

    'use strict';

    $.ajaxSetup({ cache: false });

    // For cross-browser date parsing
    var D= new Date('2011-06-02T09:34:29+02:00');
    if(!D || +D!== 1307000069000){
        Date.fromISO= function(s){
            var day, tz,
            rx=/^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/,
            p= rx.exec(s) || [];
            if(p[1]){
                day= p[1].split(/\D/);
                for(var i= 0, L= day.length; i<L; i++){
                    day[i]= parseInt(day[i], 10) || 0;
                };
                day[1]-= 1;
                day= new Date(Date.UTC.apply(Date, day));
                if(!day.getDate()) return NaN;
                if(p[5]){
                    tz= (parseInt(p[5], 10)*60);
                    if(p[6]) tz+= parseInt(p[6], 10);
                    if(p[4]== '+') tz*= -1;
                    if(tz) day.setUTCMinutes(day.getUTCMinutes()+ tz);
                }
                return day;
            }
            return NaN;
        }
    }
    else{
        Date.fromISO= function(s){
            return new Date(s);
        }
    }

    var SchemaHelper = {

        defaults : {
            select: {
               tpl: '<li><label>{{name}}</label> <select name="{{name}}" {{required}} data-content="{{description}}">{{#enum}}<option>{{.}}</option>{{/enum}}</select></li>',
               render: function($self, instance) {
                    if (instance) {
                        $self.val(instance);
                    }
               }
            },
            text: {
                tpl: '<li><label>{{name}}</label> <input type="text" name="{{name}}" value="{{value}}" {{required}} data-content="{{description}}"/></li>'
            },
            number: {
                tpl: '<li><label>{{name}}</label> <input type="number" name="{{name}}" value="{{value}}" {{required}} data-content="{{description}}"/></li>',
                submit: function($self) {
                    return parseInt($self.val(), 10);
                }
            },
            hidden: {
                tpl: '<li class="hidden"><input type="hidden" name="{{name}}" value="{{value}}" {{required}}/></li>'
            },
            textarea: {
                tpl: '<li><label>{{name}}</label> <textarea name="{{name}}" {{required}} data-content="{{description}}">{{value}}</textarea></li>'
            },
            date: {
                tpl: '<li><label>{{name}}</label> <input type="text" name="{{name}}" value="{{value}}" {{required}} data-content="{{description}}"/></li>', 
                render: function ($self, value) {

                        $self.datetimepicker({
                            dateFormat: $.datepicker.ISO_8601,
                            timeFormat: 'h:mmTT',
                            showButtonPanel: false,
                            stepMinute: 15
                        });
 
                    if (value) {
                       $self.datetimepicker('setDate', Date.fromISO(value));
                    } else if (!$self.val()){
                        $self.datetimepicker('setDate', new Date());
                    }
                },
                submit: function ($self) {
                    var d = $self.datetimepicker('getDate');
                    return d.toISOString();
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
                    name = $this.attr('name'),
                    value;

                // Check if control has needs to run a submit function                
                if (self.options.map[name] && self.options.map[name].submit) {
                    value = self.options.map[name].submit($this);
                    if (value !== undefined && value !== null && value !== '') {
                        obj[name] = value;
                    }
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
                    // update revision on form
                    self.options.$form.find('[name=_rev]').val(response.rev);
                    
                    // attach schema
                    response.schema = obj.schema;

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
                method = instance ? '<i class="icon-pencil"></i> Edit ' : '<i class="icon-plus-sign"></i> Create ';

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
                        description: property.description || null,
                        value: instance && instance[index] ?
                            instance[index]: property['default'] ? property['default'] : null
                    };

                if (property.hasOwnProperty('enum')) {
                    view['enum'] = property['enum'];
                }
                
                // Do we have special options for this proerty?
                if (self.options.map.hasOwnProperty(index)) {
                    $ul.append(Mustache.render(self.options.map[index].tpl, view));
                    if (self.options.map[index].render) {
                        self.options.map[index].render($ul.find('[name='+index+']'), instance ? instance[index]: undefined);
                    }
                } else {
                    $ul.append(Mustache.render(self.defaults.text.tpl, view));
                }
            });

            $ul.appendTo(self.options.$form);
            self.options.$form.parents().fadeIn();
            self.options.$save.fadeIn();
            if (instance) {
                self.options.$delete.fadeIn();
            }

            self.options.$form.find('[data-content]').each(function () {
                var $this = $(this);
                if ($this.attr('data-content')) {
                    $this.popover({
                        title: '<i class="icon-info-sign"></i> Property Description',
                        html: true,
                        trigger: 'hover',
                        placement: ($this[0].nodeName === 'LABEL') ? 'top' : 'right'
                    });
                }
            });
        } 
    };

    window.SchemaHelper = SchemaHelper;
    
}(window));
