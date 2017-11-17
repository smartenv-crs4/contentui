var request = require('request');
var rp = require('request-promise');
var config = require('propertiesmanager').conf;
var common = require('./render');

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl = contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let _userUrl = config.userUrl + (config.userUrl.endsWith('/') ? '' : '/');

module.exports = {
	//view activity
	get: (req, res, next) => {
		getActivity(req, res);
	},
	
	//edit activity
	put: (req, res, next) => {
		getActivity(req, res, true);
	},

	//new activity (blank form)
	post: (req, res, next) => {
		let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;		
		return common.renderPage(res, 'activities/form_activity', {
			activityBody: undefined,
			params: JSON.stringify(req.params),
			query: JSON.stringify(req.query),
			baseUrl:baseUrl,
			uploadUrl:uploadUrl,
			contentUrl:contentUrl,
			access_token: access_token,
			contentAdminTypes: config.contentAdminTokenType
		});
	},

	//ask userms for admins details
	admins: (req, res, next) => {
		let admins = req.query.adm;

		getAdmins(admins)
		.then(users => {
			res.json(users)
		})
		.catch(e => {
			console.log(e);
			res.boom.badImplementation();
		})
	}
}


function getActivity(req, res, edit) {
	let activity_id = req.params.id;
	let abody = undefined;
	let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;

	rp(config.contentUrl+"contents/"+activity_id)
	.then(body => {
		abody = JSON.parse(body);		
		common.renderPage(res, 'activities/' + (edit ? 'form_activity' : 'view_activity'), {
			activityBody: abody,
			activityId: activity_id,
			params: edit ? JSON.stringify(req.params) : undefined,
			query: edit ? JSON.stringify(req.query) : undefined,
			baseUrl: baseUrl,
			uploadUrl: uploadUrl,
			contentUrl: contentUrl,
			access_token: access_token,
			contentAdminTypes: config.contentAdminTokenType
		});
	})
	.catch(e => {
		console.log(e);
		res.boom.badImplementation();
	})
} 


function getAdmins(admIds) {
	if(admIds && admIds.length > 0) {
		return new Promise((resolve, reject) => {
			let query_users = admIds.join("&usersId=");
			rp({
				uri:_userUrl + '/users/?usersId=' + query_users,
				method: 'GET',
				json:true,
				headers: {
					authorization: "Bearer " + config.auth_token
				}
			})
			.then(users => {
				for(let i=0; i<users.users.length; i++) {
					users.users[i].avatar = users.users[i].avatar || "/img/avatar.png"; //TODO parametrizzare
				}
				resolve(users.users)
			})
			.catch(e => {
				console.log(e);
				reject(e);
			})
		});
	}
	else return [];
}