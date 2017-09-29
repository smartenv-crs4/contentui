var config = require('propertiesmanager').conf;
var moment = require('moment');
var rp = require('request-promise');
var common = require('./common');

let baseUrl = config.contentUIUrl + '/';
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');

let access_token = config.auth_token;

const IDUSER = 'abcbabcabcbabcbabcba1234'; //TODO recuperare da login

module.exports = {
    list: (req, res, next) => { res.render('mobile/list', { baseUrl:baseUrl }); },
    form: (req, res, next) => { res.render('mobile/form', { baseUrl:baseUrl }); },

    //GET promotions del content selezionato
    promos: (req, res, next) => {
        let options = {
            method:'GET',
            headers: {access_token: config.auth_token},
            uri:contentUrl + 'contents/' + req.query.cid + '/promotions/',
            json:true
        }
        rp(options)
        .then((results) => {
            res.json(results.promos);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();;
        });
    },

    //GET lista contents dell'utente
    activities: (req, res, next) => {
        let options = {
            method:'GET',
            headers: {access_token: config.auth_token},
            uri:contentUrl + 'search/?t=content' + '&by_uid=' + IDUSER,
            json:true
        }
        rp(options)
        .then((results) => {                        
            res.json(results.contents);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();;
        });
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
            address: req.body.address
        };

        let options = {
            method:'POST',
            headers: {access_token: config.auth_token},
            body: promo,
            uri:contentUrl + 'contents/' + req.params.cid + '/promotions/?fakeuid=' + IDUSER,
            json:true
        }
        rp(options)
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            console.log(err);
            res.status(err.statusCode).send();
        });
    },

    //DELETE
    delete: (req, res, next) => {
        let options = {
            method:'DELETE',
            headers: {access_token: config.auth_token},            
            uri:contentUrl + 'contents/' + req.params.cid + '/promotions/' +req.params.pid + '?fakeuid=' + IDUSER,
            json:true
        }
        rp(options)
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            console.log(err);
            res.status(err.statusCode).send();
        });
    }
}