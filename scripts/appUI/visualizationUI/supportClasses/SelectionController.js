class SelectionController
{
    constructor(context)
    {
        //Controller Events

        this._context = context;

       $(document).on("elementMouseOver", (e) => this.previewSelection(e.selection));
       $(document).on("elementMouseOut", (e) => this.endPreviewSelection());

       $(document).on("freezeSelection", (e) => this.freezeSelection());
       $(document).on("unFreezeSelection", (e) => this.unFreezeSelection());

       $(document).on("termMouseOut", (e) => this.termMouseOut(e.cluster));
       $(document).on("termClick", (e) =>  this.selectTerm(e.stem, e.term, e.cluster));
       $(document).on("termMouseOver", (e) => this.termMouseover(e.stem, e.term, e.cluster));

       $(document).on("elementEntered", () => {
            this.matchedItems = this._context.itemManager.elements;
            this._context.clusterManager.visualizeClusters();
       });

        $(document).on("collageZoom", () =>   {
            $(".snippet").tooltip('hide');

            if(this._context.stateController.currentState == "info")
                return;

          this.clearSelection();

        });

        this.matchedItems = this._context.itemManager.elements;
        this.selectedTerm = null;
        this.termClusterSelection = null;
        this.matchData = [];
    }

    clearSelection()
    {
        this.selectedItem = null;
        this.matchData = [];
        this.matchedItems = this._context.itemManager.elements;
        this.termClusterSelection = null;

    }

    termMouseover(stem, term, cluster)
    {
        var tb = "<p>";

        cluster.items.forEach(i => {
           if(i.tf[stem])
               tb += i.kwicComponent.createKWICBox(stem);
        });

        this._context.logger.info(JSON.stringify({msg: "Term mouseover", param: term}));

        $(cluster.getDomElement()).tooltip({container: "body", html:true, trigger:"manual"});

        $(cluster.getDomElement())
            .attr('data-original-title', tb)
            .tooltip('fixTitle')
            .tooltip('show');

        $(".tooltip").each(function (i) {

            let pos = $(this).position();

           if( pos.top < 0)
           {
                var newHeight = $(this).height() + pos.top;
                $(this).css("top", 0);
               $(this).height(newHeight-15);
           }
        });

        
        this.oldMatchedItems = this.matchedItems;
        this.matchedItems = this.matchedItems.filter(mi => !cluster.items.some(ci => mi == ci ));
        this.matchedItems = this.matchedItems.filter(mi => mi.tf[stem] != undefined);
        this.termClusterSelection = cluster;

        this._context.clusterManager.visualizeClusters();

    }

    termMouseOut(cluster)
    {
        $(".tooltip").remove();

        this._context.logger.info(JSON.stringify({msg: "Term mouseout"}));

        this.matchedItems = this.oldMatchedItems;
        this.termClusterSelection = null;
        this._context.clusterManager.visualizeClusters();
    }

    selectTerm(word, elements)
    {
        if(this.selectedTerm == word)
            this.selectedTerm = null;
        else
            this.selectedTerm = word;

        $(document).trigger(jQuery.Event("termSelected", {term: word, snippets: elements, selectedItem: this.selectedItem}));

        this.selectedItem.fadeIn();

        elements.forEach(element => element.fadeIn());

    }

    previewSelection(item)
    {
        if(!this._context.clusterManager.clustersEnabled)
            return;

        this.matchData =  this._context.tfidfMatcher.findSimilarElements(item);
        this.matchedItems = this.matchData.map(x => x.snippet);

        if(item instanceof Cluster)
        {
            this.matchedItems = this.matchedItems.filter( x =>  !item.items.some(y => y == x));
        }
        this.selectedItem = item;

        this._context.clusterManager.visualizeClusters();

        this.showSimilarItems();

        if(item.select)
            item.select(this.matchData);


    }

    freezeSelection()
    {
        this._context.logger.info(JSON.stringify({msg: "Selection frozen"}));
        this._context.stateController.changeState("info");
    }

    unFreezeSelection()
    {
        this._context.logger.info(JSON.stringify({msg: "Selection unfrozen"}));
        this._context.stateController.changeState("manipulation");

        if(this.selectedItem && this.selectedItem.unselect)
            this.selectedItem.unselect();

        var deselectedItem = this.selectedItem;

        this.selectedItem = null;
        this.selectedTerm = null;

        this.matchedItems = this._context.itemManager.elements;

        this._context.itemManager.fadeInElements();

        this._context.clusterManager.visualizeClusters();

    }

    showSimilarItems()
    {
        function computeMinMaxRelevance(matchData)
        {
            var maxRelevance = 0;
            var minRelevance = 1;

            matchData.forEach(r => {
                if(r.matches[0].matchRelevance > maxRelevance)
                    maxRelevance = r.matches[0].matchRelevance;
                if(r.matches[0].matchRelevance < minRelevance)
                    minRelevance = r.matches[0].matchRelevance;
            });

            return {min: minRelevance, max:maxRelevance};
        }

        var relevanceObject = computeMinMaxRelevance(this.matchData);

        var scale = d3.scaleLinear().domain([relevanceObject.min,relevanceObject.max]).range([0.5,1]);

        if(this.selectedItem instanceof Cluster)
            this._context.itemManager.fadeOutElements(this.selectedItem.items);
        else
            this._context.itemManager.fadeOutElements([this.selectedItem]);

        this.matchedItems.forEach(i => i.fadeIn());
    }

    endPreviewSelection()
    {
        if(this.selectedItem == null)
            return;

        this._context.logger.info(JSON.stringify({msg: "Element Mouseout"}));

        if(this.selectedItem.unselect)
            this.selectedItem.unselect();

        var unselectedItem = this.selectedItem;

        this.selectedItem = null;
        this.selectedTerm = null;

        this.matchedItems = this._context.itemManager.elements;

        this._context.itemManager.fadeInElements();

        this._context.clusterManager.visualizeClusters();

    }


}