var is_desktop_site = false;

function attach_drag_functor(selement) {
  if (selement == undefined) { return; }
  if (selement == 'all') {
    selement = $('.skill-draggable');
  }
  var is_currently_draggable = function() {
    return selement.find('.draggable-visual').length > 0;
  }

  var is_valid_draggable_skill = function() {
    return !selement.hasClass('faded');
  }

  var get_parent_id_of_clicked_object = function(obj) {
    return obj.parent().parent().attr('id');
  }

  var get_parent_object_of_clicked_object = function(obj) {
    return $('#' + get_parent_id_of_clicked_object(obj));
  }

  if (!is_desktop_site) {
    var sim_class = 'drag-simulable';
    //disable_drag('all');

    if (get_parent_object_of_clicked_object(selement).hasClass('drop-simulable')) {
      return;
    }

    if (selement.hasClass(sim_class)) {
      selement.removeClass(sim_class);
    } else {
      if (is_valid_draggable_skill()) {
        selement.addClass(sim_class);
      }
    }

    if ($('.drag-simulable').length > 0) {
      highlight_droppable_regions(true, get_parent_id_of_clicked_object(selement));
    } else {
      highlight_droppable_regions(false);
    }
    
    return;
  } 

  selement.draggable({
    scroll: false,
    appendTo: 'body',
    helper: 'clone',
    opacity: 0.8
  });

  selement.draggable('enable');

  selement.on('dragstart', function(event, ui) {
    if ($(this).hasClass('faded')) {
      return false;
    }
    $('.ui-draggable-dragging').css('width', $(this).css('width'));
    highlight_droppable_regions(true, get_parent_id_of_clicked_object(selement));
    
  })

  selement.on('dragstop', function(event, ui) {
    $('.ui-draggable-dragging').css('width', $(this).css('width'));
    highlight_droppable_regions(false);
  })
}

function highlight_droppable_regions(enable, clicked_from) {
  if (enable) {
    var class_const = new Array('graphical', 'planned', 'acquired');
    var class_exec = new Array();

    $.each(class_const, function(i, x) {
      if (clicked_from != x) {
        class_exec.push(x);
      }
    });

    
    disable_popover();

    $.each(class_exec, function(i, x) {
      if (x == 'graphical') {
        $('#' + x)
          .css('background-color', '#ddffdd');
      } else {
        $('#' + x)
          .css('border', '1px solid #388038')
          .css('background-color', '#ddffdd');
        
      }

      $('#' + x + ' .skill-draggable').css('opacity', 0.5);
      $('#' + x).addClass('drop-simulable');
    })
    
  } else {
    $(this).css('left', '')
           .css('top', '');


    $('.skill-droppable')
      .css('border', '1px solid #ddd')
      .css('background-color', '');

    $('#graphical').css('background-color', '');
    $('.skill-draggable').css('opacity', 1);
    $('.drop-simulable').removeClass('drop-simulable');

    disable_popover();
  }
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
        .css('width', '');

      reset_popover(dragged_object);
      rebuild_popover(dragged_object);

      // $('.skill-droppable')
      //   .css('overflow-y', 'auto')
        //.css('z-index', '');

      //$('#graphical').css('overflow', 'auto');
      disable_popover();
      //disable_drag(dragged_object);
    }
  })
}

function append_lexicographically(list_id, dragged_object) {
  var seek_skill_name = dragged_object.attr('skill-name');
  var appended = false;
  //console.log(seek_skill_name);
  if ($(list_id).find('[skill-name="' + seek_skill_name + '"]').length > 0) { return; }

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

function disable_drag(selement) {
  if (selement == 'all') {
    $('.skill-draggable').draggable('disable');
    // $('.draggable-visual').each(function() {
    //   $(this).parent().draggable('disable');
    //   $(this).remove();
    // })
  } else {
    if (is_desktop_site) { return; }
    selement.draggable('disable');
    selement.find('.draggable-visual').remove();
  }
}

function detect_touch_device() {
  var touch_device = ('ontouchstart' in document.documentElement);
  is_desktop_site = !touch_device;
  update_touch_option();
  //console.log(touch_device);
}

function update_touch_option() {
  $('#is-touch-device').prop('checked', !is_desktop_site);
}

function attach_touch_option_control() {
  $('#is-touch-device').on('change', function() {
    is_mobile = $(this).prop('checked');
    is_desktop_site = !is_mobile;

    if (is_mobile) {
      disable_drag('all');
    } else {
      disable_drag('all');
      attach_drag_functor('all');
      $('.drag-simulable').removeClass('drag-simulable');
      highlight_droppable_regions(false);
    }
  });
}

$(function() {
  detect_touch_device();
  attach_touch_option_control();
})