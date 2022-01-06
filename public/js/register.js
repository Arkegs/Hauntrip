const submit = document.getElementById('submitButton');
let maxDateToday = new Date();
let maxDateValue = ((maxDateToday.getFullYear()-13) + '-' + (maxDateToday.getMonth()+1) + '-' + maxDateToday.getDate());

console.log(document.getElementById('birthdate').value);
console.log(maxDateValue);
document.getElementById('birthdate').max = maxDateValue;

submit.addEventListener('click', () => {
    if(!document.getElementById('terms').checked){
        alert('You must agree with our Terms and conditions and our Privacy Policy in order to create an account');
        // console.log(Date.parse(document.getElementById('birthdate').value) + ' vs ' + Date.parse(maxDateValue));
        // console.log(Date.parse(document.getElementById('birthdate').value) > Date.parse(maxDateValue))
    }
    if(Date.parse(document.getElementById('birthdate').value) > Date.parse(maxDateValue)){
        document.getElementById('birthdate').setCustomValidity("invalid");
    }
    if(Date.parse(document.getElementById('birthdate').value) < Date.parse(maxDateValue)){
        document.getElementById('birthdate').setCustomValidity("");
    }      
});