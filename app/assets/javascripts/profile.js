var sys_profiles = new Array();
var current_profile;
var has_profile = false;

function attach_delete_profile() {
  $('#profile-confirm-deletion-modal').modal({
    show: false
  });

  $('#profile-delete').on('click', function() {
    $('#profile-confirm-deletion-modal').modal('show');
    $('#confirm-profile-deletion-text').text($('#profile-text').attr('profile'));
  });

  $('#btn-confirm-profile-deletion').on('click', function() {
    var name = $('#profile-text').attr('profile');

    var index = sys_profiles.indexOf(name);

    if (index == -1) {

    } else {
      sys_profiles.splice(index, 1);
      console.log('After deletion: ' + sys_profiles);
      $('#profile-confirm-deletion-modal').modal('hide');
      save_profiles();
      load_first_available_profile();
      load_existing_profile();
    }
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
    save_profiles();
    $('#profile-create-new-modal').modal('hide');
    load_existing_profile();
    load_profile(name);
    pack_state();
  })
}

function check_existing_profile(val) {
  return sys_profiles.indexOf(val) != -1;
}

function load_empty_profile() {
  $('#profile-text').text('Select Profile');
  $('#contextual-divider').hide();
  $('#profile-delete').parent().hide();

  has_profile = false;
}

function load_first_available_profile() {
  if (sys_profiles.length > 0) {
    load_profile(sys_profiles[0]);
  } else {
    load_empty_profile();
  }
}

function load_profile(name) {
  console.log('Loading profile ' + name);
  has_profile = true;
  current_profile = name;

  $('a[qref="' + name + '"]').trigger('click');
}

function load_existing_profile() {
  sys_profiles = new Array();
  var profiles = Cookies.get('drpedia');
  $('[is-profile-entry]').remove();

  if (profiles == undefined || profiles.length == 0) {
    var s = $('<li></li>')
              .append('No profiles found')
              .attr('is-profile-entry', true)
              .addClass('text-muted dropdown-no-link');

    $('#profile-dropdown')
      .prepend(s);
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
        $('#profile-text')
          .text('Profile: ' + name)
          .attr('profile', name);

        has_profile = true;
        current_profile = name;
        unpack_state();
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
  load_existing_profile();
  attach_new_profile();
  attach_new_profile_save();
  attach_delete_profile();
  //load_first_available_profile();
})