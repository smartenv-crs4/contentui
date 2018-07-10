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
const _maxEvents = 10; //ds

let mapInit;
let autocomplete;
let positionValid=false;
let currentPromotion=null;
let newPromotion=null;
let iLikeIt=false;
let iParticipateIt=false;


function loadPromotionImage(){

    var file=$('#updatePicture')[0].files[0];
    var fd = new FormData();
    fd.append( file.name.split(".")[0], file);


    jQuery.ajax({
        url: config.contentUIUrl + "/utils/uploadImage?access_token="+userToken,
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            $('#promotionImage').attr("src",data.resourceUrl);
            updatePromotionField('images',data.filecode==(currentPromotion.images && currentPromotion.images[0]) ? null:[data.filecode],true);

        },
        error: function(xhr, status)
        {

            var errType="error." + xhr.status;
            var msg=i18next.t(errType);

            try{
                msg = msg + " --> " + xhr.responseJSON.error_message;
            }
            catch(err){ }
            msg="loadPromotionImage function:"+msg;
            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
        }
    });
}

function promotionPictureOpenDialog(){
    $("#updatePicture").trigger("click");
}

function geocodeLatLng(lat, lng,callback) {
    let geocoder = new google.maps.Geocoder;
    let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    let address = null;
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
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


function fillInAddress(){
    setPositionValidity(true);
    let place = autocomplete.getPlace();
    mapInit.marker.setPosition(place.geometry.location);
    mapInit.map.map.setCenter(place.geometry.location);

    let address = $('#promotionWhere').val();
    updatePromotionField('address',address==currentPromotion.address?null:address,true);

    let pos=[null,null];
    pos[lat]=place.geometry.location.lat();
    pos[lon]=place.geometry.location.lng();
    currentPromotion.position=(currentPromotion.position) || ["nd","nd"];
    updatePromotionField('position',arrayAreEquals(pos,currentPromotion.position)?null:pos,true);

}



function geocodeAddress(address,callback) {
    let geocoder = new google.maps.Geocoder;
    let addressLatLng={};
    geocoder.geocode({address:address}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                addressLatLng.address = results[0].formatted_address;
                addressLatLng.position = results[0].geometry.location;
            } else {
                //window.alert('No results found');
                return callback('No results found',null);
            }
        } else {
            //window.alert('Geocoder failed due to: ' + status);
            return callback('Geocoder failed due to: ' + status,null);
        }
        return callback(null,addressLatLng);
    });
}
function getPositionLatLon(){

    if(!positionValid) {
        let address = $('#promotionWhere').val();
        geocodeAddress(address, function (err, position) {
            if (!err) {
                mapInit.marker.setPosition(position.position);
                mapInit.map.map.setCenter(position.position);
                let pos=[null,null];
                pos[lat]=position.position.lat();
                pos[lon]=position.position.lng();
                currentPromotion.position=(currentPromotion.position) || ["nd","nd"];
                updatePromotionField('position',arrayAreEquals(pos,currentPromotion.position)?null:pos,true);
            }
        });
        setPositionValidity(true);
    }
}

function setPositionValidity(value){
    positionValid=value;
}


function openModalParticipants(){
    $('#modalParticipants').modal('show');
}



// function savePromotion(){
//
//     getPositionLatLon(); // align address with lat lon
//
//
//     jQuery.ajax({
//         url: config.contentUIUrl + "/promotions/"+ contentID+ "/" + promotionID ,
//         type: "PUT",
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify({promotion:newPromotion,user:userToken}),
//         dataType: "json",
//         success: function(dataResp, textStatus, xhr)
//         {
//             compileFavourites();
//         },
//         error: function(xhr, status)
//         {
//             var respBlock = jQuery("#responseBlock");
//             var msg;
//
//             try
//             {
//                 msg = xhr.responseJSON.error_message || xhr.responseJSON.message;
//             }
//             catch(err)
//             {
//                 msg = i18next.t("error.internal_server_error");
//             }
//
//             respBlock.html(msg);
//             respBlock.removeClass("hidden");
//
//             return;
//         }
//     });
// }
//


function addNotValid(element,section,label,em,message){
    $("#"+label).addClass("state-error");
    $("#"+section).append('<em id=\"'+em+'\" class=\"invalid\">'+message+'</em>');
    element.addClass("invalid");
}

function removeNotValid(element,section,label,em){
    $("#"+label).removeClass("state-error");
    $("#"+em).remove();
    element.removeClass("invalid");
}


function validateMultilanguageFields(invalidate){
    let responseToReturn=true;

    let promotionTitle=$('#promotionTitle');
    if(promotionTitle.val()=="") {
        if(invalidate)
            addNotValid(promotionTitle,'sTitle','lTitle','iTitle',i18next.t("validate.voidTitle"));
        responseToReturn=false;
    }else{
        removeNotValid(promotionTitle,'sTitle','lTitle','iTitle');
    }


    let promotionDescription=$('#promotionDescription');
    if(promotionDescription.val()=="") {
        if(invalidate)
            addNotValid(promotionTitle,'sDescription','lDescription','iDescription',i18next.t("validate.voidDescription"));
        responseToReturn=false;
    }else{
        removeNotValid(promotionTitle,'sDescription','lDescription','iDescription');
    }

    return responseToReturn;

}

