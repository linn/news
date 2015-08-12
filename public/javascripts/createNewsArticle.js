(function ($) {
    "use strict";
    $('#news-content-editor').markdownEditor({
        imageUpload: true,
        uploadPath: '/news/upload',
        fullscreen: false,
        theme: 'textmate'
    });

    $('#create-news-article').on('submit', function (e) {
        e.preventDefault();
        var $button = $('#submit').button('loading');
        var content = $('#news-content-editor').markdownEditor('content');
        var title = $('#title').val();
        var summary = $('#summary').val();
        var labelsText = $('#labels').val();
        var uri = '/news/' + encodeURIComponent(title.replace(/ /g, '_').toLowerCase());
        var data = {
            title: title,
            labels: labelsText ? labelsText.trim().split(/[ ,]+/) : [],
            summary: summary,
            content: content
        };
        var response = $.ajax({
            method: 'PUT',
            url: uri,
            data: JSON.stringify(data),
            contentType: 'application/json'
        });
        response.done(function () {
            window.location.href = response.getResponseHeader('Location');
        });
        response.fail(function( jqXHR, textStatus, errorThrown ) {
            window.alert(errorThrown);
        });
        response.always(function () {
            $button.button('reset');
        });
    });
})($);
