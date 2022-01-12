const repeatpassword = document.getElementById("repeatpassword");
const newpassword = document.getElementById("newpassword");
const submit = document.getElementById("submit");

repeatpassword.addEventListener('keyup', () =>{
    if (repeatpassword.value !== newpassword.value){
        repeatpassword.setCustomValidity("notvalid");
        submit.disabled = true;
    } else{
        repeatpassword.setCustomValidity("");
        submit.disabled = false;
    }
})