class BackgroundScript
{
    constructor()
    {
        console.log("Loading background script...");

        this.setupAjaxInterceptor();

        try
        {
            var ts = JSON.parse(localStorage.getItem("toolState"));
        }
        catch(err)
        {
            ts = undefined;
        }
        if(ts == undefined)
            this.toolState = {enableAnnotations: true,
                              pdfLinkParsingEnabled: true,
                            ajaxInterceptionEnabled: true,
                            areaAnnotationEnabled:false};
        else
            this.toolState = ts;




        this.setupInfrastructure();
        this.setupMessageHandlers();
        this.setupCommandHandlers();
        this.setupAccessFunctions();
    }


    _enableAjaxLogger()
    {
        var ajaxAppender = new log4javascript.AjaxAppender("https://users.cg.tuwien.ac.at/ssippl/logger.php", true);
        ajaxAppender.setSessionId(chrome.runtime.id);
        ajaxAppender.setWaitForResponse(false);
        ajaxAppender.setFailCallback(() => {});
        this.logger.removeAllAppenders();
        this.logger.addAppender(ajaxAppender);
    }

    setupInfrastructure()
    {
        this.repositoryManager = new RepositoryManager(() => {

            this.logger = log4javascript.getDefaultLogger();

           // this._enableAjaxLogger();

            this.termFrequencyManager = new TermFrequencyManager();
            this.textProcessor = new TextProcessor(Snowball("English"));
            this.tfidfProcessor = new TFIDFProcessor();

            this.termFrequencyManager.newCorporaContainersEntered(this.repositoryManager.snippetRepository.getAllElements());
            this.termFrequencyManager.newCorporaContainersEntered(this.repositoryManager.noteRepository.getAllElements());
            //Set up update Methods ...
            this.setupUpdateMessagePassing();

        });
    }

    setupUpdateMessagePassing()
    {

        this.repositoryManager.snippetRepository.registerObserverCallback(function (type, x) {
            console.log("Sending ...");
            chrome.windows.getAll({populate:true},function(windows){
                windows.forEach(function(window){
                    window.tabs.forEach(function(tab){

                        if(tab.title == "Information Collage")
                            return;

                        if(type == "delete")
                        {
                            chrome.tabs.sendMessage(tab.id, {
                                name: 'snippetDeleted',
                                element: x
                            }, function (r) {
                            });
                        }
                        else if(type == "update" || type == "create")
                        {
                            chrome.tabs.sendMessage(tab.id, {
                                name: 'snippetUpdated',
                                type: type,
                                element: x
                            }, function (r) {

                            });
                        }
                        //This is not really needed currently and makes updates very slow
                    });
                });
            });
        });
    }

