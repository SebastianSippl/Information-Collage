class Item
{
    constructor(itemData, context)
    {
        this.itemData = itemData;
        this._context = context;
        this.kwicComponent = new KWICComponent(context,this.textContent);

    }

    updateItemData(itemData)
    {
        this.itemData = itemData;
    }

    get id(){
        return this.itemData.id;
    }

    get textContent(){
        return this.itemData.textContent;
    }

    set x(newX){
        this.itemData.x = newX;
    }

    get x(){
        return this.itemData.x;
    }

    set y(newY){
        this.itemData.y = newY;
    }

    get y(){
        return this.itemData.y;
    }

    get center(){
        if(!this.itemData.dimensions) return [this.itemData.x, this.itemData.y];
        return [this.itemData.x + this.itemData.dimensions[0] / 2, this.itemData.y + this.itemData.dimensions[1] / 2];
    }

    get dimensions(){
        return this.itemData.dimensions;
    }

    get timestamp(){
        return this.itemData.timestamp;
    }

    get tf()
    {
        return this.itemData.tf;
    }

    get tfidf()
    {
        return this.itemData.tfidf;
    }

    get title()
    {
        return this.itemData.title;
    }

    elementDrag (scale = 1) {
        $(document).trigger(jQuery.Event("elementDrag", {selection:this}));
    }

    fadeOut(opacity = 0.1)
    {
        d3.select(this.getDomElement()).transition().duration(300).attr("opacity", opacity);
    }

    fadeIn(opacity = 1)
    {
        d3.select(this.getDomElement()).transition().duration(300).attr("opacity", opacity);
    }

    mouseOver()
    {
        $(document).trigger(jQuery.Event("elementMouseOver", {selection: this}));
    }

    mouseOut()
    {
        $(document).trigger(jQuery.Event("elementMouseOut", {selection: this}));
    }

    mouseOverInfo()
    {
        $(document).trigger(jQuery.Event("elementMouseOverInfo", {selection: this}));

        //TODO: get this reference from somewhere else to decrease coupling?
        if(this._context.selectionController.selectedTerm)
        {
            this._oldTooltip = $(this.getDomElement()).attr("data-original-title");

            $(this.getDomElement())
                .attr('data-original-title', this.kwicComponent.createKWICBox(this._context.selectionController.selectedTerm))
                .tooltip('fixTitle')
                .tooltip('show');
        }
    }

    mouseOutInfo()
    {
        $(document).trigger(jQuery.Event("elementMouseOutInfo", {selection: this}));

        $(this.getDomElement()).tooltip('hide')
            .attr('data-original-title',  this._oldTooltip)
            .tooltip('fixTitle');
    }

    isVisible(vp)
    {
        var self = this;

        if(this.itemData.dimensions)
            return ((self.x + self.itemData.dimensions[0]) >= vp[0]
            && self.x <= vp[2]
            && (self.y + self.itemData.dimensions[1]) >= vp[1]
            && self.y <= vp[3]);

        return (self.center[0] >= vp[0]
        && self.center[0] <= vp[2]
        && self.center[1] >= vp[1]
        && self.center[1] <= vp[3]);
    }


     unselect()
     {
         $(this.getDomElement()).tooltip('hide');

       //  this.termBox.removeTermTextbox();
     }



}
