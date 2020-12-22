class SnippetManager
{
    constructor(context)
    {
        var self = this;

        this._context = context;

        this.activeSnippets = [];
        this.inactiveSnippets = [];

        this.interactionState = new ItemManipulationState(this);

        var data = this._context.repositoryManager.snippetRepository.getAllElements();
        
        $(document).on("deleteSnippet", (e) => this._context.repositoryManager.snippetRepository.deleteElement(e.snippet));

        //Load and create UI snippet models

        $.each(data,  (i, x) => {

            var newSnippet = new Snippet(x, this._context);

            if(x.active)
                self.activeSnippets.push(newSnippet);
            else
                self.inactiveSnippets.push(newSnippet);
            
        });

        this.observerCallback = function (action, elem) {

            if(action == "delete")
            {
                var index = self.inactiveSnippets.findIndex(function (el) {
                    return elem.id == el.id;
                });

                if(index != -1)
                    var collection = self.inactiveSnippets;
                else
                {
                    index = self.activeSnippets.findIndex(function (el) {
                        return elem.id == el.id;
                    });

                    var collection = self.activeSnippets;

                }

                collection[index].removeFromBubble();
                collection[index].deleteSnippetDom();
                collection.splice(index,1);

            }
            else if(action == "update")
            {
                var allSnippets = self.activeSnippets.concat(self.inactiveSnippets);

                var index = allSnippets.findIndex(function (el) {
                    return elem.id == el.id;
                });

                allSnippets[index].updateItemData(elem);
            }
            else if(action == "update-batch")
            {
                var allSnippets = self.activeSnippets.concat(self.inactiveSnippets);

                var elems = elem;

                elems.forEach(x => {

                    var index = allSnippets.findIndex(function (el) {
                        return x.id == el.id;
                    });

                    if(index == -1)
                    {
                        var newSnippet = new Snippet(x, self._context);

                        self.inactiveSnippets.push(newSnippet);
                    }
                    else
                        allSnippets[index].updateItemData(x);


                });

            }

            self._updateNewSnippets();
            self._updateSnippets();

        };

        this._context.repositoryManager.snippetRepository.registerObserverCallback(this.observerCallback);

        $(window).unload(function () {
            self._context.repositoryManager.snippetRepository.unregisterObserverCallback(self.observerCallback);
        });

        this.drag = d3.drag()
            .on("start", (s) => this.interactionState.dragstart(s))
            .on("drag", (s) => this.interactionState.drag(s))
            .on("end", (s) => this.interactionState.dragend(s));

    }

    get elements()
    {
        return this.activeSnippets;
    }

    changeState(stateName)
    {
        if(stateName == "manipulation")
            this.interactionState = new ItemManipulationState(this);
        else if(stateName == "info")
            this.interactionState = new ItemInfoState(this);
    }

    updateElements()
    {
        this._updateSnippets();
        this._updateNewSnippets();
    }

    _updateSnippets()
    {
            var self = this;

           var selection = d3.select("#snippetLayer").selectAll(".snippet")
                .data(self.activeSnippets, function (d, i) {
                    return d.id;
                });

           var updateSelection = d3.select("#snippetLayer").selectAll(".snippet").data(self.activeSnippets, function (d, i) {
              return d.id;
           });

        var importantD = 30;
        var importantX = -15;

        function setImportance(cont)
        {
            cont.attr("x", (d) => {if(d.important) return importantX; return -1;})
                .attr("y", (d) => {if(d.important) return importantX; return -1;})
                .attr("width", (d) => {if(d.important)return d.dimensions[0] + importantD; return d.dimensions[0] + 2;})
                .attr("height", (d) => {if(d.important)return d.dimensions[1] + importantD; return d.dimensions[1] + 2;})
                .attr("fill", (d) => {if(d.important) return "red"; return "#dddddd";});
        }

            updateSelection.each(function (sel) {
               var help = sel.createTooltip();
                $(this).tooltip('hide')
                    .attr('data-original-title', help)
                    .tooltip('fixTitle');
                setImportance(d3.select(this).select("rect"));
            });

            var exit = selection.exit().remove();

            var containers =  selection.enter().append("g").classed("snippetBounds", true);

            //TODO: Snippet Class -> should be added to image, remove snippetImage

            var sCont = containers.append("g").classed("snippet", true).call(this.drag).attr("title", (d) => d.createTooltip());

            var rect = sCont.append("rect");
                rect.attr("x", (d) => -5)
                .attr("y", (d) => -5)
                .attr("width", (d) => d.dimensions[0] + 10)
                .attr("height", (d) =>  d.dimensions[1] + 10)
                .attr("rx", 5).attr("ry", 5).attr("fill", (d) => "black");

            setImportance(rect);

            var snippets = sCont
                .append("image").classed("snippetImage", true)
                .attr("xlink:href", function (im) {
                    return im.screenShot;
                })
                .on("load", function (d) {
                    d.loadElementImageAndBubble();
                })
                .on("mouseover", (s) => this.interactionState.mouseOver(s))
                .on("mouseout",  (s) => this.interactionState.mouseOut(s))
                .on("click",     (s) => this.interactionState.click(s));


            $(sCont._groups[0]).tooltip({container: "body", html:true, trigger:"manual"});


    }

    _updateNewSnippets()
    {
        var self = this;

        var scale = 0.12;

            var selection = d3.select("#snippetEntryLayer").selectAll("g")
                .data(self.inactiveSnippets, function (d, i) {
                    return d.id;
                });

            var exit = selection.exit().remove();

            selection = selection.enter();

            var containers = selection.append("g");


            var snippets = containers
                .append("image")
                .classed("snippet", true)
                .on("click", (d) => this.interactionState.click(d))
                .on("mouseover", d => this.interactionState.mouseOver(d))
                .on("mouseout", d => this.interactionState.mouseOut(d))
                .attr("xlink:href", function (im) {
                    return im.screenShot;
                }).on("load", function (d) {
                    d.loadElementImage();
                }).attr("transform", s => "scale(" + s.previewScale + ")").call(this.drag);

            snippets.style("filter", "url(#drop-shadow)");

            var offsetX = 20;
            var offsetDist = 5;
            var offsetY = 120;

            var allSnippets = d3.select("#snippetEntryLayer").selectAll("g");

            allSnippets =  allSnippets.sort(function (a,b) {
                if(a.id < b.id)
                    return 1;
                else if(b.id < a.id)
                    return -1;
                else
                    return 0;
            });

            allSnippets.each(function (d) {

                //.transition().
                d3.select(this).attr("transform", "translate(" + offsetX + "," + offsetY +")");

                offsetY += d.dimensions[1] * d.previewScale + offsetDist;

                console.log(offsetY);

            });
    }

   
    
}