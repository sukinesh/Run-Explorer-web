import { checkAuth, SetToDB } from "./firebase.js";

function processURLParameters() {
    //get parm from url
    var queryString = window.location.search;
    if(queryString.length == 0) return;
    queryString = queryString.substring(1);
    var queryParams = queryString.split('&');
    var params = {};
    queryParams.forEach(function(param) {
        var keyValue = param.split('=');
        var key = decodeURIComponent(keyValue[0]);
        var value = decodeURIComponent(keyValue[1]);
        params[key] = value;
    });
    
    return params;
}

let response = processURLParameters()
console.log(response);
if(response == undefined)
{
    response = history.state;
}

if(response.hasOwnProperty('code'))
{
    history.pushState({code:response.code}, "", "map.html");
    console.log(response.code);
    const url = `https://www.strava.com/oauth/token?client_id=120778&client_secret=dfff83ccf27dafd2adae6e59a8b234d2a03fc9c9&code=${response.code}&grant_type=authorization_code`
    console.log(url);
    fetch(url,{ method: "POST"})
    .then(response => {
        // Check if the request was successful (status code 200)
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(async (data) => {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        console.log(`access_token=${data.access_token};refresh_token=${data.refresh_token}`);
        document.cookie = `access_token=${data.access_token}; expires=${expirationDate.toUTCString()}; path=/`
        // document.cookie = `refresh_token=${data.refresh_token}; expires=${expirationDate.toUTCString()}; path=/`
        const user = await checkAuth();
        SetToDB({'refresh_token':data.refresh_token},"users",user.uid)
            .then((result)=>{
                console.log(result);
                location ="../map.html";
            }).catch((err)=> console.log(err));
    })
}
else if(response.hasOwnProperty('error'))
{
    if(response.error == "access_denied")
    {
        console.log(response.error);
        location="../"
    }
}