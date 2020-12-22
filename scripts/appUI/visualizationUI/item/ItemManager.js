class ItemManager
{
    constructor(components)
    {
        if(components)
            this.components = components;
        else
            this.components = [];

        this.visibleItems = [];


        $(document).on("collageZoom", () => {
            var viewportDimensions = DomHelper.getViewportDimensions("#mainSvgElement", "#baseLayer");

            this.findVisibleItems(viewportDimensions);
            
        });

    }
    
    addComponent(component)
    {
        this.components.push(component);
    }

    updateItemComponents()
    {
        this.components.forEach(c => c.updateElements());
    }

    get elements()
    {
        var elem = [];

       this.components.forEach(c => elem = elem.concat(c.elements));

        return elem;
    }

    fadeOutElements(ignoreElements = [])
    {
        this.elements.forEach(e => {if(!ignoreElements.some(x => e == x)) e.fadeOut()});
    }

    fadeInElements(ignoreElements = [])
    {
        this.elements.forEach(e => { if(!ignoreElements.some(x => e == x)) e.fadeIn()});
    }

    findVisibleItems(viewport)
    {
        this.visibleItems.splice(0,this.visibleItems.length);

        this.elements.forEach( s => {
            if(s.isVisible(viewport))
                this.visibleItems.push(s);
        });
    }

   

}