/**
 * Change this to your facebook id
 */
const facebookId = '363610701143737';

window.fbAsyncInit = function () {
    FB.init({
        appId: facebookId,
        cookie: true,
        xfbml: true,
        version: 'v3.2'
    });

    FB.AppEvents.logPageView();

};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2&appId=${facebookId}&autoLogAppEvents=1`;
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginWithFacebook() {
    FB.getLoginStatus(function (response) {
        if (response.status == 'connected') {
            //call to server
            FB.api('/me', { fields: 'name, email' }, function (me) {
                const data = {
                    email: me.email,
                    username: me.name,
                    id: me.id,
                    access_token: response.authResponse.accessToken
                };

                var form = document.createElement('form');
                document.body.appendChild(form);
                form.method = 'post';
                form.action = '/login-facebook';
                for (var name in data) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = data[name];
                    form.appendChild(input);
                }
                form.submit();
            });
        }
    });
}