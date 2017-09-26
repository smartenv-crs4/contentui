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


    promos: (req, res, next) => {
        let options = {
            method:'GET',
            uri:contentUrl + 'contents/' + req.query.cid + '/promotions/?access_token=' + config.auth_token,
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

    activities: (req, res, next) => {
        let options = {
            method:'GET',
            uri:contentUrl + 'search/?t=content' + '&by_uid=' + IDUSER + '&access_token=' + config.auth_token,
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


}