function update_xp_count(element_id) {
  var xp_element = $(element_id + '-xp');
  var list = $(element_id + '-list').children('li');

  var count = 0;
  $.each(list, function() {
    if ($(this).find('.badge').text().trim().length > 0) {

      count += parseInt($(this).find('.badge').text());
    }
  })
  xp_element.text(count);
}

function replan() {
  replan_list('#acquired-list');
  replan_list('#planned-list');
  update_xp_count('#planned');
  update_xp_count('#acquired');

  update_availability();
  generate_constraints();
}

function replan_list(target_id) {
  $(target_id).children('li').each(function() {
    var that = $(this);
    var skill_label = that.attr('skill-name');

    if (that.hasClass('faded')) {
      append_lexicographically('#graphical-list', that);
      //that.removeAttr('popover-applied');
      reset_popover(that);
      rebuild_popover(that);

      // var cloned = that.clone();
      // cloned.removeAttr('popover-applied');
      // //rebuild_popover(cloned);
      // cloned.addClass('invalid');
      // cloned.find('.skill-label')
      //         .addClass('text-danger')
      //         .css('text-decoration', 'line-through');

      // if (cloned.find('.removable').length == 0) {
      //   cloned.append('<span class="removable pull-right">Remove</span>');
      //   cloned.find('.removable').on('click', function() {
      //     $(this).parent().remove();
      //   })
      // }
      // cloned.popover();
      // append_lexicographically(target_id, cloned);
    }

    // if (that.hasClass('invalid')) {
    //   if (is_valid_skill(skill_label)) {
    //     // that.find('.skill-label')
    //     //       .removeClass('text-danger')
    //     //       .css('text-decoration', 'none')
    //     //       .addClass('faded');
    //     // $('#graphical-list').find('[skill-name="' + skill_label + '"]').remove();
    //     // that.find('.removable').remove();
    //     // that.removeAttr('popover-applied');

    //     that.remove();
    //     var s = $('#graphical-list').find('[skill-name="' + skill_label + '"]');
    //     s.removeAttr('popover-applied');
    //     append_lexicographically(target_id, s);
    //   }
    // }
  })
}

function is_valid_skill(skill_name) {
  return !$('[skill-name="' + skill_name + '"]').hasClass('faded');
}

function resize_graphical() {
  var target_max_height = $(window).height() - $('#setup').height();
  $('#graphical').css('max-height', target_max_height);
  $('#builder').css('max-height', target_max_height);
}

$(function() {
  $(window).resize(resize_graphical);
  //resize_graphical();

  attach_drop_functor('acquired');
  attach_drop_functor('planned');
  attach_drop_functor('graphical');

  attach_tappable_drop('acquired');
  attach_tappable_drop('planned');
  attach_tappable_drop('graphical');
});