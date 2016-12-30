function generate_constraints() {
  var skills = get_skills_in_builder();
  var errors = new Array();
  errors = errors.concat(check_psion_constraints('#acquired'));
  errors = errors.concat(check_psion_constraints('#planned'));
  check_constraints(skills, errors);
}

function check_advanced_profession_constraints() {
  var ap = $('[profession-advanced]:selected').val();

  if (ap == undefined) {

  } else {
    var is_invalid = $('#advanced-list [p-adv="' + ap + '"]').hasClass('faded');

    if (is_invalid && ok_to_trigger_advanced_profession_removal) {
      console.log('unsatisfied advanced profession constraint');
      $('#profession-selector').multiselect('deselect', ap, true);
    } else {
      if (!$('#profession-selector option[profession-advanced="' + ap + '"]').is(':selected')) {
        $('#profession-selector').multiselect('select', ap, true);
      }
    }
  }
}

function check_profession_concentration_constraints(_disable_all) {
  if (update_deferred) { return; }
  var disable_all = _disable_all == undefined ? true : _disable_all;
  var xp_sum = calculate_xp_sum();
  var hp = calculate_hp();
  var mp = calculate_mp();

  if (disable_all) {
    set_all_profession_concentrations(false);
  }

  console.log('CONC check running...');
  if (xp_sum >= 200 && hp >= 50 && mp >= 50) {
    enable_profession_concentrations();
  } else {
    set_all_profession_concentrations(false);
    selected_profession_concentration = new Object();
  }

  update_profession_cost();
}

function set_profession_concentration(x, val) {
  var l = $('#setup-profession').find('option[profession-concentration]');
  var o = $('input[value="' + x + '"]');

  var disabled_by_limit = l.attr('disabled-by-limit') != undefined 
                       && l.attr('disabled-by-limit') == 'true';

  if (val && !disabled_by_limit || o.prop('checked')) {
    //console.log('Enabled: ' + x);
    o.prop('disabled', false)
      .parent()
        .removeClass('text-muted');
  } else {
    //console.log('Disabled: ' + x);

    o.prop('disabled', true)
      .parent()
        .addClass('text-muted');
  }
}

function enable_profession_concentrations() {
  $.each(professions_concentration, function(pc, _junk) {
    // if (selected_professions.indexOf(pc) == -1) {
    //   set_profession_concentration(pc, false);
    // } else {
    //   set_profession_concentration(pc, true);
    // }
    professions_concentration[pc] = false;
    $.each(selected_professions, function(_junk, x) {
      $.each(professions_concentration_struct[x], function(_junk, y) {
        professions_concentration[y] = true;
      })
    })
  })

  $.each(professions_concentration, function(pc, val) {
    set_profession_concentration(pc, val);
  })
}

function set_all_profession_concentrations(val) {
  console.log('set all PC to ' + val);
  $('[profession-concentration]').each(function() {
    var pc_name = $(this).attr('profession-concentration');

    if (val) {
      $('input[value="' + pc_name + '"]')
        .prop('disabled', false)
        .parent()
          .removeClass('text-muted');
    } else {
      $('#profession-selector').multiselect('deselect', pc_name);

      $('input[value="' + pc_name + '"]')
        .prop('disabled', true)
        .parent()
          .addClass('text-muted');
    }
  })
}

function get_purchased_advanced_skills_cost() {
  var get_purchased_advanced_skills_cost_in = function(id) {
    var cumulative = 0;
    $(id).find('[advanced-skill="true"]').each(function() {
      cumulative += parseInt($(this).find('span.badge').text());
    })

    return cumulative;
  }

  var get_profession_concentration_costs = function() {
    return Object.keys(selected_profession_concentration).length * 30;
  }

  return get_purchased_advanced_skills_cost_in('#planned')
       + get_purchased_advanced_skills_cost_in('#acquired')
       + get_profession_concentration_costs()
       + (selected_advanced_profession == undefined ? 0 : 10);
}

function get_skills_in_builder() {
  //$('#acquired').find('[skill-name]')
  var skills = new Array();
  var a = get_skills_in_builder_section('#acquired');
  var b = get_skills_in_builder_section('#planned');

  skills = skills.concat(a);
  skills = skills.concat(b);
  return skills;
}

function get_skills_in_builder_section(id) {
  var skill_list = new Array();
  $(id).find('[skill-name]').each(function() {
    if ($(this).hasClass('faded')) { return true; }
    skill_list.push($(this).attr('skill-name'));
  })

  return skill_list;
}

