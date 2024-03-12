var map = L.map('map').setView([14.12, 74.50], 11);

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
if(document.getElementById('info_panel').getAttribute('class') == '')
    document.getElementById('info_panel').setAttribute('class','duck');
else
    document.getElementById('info_panel').setAttribute('class','');
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
    let Year = {count :0,distance : 0 , elevation : 0 , time : 0 }
    let All  = {count :0,distance : 0 , elevation : 0 , time : 0 }
    // Handle the JSON data
    const activity_url = `https://www.strava.com/api/v3/athlete/activities?per_page=200&access_token=${access_token}`
    fetch(activity_url).then(response=>{
        if (!response.ok) {
            throw new Error('Network response was not ok');
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
                const polyline = activity.map.summary_polyline
                var coordinates = L.Polyline.fromEncoded(polyline).getLatLngs()
                L.polyline(coordinates, { color:"#ff4400", weight:6.5, opacity:.6, lineJoin:'round' }).addTo(map)
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

document.querySelector("#header img").addEventListener('click',()=>{
    deleteCookies();
    location.reload();
});