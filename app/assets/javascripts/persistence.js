var skill_list;
var skill_list_inverted;

function clear_cookies() {
  Cookies.remove('drpedia');
}

function pack_state() {
  if (!has_profile) { return; }

  var pack = $('#hp-addition').text() + '|'
           + $('#mp-addition').text() + '|' 
           + (selected_strain || '') + '|' 
           + (selected_professions || new Array()).join(',') + '|';
  var es = extract_skills();

  pack += es.acquired.join(',') + '|' + es.planned.join(',');
  Cookies.set(current_profile, pack, { expires: 365 });
  console.log('Packing to ' + current_profile + ': ' + pack);
}

function unpack_state() {
  if (!has_profile) { return; }

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

  var relocate = function(target_list_id, skill_list) {
    $.each(skill_list, function(i, x) {
      var target_object = $('[skill-name="' + x + '"]');
      if (target_object.length == 0) {
        target_object = $('[skill-name="' + decrypt_psionic_skills(x) + '"]');
      }

      if (target_object) {
        append_lexicographically(target_list_id, target_object);
      }
    })
  }

  var reset_all_skills = function(list_id) {
    var entries = new Array();
    
    $('#' + list_id + ' .list-group-item').each(function() {
      var entry = $(this).attr('skill-name');
      entries.push(entry);
    })

    relocate('#graphical-list', entries);
  }

  var unpack = current_profile == 'dummy' ? '0|0||||' : Cookies.get(current_profile);
  console.log('Unpack from ' + current_profile + ': ' + unpack);

  if (unpack != undefined) {
    var p0 = unpack.split('|');
    var hp = parseInt(p0[0]) || 0;
    var mp = parseInt(p0[1]) || 0;
    var strain = p0[2];

    reset_all_skills('acquired-list');
    reset_all_skills('planned-list');
    set_stat_build($('#hp-addition'), 'hp-total', hp, false);
    set_stat_build($('#mp-addition'), 'mp-total', mp, false);
    initialize_stats_controller('#hp-sub');
    initialize_stats_controller('#mp-sub');
    var professions = p0[3].split(',');
    var acquired_skills = decrypt_skills(p0[4].split(','));
    var planned_skills = decrypt_skills(p0[5].split(','));

    selected_strain = strain || 'Select Strain';
    selected_professions = professions;
    //$('#strain-selector').val(strain).multiselect('refresh');
    
    $('#strain-selector').multiselect('select', selected_strain).multiselect('refresh');
    $('#profession-selector')
      .multiselect('deselectAll', false)
      .multiselect('updateButtonText');
    $.each(professions, function(i, x) {
      $('#profession-selector').multiselect('select', x);
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
    //pack_state();
    update_xp_count('#planned');
    update_xp_count('#acquired');
    generate_constraints();
    update_selected_skills(0);

    
  } else {
    generate_constraints();
  }
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
  skill_list_inverted = new Object();
  $.each(skill_list, function(key, val) {
    skill_list_inverted[val] = key;
  })
}

$(function() {
  $.when(get_json_strain(), 
         get_json_profession(), 
         get_json_skill_cat(), 
         get_json_strain_stats(), 
         get_json_strain_specs()).done(function() {
    $.when(get_json_strain_restriction()).done(function() {
      $.when(get_json_skill_list()).done(function() {
        $('#init-completed').show();

        generate_inverted_skills();
        resize_graphical();
        load_first_available_profile();

        init_completed = true;
        $('#loading [data-dismissible]').hide(500, function() {
          $('#loading').hide(1000);
        });
        
      });
      
    })
  })
  // $.when(get_json_strain(), 
  //        get_json_profession(), 
  //        get_json_skill_cat(),
  //        get_json_strain_restriction()).done(function() {
  //   
  // })

});