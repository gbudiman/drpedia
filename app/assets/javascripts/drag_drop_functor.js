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

  selement.draggable({
    scroll: false,
    appendTo: 'body',
    helper: 'clone',
    opacity: 0.8
  });

  if (!is_desktop_site) {
    disable_drag('all');
    if (is_currently_draggable()) {
      selement.find('.draggable-visual').remove();
      selement.draggable('disable');
    } else {
      if (is_valid_draggable_skill()) {
        selement.draggable('enable');
        selement.append('<span class="draggable-visual text-muted pull-right"> [[ Drag me ]] &nbsp;</span>');
      }
    }
  } else {
    console.log('re-enabling all');
    selement.draggable('enable');
  }

  //$('.skill-draggable').draggable({
  

  selement.on('dragstart', function(event, ui) {
    if ($(this).hasClass('faded')) {
      return false;
    }


    $('.ui-draggable-dragging').css('width', $(this).css('width'));
    disable_popover();


    $('.skill-droppable')
      .css('border', '1px solid #388038')
      .css('background-color', '#ddffdd');
  })

  selement.on('dragstop', function(event, ui) {
    $(this).css('left', '')
           .css('top', '');


    $('.skill-droppable')
      .css('border', '1px solid #ddd')
      .css('background-color', '');

    disable_popover();
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
        .css('width', '');

      reset_popover(dragged_object);
      rebuild_popover(dragged_object);

      $('.skill-droppable')
        .css('overflow-y', 'auto')
        //.css('z-index', '');

      //$('#graphical').css('overflow', 'auto');
      disable_popover();
      disable_drag(dragged_object);
    }
  })
}

function disable_drag(selement) {
  if (selement == 'all') {
    $('.draggable-visual').each(function() {
      $(this).parent().draggable('disable');
      $(this).remove();
    })
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
    }
  });
}

$(function() {
  detect_touch_device();
  attach_touch_option_control();
})