
window.onload = function() {
    var recaptcha = document.getElementById('g-recaptcha-response');
    if(recaptcha) {
        recaptcha.setAttribute("required", "required");
    }
};