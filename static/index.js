// TODO: Images and comments served as static?

$(document).ready(function()
{
    $('#noticeDiv').hide();

    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        // All the File APIs are supported.
        $('#sendButton').attr("disabled", false);

        var files = getFileNames();
        getThumbnails(files);

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
                    getThumbnails(files);
                },
                error: function (jXHR, textStatus, errorThrown)
                {
                    showNotice('danger', 'Image upload failed!');
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

// Get names of images on server
function getFileNames()
{
    var files = [];
    $.ajax(
    {
        async: false,
        url : window.location.pathname + 'uploads/names',
        type: "GET",
        success: function (data)
        {
            files = data.split(',');
        },
        error: function (jXHR, textStatus, errorThrown)
        {
            showNotice('danger', 'Something went wrong!');
        },
    });
    return files;
}

function getThumbnails(files)
{
    $('#imageContainer').empty()
    for (var ind in files)
    {
        var file = files[ind];
        $('#imageContainer').append(
            $('<img filename="'+file+'"/>')
                .attr('src', window.location.pathname + 'thumbs/' + file)
                .click(function() { openImage($(this)); })
        );
    }
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
