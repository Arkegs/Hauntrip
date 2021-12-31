const submit = document.getElementById('submitButton');
let maxDateToday = new Date();
let maxDateValue = ((maxDateToday.getFullYear()-13) + '-' + (maxDateToday.getMonth()+1) + '-' + maxDateToday.getDate());

console.log(document.getElementById('birthdate').max);
console.log(maxDateValue);
document.getElementById('birthdate').max = maxDateValue;
document.getElementById('birthdate').value = maxDateValue;

submit.addEventListener('click', () => {
    if(!document.getElementById('terms').checked){
        alert('You must agree with our Terms and conditions and our Privacy Policy in order to create an account');
    }
});