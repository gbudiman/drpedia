var strains;
var professions;
var skill_cat;

var selected_strain;
var selected_professions;

var last_popover_skill = '';

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
    dropRight: true,
    maxHeight: 512,
    onChange: function(option, checked) {
      selected_strain = option.text();
      recalculate();

      if (is_builder) {
        replan();
      }
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

    maxHeight: 512,
    onDropdownShow: disable_popover,
    onChange: function(option, checked) {
      var selected_options = $('#profession-selector option:selected');
      if (selected_options.length >= 3) {
        var non_selected_options = $('#profession-selector option').filter(function() {
          return !$(this).is(':selected');
        })

        non_selected_options.each(function() {
          var input = $('input[value="' + $(this).val() + '"]');
          //input.prop('faded', true);
          input.prop('disabled', true);
          input.parent().addClass('text-muted');
        })
      } else {
        $('#profession-selector option').each(function() {
          var input = $('input[value="' + $(this).val() + '"]');
          //input.prop('faded', false);
          input.prop('disabled', false);
          input.parent().removeClass('text-muted');
        });
      }

      selected_professions = new Array();
      selected_options.each(function() {
        selected_professions.push($(this).text());
      })

      recalculate();

      if (is_builder) {
        replan();
      }
    }
  })
};

var generate_skill_cat = function() {
  var skills = Object.keys(skill_cat);
  skills.sort();

  // var s = $('<ul></ul>')
  //           .addClass('list-group')
  //           .attr('id', 'graphical-list');
  var s = $('#graphical-list');

  var col_classes = 'col-xs-12 col-sm-6 col-md-4 col-lg-3';
  if (is_builder) {
    col_classes = 'col-xs-12 col-lg-6';
  }

  $.each(skills, function(index, skill_name) {
    var t = $('<li></li>')
              .addClass('list-group-item skill-draggable faded clickable-skill ' + col_classes)
              .attr('skill-name', skill_name)
              .append('<span class="skill-label">' + skill_name + '</span>')
              .append('<span class="pull-right badge"></span>');
              //.append('<span class="pull-right pseudo-point">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');

    s.append(t);
  })

  $('div#graphical-list').append(s);
  $('.graphical-container')
    //.css('max-height', '90vh')
    .css('margin-left', '-4px')
    .css('margin-right', '0px');
  recalculate();
  attach_anchor();

  if (is_builder && is_desktop_site) {
    attach_drag_functor('all');
  }
};

function rebuild_popover(obj) {
  var target_element = obj;
  var skill_name = obj.find('span.skill-label').text();
  var min_cost = parseInt(obj.find('span.badge').text());
  var top_id = target_element.parent().parent().attr('id');

  // target_element
  //   .attr('data-placement', 'auto')
  //   .attr('data-trigger', 'manual')
  //   .attr('data-html', true)
  //   .attr('data-container', 'body')
  //   .attr('data-viewport', '#' + top_id)
  //   .attr('data-content', pull_skill_cat_data(skill_name, min_cost));

  target_element.popover('destroy');

  target_element.popover({
    placement: 'auto',
    trigger: 'manual',
    html: 'true',
    container: 'body',
    viewport: '#' + top_id,
    content: pull_skill_cat_data(skill_name, min_cost)
  });
}

function reset_popover(obj) {
  obj.removeAttr('popover-applied');
}

