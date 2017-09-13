(function(win, doc, $) {
    var data = {
        classes : {
            selection_list : 'selection-list',
            selection_list_toggle : 'selection-list-toggle',
            selection_list_toggle_label : 'selection-list-toggle-label',
            selection_list_checkbox : 'selection-list-checkbox',
            selection_list_checkbox_label : 'selection-list-checkbox-label',
            selection_list_selections : 'selection-list-selections',
            selection_list_selection : 'selection-list-selection',
            selection_list_selection_remove : 'selection-list-selection-remove'
        },
        states : {
            ready : '__selection-list--ready',
            active : '__selection-list--active',
            checkbox_focus : '__selection-list-checkbox--focus',
            checkbox_checked : '__selection-list-checkbox--checked',
            selections_active : '__selection-list-selections--active',
            selection_checked : '__selection-list-selection--checked'
        },
        attributes : {
            checkbox_index : 'selection-list-checkbox-index',
            checkbox_label : 'selection-list-checkbox-label',
            selection_label : 'selection-list-selection-label',
            selection_label_prefix : 'selection-list-selection-label-prefix',
            selection_label_suffix : 'selection-list-selection-label-suffix'
        }
    };

    /**
     * Selection List - Javascript function written with jQuery for creating a selection list with checkboxes
     */

    window.setUnifiedSelectionList = function()
    {
        var selection_list = $('.' + data.classes.selection_list).not('.' + data.states.ready);

        if(selection_list.length === 0)
        {
            return;
        }

        //Define the events we need to use so they can be shared by other scripts
        $(document).off('tipi.UnifiedSelectionList.open tipi.unifiedSelectionList.close tipi.unifiedSelectionList.toggle tipi.unifiedSelectionList.toggle tipi.unifiedSelectionList.focus tipi.unifiedSelectionList.blur tipi.unifiedSelectionList.change tipi.selectionList.update tipi.selectionList.init').on({
            'tipi.UnifiedSelectionList.open' : function(event, selection_list)
            {
                openUnifiedSelectionList(selection_list);
            },
            'tipi.unifiedSelectionList.close' : function(event, selection_list)
            {
                closeUnifiedSelectionList(selection_list);
            },
            'tipi.unifiedSelectionList.toggle' : function(event, input)
            {
                toggleUnifiedSelectionListCheckbox(input);
            },
            'tipi.unifiedSelectionList.focus' : function(event, input)
            {
                focusUnifiedSelectionListCheckbox(input);
            },
            'tipi.unifiedSelectionList.blur' : function(event, input)
            {
                blurUnifiedSelectionListCheckbox(input, selection_list);
            },
            'tipi.unifiedSelectionList.change' : function(event, selection_list, input)
            {
                changeUnifiedSelectionListCheckbox(input);
                updateUnifiedSelectionListSelections(input, selection_list);
                countUnifiedSelectionListSelection(selection_list);
            },
            'tipi.selectionList.update' : function(event, selection_list)
            {
                generateSelectionListSelections(selection_list);
            },
            'tipi.selectionList.init' : function(event, selection_list, input)
            {
                generateUnifiedSelectionListCheckboxIndex(selection_list);
                generateSelectionListSelections(selection_list);
                changeUnifiedSelectionListCheckbox(input);
                updateUnifiedSelectionListSelections(input, selection_list);
                countUnifiedSelectionListSelection(selection_list);
            }
        });

        $('body').on({
            click : function(event)
            {
                clickedWithinUnifiedSelectionList(event, selection_list);
            }
        });

        selection_list.each(function() {
            var selection_list = $(this);
            var selection_list_toggle = selection_list.find('.' + data.classes.selection_list_toggle);
            var selection_list_checkbox = selection_list.find('.' + data.classes.selection_list_checkbox);
            var selection_list_label = selection_list.find('label');
            var selection_list_input = selection_list.find('input:checkbox');

            if(selection_list_toggle.length === 0 || selection_list_checkbox.length === 0)
            {
                return;
            }

            selection_list_toggle.on({
                click : function(event) {
                    event.preventDefault();

                    var toggle = $(this);
                    var selection_list = toggle.closest('.' + data.classes.selection_list);

                    if(selection_list.hasClass(data.states.active))
                    {
                        $(document).trigger('tipi.unifiedSelectionList.close', [selection_list]);
                    }
                    else
                    {
                        $(document).trigger('tipi.UnifiedSelectionList.open', [selection_list]);
                    }
                }
            });

            selection_list_checkbox.on({
                click : function(event) {
                    var checkbox = $(this);
                    var input = checkbox.find('input:checkbox');

                    $(document).trigger('tipi.unifiedSelectionList.toggle', [input]);
                }
            });

            selection_list_label.on({
                click : function(event) {
                    event.preventDefault();
                }
            });

            selection_list_input.on({
                click : function(event) {
                    event.stopImmediatePropagation();
                },
                focus : function() {
                    var input = $(this);
                    var selection_list = input.closest('.' + data.classes.selection_list);

                    $(document).trigger('tipi.UnifiedSelectionList.open', [selection_list]);
                    $(document).trigger('tipi.unifiedSelectionList.focus', [input, selection_list]);
                },
                blur : function() {
                    var input = $(this);
                    var selection_list = input.closest('.' + data.classes.selection_list);

                    $(document).trigger('tipi.unifiedSelectionList.blur', [input, selection_list]);
                },
                change : function() {
                    var input = $(this);
                    var selection_list = input.closest('.' + data.classes.selection_list);

                    $(document).trigger('tipi.unifiedSelectionList.change', [selection_list, input]);
                }
            });

            //Define our ready class so we can add styling within the top_bar
            selection_list.addClass(data.states.ready);

            //Init the current selection_list
            $(document).trigger('tipi.selectionList.init', [selection_list, selection_list_input]);
        });

    }

    function openUnifiedSelectionList(selection_list)
    {
        selection_list.addClass(data.states.active);
    }

    function closeUnifiedSelectionList(selection_list)
    {
        selection_list.removeClass(data.states.active);

        var input = selection_list.find('input:checkbox');
        if(input.length === 0)
        {
            return;
        }
    }

    function toggleUnifiedSelectionListCheckbox(input)
    {
        if(input.prop('checked'))
        {
            input.prop('checked', false).blur();
        }
        else
        {
            input.prop('checked', true).focus();
        }

        input.trigger('change');
    }

    function focusUnifiedSelectionListCheckbox(input)
    {
        var checkbox = input.closest('.' + data.classes.selection_list_checkbox);

        if(checkbox.length === 0)
        {
            return;
        }

        checkbox.addClass(data.states.checkbox_focus);
    }

    function blurUnifiedSelectionListCheckbox(input)
    {
        var checkbox = input.closest('.' + data.classes.selection_list_checkbox);

        if(checkbox.length === 0)
        {
            return;
        }

        checkbox.removeClass(data.states.checkbox_focus);
    }

    function changeUnifiedSelectionListCheckbox(input)
    {
        input.each(function() {
            var input = $(this);
            var checkbox = input.closest('.' + data.classes.selection_list_checkbox);

            if(checkbox.length === 0)
            {
                return;
            }

            if(input.prop('disabled'))
            {
                return;
            }

            if(input.prop('checked'))
            {
                checkbox.addClass(data.states.checkbox_checked);
            } else {
                checkbox.removeClass(data.states.checkbox_checked);
            }
        });
    }

    function getSelectionListCheckboxIndex(checkbox, selection_list)
    {
        var index = checkbox.data(data.attributes.checkbox_index);

        //Check if we have an actual index
        if(typeof index == 'undefined')
        {
            generateUnifiedSelectionListCheckboxIndex(selection_list);
            index = checkbox.data(data.attributs.checkbox_index);
        }

        if(isNaN(parseFloat(index)))
        {
            return;
        }

        return index;
    }

    function generateUnifiedSelectionListCheckboxIndex(selection_list)
    {
        selection_list_checkbox = selection_list.find('input:checkbox');

        if(selection_list_checkbox.length === 0)
        {
            return;
        }

        //Generate a index on each checkbox so we can select the correct selection_list_selection item
        selection_list_checkbox.each(function(index) {
            var checkbox = $(this);
            checkbox.data(data.attributes.checkbox_index, index);
        });
    }

    function generateSelectionListSelections(selection_list)
    {
        //Check if we have a selection list selections container and empty it so we can regenerate the items, or generate a empty one
        var selection_list_selections = selection_list.find('.' + data.classes.selection_list_selections);
        if(selection_list_selections.length === 0)
        {
            selection_list.after('<div class="' + data.classes.selection_list_selections + '"></div>');
            selection_list_selections = selection_list.find('.' + data.classes.selection_list_selections);
        }
        else
        {
            selection_list_selections.empty();
        }

        //Generate our selections based on the available input toggles
        var selection_list_checkbox = selection_list.find('.' + data.classes.selection_list_checkbox);
        var input = selection_list.find('input:checkbox');

        if(selection_list_checkbox.length === 0)
        {
            return;
        }

        selection_list_checkbox.each(function(index) {
            var toggle = $(this);

            //Define a label we can use for setting the selections
            var label = toggle.data(data.attributes.checkbox_label);
            if(typeof label === 'undefined')
            {
                label = toggle.find('.' + data.classes.selection_list_checkbox_label).html();
            }

            selection_list_selections.append('<div class="' + data.classes.selection_list_selection + '">' + label + '<span class="' + data.classes.selection_list_selection_remove + '"></span></div>');
        });

        //Bind the click event so we can uncheck the connected checkbox
        var selection_list_selection_remove = selection_list.find('.' + data.classes.selection_list_selection_remove);
        if(selection_list_selection_remove.length === 0)
        {
            return;
        }

        selection_list_selection_remove.on({
            click : function(event)
            {
                event.preventDefault();
                var selection = $(this).closest('.' + data.classes.selection_list_selection);
                var index = selection.index();

                if(input.prop('disabled'))
                {
                    return;
                }

                //Unchecked the connected checkbox
                input.eq(index).prop('checked', false).trigger('change');
            }
        });
    }

    function updateUnifiedSelectionListSelections(input, selection_list)
    {
        input.each(function() {
            var input = $(this);
            var index = getSelectionListCheckboxIndex(input, selection_list);

            if(typeof index === 'undefined')
            {
                return;
            }

            var selection_list_selection = selection_list.find('.' + data.classes.selection_list_selection).eq(index);
            if(selection_list_selection.length === 0)
            {
                return;
            }

            if(input.prop('checked'))
            {
                selection_list_selection.addClass(data.states.selection_checked);
            }
            else
            {
                selection_list_selection.removeClass(data.states.selection_checked);
            }
        });
    }

    function countUnifiedSelectionListSelection(selection_list)
    {
        var toggle_label = selection_list.find('.' + data.classes.selection_list_toggle_label);
        if(toggle_label.length === 0)
        {
           return;
        }

        var label = selection_list.data(data.attributes.selection_label);
        //Check if we have defined a label with a data attribute, or use the label from innerHtml and cache it!
        if(typeof label === 'undefined')
        {
            label = toggle_label.html();
            selection_list.data(data.attributes.selection_label, label);
        }

        var prefix = selection_list.data(data.attributes.selection_label_prefix);
        if(typeof prefix === 'undefined')
        {
            prefix = '';
        }

         var suffix = selection_list.data(data.attributes.selection_label_suffix);
         if(typeof suffix === 'undefined')
         {
             suffix = '';
         }

         var input = selection_list.find('input:checkbox');
         var count = input.filter(':checked').length;

         if(count === 0)
         {
            toggle_label.html(label);

            selection_list.removeClass(data.states.selections_active);
         }
         else
         {
            toggle_label.html(' ' + label + prefix + count + suffix);

            selection_list.addClass(data.states.selections_active);
         }
    }

    function clickedWithinUnifiedSelectionList(event, selection_list)
    {
        var target = event.target;

        if(typeof target === 'undefined')
        {
            return;
        }

        //Convert target to a jquery Selector
        var target = $(target);

        var clicked_within = false;

        //Check if we clicked the selection_list
        if(target.hasClass(data.classes.selection_list)) {
            clicked_within = true;
        }

        //Check if we clicked any selection_list chilc
        if(target.closest('.' + data.classes.selection_list).length > 0)
        {
            clicked_within = true;
        }

        //Don't do anything if we clicked within the selection_list
        if(clicked_within)
        {
            return;
        }

        selection_list.each(function() {
            $(document).trigger('tipi.unifiedSelectionList.close', [$(this)]);
        });
    }

})( window.jQuery(window), window.jQuery(document), window.jQuery);