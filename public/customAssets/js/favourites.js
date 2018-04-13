// var promotion_template=`
//     <div class="masonry-box" style="position: relative; height: 1183.56px;">
//
//         <!-- Blog Grid Left -->
//             <div class="blog-grid masonry-box-in col-2" style="position: absolute; left: 0px; top: 0px;">
//
//                 <img class="img-responsive" src="{{image}}" alt="">
//
//                 <div class="row g-mb-20">
//                     <!-- Coming Soon Plugn -->
//                     <div class="col-sm-8 g-md-mb-30">
//                         <div class="coming-soon-plugin">
//                             <div id="defaultCountdown"></div>
//                         </div>
//                     </div>
//                     <!-- End Coming Soon Plugin -->
//
//                     <!--price start-->
//                     <!--price end-->
//
//                 </div>
//
//                 <!--events date-->
//                 <div class="row g-mb-20">
//                     <!--event Start-->
//                     <div class="col-sm-6 g-md-mb-30">
//                         <div class="media">
//                             <div class="media-left">
//                                 <span class="promo-block-media-icon fa fa-calendar g-mr-10"></span>
//                             </div>
//                             <div class="media-body">
//                                 <span class="text-uppercase promo-block-media-subtitle" data-i18n="promotion.whenStart"></span>
//                                 <h5 id="whenstart" class="text-uppercase promo-block-media-title">{{start}}</h5>
//                             </div>
//                         </div>
//                     </div>
//                    <!-- End event Start-->
//
//                     <!--event End-->
//                     <div class="col-sm-6 g-md-mb-30">
//                         <div class="media">
//                             <div class="media-left">
//                                 <span class="promo-block-media-icon fa fa-calendar g-mr-10"></span>
//                             </div>
//                             <div class="media-body">
//                                 <span class="text-uppercase promo-block-media-subtitle" data-i18n="promotion.whenEnd"></span>
//                                 <h5 id="whenend" class="text-uppercase promo-block-media-title">{{end}}</h5>
//                             </div>
//                         </div>
//                     </div>
//                     <!-- End event End-->
//
//                     <!--Where   -->
//                     <div class="col-sm-12 g-md-mb-30">
//                         <div class="media">
//                             <div class="media-left">
//                                 <span class="promo-block-media-icon fa fa-map-marker g-mr-10"></span>
//                             </div>
//                             <div class="media-body">
//                                 <span class="text-uppercase promo-block-media-subtitle" data-i18n="promotion.where"></span>
//                                 <h5 id="where" class="text-uppercase promo-block-media-title">{{where}}</h5>
//                             </div>
//                         </div>
//                     </div>
//                     <!--Where  End -->
//
//                 </div>
//                 <!-- End events date-->
//             </div>
//         <!-- End Blog Grid Left -->
//
//
//             <!-- Blog Grid Right -->
//             <div class="blog-grid masonry-box-in col-2" style="position: absolute; left: 585px; top: 0px;">
//                 <h3>{{name}}</h3>
//                 <ul class="blog-grid-info">
//                     <li><a href="#"><i class="fa fa-thumbs-up"></i> 0</a> mi piace</li>
//                     <li><a href="#"><i class="fa fa-users"></i> 0</a> partecipanti</li>
//                 </ul>
//                 <p>{{description}}</p>
//
//             </div>
//             <!-- End Blog Grid Right-->
//     </div>`;



const lat=1;
const lon=0;

let mapInit;
let autocomplete;
let positionValid=false;
let currentPromotion=null;
let newPromotion=null;
let iLikeIt=false;
let iParticipateIt=false;



function getFavoutiteList(callback){

    jQuery.ajax({
        url: config.contentUIUrl + "/contents/actions/involvements?access_token="+ userToken,
        type: "GET",
        success: function(data, textStatus, xhr){
            console.log("!!!!!!!!!!!!!!!INVOLVEMENTS!!!!!!!!!!!!!!!!");
            console.log(data)
            callback(null,data.involvements);
        },
        error: function(xhr, status)
        {
            console.log(xhr);
            var msg;
            try{
                msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.500");
            }
            catch(err){
                msg = (xhr.statusText) ||  i18next.t("error.500");
            }
            msg="getFavoutiteList function:" + msg;
            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
            callback(msg,null);
        }
    });
}




