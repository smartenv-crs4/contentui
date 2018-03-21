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
            msg="decodetoken in comlilepromotion Function:" + msg;
            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
            callback(msg,null);
        }
    });
}




function getPromotionsById(promotionsId, callbackPromotionsById){



    async.each(promotionsId, function(promotion, callback) {
        jQuery.ajax({
            url: config.contentUIUrl + "/contents/:id/promotions/:pid",
            type: "GET",
            success: function(data, textStatus, xhr){
                console.log("!!!!!!!!!!!!!!!INVOLVEMENTS!!!!!!!!!!!!!!!!");
                console.log(data);
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
                msg="decodetoken in comlilepromotion Function:" + msg;
                jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                callback(msg,null);
            }
        });

    }, function(err) {
        // if any of the file processing produced an error, err would equal that error
        if( err ) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A file failed to process');
        } else {
            console.log('All files have been processed successfully');
        }
    });
}


function getFavouritePage(){




    var favourites_template   = $("#favourites_template").html();
    var favouritesHtml = Handlebars.compile(favourites_template);
    getFavoutiteList();

    jQuery('#favouriteContent').html(favouritesHtml({
        people: [
            {title: "Yehuda",description:"lorem ipsum",activity_name:"La spigola Ristorante",start_date:new Date().toUTCString(),end_date:new Date(new Date() + 10 ),completeness:50,participants:10,likes:20,flag:{text:"sport", color:"rgba-default"}},
            {title: "Carl",description:"lorem ipsum",activity_name:"L Orata Ristorante",start_date:new Date().toUTCString(),end_date:new Date(new Date() + 10 ),completeness:90,participants:20,likes:30,flag:{text:"eventi", color:"rgba-red"}},
            {title: "Alan",description:"lorem ipsum",activity_name:"La cernia Ristorante",start_date:new Date().toUTCString(),end_date:new Date(new Date() + 10 ),completeness:20,participants:5,likes:40,flag:{text:"cibo", color:"rgba-blue"}}
        ]
    }));
    $('body').localize();

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



function initfavouritePage()
{
   if(canTranslate){
       openFavouritePage();
   } else{
       addEventListener('promotionLanguageManagerInitialized', function (e) {
           canTranslate=true;
           openFavouritePage();
       }, false);
   }


}












