var request = require('request');
var config = require('propertiesmanager').conf;
var common = require('./common');

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl = contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
const _logged = true; //TODO LEGGERE DA REQUEST
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

module.exports = {
	get: (req, res, next) => {
		var activity_id = req.params.id;
		request.get(config.contentUrl+"contents/"+activity_id, function (error, response, body) {
			if (error) {
				console.log(error);
				return res.boom.badImplementation()					
			}
			common.renderWithCommonUI(res, 'activities/view_activity', {
				activityBody: JSON.parse(body),
				activityId: activity_id,
				baseUrl: baseUrl,
				uploadUrl: uploadUrl,
				contentUrl: contentUrl,
				logged: _logged
			});
		})
	},


	post: (req, res, next) => {		
		return common.renderWithCommonUI(res, 'activities/form_activity', {		    
			activityBody: undefined,
			params: JSON.stringify(req.params),
			query: JSON.stringify(req.query),
			baseUrl:baseUrl,
			uploadUrl:uploadUrl,
			contentUrl:contentUrl,				
			logged: _logged
		});
	},

	put: (req, res, next) => { 
		var activity_id = req.params.id;
  		var action = req.params.action;

		request.get(config.contentUrl+"contents/"+activity_id, function (error, response, body) {
			if (error) {
				console.log("ERRR " + error);
				return res.boom.badImplementation();
			}
			var abody = undefined;
			try {
				abody = JSON.parse(body);
				let uDetails = [];
				for(let i=0; i<abody.admins.length; i++) {
					//call user ms to get user details
				}
			}
			catch(ex) {
				console.log(ex);
				return res.boom.badImplementation();
			}

			common.renderWithCommonUI(res, 'activities/form_activity', {
				params: JSON.stringify(req.params),
				query: JSON.stringify(req.query),
				activityBody: abody,
				baseUrl: baseUrl,
				uploadUrl:uploadUrl,
				contentUrl: contentUrl,				    
				logged: _logged
			});
		});
	}

}