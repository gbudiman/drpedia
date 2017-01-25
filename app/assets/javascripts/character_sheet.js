var character_sheet = (function() {
  var _data;
  var _config;

  var generate_stats = function() {
    _data.hp_base = parseInt($('#hp-base').text());
    _data.hp_addition = parseInt($('#hp-addition').text());
    _data.hp_total = parseInt($('#hp-total').text());
    _data.mp_base = parseInt($('#mp-base').text());
    _data.mp_addition = parseInt($('#mp-addition').text());
    _data.mp_total = parseInt($('#mp-total').text());
    _data.infection = parseInt($('#infection-base').text());
  }

  var generate_skills = function(type) {
    $('#' + type + '-list').find('li[skill-name]').not('.faded').each(function() {
      var that = $(this);
      var skill_name = that.attr('skill-name');
      _data.skills[type][skill_name] = {
        xp: parseInt(that.find('.skill-cost-badge').text().trim()),
        mp: skill_mp_cost.get(skill_name)
      }
    })
  }

  var generate_strain_skills = function() {
    $('#strain-specs').find('span').each(function() {
      _data.skills.innate[$(this).text().trim()] = { xp: 'ns', mp: 0 };
    })
  }

  var generate = function(config) {
    _data = {
      skills: {
        innate: {},
        acquired: {},
        planned: {},
        graphical: {}
      }
    }

    _config = {
      strain: config.selected_strain,
      professions: config.selected_professions
    }

    generate_stats();
    generate_skills('acquired');
    generate_skills('planned');
    generate_skills('graphical');
    generate_strain_skills();

    write();
  }

  var write_skills = function(source, target) {
    var s;

    $.each(_data.skills[source], function(name, d) {
      s += '<tr>'
         +   '<td>' + name + '</td>'
         +   '<td class="align-right">' + d.mp + '</td>'
         +   '<td class="align-right">' + d.xp + '</td>'
         + '</tr>';
    })

    $('#' + target).append(s);
  }

  var write_strain = function() {
    $('#cs-profs').append('<tr><td>Strain</td><td>' + _config.strain + '</td></tr>');
  }

  var write_professions = function() {
    var count = 0;
    $.each(_config.professions, function(i, x) {
      $('#cs-profs').append('<tr><td>Profession ' + ++count + '</td><td>' + x + '</td></tr>');
    })
  }

  var write = function() {
    $('#cs-stat-hp-base').text(_data.hp_base);
    $('#cs-stat-hp-addition').text(_data.hp_addition);
    $('#cs-stat-hp-total').text(_data.hp_total);
    $('#cs-stat-mp-base').text(_data.mp_base);
    $('#cs-stat-mp-addition').text(_data.mp_addition);
    $('#cs-stat-mp-total').text(_data.mp_total);
    $('#cs-stat-ip-base').text(_data.infection);

    $('#cs-acquired').find('tbody').empty();
    $('#cs-planned').find('tbody').empty();
    $('#cs-graphical').find('tbody').empty();
    $('#cs-profs').find('tbody').empty();
    
    write_skills('innate', 'cs-acquired');
    write_skills('acquired', 'cs-acquired');
    write_skills('planned', 'cs-planned');
    write_skills('graphical', 'cs-graphical');
    write_strain();
    write_professions();
  }

  return {
    generate: generate
  }
})();