function attach_anchor() {
  var target_element;
  $('li.clickable-skill').on('click', function() {
    if (is_builder) {
      attach_drag_functor($(this));
    }

    if ($(this).hasClass('no-click')) {
      return;
    }

    // var is_popped_over = $('.popover').hasClass('in');
    disable_popover();
    
    var has_been_configured = $(this).attr('popover-applied') != undefined;
    var is_open = $(this).attr('aria-describedby') != undefined;

    console.log('is_open: ' + is_open + ' | hbc: ' + has_been_configured);
    if (!is_open) {
      if (!has_been_configured) {
        rebuild_popover($(this));
        $(this).attr('popover-applied', true);
      }
      $(this).popover('show');
    }


    target_element = $(this);//.find('span.skill-label');
    //target_element = $(this).find('span.pseudo-point');
    var skill_name = $(this).find('span.skill-label').text();
    var min_cost = parseInt($(this).find('span.badge').text());
    var top_id = target_element.parent().parent().attr('id');
    //console.log(top_id);


    // var y_position = $(this).position().top;
    // var window_height = $(window).height();
    // var data_placement = 'right';

    // if (y_position < 100) {
    //   data_placement = 'bottom';
    // } else if (y_position > window_height - 200) {
    //   data_placement = 'top';
    // }

    //var text_content = target_element.html();
    // if (data_placement != 'right') {
    //   if (target_element.width() < 100) {
    //     var diff = (100 - target_element.width()) / 2;

    //     for (i = 0; i < diff; i++) {
    //       text_content += '&nbsp;'
    //     }

    //     target_element.html(text_content);
    //   }
    // } else {
    //   text_content = text_content.replace(/\&nbsp\;/g, '');
    //   target_element.html(text_content);
    // }
    //console.log(top_id);
    
    
    //target_element.attr('data-placement', data_placement)
    
  
    // skill_name = skill_name.trim();
    // // var is_reclick = last_popover_skill.localeCompare(skill_name) == 0;
    // $('.popover').off('click').on('click', function() {
    //   console.log('clicked');
    //   $('.popover').hide();
    // })
    // target_element.popover('show');
    
    // if (is_popped_over && is_reclick) {
    //   target_element.popover('hide');
    //   //target_element.popover('destroy');
    //   last_popover_skill = '';
    // } else {
    //   // target_element.popover('destroy');

    //   // console.log('recreating');
      

    //   // console.log(target_element);
    //   // // target_element
    //   // //   .attr('popover-applied', true)
    //   // //   .attr('data-trigger', 'click')
    //   // //   .attr('data-html', true)
    //   // //   .attr('data-content', pull_skill_cat_data(skill_name, min_cost));
    //   // target_element.popover({
    //   //   placement: data_placement
    //   // });
    //   // try {
        
    //   // } catch(err) {
    //   //   console.log(err);
    //   // }

    //   target_element.popover('show');
    //   last_popover_skill = skill_name;
    // }

    // $('.popover').off('click').on('click', function() {
    //   $(this).hide();
    // })
  })
}

function pull_skill_cat_data(skill, min_cost) {
  var data = skill_cat[skill];
  var by_strain = new Object();
  var strain_preq = null;
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
        strain_preq = class_data;
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

      if (strain_preq && strain_preq[strain_name]) {
        var concat = new Array();
        var combinator = strain_preq[strain_name].predicate == 'and' ? ' & ' : ' | ';
        $.each(strain_preq[strain_name].list, function(preq_skill, _junk) {
          concat.push(preq_skill + ' (3)');
        })
        s += '<span class="preq">&laquo; ' + concat.join(combinator) + '</span><br />';
      }
    });

    s += '<hr class="thin-divider" />';
  }

  if (by_open.length > 0) {
    s += by_open.join('<br />') + '<hr class="thin-divider" />';
  }

  if (Object.keys(by_profession).length > 0) {
    $.each(by_profession, function(profession_name, pdata) {
      var class_name = 'skill-not-accessible';
      var preq;
      if (selected_professions != undefined && 
          selected_professions.indexOf(profession_name) != -1) {
        class_name = 'text-primary';
        preq = find_preq(profession_name, skill, pdata);
      }

      if (pdata.cost == min_cost && class_name != 'skill-not-accessible') {
        class_name = 'skill-cheapest';
      }

      var f = '<span class="' + class_name + '">' + profession_name + ': ' + pdata.cost + '</span>';
      s += f + '<br />';
      if (preq && preq.length > 0) {
        s += '<span class="preq">' + preq + '</span><br />';
      }
    })
  }

  return s;
}

function find_preq(profession, skill, pdata) {
  var s = '';

  if (pdata.preq == null) {
    return '';
  } else {
    var combinator = pdata.preq.predicate == 'and' ? ' & ' : ' | ';
    var cost = skill_cat[skill][profession].cost;

    //s += Object.keys(pdata.preq.list).join(combinator) + ' (' + cost + ')';

    var concat = new Array();
    $.each(pdata.preq.list, function(preq_skill, _junk) {
      //s += find_preq(profession, preq_skill, skill_cat[preq_skill][profession]);
      if (skill_cat[preq_skill][profession]) {
        concat.push(preq_skill + ' (' + skill_cat[preq_skill][profession].cost + ')');
      } else {
        concat.push(preq_skill + ' (Open: 9)');
      }
    });
    s += concat.join(combinator);
  }

  return ' &laquo; ' + s;
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
  $('#graphical-list').find('[skill-name]').each(function() {
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
    $('#graphical').find('.list-group-item.faded').hide();
  } else {
    $('.list-group-item.faded').show();

  }
}

function disable_popover() {
  $('.popover').popover('hide');
}

$(function() {
  $.ajaxSetup({cache: false});

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

  if (!is_builder) {
    var target_max_height = $(window).height() - $('#setup').height() - 32;
    $('#graphical').css('max-height', target_max_height);
  }

  //$.mobile.loading().hide();

  $('#graphical').on('scroll', function() {
    $('.popover').hide();
  })
  $('#acquired').on('scroll', function() {
    $('.popover').hide();
  })
  $('#planned').on('scroll', function() {
    $('.popover').hide();
  })
});

