
//get the firestore reference
const db = firebase.firestore()

const searchBarContainer = document.querySelector('.search-bar-container')

const usersList = [];

const listContainer = document.querySelector('.list-container')

const recognitionsList = [];

//modal elements
const sender = document.querySelector('.sender')
const receiver = document.querySelector('.receiver')
const message = document.querySelector('.message')
const rejectButton = document.querySelector('#reject-button')
const authorizeButton = document.querySelector('#authorize-button')

//init containers

const pendingRecognitionsContainer =  document.querySelector('.pending-recognitions-container')
const aceptedPost = document.querySelector('.acepted-post')


//empty states

const pendingRecognitionsES = document.querySelector('.es-unauthorized-post')
    const aprovedPostES = document.querySelector('.es-post')


//block of code to fill the list of users
function fillUsers(email,nombre){
    listContainer.innerHTML += 
    `<li class="collection-item halign-wrapper left-align">
        <a href="user.html?email=${email}">
            <div class="item-title">${nombre}</div>
            <div class="item-description">${email}</div>
        </a>
    </li>`
}

searchBarContainer.addEventListener('keyup', e=> {
    //console.log(e.target.value)
    const newList = filterUsers(e.target.value)
    listContainer.innerHTML = ''
    newList.forEach(user => {
        fillUsers(user.email, user.name)
    })
})

function getUsers(){

    document.addEventListener('DOMContentLoaded', function() {
        
        db.collection("users").get().then(doc =>{
            doc.forEach(query=>{
                usersList.push(query.data())
                const object = query.data()
                fillUsers(object.email, object.name)
            })
            aceptedRecognitions()
            pendingRecognitions()
        })
    });
}

function filterUsers(inputString){
    return usersList.filter(userName => {
        return userName.name.toLowerCase().match(inputString.toLowerCase())
    })
}

function getEmail(email, usersList){
    var users = usersList.filter(user=>{
        return user.email.match(email)
    })

    return users
}

getUsers()


//get the list of pending recognitions



function pendingRecognitions(){
    
    db.collection('recognitions').where('status', "==", "pendiente").get().then(recognitions => {
        if(recognitions.size == 0){
            pendingRecognitionsES.style.display = 'block'
        }
        else{
            pendingRecognitionsES.style.display = 'none'
        }
        recognitions.forEach(recognition => {
            recognitionsList.push(recognition.data())
            fillPendingRecognitions(recognition.data())
        })

        const btn = document.querySelectorAll('.modal-trigger')
        btn.forEach(ibtn=>{
              ibtn.addEventListener('click', e=>{
                  const selectedItem = recognitionsList.filter(it =>{
                      return it.id = e.target.classList[1]
                  })
                  var senderName = getEmail(selectedItem[0].sender, usersList)
                  var firstReceiver = getEmail(selectedItem[0].receiver[0], usersList)
                message.textContent = selectedItem[0].message
                sender.textContent = senderName[0].name
                receiver.textContent = firstReceiver[0].name + " y " + selectedItem[0].receiver.length + " personas mas" 
                authorizeButton.addEventListener('click', e =>{
                    db.collection('recognitions').doc(selectedItem[0].id).update({status: "aprovado"}).then(task =>{
                        alert('El reconocimiento fue aprobado!')
                    })
                })

                rejectButton.addEventListener('click', e =>{
                    db.collection('recognitions').doc(selectedItem[0].id).update({status: "rechazado"}).then(task =>{
                        alert('El reconocimiento fue rechazado!')
                    })
                })
                
              })
        })

        /*if(recognitions.size === 0){
            achievementsContainer.innerHTML += `<p class="grey-text text-lighten-1">No existen reconocimientos<p/>`
        }
        recognitions.forEach(recognition => {
            achievements.push(recognition.data())
            fillAchiements(recognition.data().type, recognition.data().message)
        })
        var deleteUsers = document.querySelectorAll('.delete-user')
        deleteUsers.forEach((button, index)=>{
            button.addEventListener('click', e => {
                e.preventDefault()
                console.log(achievements[index].id)
                achievementId = achievements[index].id
            })
        })*/
    })
  }


  function aceptedRecognitions(){
    
      db.collection('recognitions').where('status', '==', 'aprovado').get().then(recognitionsList =>{
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


  function fillPendingRecognitions(recognition)
  {  
    var senderData = getEmail(recognition.sender, usersList)
    pendingRecognitionsContainer.innerHTML += 
    ` 
                    <div class="post-request">
                        <div class="header">
                            <div class="row">
                                <div class="col s12">
                                    <div class="achievement-title col s12 "><span>${senderData[0].name}</span> esta solicitando enviar un nuevo reconocimiento</div>
                                    <a href="" data-target="authorization-modal" class="modal-trigger ${recognition.id} offset-s9 col s3">ver</a>
                                </div>   
                            </div>
                        </div>
                    </div>
              `
    }

    function fillAceptedRecognitions(recognition){
        var senderData = getEmail(recognition.sender, usersList)
        var receiverName = getEmail(recognition.receiver[0], usersList)
        console.log(senderData)
        aceptedPost.innerHTML += `
        <div class="col s12 post-item-container valign-wrapper teal lighten-5 left-align">
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