function validateFields(){

    let responseToReturn=validateMultilanguageFields(true);
    // let promotionTitle=$('#promotionTitle');
    // if(promotionTitle.val()=="") {
    //     addNotValid(promotionTitle,'sTitle','lTitle','iTitle',i18next.t("validate.voidTitle"));
    //     responseToReturn=false;
    // }else{
    //     removeNotValid(promotionTitle,'sTitle','lTitle','iTitle');
    // }
    //
    //
    // let promotionDescription=$('#promotionDescription');
    // if(promotionDescription.val()=="") {
    //     addNotValid(promotionTitle,'sDescription','lDescription','iDescription',i18next.t("validate.voidDescription"));
    //     responseToReturn=false;
    // }else{
    //     removeNotValid(promotionTitle,'sDescription','lDescription','iDescription');
    // }


    let promotionPrice=$('#promotionPrice');
    if(!((promotionPrice.val().search(/\b\d+\b|^.{0}$/igm)) >= 0)) {
        addNotValid(promotionPrice,'sPrice','lPrice','iPrice',i18next.t("validate.noNumericPrice"));
        responseToReturn=false;
    }else{
        removeNotValid(promotionPrice,'sPrice','lPrice','iPrice');
    }


    let promotionWhere=$('#promotionWhere');
    if(promotionWhere.val()=="") {
        addNotValid(promotionWhere,'sWhere','lWhere','iWhere',i18next.t("validate.voidWhere"));
        responseToReturn=false;
    }else{
        removeNotValid(promotionWhere,'sWhere','lWhere','iWhere');
    }


    var selectedOption = $("#promotype input:radio:checked").val();
    if(!selectedOption) {
        $('#dType').show();
        responseToReturn=false;
    }else{
        $('#dType').hide();
    }


    var selectedOptionC =$("input[name='category']:checkbox:checked").val();
    if(!selectedOptionC) {
        $('#dType').show();
        responseToReturn=false;
    }else{
        if(selectedOption)
            $('#dType').hide();
    }


    if((newPromotion.images && (newPromotion.images.length>=0))|| (currentPromotion.images && (currentPromotion.images.length>=0))){
        $('#dPicture').hide();
    } else{
        $('#dPicture').show();
        responseToReturn=false;
    }

    var startPicher=$('#promotionStartDate');
    if((!newPromotion.startDate)&&(!currentPromotion.startDate)) {
        addNotValid(startPicher,'sStartDate','datetimepickerStart','iStartDate',i18next.t("validate.voidStartDate"));
        responseToReturn=false;
    }else{
        removeNotValid(startPicher,'sStartDate','datetimepickerStart','iStartDate');
    }


    var endPicher=$('#promotionEndDate');
    if((!newPromotion.endDate)&&(!currentPromotion.endDate)) {
        addNotValid(endPicher,'sEndDate','datetimepickerEnd','iEndDate',i18next.t("validate.voidEndDate"));
        responseToReturn=false;
    }else{
        removeNotValid(endPicher,'sEndDatee','datetimepickerStart','iEndDate');
    }


    return(responseToReturn);

}

function savePromotion(iSANewPromotion){

    newPromotion.startDate  = moment(newPromotion.startDate).utc();
    newPromotion.endDate    = moment(newPromotion.endDate).utc();

    if(validateFields()){
        getPositionLatLon(); // align address with lat lon

        if(iSANewPromotion){
            jQuery.ajax({
                url: config.contentUIUrl + "/contents/" + contentID +"/promotions",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({promotion: newPromotion, user: userToken}),
                dataType: "json",
                success: function (dataResp, textStatus, xhr) {
                    promotionID= dataResp._id;
                    ds_saveRecurrencies(promotionID, dataResp, function() {
                        window.location.href=config.contentUIUrl + "/activities/" + contentID +"/promotions/"+promotionID;
                    }); //ds
                    //compileFavourites();
                },
                error: function (xhr, status) {

                    var respBlock = jQuery("#responseBlock");
                    var msg;

                    try {
                        msg = xhr.responseJSON.error_message || xhr.responseJSON.message || i18next.t("error.nofullfield");
                    }
                    catch (err) {
                        msg = i18next.t("error.internal_server_error");
                    }


                    console.log(xhr);
                    respBlock.html(msg);
                    respBlock.removeClass("hidden");

                    return;
                }
            });
        }else {

            jQuery.ajax({
                url: config.contentUIUrl + "/contents/" + contentID + "/promotions/" + promotionID,
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({promotion: newPromotion, user: userToken}),
                dataType: "json",
                success: function (dataResp, textStatus, xhr) {
                    //i18next.reloadResources();
                    compilePromotion();
                    ds_saveRecurrencies(promotionID, dataResp); //ds
                    // window.location.href=config.contentUIUrl + "/activities/" + contentID +"/promotions/"+promotionID;
                },
                error: function (xhr, status) {
                    var respBlock = jQuery("#responseBlock");
                    var msg;

                    try {
                        msg = xhr.responseJSON.error_message || xhr.responseJSON.message;
                    }
                    catch (err) {
                        msg = i18next.t("error.internal_server_error");
                    }

                    respBlock.html(msg);
                    respBlock.removeClass("hidden");

                    return;
                }
            });
        }
    }else{
        var respBlock = jQuery("#responseBlock");
        var msg;
        msg = i18next.t("error.novalidate");
        respBlock.html(msg);
        respBlock.removeClass("hidden");
        return;
    }

}


function ds_saveRecurrencies(pid, promo, cb) {
    function postPromo(newPromo) {
        jQuery.ajax({
            url: config.contentUIUrl + "/contents/" + newPromo.idcontent +"/promotions",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({promotion: newPromo, user: userToken}),
            dataType: "json",
            success: function (dataResp, textStatus, xhr) {
                saved.push(dataResp._id);
            },
            error: function (xhr, status) {
                console.log(status)
            }
        }); 
    }

    var saved = [];
    var recurrency = ds_calculateRecurrency()

    for(var i=0; i<recurrency.days.length;i++) {
        var newPromo = JSON.parse(JSON.stringify(promo));
        
        newPromo.startDate = recurrency.days[i].startDate;
        newPromo.endDate = recurrency.days[i].endDate;
        newPromo.recurrency_group = pid
        newPromo.recurrency_type = recurrency.type;

        console.log(newPromo)
    }

    if(cb) cb();
}


