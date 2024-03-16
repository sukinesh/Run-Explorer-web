import { checkAuth , getFromDb, logOut, SetToDB} from "./firebase.js";

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

//check google auth - if no go back
const user = await checkAuth();
console.log(user);
if(user.uid == undefined)
    location.href = "../"

//check stava auth - if yes -> forward
const access_token = getCookie('access_token')
//check access token in cookies
if(access_token != undefined && access_token != "")
{
    console.log(access_token);
    location = "/map.html"
}
else 
{
    // get refresh token from Firestore and generate Access Token 
    getFromDb(user.uid).then((snap)=> {
        const refreshToken = snap.data().refresh_token;
        getNewAccessToken(refreshToken);
    })
    .catch((err)=>{

        console.log(err);
        prepForStravaAuth();
    } );
}

function prepForStravaAuth()
{
    const stravaButton = document.querySelector('#strava_connect_butn');
    stravaButton.disabled = false;
    stravaButton.querySelector("h4").innerText = 'Connect with STRAVA';
    stravaButton.style.backgroundColor = "#f40";
}

function getNewAccessToken(refreshToken)
{
    //get refresh token from firestore
    const url = `https://www.strava.com/oauth/token?client_id=120778&client_secret=dfff83ccf27dafd2adae6e59a8b234d2a03fc9c9&refresh_token=${refreshToken}&grant_type=refresh_token`;
    // console.log(url);
    fetch(url,{ method: "POST"})
    .then(response => {
        // Check if the request was successful (status code 200)
        if (!response.ok) {
            prepForStravaAuth();
            throw new Error('Network response was not ok');
        }
        // Parse the response as JSON
        return response.json();
    })
    .then(data => {
        console.log(data);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        console.log(`access_token=${data.access_token};refresh_token=${data.refresh_token}`);
        document.cookie = `access_token=${data.access_token}; expires=${expirationDate.toUTCString()}; path=/`
        // document.cookie = `refresh_token=${data.refresh_token}; expires=${expirationDate.toUTCString()}; path=/`
        location.reload();
    })
}

document.getElementById('auth_link').href = `https://www.strava.com/oauth/authorize?client_id=120778&redirect_uri=${location.href.substring(0,location.href.lastIndexOf('/'))}/auth_response.html&response_type=code&scope=activity:read_all`

// document.getElementById('strava_connect_butn').addEventListener('click',async ()=>{
//     const user = await checkAuth();
//     console.log(user);
//     if(user.uid != undefined)
//         console.log(user.uid);

//     SetToDB({'refresh_token':"pimbi_lika_pila_pi"},"users",user.uid);

        
// })

window.logOut = logOut;