var strains;
var professions;
var skill_cat;
var advanced_cat;
var strain_restrictions;
var strain_stats;
var strain_specs;
var skill_groups;
var professions_advanced;
var professions_concentration;

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
      apply_strain_restrictions();
      restrict_profession_selector();
      update_selected_professions();
      //update_profession_cost();

      recalculate();

      if (is_builder) {
        replan();
        pack_state();
        update_strain_stats();
        update_strain_specs();
      }

      update_profession_cost();

      if (is_builder) {
        update_beyond_basic();
      }
    }
  });
};

function update_strain_stats() {
  var stats = strain_stats[selected_strain];
  if (stats != undefined) {
    set_base_stats(stats.hp, stats.mp, stats.infection);
  } else {
    set_base_stats(0, 0, 0);
  }
}

function update_strain_specs() {
  var s = strain_specs[selected_strain];

  if (s == undefined) { return; }
  var t = ['Strain-specific skills:'];

  var append = function(arr, type) {
    $.each(arr, function(i, x) {
      var css_class = (type == 'adv') ? 'text-primary' : 'text-danger';
      //var u = $('<span></span>').addClass(css_class).append(x);
      var u = '<span class="' + css_class + '">' + x + '</span>';
      //console.log(u.html());
      t.push(u);
    })
  }

  append(s.advantages, 'adv');
  append(s.disadvantages, 'dis');

  $('#strain-specs').html(t.join('<br />'));
}

function update_selected_professions() {
  selected_professions = new Array();

  $('#setup-profession :selected').each(function() {
    selected_professions.push($(this).val());
  })
}

function apply_strain_restrictions() {
  $('#profession-selector option').each(function() {

    var name = $(this).attr('profession');
    var input = $('input[value="' + name + '"]');
    input.prop('disabled', false);
    input.parent().removeClass('text-muted');
  })

  var constraints = strain_restrictions[selected_strain];
  if (constraints != undefined) {
    $.each(constraints, function(x, _junk) {
      $('#profession-selector')
        .find('[profession="' + x + '"]')
          .attr('disabled-by-constraint', true);

      var input = $('input[value="' + x + '"]');
      input.prop('disabled', true);
      input.attr('disabled-by-constraint', true);
      input.parent().addClass('text-muted');
      $('#profession-selector').multiselect('deselect', x);
    })

    update_selected_professions();
    //$('#profession-selector').multiselect('refresh');
  } else {
    $('#profession-selector').find('[disabled-by-constraint]').each(function() {
      $(this).removeAttr('disabled-by-constraint');
    });
    //$('#profession-selector').multiselect('refresh');
  }
}

var generate_professions_select_box = function() {
  var s = $('<select><select>')
            .attr('id', 'profession-selector')
            .attr('multiple', true);

  $.each(professions, function(index, value) {
    var t = $('<option></option>')
              .attr('profession', value)
              .append(value);

    s.append(t);
  })

  s.append($('<option></option>')
             .attr('data-role', 'divider'));

  $.each(professions_advanced, function(value, _junk) {
    var t = $('<option></option>')
              .attr('profession-advanced', value)
              .append(value);

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
      // if (selected_options.length >= 3) {
      //   restrict_profession_selector();
      //   // var non_selected_options = $('#profession-selector option').filter(function() {
      //   //   return !$(this).is(':selected');
      //   // })

      //   // non_selected_options.each(function() {
      //   //   var input = $('input[value="' + $(this).val() + '"]');
      //   //   //input.prop('faded', true);
      //   //   input.prop('disabled', true);
      //   //   input.parent().addClass('text-muted');
      //   // })
      // } else {
        
      // }

      restrict_profession_selector();
      //check_advanced_profession_constraints(option, checked);
      ensure_only_one_selected_advanced_profession(option, checked);
      update_profession_cost();
      update_selected_professions();
      //$('#profession-xp').text(Math.max(0, (selected_options.length - 1) * 10));

      recalculate();

      if (is_builder) {
        replan();
        pack_state();
        update_beyond_basic();
      }
    }
  })
};

