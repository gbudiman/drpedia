var strains;
var professions;
var skill_cat;

var selected_strain;
var selected_professions;

var generate_strains_select_box = function() {
  var s = $('<select></select>')
            .attr('id', 'strain-selector');

  var header = $('<option>Select Strain</option>');
  s.append(header);

  $.each(strains, function(index, value) {
    var t = $('<option></option>')
              .append(value);
    s.append(t);
  })

  $('#setup-strain').append(s);
  $('#strain-selector').multiselect({
    buttonWidth: '100%',
    onDropdownShow: disable_popover,
    onChange: function(option, checked) {
      selected_strain = option.text();
      recalculate();
    }
  });
};

var generate_professions_select_box = function() {
  var s = $('<select><select>')
            .attr('id', 'profession-selector')
            .attr('multiple', true);

  $.each(professions, function(index, value) {
    var t = $('<option></option>')
              .attr('profession', value);
    t.append(value);
    s.append(t);
  })

  $('div#setup-profession').append(s);
  $('#profession-selector').multiselect({
    buttonWidth: '100%',
    buttonText: function(options, selected) {
      if (options.length == 0) {
        return 'Select Professions';
      } else {
        var labels = [];
        options.each(function() {
          labels.push($(this).text());
        })

        return labels.join(', ');
      }
    },
    onDropdownShow: disable_popover,
    onChange: function(option, checked) {
      var selected_options = $('#profession-selector option:selected');
      if (selected_options.length >= 3) {
        var non_selected_options = $('#profession-selector option').filter(function() {
          return !$(this).is(':selected');
        })

        non_selected_options.each(function() {
          var input = $('input[value="' + $(this).val() + '"]');
          input.prop('faded', true);
          input.parent().addClass('text-muted');
        })
      } else {
        $('#profession-selector option').each(function() {
          var input = $('input[value="' + $(this).val() + '"]');
          input.prop('faded', false);
          input.parent().removeClass('text-muted');
        });
      }

      selected_professions = new Array();
      selected_options.each(function() {
        selected_professions.push($(this).text());
      })

      recalculate();
    }
  })
};

var generate_skill_cat = function() {
  var skills = Object.keys(skill_cat);
  skills.sort();

  var s = $('<ul></ul>')
            .addClass('list-group');

  $.each(skills, function(index, skill_name) {
    // var a = $('<a></a>')
    //           .addClass('clickable-skill')
    //           .attr('href', '#')
    //           .append(skill_name);

    var t = $('<li></li>')
              .addClass('list-group-item faded clickable-skill')
              .attr('skill-name', skill_name)
              .append('<span class="skill-label">' + skill_name + '</span>')
              //.append(a)
              .append('<span class="badge"></span>');

    s.append(t);
  })

  $('div#graphical').append(s);
  $('.graphical-container')
    .css('max-height', '90vh')
    .css('margin-left', '-4px')
    .css('margin-right', '0px');
  recalculate();
  attach_anchor();
};

function attach_anchor() {
  var target_element;
  $('li.clickable-skill').on('click', function() {
    disable_popover();

    target_element = $(this).find('span.skill-label');
    var skill_name = target_element.text();
    var min_cost = parseInt($(this).find('span.badge').text());

    if (target_element.attr('popover-applied') != 'true') {
      target_element
        .attr('popover-applied', true)
        .attr('data-trigger', 'click')
        .attr('data-placement', 'right')
        .attr('data-html', true)
    }
    target_element.attr('data-content', pull_skill_cat_data(skill_name, min_cost));
    target_element.popover('show');
  })
}

