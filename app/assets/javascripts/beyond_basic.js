var advanced_profession_struct = new Object();

function build_advanced_profession() {
  $.each(professions_advanced, function(key, raw) {
    advanced_profession_struct[key] = new SParser(raw);
  })

  render_advanced_profession();
}

function render_advanced_profession() {
  $.each(advanced_profession_struct, function(name, _junk) {
    var t = $('<div></div>')
              .addClass('adv-requirement')
              .hide()
              .append('Requirement here');

    var s = $('<li></li>')
              .addClass('list-group-item')
              .addClass('faded')
              .addClass('clickable-advanced')
              .addClass('col-xs-12 col-sm-6 col-md-4 col-lg-3')
              .attr('p-adv', name)
              .append(name)
              .append(t)
              .on('click', function() {
                var target = $(this).find('.adv-requirement');

                if (target.is(':hidden')) {
                  target.show();
                } else {
                  target.hide();
                }
              });

    $('#advanced-list').append(s);
  })
}

function update_beyond_basic() {
  var skills = compute_skills();
  var ag = new AgentGirl({
    'xp_sum':               calculate_xp_sum(),
    'hp':                   calculate_hp(),
    'mp':                   calculate_mp(),
    'professions':          selected_professions,
    'strain':               selected_strain,
    'skills':               skills.list,
    'lore_count':           skills.lore_count,
    'psionic_basic':        skills.psionic_basic,
    'psionic_intermediate': skills.psionic_intermediate,
    'psionic_advanced':     skills.psionic_advanced
  })

  console.log('beyond-basic triggered');
  compute_advanced_profession_constraints(ag);
}

function compute_advanced_profession_constraints(ag) {
  $.each(advanced_profession_struct, function(name, obj) {
    var s = obj.test(ag);
    var target = $('#advanced-list [p-adv="' + name + '"]');

    if (s.result) {
      target.removeClass('faded');
    } else {
      target.addClass('faded');
    }
    
    web_display_human_readable_result(s, target.find('.adv-requirement'));
  });
}

function web_display_human_readable_result(s, target) {
  var display = new Array();
  var highlight_in_list = function(list, _highlight) {
    if (_highlight == undefined) {
      return list.join(', ');
    } else {
      var highlight = _highlight;
      if (!Array.isArray(_highlight)) {
        highlight = new Array(_highlight);
      }

      var s = '';
      list.forEach(function(x) {
        if (highlight.indexOf(x) != -1) {
          s += '<span class="bg-success-alt">' + x + '</span>' + ', ';
        } else {
          s += x + ', ';
        }
      })

      return s.slice(0, -2);
    }
  }

  var unroll = function(composite, depth, context, _invert) {
    var invert = _invert == undefined ? false : _invert;

    if (composite.operator != undefined) {
      //console.log('Depth ' + depth + ' << ' + composite.operator.toUpperCase() + ' >>');

      var h = '';
      var s = '';
      switch(composite.operator) {
        case 'and': h = 'All:'; break;
        case 'or':  h = 'Any:'; break;
        case 'not': h = 'None:'; break;
      }

      s = Array((depth) * 4).join('&nbsp;') + (composite.result ? '✓ ' : '✗ ') + h;
      if (composite.result) {
        display.push('<span class="text-success">' + s + '</span>');
        //console.log(s);
      } else {
        display.push('<span class="text-danger">' + s + '</span>');
        //console.log(s);
      }

      composite.data.forEach(function(x) {
        unroll(x, depth + 1, context, composite.operator == 'not' ? true : false);
      })
      
    } else {
      //console.log('Depth ' + depth + ': ');
      //console.log(composite);

      var s = '';
      var p = composite.result ? '✓ ' : '✗ ';
      var h = '';
      switch(composite.condition[0]) {
        case 'p': 
          s += 'Profession: '; 
          s += highlight_in_list(composite.condition.slice(1), context.conditions.professions);
          break;
        case 'k': 
          s += 'Skill: '; 
          s += highlight_in_list(composite.condition.slice(1), context.conditions.skills);
          break;
        case 's': 
          //console.log(composite.condition);
          //console.log(new Array(context.conditions));
          s += 'Strain: '; 
          s += highlight_in_list(composite.condition.slice(1), context.conditions.strain);
          break;
        case 'xp_sum': 
          s += 'XP >= '; 
          s += composite.condition[1];
          break;
        case 'stat_sum':
          switch(composite.condition[1]) {
            case 'hp_or_mp': s += 'HP/MP >= '; break;
            case 'hp': s += 'HP >= '; break;
            case 'mp': s += 'MP >= '; break;
          }

          s += composite.condition[2];
          break;
        case 'lore_type':
          s += 'Lore skills count >= ';
          s += composite.condition[1];
          break;
        case 'psionic_type':
          switch(composite.condition[1]) {
            case 'basic': s += 'Basic Psionic skills >= '; break;
            case 'intermediate': s += 'Intermediate Psionic skills >= '; break;
            case 'advanced': s += 'Advanced Psionic skills >= '; break;
          }
          s += composite.condition[2];
          break;
      }

      s = Array(depth * 4).join('&nbsp') + p + s;// + composite.condition.slice(1).join(', ');

      if (invert) {
        composite.result = !composite.result;
      }

      if (composite.result) {
        display.push('<span class="text-success">' + s + '</span>');
        //console.log(s);  
      } else {
        display.push('<span class="text-danger">' + s + '</span>');
        //console.log(s);
      }
      
    }
  }

  //console.log(util.inspect(this.logical_trees, { showHidden: false, depth: null }));

  //var that = s;
  s.logical_trees.forEach(function(x) {
    unroll(x, 0, s);
  });

  target.html(display.join('<br />'));
}

function calculate_xp_sum() {
  return parseInt($('#hp-addition').text())
       + parseInt($('#mp-addition').text())
       + parseInt($('#profession-xp').text())
       + parseInt($('#acquired-xp').text())
       + parseInt($('#planned-xp').text());
}

function calculate_hp() {
  return parseInt($('#hp-total').text());
}

function calculate_mp() {
  return parseInt($('#mp-total').text());
}

function compute_skills() {
  var es = extract_skills();
  var encoded = es.planned.concat(es.acquired);
  var count_lore = 0;
  var count_psi_basic = 0;
  var count_psi_intermediate = 0;
  var count_psi_advanced = 0;

  var skills = new Array();
  $.each(encoded, function(i, x) {
    var decoded_skill = skill_list_inverted[x];
    skills.push(decoded_skill);

    if (skill_list_special_group[decoded_skill] != undefined) {
      var skill_group = skill_list_special_group[decoded_skill];
      switch(skill_group) {
        case 'Lore': count_lore++; break;
        case 'Psionic Skill - Basic': count_psi_basic++; break;
        case 'Psionic Skill - Intermediate': count_psi_intermediate++; break;
        case 'Psionic Skill - Advanced': count_psi_advanced++; break;
      }
    }
  })

  return {
    list: skills,
    lore_count: count_lore,
    psionic_basic: count_psi_basic,
    psionic_intermediate: count_psi_intermediate,
    psionic_advanced: count_psi_advanced
  };
}