function update_profession_cost() {
  var remnant_cost_reduction = 0;

  // Remnant-specific two-profession start
  if (strain_specs[selected_strain] != undefined && 
      strain_specs[selected_strain].advantages != undefined &&
      strain_specs[selected_strain].advantages.indexOf('Dabbler') != -1) {
    remnant_cost_reduction = 1;
  }

  $('#profession-xp').text(Math.max(0, ($('#profession-selector :selected').length - 1 - remnant_cost_reduction) * 10));
  update_total_xp();
}

function ensure_only_one_selected_advanced_profession(option, checked) {
  if (checked) {
    if (option.attr('profession-advanced') != undefined) {
      var ap_name = option.attr('profession-advanced');

      $('[profession-advanced]').each(function() {
        var this_ap_name = $(this).attr('profession-advanced');

        if (this_ap_name != ap_name) {
          $('#profession-selector').multiselect('deselect', this_ap_name);
          enable_ap_select_button(this_ap_name, true);
        } else {
          enable_ap_select_button(this_ap_name, false);
        }
      })
    }
  } else {
    enable_all_ap_select_buttons(true);
  }
}
// function check_advanced_profession_constraints(option, checked) {
//   if (checked) {
//     if (option.attr('profession-advanced') != undefined) {
//       var ap_name = option.attr('profession-advanced');

//       $('[profession-advanced]').each(function() {
//         var this_ap_name = $(this).attr('profession-advanced');

//         if (this_ap_name != ap_name) {
//           $('#profession-selector').multiselect('deselect', this_ap_name);
//         }
//       })
//     }
//   }

//   $('#profession-selector [profession-advanced]:selected').each(function() {
//     var ap_name = $(this).val();
//     var ap_obj = $('li[p-adv="' + ap_name + '"]');

//     //console.log(ap_obj);
//     if (ap_obj.hasClass('faded')) {
//       console.log('not satisfied');
//     } else {
//       console.log('ok');
//     }
//   })
// }

function restrict_profession_selector() {
  var currently_selected = $('#profession-selector [profession]:selected').length;
  if (currently_selected >= 3) {
    var non_selected_options = $('#profession-selector [profession]option').filter(function() {
      return !$(this).is(':selected');
    })

    non_selected_options.each(function() {
      var input = $('input[value="' + $(this).val() + '"]');
      //input.prop('faded', true);
      input.prop('disabled', true);
      input.parent().addClass('text-muted');
    })
  } else {
    $('#profession-selector [profession]option').each(function() {
      var input = $('input[value="' + $(this).val() + '"]');
      //input.prop('faded', false);
      if (input.attr('disabled-by-constraint') == undefined) {
        
        input.prop('disabled', false);
        input.parent().removeClass('text-muted');
      }
    });
  }
}

function assign_col_descriptor_classes() {
  if (is_builder) {
    return 'col-xs-12 col-md-6 col-lg-4';
  } 

  return 'col-xs-12 col-sm-6 col-md-4 col-lg-3';
}

var generate_skill_cat = function() {
  var skills = Object.keys(skill_cat);
  var grouped_skills = generate_skill_group();
  var group_header_to_remove = Object.keys(skill_groups);
  
  var psion_regex = /^Psi ([I]+)/;

  var mark_advanced = function(x) {
    if (advanced_cat[x] != undefined) {
      return '<sup>ADV</sup>' + x;
    }

    return x;
  }

  $.each(grouped_skills, function(x, source_group) {
    if (skill_cat[x] == undefined) {
      
      skill_cat[x] = skill_cat[source_group];
      skills.push(x);
    }
  })

  var list_maker = function(col_classes, skill_name) {
    var psion_index;
    if (skill_name.match(psion_regex)) {
      var match = psion_regex.exec(skill_name);
      psion_index = match[1];
    }
    
    var s = $('<li></li>')
      .addClass('list-group-item skill-draggable faded clickable-skill ' + col_classes)
      .attr('skill-name', skill_name)
      .attr('advanced-skill', advanced_cat[skill_name] == undefined ? false : true)
      .append('<span class="skill-label">' + mark_advanced(skill_name) + '</span>')
      .append('<span class="pull-right badge"></span>');

    if (psion_index != undefined) {
      s.attr('psion-index', psion_index);
    }

    return s;
  }

  // var s = $('<ul></ul>')
  //           .addClass('list-group')
  //           .attr('id', 'graphical-list');
  var s = $('#graphical-list');

  var col_classes = assign_col_descriptor_classes();

  $.each(skills.sort(), function(index, skill_name) {
    var t = list_maker(col_classes, skill_name);
              //.append('<span class="pull-right pseudo-point">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>');

    s.append(t);
  })

  $('div#graphical-list').append(s);
  $.each(group_header_to_remove, function(i, x) {
    //console.log('removing ' + x);
    $('[skill-name="' + x + '"]').remove();
  })

  recalculate();
  attach_anchor();

  if (is_builder && is_desktop_site) {
    attach_drag_functor('all');
  }
};