function check_psion_constraints(target_id) {
  var friendly_name;
  var errors = new Array();
  var l1 = $(target_id).find('[psion-index="I"]').length;
  var l2 = $(target_id).find('[psion-index="II"]').length;
  var l3 = $(target_id).find('[psion-index="III"]').length;
  //console.log(l1 + ', ' + l2 + ', ' + l3);
  switch(target_id) {
    case "#acquired": friendly_name = "Acquired Skills"; break;
    case "#planned": friendly_name = "Planned Skills"; break;
  }

  if (l2 > Math.floor(l1 / 2)) {
    errors.push({
      text: 'In ' + friendly_name + ' there are more Intermediate Psionic skills than twice the number of Basic Psionic skills'
    });
  }

  if (l3 > Math.floor(l2 / 2)) {
    errors.push({
      text: 'In ' + friendly_name + ' there are more Advanced Psionic skills than twice the number of Intermediate Psionic skills'
    });
  }

  //console.log(errors);
  return errors;
}

function check_constraints(skills, errors) {
  $.each(skills, function(i, skill) {
    var s_error = check_prerequisite(skills, skill);
    errors = errors.concat(s_error);
  })

  $('#error-list').empty();

  if (errors.length > 0) {
    $('#error-placeholder')
      .text($('#error-placeholder').attr('data-placeholder'));

    $('#error-log').css('display', 'block');
  } else {
    $('#error-placeholder').text('');
    $('#error-log').css('display', 'none');
  }

  $.each(errors, function(i, x) {
    var is_fixable = x.data == undefined ? false : true;
    var li = $('<a></a>').append(x.text);

    if (is_fixable) {
      li.attr('href', '#')
        .attr('target-skill', x.data)
        .addClass('list-group-item list-group-item-warning')
    } else {
      li.addClass('list-group-item list-group-item-danger');
    }

    if (x.data != undefined) {
      li.on('click', function() {
        var target_skill = $(this).attr('target-skill');
        manual_relocate_skills('acquired', target_skill);
        $(this).remove();
      })
    }

    $('#error-list').append(li);
  })

  // $('#error-log').text('');
  // $('#error-log').html(errors.join('<br />'));
}

function check_prerequisite(skills, skill) {
  var global_satisfaction = false;
  var errors = new Array();
  var innate_preq_analyzed = false;

  augmented_professions = (selected_professions || new Array()).concat(' - ');

  $.each(augmented_professions, function(i, profession) {
    var strain_skill = skill_cat[skill][profession];

    var local_satisfaction = false;

    if (strain_skill != null) {
      if (strain_skill.preq != null) {
        var predicate = strain_skill.preq.predicate;
        var lists = strain_skill.preq.list;
        local_satisfaction = check_complex_constraint(predicate, lists, skills, skill, profession, errors);
      } else {
        local_satisfaction = true;
      }
    } else if (!innate_preq_analyzed) {

      var innates = skill_cat[skill].innate;
      var innates_preq = skill_cat[skill].innate_preq;

      if (innates == undefined) { return; }
      if (innates.indexOf(selected_strain) != -1) {
        if (innates_preq != null) {
          var strain_preq = innates_preq[selected_strain];

          if (strain_preq != null) {
            var predicate = strain_preq.predicate;
            var lists = strain_preq.list;

            local_satisfaction = check_complex_constraint(predicate, lists, skills, skill, null, errors)
          } else {
            local_satisfaction = true;
          }
        } else {
          local_satisfaction = true;
        }
      }

      innate_preq_analyzed = true;
    }

    global_satisfaction = global_satisfaction || local_satisfaction;
  });
  
  if (!global_satisfaction) {
    return errors;
  }

  return new Array();
}

function check_complex_constraint(predicate, lists, skills, skill, profession, errors) {
  var sub_satisfaction;
  profession = profession || 'innate';

  if (predicate == 'and') {
    sub_satisfaction = true;
    $.each(lists, function(x, _junk) {
      if (skills.indexOf(x) == -1) {
        errors.push({
          text: skill + ' (' + profession + ') needs ' + x,
          data: x
        });
        sub_satisfaction = false;
        //return false;
      }
    })
  } else if (predicate == 'or') {
    sub_satisfaction = false;
    $.each(lists, function(x, _junk) {
      if (skills.indexOf(x) != -1) {
        sub_satisfaction = true;
        
        return false;
      } else {
        errors.push({
          text: skill + ' (' + profession + ') needs ' + x,
          data: x
        });
      }
    })
  }

  return sub_satisfaction;
}