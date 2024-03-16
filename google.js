import { GoogleLogin , checkAuth , logOut } from "./firebase.js"
document.getElementById('signin_butn').addEventListener('click',GoogleLogin);

const user = await checkAuth();
console.log(user);
if(user.uid != undefined)
    location.href = "../home.html"

window.logOut = logOut;