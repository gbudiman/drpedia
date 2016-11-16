function attach_drag_functor() {
  $('.skill-draggable').draggable({
    drag: function(event, ui) {},
    start: function(event, ui) {},
    stop: function(event, ui) {},
  });

  $('.skill-draggable').on('dragstart', function(event, ui) {
    //$(this).css('z-index', 100);
    if ($(this).hasClass('faded')) {
      return false;
    }
    
    $('.popover').hide();

    $('.skill-draggable')
      .css('z-index', -10);

    $('.skill-droppable')
      .css('border', '1px solid #388038')
      //.css('background-color', '#ddffdd')
      .css('overflow-y', 'visible')
      .css('z-index', -10);

    $(this).css('z-index', 1000);
  })

  $('.skill-draggable').on('dragstop', function(event, ui) {
    $(this).css('left', '')
           .css('top', '');

    $('.skill-draggable')
      .css('z-index', '');

    $('.skill-droppable')
      .css('border', '1px solid #ddd')
      .css('background-color', '')
      .css('z-index', '');

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
      var target_size = $(list_id).css('width');

      append_lexicographically(list_id, dragged_object);
      update_xp_count('#planned');
      update_xp_count('#acquired');

      dragged_object
        .css('width', '')
        .css('z-index', '');

      $('.skill-droppable')
        .css('overflow-y', 'auto');

      $('.popover').hide();
    }
  })
}

function update_xp_count(element_id) {
  var xp_element = $(element_id).find('.builder-header').find('.badge');
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
}

function replan_list(target_id) {
  $(target_id).children('li').each(function() {
    var that = $(this);
    var skill_label = that.attr('skill-name');

    //console.log(that.attr('skill-name') + ' | ' + that.hasClass('faded'));
    if (that.hasClass('faded')) {
      var cloned = that.clone();
      append_lexicographically('#graphical-list', cloned);
      cloned.css('width', $('#graphical-list').css('width'));

      that.addClass('invalid');
      that.find('.skill-label')
            .addClass('text-danger')
            .css('text-decoration', 'line-through');
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

$(function() {
  //$('#acquired').resizable();
  //$('#planned').resizable();

  $('#acquired').css('marginTop', ($(window).scrollTop() + 96) + 'px');

  $(window).scroll(function() {
    $('#acquired')
      .stop()
      .animate({'marginTop': ($(window).scrollTop() + 96) + 'px'}, 0);
  });

  attach_drop_functor('acquired');
  attach_drop_functor('planned');
  attach_drop_functor('graphical');
});