class ContentScript
{
    constructor() {

        var self = this;
        
        chrome.extension.sendMessage({name: 'getExtensionId'}, id =>{

            this.pageInfo = { id:1, pageElements:[], toolState: {}, extensionId: id};

            chrome.extension.sendMessage({name: 'getToolStatus'}, toolState => {

                self.pageInfo.toolState = toolState;

                this.snippetUpdateHandler = new AnnotationUpdateHandler(this.pageInfo);

                if(self.pageInfo.toolState.enableAnnotations)
                    self.setupMessageHandlers();

                if(self.pageInfo.toolState.pdfLinkParsingEnabled)
                    self.parseAndModifyLinks();

            });

        });
        
        window.addEventListener('message', function (event) {
            if(!event.data.id)
                return;

            chrome.extension.sendMessage({name:"zoomToSnippet", id:event.data.id},function () {

            });
        });

    }

    parseAndModifyLinks()
    {
        var self = this;

        console.log("Parsing and modifying pdf links ...");

        var ignoreUrls = ["http://escholarship.org"];

        //Parse default PDF links


        $("a[href$='.pdf'], a[href^='http://citeseerx.ist.psu.edu/viewdoc']").each( (i,x) => {

            if (x.href.indexOf("chrome-extension://") == -1 && !ignoreUrls.some(u => x.href.includes(u)))
            {
                x.href = "chrome-extension://"+ this.pageInfo.extensionId + "/scripts/externalLibraries/pdf/web/viewer.html?file=" + encodeURIComponent(x.href);
                console.log(x);
            }
        });

        var $ieeeLink = $("frame[src*='ieeexplore.ieee.org']");
        if($ieeeLink.length > 0)
            window.location.replace("chrome-extension://"+ this.pageInfo.extensionId + "/scripts/externalLibraries/pdf/web/viewer.html?file=" + $ieeeLink.get(0).src);



    }

    setupMessageHandlers()
    {
        var self = this;

        chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
            console.log(request.name);

            switch(request.name)
            {
                case 'updateAnnotator':
                    if(self.pageInfo.toolState.pdfLinkParsingEnabled)
                        self.parseAndModifyLinks();
                    this.snippetUpdateHandler.loadInitialPageElements();
                    break;
                case 'storePage':
                    var rect = this._createBoundingRect();
                    var unfluffed = unfluff(document.documentElement.outerHTML);
                    var text = unfluffed.text;
                    var xpath = DomHelper.getXPath($("body").get(0));
                    var annotation = { textAnnotation : false, text: request.comment, scrollTop: 123};
                    PageSnippetHelper.createPageSnippet(rect, text, xpath, annotation, unfluffed.title);
                    break;
                case 'queryLocation':
                    sendResponse(document.location);
                    break;
                case 'scrollToElement':
                    this.snippetUpdateHandler.scrollTop = request.scrollTop;
                    break;
                case 'updateToolStatus':

                    var oldToolState = self.pageInfo.toolState;

                    self.pageInfo.toolState = request.state;

                    if(self.pageInfo.toolState.enableAnnotations)
                        self.snippetUpdateHandler.createPageAnnotations();
                    else
                        self.snippetUpdateHandler.disableApp();

                    if(self.pageInfo.toolState.pdfLinkParsingEnabled != oldToolState.pdfLinkParsingEnabled)
                        window.location.reload();

                    if(self.pageInfo.toolState.areaAnnotationEnabled != oldToolState.areaAnnotationEnabled)
                        self.snippetUpdateHandler.createPageAnnotations();

                    break;
            }
        });
    }

    _createBoundingRect()
    {
        var rect = $("body").get(0).getBoundingClientRect();

        var br = {top:rect.top, bottom:rect.bottom, left:rect.left, right:rect.right, width: rect.width, height:rect.height};

        if(rect.height == 0)
        {
            br.bottom = window.innerHeight;
            br.height = window.innerHeight;
        }

        return br;

    }


}