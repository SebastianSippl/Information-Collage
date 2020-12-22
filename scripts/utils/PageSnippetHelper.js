class PageSnippetHelper{

    constructor(){}

    // boundingRect ... The bounding rectangle of the snippet's dom element.
    // text ... The textual content of the snippet
    // xpath ... xpath to the dom element
    // annotator-extensions ... the element's annotator-extensions
    // callback ... method that is called when the element has been stored
    static createPageSnippet(boundingRect, text, xpath, annotation, pageTitle, callback) {
        
        var br = {top:boundingRect.top, bottom:boundingRect.bottom, left:boundingRect.left, right:boundingRect.right, width: boundingRect.width, height:boundingRect.height};

        if(br.left < 0)
        {
            br.left = 0;
            br.width = br.right - br.left;
        }

        $("body").css("overflow", "hidden");

        chrome.extension.sendMessage({name: 'createPageSnippet', boundingRect:br, text: text, xpath: xpath,
            windowInfo:{language: document.documentElement.lang ,url:window.location.href, 
                width:window.innerWidth, height:window.innerHeight, scrollTop: $(window).scrollTop()},
            annotation:annotation,  pageTitle:pageTitle}, function (response) {
                //Add scroll bars again
                $("body").css("overflow", "auto");
                if(callback != undefined)
                    callback();
        });

    }

}
