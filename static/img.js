$(document).ready(function()
{
    $('#noticeDiv').hide();

    $('#commentForm').ajaxForm(function ()
    {
        window.location.replace(window.location.pathname);
    });
    $('#backButton').click(function()
    {
        window.location.href = "/";
    });
});

function showNotice(type, msg)
{
    $('#noticeDiv').removeClass('alert-danger').removeClass('alert-success');

    $('#noticeDiv').empty().show().addClass('alert-'+type).append(msg);
    setTimeout(function() { $('#noticeDiv').fadeOut('slow'); }, 3000)
}
