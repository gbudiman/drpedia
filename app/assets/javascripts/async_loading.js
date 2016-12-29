var async_loading = (function() {
  var wrap = function(func, _message) {
    var message = _message == undefined ? 'Loading...' : _message;

    $('#modal-waiting-content').text(message);
    $('#modal-waiting').off('shown.bs.modal').on('shown.bs.modal', function() {
      func();
      $('#modal-waiting').modal('hide');
    })

    $('#modal-waiting').modal('show');
  }

  var inline = function(func, _message) {
    $('#graphical-list').css('opacity', 0.25);
    $('#acquired-list').css('opacity', 0.25);
    $('#planned-list').css('opacity', 0.25);
    
    setTimeout(function() {
      func();
      $('#graphical-list').css('opacity', 1);
      $('#acquired-list').css('opacity', 1);
      $('#planned-list').css('opacity', 1);
    }, 16);
    
  }

  return {
    inline: inline,
    wrap: wrap
  }
})()