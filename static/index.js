$(document).ready(function()
{
    $('#noticeDiv').hide();
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
                showNotice('danger', 'No file chosen!');
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
                    showNotice('danger', 'Something went wrong.');
                },
            });
        });
    }
    else
    {
        showNotice('danger', 'File APIs not supported.');
    }

    $('#fileForm').ajaxForm(function ()
    {
        showNotice('success', 'Image uploaded succesfully!');
    });
});

function getThumbnails()
{
    $.ajax(
    {
        url : window.location.pathname + 'uploads/thumbs',
        type: "GET",
        success: function (data)
        {
            $('#imageContainer').empty().append(data);
            $('#imageContainer img').click(function()
            {
                openImage($(this));
            });
        },
        error: function (jXHR, textStatus, errorThrown)
        {
            showNotice('danger', 'Something went wrong.');
        },
    });
}

function openImage(el)
{
    var name = el.attr('filename').split('.')[0]
    window.location.href = '/img/' + name;
}


function showNotice(type, msg)
{
    $('#noticeDiv').removeClass('alert-danger').removeClass('alert-success');

    $('#noticeDiv').empty().show().addClass('alert-'+type).append(msg);
    setTimeout(function() { $('#noticeDiv').fadeOut('slow'); }, 3000)
}
