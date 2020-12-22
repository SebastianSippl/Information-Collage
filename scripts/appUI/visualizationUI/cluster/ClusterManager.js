class ClusterManager
{
    //TODO: Set a minimal distance - Clustering should only happen if this minimal distance is exceeded
    //TODO: Use screen space
    //TODO: Execute visualization functions only if clusters change ...
    //TODO: Remove static references to Visualization ...
    //TODO: Move selection stuff to selection manager !!

    constructor(context) {

        this.interactionState = new ClusterManipulationState();
        this._context = context;
        this.items = this._context.itemManager.elements;
        this.clusterDistance = 100;
        this.zoomChange = 1.1486983549970353;
        this.zoomLevel = 1;
        this.zoomStep = 0;
        this.clustersEnabled = true;
        this.scalingEnabled = true;

        $(document).on("toggleClusterScaling", () => { this.scalingEnabled = !this.scalingEnabled;});

        $(document).on("toggleClusterVisibility", () => {
            this.clustersEnabled = !this.clustersEnabled;
            localStorage.setItem("clusterToggle", this.clustersEnabled);

            this._context.logger.info(JSON.stringify({msg: "Cluster visibility toggled ", param: this.clustersEnabled}));

            if(!this.clustersEnabled)
            {
                d3.selectAll(".clusterText").remove();
                d3.selectAll(".overHull").remove();
            }
            else
                this.visualizeClusters();
    });

        $(document).on("collageZoom", () =>   {

            if(!this.clustersEnabled)
                return;

            var prevZoom = this.zoomLevel;

            if(prevZoom != d3.event.transform.k)
            {
                this.zoomLevel = d3.event.transform.k;

                //Adopt filter params:
                d3.select("#hull-blur-gauss").attr("stdDeviation", 15/this.zoomLevel);
                d3.select("#hull-blur-gauss-selected").attr("stdDeviation", 15/this.zoomLevel);
                d3.select("#hull-blur-flood").attr("flood-color", "#777777");

                this.visualizeClusters();
            }

            var bounds = [];

            this.clusters.forEach(c => {if(!c.isVisible())bounds.push(c.extents);});

            $(document).trigger(jQuery.Event("invisibleClusterUpdate", {zoomLevel: this.zoomLevel, bounds: bounds}));


            $(".tooltip").remove();

        });
    }

    _createFilterElement(id, color)
    {
       var hullBlur = d3.select("#clusterFilters").append("filter")
            .attr("id", "hull-blur-" + id)
            .attr("width", "250%")
            .attr("height", "250%")
            .attr("x", "-60%")
            .attr("y", "-60%");
        hullBlur.append("feGaussianBlur")
            .attr("id", "hull-blur-gauss")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 100)
            .attr("result", "blur");
        hullBlur.append("feFlood")
            .attr("flood-color", color)
            .attr("flood-opacity", 0.5)
            .attr("result", "floodColor")
            .attr("id", "hull-blur-flood")
        hullBlur.append("feComposite")
            .attr("in", "floodColor")
            .attr("in2", "blur")
            .attr("operator", "in")
            .attr("result", "compositeBlur");

        return "hull-blur-" + id;
    }

    clearFilters()
    {
        d3.select("#clusterFilters").selectAll("*").remove();;
    }

    computeSimilarities()
    {
        var selection = this._context.selectionController.selectedItem;

        if(!(selection instanceof  Cluster))
            return;

        this.clusters.forEach(c => c.similarity = 0);

        this.clusters.forEach(c => c.similarity = TFIDFMatcher.match(selection, c).matchRelevance);
    }

    changeState(stateName)
    {
        if(stateName == "manipulation")
            this.interactionState = new ClusterManipulationState(this);
        else if(stateName == "info")
            this.interactionState = new ClusterInfoState(this);
    }

    visualizeClusters()
    {
        if(!this.clustersEnabled)
            return;

        this.items = this._context.selectionController.matchedItems;

        this._deleteClusters();
        this._createClusters();
        this.computeSimilarities();

        this._drawClusters();
    }

    _createClusters()
    {
        this.clusters = [];

        var coords = [];

        this.items.forEach(i => coords.push({x: i.x, y: i.y, w: i.dimensions[0], h: i.dimensions[1]}));

        if(this.scalingEnabled)
            this.scaledClusterDistance = this.clusterDistance / this.zoomLevel;

        var distFunc = function (point1, point2) {

            var r1 = new Rectangle(point1, point1.w, point1.h);
            var r2 = new Rectangle(point2, point2.w, point2.h);

            return  r1.computeRectangleDistance(r2);
        };

        var dbscanner = jDBSCAN().eps(this.scaledClusterDistance).minPts(0).distance(distFunc).data(coords);

        var clusterMap = dbscanner();

        var centers = dbscanner.getClusters();

        var max =  clusterMap.reduce((a, b) => a > b ? a : b, 0);

        for (var i = 1; i <= max; i++) {

            var clusterItems = [];

            //TODO: Efficiency? -> Do this the other way around?
            for (var j = 0; j < clusterMap.length; j++) {
                if (i == clusterMap[j])
                    clusterItems.push(this.items[j]);
            }

            var newCluster = new Cluster(clusterItems,  this._context);

            if((this._context.selectionController.selectedItem instanceof Cluster) && newCluster.sharedKW)
                this.clusters.push(newCluster);
            else if((this._context.selectionController.selectedItem instanceof Cluster) == false)
                this.clusters.push(newCluster);
        }

    }

    _deleteClusters()
    {
        var tc = this._context.selectionController.termClusterSelection;

        var hullsToRemove = d3.selectAll(".overHull").nodes().filter(d => {
            if(tc != null && tc.getDomElement() == d)
                return false;
            if((this._context.selectionController.selectedItem instanceof Cluster) == false)
                return true;

            return d != this._context.selectionController.selectedItem.getDomElement();
        });

        var textsToRemove = d3.selectAll(".clusterText").nodes().filter(d => {

            if(this._context.selectionController.termClusterSelection != null &&
               this._context.selectionController.termClusterSelection.textContainer == d)
                return false;

            if((this._context.selectionController.selectedItem instanceof Cluster) == false)
                return true;


            return  this._context.selectionController.selectedItem.textContainer != d;
        });

        var selectedHull = d3.selectAll(".overHull").nodes().filter(d => {
            if(this._context.selectionController.selectedItem)
                return d == this._context.selectionController.selectedItem.getDomElement();

            return false;
        });

        d3.selectAll(selectedHull)
            .style("stroke", "#555555")
            .style("fill", "#aaaaaa");
            // .style("stroke", "#a16a39")
            // .style("fill", "#ebac78");

        d3.selectAll(hullsToRemove).remove();
        d3.selectAll(textsToRemove).remove();

    }

    _drawClusters()
    {

        this.clearFilters();

        if(this._context.selectionController.selectedItem instanceof Cluster )
        {

            if(this.clusters.length == 0)
                return;

            var max = this.clusters[0].similarity;
            var min = this.clusters[0].similarity;

            this.clusters.forEach(c => {
                if(c.similarity > max)
                    max = c.similarity;
                if(c.similarity < min)
                    min = c.similarity;
            });

            var color = d3.scaleLinear().domain([min, max]).range(["#ffffff", "#555555"]); //range(["#fec44f", "#f03b20"]);


            for(let i = 0; i < this.clusters.length; i++)
            {
                //this.clusters[i].setFilter(this._createFilterElement(i, color(this.clusters[i].similarity)));
                this.clusters[i].draw();
            }

        }
        else
            this.clusters.forEach(c => c.draw());


    }


}