var UploadButton = React.createClass({
    getInitialState: function() {
        if (window.File && window.FileReader && window.FileList && window.Blob)
            return {disabled: false};
        else
            showNotice('danger', 'File APIs not supported.');
            return {disabled: true};
    },

    render: function() {
        return (
            <button disabled={this.state.disabled}>
                Upload
            </button>
        )
    }
});

var Thumbnails = React.createClass({

    // Read image filenames to state
    getInitialState: function() {
        var result = [];
        $.ajax(
        {
            async: false,
            url : window.location.pathname + 'uploads/names',
            type: "GET",
            success: function (data)
            {
                result = data.split(',');
            },
            error: function (jXHR, textStatus, errorThrown)
            {
                showNotice('danger', 'Something went wrong!');
            },
        });

        return {
            fileNames: result
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

ReactDOM.render(
    <UploadButton />,
    document.getElementById('buttonContainer')
);

function showNotice(type, msg)
{
    $('#noticeDiv').removeClass('alert-danger').removeClass('alert-success');

    $('#noticeDiv').empty().show().addClass('alert-'+type).append(msg);
    setTimeout(function() { $('#noticeDiv').fadeOut('slow'); }, 3000)
}

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