    setupAjaxInterceptor()
    {
        console.log("Setting up Ajax Interception ...");

        this.ajaxInterceptor = new AjaxInterceptor(function () {
            chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
                if(tabs[0] == undefined)
                    return;
                chrome.tabs.sendMessage(tabs[0].id, {
                    name: 'updateAnnotator',
                }, function (r) {
                });
            });
        });

        this.ajaxInterceptor.startInterceptor();
    }

    setupMessageHandlers()
    {
        console.log("Setting up Message handling ...");

        chrome.extension.onMessage.addListener((request, sender, sendResponse) => {

            if (request.name == 'getToolStatus')
            {
                sendResponse(this.toolState);
            }
            else if(request.name == 'getExtensionId')
            {
                sendResponse(chrome.runtime.id);
            }
            else if(request.name == 'createPageSnippet')
            {
                var lang = request.windowInfo.language.substring(0,2);

                if(lang == "de")
                    this.textProcessor.language = "German";
                else if(lang == "en")
                    this.textProcessor.language = "English";
                else if (lang == "")
                {
                    //Try to determine language by top level domain...
                    var tld =  request.windowInfo.url.split('.').pop().substring(0,2);

                    if(tld == "de" || tld == "at")
                        this.textProcessor.language = "German";
                    else
                        this.textProcessor.language = "English"
                }

                var text = request.text + " " + request.annotation.text;

                var resultObject = this.textProcessor.processText(text);

                var sto = this.repositoryManager.stemTermRepository.getStemTermObject();

                for(var stem in resultObject.stemTermMap)
                {
                    if(!sto.stemterms.hasOwnProperty(stem))
                        sto.stemterms[stem] = resultObject.stemTermMap[stem];

                }

                this.repositoryManager.stemTermRepository.updateStemTermObject(sto);

                var termFrequency = this.tfidfProcessor.computeTf(resultObject.stemArray);

                this.termFrequencyManager.newCorporaEntered([termFrequency]);

                ImageUtil.createElementImage(request.boundingRect, request.windowInfo, (result) => {

                    chrome.tabs.getSelected(null, (tab) => {

                        ImageUtil.getBase64ImageFromUrl(tab.favIconUrl,  (dataUrl) => {

                            var storageElem = {
                                url: request.windowInfo.url,
                                favIcon:  dataUrl,
                                domPath: request.xpath ,
                                textContent: request.text,
                                screenShot: result.dataUrl,
                                dimensions: result.dimensions,
                                annotation: request.annotation,
                                language: request.windowInfo.language,
                                tf: termFrequency,
                                pageTitle: request.pageTitle,
                                tfidf : {}
                            };

                            this.repositoryManager.snippetRepository.storeElement(storageElem,  (elem) => {
                                
                                this.logger.info(JSON.stringify({msg: "Snippet created", id:  elem.id, url: elem.url, param: elem.annotation.text, textContent: elem.textContent}));

                                sendResponse(elem);

                                this._recomputeTFIDF();

                            });

                        });
                    });
                });


            }
            else if(request.name == "updateElement")
            {
               

                this.repositoryManager.snippetRepository.updateElement(request.element, (r) => {
                    this.logger.info(JSON.stringify({msg: "Snippet content updated", id: request.element.id, param: "Page"}));

                    this._recomputeTFIDF();
                    sendResponse(r);
                });

            }
            else if(request.name == "deleteElement")
            {
                this.repositoryManager.snippetRepository.deleteElement(request.element, (r) =>
                {
                    this._recomputeTFIDF();
                    sendResponse();
                });

            }
            else if(request.name == "getPageElements")
            {
                this.repositoryManager.snippetRepository.getPageElements(request.url, (e) => {

                    sendResponse(e);
                })
            }
            else if(request.name == "getAllElements")
            {
                var elements = this.repositoryManager.snippetRepository.getAllElements();
                sendResponse(elements);
            }

            return true;
        });
    }


    _recomputeTFIDF()
    {
        //Trigger TFIDF update of all snippets
        var allSnippets = this.repositoryManager.snippetRepository.getAllElements();

        allSnippets.forEach(x => x.tfidf = TFIDFProcessor.computeTFIDF(x.tf, this.termFrequencyManager.wordsIDF));

        this.repositoryManager.snippetRepository.updateElements(allSnippets);

        var allNotes = this.repositoryManager.noteRepository.getAllElements();

        allNotes.forEach(x => x.tfidf = TFIDFProcessor.computeTFIDF(x.tf, this.termFrequencyManager.wordsIDF));

        this.repositoryManager.noteRepository.updateElements(allNotes);
    }

    setupCommandHandlers()
    {
        console.log("Setting up command handlers ...");

    }

    setupAccessFunctions()
    {

        window.getRepositoryManager = () => this.repositoryManager;

        window.getToolState = () => this.toolState ;
        
        window.setToolState = (newToolState) => {

            this.toolState = newToolState;

            localStorage.setItem("toolState", JSON.stringify(this.toolState));

            this._transmitToolState();

            if(this.toolState.ajaxInterceptionEnabled)
                this.ajaxInterceptor.startInterceptor();
            else
                this.ajaxInterceptor.stopInterceptor();
        };


        window.getLogger = () => this.logger;

        //window.setTabPath = (tabPath) =>
        window.getTermFrequencyManager = () => this.termFrequencyManager;
        window.recomputeTFIDF = () => this._recomputeTFIDF();
    }

    _transmitToolState()
    {
        var self = this;

        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){
                    chrome.tabs.sendMessage(tab.id, {
                        name: 'updateToolStatus',
                        state: self.toolState,
                    }, function (r) {});
                });
            });

            return true;
        });
    }


}

$(() => new BackgroundScript());











