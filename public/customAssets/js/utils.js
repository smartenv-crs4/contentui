/**
 * Created by michela on 07/10/16.
 */
function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

function cacheCompile(templateid, data) {
    if (!window[templateid + "_template"]) {
        window[templateid + "_template"] = Handlebars.compile($('#' + templateid).html());
    }
    return window[templateid + "_template"](data);
}

function isSupplier() {
    if (userType() == "supplier" ) {
        return true;
    }
    else return false;
}

function userType() {
    if (window.sessionStorage && sessionStorage.type)
        return sessionStorage.type;
    else
        return "customer";
}

function userId() {

    if (window.sessionStorage.userId)
        return window.sessionStorage.userId;
    else return null;
}

function isLogged() {
    if (window.sessionStorage.token)
        return true;
    else
        return false;
}

function isSearchVisible() {
    "use strict";
    if (window.isHome)
        return false;
    if (window.isList)
        return false;
    return true;
}


function setEditable(elementId,associatedButtons){
    var element=$('#'+elementId);
    var oldContent=element.html();
    element.attr('contentEditable',true);

    element.blur(function() {
            var newContent=element.html();
            element.attr('contentEditable', false);
            if((oldContent!=newContent) && (!(~(newContent.indexOf("mark"))))) {
                element.html("<mark>" + newContent + "</mark>");
                element.addClass("updatable");
            }
    });

    associatedButtons.forEach(function (associatebutton) {
        $('#'+associatebutton.id).removeClass(associatebutton.removeClass).addClass(associatebutton.addClass).removeAttr('disabled');
    });
    element.focus();
}



function initPageComingSoon(date) {
    //console.log("TypeOf Date:"+ typeof (date) +"  Date: -------->"+ date);
    var newYear = new Date(date);
    //newYear = new Date(newYear.getFullYear(), 1 - 1, 1);
    $('#defaultCountdown').countdown({until: newYear})
}

function stopComingSoon(){
    $('#defaultCountdown').countdown('pause');
}

function arrayAreEquals(arr1,arr2){
    return(arr1.join()===arr2.join());
}

function logOut(){
    removeTokenAfterLogOut();
    window.location.replace("/");
}

