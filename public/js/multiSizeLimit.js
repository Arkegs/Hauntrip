const uploadField = document.getElementById("images");
const allowedImages = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic', 'image/bmp'];

uploadField.onchange = function() {
    let exceeded = false;
    let formatError = false;
    for(let a = 0; a < this.files.length; a++){
        if(this.files[a].size > 1000000){
            exceeded = true;
        };
        if(!allowedImages.includes(this.files[a].type)){
            formatError = true;
         };
    }
    if(exceeded && formatError){
        alert("One or more files exceeded the file size limit, and also has an unsupported file format (Allowed: BMP, JPEG, JPG, PNG, HEIC)");
        this.value = "";
    }
    if(exceeded && !formatError){
        alert("One or more files exceeded the file size limit");
        this.value = "";
    }
    if(!exceeded && formatError){
        alert("One or more files has an unsupported file format (Allowed: BMP, JPEG, JPG, PNG, HEIC)");
        this.value = "";
    }
};