
if(!userToken) {
    if(window.localStorage.token) {
        if(!tokenError)
            window.location.href += "?access_token=" + window.localStorage.token;
        else
            window.localStorage.removeItem("token");
    }
}

function initToken() {
    if(userToken) {
        if(!tokenError)
            window.localStorage.setItem("token", userToken);
        else
            window.localStorage.removeItem("token");
    }
    else if(window.localStorage.token) {
        userToken = window.localStorage.token;
    }
}



function removeTokenAfterLogOut(){
    window.localStorage.removeItem("token");
    userToken=null;
}