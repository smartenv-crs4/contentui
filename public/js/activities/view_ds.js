$(document).ready(function () {
    initToken();

    var admins = activityBody.admins;
    admins.push(activityBody.owner);

    common.isAdmin(admins, function(isAuth) {
        if(isAuth)
            $(".loggedonly").show()
    });
});