var request = require('request');
var rp = require('request-promise');
var config = require('propertiesmanager').conf;
var common = require('./common');

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl = contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let _userUrl = config.userUrl + (config.userUrl.endsWith('/') ? '' : '/');

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
const _logged = true; 	//TODO LEGGERE DA REQUEST - 
						//DEVE ESSERE DI TIPO CONTENTADMIN!!!!
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

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

	rp(config.contentUrl+"contents/"+activity_id)
	.then(body => {
		abody = JSON.parse(body);		
		common.renderWithCommonUI(res, 'activities/' + (edit ? 'form_activity' : 'view_activity'), {
			activityBody: abody,
			activityId: activity_id,
			params: edit ? JSON.stringify(req.params) : undefined,
			query: edit ? JSON.stringify(req.query) : undefined,
			baseUrl: baseUrl,
			uploadUrl: uploadUrl,
			contentUrl: contentUrl,
			logged: _logged
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