/**
 * Created by creed on 22.01.17.
 */
(function($) {
    $('#submit-form').on('submit', function(e) {
        var formData = new FormData(this);
        $.ajax({
            url: '/',
            method: 'POST',
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload) { // Check if upload property exists
                    myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
                }
                return myXhr;
            },
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: "multipart/form-data",
            // processData: false,
            success: function(data) {
                console.log(data);
            },
            error: function() {
                console.log(arguments);
            }
        });
        e.preventDefault();
    });
})(jQuery);

function progressHandlingFunction(e){
    if(e.lengthComputable){
        $('progress').attr({value:e.loaded,max:e.total});
    }
}