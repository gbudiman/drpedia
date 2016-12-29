function wrap_async(func, _message) {
  var message = _message == undefined ? 'Loading...' : _message;


  $('#modal-waiting-content').text(message);
  $('#modal-waiting').off('shown.bs.modal').on('shown.bs.modal', function() {
    func();
    $('#modal-waiting').modal('hide');
  })

  $('#modal-waiting').modal('show');
}
