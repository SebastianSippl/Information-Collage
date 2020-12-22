class MultiscaleComponent
{
    //TODO: Set a minimal distance - Clustering should only happen if this minimal distance is exceeded
    //TODO: Use screen space
    //TODO: Execute visualization functions only if clusters change ...

    constructor(visibleItems)
    {
        this.visibleItems = visibleItems;
        this.clusterDistance = 100;
        this.zoomLevel = 0;

        $(document).on("collageZoom", () =>
        {
            this.zoomLevel = d3.event.transform.k;

            this.buildClusters();
            this.computeClusterTFIDF();
            this.visualizeClusters();
        });
    }
    
    buildClusters() {

        this.itemClusters = {};

        var coords = [];

        this.visibleItems.forEach(i => coords.push(
            {x: i.x, y: i.y, w: i.dimensions[0], h: i.dimensions[1]}
        ));

        var scaledClusterDistance = this.clusterDistance / this.zoomLevel;

        var distFunc = function (point1, point2) {

            var r1 = {x: point1.x, y: point1.y, width: point1.w, height: point1.h};
            var r2 = {x: point2.x, y: point2.y, width: point2.w, height: point2.h};

            return GeometryHelper.computeRectangleDistance(r1, r2);
        };

        var dbscanner = jDBSCAN().eps(scaledClusterDistance).minPts(1).distance(distFunc).data(coords);

        this.clusterMap = dbscanner();

        var max = this.clusterMap.reduce((a, b) => a > b ? a : b, 0);

        for (var i = 1; i <= max; i++) {
            this.itemClusters[i] = [];

            for (var j = 0; j < this.clusterMap.length; j++) {
                if (i == this.clusterMap[j])
                    this.itemClusters[i].push(this.visibleItems[j]);
            }
        }
    }

    visualizeClusters()
    {
        d3.selectAll(".overRect").remove();
        d3.selectAll(".overText").remove();
        var colors = colorbrewer.Blues[9];

        var max = this.clusterMap.reduce((a, b) => a > b ? a : b, 0);

         for (var i = 1; i <= max; i++) {
         var minX = this.itemClusters[i][0].x;
         var minY = this.itemClusters[i][0].y;
         var maxX = this.itemClusters[i][0].x + this.itemClusters[i][0].dimensions[0];
         var maxY = this.itemClusters[i][0].y + this.itemClusters[i][0].dimensions[1];


         this.itemClusters[i].forEach(item => {

             if (item.x < minX)
             minX = item.x;
             if (item.x + item.dimensions[0] > maxX)
             maxX = item.x + item.dimensions[0];
             if (item.y < minY)
             minY = item.y;
             if (item.y + item.dimensions[1] > maxY)
             maxY = item.y + item.dimensions[1];
         });

             var width = maxX - minX;
             var height = maxY - minY;

             var rect = d3.select("#baseLayer").append("rect").classed("overRect", true).attr("transform", "translate(" + minX + "," + minY + ")")
                 .attr("width", width).attr("height", height).attr("opacity", 0.5).attr("fill", function(){
                     //return colors[i];
                     return "rgba(155,155,0,100)";
                 });


             var textString = "";

             var maxKW = 15;

             var iterations = this.clusterTFIDFs[i].length < maxKW ? this.clusterTFIDFs[i].length : maxKW;


             for(var j = 0; j < iterations; j++)
             {
                 textString += this.clusterTFIDFs[i][j].word + " ";
             }


             var fText = d3.select("#baseLayer").append("foreignObject").classed("overText", true).attr("transform", "translate(" + minX + "," + (minY + 40) + ")").attr("width", width)
                 .attr("height", height);

             var div = fText.append("xhtml:div").style("font-size", (30/this.zoomLevel)  + "px").style("overflow", "hidden").style("width",width + "px").style("height", height + "px").html(textString);


         /*    var text = d3.select("#baseLayer").append("text").classed("overText", true).attr("transform", "translate(" + minX + "," + (minY + 40) + ")")
                        .attr("width", maxX - minX).attr("height", maxY - minY).style("font-size", (40/this.zoomLevel)  + "px");


             for(var j = 0; j < 10; j++)
             {
                 var tspan = text.append("tspan").text(this.clusterTFIDFs[i][j].word).attr("x", 0).attr("dy", 50/this.zoomLevel);
             }*/



         }
    }

    computeClusterTFIDF()
    {
        this.clusterTFIDFs = {};

        var bg = chrome.extension.getBackgroundPage();

        var termFrequencyManager = bg.getTermFrequencyManager();

        var cidf = termFrequencyManager.wordsIDF;

        var max = this.clusterMap.reduce((a, b) => a > b ? a : b, 0);

        for (var i = 1; i <= max; i++) {

        var clusterTF = {};

        this.itemClusters[i].forEach(item => {

            for (var term in item.tf) {
                if (clusterTF.hasOwnProperty(term))
                    clusterTF[term] += item.tf[term];
                else
                    clusterTF[term] = item.tf[term];
            }

            var clusterTFIDF = TFIDFProcessor.computeTFIDF(clusterTF, cidf);

            this.clusterTFIDFs[i] = clusterTFIDF;
        });

        }


    }

}