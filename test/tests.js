
// var assert = require('assert');
var Collection = require('local-collection');
var Sync = require('local-collection-sync');
Collection.use(Sync);

var store = require('store');
var assert = require('assert');

var testModel = require('model')('test').attr('id').attr('name');
var testCollection = Collection(testModel);

describe('local-collection', function() {
  var collection;
  beforeEach(function() {
    store.clearAll();
    collection = new testCollection();
    collection.clear();
  });


});