function setSaveCancelButtonEnabled(status){
    if(status) {
        $("#promotionSaveButton").removeClass("btn-u-default").removeAttr('disabled');
        //$("#promotionCancelButton").removeClass("btn-u-default").addClass("btn-u-dark-blue").removeAttr('disabled');
    }else{
        $("#promotionSaveButton").addClass("btn-u-default").attr('disabled');
        //$("#promotionCancelButton").addClass("btn-u-default").removeClass("btn-u-dark-blue").attr('disabled');
    }

}

// function newPromotion(){
//
//     var currentPromotion=JSON.parse(sessionStorage.getItem("currentPromotion"));
//
//     var promotion_admin_template   = $("#admin_promotion_template").html();
//     var promotionHtml = Handlebars.compile(promotion_admin_template);
//
//     var prom={
//         image:currentPromotion.images[0],
//         start:moment(currentPromotion.startDate).format('MMMM Do YYYY, h:mm:ss a'),
//         end:moment(currentPromotion.endDate).format('MMMM Do YYYY, h:mm:ss a'),
//         where:"Location",
//         name:currentPromotion.name,
//         description:currentPromotion.description,
//         price:currentPromotion.price
//     };
//
//     stopComingSoon();
//     jQuery('#promotionContent').html(promotionHtml(prom));
//     $('body').localize();
//     MasonryBox.initMasonryBox();
//     StyleSwitcher.initStyleSwitcher();
//     Datepicker.initDatepicker();
//     var startPicher=$('#datetimepickerStart');
//     startPicher.datetimepicker({
//             sideBySide:true,
//             format:"DD/MM/YYYY - HH:mm",
//             allowInputToggle : true
//     });
//
//     var endPicher=$('#datetimepickerEnd');
//     endPicher.datetimepicker({
//         sideBySide:true,
//         format:"DD/MM/YYYY - HH:mm",
//         allowInputToggle : true,
//         useCurrent: false
//     });
//
//     startPicher.on("dp.change", function (e) {
//         endPicher.data("DateTimePicker").minDate(e.date);
//     });
//     endPicher.on("dp.change", function (e) {
//        startPicher.data("DateTimePicker").maxDate(e.date);
//     });
//
//
//     mapInit=initMap(39.2253991,9.0933586,6,true);
//
//     autocomplete = new google.maps.places.Autocomplete((document.getElementById('promotionWhere')),{types: ['geocode']});
//
//     // When the user selects an address from the dropdown, populate the address
//     // fields in the form.
//     autocomplete.addListener('place_changed', fillInAddress);
//
//
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//             mapInit=initMap(position.coords.latitude,position.coords.longitude,12,true);
//         },function(){
//             //The Geolocation service failed
//             handleLocationError("The Geolocation service failed",mapInit);
//         });
//     } else {
//         // Browser doesn't support Geolocation
//         handleLocationError("Browser doesn't support Geolocation",mapInit);
//     }
//
//    // set Title
//     $('#promotionTitle').val(currentPromotion.name);
//     $('#promotionDescription').val(currentPromotion.description);
//     startPicher.data("DateTimePicker").date(new Date(currentPromotion.startDate));
//     endPicher.data("DateTimePicker").date(new Date(currentPromotion.endDate));
//
//     // $('#promotionStartDate').val();
//     // $('#promotionEndDate').val();
//     $('#promotionPrice').val(currentPromotion.price);
//
//     geocodeLatLng(currentPromotion.position[lat],currentPromotion.position[lon],function(err,position){
//         if(!err){
//             $('#promotionWhere').val(position);
//         }
//     });
//}




