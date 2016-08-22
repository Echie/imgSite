var Thumbnails = React.createClass({

    // Read image filenames to state
    getInitialState: function() {
        var results;
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (req.readyState==4 && req.status==200) {
                results = req.responseText;
            }
        }
        req.open("GET", window.location.pathname + 'uploads/names', false );
        req.send();

        return {
            fileNames: results.split(',')
        };
    },

    render: function() {
        return (
            <div>
                {this.state.fileNames.map(function(fileName, index) {
                    var filePath = window.location.pathname + 'thumbs/' + fileName;
                    return <img src={filePath} alt={filePath} key={index} className="img-responsive"/>;
                })}
            </div>
        );
    }
});

ReactDOM.render(
    <Thumbnails />,
    document.getElementById('imageContainer')
);

/*
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
    var name = el.attr('filename').split('.')[0];
    window.location.href = '/img/' + name;
}

function showNotice(type, msg)
{
    $('#noticeDiv').removeClass('alert-danger').removeClass('alert-success');

    $('#noticeDiv').empty().show().addClass('alert-'+type).append(msg);
    setTimeout(function() { $('#noticeDiv').fadeOut('slow'); }, 3000)
}
*/
