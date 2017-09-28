var config = require('propertiesmanager').conf;
var moment = require('moment');
var rp = require('request-promise');
var request = require('request');
var common = require('./common');

let baseUrl = config.contentUIUrl + '/';
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');

let access_token = config.auth_token;

const IDUSER = 'abcbabcabcbabcbabcba1234'; //TODO recuperare da login

module.exports = {
    render: (req, res, next) => {        
        res.render('mobile/mobile', {
            baseUrl:baseUrl
        });
    },

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
            res.status(500).send();;
            console.log(err);
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
            res.status(500).send();;
            console.log(err);
        });
    },

    //POST su promotions
    save: (req, res, next) => {        
        let promo = {
            idcontent: req.params.cid,
            name: req.body.title,
            description: req.body.desc,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
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
    }

}