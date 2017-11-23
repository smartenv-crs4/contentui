var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');
var FormData = require('form-data');
var renderPage=require('./render');

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let commonUIUrl = config.commonUIUrl + (config.commonUIUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');

////////////////////////////////
// Page rendering routes only //
////////////////////////////////


//search page
router.get('/',         (req, res, next) => {
  let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;
  renderPage.renderPage(res, 'search', {
      baseUrl:baseUrl, 
      contentUrl:contentUrl, 
      scheduleUrl:scheduleUrl,
      access_token: access_token,
      commonUIUrl:commonUIUrl
  });
});


//new activity
router.get('/activities/new',       (req, res, next) => {
  let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;		
  return renderPage.renderPage(res, 'activities/form_activity', {
    activityBody: undefined,
    params: JSON.stringify(req.params),
    query: JSON.stringify(req.query),
    baseUrl:baseUrl,
    uploadUrl:uploadUrl,
    contentUrl:contentUrl,
    commonUIUrl:commonUIUrl,
    access_token: access_token,
    contentAdminTypes: config.contentAdminTokenType
  });
});


//Edit content
router.get('/activities/:id/edit',  (req, res, next) => {
  getActivity(req, res, true);
});


// activity get content
router.get('/activities/:id',    (req, res, next) => {
  getActivity(req, res);
});   

// promotions
router.get('/activities/:aid/promotions/new', function(req, res, next) {
    var activity_id = req.params.aid;
    var access_token=req.query.access_token || null;



    renderPage.renderPage(res,'view_promotion',{
        access_token:access_token,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        },
        contentID:activity_id,
        promotionID:null,
        isANewPromotion:true
    });
});


/* GET environment info page. */
router.get('/env', function(req, res) {
    var env;
    if (process.env['NODE_ENV'] === 'dev')
        env='dev';
    else
        env='production';

    res.status(200).send({env:env});
});



router.get('/activities/:aid/promotions/:pid', function(req, res, next) {


    var activity_id = req.params.aid;
    var promotion_id = req.params.pid;
    var access_token=req.query.access_token || (req.parseHasTagAsQuery && req.parseHasTagAsQuery.access_token) || null;



    renderPage.renderPage(res,'view_promotion',{
        access_token:access_token,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        },
        contentID:activity_id,
        promotionID:promotion_id,
        isANewPromotion:false
    });
});

module.exports = router;



function getActivity(req, res, edit) {
	let activity_id = req.params.id;
	let abody = undefined;
	let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;
	rp(contentUrl+"contents/"+activity_id)
	.then(body => {
		abody = JSON.parse(body);		
		renderPage.renderPage(res, 'activities/' + (edit ? 'form_activity' : 'view_activity'), {
			activityBody: abody,
			activityId: activity_id,
			params: edit ? JSON.stringify(req.params) : undefined,
			query: edit ? JSON.stringify(req.query) : undefined,
			baseUrl: baseUrl,
			uploadUrl: uploadUrl,
            contentUrl: contentUrl,
            commonUIUrl:commonUIUrl,
			access_token: access_token,
			contentAdminTypes: config.contentAdminTokenType
		});
	})
	.catch(e => {
		console.log(e);
		res.boom.badImplementation();
	})
} 