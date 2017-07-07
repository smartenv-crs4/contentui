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
                avatar : profileImage,
                profilePage:"?access_token=" + userData.UserToken
            }));


            //wait to language manager, when is loaded translate sidebar
            addEventListener('profileLanguageManagerInitialized', function (e) {
                jQuery("#sidebar").localize();

            }, false);

        }
    }
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

function redirectToResetPassword()
{
    sessionStorage.prevPage = window.location.href;
    window.location.href = "/resetPassword";
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




