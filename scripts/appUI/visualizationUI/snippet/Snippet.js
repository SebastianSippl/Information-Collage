class Snippet extends  Item
{
    constructor(snippetData, context){
        super(snippetData, context);

        var max = 300; // Width of snippet entry bar;
        this.previewScale = max/this.dimensions[0];
        this._domElement = null;
    }

    click(e){
        chrome.tabs.create({ url: this.url}, tab => {

            //Send information about selected element to tab
            //TODO: This scrolling method is error prone. It should be done with proper message passing. (When script/page/pdf has completed loading)
            setTimeout(() => {  chrome.tabs.sendMessage(tab.id, {name: "scrollToElement",scrollTop: this.annotation().scrollTop});}, 2000)

        });
    }

    get x()
    {
        return super.x;
    }

    set x(newX){
        super.x = newX;
        this._updateDatabaseItem();
    }

    get y()
    {
        return super.y;
    }

    set y(newY){

       super.y = newY;
       this._updateDatabaseItem();
    }

    get manager(){
        return this._context.snippetManager;
    }

    //<editor-fold desc="Getters and Setters for Snippet-data">

    get screenShot(){
        return this.itemData.screenShot;
    }

    get domPath(){
        return this.itemData.domPath;
    }

    get dimensions(){
        return this.itemData.dimensions;
    }

    set important(important)
    {
        this.itemData.important = important;
        this._updateDatabaseItem();
    }

    get important(){
        if(this.itemData.important == undefined)
            return false;

        return this.itemData.important;
    }

    get url(){
        return this.itemData.url;
    }

    set active(newActive){
        this.itemData.active = newActive;
    }

    get active() {
        return this.itemData.active;
    }

    set annotationText(newAnnotationText)
    {
        this.itemData.annotation.text = newAnnotationText;
        this._updateDatabaseItem();
    }
    get annotation()
    {
        return this.itemData.annotation;
    }

    get favIcon()
    {
        return this.itemData.favIcon;
    }

    //</editor-fold>

    //<editor-fold desc="Snippet Methods">

    fadeOut(opacity = 0.1)
    {
        super.fadeOut(opacity);
        if(this.faviconContainer != undefined)
            this.faviconContainer.fadeTo(opacity);
        if(this.itemData.cityLightDOM)
            this.itemData.cityLightDOM.attr("fill", "rgba(51,122,183, "+ 0.7* opacity +")");
    }

    fadeIn(opacity = 1)
    {
        super.fadeIn(opacity);
        if(this.faviconContainer != undefined)
            this.faviconContainer.fadeTo(opacity);
        if(this.itemData.cityLightDOM)
            this.itemData.cityLightDOM.attr("fill", "rgba(51,122,183, "+ 0.5 +")");
    }

    searchAndAppendToBubble() {

        var elementData = this;

        d3.selectAll(".bubble").each(function (x) {
            var place = $.inArray(elementData.id, x.elementIds);

            if (place != -1) {
                x.addElement(elementData);
                x.updateDimensions();
            }

        });
    }

    removeFromBubble() {

        var elementData = this;

        var bubble = d3.selectAll(".bubble").filter(function (d) {
            return  $.inArray(elementData.id, d.elementIds) != -1;
        }).node();

        if (bubble != undefined) {
            var bubbleData = d3.select(bubble).data()[0];
            var indexOfId = bubbleData.elementIds.indexOf(elementData.id);

            bubbleData.elementIds.splice(indexOfId,1);

            bubbleData.updateDimensions();
        }

        return bubbleData;
    };

    createTooltip()
    {
        if(this.annotation)
            return "<h4>" + this.annotation.text + "</h4>" ;

       return "<h4>No Comment </h4>";
    }

    showText()
    {

        this._context.logger.info(JSON.stringify({msg: "Show snippet text", id: this.id}));

        $("#textModalContent").html(this.textContent);
        $("#textModal").modal();
    }
    
    _updateDatabaseItem()
    {

        this._context.logger.info(JSON.stringify({msg: "Snippet content updated", id: this.id, param: "Collage"}));

        this._context.repositoryManager.snippetRepository.updateElement(this.itemData);
    }

    deleteSnippetDom()
    {
        this._context.logger.info(JSON.stringify({msg: "Snippet deleted", id:  this.id}));

        this.getDomElement().remove();
        if(this.faviconContainer != undefined)
          this.faviconContainer.deleteFavicon();


    }

    getDomElement()
    {
        return d3.selectAll(".snippet").filter(x => this.id == x.id).node();
    }

    
    select(matchData)
    {
        if(!this.selected)
            $(this.getDomElement()).tooltip('show');

        this.selected = true;
    }

    unselect()
    {
        super.unselect();
        this.selected = false;
    }

    //</editor-fold>

    //<editor-fold desc="General Snippet DOM Events">

    loadElementImage(loadedCallback)
    {
        var self = this;

        var domElement = self.getDomElement();

        var domElementImage = d3.select(domElement).select("image");

        var image = new Image();

        image.onload = ev => {
            if(self.active)
                d3.select(domElement).attr("transform","translate("+self.x+","+self.y+")");

            d3.select(domElement).attr("width", self.dimensions[0]).attr("height", self.dimensions[1]);
            domElementImage.attr("width", self.dimensions[0]).attr("height", self.dimensions[1]);

            if(loadedCallback != undefined)
                loadedCallback();

        };

        image.src = self.screenShot;
    }

    loadFavIcon(){
        var self = this;
        if(self.faviconContainer == undefined)
            self.faviconContainer = new SnippetFavicon(self);
    }

    loadElementImageAndBubble() {

        this.loadElementImage( () => {this.loadFavIcon(); this.searchAndAppendToBubble()} );
    }

    elementDrag (scale = 1) {

        super.elementDrag(scale);

        var self = this;

        var dragObj = d3.select(this.getDomElement());

        super.x = d3.event.x;
        super.y = d3.event.y;

        var matrix = $("svg").get(0).createSVGMatrix();

        matrix.a = scale;
        matrix.d = scale;
        matrix.e = self.x;
        matrix.f = self.y;

        self.updateTransform(matrix);

        if(this.termBox)
            this.termBox.removeTermTextbox();
    }

    updateTransform(matrix)
    {
        var self = this;

        d3.select(this.getDomElement()).attr("transform", DomHelper.getMatrixTransformString(matrix));

       if(self.faviconContainer != undefined)
           self.faviconContainer.updateFaviconTransform(matrix);
    }

    mouseOver()
    {
        super.mouseOver();

        this._context.logger.info(JSON.stringify({msg: "Snippet Mouseover", id: this.id}));
    }

    elementDragEnd()
    {
        var self = this;

        var element = this.getDomElement();

        if(!self.active)
        {
            this._context.logger.info(JSON.stringify({msg: "Snippet dragged from bar", id: this.id}));

            self.active = true;

            var coords =  d3.mouse(d3.select("#baseLayer").node());

            self.x = coords[0];
            self.y = coords[1]; 

            var index = this._context.snippetManager.inactiveSnippets.indexOf(self);
            this._context.snippetManager.inactiveSnippets.splice(index, 1);
            this._context.snippetManager.activeSnippets.push(self);

           this._updateDatabaseItem();


            $(document).trigger("elementEntered");

            return;
        }

        this._context.logger.info(JSON.stringify({msg: "Snippet dragged", id: this.id}));

        this._updateDatabaseItem();

        //Check if intersection w. other bubble

        var collisionOccurred = false;

        d3.selectAll('.bubbleBounds').each(function(d)
        {

            var rect1 = Rectangle.createRectFromBoundingBox(element.parentNode.getBBox());
            var rect2 = Rectangle.createRectFromBoundingBox(this.getBBox());


            if(rect1.checkIfRectanglesCollide(rect2) && !collisionOccurred)
            {
                var bubbleData = d3.select(this).selectAll(".bubble").data()[0];

                collisionOccurred = true;

                var removedBubble = bubbleData.addElement(self);

                //TODO:Violates private access !
                if(removedBubble != undefined)
                    removedBubble._updateDatabaseItem();

                bubbleData.updateDimensions();

                //TODO:Violates private access !
                bubbleData._updateDatabaseItem();
                //self._context.repositoryManager.bubbleRepository.updateElement(bubbleData);
                d3.select(element).transition().styleTween("opacity", function() { return d3.interpolate(0, 1); }).duration(500);

                self._context.logger.info(JSON.stringify({msg: "Snippet added to bubble", id: self.id, param: bubbleData.id}));
            }

        });

        //No collision means element has left all bubbles.

        if(!collisionOccurred)
        {
            var removedFrom = self.removeFromBubble();

            if(removedFrom != undefined)
            {
                this._context.logger.info(JSON.stringify({msg: "Snippet removed from bubble", param: removedFrom.id}));

                d3.select(element).transition().styleTween("opacity", function() { return d3.interpolate(0, 1); }).duration(500);
                //TODO:Violates private access !
                removedFrom._updateDatabaseItem();
            }
        }
    }

    //</editor-fold>

}