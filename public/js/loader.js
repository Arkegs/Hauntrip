var loads = 1;

document.getElementById("loadEvidences").addEventListener("click", function(){
    fetch(window.location.href + '/load?skip='+ loads*5)
        .then(res => {
            return res.json();
        })
        .then(data => {
            if(data.currentUser){
                var fetchedEvidences = data.mystery.evidences;
            } else{
                var fetchedEvidences = data.evidences;
            }
            if(fetchedEvidences.length < 1){
                document.getElementById('evidences-container').innerHTML += ('<div class="loadButton">No more evidences to load</div>');
                document.getElementById("loadEvidences").style.display = "none"
            } else{
                console.log(data.currentUser);
                for(let evidence of fetchedEvidences){
                    let imgString = '';
                    let delString = '';
                    let helpful = '';
                    let helpfulMsg = '';
                    for (let evidenceImg of evidence.images){ 
                        imgString+= '<img class="img-thumbnail evidence-thumbnail" src="'+ evidenceImg.url +'">'
                    }
                    if(data.currentUser  === evidence.author._id){
                        delString+=  '<form action="/mysteries/'+ mystery._id +'/evidences/'+ evidence._id+'?_method=DELETE" method="POST"><button class="btn btn-sm btn-danger">Delete</button></form>'
                    }
                    if(evidence.helpfulness >= 5){
                        helpful = 'helpful'
                        helpfulMsg = '<p class="helpfulMsg">This evidence is considered Helpful!</p>'
                    }
                    //document.getElementById('evidences-container').innerHTML += ('<div class="card mb-3"><div class="card-body"><h3>' + evidence.title + '</h3><h6 class="card-subtitle mb-2 text-muted">By <a href="/user/'+ evidence.author.username +'">'+ evidence.author.username +' </a></h6><p>Conclusion: '+ evidence.conclusion +' </p><p>Evidence: '+ evidence.body +'</p>' + imgString + delString + '<form action="/mysteries/'+ mystery._id +'/evidences/'+ evidence._id +'" method="POST">             <button type="submit" name="helpfulness" value="1" class="btn btn-sm btn-primary">Upvote</button></form>'+ evidence.helpfulness +'<form action="/mysteries/'+ mystery._id +'/evidences/'+evidence._id+'" method="POST"><button type="submit" name="helpfulness" value="-1" class="btn btn-sm btn-success">Downvote</button></form></div></div>');
                    document.getElementById('evidences-container').innerHTML += ('<div class="single-evidence '+ helpful +'"><h4>'+ evidence.title +'</h4><h6 class="author-name">By <a href="/user/'+ evidence.author.username +'">'+ evidence.author.username+'</a></h6><p>Conclusion: '+ evidence.conclusion +'</p><p>Evidence: '+ evidence.body +'</p>' + imgString + '<div class="evidence-panel"><div class="evidence-upvote"><form action="/mysteries/' + mystery._id + '/evidences/'+ evidence._id + '" method="POST"><button type="submit" name="helpfulness" value="1" class="upvote-arrow"></button></form><span class="vote-counter">'+ evidence.helpfulness +'</span><form action="/mysteries/'+ mystery._id +'/evidences/'+ evidence._id +'" method="POST"><button type="submit" name="helpfulness" value="-1" class="downvote-arrow"></button></form></div>' + delString +'</div>' + helpfulMsg + '</div>');
                }
            }
        })
        .catch(e =>{
            console.log("Something went wrong on the request! ", e);
        });
    loads++;
});

