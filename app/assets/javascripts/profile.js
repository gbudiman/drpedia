var sys_profiles = new Array();
var current_profile;
var has_profile = false;

function attach_create_from_scratch() {
  $('#profile-create-from-scratch').on('click', function() {
    // reset_all_skills('acquired-list');
    // reset_all_skills('planned-list');

    Cookies.set('dummy', '0|0||||');
    has_profile = false;
    selected_professions = undefined;
    selected_strain = undefined;

    //unpack_state();
    async_loading.wrap(function() {
      load_empty_profile();
      set_advanced_acknowledgement(false);
      persistence_clear_all_skill_cost_adjustment()
    }, 'Resetting all data...');
  })
}

function attach_delete_profile() {
  var update_button_visual = function(o) {
    return new Promise(
      function(resolve, reject) {
        o.prop('disabled', true)
         .text('Deleting');

        resolve();
      }
    )
  }
  $('#profile-confirm-deletion-modal').modal({
    show: false
  });

  $('#profile-delete').on('click', function() {
    $('#profile-confirm-deletion-modal').modal('show');
    $('#confirm-profile-deletion-text').text($('#profile-text').attr('profile'));
    $('#btn-confirm-profile-deletion')
      .text('Delete')
      .prop('disabled', false);
  });

  $('#btn-confirm-profile-deletion').on('click', function() {
    var name = $('#profile-text').attr('profile');
    update_button_visual($(this)).then(function() {
      var index = sys_profiles.indexOf(name);

      if (index == -1) {

      } else {
        var deleted_element = sys_profiles.splice(index, 1)[0];
        console.log('removing cookie: ' + deleted_element);
        Cookies.remove(deleted_element);
        $('#profile-confirm-deletion-modal').modal('hide');
        save_profiles();
        load_first_available_profile();
        load_existing_profile(true);
      }
    })
  });
}

function attach_new_profile() {
  $('#profile-create-new-modal').modal({
    show: false
  });

  $('#profile-create-new').on('click', function() {
    $('#profile-create-new-modal').modal('show');
    $('#profile-name').val('');
  })

  $('#profile-create-new-modal').on('shown.bs.modal', function() {
    $('#profile-name').focus();
  })

  $('#profile-name').on('keyup', function() {
    var val = $(this).val().trim();

    if (val.length == 0) {
      $('#btn-profile-save').prop('disabled', true);
      $('#new-profile-error').text('');
    } else {
      if (check_existing_profile(val)) {
        $('#btn-profile-save').prop('disabled', true);
        $('#new-profile-error').text('Profile exists. Please select different name');
      } else {
        $('#btn-profile-save').prop('disabled', false);
        $('#new-profile-error').text('');
      }
    }
    
  })
}

function attach_new_profile_save() {
  $('#btn-profile-save').on('click', function() {
    var name = $('#profile-name').val().trim();
    sys_profiles.push(name);
    current_profile = name;
    has_profile = true;
    unpack_has_been_called = false;
    save_profiles();
    //pack_state();
    $('#profile-create-new-modal').modal('hide');
    load_profile(name, false);
    load_existing_profile();
    
    pack_state();
  })
}

function check_existing_profile(val) {
  return sys_profiles.indexOf(val) != -1;
}

function load_empty_profile() {
  $('#profile-text').text('Select Profile...');
  $('#contextual-divider').hide();
  $('#profile-delete').parent().hide();

  has_profile = false;
  console.log('unpack here ' + current_profile);
  unpack_state();
}

function load_first_available_profile() {
  if (sys_profiles.length > 0) {
    load_profile(sys_profiles[0]);
  } else {
    load_empty_profile();
  }

  set_advanced_acknowledgement(advanced_acknowledged);
}

function load_profile(name, _execute_trigger) {
  var execute_trigger = _execute_trigger == undefined ? true : _execute_trigger;
  console.log('Loading profile ' + name);

  has_profile = true;
  current_profile = name;
  update_profile_visual(name);

  if (execute_trigger) {
    $('a[qref="' + name + '"]').trigger('click');
  }
}

function update_profile_visual(name) {
  $('#profile-text')
    .text('Profile: ' + name)
    .attr('profile', name);
}

function load_existing_profile(_bypass_unpack) {
  sys_profiles = new Array();
  var profiles = Cookies.get('drpedia');
  var bypass_unpack = _bypass_unpack == undefined ? false : _bypass_unpack;
  $('[is-profile-entry]').remove();

  if (profiles == undefined || profiles.length == 0) {
    var s = $('<li></li>')
              .append('No profiles found')
              .attr('is-profile-entry', true)
              .addClass('text-muted dropdown-no-link');

    $('#profile-dropdown')
      .prepend(s);

    if (!bypass_unpack) {
      unpack_state();
    }
    console.log('UBC called from load_existing_profile::undefined');
    update_beyond_basic();
  } else {
    $.each(profiles.split(',').sort().reverse(), function(i, x) {
      sys_profiles.push(x.trim());

      var r = $('<a></a>')
                .attr('href', '#')
                .attr('qref', x.trim())
                .append(x.trim());

      var s = $('<li></li>')
                .append(r)
                .attr('is-profile-entry', true)
                .on('click', function() {

        var name = $(this).text();
        console.log('click registered to ' + name);
        update_profile_visual(name);
        // $('#profile-text')
        //   .text('Profile: ' + name)
        //   .attr('profile', name);

        has_profile = true;
        current_profile = name;
        $('#contextual-divider').show();
        $('#profile-delete').parent().show();

        async_loading.wrap(function() {
          unpack_state();
        }, 'Loading saved profile data...')
        //unpack_state();
        //console.log('UBC called from load_existing_profile');
        //update_beyond_basic();
      });

      $('#profile-dropdown')
        .prepend(s);
    })


    $('#profile-delete').parent().show();
    $('#contextual-divider').show()
  }
}

function save_profiles() {
  var serialized = sys_profiles.join(',');
  Cookies.set('drpedia', serialized, { expires: 365 });
  console.log('Saved to profile: ' + Cookies.get('drpedia'));
}

$(function() {
  load_existing_profile(true);
  attach_new_profile();
  attach_new_profile_save();
  attach_delete_profile();
  attach_create_from_scratch();
  //load_first_available_profile();
})