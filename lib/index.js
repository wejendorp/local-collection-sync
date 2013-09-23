var request = require('superagent');

function CollectionSync(collection, options) {
  options = options || {};
  var processResponse = options.processResponse || function(res) {
    return res.body;
  };

  collection.request = request;

  var noop = function() {};
  var error = function(res) { return new Error('Got status %s', res.status); };
  /**
   * Instantiate a new collection for a url and fetch it.
   *
   */

  collection.fetch = function(url, fn) {
    if(typeof url === 'function') {
      fn = url;
      url = null;
    }
    var collection = new this();
    if(url)
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
    var url   = this.collection.url(this.url);
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
        fn(null, self);
      });

    return self;
  };


  collection.get = function(id, fn) {
    var self  = this;
    var url   = this.model.url(id);
    var model = this.obtain(id, true);
    fn = fn || noop;

    self.request
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

  collection.prototype.get = function(id, fn) {
    return this.collection.get(id, fn);
  };

  collection.url = function(path) {
    if(typeof path === 'string' &&
        path.indexOf('//') !== -1) return path;

    if(!this._base) return path ? this.model.url(path) : this.model.url();
    return this._base + (path ? '/' + path : '');
  };
  collection.route = function(base) {
    if(typeof base === 'undefined')
      return this._base;
    this._base = base;
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

module.exports = plugin;