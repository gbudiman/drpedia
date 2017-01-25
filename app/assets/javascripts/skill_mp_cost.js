var skill_mp_cost = (function() {
  var _data;

  var humanize = function(x) {
    var match = x.match(/(\d+)>(\d+)/)
    if (match) {
      return match[1] + ' per ' + match[2];
    }

    return x;
  }

  var load = function(data) { _data = data; }

  var get = function(_skill_name) {
    var skill_name = sanitize(_skill_name);
    return humanize(_data[skill_name]);
  }

  var sanitize = function(x) {
    if (x.match(/Psi /)) { 
      return x.replace(/[\w\s]+ \- /, '')
    }

    return x;
  }

  return {
    get: get,
    load: load
  }
})()