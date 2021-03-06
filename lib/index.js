'use strict';
var request = require('superagent');

function CollectionSync(collection, options) {
  options = options || {};
  collection.processResponse = options.processResponse || function(res) {
    return res.body;
  };

  collection.request = request;

  var noop = function() {};
  var error = function(res) { return new Error('Got status %s', res.status); };
  /**
   * Instantiate a new collection for a url and fetch it.
   *
   */

  collection.fetch = function(url, fn, process) {
    var c = new collection();
    return c.fetch(url, fn, process);
  };

  /**
   * (Re)fetch a collection
   *
   *
   */

  collection.prototype.fetch = function(url, fn, process) {
    if(typeof url === 'function') {
      fn = url;
      url = null;
    }

    var self  = this;
    var pk    = this.model.primaryKey;

    url   = this.collection.url(url || this._id || this.url);
    fn = fn || noop;

    self.keys = self.collection.store(url) || self.keys || [];

    self.collection.request
      .get(url)
      .set(this.model._headers)
      .end(function(res) {
        if(res.error) return fn(error(res), res);
        var data = (process||collection.processResponse)(res) || [];

        var keys = data.map(function(m) { return m[pk]; });
        // self.collection.store(url, keys);

        var models = self.set(data);
        self.emit('change', models);
        fn(null, self);
      });

    return self;
  };

  collection.get = function(id, fn, process) {
    var self  = this;

    var url   = this.model.url(id);
    var model = this.obtainOne(this.alias(id) || id, true);
    fn = fn || noop;

    self.request
      .get(url)
      .set(this.model._headers)
      .end(function(res) {
        if(res.error) return fn(error(res), res);
        var data = (process||self.processResponse)(res);
        model.set(data);
        // model.store();
        if(data.id && data.id !== id) self.alias(id, data.id);
        fn(null, model);
      });

    return model;
  };

  collection.prototype.get = function(id, fn, process) {
    return this.collection.get(id, fn, process);
  };

  collection.url = function(path) {
    if(typeof path === 'string') {
      if(path.indexOf('//') !== -1) return path;
      if(path.indexOf('/') === 0) return this.host() + path;
    }

    if(!this.route()) return path ? this.model.url(path) : this.model.url();
    return this.route() + (path ? '/' + path : '');
  };
  collection.route = function(base) {
    if(typeof base === 'undefined')
      return this._base;
    this._base = base;
  };
  collection.host = function(hostname) {
    if(typeof hostname === 'undefined')
      return this._host;
    this._host = hostname;
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