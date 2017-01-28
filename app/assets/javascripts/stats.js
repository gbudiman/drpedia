var ip_max_adjustment;

$(function() {
  attach_stats_controller('#hp-add', 'add');
  attach_stats_controller('#hp-sub', 'sub');
  attach_stats_controller('#mp-add', 'add');
  attach_stats_controller('#mp-sub', 'sub');
  attach_stats_controller('#ip-add', 'add', 'inverse');
  attach_stats_controller('#ip-sub', 'sub', 'inverse');

  initialize_stats_controller('#hp-sub');
  initialize_stats_controller('#mp-sub');
  initialize_stats_controller('#ip-sub');
  initialize_infection_controller();

  compute_stats('#hp-total');
  compute_stats('#mp-total');
  compute_stats('#ip-total', 'inverse');
  update_total_xp();

  $('#hp-add').prop('disabled', false);
  $('#mp-add').prop('disabled', false);
  $('#ip-add').prop('disabled', false);

  window.stat_change_timeout_id;
})

function initialize_stats_controller(target_id) {
  var obj = $(target_id);
  var target = $('#' + obj.attr('data-target'));

  obj.prop('disabled', parseInt(target.text()) == 0);
}

function execute_stats_change_task() {
  

  //set_stat_build(target, total_id, current_value);
  set_stat_data();
  console.log('UBC called from attach_stats_controller');
  update_beyond_basic();
  check_advanced_profession_constraints();
  check_profession_concentration_constraints(false);
}

function attach_stats_controller(target_id, operation, inverse) {
  var obj = $(target_id);

  obj.on('click', function() {
    var target = $('#' + $(this).attr('data-target'));
    var pair = $('#' + $(this).attr('data-pair'));
    var total_id = $(this).attr('data-total');
    var current_value = parseInt(target.text());

    if (operation == 'add') {
      current_value += 1;

      if (target_id == '#ip-add') {
        if (current_value >= ip_max_adjustment) {
          $(this).prop('disabled', true);
        } else {
          $(this).prop('disabled', false);
        }
      }

      pair.prop('disabled', false);
    } else if (operation == 'sub' && current_value > 0) {
      current_value -= 1;

      if (current_value == 0) {
        $(this).prop('disabled', true);
      }

      if (target_id == '#ip-sub') {
        pair.prop('disabled', false);
      }
    } else {
      return;
    }

    
    target.text(current_value);
    compute_stats('#' + total_id, inverse);
    
    clearTimeout(window.stat_change_timeout_id);
    window.stat_change_timeout_id = setTimeout(execute_stats_change_task, 256);
  })
}

function set_stat_data(_pack) {
  var pack = _pack == undefined ? true : _pack;
  if (pack) { pack_state(); }
}

function set_stat_build(obj, total_id, value, _pack) {
  var pack = _pack == undefined ? true : _pack;
  obj.text(value);
  if (pack) {
    pack_state();
  }

  compute_stats('#' + total_id);
}

function set_base_stats(hp, mp, infection) {
  $('#hp-base').text(hp);
  $('#mp-base').text(mp);
  $('#infection-base').text(infection);
  compute_stats('#hp-total');
  compute_stats('#mp-total');
  compute_stats('#ip-total', 'inverse');
  ip_max_adjustment = infection;
}

function initialize_infection_controller(id) {
  var current_value = parseInt($('#ip-reduction').text());

  if (current_value == 0) {
    $('#ip-sub').prop('disabled', true);
    $('#ip-add').prop('disabled', false);
  } else if (current_value >= ip_max_adjustment) {
    $('#ip-sub').prop('disabled', false);
    $('#ip-add').prop('disabled', true);
  } else {
    $('#ip-sub').prop('disabled', false);
    $('#ip-add').prop('disabled', false);
  }
}

function compute_stats(target_id, inverse) {
  var obj = $(target_id);
  var base = $('#' + obj.attr('data-base')).text();
  var addition = $('#' + obj.attr('data-addition')).text();

  if (inverse != undefined) {
    var result = parseInt(base) - parseInt(addition);
    obj.text(result);
  } else {
    var result = parseInt(base) + parseInt(addition);
    obj.text(result);
    update_total_xp();
  }
}

function update_total_xp() {
  var s = parseInt($('#hp-addition').text())
        + parseInt($('#mp-addition').text())
        + parseInt($('#profession-xp').text())
        + parseInt($('#acquired-xp').text())
        + parseInt($('#planned-xp').text());

  calculate_xp_sum();
  $('#xp-total').text(s);
}