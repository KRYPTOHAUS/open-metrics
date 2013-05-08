require('../../lib/IgePrimitives');

var EndPoint = require('../../lib/EndPoint');

var Routing = EndPoint.extend({
	setup: function (app) {
		var self = this;
		this.app = app;
		
		// Setup routes
		this.app.route.post(this.app.apiRootPath + '/action/:actionName', function (req, res) { self.handle.apply(self, [req, res, 'create']); });
		
		return this;
	},
	
	create: function (params, query, reqRes, callback) {
		var self = this;
		
		if (params.actionName && query._omi) {
			// Convert omi into database object id
			var omi = query._omi;
			try {
				omi = self.app.monge.metrics.toId(omi);
			} catch (e) {
				callback('Invalid OMI.');
			}
			
			// Check the OMI exists
			self.app.monge.metrics.queryOne('session', {
				_id: omi
			}, {}, function (err, omiData) {
				if (!err && omiData) {
					// Check if there is a custom action handler
					if (self.app.actionHandler && self.app.actionHandler[params.actionName]) {
						// Call the action handler and only insert when complete
						
					} else {
						// No action handler, insert all query data
						// Record the action
						delete query._omi;
						self.app.monge.metrics.insert('action', {
							_omi: query._omi,
							action: params.actionName,
							query: query
						}, {}, function () {});
						
						callback(false);
					}
				} else {
					callback('Invalid OMI.');
				}
			});
		} else {
			callback('Invalid call, missing data.')
		}
	}
});

module.exports = new Routing();