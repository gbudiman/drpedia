var skill_list;
var skill_list_inverted;
var skill_list_special_group;
var ok_to_trigger_advanced_profession_removal = false;
var advanced_acknowledged = false;
var skill_cost_adjusted = {};
var unpack_has_been_called = false;

function persistence_set_skill_cost_adjustment(name, value) {
  skill_cost_adjusted[skill_list[name]] = value;
  pack_state();
}

function persistence_clear_skill_cost_adjustment(name, _bypass_pack) {
  var bypass_pack = _bypass_pack == undefined ? false : true;
  var exist = skill_cost_adjusted[skill_list[name]];
  delete skill_cost_adjusted[skill_list[name]];

  if (exist) {
    pack_state();
  }
}

function persistence_clear_all_skill_cost_adjustment() {
  skill_cost_adjusted = {};
}

function apply_skill_cost_adjusted() {
  $.each(skill_cost_adjusted, function(code, value) {
    var skill_name = skill_list_inverted[code];
    $('li[skill-name="' + skill_name + '"]').find('.badge').html(value + '<sup>+</sup>');
  })

  update_xp_count('#planned');
  update_xp_count('#acquired');
}

function set_advanced_acknowledgement(val) {
  advanced_acknowledged = val;
  if (val) {
    $('.advanced-recoverable').show();
    $('.advanced-to-hide').hide();
    $('#filter-group').multiselect('deselect', 'hide-advanced', true);
  } else {
    $('.advanced-recoverable').hide();
    $('.advanced-to-hide').show();
    $('#filter-group').multiselect('select', 'hide-advanced', true);
  }

  if (unpack_has_been_called) {
    pack_state();
  }
}

function clear_cookies() {
  Cookies.remove('drpedia');
}

function pack_state() {
  //console.log('called from ' + pack_state.caller.toString())
  calculate_xp_sum();

  var pack = $('#hp-addition').text() + '|'
           + $('#mp-addition').text() + '|' 
           + (selected_strain || '') + '|' 
           + (selected_professions || new Array()).join(',') + '|';
  var es = extract_skills();

  pack += es.acquired.join(',') + '|' + es.planned.join(',') + '|';
  pack += advanced_acknowledged ? 1 : 0;

  var sca = new Array();
  $.each(skill_cost_adjusted, function(code, value) {
    if (!isNaN(value)) {
      sca.push(code + value);
    }
  })

  pack += '|' + sca.join(',');

  Cookies.set(has_profile ? current_profile : 'dummy', pack, { expires: 365 });
  console.log('Packing to ' + current_profile + ': ' + pack);
}