function addNewPromotion(){

    //var currentPromotion=JSON.parse(sessionStorage.getItem("currentPromotion"));

    var promotion_admin_template   = $("#admin_promotion_template").html();
    var promotionHtml = Handlebars.compile(promotion_admin_template);

    var prom={
        image:config.contentUIUrl+"/assets/img/team/img32-md.jpg",
        isANewPromotion:true,
        baseUrl:config.contentUIUrl
    };

    jQuery('#promotionContent').html(promotionHtml(prom));
    $('body').localize();
    MasonryBox.initMasonryBox();
    StyleSwitcher.initStyleSwitcher();
    //Datepicker.initDatepicker();

    currentPromotion={};
    newPromotion={};
    // set Title
    let promotionTitle=$('#promotionTitle');
    promotionTitle.get(0).oninput=function(){
        let nameValue=promotionTitle.val();
        titleWithTags=getmultilanguageTitle(nameValue);
        updatePromotionField('name', titleWithTags == currentPromotion.name ? null : titleWithTags, true);


    };

    let promotionDescription=$('#promotionDescription');
    promotionDescription.get(0).oninput=function(){
        let value=promotionDescription.val();
        descriptionWithTags=getmultilanguageDescription(value);
        updatePromotionField('description',descriptionWithTags==currentPromotion.description?null:descriptionWithTags,true);

    };


    let promotionPrice=$('#promotionPrice');
    promotionPrice.get(0).oninput=function(){
        let value=promotionPrice.val();
        updatePromotionField('price',value==currentPromotion.price?null:value,true);
    };

    let promotionWhere=$('#promotionWhere');
    // promotionWhere.val(currentPromotion.address);
    promotionWhere.get(0).oninput=function(){
        setPositionValidity(false);
        let value=promotionWhere.val();
        updatePromotionField('address',value==currentPromotion.address?null:value,true);
    };



    let promotype=$('#promotype');
    // promotionWhere.val(currentPromotion.address);
    promotype.get(0).onchange=function(){
        var selectedOption = $("#promotype input:radio:checked").val();
        let value="1"; // offer
        if(selectedOption=="event")
            value="2";
        updatePromotionField('type',value==currentPromotion.type?null:value,true);
    };

    let categories=$('#categories');
    // promotionWhere.val(currentPromotion.address);
    categories.get(0).onchange=function(){
        let value=[]; // offer
        var selectedOption = $("input[name='category']:checkbox:checked").each(function () {
            value.push(this.value);

        });
        updatePromotionField('category',_.isEqual(value,currentPromotion.category)?null:value,true);
    };


    let promotionPicture=$('#updatePicture');
    //promotionPicture.val(currentPromotion.images[0]);
    promotionPicture.get(0).onchange=function(){
        loadPromotionImage();
    };


    var startPicher=$('#datetimepickerStart');
    var endPicher=$('#datetimepickerEnd');

    startPicher.datetimepicker({
        sideBySide:true,
        format:"DD/MM/YYYY - HH:mm",
        allowInputToggle : true
    });

    endPicher.datetimepicker({
        sideBySide:true,
        format:"DD/MM/YYYY - HH:mm",
        allowInputToggle : true,
        useCurrent: false
    });


    startPicher.on("dp.change", function (e) {
        endPicher.data("DateTimePicker").minDate(e.date);
        let value=e.date.toDate();
        updatePromotionField('startDate',value==currentPromotion.startDate?null:value,true);
    });
    startPicher.data("DateTimePicker").date(new Date());




    endPicher.on("dp.change", function (e) {
        startPicher.data("DateTimePicker").maxDate(e.date);
        let value=e.date.toDate();
        updatePromotionField('endDate',value==currentPromotion.endDate?null:value,true);
    });
    endPicher.data("DateTimePicker").date(new Date());

    endPicher.data("DateTimePicker").minDate(startPicher.data("DateTimePicker").date());
    startPicher.data("DateTimePicker").maxDate(endPicher.data("DateTimePicker").date());
    ds_initRecurrenceEndPicker(); //ds


    mapInit=initMap(39.2253991,9.0933586,6,true);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            mapInit=initMap(position.coords.latitude,position.coords.longitude,12,true);
            updatePromotionWhere(position.coords.latitude,position.coords.longitude,false);
            let pos=[null,null];
            pos[lat]=position.coords.latitude;
            pos[lon]=position.coords.longitude;
            updatePromotionField('position',pos,false);
        },function(){
            //The Geolocation service failed
            handleLocationError("The Geolocation service failed",[39.2253991,9.0933586]);
            updatePromotionWhere(39.2253991,9.0933586,false);
            // updatePromotionField('position',[39.2253991,9.0933586],false);
            updatePromotionField('position',[9.0933586,39.2253991],false);
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError("Browser doesn't support Geolocation",[39.2253991,9.0933586]);
        updatePromotionWhere(39.2253991,9.0933586,false);
        //updatePromotionField('position',[39.2253991,9.0933586],false);
        updatePromotionField('position',[9.0933586,39.2253991],false);
    }


    autocomplete = new google.maps.places.Autocomplete((document.getElementById('promotionWhere')),{types: ['geocode']});
    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);




    MultilanguageEditInit();

    //
    // geocodeLatLng(currentPromotion.position[lat],currentPromotion.position[lon],function(err,position){
    //     if(!err){
    //         $('#promotionWhere').val(position);
    //     }
    // });

}

function handleLocationError(message,InfoWinPosition){
    var infoWindow = new google.maps.InfoWindow;
    infoWindow.setContent(message);
    infoWindow.setPosition({
        lat: InfoWinPosition[0],
        lng: InfoWinPosition[1]
    });

    infoWindow.open(mapInit.map.map,mapInit.marker);
}