function getPromotionsById(promotionsId, callbackPromotionsById){


    if(promotionsId.length>0){
        jQuery.ajax({
            url: config.contentUIUrl + "/contents/actions/search?t=promo&ids="+promotionsId.join(),
            type: "GET",
            success: function(data, textStatus, xhr){
                console.log("!!!!!!!!!!!!!!!GetPromoByID!!!!!!!!!!!!!!!!");
                console.log(data);
                callbackPromotionsById(null,data.promos);
            },
            error: function(xhr, status)
            {
                console.log(xhr);
                var msg;
                try{
                    msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.500");
                }
                catch(err){
                    msg = (xhr.statusText) ||  i18next.t("error.500");
                }
                msg="getPromotionsById function:" + msg;
                jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                callbackPromotionsById(msg,null);
            }
        });
    }else{
        callbackPromotionsById(null,[]);
    }


}


function completeInformationAboutpromotions(promotion,callbackToComplete){


        async.parallel({
            // get activity name
            name: function(callbackparallel) {
                jQuery.ajax({
                    url: config.contentUIUrl + "/contents/" + promotion.idcontent,
                    type: "GET",
                    success: function(data, textStatus, xhr){
                        callbackparallel(null,{name:data.name,link:config.contentUIUrl + "/activities/" + promotion.idcontent,promolink:config.contentUIUrl + "/activities/" + promotion.idcontent+"/promotions/"+promotion._id});
                    },
                    error: function(xhr, status)
                    {
                        var msg;
                        try{
                            msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.500");
                        }
                        catch(err){
                            msg = (xhr.statusText) ||  i18next.t("error.500");
                        }
                        msg="completeInformationAboutpromotions function:" + msg;
                        callbackparallel(msg,null);
                    }
                });
            },
            // get participants
            participants: function(callbackparallel) {
                getPromotionParticipants(promotion.idcontent,promotion._id,function(err,total){
                    if(err)  callbackparallel(err,null);
                    else callbackparallel(null,total);
                });
            },
            // get participants
            likes: function(callbackparallel) {
                getPromotionLikes(promotion.idcontent,promotion._id,function(err,total){
                    if(err)  callbackparallel(err,null);
                    else callbackparallel(null,total);
                });
            }
        }, function(err, results) {
            if(err) callbackToComplete(err,null);
            else{
                promotion.activity_name=results.name.name;
                promotion.activity_link=results.name.link;
                promotion.promo_link=results.name.promolink;
                promotion.participants=results.participants;
                promotion.likes=results.likes;
                callbackToComplete(null,promotion);
            }
        });
}

function compileAndSetFavouriteContent(promotionsToRender){
    let favourites_template   = $("#favourites_template").html();
    let favouritesHtml = Handlebars.compile(favourites_template);
    jQuery('#favouriteContent').html(favouritesHtml({promotions:promotionsToRender}));
    $('body').localize();
}




