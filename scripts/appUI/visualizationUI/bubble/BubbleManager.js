class BubbleManager
{
     constructor(context)
    {
        this._context = context;

        //"Controller" Events 
        $(document).on("deleteElement", (e) => e.bubble.deleteItem());
        $(document).on("createBubble", (e) => this.createBubble(e.clickedCanvasPos));
        $(document).on("createBubbleTag", (e) => e.bubble.updateName(e.tagText));
        $(document).on("changeBubbleColor", (e) => e.bubble.updateColor(e.color));

        this.interactionState = new BubbleManipulationState(this);
    }

    changeState(stateName)
    {
        if(stateName == "manipulation")
            this.interactionState = new BubbleManipulationState(this);
        else if(stateName == "info")
            this.interactionState = new BubbleInfoState(this);
    }


    updateBubbles()
    {
        var self = this;
        //TODO: SELECTIVE UPDATE (GET ONLY CHANGED ELEMENTS FROM REPOSITORY)
        var data = this._context.repositoryManager.bubbleRepository.getAllElements();

        var bubbles = [];

        //TODO: Remove this part. This should only be done when new Bubbles are added!!!

        $.each(data, function (i, x) {
            bubbles.push(new Bubble(x, self._context));
        });

        var drag = d3.drag()
            .on("start", function (b) {
                self.interactionState.dragstart(b, this)
            })
            .on("drag", function (b) {
                self.interactionState.drag(b, this);
            })
            .on("end", function (b) {
                self.interactionState.dragend(b, this);
            });

        var groupData = d3.select("#bubbleLayer").selectAll("g").data(bubbles, function (d, i) {
            return d.id;
        });


     //   var exit = selection.exit().remove();

      //  var exit = groupData.exit().remove();


        var group = groupData.enter().append("g").classed("bubbleBounds", true)
            .append("g")
            .attr("transform",
                function (d) {
                    return "translate(" + (d.x - d.dist) + "," + (d.y - d.dist) + ")";
                }).call(drag);

        var newBubbles = group.append("rect")
            .attr("height", function (d) {
                if (d.height)
                    return parseFloat(d.height) + 2 * d.dist;
                else
                    return d.initSizeH + 2 * d.dist;
            })
            .attr("width", function (d) {
                if (d.width)
                    return parseFloat(d.width) + 2 * d.dist;
                else
                    return d.initSizeW + 2 * d.dist;
            })
            .attr("rx", 10)
            .attr("ry", 10).classed("bubble", true)
            .style("stroke", function (d) {
                return d.color;
            })
            .classed("bubble", true);

        groupData.select("text")
            .attr("font-size", d => d.fontSize).text(function (d) {
            return d.name;
        });

        groupData.select("rect").style("stroke", function (d) {
            return d.color;
        });

        group.append("text")
            .attr("transform", function (d) {
                return "translate(" + ( d.dist / 4) + "," + (3 * d.dist / 4) + ")";
            })
            .attr("font-size", d => d.fontSize)
            .attr("font-weight", "bold")
            .text(function (d) {
                return d.name;
            });

    }

    //TODO: Currently bubble stuff is not using observer callbacks ... this should be changed in the near future !!!
    // These methods have to be removed  then ...

    createBubble(pos)
    {
        var self = this;

        var bubble = {x: pos.x, y: pos.y, elementIds:[], color: "SlateGray"};

        this._context.repositoryManager.bubbleRepository.storeElement(bubble,
            function (x) {
                self._context.logger.info(JSON.stringify({msg: "Bubble created", id:x.id}));
                
                bubble.id = x.id;

                self.updateBubbles();

            });
    }


}






