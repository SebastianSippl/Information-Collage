class Cluster
{
    constructor(items, context)
    {
        this.items = items;
        this.tf = {};
        this.extents = {};
        this.keywords = {};
        this.getDomElement = () => null;
        this.controlPoints = null;
        this._context = context;
        this.filter = "url(#hull-blur)";

        this._computeClusterTFIDF();
        this._computeClusterKeywords();
        this._computeControlPoints();
        this._computeClusterExtents();

        var dragsnippet = null;

        this.drag = d3.drag()
            .on("start", (s) => {
                dragsnippet = this.findSelectedSnippet();
                if(dragsnippet)
                    this._context.snippetManager.interactionState.dragstart(dragsnippet);
            })
            .on("drag", (s) => {
                if(dragsnippet)
                    this._context.snippetManager.interactionState.drag(dragsnippet);})
            .on("end", (s) => {
                if(dragsnippet)
                    this._context.snippetManager.interactionState.dragend(dragsnippet);
            });
    }

    _computeControlPoints()
    {
        var vertices = [];

        this.items.forEach(item => {

            var rectangle = Rectangle.createRect({x: item.x, y: item.y}, item.dimensions[0], item.dimensions[1]);

            rectangle.inflate(this._context.clusterManager.scaledClusterDistance );

            vertices = vertices.concat(rectangle.createVertices(3, true));

        });

        //Maybe dont use a linear scale here?!

        var concavity = 500/this._context.clusterManager.zoomLevel;

        var hull = window.hull(vertices.map( v => [v.x, v.y]), concavity);

        this.controlPoints = hull;

    }

    _computeClusterTFIDF()
    {
        var bg = chrome.extension.getBackgroundPage();

        var termFrequencyManager = bg.getTermFrequencyManager();

        var cidf = termFrequencyManager.wordsIDF;

        this.items.forEach(item => {

            for (var term in item.tf) {
                if (this.tf.hasOwnProperty(term))
                    this.tf[term] += item.tf[term];
                else
                    this.tf[term] = item.tf[term];
            }
        });

         this.tfidf = TFIDFProcessor.computeTFIDF(this.tf, cidf);
    }

    _computeClusterExtents()
    {

        var minX = this.controlPoints[0][0];
        var minY = this.controlPoints[0][1];
        var maxX = this.controlPoints[0][0];
        var maxY = this.controlPoints[0][1];

        this.controlPoints.forEach(cp => {

            if (cp[0] < minX)
                minX = cp[0];
            if (cp[0] > maxX)
                maxX = cp[0];
            if (cp[1] < minY)
                minY = cp[1];
            if (cp[1] > maxY)
                maxY = cp[1];
        });

        this.extents = {minX: minX, maxX: maxX, minY: minY, maxY: maxY};

    }

    _computeClusterKeywords()
    {
        var maxImportantWords = 5;
        var maxSimilarWords = 2;

        var importantWordCount = this.tfidf.length < maxImportantWords ? this.tfidf.length : maxImportantWords;

        var importantWords = [];
        var similarWords = [];
        var importantStems = [];
        var similarStems = [];
        
        var stemterms =  this._context.repositoryManager.stemTermRepository.getStemTermObject().stemterms;

        for(var j = 0; j < importantWordCount; j++)
        {
            var word = stemterms[this.tfidf[j].word];
            importantStems.push(this.tfidf[j].word);
            importantWords.push(word);
        }

        var result =  this._context.selectionController.selectedItem != null ? TFIDFMatcher.match({tfidf: this.tfidf},  this._context.selectionController.selectedItem) : null;

        if(result == null)
            this.sharedKW = false;
        else
            this.sharedKW = true;


        var similarWordCount = 0;

        if(result != null)
        {
            similarWordCount = result.terms.length < maxSimilarWords ? result.terms.length : maxSimilarWords;

            for(var j = 0; j < similarWordCount; j++){
                var word = stemterms[result.terms[j]];
                similarStems.push(result.terms[j]);
                similarWords.push(word);

            }

        }

        this.keywords =  {similarWords: similarWords, importantWords: importantWords, similarStems: similarStems, importantStems: importantStems};

        if(this.items.length == 1 && this.items[0].title)
        {
            this.keywords.similarWords.unshift(this.items[0].title);
        }
    }

    findSelectedSnippet()
    {
        //Detect if a snippet is behind the cluster
        for(var i = 0; i < this.items.length;i++)
        {
            var mousePos = d3.mouse(d3.select("#baseLayer").node());


            var item = this.items[i];

            var rect = Rectangle.createRect({x: item.x, y: item.y}, item.dimensions[0], item.dimensions[1]);


            if(rect.checkIfPointInRectangle({x:mousePos[0], y:mousePos[1]}))
                return item;
        }

        return null;
    }

    setFilter(filterId)
    {
        this.filter = "url(#" + filterId + ")";
    }

    _createKeywordContainer(listOfKeywords, listOfStems, container, cssClass)
    {
        for(let i = 0; i < listOfKeywords.length; i++)
        {
            var term = container.append("xhtml:span").attr("style", 'pointer-events:all').html(listOfKeywords[i]).classed(cssClass, true).classed("clusterWord", true);

            term.on("mouseover", (t) => {
                $(document).trigger(jQuery.Event("termMouseOver", {stem: listOfStems[i], term: listOfKeywords[i], cluster: this}));
            });

            term.on("mouseout", (t) => {
                $(document).trigger(jQuery.Event("termMouseOut", {cluster: this}));
            });

            container.append("xhtml:br");
        }
    }

    draw()
    {
        var lineGen = d3.line().curve(d3.curveCatmullRomClosed.alpha(1.0));

        var points = this.controlPoints.slice();

        points.splice(points.length - 1, 1);

        let opacity = d3.scaleLinear().domain([0.2, 0.4]).range([1.0, 0.0]);

        var hullCurve = d3.select("#clusterLayer")
            .append("path")
            .datum(this)
            .classed("overHull", true)
            .call(this.drag)
            .attr('d', lineGen(points));

        hullCurve.style("fill-opacity", 0.4);

        hullCurve.attr("filter", this.filter);

        this.getDomElement = () => hullCurve.node();

        var height = this.extents.maxY - this.extents.minY;
        var width = this.extents.maxX - this.extents.minX;

       var fe =  d3.select("#clusterLayer").append("foreignObject").attr("class", "clusterText")
           .attr("transform", "translate(" + this.extents.minX + " " + this.extents.minY + ")")
           .attr("width", width + "px")
           .attr("height", height + "px")
           .attr("opacity", opacity(this._context.clusterManager.zoomLevel));
           
       var dt = fe.append("xhtml:div").attr("style", "display:table;height:" + height + "px;width:" + width + "px;pointer-events:none;");
       var dc = dt.append("xhtml:div").attr("style", "display:table-cell;vertical-align:middle;pointer-events:none;");

       var textSize = 22;

       var cl = dc.append("xhtml:div")
            .attr("style", "font-size:" + textSize/this._context.clusterManager.zoomLevel + "px;text-align:center;");

       this._createKeywordContainer(this.keywords.similarWords, this.keywords.similarStems, cl, "sharedWord");

       this._createKeywordContainer(this.keywords.importantWords, this.keywords.importantStems, cl, "importantWord");

       this.textContainer = fe.node();

        var selectedSnippet = null;

        hullCurve.on("mousemove", () => {

                var sSnippet = this.findSelectedSnippet();

                if(sSnippet == null && selectedSnippet != null)
                    selectedSnippet.unselect();
                if(sSnippet != null)
                {
                    selectedSnippet = sSnippet;
                    selectedSnippet.select();
                }
                })
         .on("mouseover", () => {

             this._context.clusterManager.interactionState.mouseOver(this)
         })
         .on("mouseout", () => {
             this._context.clusterManager.interactionState.mouseOut(this);
         })
         .on("click", () => {

            var item =  this.findSelectedSnippet();

             if(item)
                 item.manager.interactionState.click(item);
             else
                 this._context.clusterManager.interactionState.click(this)
         });

    }


    mouseOver()
    {
        this._context.logger.info(JSON.stringify({msg:"Cluster Mouseover"}));
        d3.select(this.getDomElement()).attr("filter", "");
        $(document).trigger(jQuery.Event("elementMouseOver", {selection: this}));

    }

    mouseOut()
    {
        d3.select(this.getDomElement()).attr("filter", "url(#hull-blur)");
        $(document).trigger(jQuery.Event("elementMouseOut", {selection: this}));
    }
    
    isVisible()
    {
        var viewport = DomHelper.getViewportDimensions("#mainSvgElement", "#baseLayer");

        return (this.extents.maxX >= viewport[0]
        && this.extents.minX <= viewport[2]
        && this.extents.maxY >= viewport[1]
        && this.extents.minY <= viewport[3]);
    }


}