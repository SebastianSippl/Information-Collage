
class InformationCollage
{
    //App Entry point
    constructor()
    {
        this.clickedCanvasPos = {x: 0, y: 0};

        var bgPage = chrome.extension.getBackgroundPage();

        this._logger = bgPage.getLogger();

        //Component registration

        this._registerEventPublishers();
        this._registerEventSubscribers();

        //IMPORTANT!!! Components internally register events
        //Do not change the order of component creation, otherwise the events won't be called in the correct order.
        //BEWARE OF THE ORDER OF DAGON! THIS ORDER WAKES CTHULHU!
        // TODO: Do this with pub/sub pattern or library

        this._repositoryManager = bgPage.getRepositoryManager();

        this._snippetManager = new SnippetManager(this);
        this._bubbleManager  = new BubbleManager(this);
        this._noteManager = new NoteManager(this);

        this._itemManager = new ItemManager([this._snippetManager, this._noteManager]);

        this.tfidfMatcher = new TFIDFMatcher(this._itemManager);

        this._selectionController = new SelectionController(this);

        this._clusterManager = new ClusterManager(this);

        this._stateController = new StateController([this._bubbleManager, this._snippetManager, this._noteManager, this._clusterManager, this]);

        this.searchProvider = new SnippetSearchResultManager(this);
        this.previewComponent = new PreviewComponent();
        this.interactionState = new CollageManipulationState();

        this._webSearchComponent = new WebSearchComponent();

        d3.select("#mainSvgElement").call(this.zoom).on("dblclick.zoom", null);

        this._updateElements();
        this._addSvgFilters();
        this._initContextMenus();
        this._setupMessageListeners();

        this._cityLights = new CityLights(this);

        var setSvgDimensions = () => {$("#mainSvgElement").height(window.innerHeight-5)};

        setSvgDimensions();

        $(window).resize(() => setSvgDimensions() );

        //setTimeout(() => {Visualization.textMeasurementTool = new TextMeasurementTool()}, 3000);

       this.restoreSettings();
    }

    get selectionController(){return this._selectionController;}

    get repositoryManager() {return this._repositoryManager;}

    get snippetManager(){return this._snippetManager;}

    get bubbleManager(){return this._bubbleManager;}

    get noteManager(){return this._noteManager;}

    get itemManager(){return this._itemManager;}

    get clusterManager(){return this._clusterManager;}

    get stateController(){return this._stateController;}

    get logger(){return this._logger;}


    restoreSettings()
    {
        var stfo = localStorage.getItem("transform");

        if(stfo != undefined)
        {
            var tfo = JSON.parse(stfo);

            try
            {
                if(tfo.k == 0)
                    tfo.k = 1;
                var transform = d3.zoomIdentity.translate(tfo.x, tfo.y).scale(tfo.k);
                d3.select("#mainSvgElement").transition().duration(750).call(this.zoom.transform, transform );
            }
            catch(err)
            {
                console.log("Could not restore transform");
                var transform = d3.zoomIdentity.translate(0, 0).scale(1);
                d3.select("#mainSvgElement").transition().duration(750).call(this.zoom.transform, transform );
            }
        }

        var sclusterToggle = localStorage.getItem("clusterToggle");

        if(sclusterToggle != undefined)
        {
            var clusterToggle = sclusterToggle == 'true';

            if(!clusterToggle)
                $(document).trigger("toggleClusterVisibility");
        }

        var clusterThresh = localStorage.getItem("clusterThresh");

        if(clusterThresh)
        {
            $("#sldClusterDistance").val(clusterThresh);
            this.clusterManager.clusterDistance = parseInt($("#sldClusterDistance").val());
            this.clusterManager.visualizeClusters();
        }
    }

    changeState(stateName)
    {
        if(stateName == "info")
            this.interactionState = new CollageInfoState(this.selectionController);
        else if(stateName == "manipulation")
            this.interactionState = new CollageManipulationState();
    }

    _setupMessageListeners()
    {
        chrome.extension.onMessage.addListener((request, sender, sendResponse) => {

            switch (request.name) {

                case 'zoomToSnippet':
                    this.logger.info(JSON.stringify({msg: "Zoom to snippet via Annotator bubble", id: request.id}));

                    this.zoomToSnippet(this.snippetManager.activeSnippets.find(x=> x.id == parseInt(request.id)));
                    break;
                case 'reloadDatabase':
                    this._updateElements();
                    break;
            }
        });
    }

