class ImageUtil {

    //Info: Needs permissions ["tabs","<all_urls>"] to run

    //Creates a Snapshot of the given Jquery element and returns the Data Url of the image as a parameter of the given callback function
    static createElementImage(rect, windowInfo, callback) {

        chrome.tabs.captureVisibleTab(null, {"format": "png"}, function (dataUrl) {

            var canvas = document.createElement('canvas');
            var img = new Image();
            img.onload = function () {
                canvas.width = windowInfo.width;
                canvas.height = windowInfo.height;
               // canvas.height = windowInfo.height;
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                //callback({dataUrl: canvas.toDataURL(), dimensions: [windowInfo.width, windowInfo.height]});
                callback(ImageUtil._extractDomImageFromCanvas(rect, windowInfo, $(canvas)));
            };
            img.src = dataUrl;
        });
    }

    //Extracts a canvas that contains the given element from the provided screenshotCanvas and returns it to the calling method
    //screenshotCanvas is a canvas that contains a screenshot of the page, element is the target element to extract
    static _extractDomImageFromCanvas(rect, windowInfo, $screenshotCanvas) {

        var offset = 10;

        var scrollTop = windowInfo.scrollTop;
        var scrollBottom = windowInfo.scrollTop + windowInfo.height;

        var bottom = rect.bottom;
        var top = rect.top;

        if(rect.top < 0)
            top = 0;

        if(rect.bottom > windowInfo.height)
            bottom = windowInfo.height;

        var height = bottom - top;
        
        var previewCanvas = document.createElement('canvas');
        previewCanvas.width = rect.width;
        previewCanvas.height = height;

        var l = rect.left - offset;

        if (l < 0)
            l = 0;

        var ctx = previewCanvas.getContext("2d");
        ctx.drawImage($screenshotCanvas[0],l , top,
            rect.width+offset, height,
            0, 0,
            rect.width, height);

        return {dataUrl: $(previewCanvas).css({border: '1px solid black'}).get(0).toDataURL(), dimensions: [rect.width, height]};
    }

    static getBase64ImageFromUrl(imgUrl, callback)
    {
        if (imgUrl == undefined || imgUrl == "" || imgUrl == null)
           callback(undefined);

        var canvas = document.createElement('canvas');

        var img = new Image();

        img.onload = function () {

            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext("2d").drawImage(img, 0, 0);

            callback(canvas.toDataURL("image/png"));

        };

        img.src = imgUrl;

    }

}