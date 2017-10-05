var request = require('request');
var config = require('propertiesmanager').conf;

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');

module.exports = {
	get: (req, res, next) => {
		var activity_id = req.params.id;		
		request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
			if (error) console.log("ERRR " + error);
			var commonBody = undefined;
			try {
				commonBody = JSON.parse(body);
			}
			catch(ex) {
				console.log(ex);
				return res.boom.badImplementation()
			}
			request.get(config.contentUrl+"contents/"+activity_id, function (error, response, body) {
				if (error) {
					return res.boom.badImplementation()
					console.log("ERR " + error);
				}

				return res.render('activities/view_activity', {
					activityBody: JSON.parse(body),
					activityId: activity_id,
					baseUrl: baseUrl,
					uploadUrl: uploadUrl,
					contentUrl: contentUrl,
					footer: commonBody.footer.html,
					footerCss: commonBody.footer.css,
					footerScript: commonBody.footer.js,
					header: commonBody.header.html,
					headerCss: commonBody.header.css,
					headerScript: commonBody.header.js,
					logged:true //TODO come???
				});
			})
		});
	},

	post: (req, res, next) => {
		request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
	    	if (error) {
	    		console.log("ERRR " + error);
	    		res.boom.badImplementation();
	    	}
	    
			var body = undefined;
			try {
				body = JSON.parse(body);
			}
			catch(ex) {
				console.log(ex);
				res.boom.badImplementation();
			}
			
		    return res.render('activities/form_activity', {
				activityBody: undefined,
				params: JSON.stringify(req.params),
				query: JSON.stringify(req.query),
				baseUrl:baseUrl,
				uploadUrl:uploadUrl,
				contentUrl:contentUrl,
				footer:body.footer.html,
				footerCss:body.footer.css,
				footerScript:body.footer.js,
				header:body.header.html,
				headerCss:body.header.css,
				headerScript:body.header.js,
				logged:true
		  	});
		})
	},

	put: (req, res, next) => { 
		var activity_id = req.params.id;
  		var action = req.params.action;

    	request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, cbody) {
    		if (error) console.log("ERRR " + error);
			var commonBody = undefined;
			try {
				commonBody = JSON.parse(cbody);
			}
			catch(ex) {
				console.log(ex);
				res.boom.badImplementation();
			}

    		console.log("\n\ncalling contents/ "+config.contentUrl+"/contents/"+activity_id);

			request.get(config.contentUrl+"contents/"+activity_id, function (error, response, body) {
				if (error) {
					console.log("ERRR " + error);
					return res.boom.badImplementation();
				}
				var abody = undefined;
				try {
					abody = JSON.parse(body);
				}
				catch(ex) {
					console.log(ex);
					res.boom.badImplementation();
				}

			  	return res.render('activities/form_activity', {
				    params: JSON.stringify(req.params),
				    query: JSON.stringify(req.query),
				    activityBody: aBody,
				    baseUrl: baseUrl,
				    uploadUrl:uploadUrl,
				    contentUrl: contentUrl,
				    footer: commonBody.footer.html,
				    footerCss: commonBody.footer.css,
				    footerScript: commonBody.footer.js,
				    header: commonBody.header.html,
				    headerCss: commonBody.header.css,
				    headerScript: commonBody.header.js,
				    logged:true
			  	});
			});
		});	
	}
}