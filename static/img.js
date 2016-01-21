$(document).ready(function()
{
    $('#noticeDiv').hide();

    $('#commentForm').on('submit', function(e)
    {
        e.preventDefault();

        // Form timestamp
        var d = new Date(Date.now());
        var time = d.getDate() + '.' + (d.getMonth()+1) + '.' +
        d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() +
        ':'+ d.getSeconds();

        $.ajax(
        {
            url : window.location.pathname,
            type: "POST",
            data: {'timestamp' : time, 'text': $('#commentInput').val()},
            success: function (data)
            {
                showNotice('success', 'Comment posted!');

                // Add comment to list
                $('#comments').append('<li class="list-group-item">' +
                '<p class="p-timestamp">' + time + '</p>' +
                '<p class="p-comment">' + $('#commentInput').val() +
                '</p></li>');
            },
            error: function (jXHR, textStatus, errorThrown)
            {
                showNotice('danger', 'Image upload failed!');
            },
        });
    });

    $('#backButton').click(function() { window.location.href = "/"; });

    getComments();
});

function showNotice(type, msg)
{
    $('#noticeDiv').removeClass('alert-danger').removeClass('alert-success');

    $('#noticeDiv').empty().show().addClass('alert-'+type).append(msg);
    setTimeout(function() { $('#noticeDiv').fadeOut('slow'); }, 3000)
}

function getComments()
{
    $.ajax(
    {
        url : window.location.pathname
            .replace('img','comments')+ '.json',
        type: "GET",
        success: function (data)
        {
            data.forEach(function(el, ind, arr)
            {
                $('#comments').append('<li class="list-group-item">' +
                '<p class="p-timestamp">' + el['timestamp'] + '</p>' +
                '<p class="p-comment">' + el['text'] + '</p></li>');
            });
        },
        error: function (jXHR, textStatus, errorThrown)
        {
            showNotice('danger', 'Failed to get comments!');
        },
    });
}
