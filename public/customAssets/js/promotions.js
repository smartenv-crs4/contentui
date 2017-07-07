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





function geocodeLatLng(lat, lng,callback) {
    let geocoder = new google.maps.Geocoder;
    let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    let address = null;
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            console.log("*************************************");
            console.log(results);
            if (results[1]) {
                console.log(results[0].formatted_address);
                address = results[0].formatted_address;
            } else {
                window.alert('No results found');
                return callback('No results found',null);
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
            return callback('Geocoder failed due to: ' + status,null);
        }
        return callback(null,address);
    });
}



function getPromotionPage(data,token){

    var promotion_template   = $("#promotion_template").html();
    var promotionHtml = Handlebars.compile(promotion_template);

    var prom={
        image:data.images[0],
        start:moment(data.startDate).format('MMMM Do YYYY, h:mm:ss a'),
        end:moment(data.endDate).format('MMMM Do YYYY, h:mm:ss a'),
        where:"Location",
        name:data.name,
        description:data.description,
        price:data.price,
        token:token
    };


    // console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\Promotion");
    // console.log(prom);

    geocodeLatLng(data.position[0],data.position[1],function(err,position){
        if(!err){
            $('#where').text(position);
        }
    });


    jQuery('#promotionContent').html(promotionHtml(prom));
    $('body').localize();
    MasonryBox.initMasonryBox();
    StyleSwitcher.initStyleSwitcher();
    initPageComingSoon(data.startDate);
    initMap(data.position[0],data.position[1],false);
}


function compilePromotion(){


// <script>
//     var source   = $("#entry-template").html();
//     var template = Handlebars.compile(source);
//     var promotionBody = JSON.parse('<%- promotionBody %>');
//     var html=template(promotionBody);
//     $("#entry-template-html").html(html);
// </script>



    jQuery.ajax({
        url: config.contentUIUrl + "/promotions/"+ contentID+ "/" + promotionID ,
        type: "GET",
        success: function(data, textStatus, xhr)
        {

            if(userToken){
                async.series([
                        // Decode token
                        function(callback) {
                            jQuery.ajax({
                                url: config.contentUIUrl + "/token/decode?decode_token="+ userToken,
                                type: "GET",
                                success: function(data, textStatus, xhr){
                                    if(data.valid){
                                        callback(null, data);
                                    }else{
                                        callback("invalid Token", null);
                                    }
                                },
                                error: function(xhr, status)
                                {
                                    var msg;
                                    try{
                                        msg = xhr.responseJSON.error_message;
                                    }
                                    catch(err){
                                        msg = "invalid Token";
                                    }

                                    console.log("DECODE TOKEN CALL");
                                    console.log(xhr);
                                    callback(msg,null);

                                }
                            });
                        },
                        // get Admin Token Type
                        function(callback) {
                            jQuery.ajax({
                                url: config.contentUIUrl + "/token/admintokens",
                                type: "GET",
                                success: function(data, textStatus, xhr){
                                    callback(null, data.superuser);
                                },
                                error: function(xhr, status){

                                    var msg;
                                    try{
                                        msg = xhr.responseJSON.error_message;
                                    }
                                    catch(err){
                                        msg = "error in get admin Token Types";
                                    }
                                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                                    callback(null,[]); // no admins token type
                                    // return;
                                }
                            });
                        },

                        // Get Content Admins
                        function(callback) {
                            jQuery.ajax({
                                url: config.contentUIUrl + "/contents/"+ contentID,
                                type: "GET",
                                success: function(data, textStatus, xhr){
                                    var admins=[data.owner];
                                    admins=admins.concat(data.admins);
                                    callback(null, admins);
                                },
                                error: function(xhr, status){

                                    var msg;
                                    try{
                                        msg = xhr.responseJSON.error_message;
                                    }
                                    catch(err){
                                        msg = "error in get content";
                                    }


                                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                                    callback(null,[]);//no contents admins
                                    // return;
                                }
                            });
                        }
                ],
                // optional callback
                function(err, results) {
                    if(err){
                        jQuery.jGrowl(err, {theme:'bg-color-red', life: 5000});
                        getPromotionPage(data,null);
                    }else{
                        var tokenOwner=results[0].token._id;

                        if(results[1].indexOf(results[0].token.type)>=0){
                            getPromotionPage(data,tokenOwner);
                        }else{
                            if(results[2].indexOf(tokenOwner)>=0){
                                getPromotionPage(data,tokenOwner);
                            }else{
                                getPromotionPage(data,null);
                            }
                        }
                    }
                });

            }else{
                getPromotionPage(data,null);
            }
        },
        error: function(xhr, status)
        {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(config.contentUIUrl + "promotions/"+ contentID+ "/" + promotionID);
            console.log(xhr);
            var msg;
            try
            {
                msg = xhr.responseJSON.error_message;
            }
            catch(err)
            {
                msg = i18next.t("error.internal_server_error");
            }

            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});

            return;
        }
    });

};




function getPromotions()
{
   if(canTranslate){
       console.log("Can Translate");
       compilePromotion();
   } else{
       console.log("Wait TO Translate");
       addEventListener('promotionLanguageManagerInitialized', function (e) {
           canTranslate=true;
           console.log("Now Can Translate");
          compilePromotion();
       }, false);
   }


}




