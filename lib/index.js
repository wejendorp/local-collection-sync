var request = require('superagent');

function CollectionSync(collection, options) {
  options = options || {};
  var processResponse = options.processResponse || function(res) {
    return Array.isArray(res.body) ? res.body : [res.body];
  };

  collection.request = request;

  var noop = function() {};
  var error = function(res) { return new Error('Got status %s', res.status); };
  /**
   * Instantiate a new collection for a url and fetch it.
   *
   */

  collection.fetch = function(url, fn) {
    var collection = new this();
    collection.url = url;
    return collection.fetch(fn);
  };

  /**
   * (Re)fetch a collection
   *
   *
   */

  collection.prototype.fetch = function(fn) {
    var self  = this;
    var url   = this.url || this.model.url('');
    var pk    = this.model.primaryKey;
    fn = fn || noop;

    self.keys = self.collection.store(url) || self.keys || [];

    self.collection.request
      .get(url)
      .end(function(res) {
        if(res.error) return fn(error(res), res);
        var data = processResponse(res);

        var keys = data.map(function(m) { return m[pk]; });
        self.collection.store(url, keys);

        var models = self.set(data);
        self.emit('change', models);
        fn(null, models);
      });

    return self;
  };

  collection.prototype.get = function(id, fn) {
    var self  = this;
    var url   = this.model.url(id);
    var model = this.obtain(id, true);
    fn = fn || noop;

    self.collection.request
      .get(url)
      .end(function(res) {
        if(res.error) return fn(error(res), res);
        var data = processResponse(res);
        model.set(data);
        model.store();
        fn(null, model);
      });

    return model;
  };
};

function plugin(options) {
  if('function' === typeof options) {
    return CollectionSync(options, {});
  }
  return function(collection) {
    return CollectionSync(collection, options);
  };
};

module.exports = CollectionSync;