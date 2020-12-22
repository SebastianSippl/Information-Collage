/**
 * Created by waldner on 04.11.2016.
 */
class SnippetFavicon
{
    constructor(host)
    {
        this.host = host;

        var self = this;

        this.snippetDom = host.getDomElement();

        this.width  = host.dimensions[0];
        this.height = host.dimensions[1];
        this.currentZoom = 1;

        this.boxesOuter =   d3.select("#faviconLayer").append("g").classed("info",true).append("g");

        this.updateFaviconTransform();

        this.infoBox = this.boxesOuter.append("image").attr("xlink:href", function(){ return self.host.favIcon; });
        this.infoBox.attr("width",0).attr("height", 0).attr("rx", 0).attr("ry", 0).attr("y", 0).attr("width", this.width).attr("height", this.height);
        this.infoBox.classed("info", true);


        this.collageZoomEventHandler = ()  => {
            this.currentZoom = d3.event.transform.k;

            if(d3.select(this.host.getDomElement()).attr("opacity") != null)
                this.updateFaviconOpacity(parseFloat(d3.select(this.host.getDomElement()).attr("opacity")));

        };

        $(document).on("collageZoom", this.collageZoomEventHandler);

        this.updateFaviconOpacity(1);
    }

    deleteFavicon()
    {
        this.infoBox.remove();
        $(document).off("collageZoom", this.collageZoomEventHandler);

    }
    

    updateFaviconTransform()
    {
        var self = this;

        var matrix = this.snippetDom.transform.baseVal.getItem(0).matrix;
        this.boxesOuter.attr("transform", function(){return "matrix("+ matrix.a + " " + matrix.b + " " + matrix.c + " " + matrix.d + " " + (matrix.e + self.host.dimensions[0]/2 - self.width/2 ) + " " + (matrix.f + self.host.dimensions[1]/2 - self.height/2) + ")"});
    }

    fadeTo(hostOpacity)
    {
        var opaq = this._computeFaviconOpacity(hostOpacity);
        this.infoBox.style("opacity", opaq);
    }

    updateFaviconOpacity(hostOpacity)
    {
        this.infoBox.style("opacity", this._computeFaviconOpacity(hostOpacity));
    }

    _computeFaviconOpacity(hostOpacity)
    {
        this.lastOpacity =  (0.5 - this.currentZoom) * hostOpacity;

        return this.lastOpacity;
    }

}