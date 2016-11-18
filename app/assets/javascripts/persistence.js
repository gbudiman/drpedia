var skill_list;
var skill_list_inverted;

function pack_state() {
  var pack = (selected_strain || '') + '|' + (selected_professions || new Array()).join(',') + '|';
  var es = extract_skills();

  pack += es.acquired.join(',') + '|' + es.planned.join(',');
  console.log(pack);
  Cookies.set('drpedia', pack);
}

function unpack_state() {
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

      console.log('[' + x + '] => ' + target_object);
      if (target_object) {
        append_lexicographically(target_list_id, target_object);
      }
    })
  }

  var unpack = Cookies.get('drpedia');
  console.log(unpack);

  if (unpack != undefined) {
    var p0 = unpack.split('|');
    var strain = p0[0];

    var professions = p0[1].split(',');
    var acquired_skills = decrypt_skills(p0[2].split(','));
    var planned_skills = decrypt_skills(p0[3].split(','));

    selected_strain = strain;
    selected_professions = professions;
    $('#strain-selector').val(strain).multiselect('refresh');
    $('#profession-selector').val(professions).multiselect('refresh');
    recalculate();
    replan();
    //update_availability();

    relocate('#planned-list', planned_skills);
    relocate('#acquired-list', acquired_skills);
    update_xp_count('#planned');
    update_xp_count('#acquired');
    generate_constraints();
    update_selected_skills(0);

    
  }
}

function extract_skills() {
  var extract_skills_from_region = function(id) {
    var s = new Array();
    $(id + ' .skill-draggable').each(function() {
      if ($(this).hasClass('faded')) { return true; }
      s.push(skill_list[$(this).attr('skill-name')]);
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

  $.when(get_json_strain(), get_json_profession(), get_json_skill_cat()).done(function() {
    $.getJSON('/skill_list.json', function(skill_list_json_data) { 
      skill_list = skill_list_json_data;
      generate_inverted_skills();
      unpack_state();
    });
  })

});