function unpack_state() {
  unpack_has_been_called = true;
  if (!has_profile) {
    if (Cookies.get('dummy') == undefined) {
      return;
    }

    current_profile = 'dummy';
  }

  var decrypt_psionic_skills = function(a) {
    var prefix = '';
    $.each(skill_groups, function(group_name, skills) {
      if (skills[a] != undefined) {
        switch (group_name) {
          case 'Psionic Skill - Basic': prefix = 'Psi I - '; break;
          case 'Psionic Skill - Intermediate': prefix = 'Psi II - '; break;
          case 'Psionic Skill - Advanced': prefix = 'Psi III - '; break;
        }

        return false;
      }
    });

    return prefix + a;
  }

  var decrypt_skills = function(a) {
    var output = new Array();

    $.each(a, function(i, x) {
      var lookup = skill_list_inverted[x];
      if (lookup != undefined) {
        output.push(lookup);
      }
    })
    return output;
  }

  var relocate = function(target_list_id, skill_list, _hint) {
    $.each(skill_list, function(i, x) {
      
      var target_object = $('li[skill-name="' + x + '"]');
      if (target_object.length == 0) {
        target_object = $('li[skill-name="' + decrypt_psionic_skills(x) + '"]');
      }

      if (target_object) {
        append_lexicographically(target_list_id, target_object, _hint);
      }
    })
  }

  var reset_all_skills = function(list_id) {
    var entries = new Array();
    
    $('#' + list_id + ' .list-group-item').each(function() {
      var entry = $(this).attr('skill-name');
      entries.push(entry);
    })

    relocate('#graphical-list', entries, 'bypass_check_adjusted_cost');
  }

  //var unpack = current_profile == 'dummy' ? '0|0||||' : Cookies.get(current_profile);
  var unpack = Cookies.get(current_profile);
  console.log('Unpack from ' + current_profile + ': ' + unpack);

  if (unpack != undefined) {
    defer_update_beyond_basic(function() {

      var p0 = unpack.split('|');
      var hp = parseInt(p0[0]) || 0;
      var mp = parseInt(p0[1]) || 0;
      var strain = p0[2];

      $('#strain-selector').multiselect('select', 'Select Strain').multiselect('refresh');
      reset_all_skills('acquired-list');
      reset_all_skills('planned-list');
      set_stat_build($('#hp-addition'), 'hp-total', hp, false);
      set_stat_build($('#mp-addition'), 'mp-total', mp, false);
      initialize_stats_controller('#hp-sub');
      initialize_stats_controller('#mp-sub');
      var professions = p0[3].split(',');
      var acquired_skills = decrypt_skills(p0[4].split(','));
      var planned_skills = decrypt_skills(p0[5].split(','));

      if (p0[6] != undefined) {
        advanced_acknowledged = p0[6] == '1' ? true : false;
      } else {
        advanced_acknowledged = false;
      }

      skill_cost_adjusted = {};
      if (p0[7] != undefined) {
        $.each(p0[7].split(','), function(i, x) {
          var coded = x[0] + x[1];
          var value = parseInt(x[2] + (x[3] || ''));
          skill_cost_adjusted[coded] = value;
        })
      }
      
      selected_strain = strain || 'Select Strain';

      selected_professions = new Array();
      selected_advanced_profession = undefined;
      $.each(professions, function(i, x) {
        if (advanced_profession_struct[x] == undefined) {
          selected_professions.push(x);
        } else {
          selected_advanced_profession = x;
          if (!advanced_acknowledged) {
            $('#advanced-existance-warning').modal('show');
          }
        }
      })

      //selected_professions = professions;
      //$('#strain-selector').val(strain).multiselect('refresh');
      
      $('#strain-selector').multiselect('select', selected_strain);
      $('#profession-selector')
        .multiselect('deselectAll', false)
        .multiselect('updateButtonText');
      $.each(professions, function(i, x) {
        $('#profession-selector').multiselect('select', x, true);
      });

      //$('#profession-selector').val(professions).multiselect('refresh');

      apply_strain_restrictions();
      restrict_profession_selector();
      update_profession_cost();
      update_strain_specs();
      update_strain_stats();
      recalculate();
      replan();
      //update_availability();

      relocate('#planned-list', planned_skills);
      relocate('#acquired-list', acquired_skills);
      apply_skill_cost_adjusted();
      //pack_state();
      update_xp_count('#planned');
      update_xp_count('#acquired');
      generate_constraints();
      update_selected_skills(0);
    })

    check_advanced_profession_constraints();
    pack_state();
  } else {
    generate_constraints();
  }

  post_process_advanced_professions();
}

function extract_skills() {
  var psion_regex = /^Psi [I]+ - /;

  var extract_skills_from_region = function(id) {
    var s = new Array();
    $(id + ' .skill-draggable').each(function() {
      if ($(this).hasClass('faded')) { return true; }
      var skill_name = $(this).attr('skill-name');

      if (skill_name.match(psion_regex)) {
        skill_name = skill_name.replace(psion_regex, '');
      }
      s.push(skill_list[skill_name]);
    })

    return s;
  }

  var acqs = extract_skills_from_region('#acquired');
  var plans = extract_skills_from_region('#planned');

  return {
    planned: plans,
    acquired: acqs
  }
}

function generate_inverted_skills() {
  return new Promise(
    function(resolve, reject) {
      skill_list_inverted = new Object();
      skill_list_special_group = new Object();

      $.each(skill_list, function(key, val) {
        skill_list_inverted[val] = key;
      })

      $.each(skill_groups, function(group_name, d) {
        $.each(d, function(skill_name, _junk) {
          skill_list_special_group[skill_name] = group_name;
        });
      });

      resolve();
    }
  )
}

$(function() {
  $.when(get_json_strain(), 
         get_json_profession(), 
         get_json_skill_cat(), 
         get_json_strain_stats(), 
         get_json_strain_specs(),
         get_json_profession_advanced(),
         get_json_profession_concentration()).done(function() {
    $.when(get_json_advanced_cat()).done(function() {
      $.when(get_json_skill_group()).done(function() {
        generate_skill_cat();
        $('#init-skill').show();

        $.when(get_json_strain_restriction()).done(function() {
          $.when(get_json_skill_list()).done(function() {
            $('#init-postprocess').show();
            
            resize_graphical();
            generate_professions_select_box();
            generate_inverted_skills().then(function() {
              build_advanced_profession().then(function() {
                load_first_available_profile();
                update_all_alternators();
                calculate_xp_sum();
                $('#init-completed').show();
                init_completed = true;
                
                ok_to_trigger_advanced_profession_removal = true;
                //update_beyond_basic();
                $('#loading [data-dismissible]').hide(500, function() {
                  $('#loading').hide(1000);
                });
              });
            })
          });
        })
      })
    })
    
  })
  // $.when(get_json_strain(), 
  //        get_json_profession(), 
  //        get_json_skill_cat(),
  //        get_json_strain_restriction()).done(function() {
  //   
  // })

});