function getFavouritePage(){
    getFavoutiteList(function(err,list){
        if(!err){
            getPromotionsById(list,function(err_promos,promotions){
                if(!err_promos){
                    let promotionsToRender=[];
                    let current={};
                    let currentTime,startTime,endTime;
                    let promoType={
                        1:"rgba-red",
                        2:"rgba-blue"
                    };

                    if(promotions) {
                        async.each(promotions, function(currentPromo, callback) {
                            completeInformationAboutpromotions(currentPromo,function(err,updatedpromotions){
                                if(!err) {
                                    current = {};
                                    initTitleJsonMultilanguage(updatedpromotions.name,updatedpromotions._id);
                                    current.title = updatedpromotions._id +".title";
                                    initDescriptionJsonMultilanguage(updatedpromotions.description,updatedpromotions._id,200,"\xa0");
                                    current.description = updatedpromotions._id +".description";
                                    initGenericContentJsonMultilanguage(updatedpromotions.activity_name,updatedpromotions._id,"activity_name");
                                    current.activity_name = updatedpromotions._id +".activity_name";
                                    current.activity_link=updatedpromotions.activity_link;
                                    current.promo_link=updatedpromotions.promo_link;
                                    //current.start_date = moment(updatedpromotions.startDate).format('MMMM Do YYYY, HH:mm');
                                    current.start_date = moment.tz(updatedpromotions.startDate, _tz).format('MMMM Do YYYY, HH:mm');
                                    //current.end_date = moment(updatedpromotions.endDate).format('MMMM Do YYYY, HH:mm');
                                    current.end_date = moment.tz(updatedpromotions.endDate, _tz).format('MMMM Do YYYY, HH:mm');
                                    //currentTime = (new Date()).getTime();
                                    currentTime = moment.tz(_tz).valueOf();
                                    //startTime = (new Date(updatedpromotions.startDate)).getTime();
                                    startTime = moment.tz(updatedpromotions.startDate, _tz).valueOf();
                                    //endTime = (new Date(updatedpromotions.endDate)).getTime();
                                    endTime = moment.tz(updatedpromotions.endDate, _tz).valueOf();
                                    current.completeness = (currentTime < startTime) ? 0 : (currentTime > endTime) ? 100 : Math.round((((currentTime - startTime) / (endTime - startTime))*100));
                                    current.participants = updatedpromotions.participants;
                                    current.likes = updatedpromotions.likes;
                                    current.flag = {text: updatedpromotions.type._id, color:promoType[updatedpromotions.type._id]};
                                    current.image=config.contentUIUrl+"/utils/image?imageUrl="+encodeURIComponent(updatedpromotions.images[0]),
                                    promotionsToRender.push(current);
                                    callback();
                                }else{
                                    callback(err);
                                }
                            });

                        }, function(err) {
                            if( err ) {
                                msg="getFavouritePage function:" + err;
                                jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                            } else {

                                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                                console.log(promotionsToRender);

                                compileAndSetFavouriteContent(promotionsToRender);
                            }
                        });
                    }else{
                        compileAndSetFavouriteContent(promotionsToRender);
                    }

                    // jQuery('#favouriteContent').html(favouritesHtml({
                    //     promotions: [
                    //         {title: "Yehuda",description:"lorem ipsum",activity_name:"La spigola Ristorante",start_date:new Date().toUTCString(),end_date:new Date(new Date() + 10 ),completeness:50,participants:10,likes:20,flag:{text:"sport", color:"rgba-default"}},
                    //         {title: "Carl",description:"lorem ipsum",activity_name:"L Orata Ristorante",start_date:new Date().toUTCString(),end_date:new Date(new Date() + 10 ),completeness:90,participants:20,likes:30,flag:{text:"eventi", color:"rgba-red"}},
                    //         {title: "Alan",description:"lorem ipsum",activity_name:"La cernia Ristorante",start_date:new Date().toUTCString(),end_date:new Date(new Date() + 10 ),completeness:20,participants:5,likes:40,flag:{text:"cibo", color:"rgba-blue"}}
                    //     ]
                    // }));




                }else{
                    msg="getFavouritePage function:" + err_promos;
                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                }
            })
        }else{
            msg="getFavouritePage function:" + err;
            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
        }
    });



}


function compileFavourites(){

    getFavouritePage();


};


function openFavouritePage(){

    compileFavourites();


    if(tokenError){
        jQuery.jGrowl(tokenError, {theme:'bg-color-red', life: 5000});
    }
}



// function initfavouritePage(){
//    addEventListener('promotionLanguageManagerInitialized', function (e) {
//        openFavouritePage();
//    }, false);
// }