    _clusterSelection(elementArray)
    {
        //Detect, if a snippet is behind the cluster
        for(var i = 0; i < elementArray.length;i++)
        {
            var mousePos = d3.mouse(d3.select("#baseLayer").node());

            var item =  elementArray[i];
            


            var rect = Rectangle.createRect({x: item.x, y: item.y}, item.dimensions[0], item.dimensions[1]);

            if(rect.checkIfPointInRectangle({ x:mousePos[0], y:mousePos[1]}))
            {
                d3.event.srcElement.classList.remove("rightClickedElement");
                item.getDomElement().classList.add("rightClickedElement");
                this.rightClickedElement = d3.select(item.getDomElement()).data()[0];

                return item;
            }
        }

        return null;
    }

    _initContextMenus()
    {
        d3.select("#mainSvgElement").on('contextmenu', (data, index) => {
            if (d3.event.pageX || d3.event.pageY) {
                var x = d3.event.pageX;
                var y = d3.event.pageY;
            } else if (d3.event.clientX || d3.event.clientY) {
                var x = d3.event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                var y = d3.event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            $(".rightClickedElement").removeClass("rightClickedElement");
            this.rightClickedElement = d3.select(d3.event.srcElement).data()[0];
            $(d3.event.srcElement).addClass("rightClickedElement");

            var contextMenuSelector = "#canvasContextMenu";

            //Clicks on cluster elements need to be forwarded to snippets

            if(d3.event.srcElement.classList.contains("overHull"))
            {
                contextMenuSelector = "#clusterContextMenu";

                if(this._clusterSelection(this.snippetManager.activeSnippets) != null)
                    contextMenuSelector = "#snippetContextMenu";
                if(this._clusterSelection(this.noteManager.notes) != null)
                    contextMenuSelector = "#noteContextMenu";
            }

            if(d3.event.srcElement.classList.contains("bubble"))
                contextMenuSelector = "#bubbleContextMenu";
            else if(d3.event.srcElement.classList.contains("snippetImage"))
                contextMenuSelector = "#snippetContextMenu";
            else if(d3.event.srcElement.classList.contains("term"))
                contextMenuSelector = "#keyTermContextMenu";
            else if(d3.event.srcElement.classList.contains("noteParagraph"))
                contextMenuSelector = "#noteContextMenu";

            d3.select(contextMenuSelector)
                .style('position', 'absolute')
                .style('left', (x - 10) + 'px')
                .style('top', (y - 10) + 'px')
                .style('display', 'block').on('mouseleave', function() {
                d3.select(contextMenuSelector).style('display', 'none');
            }).on('click', function () {
                d3.select(contextMenuSelector).style('display', 'none');
            });
            d3.event.preventDefault();
        });
    }
    
    _registerEventPublishers()
    {
        //Main Svg Events

        this.zoom = d3.zoom().on("zoom",() => {
            $(document).trigger("collageZoom");
            });

        d3.select("#mainSvgElement").on("mousedown", () => $(document).trigger("collageMouseDown"));

        d3.select("#mainSvgElement").on("click",  () => {
            $(document).trigger("collageClick");
        });

        //Left UI Events

        $("#btnOpenSnippetBar").on("click", () => {
                if($("#collapseSearch").hasClass("in"))
            $("#collapseSearch").collapse('hide');

            if($("#snippetEntryLayer").hasClass("showLayer"))
            {
                $("#snippetEntryLayer").removeClass("showLayer");
                $("#snippetEntryLayer").addClass("hideLayer");
            }
            else
            {
                $("#snippetEntryLayer").removeClass("hideLayer");
                $("#snippetEntryLayer").addClass("showLayer");
            }}

        );
        
        $("#sldClusterDistance").on("input", () =>
            {
                localStorage.setItem("clusterThresh", $("#sldClusterDistance").val());
                this.logger.info(JSON.stringify({msg: "Clustering thershold changed", param:$("#sldClusterDistance").val()}))
                this.clusterManager.clusterDistance = parseInt($("#sldClusterDistance").val());
                this.clusterManager.visualizeClusters();
            });
        
        $("#btnOpenCollageSearchBar").on("click", () => $(document).trigger("openCollageSearchBar"));

        $("#btnSearch").on("click", () => $(document).trigger(jQuery.Event("queryCollage", {queryTerm: $("#txtKeywordsearch").val()})));
        $("#txtKeywordsearch").on("keydown", (e) => {if(e.which == 13) $(document).trigger(jQuery.Event("queryCollage", {queryTerm: $("#txtKeywordsearch").val()}))});
        $("#searchHitsButton").on("click", () => $(document).trigger("zoomToNextSearchHit"));

        //Right UI Events

         $("#btnCreateNote").on("click", () => {
             var viewportDimensions = DomHelper.getViewportDimensions("#mainSvgElement", "#baseLayer");
             console.log(this.clickedCanvasPos);
             this.clickedCanvasPos.x = (viewportDimensions[0] + viewportDimensions[2])/2;
             this.clickedCanvasPos.y = (viewportDimensions[1] + viewportDimensions[3])/2;
             console.log(this.clickedCanvasPos);
             $(document).trigger("openCreateNoteMenu")
         });

        $("#btnShowHideClusters").on("click", () => $(document).trigger("toggleClusterVisibility"));

        $("#btnClusterScaling").on("click", () => $(document).trigger("toggleClusterScaling"));

        //Context Menu Events

        $("#cmGotoSnippetWebpage").on("click", () => $(document).trigger(jQuery.Event("gotoWebPage", {clickedElement: this.rightClickedElement})));
        $("#cmCopyText").on("click", () => document.execCommand('copy'));

        $("#cmShowSnippetDetails").on("click", () => $(document).trigger(jQuery.Event("showSnippetDetails",{snippet: this.rightClickedElement})));
        $("#cmDeleteSnippet").on("click", () => $(document).trigger(jQuery.Event("deleteSnippet", {snippet: this.rightClickedElement})));
        $("#cmStartQuery").on("click",() => $(document).trigger(jQuery.Event("startWebTopNKewywordQuery", {snippet: this.rightClickedElement})));
        $("#cmShowText").on("click", () => $(document).trigger(jQuery.Event("showSnippetText", {snippet: this.rightClickedElement })));
        $("#cmMarkSnippetAsImportant").on("click", () => {
            this.rightClickedElement.important = !this.rightClickedElement.important;
            this.logger.info(JSON.stringify({msg: "Snippet marked as important", param: this.rightClickedElement.important}));
            this._updateElements();
        });


        $("#cmDeleteBubble").on("click", () => $(document).trigger(jQuery.Event("deleteElement", {bubble: this.rightClickedElement})));
        $("#cmCreateBubble").on("click", () => $(document).trigger(jQuery.Event("createBubble", {clickedCanvasPos: this.clickedCanvasPos})));
        $("#cmChangeColorBubble").on("click", () => $("#colorBubbleModal").modal());
        $("#cmTagBubble").on("click", () => $("#tagBubbleModal").modal());
        $("#confirmColor").on("click", () =>
        {
            $("#colorBubbleModal").modal("hide");
            $(document).trigger(jQuery.Event("changeBubbleColor", {bubble: this.rightClickedElement, color:$("#bubbleColor").val() }));
        } );


        $("#cmDeleteNote").on("click", () => $(document).trigger(jQuery.Event("deleteNote", {note: this.rightClickedElement})));
        $("#cmCreateNote").on("click", () => $(document).trigger("openCreateNoteMenu"));
        $("#cmToggleClusters").on("click", () => $(document).trigger("toggleClusterVisibility"));
        $("#cmClusterQuery").on("click", () => {
            this.rightClickedElement.keywords.importantWords.forEach(w => this._webSearchComponent.addTerm(w));
            this.logger.info(JSON.stringify({msg: "Cluster Keyword Query used", param: this._webSearchComponent.queryTermList }));

            this._webSearchComponent.startQuery();

        });

        $("#cmAddTermToBox").on("click", () => $("#txtKeywordsearch").val((i,v) => v + " " + this.rightClickedElement));
        $("#cmAddTermToBoxAndStartSearch").on("click", () => {
            var val = $("#txtKeywordsearch").val() + " " + this.rightClickedElement;

            this.logger.info(JSON.stringify({msg: "Term Collage Query used", param: val }));

            $(document).trigger(jQuery.Event("queryCollage", {queryTerm: val}));
            });

        $("#cmAddTermToWebQuery").on("click", () => {
           this._webSearchComponent.addTerm(this.rightClickedElement);
        });

        $("#cmAddTermToWebQueryAndStart").on("click", () =>{
            this._webSearchComponent.addTerm(this.rightClickedElement);
            this.logger.info(JSON.stringify({msg: "Web Query used", param: this._webSearchComponent.queryTermList }));
            this._webSearchComponent.startQuery();
        });

        //Snippet Detail Modal Events

        $("#snippetDetailsCopyToClipboard").click(() => document.execCommand('copy'));
        $("#snippetDetailsModalClose").click(() => $(document).trigger("hideSnippetDetails"));
        $("#snippetDetailsShowText").on("click", () => $(document).trigger(jQuery.Event("showSnippetText", {snippet: this.rightClickedElement })));
        $("#closeTextModal").click(() => $(document).trigger("hideSnippetText"));
        
        $("#btnStoreNote").click(() => {$(document).trigger(jQuery.Event("storeNote", {clickedCanvasPos: this.clickedCanvasPos, noteTitle:$("#txtNoteTitle").val(), noteText: $("#txtNoteText").val()})); $("#createEditNodeModal").modal('hide');});
        //Tag Bubble Modal Events

        $("#btnStoreBubbleTag").on("click", () => $(document).trigger(jQuery.Event("createBubbleTag", {tagText:$("#txtBubbleTag").val(), bubble: this.rightClickedElement})));
        $("#txtBubbleTag").on("keydown", (e) => {if(e.which == 13)$(document).trigger(jQuery.Event("createBubbleTag", {tagText:$("#txtBubbleTag").val(), bubble: this.rightClickedElement}))});

    }
        
    _registerEventSubscribers()
    {
        $(document).on("openCollageSearchBar", () => {
            if($("#snippetEntryLayer").hasClass("showLayer"))
            {
                $("#snippetEntryLayer").removeClass("showLayer");
                $("#snippetEntryLayer").addClass("hideLayer");
            }

            if($("#collapseSearch").hasClass("in"))
                $("#collapseSearch").collapse('hide');
            else
                $("#collapseSearch").collapse('show');

        });

        //Collage Interaction Handlers

        var oldScale = 0;

        $(document).on("collageZoom", () => {

            localStorage.setItem("transform", JSON.stringify(d3.event.transform));

            d3.select("#baseLayer").attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")" + " scale(" + d3.event.transform.k + ")");
            if(oldScale != d3.event.transform.k)
                this.logger.info(JSON.stringify({msg: "Collage Zoom", param:  d3.event.transform.k}));
            oldScale = d3.event.transform.k;
        });
        $(document).on("collageMouseDown", () => {
            var coords = d3.mouse(d3.select("#baseLayer").node());
            this.clickedCanvasPos.x = coords[0];
            this.clickedCanvasPos.y = coords[1];
        });

        //Bubble Interaction Event Handlers, UI related
        
        $(document).on("createBubbleTag", () => $("#tagBubbleModal").modal("hide"));
        $(document).on("openCreateNoteMenu", () => $("#createEditNodeModal").modal('show'));
        $(document).on("startWebTopNKewywordQuery", () => $("#collapseWeb").addClass("in"));
        $(document).on("collageQueryCompleted", (e) => $("#searchHits").html(e.searchResult.length));
        $(document).on("zoomToNextSearchHit", () =>
        {
            var result = this.searchProvider.getNextResult().snippet;
            this.logger.info(JSON.stringify({msg: "Clicked next search result button", id: result.id}));
            this.zoomToSnippet(result);
        });

        //Snippet Details Dialog Event Handlers

        $(document).on("showSnippetDetails", this, (e) =>
        {
            this.logger.info(JSON.stringify({msg: "Show Snippet details", id: e.snippet.id}));

            $("#snippetImage").attr("src", e.snippet.screenShot);

            $("#favIconImage").attr("src", e.snippet.favIcon);

            $("#snippetDetailsUrl").attr("href", e.snippet.url);

            var date = new Date(e.snippet.timestamp);

            $("#snippetDetailsTime").html(date);

            if(e.snippet.annotation)
                $("#snippetDetailsQuote").val(e.snippet.annotation.text);
            else
                $("#snippetDetailsQuote").val("");

            $("#snippetDetailsModal").modal();

        });
        $(document).on("hideSnippetDetails", () =>
        {
            this.logger.info(JSON.stringify({msg: "Hide Snippet details"}));

            $("#snippetDetailsModal").modal("hide");
            var elem = d3.select(".rightClickedElement").data()[0];

            if(elem.annotation)
            {
                elem.annotationText = $("#snippetDetailsQuote").val();
              //  elem._updateDatabaseItem();
            }});

        $(document).on("showSnippetText", (e) => {

            this.logger.info(JSON.stringify({msg: "Show Snippet text", id: e.snippet.id, textContent: e.snippet.textContent}));

            $("#textModalContent").html(e.snippet.textContent);
            $("#textModal").modal();
        });
        $(document).on("hideSnippetText", () => {
            $("#textModal").modal("hide");
            this.logger.info(JSON.stringify({msg: "Hide Snippet text"}));

        });

        $(document).on("gotoWebPage", (e) => {

            //Create tab
            chrome.tabs.create({ url: e.clickedElement.url}, tab => {

                //Send information about selected element to tab
                //TODO: This scrolling method is error prone. It should be done with proper message passing. (When script/page/pdf has completed loading)
                setTimeout(() => {  chrome.tabs.sendMessage(tab.id, {name: "scrollToElement",scrollTop: e.clickedElement.annotation.scrollTop});}, 2000)

            });
            this.logger.info(JSON.stringify({msg: "Goto Webpage", url: e.clickedElement.url}));
        });

        //Clipboard Events

        $(document).on("copy", (e) => {
            this.logger.info(JSON.stringify({msg: "Copy Snippet text to clipboard", id: this.rightClickedElement.id}));
            e.preventDefault();
            e.originalEvent.clipboardData.setData('text/plain', this.rightClickedElement.textContent);
       });

        //New Stuff
        $(document).on("collageQueryCompleted", (e) => this.previewComponent.updatePreview(e.searchResult));
        $(document).on("previewImageClicked", (e) =>  {

            this.logger.info(JSON.stringify({msg: "Collage query result clicked", id: e.snippet.id}));
            this.zoomToSnippet(e.snippet);
        });
        $(document).on("cityLightClicked", (e) =>  {

            this.logger.info(JSON.stringify({msg:"City light clicked ", id: e.snippet.id}));
            this.zoomToSnippet(e.snippet, e.zoom)
        });
        $(document).on("previewImageMouseEnter", (e) => d3.selectAll(".link").filter(x => x.target.id == e.snippet.id).style("stroke", "rgb(255,0,0)"));
        $(document).on("previewImageMouseLeave", (e) => d3.selectAll(".link").filter(x => x.target.id == e.snippet.id).style("stroke", d => d.color));

        $(document).on("collageClick", () => this.interactionState.clicked());
        

    }

    _addSvgFilters()
    {
        var defs = d3.select("defs");

        var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 5)
            .attr("result", "blur");

        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 5)
            .attr("dy", 5)
            .attr("result", "offsetBlur");

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur");

        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }

    _updateElements()
    {
        this._bubbleManager.updateBubbles();
        this._itemManager.updateItemComponents();
    }

    zoomToSnippet(snippet, zoomLevel = 1)
    {
        var baseLayer =  d3.select("#baseLayer").node();

        var svg = d3.select("#mainSvgElement").node();

        var coordX = zoomLevel *  (-snippet.x )+ (svg.width.baseVal.value/2) - zoomLevel * snippet.dimensions[0]/2;
        var coordY = zoomLevel * (-snippet.y)+ (svg.height.baseVal.value/2) - zoomLevel * snippet.dimensions[1]/2;

        var transform = d3.zoomIdentity.translate(coordX, coordY).scale(zoomLevel);

        d3.select("#mainSvgElement").transition().duration(750).call(this.zoom.transform, transform);

    }

}

$(() => {new InformationCollage()});