function initMap(latitude,longitude,editable) {


    var map = new GMaps({
        div: '#map',
        scrollwheel: false,
        lat: latitude,
        lng: longitude,
        zoom: 12,
        click: function (event) {
            if(editable) {
                latitude = event.latLng.lat();
                longitude = event.latLng.lng();
                marker.setPosition(new google.maps.LatLng(latitude, longitude));
            }
        }
    });

    var marker = map.addMarker({
        lat: latitude,
        lng: longitude
    });

    addEventListener('zoomMap', function (e) {
        map.setZoom(20);
    }, false);

}



function mapZoom(){
    var event = new Event('zoomMap');
    dispatchEvent(event);
}





function updateProfile()
{
    var data = {"user":{}};


    jQuery("#profile .updatable").each(function(){
        var celement=$(this);
        var name = celement.data("name");
        celement.removeClass("updatable");
        var value= this.textContent;
        if(this.innerHTML.indexOf("<mark>")>=0)
          this.innerHTML=this.textContent;
        data.user[name]=value;
    });


    jQuery.ajax({
        url: _userMsUrl + "/users/" + userData._id+"?access_token=" + userData.UserToken,
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(dataResp, textStatus, xhr)
        {

            jQuery.jGrowl(i18next.t("profile.saved"), {theme:'bg-color-green1', life: 5000});

            jQuery("#profileCancel").removeClass().addClass("btn-u btn-u-default").attr("disabled","disabled");
            jQuery("#profileSave").removeClass().addClass("btn-u btn-u-default").attr("disabled","disabled");

            _.each(data.user,function(value,key){
              userData[key]=value;
            });

            if(!_.isEmpty(data.user.avatar))
              jQuery('#imgBox').attr("src", _userMsUrl + "/users/actions/getprofileimage/" +userData.avatar+"?access_token=" + userData.UserToken);


            // var defaultImg = "assets/img/team/img32-md.jpg";
            //
            // if(data.user.logo)
            // {
            //     jQuery("#imgBox").attr("src", data.user.logo);
            //     sessionStorage.logo = data.user.logo;
            // }
            // else
            // {
            //     jQuery("#imgBox").attr("src", defaultImg);
            //     sessionStorage.logo = undefined;
            // }
        },
        error: function(xhr, status)
        {
            var msg;
            try
            {
                msg = xhr.responseJSON.error_message;
            }
            catch(err)
            {
                msg = i18next.t("error.internal_server_error");
            }

            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});

            return;
        }
    });
}



function openBrowseFile(){
    $('#loadThumbnailImageProfile').click();
}


function loadProfileImage(){
    var file=$('#loadThumbnailImageProfile')[0].files[0];

    var fd = new FormData();
    fd.append( file.name.split(".")[0], file);

    jQuery.ajax({
        url: _userMsUrl + "/users/actions/uploadprofileimage",
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            jQuery('#ed-avatarButton').click();
//            console.log(jQuery('#ed-avatar').html());
            jQuery('#ed-avatar').html(data.filecode).blur();
            jQuery('#profileSave').click();
        },
        error: function(xhr, status)
        {

            var errType="error." + xhr.status;
            var msg=i18next.t(errType);

            try{
                msg = msg + " --> " + xhr.responseJSON.error_message;
            }
            catch(err){ }
           jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
        }
    });
}


function changePassword()
{
    if(!userData.UserToken)
    {
        redirectToResetPassword();
    }

    var oldPassword = jQuery("#oldPassword").val();
    var newPassword = jQuery("#newPassword1").val();
    var newPassword2 = jQuery("#newPassword2").val();

    var respBlock = jQuery("#responseBlock");

    if(newPassword !== newPassword2 || newPassword === "")
    {

        respBlock.html(i18next.t("error.password_differs"));
        respBlock.removeClass("hidden");
        return;
    }

    var data = new Object();
    data.oldpassword = oldPassword;
    data.newpassword = newPassword;


    console.log(_userMsUrl + "/users/" +  userData._id + "/actions/setpassword");


    jQuery.ajax({
        url: _userMsUrl + "/users/" +  userData._id + "/actions/setpassword",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(dataResp, textStatus, xhr)
        {
            respBlock.addClass("hidden");
            jQuery('#tabProfile').click();
            jQuery("#oldPassword").val("");
            jQuery("#newPassword1").val("");
            jQuery("#newPassword2").val("");
            jQuery.jGrowl(i18next.t("profile.passwordSaved"), {theme:'bg-color-green1', life: 5000});

        },
        error: function(xhr, status)
        {
            var msg;

            console.log("$$$$$$$$$$$$$$$$$$ RESET PAssword");
            console.log(xhr);
            console.log(status);

            try
            {
                msg = xhr.responseJSON.error_message;
            }
            catch(err)
            {
                msg = i18next.t("error.internal_server_error");
            }

            respBlock.html(msg);
            respBlock.removeClass("hidden");

            return;
        },
        beforeSend: function(xhr, settings)
        {
            xhr.setRequestHeader('Authorization','Bearer ' +  userData.UserToken);
        }
    });

}





