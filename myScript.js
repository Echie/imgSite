$(document).ready(function()
{
    console.log('js works');
    /*
    $('#fileForm').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url : window.location.pathname,
            type: "POST",
            data: $(this),
            success: function (data) {
                $('#list').append('<ul>yey!</ul');

                // $("#form_output").html(data);
            },
            error: function (jXHR, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    });
    */
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        // Great success! All the File APIs are supported.
        // $('#addFile').on('change', addImg);
    }
    else
        alert('The File APIs are not fully supported in this browser.');
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