function updatePromotion(){

    //var currentPromotion=JSON.parse(sessionStorage.getItem("currentPromotion"));

    var promotion_admin_template   = $("#admin_promotion_template").html();
    var promotionHtml = Handlebars.compile(promotion_admin_template);

    var prom={
        promo_image:config.contentUIUrl+"/utils/image?imageUrl="+encodeURIComponent(currentPromotion.images[0]),
        start:moment(currentPromotion.startDate).format('MMMM Do YYYY, h:mm:ss a'),
        end:moment(currentPromotion.endDate).format('MMMM Do YYYY, h:mm:ss a'),
        where:"Location",
        name:currentPromotion.name,
        description:currentPromotion.description,
        price:currentPromotion.price,
        isANewPromotion:false,
        baseUrl:config.contentUIUrl
    };

    stopComingSoon();
    jQuery('#promotionContent').html(promotionHtml(prom));
    $('body').localize();
    MasonryBox.initMasonryBox();
    StyleSwitcher.initStyleSwitcher();
    //Datepicker.initDatepicker();


    MultilanguageEditInit();
    newPromotion={};

    // set Title
    initTitleJsonMultilanguage(currentPromotion.name);
    let promotionTitle=$('#promotionTitle');
    promotionTitle.val(getCurrentLanguageTitle());
    promotionTitle.get(0).oninput=function(){
        let nameValue=promotionTitle.val();
        titleWithTags=getmultilanguageTitle(nameValue);
        updatePromotionField('name', titleWithTags == currentPromotion.name ? null : titleWithTags, true);
    };


    initDescriptionJsonMultilanguage(currentPromotion.description);
    let promotionDescription=$('#promotionDescription');
    promotionDescription.val(getCurrentLanguageDescription());
    promotionDescription.get(0).oninput=function(){
        let value=promotionDescription.val();
        descriptionWithTags=getmultilanguageDescription(value);
        updatePromotionField('description',descriptionWithTags==currentPromotion.description?null:descriptionWithTags,true);
    };


    let promotionPrice=$('#promotionPrice');
    promotionPrice.val(currentPromotion.price);
    promotionPrice.get(0).oninput=function(){
        let value=promotionPrice.val();
        updatePromotionField('price',value==currentPromotion.price?null:value,true);
    };

    let promotionWhere=$('#promotionWhere');
    promotionWhere.val(currentPromotion.address);
    promotionWhere.get(0).oninput=function(){
        setPositionValidity(false);
        let value=promotionWhere.val();
        updatePromotionField('address',value==currentPromotion.address?null:value,true);
    };


    let promotype=$('#promotype');
    let tmpv=$("#promotype input[value='"+currentPromotion.type+"']:radio");
    tmpv.prop('checked', true);

    promotype.get(0).onchange=function(){
        var value = $("#promotype input:radio:checked").val();
        updatePromotionField('type',value==currentPromotion.type?null:value,true);
    };

    let categories=$('#categories');
    currentPromotion.category.forEach(function(catValue){
        $("input[name='category'][value='"+ catValue +"']:checkbox").prop('checked', true);
    });

    categories.get(0).onchange=function(){
        let value=[]; // offer
        var selectedOption = $("input[name='category']:checkbox:checked").each(function () {
            value.push(this.value);

        });
        updatePromotionField('category',_.isEqual(value,currentPromotion.category)?null:value,true);
    };



    let promotionPicture=$('#updatePicture');
    //promotionPicture.val(currentPromotion.images[0]);
    promotionPicture.get(0).onchange=function(){
        loadPromotionImage();
    };


    var startPicher=$('#datetimepickerStart');
    var endPicher=$('#datetimepickerEnd');

    startPicher.datetimepicker({
        sideBySide:true,
        format:"DD/MM/YYYY - HH:mm",
        allowInputToggle : true
    });

    endPicher.datetimepicker({
        sideBySide:true,
        format:"DD/MM/YYYY - HH:mm",
        allowInputToggle : true,
        useCurrent: false
    });


    startPicher.on("dp.change", function (e) {
        endPicher.data("DateTimePicker").minDate(e.date);
        let value=e.date.toDate();
        ds_updateRecurrence(value);
        updatePromotionField('startDate',value==currentPromotion.startDate?null:value,true);
    });
    startPicher.data("DateTimePicker").date(new Date(currentPromotion.startDate));

    endPicher.on("dp.change", function (e) {
       startPicher.data("DateTimePicker").maxDate(e.date);
        let value=e.date.toDate();
        updatePromotionField('endDate',value==currentPromotion.endDate?null:value,true);
    });
    endPicher.data("DateTimePicker").date(new Date(currentPromotion.endDate));
    endPicher.data("DateTimePicker").minDate(startPicher.data("DateTimePicker").date());
    startPicher.data("DateTimePicker").maxDate(endPicher.data("DateTimePicker").date());

    /// ds ///
    ds_updateRecurrence(startPicher.data("DateTimePicker").date());
    ds_initRecurrenceEndPicker();

    i18next.on('languageChanged', function(lng) {
        ds_updateRecurrence(startPicher.data("DateTimePicker").date());
    })
    //////////


    mapInit=initMap(currentPromotion.position[lat],currentPromotion.position[lon],6,true);
    autocomplete = new google.maps.places.Autocomplete((document.getElementById('promotionWhere')),{types: ['geocode']});
    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);

    //
    // geocodeLatLng(currentPromotion.position[lat],currentPromotion.position[lon],function(err,position){
    //     if(!err){
    //         $('#promotionWhere').val(position);
    //     }
    // });

}


//ds
function ds_updateRecurrence(startDate) {
    var dayOfWeek = moment(startDate).locale(window.localStorage.lng).format("dddd")
    var dayOfMonth = moment(startDate).locale(window.localStorage.lng).format("D")

    var el = $("#promoRecurrence option[data-x2='promotion.everymonth']")
    el.text(i18next.t('promotion.everymonth').replace("xx", dayOfMonth));
    el = $("#promoRecurrence option[data-x1='promotion.everyweek']")
    el.text(i18next.t('promotion.everyweek').replace("xx", dayOfWeek));

    $("#promoRecurrence").off("change")
    $("#promoRecurrence").change(function() {
        //reset valori salvati per ripetizione promo.............        
        $("#calendarCustomRec").multiDatesPicker('resetDates');
        $("#recDaysRow").hide();
        if(this.value == 3) {
            $("#recEndRow").fadeOut();
            $("#customRecCal").modal();
            $("#cancCDBtn").click(function() {
                //if($("#calendarCustomRec").multiDatesPicker('getDates').length == 0) {
                if($("#recDaysRow div a").text().split(",")[0].length == 0) {
                    //$("#calendarCustomRec").multiDatesPicker('resetDates');
                    $("#recDaysRow div a").empty();
                    $("#recDaysRow").hide();
                    $("#promoRecurrence option[value='0']").prop('selected',true);
                }
            })
            $("#calendarCustomRec").multiDatesPicker({
                dateFormat: "yy-mm-dd",
                minDate: 0,
                maxPicks: _maxEvents
            });
            $("#saveCDBtn").click(function() {
                $("#recDaysRow div a").empty();
                if($("#calendarCustomRec").multiDatesPicker('getDates').length > 0) {
                    $("#recDaysRow").show();
                    $("#recDaysRow div a").html($("#calendarCustomRec").multiDatesPicker('getDates').join(", "));
                    $("#recDaysRow div a").click(function() {                        
                        $("#customRecCal").modal();
                        if($("#calendarCustomRec").multiDatesPicker('getDates') == 0) {
                            $("#calendarCustomRec").multiDatesPicker('addDates', $(this).text().split(", ")) //whitespace!!!
                        }
                    });
                }
                else {
                    $("#recDaysRow").hide();
                    $("#promoRecurrence option[value='0']").prop('selected',true);
                }
                $("#customRecCal").modal('hide')
            });
        }
        else if(this.value != 0) {
            $("#recEndRow").fadeIn();
            $("#datetimepickerRecEnd").data("DateTimePicker").date(startDate);
        }        
        else {
            $("#recEndRow").fadeOut();
            $("#datetimepickerRecEnd").data("DateTimePicker").date(startDate);            
        }
    });
}


