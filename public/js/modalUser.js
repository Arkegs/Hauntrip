// Get the modal
var modal = document.getElementById("hauntrip-modal");
var modalInner = document.getElementById("modal-content-inner");
var headerTitle = document.getElementById("headerTitle");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

function reportUserModal(param){
    headerTitle.innerHTML = 'Report Evidence'
    modalInner.innerHTML = `<p> Thanks for your concern. Please, explain the issue and we will investigate it as soon as possible. </p> <form action="/report/user/${param}" method="POST"> <textarea class="form-control" placeholder="Write your report here" type="text" id="report" name="report" maxlength="1000" required></textarea> <button class="btn btn-small btn-primary" type="submit"> Submit </button></form>`
    modal.style.display = "block";
}

function deleteUserModal(param){
    headerTitle.innerHTML = 'Delete Account'
    modalInner.innerHTML = `<p> Are you sure you want to delete your account? All your mysteries and evidences will be deleted too</p> <form action="${param}" method="POST"> <button class="btn btn-danger">Delete</button></form>`
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 