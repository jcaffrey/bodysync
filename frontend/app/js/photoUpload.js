function getSignedRequest(file) {
    const xhr = new XMLHttpRequest();
    const fileName = String(+ new Date()) + "_" + file.name;
    xhr.open('GET', '/sign-s3?file-name=' + fileName + '&file-type=' + file.type);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                uploadFile(file, response.signedRequest, response.url);
            }
            else {
                console.log('Could not get signed URL.');
            }
        }
    };
    xhr.send();
}

function uploadFile(file, signedRequest, url) {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success!');
                localStorage.pictureUrl = url;
            }
            else {
                console.log('Could not upload file.');
            }
        }
    };
    xhr.send(file);
}

function handleFileInput() {
    var files = document.getElementById('file-upload').files;
    var file = files[0];
    console.log(file);
    if (file == null) {
        return console.log('No file selected.');
    }
    getSignedRequest(file);
}