$(document).ready(function()
{
    getThumbnails();

    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        // All the File APIs are supported.
        $('#sendButton').attr("disabled", false);

        $('#fileForm').on('submit', function(e)
        {
            e.preventDefault();

            if ( $('#addFile').val() == "" )
            {
                $('#errorDiv').empty().append('No file chosen!');
                return;
            }

            $.ajax(
            {
                url : window.location.pathname + 'uploads',
                type: "POST",
                data: new FormData($('#fileForm')[0]),
                cache: false,
                contentType: false,
                processData: false,
                success: function (data)
                {
                    getThumbnails();
                },
                error: function (jXHR, textStatus, errorThrown)
                {
                    $('#errorDiv').empty().append(textStatus + ':\n' + errorThrown);
                },
            });
        });
    }
    else
    {
        $('#errorDiv').empty().append('File APIs not supported.');
    }

});

function getThumbnails()
{
    $.ajax(
    {
        url : window.location.pathname + 'uploads/thumbs',
        type: "GET",
        success: function (data)
        {
            $('#imageDiv').empty().append(data);
            $('#imageDiv img').click(function()
            {
                openImage($(this));
            });
        },
        error: function (jXHR, textStatus, errorThrown)
        {
            $('#errorDiv').empty().append(textStatus + ':\n' + errorThrown);
        },
    });
}

function openImage(el)
{
    console.log('openImage clicked: ' + el);
    var i = 0;

    $.ajax(
    {
        url : window.location.pathname + 'uploads/fullsize/'+ el.attr('filename'),
        type: "GET",
        success: function (data)
        {

        },
         error: function (jXHR, textStatus, errorThrown)
        {
            $('#errorDiv').empty().append(textStatus + ':\n' + errorThrown);
        },
    });
}
