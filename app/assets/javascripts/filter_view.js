var init_completed = false;

function get_active_view_filters() {
  var filters = new Array();
  $('#filter-group :selected').each(function() {
    filters.push($(this).attr('value'));
  })

  return filters;
}

function apply_view_filters() {
  var filter_only_available = function() {
    $('#graphical').find('.list-group-item.faded').hide();
  }

  var filter_only_discounted = function() {
    $('#graphical .list-group-item').each(function() {
      var that = $(this);

      if (that.find('.progress-bar-success').length == 0) {
        that.hide();
      }
    })
  }

  var filter_hide_lore = function() {
    var regex = new RegExp(/^Lore/);
    $('#graphical-list .list-group-item')
      .filter(function () {
        return $(this).attr('skill-name').match(regex);
      }).hide();
  }

  var filter_hide_psionics = function() {
    var regex = new RegExp(/^Psi/);
    $('#graphical-list .list-group-item')
      .filter(function() {
        return $(this).attr('skill-name').match(regex);
      }).hide();
  }

  $('.list-group-item').show();
  disable_popover();

  $.each(get_active_view_filters().sort(), function(i, x) {
    switch(x) {
      case 'only_available': filter_only_available(); break;
      case 'only_discounted': filter_only_discounted(); break;
    }
  })

  $.each(get_active_view_filters().sort(), function(i, x) {
    switch(x) {
      case 'hide_lore': filter_hide_lore(); break;
      case 'hide_psionics': filter_hide_psionics(); break;
    }
  })

  if ($('#graphical .list-group-item :visible').length == 0 && init_completed) {
    $('#filter-no-match').show();
  } else {
    $('#filter-no-match').hide();
  }
}

$(function() {
  $('#filter-group').multiselect({
    buttonWidth: '100%',
    buttonText: function(options, select) {
      if (options.length == 0) {
        return 'Filter: None'
      } else {
        return 'Filter: Active'
      }
    },
    onChange: function() { apply_view_filters(); }
  });
})