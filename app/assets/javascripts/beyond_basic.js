var advanced_profession_struct = new Object();
var advanced_profession_min_xp = new Object();

function build_advanced_profession() {
  return new Promise(
    function(resolve, reject) {
      $.each(professions_advanced, function(key, raw) {
        advanced_profession_struct[key] = new SParser(raw);
      })

      render_advanced_profession().then(function() {
        resolve();
      });
    }
  )
}

function render_advanced_profession() {
  return new Promise(
    function(resolve, reject) {
      $.each(advanced_profession_struct, function(name, _junk) {
        var t = $('<div></div>')
                  .addClass('adv-requirement')
                  .hide()
                  .append('Requirement here');

        var s = $('<li></li>')
                  .addClass('list-group-item')
                  .addClass('faded')
                  .addClass('clickable-advanced')
                  .addClass('col-xs-12 col-md-6 col-lg-4')
                  .attr('p-adv', name)
                  .append(name)
                  .append(t)
                  .append($('<button></button>')
                            .append('Select')
                            .attr('ap-name', name)
                            .addClass('btn btn-primary btn-xs pull-right btn-advanced-profession')
                            .on('click', function() {
                              $('.btn-advanced-profession').prop('disabled', false).text('Select');
                              $(this)
                                .prop('disabled', true)
                                .text('Selected')

                              $('#profession-selector').multiselect('select', name, true);

                              return false;
                            }))
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

      resolve();
    }
  )
}

function update_beyond_basic() {
  var disable_selected_advanced_profession = function() {
    $.each(selected_professions, function(i, x) {
      $('.btn-advanced-profession[ap-name="' + x + '"]')
        .text('Selected')
        .prop('disabled', true);
    })
  }

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
  disable_selected_advanced_profession();
}

function enable_ap_select_button(name, value) {
  var o = $('button[ap-name="' + name + '"]');

  if (value) {
    o.prop('disabled', false).text('Select');
  } else {
    o.prop('disabled', true).text('Selected');
  }
}

function enable_all_ap_select_buttons(value) {
  var o = $('button[ap-name]');

  if (value) {
    o.prop('disabled', false).text('Select');
  } else {
    o.prop('disabled', true).text('Selected');
  }
}

function compute_advanced_profession_constraints(ag) {
  var enable_advanced_profession_selector = function(name, value) {
    var o = $('#setup-profession input[value="' + name + '"]');

    if (value == false) {
      // disable
      o.prop('disabled', true);
      if (o.prop('checked')) {
        console.log(name + ' has been deselected due to unmet constraint');
        $('#profession-selector').multiselect('deselect', name, true);
      }

      if (!o.parent().hasClass('text-muted')) {
        o.parent().addClass('text-muted');
      }
    } else {
      o.prop('disabled', false)
       .parent().removeClass('text-muted');
    }
  }

  $.each(advanced_profession_struct, function(name, obj) {
    var s = obj.test(ag);
    var target = $('#advanced-list [p-adv="' + name + '"]');

    if (s.result) {
      target
        .removeClass('faded')
        .find('.btn-advanced-profession').show();

      enable_advanced_profession_selector(name, true);
    } else {
      enable_ap_select_button(name, true);
      target
        .addClass('faded')
        .find('.btn-advanced-profession').hide();

      enable_advanced_profession_selector(name, false);
    }
    
    web_display_human_readable_result(s, target.find('.adv-requirement'), name);
  });
}

function web_display_human_readable_result(s, target, name) {
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
          s += 'Strain: '; 
          s += highlight_in_list(composite.condition.slice(1), context.conditions.strain);
          break;
        case 'xp_sum': 
          // buffer minimum XP to check when XP drops below minimum requirement
          advanced_profession_min_xp[name] = parseInt(composite.condition[1])
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

  target.html(display.join('<br />'))
}

function alert_xp_dropping(enable, value) {
  if (enable) {
    $('#advanced-xp-drop').show();
    $('#advanced-xp-drop-name').text(selected_advanced_profession);
    $('#advanced-xp-drop-amount').text(value);
    $('#advanced-xp-drop-total').text((value + 10));
  } else {
    $('#advanced-xp-drop').hide();
  }
}

function calculate_xp_sum() {
  var xp = parseInt($('#xp-total').text());
  if (selected_advanced_profession != undefined) {
    var min_xp = advanced_profession_min_xp[selected_advanced_profession];

    if (min_xp != undefined) {
      if (xp < (min_xp + 10)) {
        alert_xp_dropping(true, min_xp);
      } else {
        alert_xp_dropping(false);
      }
    } else {
      alert_xp_dropping(false);
    }
  }
  return xp;
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

$(function() {
  $('#advanced-expand-all').on('click', function() {
    return new Promise(
      function(resolve, reject) {
        $('div.adv-requirement').show();
        resolve();
      }
    );
  })

  $('#advanced-collapse-all').on('click', function() {
    return new Promise(
      function(resolve, reject) {
        $('div.adv-requirement').hide();
        resolve();
      }
    )
  })

  $('#advanced-expand-accessible').on('click', function() {
    return new Promise(
      function(resolve, reject) {
        $('li.clickable-advanced').each(function() {
          var adv = $(this).find('.adv-requirement');

          if (!$(this).hasClass('faded')) {
            adv.show();
          } else {
            adv.hide();
          }
        })
      }
    )
  })
})