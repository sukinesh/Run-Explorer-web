var map = L.map('map').setView([13, 76], 5);
window.map = map;

//OpenStreet Map
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

//Google Map
L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en', {
maxZoom: 20,
subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
attribution: 'Map data © Google'
}).addTo(map);




document.getElementById('duck_icon').addEventListener('click',()=>{
    document.getElementById('info_panel').classList.toggle('duck') 
});



function getCookie(cname) {
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

const access_token = getCookie('access_token');
console.log(access_token);
if(access_token != undefined && access_token != '')
    getActivities(access_token);
else
    location = "../"

function getActivities(access_token)
{
    let coordinatesArray = [];
    let Year = {count :0,distance : 0 , elevation : 0 , time : 0 }
    let All  = {count :0,distance : 0 , elevation : 0 , time : 0 }
    // Handle the JSON data
    const activity_url = `https://www.strava.com/api/v3/athlete/activities?per_page=200&access_token=${access_token}`
    fetch(activity_url).then(response=>{
        if (!response.ok) {
            getNewAccessToken();
            throw new Error('Network response was not ok - '+response.status);
            }
            // Parse the response as JSON
            return response.json();
    }).then(activities => {
        // console.log(activities);
        activities.forEach((activity)=>{
            // console.log(activity);
            if(activity.type == "Run")
            {
                All.count++;
                All.distance += activity.distance;
                All.elevation += activity.total_elevation_gain;
                All.time += activity.elapsed_time;

                let date = new Date(activity.start_date);
                if(date.getFullYear() == new Date().getFullYear())
                {
                    Year.count++;
                    Year.distance += activity.distance;
                    Year.elevation += activity.total_elevation_gain;
                    Year.time += activity.elapsed_time;
                }


                // console.log(date);
                const polyline = activity.map.summary_polyline;
                var coordinates = L.Polyline.fromEncoded(polyline).getLatLngs();
                L.polyline(coordinates, { color:"#ff4400", weight:6.5, opacity:.6, lineJoin:'round' }).addTo(map);
                coordinatesArray.push(coordinates);
                // console.log(activity.name); 
                // if(coordinates.length > 0 )
                // {
                //     console.log(coordinates);
                //     console.log(coordinates[0].lat,coordinates[0].lng);
                //     map.setView([coordinates[0].lat,coordinates[0].lng],10);
                // }
            }

        })
        Year.distance = parseFloat((Year.distance/1000).toFixed(2));
        All.distance  = parseFloat((All.distance/1000).toFixed(2));
        Year.elevation= parseFloat(Year.elevation.toFixed(2));
        All.elevation = parseFloat(All.elevation.toFixed(2));

        console.log(Year,All);
        document.getElementById('total_runs').innerText =  All.count;
        document.getElementById('total_distance').innerText =  All.distance+'km';
        document.getElementById('total_elev').innerText = All.elevation+'m'; 
        document.getElementById('total_time').innerText = Math.floor(All.time/3600) +":"+ Math.floor((All.time%3600)/60);
    
    
        document.getElementById('year_runs').innerText =  Year.count;
        document.getElementById('year_distance').innerText =  Year.distance+'km';
        document.getElementById('year_elev').innerText = Year.elevation+'m'; 
        document.getElementById('year_time').innerText = Math.floor(Year.time/3600) +":"+ Math.floor((Year.time%3600)/60);
    }).then(()=> {
        console.log(coordinatesArray);
        map.setView([coordinatesArray[0][0].lat,coordinatesArray[0][0].lng],10);
    });
}

function getNewAccessToken()
{
    const refreshToken = getCookie('refresh_token');
    console.log(refreshToken);

    const url = `https://www.strava.com/oauth/token?client_id=120778&client_secret=dfff83ccf27dafd2adae6e59a8b234d2a03fc9c9&refresh_token=${refreshToken}&grant_type=refresh_token`;
    // console.log(url);
    fetch(url,{ method: "POST"})
    .then(response => {
        // Check if the request was successful (status code 200)
        if (!response.ok) {
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

function deleteCookies()
{
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }

}
//logout
document.querySelector("#header img").addEventListener('click',()=>{
    deleteCookies();
    location.reload();
});