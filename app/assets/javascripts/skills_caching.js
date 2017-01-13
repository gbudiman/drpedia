var skills_caching = (function() {
  var cache = {};
  var diff = new Array();

  var get_diff = function() { return diff; }
  var reset = function() { diff = new Array(); }
  var update = function(name, cost, open_skill_cost, _is_disadvantaged) {
    var is_disadvantaged = _is_disadvantaged == undefined ? false : _is_disadvantaged;

    if (cache[name] == undefined || cache[name].min_cost != cost) {
      cache[name] = {
        min_cost: cost,
        open_skill_cost: open_skill_cost
      }


      diff.push({
        min_cost: cost,
        open_skill_cost: open_skill_cost,
        skill_name: name,
        is_disadvantaged: is_disadvantaged
      })
    }
  }

  return {
    cache: cache,
    get_diff: get_diff,
    reset: reset,
    update: update
  }
})()