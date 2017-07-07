/* Write here your custom javascript codes */

//***** Create userms Url
var _userMsUrl  = config.userUIUrl;


// Get userWebUi Token
_access_token =  config.myMicroserviceToken;

jQuery(document).ready(function(){


    var sb = jQuery("#sidebar");

    if(sb.length > 0){
        //var isSupplier = sessionStorage.type && sessionStorage.type == "supplier";
        if(userData){

            var sbT = Handlebars.compile(sidebarTemplate);
            var profileImage="assets/img/team/img32-md.jpg";

            if(! _.isEmpty(userData.avatar))
              profileImage=_userMsUrl + "/users/actions/getprofileimage/" +userData.avatar+"?access_token=" + userData.UserToken;


            console.log("PROFILE IMG " + profileImage );

            jQuery("#sidebar").html(sbT({
                avatar : profileImage
            }));
            jQuery("#sidebar").localize();
        }
    }

  jQuery('body').localize();  // body translate

  if(localStorage.lng) // if a language is set in a previous page
  {
    var l = jQuery(".languages a[data-lng='" + localStorage.lng +"']"); // get language arrays
    if(l.length > 0)  // check if a language array exist(not all pages have a language drop down menu)
    {
      if(localStorage.lng != jQuery(".languages .active a").first().attr("data-lng")) // if current language != set language then translate and change language
      {
        var lngSel = jQuery(".languages .active").first()
        lngSel.empty();
        lngSel.append(l[0].cloneNode(true));
        var c = document.createElement("i");
        c.className = "fa fa-check";
        lngSel.find("a").first().append(c);
      }
      i18next.changeLanguage(localStorage.lng, function(){});
      jQuery('body').localize();
    }
  }
  else  //if not a language is set
  {
      //get default language and set it
    localStorage.lng = jQuery(".languages .active a").first().data("lng");
    i18next.changeLanguage(localStorage.lng, function(){});
    jQuery('body').localize();
  }


  // on click on language drop down set the language
  jQuery(".languages a").click(function(){

    if(jQuery(this).attr("data-lng"))
    {

      localStorage.lng = jQuery(this).attr("data-lng");
      var lngSel = jQuery(".languages .active").first();
      lngSel.empty();
      lngSel.append(this.cloneNode(true));
      var c = document.createElement("i");
      c.className = "fa fa-check";
      lngSel.find("a").first().append(c);
      i18next.changeLanguage(localStorage.lng, function(){});
      jQuery('body').localize();
      jQuery(document).trigger('translate');
        console.log("UserUI Cahange Language " + localStorage.lng);
    }
  });

});

console.log(" Caport tanslation init");
console.log(translation);
i18next.init({
  lng: localStorage.lng || "en", // evtl. use language-detector https://github.com/i18next/i18next-browser-languageDetector
  fallbackLng: "en",
  resources:  translation
}, function (err, t) {
  jqueryI18next.init(i18next, jQuery,
      {
        tName: 't', // --> appends $.t = i18next.t
        i18nName: 'i18n', // --> appends $.i18n = i18next
        handleName: 'localize', // --> appends $(selector).localize(opts);
        selectorAttr: 'data-i18n', // selector for translating elements
        targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if diffrent then itself)
        optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
        useOptionsAttr: false, // see optionsAttr
        parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
      });
});


function logout(){
    window.location.replace("/");
}



/*******************************************
 ****************** UTILS ******************
 *******************************************/
function isValidEmailAddress(emailAddress)
{
  var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
  return pattern.test(emailAddress);
};
/*******************************************
 *******************************************/

function redirectToLogin()
{
  sessionStorage.prevPage = window.location.href;
  window.location.href = "/login";
}

function redirectToPrevPage(access_token)
{
    // redirect is set from ejs rendering
    console.log(redirectTo + "?access_token=" + access_token);
    window.location.href = redirectTo + "?access_token=" + access_token;
}


function getProfileInfo(async)
{
  if(sessionStorage.userId == undefined)
  {
    return;
  }

  if(async == undefined)
    async = true;


  jQuery.ajax({
    url: _userMsUrl + "users/" + sessionStorage.userId,
    type: "GET",
    async: async,
    contentType: "application/json; charset=utf-8",
    success: function(data, textStatus, xhr)
    {
      sessionStorage.type = data.type;
      sessionStorage.name = data.name;
      
      if(data.logo != undefined)
      {
        sessionStorage.logo = data.logo;
      }


    },
    error: function(xhr, status)
    {
    },
    beforeSend: function(xhr, settings)
    {
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token);
    }
  });
}



function getUrlParameter(sParam)
{
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;
  for (i = 0; i < sURLVariables.length; i++)
  {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam)
    {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
  
  return undefined;
}




