var config = require('propertiesmanager').conf;
var moment = require('moment');
var rp = require('request-promise');

let baseUrl = config.contentUIUrl + '/';
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');

module.exports = {
    list: (req, res, next) => { res.render('mobile/list', { baseUrl:baseUrl }); },
    form: (req, res, next) => { res.render('mobile/form', { baseUrl:baseUrl }); },

    //GET promotions del content selezionato
    promos: (req, res, next) => {
        let options = {
            method:'GET',
            headers: {Authorization: "Bearer " + config.auth_token},
            uri:contentUrl + 'contents/' + req.query.cid + '/promotions/',
            json:true
        }
        sendReq(res, options, "promos");
    },

    promotypes: (req, res, next) => {
        let options = {
            method:'GET',
            headers: {Authorization: "Bearer " + config.auth_token},
            uri:contentUrl + 'promotype/',
            json:true
        }
        sendReq(res, options, "promotype");
    },

    //GET lista contents dell'utente
    activities: (req, res, next) => {
        let uid = req.query.uid;
        let options = {
            method:'GET',
            headers: {Authorization: "Bearer " + config.auth_token},
            uri:contentUrl + 'search/?t=content' + '&by_uid=' + uid,
            json:true
        }
        sendReq(res, options, "contents");
    },

    //POST su promotions
    save: (req, res, next) => {        
        let promo = {
            idcontent: req.params.cid,
            name: req.body.title,
            description: req.body.desc,
            startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
            endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
            position: [Number(req.body.lon), Number(req.body.lat)],
            lat: Number(req.body.lat),
            lon: Number(req.body.lon),
            price: Number(req.body.price),
            address: req.body.address,
            town: req.body.town,
            type: req.body.type
        };

        let options = {
            method:'POST',
            headers: {Authorization: req.get("Authorization")},
            body: promo,
            uri:contentUrl + 'contents/' + req.params.cid + '/promotions/',
            json:true
        }
        sendReq(res, options);
    },

    //DELETE
    delete: (req, res, next) => {
        let options = {
            method:'DELETE',
            headers: {Authorization: req.get("Authorization")},            
            uri:contentUrl + 'contents/' + req.params.cid + '/promotions/' +req.params.pid,
            json:true
        }
        sendReq(res, options);
    }
}

function sendReq(res, options, label) {
    rp(options)
    .then((results) => { 
        res.json(label ? results[label] : results);
    })
    .catch((err) => {
        console.log(err);
        if(err.statusCode) res.status(err.statusCode).send();
        else res.status(500).send();
    });
}