var strains;
var professions;
var skill_cat;

var selected_strain;
var selected_professions;

var generate_strains_select_box = function() {
  var s = $('<select></select>')
            .attr('id', 'strain-selector');

  $.each(strains, function(index, value) {
    var t = $('<option></option>')
              .attr('strain', value);
    t.append(value);
    s.append(t);
  })

  $('#setup-strain').append(s);
  $('#strain-selector').multiselect({
    buttonWidth: '100%'
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
    onChange: function(option, checked) {
      var selected_options = $('#profession-selector option:selected');

      console.log(selected_options.length);
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
    }
  })
};

var generate_skill_cat = function() {
  var skills = Object.keys(skill_cat);
  skills.sort();

  var s = $('<ul></ul>')
            .addClass('list-group');

  var n = 0;
  $.each(skills, function(index, skill_name) {
    var t = $('<li></li>').addClass('list-group-item').append(skill_name);
    s.append(t);
    n += 1;

    if (n > 3) {
      return false;
    }
  })

  $('div#graphical').append(s);
};

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

