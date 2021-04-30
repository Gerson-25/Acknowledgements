const db = firebase.firestore()
var options = document.querySelector('.options')
var tokenOptions = document.querySelector('.tokenOptions')
//const send = document.querySelector('#send')
//const user = document.querySelector('#user')
const type = document.querySelector('#type')
const message = document.querySelector('#message')
const usersTable = document.getElementById('users-table')
const searchUser = document.getElementById('search-user')
const notResult = document.getElementById('not-result')
//user profile elements
const userName = document.getElementById('user-name')
const userEmail = document.getElementById('user-email')
const userToken = document.getElementById('user-token')
const userPhoto = document.getElementById('user-photo')

//
const photoLoader = document.getElementById('image-loader')
const newAchievementButton = document.getElementById('new-achievement-button')

//new achievement elements
const messageUserName = document.getElementById('message-user-name')
const messageContent = document.getElementById('achievement-description')
const messageTitle = document.getElementById('achievement-title')
const achievementsContainer = document.getElementById('achievements-container')
const closeModal = document.getElementById('modal-close')
const saveAchievement = document.getElementById('save-achievement')
const modal = document.getElementById('message-loader')

//delete achievement elements
const deleteLoader = document.getElementById('delete-loader')
const deleteModal = document.getElementById('delete-modal')
const deleteAchievementBtn = document.getElementById('delete-achievement')
const modal2 = document.getElementById('modal2')
const deleteTitle = document.getElementById('delete-title')
const deleteContent = document.getElementById('delete-content')



var token  = '';
let achievementId;


let users = [];
let achievements = [];

function createId() {
    return Math.random().toString(36).substr(2, 15);
  }


function loadProfile(email){
    clearAchievements()
    loadAchievements(email)
        photoLoader.style.display = 'block'
        db.collection("users").doc(email).get().then(user =>{
        console.log(user.data())
        userName.textContent = user.data().name
        userEmail.textContent= user.data().email
        token = user.data().token
        messageUserName.textContent = user.data().name
        console.log(userPhoto)
        userPhoto.src = user.data().carnetPhoto
    }).catch(error=>{
        console.log(error)
    })
  }



  function fillAchiements(title, message){
      achievementsContainer.innerHTML += 
      `
      <div class="row">
        <div class="col s12">
          <div class="card blue-grey darken-1">
            <div class="card-content white-text">
              <span class="card-title">${title}</span>
              <p>${message}</p>
            </div>
            <div class="card-action">
                <i class=" modal-trigger tiny material-icons delete-user white-text offset-s8" style=" cursor: pointer;" href="#modal2">delete</i>
            </div>
          </div>
        </div>
      </div>
                `
  }


  userPhoto.addEventListener('loadend', e => {
    photoLoader.style.display = 'none'
    console.log('picture has change')
  })


  closeModal.addEventListener('click', e => {
    cleanInputs()
  })


  function cleanInputs(){
    messageContent.value = ''
    messageTitle.value = ''
  }


document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, options);
    db.collection("users").get().then(doc =>{
        doc.forEach(query=>{
            users.push(query.data())
            const object = query.data()
            fillUsers(object.email, object.name)
        })
        var tableArrows = document.querySelectorAll('.table-arrow')
        tableArrows.forEach((arrow, index) =>{
            arrow.addEventListener('click', e => {
                loadProfile(users[index].email)
            })
        })
    })

  });


  function deleteAchievement(id){
    console.log('email: '+ userEmail.textContent)
    console.log('id: '+id)
    db.collection('users').doc(userEmail.textContent).collection('recognitions').where('id', '==', id).get().then(queryDocs=>{
        queryDocs.forEach(doc=>{
            doc.ref.delete().then(query=>{
                showButtons("Elemento eliminado")
                clearAchievements()
                loadAchievements(userEmail.textContent)
            }).catch(e => {
                showButtons("UPSSS, algo salio mal!")
            })
        })
    })
}

deleteAchievementBtn.addEventListener('click', e =>{
    hiddeDeleteButtons('none', 'none', 'inline')
    console.log(achievementId)
    deleteAchievement(achievementId)
})

  searchUser.addEventListener('change', e =>{
    console.log(e.target.value)
    var matchName = users.filter(user => 
        user.name.match(e.target.value)
    )
    console.log(matchName.length)
        if(matchName.length === 0){
            notResult.style.display = 'block'
        }
        else{
            notResult.style.display = 'none'
        }
    cleanList()
    matchName.forEach(object =>{
        fillUsers(object.email, object.name)
    })
    var tableArrows = document.querySelectorAll('.table-arrow')
        tableArrows.forEach((arrow, index) =>{
            arrow.addEventListener('click', e => {
                loadProfile(matchName[index].email)
            })
        })
    
  })


function cleanList(){
    usersTable.innerHTML = ''
}

function clearAchievements(){
    achievementsContainer.innerHTML = `<p class="col s12">Reconocimientos: </p>`
}

function fillUsers(email,nombre){
    usersTable.innerHTML += 
    `<tr class="table-arrow" id="arrow-${email}">
        <td>${nombre}</td>
        <td>${email}</td>
    </tr>`
}

saveAchievement.addEventListener('click', e => {
    if(myFun){
        hiddeButtons('none', 'block')
        addRecognition(userEmail.textContent)
    }
    else{
        alert("Llena todos los campos")
    }
})

function getCurrentTime(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + " " + time
}

function addRecognition(user){

    const id = createId()
    var object = {
        type: messageTitle.value,
        message:messageContent.value,
        token: token,
        id:id,
        postTime: getCurrentTime()
    }

    console.log(object)
    db.collection("users").doc(user).collection("recognitions").doc().set({
        type: messageTitle.value,
        message:messageContent.value,
        token: token,
        id:id,
        postTime: getCurrentTime()
    }).then(fun=>{
        clearAchievements()
        loadAchievements(userEmail.textContent)
        cleanInputs()
        hiddeButtons('block', 'none')
        console.log("los datos se agregaron")
        alert("Reconocimiento agregado!")
    }).catch(e=>{
        alert("Uppp! algo salio mal.")
        hiddeButtons('block', 'none')
        console.log("hubo un error")
    })
} 

deleteModal.addEventListener('click',e=>{
    initModal2()

})

function myFun(){
    return messageContent.value == '' || messageTitle.value == ''
}

function hiddeButtons(buttonState, containerState){
    saveAchievement.style.display = buttonState
    closeModal.style.display = buttonState
    modal.style.display = containerState
}

function hiddeDeleteButtons(button1State, button2State, containerState){
    deleteModal.style.display = button1State
    deleteAchievementBtn.style.display = button2State
    deleteLoader.style.display = containerState
}

function showButtons(text){
    deleteModal.textContent = 'SALIR'
    deleteModal.style.display = 'inline'
    deleteAchievementBtn.style.display = 'none'
    deleteLoader.style.display = 'none'
    deleteTitle.textContent = ''
    deleteContent.textContent = text

}

function initModal2(){
    deleteAchievementBtn.style.display = 'inline'
    deleteModal.style.display = 'inline'
    deleteModal.textContent = 'CANCELAR'
    deleteTitle.textContent = '¿Quieres eliminar este Reconocimiento?'
    deleteContent.textContent = 'Esta accion no podrá ser revocada'
}

/*

function fillEmails(email,nombre){
    options.innerHTML += `<option value="${email}" >${nombre}</option>`
}

function fillTokens(token){
    tokenOptions.innerHTML += `<option value="${token}" >${token}</option>`
}

console.log(message)
send.addEventListener('click',e=>{
    addRecognition()
    console.log(user.value,type.value,message.value)

}); */

