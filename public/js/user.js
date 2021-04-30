const db = firebase.firestore()

//save user token 
let token;

const usersList = [];
const achievements = [];
//form elements instances
const header = document.querySelector('.header')
const body = document.querySelector('.body')
const modal = document.getElementById('message-loader')

//profile elements instances
const userName = document.querySelector('.user-name')
const userEmail = document.querySelector('.user-email')
const userPicture = document.querySelector('.user-picture') 


//buttons instances
const newPostContainer = document.querySelector('.new-post-container')
const btnOpenForm = document.querySelector('.btn-open-form')
const btnCloseForm = document.querySelector('.btn-close-form')
const btnSendPost = document.querySelector('.btn-send-post')


// button event listeners
btnOpenForm.addEventListener('click', e=> {
    newPostContainer.classList.remove(['container-folder'])
    newPostContainer.classList.add(['container-expander'])
    newPostContainer.classList.replace('new-post-container-invisible', 'new-post-container-visible')
})

const aceptedPost = document.querySelector('.acepted-post')
const aprovedPostES = document.querySelector('.es-post')
const achievementsContainer = document.querySelector('.achievement-container')

//get url parameters
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const email = urlParams.get('email')

const pendingRecognitionsContainer =  document.querySelector('.pending-recognitions-container')

//modal elements
const modalTitle = document.querySelector('.modal-title')
const modalBody = document.querySelector('.modal-body')
const rejectButton = document.querySelector('#reject-button')


btnCloseForm.addEventListener('click', e => {
    e.preventDefault()
    newPostContainer.classList.remove(['container-expander'])
    newPostContainer.classList.add(['container-folder'])
    newPostContainer.classList.replace('new-post-container-visible', 'new-post-container-invisible')
})

btnSendPost.addEventListener('click', e => {
    if(areEmpty()){
        alert("Llena todos los campos")
    }
    else{
        hiddeButtons('block')
        addRecognition(email)
    }
    })

loadProfile(email)
function loadProfile(email){
        db.collection("users").doc(email).get().then(user =>{
        userName.textContent = user.data().name
        userEmail.textContent= user.data().email
        userPicture.src = user.data().carnetPhoto
        token = user.data().token

    }).catch(error=>{
        console.log(error)
    })
  }

function loadPost(email){
    db.collection('users').doc(email).collection('recognitions').get().then(post => {

    })
}

function getEmail(email, usersList){
    var users = usersList.filter(user=>{
        return user.email.match(email)
    })

    return users
}

function addRecognition(email){
    var object = {
        type: header.value,
        message: body.value,
        token: createToken(),
        id: createId(),
        postTime: getCurrentTime()
    }

    db.collection("users").doc(email).collection("recognitions").doc().set(object).then(fun=>{
        //clearAchievements()
        //loadAchievements(userEmail.textContent)
        cleanInputs()
        console.log("los datos se agregaron")
        alert("Reconocimiento agregado!")
        newPostContainer.classList.remove(['container-expander'])
        newPostContainer.classList.add(['container-folder'])
        newPostContainer.classList.replace('new-post-container-visible', 'new-post-container-invisible')
        hiddeButtons('none')
    }).catch(e=>{
        alert("Uppp! algo salio mal.")
        console.log(e)
    })
} 


function createId() {
    return Math.random().toString(36).substr(2, 15);
}


function createToken(){
    return token ? token : "";
}


function cleanInputs(){
    header.value = ''
    body.value = ''
}


function areEmpty(){
    return header.value == '' || body.value == ''
}


function hiddeButtons(containerState){
    modal.style.display = containerState
}


function getCurrentTime(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + " " + time
}

//load user recognitions

  function fillAceptedRecognitions(recognition){
    var senderData = getEmail(recognition.sender, usersList)
    var receiverName = getEmail(recognition.receiver[0], usersList)
    aceptedPost.innerHTML += `
    <div class="col s8 post-item-container valign-wrapper teal lighten-5 left-align">
                    <div class="col s2 post-item-picture">
                        <img src="${senderData[0].carnetPhoto}" alt="" class="z-depth-2">
                    </div>
                    <div class="col s10 post-item-body">
                        <div class="col s12 achievement-title valign-wrapper teal-text text-darken-4">${senderData[0].name} <i class=" tiny material-icons">keyboard_arrow_right</i> ${receiverName[0].name} y ${recognition.receiver.length} personas mas</div>
                        <div class="col s12 achievement-description">${recognition.message}</div>
                        <div class="col s12 post-date right-align">${recognition.date}</div>
                    </div>
                </div>`
}


    function aceptedRecognitions(){
    
        db.collection('recognitions').where('status', '==', 'aprovado').where("sender","==",email).get().then(recognitionsList =>{
          if(recognitionsList.size == 0){
              aprovedPostES.style.display = 'block'
          }
          else{
              aprovedPostES.style.display = 'none'
          }
            recognitionsList.forEach(queryRecognition =>{
              fillAceptedRecognitions(queryRecognition.data())
            })
        })
    }

    function deleteAchievement(id){
        db.collection('users').doc(email).collection('recognitions').doc(id).delete().then(deleteTask => {
           alert('El reconocimiento fue eliminado')
        })
    }

    getUsers()

    function getUsers(){

        document.addEventListener('DOMContentLoaded', function() {
            
            db.collection("users").get().then(doc =>{
                doc.forEach(query=>{
                    usersList.push(query.data())
                })
                aceptedRecognitions()
            })
        });
    }

    function fillAchiements(recognition, collectionId){
        achievementsContainer.innerHTML += 
        `
        <div class="col s3">
            <img class="achievement-item ${recognition.id} ${collectionId} modal-trigger" data-target="authorization-modal" src="svg/cup.svg" alt="">
        </div>`
    }

    loadAchievement()

    function loadAchievement(){
        console.log("function to load achievements was fired")
        db.collection('users').doc(email).collection("recognitions").get().then(recognitionsList =>{
            recognitionsList.forEach(queryRecognition =>{
                achievements.push(queryRecognition.data())
              fillAchiements(queryRecognition.data(), queryRecognition.id)
            })
            const btn = document.querySelectorAll('.modal-trigger')
            btn.forEach(ibtn => {
                ibtn.addEventListener('click', e => {
                    console.log(e.target.classList[1])
                    const selectedItem = achievements.filter(it =>{
                        return it.id = e.target.classList[1]
                    })
                    modalTitle.textContent = selectedItem[0].type
                    modalBody.textContent = selectedItem[0].message
                    rejectButton.addEventListener('click', eb =>{
                        deleteAchievement(e.target.classList[2])
                    })
                })
            })
        })
    }