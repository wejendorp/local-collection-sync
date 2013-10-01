
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

    it('expands automatically', function() {
      var test = testCollection.fetch();
      // empty collection
      assert(test.length() === 0);
      // populated after change
      test.on('change', function() {
        assert(this.length() === testData.models.length);
      });
    });

    describe('caching', function() {
      beforeEach(function(done) {
        testCollection.fetch(function() { done(); });
      });
      it('returns cached results', function() {
        var c = testCollection.fetch();
        assert(c.length() !== 0);
      });
      it('updates cached result', function() {
        var c = testCollection.fetch();

        // These changes should be overwritten
        c.each(function(model){
          model.name('test');
        });

        c.once('change', function() {
          this.each(function(model) {
            assert(model.name() !== 'test');
          });
        });
      });
    })
  });

  describe('get', function() {
    var ref = testData.getId('2');

    beforeEach(function() {
      (new testCollection.model({id:'2', name:'Cached'})).store();
    });

    it('returns a cached model on 404', function() {
      (new testCollection.model({id: '5', name: 'Cached'})).store();
      var m = collection.get('5');
      assert(m instanceof testModel);
      assert(m.name() === 'Cached');
    });

    it('updates cached model', function(done) {
      var m = collection.get('2');
      m.once('change name', function(name) {
        assert(name === ref.name);
        done();
      });
    });

    it('callbacks with updated model', function(done) {
      collection.get(ref.id, function(err, m) {
        assert(m.id() === ref.id);
        assert(m.name() == ref.name);
        done();
      });
    });
  });
});