function generate_skill_group() {
  var skills = new Object();
  $.each(skill_groups, function(group_name, members) {
    var prefix = '';
    switch(group_name) {
      case 'Psionic Skill - Basic': prefix = 'Psi I - '; break;
      case 'Psionic Skill - Intermediate': prefix = 'Psi II - '; break;
      case 'Psionic Skill - Advanced': prefix = 'Psi III - '; break;
    }

    $.each(members, function(member, _junk) {
      skills[prefix + member] = group_name;
    })
  });

  return skills;
}

function rebuild_popover(obj, _rebuild) {
  var rebuild = _rebuild == undefined ? true : false;
  var target_element = obj;
  var skill_name = obj.attr('skill-name');
  var min_cost = parseInt(obj.find('span.badge').text());
  var top_id = target_element.parent().attr('id');

  // target_element
  //   .attr('data-placement', 'auto')
  //   .attr('data-trigger', 'manual')
  //   .attr('data-html', true)
  //   .attr('data-container', 'body')
  //   .attr('data-viewport', '#' + top_id)
  //   .attr('data-content', pull_skill_cat_data(skill_name, min_cost));

  if (rebuild) {
    target_element.popover('destroy');

    target_element.popover({
      placement: 'auto',
      trigger: 'manual',
      html: 'true',
      container: 'body',
      viewport: '#' + top_id,
      content: pull_skill_cat_data(skill_name, min_cost)
    });
  } else {
    return pull_skill_cat_data(skill_name, min_cost);
  }

  return true;
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

    disable_popover();
    
    var has_been_configured = $(this).attr('popover-applied') != undefined;
    var is_open = $(this).attr('aria-describedby') != undefined;

    //console.log('is_open = ' + is_open + ' | hbc = ' + has_been_configured);
    if (!is_open) {
      if (!has_been_configured) {
        rebuild_popover($(this));
        $(this).attr('popover-applied', true);
        $(this).popover('show');
      } else {
        $(this).popover('show');
        $('.popover-content').html(rebuild_popover($(this), false));
      }
      
    }


    target_element = $(this);//.find('span.skill-label');
    //target_element = $(this).find('span.pseudo-point');
    var skill_name = $(this).find('span.skill-label').text();
    var min_cost = parseInt($(this).find('span.badge').text());
    var top_id = target_element.parent().parent().attr('id');
  })
}

