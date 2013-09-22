
// var assert = require('assert');
var Collection = require('local-collection');
var Sync = require('local-collection-sync');

var assert = require('assert');

var testModel = require('model')('test').attr('id').attr('name');
testModel.route('http://localhost:3003/test');
var testCollection = Collection(testModel);
testCollection.use(Sync);

describe('local-collection', function() {
  var collection;
  beforeEach(function() {
    collection = new testCollection();
    collection.clear();
  });
  describe('methods', function() {
    it('has static fetch', function() {
      assert('function' === typeof testCollection.fetch);
    });
    it('has instance fetch', function() {
      assert('function' === typeof collection.fetch);
    });
    it('has static get', function() {
      assert('function' === typeof testCollection.get);
    });
  });



  describe('fetch', function() {
    it('returns a collection', function() {
      var c = testCollection.fetch();
      assert(c instanceof testCollection);
    });
    it('callbacks with a collection', function(done) {
      testCollection.fetch(function(err, c){
        assert(c instanceof testCollection);
        done();
      });
    });
    it('emits change', function(done) {
      collection.once('change', function(){done();});
      collection.fetch();
    });
  });

  describe('get', function() {
    it('returns a model', function() {
      var m = collection.get('id');
      assert(m instanceof testModel);
    });
    it('fetches model with correct id', function(done) {
      collection.get('id', function(err, m) {
        assert(m.id() === 'id');
        done();
      });
    });
  });
  describe('get', function() {

  });
});