$(function() {
  attach_stats_controller('#hp-add', 'add');
  attach_stats_controller('#hp-sub', 'sub');
  attach_stats_controller('#mp-add', 'add');
  attach_stats_controller('#mp-sub', 'sub');

  initialize_stats_controller('#hp-sub');
  initialize_stats_controller('#mp-sub');

  compute_stats('#hp-total');
  compute_stats('#mp-total');
})

function initialize_stats_controller(target_id) {
  var obj = $(target_id);
  var target = $('#' + obj.attr('data-target'));

  obj.prop('disabled', parseInt(target.text()) == 0);
}

function attach_stats_controller(target_id, operation) {
  var obj = $(target_id);

  obj.on('click', function() {
    var target = $('#' + $(this).attr('data-target'));
    var pair = $('#' + $(this).attr('data-pair'));
    var total_id = $(this).attr('data-total');
    var current_value = parseInt(target.text());

    if (operation == 'add') {
      current_value += 1;
      pair.prop('disabled', false);
    } else if (operation == 'sub' && current_value > 0) {
      current_value -= 1;

      if (current_value == 0) {
        $(this).prop('disabled', true);
      }
    } else {
      return;
    }

    set_stat_build(target, total_id, current_value);
  })
}

function set_stat_build(obj, total_id, value) {
  obj.text(value);
  pack_state();
  compute_stats('#' + total_id);
}

function set_base_stats(hp, mp, infection) {
  $('#hp-base').text(hp);
  $('#mp-base').text(mp);
  $('#infection-base').text(infection);
  compute_stats('#hp-total');
  compute_stats('#mp-total');
}

function compute_stats(target_id) {
  var obj = $(target_id);
  var base = $('#' + obj.attr('data-base')).text();
  var addition = $('#' + obj.attr('data-addition')).text();

  var result = parseInt(base) + parseInt(addition);

  obj.text(result);
}