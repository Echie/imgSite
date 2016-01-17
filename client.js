$(document).ready(function()
{
    // getImages();

    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        $('#fileForm').on('submit', function(e)
        {
            e.preventDefault();

            if ( $('#addFile').val() == "" )
            {
                $('#errorDiv').empty().append('No file chosen!');
                return;
            }

            var data = new FormData($('#fileForm')[0]);
            $.ajax(
            {
                url : window.location.pathname + 'uploads',
                type: "POST",
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data)
                {
                    $('#list').append('<ul>yey!</ul');
                },
                error: function (jXHR, textStatus, errorThrown)
                {
                    $('#errorDiv').empty().append(textStatus + ':\n' + errorThrown);
                },
            });
        });

        // All the File APIs are supported.
        $('#sendButton').attr("disabled", false);
    }
    else
    {
        $('#errorDiv').empty().append('File APIs not supported.');
    }

});

function addImg(evt)
{

    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++)
    {
        output.push('<li><strong>', escape(f.name), '</strong> (',
            f.type || 'n/a', ') - ',
            f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
            '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function getImages()
{
    // GET images
    $.ajax(
    {
        url : window.location.pathname + 'uploads/fullsize',
        type: "GET",
        success: function (data)
        {
            $('#list').append('<ul>yey!</ul');
        },
        error: function (jXHR, textStatus, errorThrown)
        {
            $('#errorDiv').empty().append(textStatus + ':\n' + errorThrown);
        },
    });
}
