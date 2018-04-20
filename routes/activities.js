var request = require('request');
var rp = require('request-promise');
var config = require('propertiesmanager').conf;
var common = require('./render');
var express = require('express');
var router = express.Router();
let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl = contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let _userUrl = config.userUrl + (config.userUrl.endsWith('/') ? '' : '/');
let _mailerUrl = config.mailerUrl + (config.mailerUrl.endsWith('/') ? '' : '/');

//ask userms for admins details
router.get('/admins',	 (req, res, next) => {
	let admins = req.query.adm;
	if(!Array.isArray(admins)) admins = [admins]; //one item only
	getAdmins(admins)
	.then(users => {
		res.json(users)
	})
	.catch(e => {
		console.log(e);
		res.boom.badImplementation();
	})
});


//search for users by mail
router.get('/users', (req, res, next) => {res.json([])}); //TODO chiedere a ale di convertire da action in search con query string ?q=
router.get('/users/:q',		 (req, res, next) => {	
	getUsersByMail(req.params.q)
	.then(users => {
		res.json(users)
	})
	.catch(e => {
		console.log(e);
		res.boom.badImplementation();
	})
});


router.get('/image/:id', (req, res, next) => {
	let id = req.params.id;
    if(id) {
        let options = {
            url:  uploadUrl + "file/" + id,
            headers: {
				'Authorization': "Bearer " + config.auth_token
			}
        };
        request.get(options).pipe(res);
	}
	else {
        res.status(400).send({error:"BadRequest", error_message:"File ID not valid"});
    }
});

router.get('/activitycontent/:id', (req, res, next) => {
	let id = req.params.id;
    if(id) {
        let options = {
            url:  contentUrl + "contents/" + id,
            headers: {
				'Authorization': "Bearer " + config.auth_token
			},
			json:true
		};		
		console.log(options.url);
		rp(options)
		.then(rr => {
			rr.description = rr.description.replace(/</g,"&lt;").replace(/>/g, "&gt;");
			res.json(rr)
		})
		.catch(e => {
			res.boom.badImplementation();
		})
	}
	else {
        res.status(400).send({error:"BadRequest", error_message:"File ID not valid"});
    }
});

//TODO check auth, solo admin
router.post('/email', (req, res, next) => {
	let msg = req.body.msg;
	let oid = req.body.oid;
	let cid = req.body.cid;
	
	rp({
		uri:_userUrl + (_userUrl.endsWith("/") ? '' : '/') + 'users/' + oid,
		method: 'GET',
		json:true,
		headers: {
			authorization: req.headers.authorization
		}
	})
	.then(user => { 
		if(!user || !user.email) {
			res.boom.badRequest("Invalid user ID");
		}
		else {
			let ownermail = user.email;			
			return rp({
				uri:_mailerUrl + "email",
				method: "POST",
				headers: {
					authorization: "Bearer " + config.auth_token
				},
				json: true,
				body: {					
					to:[ownermail],
					subject:"Content " + cid + " Locked",
					textBody: "Your content has been locked due to: \n\n" + msg
				}
			})
		}
	})
	.then(result => {
		console.log(result);
		res.end()
	})
	.catch(e => {
		console.log(e)
		if(e.statusCode == 401)
			res.boom.unauthorized();
		else
			res.boom.badImplementation();
	})
})

router.delete('/:id/promo/:pid', (req, res, next) => {
	res.boom.notImplemented()
})

//TODO check token
router.delete('/:id', (req, res, next) => {
	let id = req.params.id;
	let content = undefined;
	rp({
		uri:contentUrl + 'contents/' + id,
		method: 'GET',
		json:true,
		headers: {
			authorization: req.headers.authorization
		}
	})
	.then(cnt => {
		content = cnt;
		let imgs = content.images;
		return checkOwnership(imgs)
	})
	.then(owners => {
		let imgsAllowed = [];
		for(let i=0; i<owners.length; i++) {
			//verifica che l'owner della foto sia compreso tra gli admin del content
			//impedisce la cancellazione di foto non proprie quando si utilizza il token applicativo 
			//su DELETE di uploadms
			//Se le immagini hanno un owner che non e' più admin, su uploadms rimarranno orfane
			if(content.admins.indexOf(owners[i].owner) != -1 || owners[i].owner == content.owner) {
				imgsAllowed.push(owners[i].id);
			}
		}
		return deleteImages(imgsAllowed)
	})
	.then(r => {
		//TODO 
		res.json(r)
	})
	.catch(e => {
		console.log(e)
		if(e.statusCode == 401)
			res.boom.unauthorized()
		else
			res.boom.badImplementation();
	})
})

function checkOwnership(ids) {
	let promiseArr = [];
	for(let i=0; i<ids.length; i++) {
		promiseArr.push(rp({
			uri:uploadUrl + 'file/' + ids[i] + '/actions/owner',
			method: "POST",
			json: true
		}))
	}
	return Promise.all(promiseArr)
}

function deleteImages(imgIdsArr) {
	let promiseArr = [];
	for(let i=0; i<imgIdsArr.length; i++) {
		promiseArr.push(
			rp({
				uri:uploadUrl + 'file/' + imgIdsArr[i],
				method: "DELETE",
				headers: {
					authorization: "Bearer " + config.auth_token
				},
				json: true
			})
		)
	}
	return Promise.all(promiseArr)
}


function getAdmins(admIds) {
	if(admIds && admIds.length > 0) {
		return new Promise((resolve, reject) => {
			let query_users = admIds.join("&usersId=");
			rp({
				uri:_userUrl + (_userUrl.endsWith("/") ? '' : '/') + 'users/?usersId=' + query_users,
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


function getUsersByMail(mail) {	
	return new Promise((resolve, reject) => {
		rp({
			uri:_userUrl + (_userUrl.endsWith("/") ? '' : '/') + 'users/actions/search/',
			method: 'POST',
			json:true,
			body: {
				searchterm: {
					email: mail,
					type: config.contentAdminTokenType
				}
			},
			headers: {
				authorization: "Bearer " + config.auth_token
			}
		})
		.then(users => {
			resolve(users.users)
		})
		.catch(e => {
			//console.log(e);
			reject(e);
		})
	});
}

module.exports = router;