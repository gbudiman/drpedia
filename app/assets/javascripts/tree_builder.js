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
    onChange: function(option, checked) {
      var selected_options = $('#profession-selector option:selected');
      if (selected_options.length >= 3) {
        var non_selected_options = $('#profession-selector option').filter(function() {
          return !$(this).is(':selected');
        })

        non_selected_options.each(function() {
          var input = $('input[value="' + $(this).val() + '"]');
          input.prop('disabled', true);
          input.parent().addClass('text-muted');
        })
      } else {
        $('#profession-selector option').each(function() {
          var input = $('input[value="' + $(this).val() + '"]');
          input.prop('disabled', false);
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
    var t = $('<li></li>')
              .addClass('list-group-item disabled')
              .attr('skill_name', skill_name)
              .append(skill_name);
    s.append(t);
  })

  $('div#graphical').append(s);
  recalculate();
};

function recalculate() {
  var detect_has_innate = function(data) {
    return data.innate.indexOf(selected_strain) != -1;
  }

  var detect_is_open_skill = function(data) {
    return data.open != undefined;
  }

  var detect_is_profession_skill = function(data) {
    var is_available = false;

    $.each(selected_professions, function(index, profession) {
      if (data[profession] != undefined) {
        is_available = is_available || true;
      }
    });

    return is_available;
  }

  var detect_available_skill = function(skill_name, data) {
    var is_available = false;
    
    is_available = is_available || detect_is_profession_skill(data);
    is_available = is_available || detect_has_innate(data);
    is_available = is_available || detect_is_open_skill(data);

    if (is_available) {
      $('[skill_name="' + skill_name + '"]').removeClass('disabled');
    } else {
      $('[skill_name="' + skill_name + '"]').addClass('disabled');
    }
  };

  $.each(skill_cat, function(skill_name, skill_data) {
    detect_available_skill(skill_name, skill_data);
  });
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
});

