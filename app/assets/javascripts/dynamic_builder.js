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

      var cloned = that.clone(true, true);

      cloned.addClass('invalid');
      cloned.find('.skill-label')
              .addClass('text-danger')
              .css('text-decoration', 'line-through');

      if (cloned.find('.removable').length == 0) {
        cloned.append('<span class="removable pull-right">Remove</span>');
        cloned.find('.removable').on('click', function() {
          $(this).parent().remove();
        })
      }
      cloned.popover();
      append_lexicographically(target_id, cloned);
    }

    if (that.hasClass('invalid')) {
      if (is_valid_skill(skill_label)) {
        that.find('.skill-label')
              .removeClass('text-danger')
              .css('text-decoration', 'none')
              .addClass('faded');
        $('#graphical-list').find('[skill-name="' + skill_label + '"]').remove();
        that.find('.removable').remove();
      }
    }
  })
}

function is_valid_skill(skill_name) {
  return !$('[skill-name="' + skill_name + '"]').hasClass('faded');
}

function attach_tappable_drop(id) {
  $('#' + id).on('click', function() {
    var list_id = '#' + id + '-list';

    if (is_desktop_site) { return; }

    if ($(this).hasClass('drop-simulable')) {
      $('.drag-simulable').each(function() {
        append_lexicographically(list_id, $(this));
      })

      highlight_droppable_regions(false);
      $('.drag-simulable').removeClass('drag-simulable');
      update_xp_count('#planned');
      update_xp_count('#acquired');
      generate_constraints();
    }
  })
}

function resize_graphical() {
  var target_max_height = $(window).height() - $('#setup').height() - 32;
  $('#graphical').css('max-height', target_max_height);
  $('#builder').css('max-height', target_max_height);
}

$(function() {
  $(window).resize(resize_graphical);
  resize_graphical();

  attach_drop_functor('acquired');
  attach_drop_functor('planned');
  attach_drop_functor('graphical');

  attach_tappable_drop('acquired');
  attach_tappable_drop('planned');
  attach_tappable_drop('graphical');
});