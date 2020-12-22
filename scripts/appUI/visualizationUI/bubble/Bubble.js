class Bubble
{
    constructor(bubbleData, context) {

        this._bubbleData = bubbleData;

        this._context = context;

        this.dist = 155;
        //Font size for fonts in bubbles
        this.fontSize = 125;
        //Initial bubble size W
        this.initSizeW = 2000;
        //Initial bubble size H
        this.initSizeH = 1500;

    }

    set name(newName)
    {
        this._bubbleData.name = newName;
    }

    get name()
    {
        return this._bubbleData.name;
    }

    get id()
    {
        return this._bubbleData.id;
    }

    set x(newX)
    {
        this._bubbleData.x = newX;
    }

    get x()
    {
        return this._bubbleData.x;
    }

    set y(newY)
    {
        this._bubbleData.y = newY;
    }

    get y()
    {
        return this._bubbleData.y;
    }

    get elementIds()
    {
        return this._bubbleData.elementIds;
    }

    set color(newColor)
    {
        this._bubbleData.color = newColor;
    }

    get color()
    {
        return this._bubbleData.color;
    }


    //<editor-fold desc="Bubble Methods">
    
    updateDimensions() {

        var bubbleData = this;

        if(bubbleData.elementIds.length == 0)
            return;

        var elementsI = d3.selectAll(".snippet").filter(function (d) {
            return  $.inArray(d.id, bubbleData.elementIds) != -1;
        });

        if(elementsI.node() == undefined)
            return;

        //Find min x, max x, min y and max y

        var elementBox = elementsI.node().parentNode.getBBox();

        var minX = elementBox.x;
        var maxX = elementBox.x + elementBox.width;
        var minY = elementBox.y;
        var maxY = elementBox.y + elementBox.height;

        elementsI.each(function () {

            elementBox = this.parentNode.getBBox();
            var currentMinX = elementBox.x;
            var currentMaxX = elementBox.x + elementBox.width;
            var currentMinY = elementBox.y;
            var currentMaxY = elementBox.y + elementBox.height;

            if(currentMinX < minX)
                minX = currentMinX;
            if(currentMinY < minY)
                minY = currentMinY;
            if(currentMaxX > maxX)
                maxX = currentMaxX;
            if(currentMaxY > maxY)
                maxY = currentMaxY;
        });


        var bubble = d3.selectAll(".bubble").filter(function (d) {
            return  d.id == bubbleData.id;
        }).node();


        var boxW =  maxX - minX + 2 * this.dist;
        var boxH =    maxY - minY + 2 * this.dist;


        var self = this;

        d3.select(bubble.parentNode).transition().attr("transform",function (d) { return "translate(" + ( minX - self.dist) + "," + (minY - self.dist) + ")"; })
            .attr("width", boxW).attr("height", boxH);

        d3.select(bubble).transition().attr("width", boxW).attr("height", boxH);

        var textNode =  $(bubble).siblings().select("text")[0];
    }

    addElement(theObjectData) {

        var bubbleData = this;

        if (bubbleData.elementIds.indexOf(theObjectData.id) == -1){
            var removed = theObjectData.removeFromBubble();
            bubbleData.elementIds.push(theObjectData.id);
            this._updateDatabaseItem();
        }

        return removed;

    }

    _updateDatabaseItem(finishedCallback)
    {
        this._context.repositoryManager.bubbleRepository.updateElement(this._bubbleData, finishedCallback);
    }

    updateColor(newColor) {

        this._context.logger.info(JSON.stringify({msg: "Bubble color changed", param: newColor}));
        this.color = newColor;
        this._updateDatabaseItem(() => this._context.bubbleManager.updateBubbles());

    }

    updateName(newName)
    {
        this._context.logger.info(JSON.stringify({msg: "Bubble tagged", param: newName}));

        this.name = newName;

        this._updateDatabaseItem(() => this._context.bubbleManager.updateBubbles());

    }

    //</editor-fold>

    //<editor-fold desc="Bubble DOM Events">

    elementDrag (element) {

        var bubbleData = this;

        var dragObj = d3.select(element);

        if (d3.event.sourceEvent.which === 1) {

            bubbleData.x = d3.event.x ;
            bubbleData.y = d3.event.y ;

            var bubbleTransform = element.transform.baseVal.getItem(0).matrix;

            var matrix = $("svg").get(0).createSVGMatrix();

            var elements = d3.selectAll(".snippet").filter(function (elementData) {
                return  $.inArray(elementData.id, bubbleData.elementIds) != -1;
            });

            elements.each(function (d) {

                var v = this.transform.baseVal.getItem(0).matrix;

                var u = bubbleTransform.inverse().multiply(v);

                var tm = $("svg").get(0).createSVGMatrix().translate(bubbleData.x,bubbleData.y);

                d.updateTransform(tm.multiply(u));

            });

            element.transform.baseVal.getItem(0).setMatrix(matrix.translate(bubbleData.x,bubbleData.y)) ;

        }
    }

    dragEnd(element) {

        var bubbleData = this;
        var self = this;

        this._context.logger.info(JSON.stringify({msg: "Bubble dragged", id: this.id}));

        var elements = d3.selectAll(".snippet").filter(function (elementData) {
            return  $.inArray(elementData.id, bubbleData.elementIds) != -1;
        });

        elements.each(
            function(elData){
                var iMatrix = this.transform.baseVal.getItem(0).matrix;
                elData.x = iMatrix.e;
                elData.y = iMatrix.f;
            });

        this._context.repositoryManager.bubbleRepository.updateElement(d3.select(element).data()[0]._bubbleData, () => {})

    }

    deleteItem()
    {
        var self = this;

        this._context.logger.info(JSON.stringify({msg: "Bubble deleted", id: this.id}));

        this._context.repositoryManager.bubbleRepository.deleteElement(this._bubbleData);

        var bubbleDom = d3.selectAll(".bubbleBounds").filter(function (d) {
            return  self.id == d.id;
        }).node();

        bubbleDom.remove();
    }


    //</editor-fold>

}