var config = require('propertiesmanager').conf;
var moment = require('moment');
var rp = require('request-promise');
var request = require('request');

let baseUrl = config.contentUIUrl + '/';
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');

let access_token = config.auth_token;


module.exports = {
    render: (req, res, next) => {
        request.get(config.commonUIUrl + "/headerAndFooter" 
                    + "?homePage=/" 
                    + "&afterLoginRedirect=" + config.contentUIUrl 
                    + "&fastSearchUrl=/"
                    + "&loginHomeRedirect=" + baseUrl,
                    function (error, response, body) {

            if (error) 
                console.log("ER " + error);
            
            var commonBody = body ? JSON.parse(body) : undefined;

            return res.render('search', {
                access_token:access_token,
                commonUI:{
                  footer: commonBody ? commonBody.footer.html : undefined,
                  footerCss: commonBody ? commonBody.footer.css : undefined,
                  footerScript: commonBody ? commonBody.footer.js : undefined,
                  header: commonBody ? commonBody.header.html : undefined,
                  headerCss: commonBody ? commonBody.header.css : undefined,
                  headerScript: commonBody ? commonBody.header.js : undefined,
                  languagemanager:config.languageManagerLibUrl
                },               
                baseUrl:baseUrl, 
                contentUrl:contentUrl, 
                scheduleUrl:scheduleUrl
            });  
        });
    },


    search: (req, res, next) => {
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