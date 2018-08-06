var request = require('request');
const auth = require('tokenmanager');
var rp = require('request-promise');
var config = require('propertiesmanager').conf;
var common = require('./render');
var express = require('express');
let authField = config.decodedTokenFieldName
var router = express.Router();
let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl = contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let _userUrl = config.userUrl + (config.userUrl.endsWith('/') ? '' : '/');
let _mailerUrl = config.mailerUrl + (config.mailerUrl.endsWith('/') ? '' : '/');
let _userUIUrl = config.userUIUrl + (config.userUIUrl.endsWith('/') ? '' : '/');

let _contentUIUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');

auth.configure({
    authorizationMicroserviceUrl:config.authUrl + '/tokenactions/checkiftokenisauth',
    decodedTokenFieldName:config.decodedTokenFieldName,
    authorizationMicroserviceToken:config.auth_token
});

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
router.get('/users', (req, res, next) => {res.json([])});
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
router.post('/email', auth.checkAuthorization, (req, res, next) => {
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


router.delete('/:id/promo/:pid', auth.checkAuthorization, (req, res, next) => {
	let authHeader = {authorization: req.headers.authorization};
	let uid = req[authField].token._id;
	let id = req.params.id;
	let pid = req.params.pid;
	let content = undefined;

	rp({
		uri:contentUrl + 'contents/' + id,
		method: 'GET',
		json:true
	})
	.then(r => {
		content = r;
		if(!checkContentAuth(r.admins.concat([r.owner]), uid)) throw({statusCode:401});
		return rp({
			uri:contentUrl + 'contents/' + id + "/promotions/" + pid,
			method: 'GET',
			json:true
		})
	})
	.then(r => {
		if(r.idcontent != id) throw({statusCode:400})
		r.admins = content.admins.concat([content.owner]);		
		return deletePromo(r, authHeader);
	})
	.then(r => {
		res.json(r);
	})
	.catch(e => {
		console.log(e)
		if(e.statusCode == 401)
			res.boom.unauthorized()
		else if(e.statusCode == 400)
			res.boom.badRequest();
		else
			res.boom.badImplementation();
	})
})

router.delete('/:id', auth.checkAuthorization, (req, res, next) => {
	let uid = req[authField].token._id;
	let id = req.params.id;
	let content = undefined;
	let authHeader = {authorization: req.headers.authorization};
	/*
	//TODO per il lock serve il token admin, come bloccare senza?
	rp({ //lock activity prima di rimozione, per evitare contenuti monchi se le op intermedie falliscono
		uri:contentUrl + 'contents/' + id + '/actions/lock',
		method: 'POST',
		json:true,
		headers: {authorization:"Bearer " + config.auth_token}
	})
	.then(r => {
	*/

	rp({
		uri:contentUrl + 'contents/' + id,
		method: 'GET',
		json:true,
		headers: authHeader
	})
	.then(cnt => {
		content = cnt;
		
		//verifica che il chiamante sia admin del contenuto
		if(!checkContentAuth(content.admins.concat([content.owner]), uid)) throw({statusCode:401});
		
		return rp({
			uri:contentUrl + 'contents/' + id + '/promotions',
			method: 'GET',
			json:true,
			headers: authHeader
		})
	})
	.then(r => {
		let promoPromiArr = [];
		for(let i=0; i<r.promos.length; i++) {
			r.promos[i].admins = content.admins.concat([content.owner]);
			promoPromiArr.push(deletePromo(r.promos[i], authHeader));
		}
		return Promise.all(promoPromiArr);
	})
	.then(r => {
		deleteImages(content.images, content.admins.concat([content.owner])) //WARN e' inviato asincrono!!!
		return rp({
			uri:contentUrl + 'contents/' + id,
			method: 'DELETE',
			json:true,
			headers: authHeader
		})
	})
	.then(r => {
		res.json(r);
	})
	.catch(e => {
		console.log(e)
		if(e.statusCode == 401)
			res.boom.unauthorized()
		else
			res.boom.badImplementation();
	})
});



router.post('/actions/deleteusercontents/:user_id', auth.checkAuthorization, (req, res, next) => {
    let content = {done:[], pending:[]};
    let authHeader = {authorization: req.headers.authorization};

    rp({
        uri:contentUrl + 'search?by_uid=' + req.params.user_id,
        method: 'GET',
        json:true
    })
        .then(activities => {

        	let cpPromise=[];
        	if(activities && activities.metadata && (activities.metadata.totalCount>0)){
                activities.contents.forEach(function(currentActivity){
                    cpPromise.push(
                        rp({
                            uri:_contentUIUrl + 'activities/' + currentActivity._id,
                            method: 'DELETE',
                            json:true,
                            headers: authHeader
                        })
                            .then(r => {
                                content.done.push(currentActivity);
                            })
                            .catch(ex => {
                            	console.log(ex);
                                content.pending.push(currentActivity);
                            })
                    );
                });
			}
        	return Promise.all(cpPromise);
        })
        .then(r => {
            res.json(content);
        })
        .catch(ex => {
            console.log(ex);
            if(ex.statusCode == 401)
                res.boom.unauthorized()
            else if(ex.statusCode == 400)
                res.boom.badRequest();
            else
                res.boom.badImplementation();
        })
});


function checkContentAuth(admins, uid) {
	//TODO aggiungere admin agli autorizzati (getSuperusers)
	return admins.indexOf(uid) != -1;
}

//p e' il json di una promo, che prima deve essere stato aggiornato con p.admins = [admin del content padre]
function deletePromo(p, authHeader) {
	return rp({
		uri:contentUrl + 'search/?t=promo&recurrency=' + (p.recurrency_group ? p.recurrency_group : p._id),
		method: 'GET',
		json:true,
		headers: authHeader
	})
	.then(r => {
		//WARN la cancellazione delle promo batch è asincrona, quindi è possibile che le immagini 
		//rimangano orfane a seconda dell'ordine in cui le promo vengono cancellate... i controlli seguenti
		//serve a garantire che non vengano cancellate immagini di promo ancora esistenti
		if(!p.recurrency_group && r.promos.length == 0 && p.deleteImages) //father without batch
			deleteImages(p.images, p.admins); 
		else if(p.recurrency_group && r.promos.length == 1) { //son without brothers, check if father exists
			rp({
				uri:contentUrl + 'contents/' + p.idcontent + '/promotions/' + p.recurrency_group,
				method: 'GET',
				json:true				
			})
			.catch(e => {
				if(e.statusCode == 404) deleteImages(p.images, p.admins);
			})
		}
		
		return rp({
			uri:contentUrl + 'contents/' + p.idcontent + '/promotions/' + p._id,
			method: 'DELETE',
			json:true,
			headers: authHeader
		})
	})
}

function checkOwnership(ids) {
	let promiseArr = [];
	for(let i=0; i<ids.length; i++) {
		promiseArr.push(rp({
			uri:uploadUrl + 'file/' + ids[i] + '/actions/owner',
			method: "POST",
			json: true
		}))
	}
	return Promise.all(promiseArr.map(p => p.catch(() => undefined))) //se l'immagine non esiste (db ex)
}


function deleteImages(imgIdsArr, admins) {
	let promiseArr = [];
	checkOwnership(imgIdsArr)
	.then(owners => {		
		let imgsAllowed = [];
		for(let i=0; i<owners.length; i++) {
			//verifica che l'owner della foto sia compreso tra gli admin del content, in tal caso rimuove 
			//la foto utilizzando il token applicativo di contentui (il tipo token deve essere autorizzato 
			//e presente nel campo appAdminTokenType del config di uploadms)
			//impedisce la cancellazione di foto non proprie quando si utilizza il token applicativo 
			//su DELETE di uploadms
			//Se le immagini hanno un owner che non e' più admin, su uploadms rimarranno orfane
			if(owners[i] != undefined) {
				if(admins.indexOf(owners[i].owner) != -1) {
					imgsAllowed.push(owners[i].id);
				}
			}
		}
		
		for(let i=0; i<imgsAllowed.length; i++) {	
			promiseArr.push(
				rp({
					uri:uploadUrl + 'file/' + imgsAllowed[i],
					method: "DELETE",
					headers: {
						authorization: "Bearer " + config.auth_token
					},
					json: true
				})
			)
		}
		Promise.all(promiseArr)
	})
	.catch(e => {
		console.log(e);
	})
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
					users.users[i].avatar = _userUIUrl + "users/actions/getprofileimage/" + users.users[i].avatar;
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
					type: config.ApplicationTokenTypes.contentAdminTokenType
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