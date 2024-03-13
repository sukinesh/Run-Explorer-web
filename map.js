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
// console.log(access_token);
if(access_token != undefined && access_token != '')
    getActivities(access_token);
else
    location = "../"

function getActivities(access_token)
{
    let coordinatesArray = [], runsArray = [];
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
                L.polyline(coordinates, { color:"#ff4400", weight:6.5, opacity:.6, lineJoin:'round' }).addTo(map).bindPopup(`<div class="leaflet_popup">Title: ${activity.name}<br>Distance: ${(activity.distance/1000).toFixed(1)}</div>`);
                coordinatesArray.push(coordinates.map((co)=>[co.lat,co.lng]));
                runsArray.push([activity.name,coordinates.length]);
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

        // console.log(Year,All);
        document.getElementById('total_runs').innerText =  All.count;
        document.getElementById('total_distance').innerText =  All.distance+'km';
        document.getElementById('total_elev').innerText = All.elevation+'m'; 
        document.getElementById('total_time').innerText = Math.floor(All.time/3600) +":"+ Math.floor((All.time%3600)/60);
    
    
        document.getElementById('year_runs').innerText =  Year.count;
        document.getElementById('year_distance').innerText =  Year.distance+'km';
        document.getElementById('year_elev').innerText = Year.elevation+'m'; 
        document.getElementById('year_time').innerText = Math.floor(Year.time/3600) +":"+ Math.floor((Year.time%3600)/60);
    }).then(()=> {
        map.setView([coordinatesArray[0][0][0],coordinatesArray[0][0][1]],10);
        // calculateURD(coordinatesArray,runsArray);
        // console.log(runsArray);
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


//Distance calculating tools
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Function to calculate total distance of a polyline
function calculateTotalDistance(coordinates) {
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
        totalDistance += calculateDistance(coordinates[i - 1][0] , coordinates[i - 1][1] , coordinates[i][0] , coordinates[i][1]);
    }
    return totalDistance;
}


function calculateURD(coordinatesArray,runsArray)
{

    let urd = 0, turfKm = 0;
    coordinatesArray.forEach((runCos,index)=>{
        let distance = calculateTotalDistance(runCos);
        runsArray[index].push(distance);
        urd += distance;
        let turfDistance = 0;
        if(runCos.length > 0)
        {
            let line = turf.lineString(runCos);
            turfDistance = turf.length(line);
            turfKm += turfDistance;
        }

        console.log(index, distance , turfDistance);

    })
    // console.log(runsArray);
    document.querySelector("#urd_value").innerText = urd.toFixed(2);

    console.log('urd - '+urd+', turf - '+turfKm);


    // console.log(...coordinatesArray);
    // var collection = turf.featureCollection(...coordinatesArray);
    // console.log(collection);
    // // coordinatesArray.forEach((coordinates)=>{
    // //     if(coordinates.length > 0)
    // //     {
    // //         console.log(coordinates.length);
    // //         const newLineString = turf.lineString(coordinates);
    // //         multiLine = turf.combine(multiLine,newLineString);
    // //     }
    // // });
    // // multiLine = turf.combine(multiLine,[[1,2,3]]);
    // let multiLine = turf.combine(collection);
    // console.log(multiLine);
    // // Create Turf LineString objects for the polylines
    // const line1 = turf.lineString(coordinatesArray[0]);
    // const line2 = turf.lineString(coordinatesArray[1]);

    // // console.log(line1);
    // // Detect and remove overlapping segments
    // const nonOverlapping1 = turf.lineOverlap(line1, line2);
    // const nonOverlapping2 = turf.lineOverlap(line2, line1);
    // // console.log(nonOverlapping1);
    // // Step 2: Calculate Distance

    // // Calculate distance between non-overlapping segments
    // const distance1 = turf.length(nonOverlapping1, { units: 'kilometers' });
    // const distance2 = turf.length(nonOverlapping2, { units: 'kilometers' });

    // // console.log('overlap' + turf.booleanOverlap(line1,line2));
    // // Total distance between the non-overlapping segments
    // const totalDistance = distance1 + distance2;

    // // Output the total distance
    // console.log('Total distance between polylines:', totalDistance);

}