$(function () {

    console.log("Content script init");
    var cs = new ContentScript();


    document.addEventListener("textlayerrendered", function(e) {
        console.log("Sending update message...");
        if(cs.pageInfo.toolState.enableAnnotations)
            cs.snippetUpdateHandler.createPageAnnotations();

    });

});

