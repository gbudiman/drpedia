function generate_constraints() {
  var skills = get_skills_in_builder();
  check_constraints(skills);
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

function check_constraints(skills) {
  var errors = new Array();
  

  $.each(skills, function(i, skill) {
    var s_error = check_prerequisite(skills, skill);
    errors = errors.concat(s_error);
  })

  $('#error-log').text('');
  $('#error-log').html(errors.join('<br />'));
}

function check_prerequisite(skills, skill) {
  var global_satisfaction = false;
  var errors = new Array();

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
    } else {
      var innates = skill_cat[skill].innate;
      var innates_preq = skill_cat[skill].innate_preq;

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
        errors.push(skill + ' (' + profession + ') needs ' + x);
        sub_satisfaction = false;
        //return false;
      }
    })
  } else if (predicate == 'or') {
    sub_satisfaction = false;
    $.each(lists, function(x, _junk) {
      if (skills.indexOf(x) != -1) {
        sub_satisfaction = true;
        errors.push(skill + ' (' + profession + ') needs ' + x);
        return false;
      }
    })
  }

  return sub_satisfaction;
}