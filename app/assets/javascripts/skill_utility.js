function generate_constraints() {
  var skills = get_skills_in_builder();
  var errors = new Array();
  errors = errors.concat(check_psion_constraints('#acquired'));
  errors = errors.concat(check_psion_constraints('#planned'));
  check_constraints(skills, errors);
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
    errors.push('In ' + friendly_name + ' there are more Intermediate Psionic skills than twice the number of Basic Psionic skills');
  }

  if (l3 > Math.floor(l2 / 2)) {
    errors.push('In ' + friendly_name + ' there are more Advanced Psionic skills than twice the number of Intermediate Psionic skills');
  }

  //console.log(errors);
  return errors;
}

function check_constraints(skills, errors) {
  $.each(skills, function(i, skill) {
    var s_error = check_prerequisite(skills, skill);
    errors = errors.concat(s_error);
  })

  console.log(errors);
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
    var li = $('<a></a>')
      .attr('href', '#')
      .attr('target-skill', x.data)
      .addClass('list-group-item list-group-item-warning')
      .append(x.text);

    li.on('click', function() {
      var target_skill = $(this).attr('target-skill');
      manual_relocate_skills('acquired-list', target_skill);
      $(this).remove();
    })

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