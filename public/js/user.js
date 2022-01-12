function expRender(exp){
    const expBar = document.getElementById("exp-bar").parentElement;
    const rankTitle = document.getElementById("rank-title");
    let maxExp = 0;
    let minExp = 0;
    switch(true){
        case (exp < 20):
            maxExp = 20;
            expBar.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + (exp/maxExp)*100 + '%" aria-valuenow="'+ exp +'" aria-valuemin="'+ minExp +'" aria-valuemax="'+ maxExp +'"></div><small style="color:black;" class="justify-content-center d-flex position-absolute w-100">' + exp + '/' + maxExp + '</small>'
            rankTitle.innerText = 'Newbie Investigator';
            break;
        case (exp < 50):
            minExp = 20
            maxExp = 50;            
            expBar.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + (exp/maxExp)*100 + '%" aria-valuenow="'+ exp +'" aria-valuemin="'+ minExp +'" aria-valuemax="'+ maxExp +'"></div><small style="color:black;" class="justify-content-center d-flex position-absolute w-100">' + exp + '/' + maxExp + '</small>'
            rankTitle.innerText = 'Amateur Investigator';
            break; 
        case (exp < 80):
            minExp = 50
            maxExp = 80;
            expBar.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + (exp/maxExp)*100 + '%" aria-valuenow="'+ exp +'" aria-valuemin="'+ minExp +'" aria-valuemax="'+ maxExp +'"></div><small style="color:black;" class="justify-content-center d-flex position-absolute w-100">' + exp + '/' + maxExp + '</small>'
            rankTitle.innerText = 'Intermediate Investigator';
            break;     
        case (exp < 120):
            minExp = 80
            maxExp = 120;
            expBar.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + (exp/maxExp)*100 + '%" aria-valuenow="'+ exp +'" aria-valuemin="'+ minExp +'" aria-valuemax="'+ maxExp +'"></div><small style="color:black;" class="justify-content-center d-flex position-absolute w-100">' + exp + '/' + maxExp + '</small>'
            rankTitle.innerText = 'Advanced Investigator';
            break;
        case (exp < 160):
            minExp = 120
            maxExp = 160;
            expBar.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + (exp/maxExp)*100 + '%" aria-valuenow="'+ exp +'" aria-valuemin="'+ minExp +'" aria-valuemax="'+ maxExp +'"></div><small style="color:black;" class="justify-content-center d-flex position-absolute w-100">' + exp + '/' + maxExp + '</small>'
            rankTitle.innerText = 'Expert Investigator';
            break;     
        case (exp > 160):
            expBar.innerHTML = '<div class="progress-bar bg-success" role="progressbar" style="width: ' + (exp/maxExp)*100 + '%" aria-valuenow="'+ exp +'" aria-valuemin="'+ minExp +'" aria-valuemax="'+ maxExp +'"></div><small style="color:black;" class="justify-content-center d-flex position-absolute w-100">' + exp + '/' + maxExp + '</small>'
            rankTitle.innerText = 'Master Investigator';
            break;                                 
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var loads = 1;

if(document.getElementById("loadMysteries") !== null){
    document.getElementById("loadMysteries").addEventListener("click", function(){
        fetch(window.location.href + '/load?skip='+ loads*10)
            .then(res => {
                return res.json();
            })
            .then(data => {
                var fetchedMysteries = data;
                if(fetchedMysteries.length < 1){
                    document.getElementById('user-mysteries').innerHTML += ('<div class="loadButton">No more mysteries to load</div>');
                    document.getElementById("loadMysteries").style.display = "none"
                } else{
                    for(let mystery of fetchedMysteries){
                        let fullString = ('<a href="/mysteries/'+ mystery._id +'" class="single-mystery"><img style="width:100px; height: 100px;" src="'+ (mystery.image ? mystery.image.url : 'https://res.cloudinary.com/arkeg/image/upload/v1638555012/Hauntrip/General/unavailable-2_plmphn.png') +'" alt=""><p>'+ mystery.title +'</p></a>');
                        document.getElementById('user-mysteries').innerHTML += fullString;
                    }
                }
            })
            .catch(e =>{
                console.log("Something went wrong on the request! ", e);
            });
        loads++;
    });
}