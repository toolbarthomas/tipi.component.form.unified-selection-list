(function(win, doc, $) {
    var data = {
        classes : {
            selection_list : 'selection-list',
            selection_list_toggle : 'selection-list-toggle',
            selection_list_input_toggle : 'selection-list-input-toggle',
            selection_list_input_label : 'selection-list-input-label',
            selection_list_selections : 'selection-list-selections',
            selection_list_selection : 'selection-list-selection',
            selection_list_selection_remove : 'selection-list-selection-remove'
        },
        states : {
            ready : '__selection-list--ready',
            active : '__selection-list--active',
            input_focus : '__selection-list-input--focus',
            input_checked : '__selection-list-input--checked',
            toggle_checked : '__selection-list-input-toggle--checked',
            selection_checked : '__selection-list-selection--checked'
        },
        attributes : {
            input_index : 'selection-list-input-index',
            input_toggle_label : 'selection-list-input-toggle-label'
        }
    };

    /**
     * Selection List - Javascript function written with jQuery for creating a selection list with checkboxes
     */

    window.setSelectionList = function()
    {
        var selection_list = $('.' + data.classes.selection_list).not('.' + data.states.ready);

        if(selection_list.length === 0)
        {
            return;
        }

        //Define the events we need to use so they can be shared by other scripts
        $(document).on({
            'tipi.selectionList.open' : function(event, selection_list)
            {
                openSelectionList(selection_list);
            },
            'tipi.selectionList.close' : function(event, selection_list)
            {
                closeSelectionList(selection_list);
            },
            'tipi.selectionList.focus' : function(event, checkbox)
            {
                focusSelectionListCheckbox(checkbox);
            },
            'tipi.selectionList.blur' : function(event, checkbox)
            {
                blurSelectionListCheckbox(checkbox, selection_list);
            },
            'tipi.selectionList.change' : function(event, checkbox, selection_list)
            {
                changeSelectionListCheckbox(checkbox, selection_list);
                updateSelectionListSelections(checkbox, selection_list);
            },
            'tipi.selectionList.update' : function(event, selection_list)
            {
                generateSelectionListSelections(selection_list);
            },
            'tipi.selectionList.init' : function(event, selection_list)
            {
                generateSelectionListCheckboxIndex(selection_list);
                generateSelectionListSelections(selection_list);
            }
        });

        $('body').on({
            click : function(event)
            {
                clickedWithinSelectionList(event, selection_list);
            }
        });

        selection_list.each(function() {
            var selection_list = $(this);
            var selection_list_toggle = selection_list.find('.' + data.classes.selection_list_toggle);
            var selection_list_input_toggle = selection_list.find('.' + data.classes.selection_list_input_toggle);
            var selection_list_checkbox = selection_list.find('input:checkbox');

            if(selection_list_toggle.length === 0 || selection_list_input_toggle.length === 0)
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
                        $(document).trigger('tipi.selectionList.close', [selection_list]);
                    }
                    else
                    {
                        $(document).trigger('tipi.selectionList.open', [selection_list]);
                    }
                }
            });

            selection_list_checkbox.on({
                click : function(event) {
                    event.stopImmediatePropagation();
                },
                focus : function() {
                    var checkbox = $(this);
                    var selection_list = checkbox.closest('.' + data.classes.selection_list);

                    $(document).trigger('tipi.selectionList.open', [selection_list]);
                    $(document).trigger('tipi.selectionList.focus', [checkbox, selection_list]);
                },
                blur : function() {
                    var checkbox = $(this);
                    var selection_list = checkbox.closest('.' + data.classes.selection_list);

                    $(document).trigger('tipi.selectionList.blur', [checkbox, selection_list]);
                },
                change : function() {
                    var checkbox = $(this);
                    var selection_list = checkbox.closest('.' + data.classes.selection_list);

                    $(document).trigger('tipi.selectionList.change', [checkbox, selection_list]);
                }
            });

            //Define our ready class so we can add styling within the top_bar
            selection_list.addClass(data.states.ready);

            //Init the current selection_list
            $(document).trigger('tipi.selectionList.init', [selection_list]);
        });

    }

    function openSelectionList(selection_list)
    {
        selection_list.addClass(data.states.active);
    }

    function closeSelectionList(selection_list)
    {
        selection_list.removeClass(data.states.active);

        var checkbox = selection_list.find('input:checkbox');
        if(checkbox.length === 0)
        {
            return;
        }
    }

    function focusSelectionListCheckbox(checkbox)
    {
        var input_toggle = checkbox.closest('.' + data.classes.selection_list_input_toggle);

        if(input_toggle.length === 0)
        {
            return;
        }

        input_toggle.addClass(data.states.input_focus);
    }

    function blurSelectionListCheckbox(checkbox)
    {
        var input_toggle = checkbox.closest('.' + data.classes.selection_list_input_toggle);

        if(input_toggle.length === 0)
        {
            return;
        }

        input_toggle.removeClass(data.states.input_focus);
    }

    function changeSelectionListCheckbox(checkbox)
    {
        var input_toggle = checkbox.closest('.' + data.classes.selection_list_input_toggle);

        if(input_toggle.length === 0)
        {
            return;
        }

        if(checkbox.prop('checked')) {
            input_toggle.addClass(data.states.toggle_checked);
        } else {
            input_toggle.removeClass(data.states.toggle_checked);
        }
    }

    function getSelectionListCheckboxIndex(checkbox, selection_list)
    {
        var index = checkbox.data(data.attributes.input_index);

        //Check if we have an actual index
        if(typeof index == 'undefined')
        {
            generateSelectionListCheckboxIndex(selection_list);
            index = checkbox.data(data.attributs.input_index);
        }

        if(isNaN(parseFloat(index)))
        {
            return;
        }

        return index;
    }

    function generateSelectionListCheckboxIndex(selection_list)
    {
        selection_list_checkbox = selection_list.find('input:checkbox');

        if(selection_list_checkbox.length === 0)
        {
            return;
        }

        //Generate a index on each checkbox so we can select the correct selection_list_selection item
        selection_list_checkbox.each(function(index) {
            var checkbox = $(this);
            checkbox.data(data.attributes.input_index, index);
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
        var selection_list_input_toggle = selection_list.find('.' + data.classes.selection_list_input_toggle);
        var checkbox = selection_list.find('input:checkbox');

        if(selection_list_input_toggle.length === 0)
        {
            return;
        }

        selection_list_input_toggle.each(function(index) {
            var toggle = $(this);

            //Define a label we can use for setting the selections
            var label = toggle.data(data.attributes.input_toggle_label);
            if(typeof label === 'undefined')
            {
                label = toggle.find('.' + data.classes.selection_list_input_label).html();
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

                //Unchecked the connected checkbox
                checkbox.eq(index).prop('checked', false).trigger('change');
            }
        });
    }

    function updateSelectionListSelections(checkbox, selection_list)
    {
        var index = getSelectionListCheckboxIndex(checkbox, selection_list);

        if(typeof index === 'undefined')
        {
            return;
        }

        var selection_list_selection = selection_list.find('.' + data.classes.selection_list_selection).eq(index);
        if(selection_list_selection.length === 0)
        {
            return;
        }

        if(checkbox.prop('checked'))
        {
            selection_list_selection.addClass(data.states.selection_checked);
        }
        else
        {
            selection_list_selection.removeClass(data.states.selection_checked);
        }
    }

    function clickedWithinSelectionList(event, selection_list)
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
            $(document).trigger('tipi.selectionList.close', [$(this)]);
        });
    }

})( window.jQuery(window), window.jQuery(document), window.jQuery);