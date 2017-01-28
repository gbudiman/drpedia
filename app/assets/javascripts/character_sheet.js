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
    _data.infection_reduction = parseInt($('#ip-reduction').text());
    _data.infection_total = parseInt($('#ip-total').text());
    _data.xp_profession = parseInt($('#profession-xp').text());
    _data.xp_skills = parseInt($('#acquired-xp').text()) + parseInt($('#planned-xp').text());
    _data.xp_total = parseInt($('#xp-total').text());
    _data.profile_name = $('#profile-text').attr('profile');
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

  var skill_row_maker = function(name, mp, xp) {
    return '<tr>'
         +   '<td>' + name + '</td>'
         +   '<td class="align-right">' + mp + '</td>'
         +   '<td class="align-right">' + xp + '</td>'
         + '</tr>';
  }

  var two_col_row = function(a, b) {
    return '<tr>'
         +   '<td>' + a + '</td>'
         +   '<td>' + b + '</td>'
         + '</tr>';
  }

  var write_xp_usage = function() {
    s = two_col_row('XP - stats', _data.hp_addition + _data.mp_addition)
      + two_col_row('XP - skills', _data.xp_skills)
      + two_col_row('XP - professions', _data.xp_profession)
      + two_col_row('XP - total', _data.xp_total);

    $('#cs-profs').append(s);
  }

  var write_skill_pool = function() {
    var n, l;

    $.each(_data.skills['graphical'], function(name, d) {
      if (name.match(/^Lore - /)) {
        l += skill_row_maker(name, d.mp, d.xp);
      } else {
        n += skill_row_maker(name, d.mp, d.xp);
      }
    })

    $('#cs-graphical').append(n);
    $('#cs-lores').append(l);
  }

  var write_skills = function(source, target) {
    var s;

    $.each(_data.skills[source], function(name, d) {
      s += skill_row_maker(name, d.mp, d.xp);
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

  var write_character_name = function() {
    $('#cs-profs').append(two_col_row('Name', _data.profile_name));
  }

  var write_timestamp = function() {
    $('#cs-profs').append(two_col_row('Date', new Date().toLocaleDateString()));
  }

  var write = function() {
    $('#cs-stat-hp-base').text(_data.hp_base);
    $('#cs-stat-hp-addition').text(_data.hp_addition);
    $('#cs-stat-hp-total').text(_data.hp_total);
    $('#cs-stat-mp-base').text(_data.mp_base);
    $('#cs-stat-mp-addition').text(_data.mp_addition);
    $('#cs-stat-mp-total').text(_data.mp_total);
    $('#cs-stat-ip-base').text(_data.infection);
    $('#cs-stat-ip-reduction').text(_data.infection_reduction * -1);
    $('#cs-stat-ip-total').text(_data.infection_total);

    $('#cs-acquired').find('tbody').empty();
    $('#cs-planned').find('tbody').empty();
    $('#cs-graphical').find('tbody').empty();
    $('#cs-profs').find('tbody').empty();
    $('#cs-lores').find('tbody').empty();
    
    write_skills('innate', 'cs-acquired');
    write_skills('acquired', 'cs-acquired');
    write_skills('planned', 'cs-planned');
    write_skill_pool();
    write_timestamp();
    write_character_name();
    write_strain();
    write_professions();
    write_xp_usage();
  }

  return {
    generate: generate
  }
})();