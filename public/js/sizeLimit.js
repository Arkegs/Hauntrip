const uploadField = document.getElementById("image");
const allowedImages = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic', 'image/bmp'];

uploadField.onchange = function() {
    let error = false;
    if(this.files[0].size > 2000000){
       alert("File exceeds the file size limit");
       error = true;
    };
    if(!allowedImages.includes(this.files[0].type)){
        alert("Unsupported file format (Allowed: BMP, JPEG, JPG, PNG, HEIC)");
        error = true;
    };
    if(error){
        this.value = "";
    }
};

