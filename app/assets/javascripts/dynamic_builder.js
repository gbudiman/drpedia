function attach_drag_functor() {
  $('.skill-draggable').draggable({
    scroll: false,
    appendTo: 'body',
    helper: 'clone',
    opacity: 0.8
  });

  $('.skill-draggable').on('dragstart', function(event, ui) {
    if ($(this).hasClass('faded')) {
      return false;
    }


    $('.ui-draggable-dragging').css('width', $(this).css('width'));
    $('.popover').hide();


    $('.skill-droppable')
      .css('border', '1px solid #388038')
      .css('background-color', '#ddffdd');
  })

  $('.skill-draggable').on('dragstop', function(event, ui) {
    $(this).css('left', '')
           .css('top', '');


    $('.skill-droppable')
      .css('border', '1px solid #ddd')
      .css('background-color', '');

    $('.popover').hide();
  })
}

function attach_drop_functor(_element_id) {
  var element_id = '#' + _element_id;
  var list_id = element_id + '-list';
  
  $(element_id).droppable({
    drop: function(event, ui) {
      event.preventDefault();
      var dragged_object = ui.draggable;

      append_lexicographically(list_id, dragged_object);
      update_xp_count('#planned');
      update_xp_count('#acquired');
      generate_constraints();

      dragged_object
        .css('width', '')
        //.css('z-index', '');

      $('.skill-droppable')
        .css('overflow-y', 'auto')
        //.css('z-index', '');

      //$('#graphical').css('overflow', 'auto');
      $('.popover').hide();
    }
  })
}

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

function append_lexicographically(list_id, dragged_object) {
  var seek_skill_name = dragged_object.attr('skill-name');
  var appended = false;
  //console.log(seek_skill_name);
  $(list_id).children('li').each(function() {
    var iterated_skill_name = $(this).attr('skill-name');
    var s_compare = seek_skill_name.localeCompare(iterated_skill_name);

    //console.log('comparing ' + seek_skill_name + ' | ' + iterated_skill_name + ' = ' + s_compare);

    if (s_compare == -1) {
      dragged_object.insertBefore($(this));
      appended = true;
      return false;
    }
    // console.log($(this).attr('skill-name'));
  })

  if (!appended) {
    $(list_id).append(dragged_object);
  }
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
      var cloned = that.clone(true, true);
      that.parent().append(cloned);
      append_lexicographically(target_id, cloned);
      append_lexicographically('#graphical-list', that);

      cloned.addClass('invalid');
      cloned.find('.skill-label')
              .addClass('text-danger')
              .css('text-decoration', 'line-through');
      cloned.append('<span class="removable pull-right">Remove</span>');
      cloned.find('.removable').on('click', function() {
        $(this).parent().remove();
      })
    }

    if (that.hasClass('invalid')) {
      if (is_valid_skill(skill_label)) {
        that.find('.skill-label')
              .removeClass('text-danger')
              .css('text-decoration', 'none')
              .addClass('faded');
        $('#graphical-list').find('[skill-name="' + skill_label + '"]').remove();
      }
    }
  })
}

function is_valid_skill(skill_name) {
  return !$('[skill-name="' + skill_name + '"]').hasClass('faded');
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
});