function pull_skill_cat_data(skill, min_cost) {
  var data = skill_cat[skill];
  var by_strain = new Object();
  var by_open = new Array();
  var by_profession = new Object();
  var s = '';

  $.each(data, function(class_type, class_data) {
    switch (class_type) {
      case "innate":
        $.each(class_data, function(index, innate_strain) {
          by_strain[innate_strain] = 3;
        }); 
        break;
      case "open":
        by_open.push('Open: ' + class_data);
        break;
      case "innate_preq":
        break;
      default:
        by_profession[class_type] = data[class_type];
    }
  });

  if (Object.keys(by_strain).length > 0) {
    $.each(by_strain, function(strain_name, cost) {
      var class_name = 'skill-not-accessible';
      if (strain_name == selected_strain) {
        class_name = 'text-primary';
      }

      if (cost == min_cost && class_name != 'skill-not-accessible') {
        class_name = 'skill-cheapest';
      }

      var f = '<span class="' + class_name + '">' + strain_name + ': ' + cost + '</span>';
      s += f + '<br />'
    })

    s += '<hr class="thin-divider" />';
  }

  if (by_open.length > 0) {
    s += by_open.join('<br />') + '<hr class="thin-divider" />';
  }

  if (Object.keys(by_profession).length > 0) {
    $.each(by_profession, function(profession_name, pdata) {
      var class_name = 'skill-not-accessible';
      if (selected_professions != undefined && 
          selected_professions.indexOf(profession_name) != -1) {
        class_name = 'text-prumary';
      }

      if (pdata.cost == min_cost && class_name != 'skill-not-accessible') {
        class_name = 'skill-cheapest';
      }

      var f = '<span class="' + class_name + '">' + profession_name + ': ' + pdata.cost + '</span>';
      s += f + '<br />'
    })
  }

  return s;
}

function recalculate() {
  var detect_has_innate = function(data) {
    var strain_index = data.innate.indexOf(selected_strain);
    return strain_index == -1 ? 99 : 3;
  }

  var detect_is_open_skill = function(data) {
    return data.open || 99;
  }

  var detect_is_profession_skill = function(data) {
    var min_cost = 99;
    var is_available = false;

    $.each(selected_professions, function(index, profession) {
      if (data[profession] != undefined) {
        if (data[profession].cost < min_cost) {
          min_cost = data[profession].cost;
        }
        is_available = is_available || true;
      }
    });

    return min_cost;
  }

  var detect_available_skill = function(skill_name, data) {
    var min_cost = 99;
    var is_available = false;
    
    min_cost = Math.min(min_cost, detect_is_profession_skill(data));
    min_cost = Math.min(min_cost, detect_has_innate(data));
    min_cost = Math.min(min_cost, detect_is_open_skill(data));

    var o = $('[skill-name="' + skill_name + '"]');
    if (min_cost != 99) {
      o.removeClass('faded')
      o.find('.badge').text(min_cost)
      o.find('.clickable-skill').removeClass('link-faded');
    } else {
      o.addClass('faded')
      o.find('.badge').text('')
      o.find('.clickable-skill').addClass('link-faded');
    }
  };

  $.each(skill_cat, function(skill_name, skill_data) {
    detect_available_skill(skill_name, skill_data);
  });

  update_availability();
  disable_popover();
}

function update_search_result(value) {
  disable_popover();

  var pattern = new RegExp(value);
  $('#only-available-checkbox').prop('checked', false);
  $('[skill-name]').each(function() {
    var matcher = $(this).attr('skill-name').toLowerCase();

    if (matcher.match(pattern)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  })
}

function update_availability() {
  disable_popover();
  var only_available = $('#only-available-checkbox').prop('checked');

  if (only_available) {
    $('.list-group-item').show();
    $('.list-group-item.faded').hide();
  } else {
    $('.list-group-item.faded').show();

  }
}

function disable_popover() {
  $('.popover').hide();
}

$(function() {
  $.getJSON('/strains.json', function(strains_json_data) { 
    strains = strains_json_data; 
    generate_strains_select_box();
  });
  
  $.getJSON('/professions.json', function(professions_json_data) { 
    professions = professions_json_data; 
    generate_professions_select_box(); 
  });

  $.getJSON('/skill_cat.json', function(skill_cat_json_data) { 
    skill_cat = skill_cat_json_data; 
    generate_skill_cat(); 
  });

  $('#search-input').on('keyup', function(e) {
    var query = $(this).val().trim().toLowerCase();

    if (query.length == 0) {
      update_search_result(query);
    } else if (e.which == 13) { 
      e.preventDefault(); 
      update_search_result(query);
    }
  });

  $('#only-available-checkbox').on('change', update_availability);
  update_availability();
});

