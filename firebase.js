// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyB-0Z_umRJ5TaLK_woFHcpirp_yIffgvNY",
authDomain: "run-explorer.firebaseapp.com",
projectId: "run-explorer",
storageBucket: "run-explorer.appspot.com",
messagingSenderId: "1044623552559",
appId: "1:1044623552559:web:707defaca0bde8b8efd6da",
measurementId: "G-MZ2B7W6EMF"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

import {getAuth , GoogleAuthProvider ,signInWithPopup , onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {getFirestore, doc, getDoc,getDocs,setDoc,collection,updateDoc,query,orderBy ,where, deleteDoc, getCountFromServer} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
const auth = getAuth(firebase);
const firestore = getFirestore(firebase);

const provider = new GoogleAuthProvider();

export function GoogleLogin(){
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            // const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log(user);
            location.href = "../home.html"
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            // The email of the user's account used.
            // const email = error.customData.email;
            // The AuthCredential type that was used.
            // const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        })
}


//check auth state and navigate page
export function checkAuth()
{   
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user =>{
            if(user)
            {
                // console.log(user);
                resolve(user);
                // location.href = "../home.html"
            }
            else
            {
                // console.log('logged out');
                resolve('no user')
            }
            unsubscribe();
        });
    })
}

export function logOut() {auth.signOut();}

export function SetToDB(data,data_base,data_name) {
    let doc_ref = doc(firestore, data_base, data_name);
    return new Promise(async (resolve,reject)=>{
        await setDoc(doc_ref, data)
            .then(() => {
                console.log("data Set");
                resolve('set');
            })
            .catch((error) => {
                reject(error);
            });

    })
}

export function getFromDb(uid)
{
    const docRef = doc(firestore, "users", uid);
    return new Promise(async (resolve,reject)=>{
        await getDoc(docRef).then((result)=>resolve(result)).catch((err)=>reject(err));  
    })
}

