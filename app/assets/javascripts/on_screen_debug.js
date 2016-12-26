function debug(x) {
  $('#debug-log').show();
  $('#debug-log').append($('<div></div>').append(x));
  console.log(x);
}