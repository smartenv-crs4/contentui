if(!userToken) {
    if(window.localStorage.token) {
        window.location.href += "?access_token=" + window.localStorage.token;
    }
}

function initToken() {
    if(userToken) {
        window.localStorage.setItem("token", userToken);
    }
    else if(window.localStorage.token) {
        userToken = window.localStorage.token;
    }
}
