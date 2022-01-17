const title = document.title;
console.log(title[0].innerText);

function titleChange(newTitle){
    title[0].innerText = newTitle;
    console.log(title);
}