var currentFiles = [];
var isRender = false;

/**
 * Show image
 * @param {*} file path to file
 * @param {*} viewId id of image view
 */
function showImage(files, viewId, defaultLink) {
    if (!files || files.length == 0) {
        $('#' + viewId).attr('src', defaultLink);
        return;
    }

    var reader = new FileReader();
    reader.onloadend = function () {
        $('#' + viewId).attr('src', reader.result);
    }
    reader.readAsDataURL(files[0]);
}

function validateForm() {
    let avatar = $('#inputAvatar').val();
    let passportFront = $('#inputPassportFront').val();
    let passportReal = $('#inputPassportReal').val();

    //Reset state
    $('#avatar-error').html('');
    $('#passport-error').html('');

    let error = '';
    if (!avatar || avatar == '') {
        error = 'You must select avatar.';
        $('#avatar-error').html(error);
    }
    if (!passportFront || !passportReal || passportFront == '' || passportReal == '') {
        error = "You must select passport images";
        $('#passport-error').html(error);
    }
    return error == '';
}