//ds
function ds_initRecurrenceEndPicker() {
    var recPicker = $("#datetimepickerRecEnd");
    recPicker.datetimepicker({
        allowInputToggle : true,
        format:"DD/MM/YYYY",
        minDate: new Date()
    });
    var fatherStart = $("#datetimepickerStart").data("DateTimePicker").date();
    var recEnd = fatherStart.isBefore(new Date()) ? new Date() : fatherStart;
    recPicker.data("DateTimePicker").date(recEnd);
}


//ds
function ds_calculateRecurrency() {
    function addDays(n, type) {
        var retArr = [];
        var i = 0;
        var startDate = $('#datetimepickerStart').data('DateTimePicker').date();
        var endDate = $('#datetimepickerEnd').data('DateTimePicker').date();
        
        startDate.add(n, type);
        endDate.add(n,type);

        while(startDate.isBefore(new Date())) {            
            startDate.add(n,type);
            endDate.add(n,type);
        }
        
        while(i++<_maxEvents && startDate.isSameOrBefore(endRec)) {
            retArr.push({startDate: startDate.format(), endDate: endDate.format()}) //format() is important!!!
            startDate.add(n, type);
            endDate.add(n, type);
        }
        return retArr;        
    }

    var rectype = $("#promoRecurrence").val();
    var endRec = $("#datetimepickerRecEnd").data("DateTimePicker").date().endOf("day")
    var recurrency = {type:rectype, days:[]};
    switch(rectype) {
        case "1": //everyday
            recurrency.days = addDays(1, "days")
            break;
        case "2": //every day of week
            recurrency.days = addDays(7, "days")
            break;
        case "3": //custom
            var hstart = $('#datetimepickerStart').data('DateTimePicker').date().format("HH");
            var mstart = $('#datetimepickerStart').data('DateTimePicker').date().format("mm");
            var hstop = $('#datetimepickerEnd').data('DateTimePicker').date().format("HH");
            var mstop = $('#datetimepickerEnd').data('DateTimePicker').date().format("mm");
            var d = $("#calendarCustomRec").multiDatesPicker('getDates')
            for(var i=0; i<d.length; i++) {                
                startDate = moment(d[i]).hour(hstart).minutes(mstart);
                endDate = moment(d[i]).hour(hstop).minutes(mstop);
                recurrency.days.push({startDate:startDate.format(), endDate:endDate.format()});
            }
            break;
        default:
            break;
        
    }
    return recurrency;
}


function updatePromotionField(field,value,updateButtonsSaveCancelstatus){
    if(value){
        newPromotion[field]=value;
    }else{
        delete newPromotion[field];
    }

    if(updateButtonsSaveCancelstatus)
        checkSaveCancelButton();

}
function checkSaveCancelButton(){
    if( Object.keys(newPromotion).length >0 ){
        setSaveCancelButtonEnabled(true);
    }else{
        setSaveCancelButtonEnabled(false);
    }
}



