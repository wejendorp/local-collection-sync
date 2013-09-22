var data = {};
data.models =
  [
    {id: '0', name:'Wejendorp'},
    {id: '1', name:'Darkwing Duck'},
    {id: '2', name:'Dr Null'}
  ];

data.getId = function(id) {
  var ret = {};
  this.models.every(function(model) {
    if(model.id === id) {
      ret = model;
      return false;
    }
    return true;
  });
  return ret;
};
if(typeof window !== 'undefined')
  window.testData = data;
if(typeof module !== 'undefined')
  module.exports = data;