function pull_skill_cat_data(skill, min_cost) {
  var data = skill_cat[skill];
  var by_strain = new Object();
  var by_strain_disadvantage = new Object();
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
      case "innate_disadvantage":
        $.each(class_data, function(index, innate_disadvantage) {
          by_strain_disadvantage[innate_disadvantage] = '[x2]';
        })
        break;
      default:
        by_profession[class_type] = data[class_type];
    }
  });

  var find_lowest_available = function(method) {
    var min_cost = 999;
    var current_min = '';
    if (method == 'by_profession') {
      $.each(by_profession, function(profession_name, data) {
        if (data.cost < min_cost && selected_professions != undefined && selected_professions.indexOf(profession_name) != -1) {
          current_min = profession_name;
          min_cost = data.cost;
        }
      })
    } else if (method == 'by_strain') {
      $.each(by_strain, function(strain_name, cost) {
        if (cost < min_cost && selected_strain == strain_name) {
          current_min = strain_name;
          min_cost = cost;
        }
      })
    }

    return [current_min, min_cost];
  }

  var find_lowest_from_pair = function() {
    var min_strain_data = find_lowest_available('by_strain');
    var min_prof_data = find_lowest_available('by_profession');

    var min = Math.min(min_strain_data[1], min_prof_data[1]);

    var min_result = new Array();
    if (min == min_strain_data[1]) {
      min_result.push(min_strain_data[0]);
    }

    if (min == min_prof_data[1]) {
      min_result.push(min_prof_data[0]);
    }

    return min_result;
  }

  var lowest_pair = find_lowest_from_pair();

  if (Object.keys(by_strain).length > 0) {
    $.each(by_strain, function(strain_name, cost) {
      var class_name = 'skill-not-accessible';
      if (strain_name == selected_strain) {
        class_name = 'text-primary';
      }

      if (lowest_pair.indexOf(strain_name) != -1) {
        class_name = 'skill-cheapest';
      }
      // if (cost == min_cost && class_name != 'skill-not-accessible') {
      //   class_name = 'skill-cheapest';
      // }

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

  if (Object.keys(by_strain_disadvantage).length > 0) {
    var f = new Array();
    $.each(by_strain_disadvantage, function(strain_name, cost) {
      var class_name = 'skill-not-accessible';
      if (strain_name == selected_strain) {
        class_name = 'text-danger';
      }
      f.push('<span class="' + class_name + '">' + strain_name + ': ' + cost + '</span>');
    })

    s += f.join('<br />') + '<hr class="thin-divider" />';
  }

  if (by_open.length > 0) {
    s += by_open.join('<br />') + '<hr class="thin-divider" />';
  }

  if (Object.keys(by_profession).length > 0) {
    var min_profession = find_lowest_available('by_profession');
    $.each(by_profession, function(profession_name, pdata) {
      var class_name = 'skill-not-accessible';
      var preq;
      if (selected_professions != undefined && 
          selected_professions.indexOf(profession_name) != -1) {
        class_name = 'text-primary';
        preq = find_preq(profession_name, skill, pdata);
      }

      // if (pdata.cost == min_cost && class_name != 'skill-not-accessible') {
      //   class_name = 'skill-cheapest';
      // }
      if (lowest_pair.indexOf(profession_name) != -1) {
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
    if (data.innate == undefined) {
      return 99;
    }

    var strain_index = data.innate.indexOf(selected_strain);
    return strain_index == -1 ? 99 : 3;
  }

  var detect_has_innate_disadvantage = function(data) {
    if (data.innate_disadvantage == undefined) {
      return false;
    }

    var strain_index = data.innate_disadvantage.indexOf(selected_strain);
    return strain_index == -1 ? false : true;
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
    var open_skill_cost = detect_is_open_skill(data);

    var colorize_badge = function(obj, min_cost, open_skill_cost) {
      obj.find('.badge')
        .removeClass('progress-bar-success')
        .removeClass('progress-bar-danger')
        .removeClass('progress-bar-default');

      if (min_cost < open_skill_cost) {
        obj.find('.badge').addClass('progress-bar-success');
      } else if (min_cost > open_skill_cost) {
        obj.find('.badge').addClass('progress-bar-danger');
      } else {
        obj.find('.badge').addClass('progress-bar-default');
      }
    }

    min_cost = Math.min(min_cost, detect_is_profession_skill(data));
    min_cost = Math.min(min_cost, detect_has_innate(data));
    min_cost = Math.min(min_cost, open_skill_cost);

    if (detect_has_innate_disadvantage(data)) {
      min_cost = min_cost * 2;
    }

    var o = $('[skill-name="' + skill_name + '"]');

    if (min_cost != 99) {
      o.removeClass('faded');
      o.find('.badge').text(min_cost);
      o.find('.clickable-skill').removeClass('link-faded');
      // if (is_open_skill && min_cost < open_skill_cost) {
      //   o.find('.badge').addClass('progress-bar-success');
      // }
      colorize_badge(o, min_cost, open_skill_cost);
    } else {
      o.addClass('faded');
      o.find('.badge').text('');
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
  if (is_builder) {
    apply_view_filters();
  } else {
    disable_popover();
    var only_available = $('#only-available-checkbox').prop('checked');

    if (only_available) {
      $('.list-group-item').show();
      //$('#graphical').find('.list-group-item.faded').hide();
      $('#graphical-list').find('.list-group-item.faded').hide();
    } else {
      $('.list-group-item.faded').show();
    }

    $('.drag-simulable').each(function() {
      if ($(this).hasClass('faded')) {
        removeClass('drag-simulable');
      }
    });
  }
}

function disable_popover() {
  $('.popover').popover('hide');
}

function get_json_strain() {
  return $.getJSON('/strains.json', function(strains_json_data) { 
    strains = strains_json_data; 
    generate_strains_select_box();
    $('#init-strain').show();
  });
}

function get_json_profession() {
  return $.getJSON('/professions.json', function(professions_json_data) { 
    professions = professions_json_data; 
    //generate_professions_select_box(); 
    $('#init-profession').show();
  });
}

function get_json_profession_advanced() {
  return $.getJSON('/profession_advanced.json', function(p_adv_json_data) {
    professions_advanced = p_adv_json_data;
  })
}

function get_json_profession_concentration() {
  return $.getJSON('/profession_concentrations.json', function(p_conc_json_data) {
    professions_concentration = p_conc_json_data;
  })
}

function get_json_skill_cat() {
  return $.getJSON('/skill_cat.json', function(skill_cat_json_data) { 
    //skill_cat = skill_cat_json_data; 
    $.getJSON('/advanced_cat.json', function(advanced_cat_json_data) {
      // console.log(skill_cat_json_data);
      // console.log(advanced_cat_json_data);
      advanced_cat = advanced_cat_json_data;
      skill_cat = $.extend({}, skill_cat_json_data, advanced_cat_json_data);

      $.getJSON('/skill_group.json', function(skill_group_json_data) {
        skill_groups = skill_group_json_data;
        generate_skill_cat(); 

        $('#init-skill').show();
      })
    })
    
    
    
  });
}

function get_json_strain_restriction() {
  return $.getJSON('/strain_restriction.json', function(strain_restriction_json_data) {
    strain_restrictions = strain_restriction_json_data;
    $('#init-const').show();
  });
}


function get_json_skill_list() {
  return $.getJSON('/skill_list.json', function(skill_list_json_data) { 
    skill_list = skill_list_json_data;
    //unpack_state();
  });
}

function get_json_strain_stats() {
  return $.getJSON('/strain_stats.json', function(strain_stats_json_data) { 
    strain_stats = strain_stats_json_data;
    $('#init-stat').show();
  });
}

function get_json_strain_specs() {
  return $.getJSON('/strain_specs.json', function(strain_specs_json_data) { 
    strain_specs = strain_specs_json_data;
  });
}

$(function() {
  $.ajaxSetup({cache: false});

  if (!is_builder) {
    get_json_strain();
    get_json_profession();
    get_json_skill_cat();
    get_json_strain_restriction();
    $('#new-version-alert').modal();
    $('#go-to-new-version').on('click', function() {
      window.location.href = "/beta";
    })
  }

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
    var target_max_height = $(window).height() - $('#setup').height();
    $('#graphical').css('max-height', target_max_height);
  }

  //$.mobile.loading().hide();

  $('#graphical-list').on('scroll', function() {
    disable_popover();
  })
  $('#acquired').on('scroll', function() {
    disable_popover();
  })
  $('#planned').on('scroll', function() {
    disable_popover();
  })

  $('a[data-toggle="tab"]').on('shown.bs.tab', function() {
    disable_popover();
  })
});

