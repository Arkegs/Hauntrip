const upvote = document.querySelectorAll('.upvote-arrow');
const downvote = document.querySelectorAll('.downvote-arrow');

upvote.forEach((elem) => {
    elem.addEventListener('click', upVoting);
});

downvote.forEach((elem) => {
    elem.addEventListener('click', downVoting);
});

async function postData(url, data = {}){
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    console.log(response.body);
    return response.json(); // parses JSON response into native JavaScript objects
};

async function upVoting(){
    event.preventDefault();
    this.classList.add('vote-clicked');
    this.disabled = true;
    this.parentElement.parentElement.children[2].children[0].classList.remove('vote-clicked');
    this.parentElement.parentElement.children[2].children[0].disabled = false;
    const sentValue = { "helpfulness": 1 };
    console.log('La mandamos a: ' + this.form.action + ' Con valor: ' + sentValue);
    let resp = await postData(this.form.action, sentValue);
    console.log(this.form.action);
    console.log(resp);
    if (resp.value === 'new'){
        let voteTotal = this.parentElement.parentElement.children[1];
        voteTotal.innerText = parseInt(voteTotal.innerText) + sentValue.helpfulness;
    }
    if (resp.value === 'changed'){
        let voteTotal = this.parentElement.parentElement.children[1];
        voteTotal.innerText = parseInt(voteTotal.innerText) + (sentValue.helpfulness)*2;
    }
};

async function downVoting(){
    event.preventDefault();
    this.parentElement.parentElement.children[0].children[0].classList.remove('vote-clicked');
    this.parentElement.parentElement.children[0].children[0].disabled = false;
    this.classList.add('vote-clicked');
    this.disabled = true;
    const sentValue = { "helpfulness" : -1 };
    console.log(this.form.action);
    let resp = await postData(this.form.action, sentValue);
    if (resp.value === 'new'){
        let voteTotal = this.parentElement.parentElement.children[1];
        voteTotal.innerText = parseInt(voteTotal.innerText) + sentValue.helpfulness;
    }
    if (resp.value === 'changed'){
        let voteTotal = this.parentElement.parentElement.children[1];
        voteTotal.innerText = parseInt(voteTotal.innerText) + (sentValue.helpfulness)*2;
    }
    console.log(resp); 
};


postData('https://example.com/answer', { answer: 42 })
  .then(data => {
    console.log(data); // JSON data parsed by `data.json()` call
  });