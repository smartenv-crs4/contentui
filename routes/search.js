var config = require('propertiesmanager').conf;
var moment = require('moment');
var rp = require('request-promise');

let USER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoiY29udGVudG1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxODAzMTM2MzQ2NDI0fQ.c6QQR4daG_kfvme6nd4FqFnoOEkF2ejBo99uXZLMaRs";

let baseUrl = config.contentUIUrl + '/';
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');

module.exports = {
    search: (req, res, next) => {
        let text        = req.query.q;
        let sdate       = req.query.sdate;
        let edate       = req.query.edate;
        let type        = req.query.type || 'promo';
        let category    = req.query.category;        

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
                    + (category ? '&category=' + category : '');
        console.log(url)
        let options = {
            method:'GET',
            uri:contentUrl + 'search' + url,
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
    },


    likes: (req, res, next) => {
        let type = req.query.type;
        let idcontent = req.query.idcontent;
        let idpromo = req.query.idpromo;

        let url = 'contents/' + idcontent + (type == 'promo' ? '/promotions/' + idpromo : '') + '/actions/likes';
        let options = {
            method:'POST',
            uri:contentUrl + url,            
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
    }
}