function doILike(){
    jQuery.ajax({
        url: config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/doilike?access_token=" + userToken,
        type: "POST",
        success: function(data, textStatus, xhr){
                    iLikeIt=data.like || false;
                    setLikeButton();
        },
        error: function(xhr, status){
            if(!tokenError && userToken){
                var msgRsp=((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) ||  i18next.t("error.doilike");
                msgRsp="doIlike function: " + msgRsp;
                jQuery.jGrowl(msgRsp, {theme:'bg-color-red', life: 5000});
            }
        }
    });
}


function getLikes(){

    getPromotionLikes(contentID,promotionID,function(err,total){
        if(err) $('#likecount').text(err);
        else $('#likecount').text(total);       
    });

    doILike();
}

//
// function getLikes(){
//     jQuery.ajax({
//         url: config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/likes",
//         type: "POST",
//         success: function(data, textStatus, xhr){
//             $('#likecount').text(data.total);
//         },
//         error: function(xhr, status){
//             $('#likecount').text( i18next.t("error.getlikes"));
//             // return;
//         }
//     });
//
//     doILike();
// }


function setLike(){
    let url=null;
    let direction=1;

    if(iLikeIt){//unparticipate
        url=config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/unlike?access_token=" + userToken;
        direction=-1;

    }else{//participate
        url=config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/like?access_token=" + userToken;
        direction=1;
    }

    jQuery.ajax({
        url: url,
        type: "POST",
        success: function(data, textStatus, xhr){
            var likecount=$('#likecount');
            likecount.text(JSON.parse(likecount.text())+direction);
            iLikeIt=!iLikeIt;
            setLikeButton();
        },
        error: function(xhr, status){
            if(!tokenError && userToken){
                var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.setlike");
                msgRsp="setLike Function: " + msgRsp;
                jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
            }
            // return;
        }
    });
}


function doIParticipate(){
    jQuery.ajax({
        url: config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/doiparticipate?access_token=" + userToken,
        type: "POST",
        success: function(data, textStatus, xhr){
            iParticipateIt=data.participation || false;
            setParticipateButton();
        },
        error: function(xhr, status){
            if(!tokenError && userToken){
                var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.doiparticipate");
                msgRsp="doIParticipate function: " + msgRsp;
                jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
            }
        }
    });
}

function getparticipants(){

    getPromotionParticipants(contentID,promotionID,function(err,total){
        if(err)  $('#participatecount').text(err);
        else $('#participatecount').text(total);
    });

    doIParticipate();
}

// function getparticipants(){
//     jQuery.ajax({
//         url: config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/participants",
//         type: "POST",
//         success: function(data, textStatus, xhr){
//             $('#participatecount').text(data.total);
//         },
//         error: function(xhr, status){
//
//             $('#participatecount').text(i18next.t("error.getparticipants"));
//             // return;
//         }
//     });
//     doIParticipate();
// }



function setParticipate(){
    let url=null;
    let direction=1;

    if(iParticipateIt){//unparticipate
        url=config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/unparticipate?access_token=" + userToken;
        direction=-1;

    }else{//participate
        url=config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/participate?access_token=" + userToken;
        direction=1;
    }

    jQuery.ajax({
        url: url,
        type: "POST",
        success: function(data, textStatus, xhr){
            var likecount=$('#participatecount');
            likecount.text(JSON.parse(likecount.text())+direction);
            iParticipateIt=!iParticipateIt;
            setParticipateButton();
        },
        error: function(xhr, status){
            if(!tokenError && userToken){
                var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.setparticipate");
                msgRsp="setParticipate Function: " + msgRsp;
                jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
            }
            // return;
        }
    });
}





function  setLikeButton(){
    var likecounticon=$('#likecounticon');
    if(iLikeIt){
        likecounticon.removeClass("fa-thumbs-up");
        likecounticon.addClass("fa-thumbs-down")
    }else{
        likecounticon.removeClass("fa-thumbs-down");
        likecounticon.addClass("fa-thumbs-up")
    }
}

function  setParticipateButton(){
    var participatecounticon=$('#participatecounticon');
    if(iParticipateIt){
        participatecounticon.removeClass("fa-user");
        participatecounticon.addClass("fa-users");
    }else{
        participatecounticon.removeClass("fa-users");
        participatecounticon.addClass("fa-user");
    }
}

function getPromotionPage(data,token){


    var promotion_template   = $("#promotion_template").html();
    var promotionHtml = Handlebars.compile(promotion_template);
    currentPromotion=data;

    initDescriptionJsonMultilanguage(data.description);
    initTitleJsonMultilanguage(data.name);

    var prom={
        promo_image:config.contentUIUrl+"/utils/image?imageUrl="+encodeURIComponent(data.images[0]),
        start:moment(data.startDate).format('MMMM Do YYYY, h:mm:ss a'),
        end:moment(data.endDate).format('MMMM Do YYYY, h:mm:ss a'),
        where:"Location",
        name:data.name,
        description:data.description,
        price:data.price,
        token:token,
        contentId:contentID,
        access_token:userToken,
        baseUrl:config.contentUIUrl,
        participants:(data.participants && data.participants.html) || "",
        participantsDetails:(data.participants && data.participants.htmldetails) || "",
        event_type:"type_" + data.type,
        categories:data.category
    };



    jQuery('#promotionContent').html(promotionHtml(prom));
    $('body').localize();
    getLikes();
    getparticipants();
    if(data.address){
        $('#where').text(data.address);
    }else {
        geocodeLatLng(data.position[lat], data.position[lon], function (err, position) {
            if (!err) {
                $('#where').text(position);
            }
        });
    }
    MasonryBox.initMasonryBox();
    StyleSwitcher.initStyleSwitcher();
    initPageComingSoon(data.startDate);
    initMap(data.position[lat],data.position[lon],12,false);

    // init tooltip for participants list
    $('[data-toggle="tooltip"]').tooltip();

}


function exitFromInsertMode(){
    if(promotionID) compilePromotion();
    else window.location.replace(config.contentUIUrl + "/activities/"+ contentID);

}

function compilePromotion(){


// <script>
//     var source   = $("#entry-template").html();
//     var template = Handlebars.compile(source);
//     var promotionBody = JSON.parse('<%- promotionBody %>');
//     var html=template(promotionBody);
//     $("#entry-template-html").html(html);
// </script>



    newPromotion={};

    jQuery.ajax({
        url: config.contentUIUrl + "/contents/"+ contentID+ "/promotions/promoid/" + promotionID ,
        type: "GET",
        success: function(data, textStatus, xhr)
        {
            //ContentMS store promo dates in UTC, convert to local timezone
            data.startDate = moment.tz(data.startDate, _tz).format();
            data.endDate = moment.tz(data.endDate, _tz).format();

            sessionStorage.setItem("currentPromotion",JSON.stringify(data)); // copy for value

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
                                        msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.invalidtoken");
                                    }
                                    catch(err){
                                        msg = "invalid Token";
                                    }
                                    msg="decodetoken in comlilepromotion Function " + msg;
                                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
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
                                        msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.admintokentype");
                                    }
                                    catch(err){
                                        msg = "invalid Token";
                                    }
                                    msg="get admins token type in compilepromotion Function " + msg;
                                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                                    callback(null,[]); // no admins token type
                                    // return;
                                }
                            });
                        },

                        // Get Content Admins
                        function(callback) {
                            jQuery.ajax({
                                url: config.contentUIUrl + "/contents/contentid/"+ contentID,
                                type: "GET",
                                success: function(data, textStatus, xhr){
                                    var admins=[data.owner];
                                    admins=admins.concat(data.admins);
                                    callback(null, admins);
                                },
                                error: function(xhr, status){


                                    var msg;
                                    try{
                                        msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.contentadmins");
                                    }
                                    catch(err){
                                        msg = "invalid Token";
                                    }
                                    msg="get admins in compilepromotion Function " + msg;
                                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});

                                    callback(null,[]);//no contents admins
                                    // return;
                                }
                            });
                        },
                        // get participate list
                        function(callback) {
                            jQuery.ajax({
                                url:config.contentUIUrl + "/contents/"+ contentID+ "/promotions/" + promotionID+"/participants?access_token="+ userToken,
                                type: "GET",
                                success: function(data, textStatus, xhr){
                                    // max 10 user into tooltip
                                    let times= data.users.length <= 10 ? {number:data.users.length,all:true}:{number:10,all:false};
                                    let html="";
                                    let htmldetails="";
                                    if(times>0){
                                        html="<dl>";
                                        for(let i=0;i<times.number;++i){
                                            html+="<dt>"+data.users[i].name + " " + data.users[i].surname + "</dt>";
                                        }
                                        if(times.all)
                                            html+="</dl>";
                                        else{
                                            html+="<dt><dt></dt><dt>.... " + i18next.t('promotion.moreparticipants') + " .... </dt></dl>";
                                        }
                                        let imgThunb;
                                        for(let i=0;i<data.users.length;++i){
                                            imgThunb=data.users[i].avatar || config.contentUIUrl + "/assets/img/testimonials/user.jpg";
                                            htmldetails+="<tr><td><img class='rounded-x' src='"+imgThunb+"' alt=''></td><td><h3>"+data.users[i].name + " " + data.users[i].surname +"</h3></td></tr>";
                                        }
                                    }
                                    callback(null,{html:html,htmldetails:htmldetails});
                                },
                                error: function(xhr, status){
                                    var msg;
                                    try{
                                        console.log(xhr.responseJSON);
                                        msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.noparticipants");
                                    }
                                    catch(err){
                                        msg = "invalid operation";
                                    }
                                    msg="compilepromotion Function " + msg;
                                    jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
                                    callback(null,[]); // no admins token type
                                    // return;
                                }
                            });
                        },
                ],
                // optional callback
                function(err, results) {
                    if(err){
                        //jQuery.jGrowl(err, {theme:'bg-color-red', life: 5000});
                        getPromotionPage(data,null);
                    }else{
                        data.participants=results[3];
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

            var msg;
            try{
                msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.internal_server_error");
            }
            catch(err){
                msg = "invalid Token";
            }
            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});

            return;
        }
    });

};


