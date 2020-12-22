class AnnotationUpdateHandler
{
    constructor(pageInfo)
    {
        this.pageInfo = pageInfo;

        this.loadInitialPageElements();

        //Enable this method to enable updates when snippets are deleted in collage .. (performance very bad)
        //this.setupVisibilityUpdates();
        this.setupSnippetMessageHandling();
        this.scrollTop = null;
    }

    loadInitialPageElements()
    {
        var self = this;

        chrome.extension.sendMessage({name: 'getPageElements', url: window.location.href}, function (response) {
            console.log("Get Page Elements");
            console.log(response);
            self.pageInfo.pageElements = response;
            self.createPageAnnotations();
        });
    }

    setupVisibilityUpdates()
    {
        var self = this;

        window.addEventListener('focus', function() {
            console.log("Focus!");
            updateId();
        });


        document.addEventListener('visibilitychange', function(e){
            console.log("VisChange!");
            if(document.visibilityState != "visible")
                return;

            updateId();

        });


        function updateId() {
            chrome.extension.sendMessage({name: 'getAllElements'}, function (response) {
                console.log("Get All elements...");
                self.pageInfo.id = response[response.length-1].id;

                chrome.extension.sendMessage({name: 'getPageElements', url: window.location.href}, function (response) {
                    console.log("Get Page elements...");
                    self.pageInfo.pageElements = response;
                    self.createPageAnnotations();
                });
            });
        }

    }

    setupSnippetMessageHandling()
    {
        var self = this;

        chrome.extension.onMessage.addListener((request, sender, sendResponse) => {

            //Ignore all messages except if they are coming from the background-script ...
            if(sender.tab)
                return;

            switch(request.name)
            {
                case 'snippetUpdated':
                    var elementIndex = self.pageInfo.pageElements.findIndex(x => x.id == request.element.id);

                    if(elementIndex != -1)
                        self.pageInfo.pageElements[elementIndex] = request.element;
                    else if(request.element.url == window.location.href)
                        self.pageInfo.pageElements.push(request.element);
                    break;
                case 'snippetDeleted':
                    var elementIndex = self.pageInfo.pageElements.findIndex(x => x.id == request.element.id);

                    if(elementIndex != -1)
                        self.pageInfo.pageElements.splice(elementIndex,1);
                    break;

            }

            if(self.pageInfo.toolState.enableAnnotations)
                self.createPageAnnotations();

        });



    }

    createPageAnnotations()
    {
        var self = this;

        //When the annotator editor is open, the annotations will not be updated ...
        //Hack, not optimal

        if($(".annotator-editor").get().length > 0 && !$(".annotator-editor").hasClass("annotator-hide"))
        {
            $(".annotator-save").off("click");
            $(".annotator-save").on("click",() => self.createPageAnnotations());

            return;
        }


        if(!self.pageInfo.toolState.enableAnnotations)
            return;

        if(self.app != undefined)
            self.app.destroy();

        self.app = self.createApp();

        self.app.start().then(function () {
            self.app.annotations.load();

            if(self.scrollTop != null)
            {
                var cont = $("#viewerContainer");

                if(!cont.get(0))
                    cont =  $("body");

                 var scrollTop = cont.get(0).scrollTop = self.scrollTop;

                self.scrollTop = null;

            }
        });

    }

    createApp()
    {
        var self = this;

        var app =  new annotator.App();
        app.include(createIndexDBStorage(self.pageInfo));

        app.include(annotator.ui.main);

        if(self.pageInfo.toolState.areaAnnotationEnabled)
        {
            var pui = new DomElementUI(self.pageInfo);

            app.include(pui.paragraphUi);
        }

        app.getElementByXpath = (xpath) =>
        {
            var pElems = self.pageInfo.pageElements.filter(function (e) {
                return xpath == e.domPath;
            });
            if(pElems.length > 0)
                return pElems[0];
            else
                return null;
        };

        app.updatePageElements = () => {
            chrome.extension.sendMessage({name: 'getPageElements', url: window.location.href}, function (response) {
                self.pageInfo.pageElements = response;
            });
        };

        return app;
    }

    disableApp()
    {
        var self = this;

        if(self.app != undefined)
            self.app.destroy();

        self.app = undefined;

        $("*").removeClass("extractedElement");
    }
}