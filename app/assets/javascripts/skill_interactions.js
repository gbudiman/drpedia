var skill_interactions = (function() {
  var _skill_counters;
  var _skill_countered;

  var load = function(type, data) {
    switch(type) {
      case 'counters': _skill_counters = data; break;
      case 'countered': _skill_countered = data; break;
    }
  }

  var get = function(_skill_name) {
    var skill_name = sanitize(_skill_name);
    return {
      counters: _skill_counters[skill_name] == undefined ? null : _skill_counters[skill_name].sort(),
      countered: _skill_countered[skill_name] == undefined ? null : _skill_countered[skill_name].sort()
    }
  }

  var dump = function() {
    return {
      counters: _skill_counters,
      countered: _skill_countered
    }
  }

  var sanitize = function(x) {
    return x.replace(/[\w\s]+ \- /, '');
  }

  return {
    dump: dump,
    get: get,
    load: load,
    sanitize: sanitize
  }
})()