function openPromotionPage(isANewPromotion){
    if(isANewPromotion){
        addNewPromotion();
    }else{
        compilePromotion();
    }

    if(tokenError){
        jQuery.jGrowl(tokenError, {theme:'bg-color-red', life: 5000});
    }
}



function initPromotionsPage(isANewPromotion)
{
   if(canTranslate){
       openPromotionPage(isANewPromotion);
   } else{
       addEventListener('promotionLanguageManagerInitialized', function (e) {
           canTranslate=true;
           openPromotionPage(isANewPromotion);
       }, false);
   }


}

function updatePromotionWhere(lat,lng,updateSaveCancelButtonStatus){
    geocodeLatLng(lat,lng,function(err,address){
        if(!err){
            $('#promotionWhere').val(address);
            setPositionValidity(updateSaveCancelButtonStatus);
            updatePromotionField('address',address==currentPromotion.address?null:address,updateSaveCancelButtonStatus);
        }
    });
}


function createMapsOptions(latitude,longitude,zoom,editable,marker){
    var option;
    if(latitude && longitude){
        option={
            div: '#map',
            scrollwheel: true,
            lat: latitude,
            lng: longitude,
            zoom: zoom,
            click: function (event) {
                if(editable) {
                    let lat = event.latLng.lat();
                    let long = event.latLng.lng();
                    marker.mrk.setPosition(new google.maps.LatLng(lat, long));
                    updatePromotionWhere(lat,long,true);
                }
            }
        }
    }else{
        option={
            div: '#map',
            scrollwheel: true,
            zoom: zoom,
            click: function (event) {
                if(editable) {
                    let lat = event.latLng.lat();
                    let long = event.latLng.lng();
                    marker.mrk.setPosition(new google.maps.LatLng(lat, long));
                    updatePromotionWhere(lat,long,true);
                }
            }
        }
    }

    return option;
}


function initMap(latitude,longitude,zoom,editable) {

    var marker={};
    var map = new GMaps(createMapsOptions(latitude,longitude,zoom,editable,marker));

    marker.mrk = map.addMarker({
        lat: latitude,
        lng: longitude,
        icon:config.contentUIUrl+"/customAssets/img/marker/port.png",
        draggable:editable,
        dragend:function(){
            if(editable) {
                var cPos=this.getPosition();
                geocodeLatLng(cPos.lat(),cPos.lng(),function(err,address){
                    if(!err){
                        $('#promotionWhere').val(address);
                        setPositionValidity(true);
                        updatePromotionField('address',address==currentPromotion.address?null:address,true);
                    }
                });

                let pos=[null,null];
                pos[lat]=cPos.lat();
                pos[lon]=cPos.lng();
                currentPromotion.position=(currentPromotion.position) || ["nd","nd"];
                updatePromotionField('position',arrayAreEquals(pos,currentPromotion.position)?null:pos,true);

            }
        }
    });

    addEventListener('zoomMap', function (e) {
        map.setZoom(20);
    }, false);

    return {map:map,marker:marker.mrk};
}


function mapZoom(){
    var event = new Event('zoomMap');
    dispatchEvent(event);
}