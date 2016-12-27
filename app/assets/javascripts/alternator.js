Array.prototype.mix_min = function() { 
  var min = 999;

  this.forEach(function(element) {
    if (element == '[x2]') {

    } else {
      if (element < min) {
        min = element;
      }
    }
  })
  

  return min;
}

Array.prototype.uniquify_and_sort = function() {
  var n = {};
  var s = new Array();
  var flag_multiplier = false;

  this.forEach(function(element) {
    if (element == '[x2]') { 
      flag_multiplier = true; 
    } else if (n[element] == undefined) {
      n[element] = true;
      s.push(element);
    }
  })

  if (flag_multiplier) {
    var min = s.mix_min() * 2;
    if (n[min] == undefined) {
      s.push(min);
    }
  }

  return s.sort(function(a, b) { return a - b; });
}

Array.prototype.rotate_left_and_peek = function() {
  var shift = this.shift();
  this.push(shift);

  return shift;
}

function attach_alternator(o) {
  if (o.attr('data-alternator') == undefined) {
    var skill_name = o.parent().attr('skill-name');
    var x = pull_skill_cat_data(skill_name, 0, 'array').uniquify_and_sort();
    console.log(x);
    var min = x[0];
    //x.rotate_left_and_peek();
    o.attr('data-alternator', JSON.stringify(x));
    o.attr('data-min', min);

    o.off('click').on('click', function() {
      var parent_id = $(this).parent().parent().attr('id');
      var alternator = JSON.parse($(this).attr('data-alternator'));
      //var new_val = alternator.rotate_left_and_peek();
      var min = parseInt($(this).attr('data-min'));

      // if (is_desktop_site) {
      //   if (alternator.length == 1) { return; }

      //   $(this).attr('data-alternator', JSON.stringify(alternator));
      //   $(this).html(new_val + (new_val == min ? '' : '<sup>+</sup>'));
      //   update_xp_count('#' + parent_id.split('-')[0]);

      //   if (parent_id != 'graphical-list') {
      //     if (new_val == min) {
      //       persistence_clear_skill_cost_adjustment(skill_name);
      //     } else {
      //       persistence_set_skill_cost_adjustment(skill_name, new_val);
      //     }
      //   }

      //   return false;
      // } else {
      var alternator = JSON.parse($(this).attr('data-alternator'));
      var current_value = parseInt($(this).text());
      $('.cost-adjustment').remove();

      if (alternator.length == 1) { return; }

      var ajq = new Array();
      $.each(alternator, function(i, x) {
        if (x == current_value) { return true; }
        if (x == '[x2]') {
          x = min * 2;
        }
        ajq.push($('<button></button>')
                   .attr('type', 'button')
                   .attr('data-adjust', x)
                   .addClass('btn btn-xs btn-primary btn-adjust')
                   .append(x)
                   .prop('outerHTML'));
      });


      $(this).before($('<span></span>')
                       .addClass('pull-right cost-adjustment')
                       .append(' &nbsp;< ')
                       .append(ajq.join(' / '))
                       .append(' > '));

      $(this).parent().find('[data-adjust]').each(function() {
        $(this).on('click', function() {
          var val = parseInt($(this).attr('data-adjust'));
          $(this).parent().parent()
            .find('.badge')
              .html(val + (val == min ? '' : '<sup>+</sup>'));

          $('.cost-adjustment').remove();
          update_xp_count('#' + parent_id.split('-')[0]);

          if (parent_id != 'graphical-list') {
            if (val == min) {
              persistence_clear_skill_cost_adjustment(skill_name);
            } else {
              persistence_set_skill_cost_adjustment(skill_name, val);
            }

            update_beyond_basic();
          }

          return false;
        })
      })

      return false;
    //}
    })

    o.trigger('click');
  }
}

function update_all_alternators() {
  $('.skill-cost-badge')
    .removeAttr('data-alternator')
    .off('click').on('click', function() {
      attach_alternator($(this));
    });
}