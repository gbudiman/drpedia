var profession_extension = (function() {
  var _data;
  var _list = ['#acquired-list', '#planned-list'];

  var load = function(data) { _data = data; }

  var get = function() {
    
    var amount = 0;
    $.each(_data, function(skill_name, _amount) {
      $.each(_list, function(i, x) {
        if ($(x).find('li[id="ls-' + skill_name + '"]').length > 0) {
          console.log('found');
          amount = _amount;
        }
      })
    })

    return amount;
  }

  var is_being_affected_by = function(skill_name) {
    return _data[skill_name];
  }

  return {
    get: get,
    is_being_affected_by: is_being_affected_by,
    load: load
  }
})()