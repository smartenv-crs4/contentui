var config = require('propertiesmanager').conf;
var moment = require('moment');
var rp = require('request-promise');
var request = require('request');
var express = require('express');
var router = express.Router();

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');

let access_token = config.auth_token;

//search api
router.get('/', (req, res, next) => {
    let text        = req.query.q;
    let sdate       = req.query.sdate;
    let edate       = req.query.edate;
    let type        = req.query.type || 'promo';
    let category    = req.query.category;
    let position    = req.query.position;
    if(position) postion = position.slice(',');

    if(sdate && edate) {
        try {
            console.log(sdate);
            sdate = moment(sdate).format("YYYY-MM-DD");
            edate = moment(edate).format("YYYY-MM-DD");
        }
        catch(e) {
            sdate = edate = undefined;
            console.log(e)
        }
    }
    
    let url =  '?t=' + type 
                + '&text=' + text 
                + (sdate && edate ? "&sdate=" + sdate + "&edate=" + edate : '') 
                + (category ? '&category=' + category : '')
                + (position ? '&position=' + position : '');
    console.log(url)
    let options = {
        method:'GET',
        uri:contentUrl + 'search' + url + '&access_token=' + config.auth_token,
        json:true
    }
    rp(options)
    .then((results) => {
        res.json(results);
    })
    .catch((err) => {
        res.status(500).send();;
        console.log(err);
    });
});

//like count api
router.get('/likes', (req, res, next) => {
    let type = req.query.type;
    let idcontent = req.query.idcontent;
    let idpromo = req.query.idpromo;

    let url = 'contents/' + idcontent + (type == 'promo' ? '/promotions/' + idpromo : '') + '/actions/likes'  + '?access_token=' + config.auth_token;
    let options = {
        method:'POST',
        uri:contentUrl + url,            
        json:true
    }
    rp(options)
    .then((results) => {
        console.log(results);
        res.json(results);
    })
    .catch((err) => {
        res.status(500).send();;
        console.log(err);
    });
});


module.exports = router;