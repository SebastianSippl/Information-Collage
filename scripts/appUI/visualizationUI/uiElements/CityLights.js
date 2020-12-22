/**
 * Created by waldner on 30.11.2016.
 */
class CityLights{

    constructor (context)
    {
        this._context = context;

        $(document).on("invisibleClusterUpdate", (e) => {
            var viewport = DomHelper.getViewportDimensions("#mainSvgElement", "#baseLayer");
            this.recalcCityLights(e.zoomLevel, viewport, e.bounds);
        });

        $(document).on("collageZoom", (e) =>{
            if(!this._context.clusterManager.clustersEnabled)
            {
                var viewport = DomHelper.getViewportDimensions("#mainSvgElement", "#baseLayer");
                this.recalcCityLights(e.zoomLevel, viewport, []);

            }
        });

    }

    recalcCityLights(zoomLevel, viewport, bounds)
    {
        d3.selectAll(".cityLight").remove();


        var vpCenter = [viewport[0] + (viewport[2] - viewport[0]) / 2,
            viewport[1] + (viewport[3] - viewport[1]) / 2];

        var vpRect = [];
        vpRect[0] = [viewport[0], viewport[1]];
        vpRect[1] = [viewport[2], viewport[1]];
        vpRect[2] = [viewport[2], viewport[3]];
        vpRect[3] = [viewport[0], viewport[3]];

        bounds.forEach(function (item)
        {

            var center = [item.minX + (item.maxX - item.minX), item.minY + (item.maxY - item.minY)];

            for(var a = 0; a < 4; a++)
            {
                var b = (a < 3) ? a+1 : 0;

                var l1 = new Line({x: vpCenter[0], y: vpCenter[1]}, {x:center[0], y:center[1]});
                var l2 = new Line({x: vpRect[a][0],y: vpRect[a][1]}, {x: vpRect[b][0], y: vpRect[b][1]});

                var intersect = l1.computeLineIntersection(l2);
                if(intersect) {

                    if (intersect.seg1 && intersect.seg2) {

                        var p1 = new Point(intersect.x, intersect.y);
                        var p2 = new Point(center[0], center[1]);

                        var dist = p1.computeEuclideanDistance(p2);

                        var distScale = 2.0 + dist / 100000;
                        var clWidth = 10.0 / zoomLevel * distScale;


                        var x = intersect.x;
                        var y = intersect.y;
                        var width = item.maxX - item.minX;
                        var height = item.maxY - item.minY;


                        function moveWithin(a1, a2, b1, b2)
                        {
                            if(b1 < a1) return a1 - b1;
                            if(b2 > a2) return a2 - b2;
                            return 0;
                        }


                        switch(a){
                            case 0:
                                x = item.minX + moveWithin(viewport[0], viewport[2], item.minX, item.maxX);
                                height = clWidth;
                                break;
                            case 1:
                                x = x - clWidth;
                                y = item.minY + moveWithin(viewport[1], viewport[3], item.minY, item.maxY);
                                width = clWidth;
                                break;
                            case 2:
                                x = item.minX;
                                y = y - clWidth;
                                height = clWidth;
                                break;
                            case 3:
                                y = item.minY + moveWithin(viewport[1], viewport[3], item.minY, item.maxY);
                                width = clWidth;
                                break;
                        }

                        var opacity = 0.2;


                        var cl = d3.select("#cityLightLayer")
                            .append("rect")
                            .classed("cityLight", true)
                            .attr("x", x)
                            .attr("y", y)
                            .attr("width", width)
                            .attr("height", height)
                            .attr("fill", "rgba(85, 85, 85, " + opacity + ")");
                            //.attr("fill", "rgba(51,122,183, "+ opacity +")");
                            //.on("click",  () => $(document).trigger(jQuery.Event("cityLightClicked", {snippet: item, zoom: zoomLevel})));

                        item.cityLightDOM = cl;
                    }
                }
            }

        });


    }
}