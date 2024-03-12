export default function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return;
}



const access_token = getCookie('access_token')
console.log(access_token);
if(access_token != undefined && access_token != "")
{
    location = "/map.html"
}

document.getElementById('auth_link').href = `https://www.strava.com/oauth/authorize?client_id=120778&redirect_uri=${location.href.substring(0,location.href.lastIndexOf('/'))}/auth_response.html&response_type=code&scope=activity:read_all`