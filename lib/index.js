var request = require('superagent');

function CollectionSync(collection, options) {
  var processResponse = options.processResponse || function(res) {
    return res.body;
  };

  collection.prototype.request = request;


  /**
   *
   *
   */

  collection.prototype.fetch = function(options, fn) {
    var self  = this;
    var url   = options.url || this.model.url('');
    var pk    = this.model.primaryKey;

    var cached = self.store(url);
    if(cached) {
      var models = cached.map(function(id) {
        return self.obtain(id);
      }).filter(function(m) { return !!m});
      fn(null, models);
    }

    this.request
      .get(url)
      .end(function(res) {
        if(res.error) return fn(res, res);
        var data = processResponse(res);

        var keys = data.map(function(m) { return m[pk]; });
        self.store(url, keys);

        var models = self.set(data);
        resultCollection.emit('change', models);
      });
  };
  collection.prototype.get = function(id, fn) {
    var self  = this;
    var url   = this.model.url(id);
    var model = this.obtain(id, true);

    // Early return
    fn(null, model);

    this.request
      .get(url)
      .end(function(res) {
        if(res.error) return fn(res, res);
        var data = processResponse(res);
        model.set(data);
        model.store();
      });
  };
  collection.prototype.clone = function() {
    var c = new this.collection();
    c.collection = this.collection;
    c.model = this.model;
    c.keys  = this.keys;
    return c;
  };
};

function plugin(options) {
  options = options || {};
  if('function' === typeof options.use) {
    return CollectionSync(collection);
  }
  return function(collection) {
    return CollectionSync(collection, options);
  };
};

module.exports = plugin;