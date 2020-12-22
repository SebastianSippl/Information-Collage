class Note extends  Item
{
    constructor(noteData, context)
    {
        super(noteData, context);
        this._domElement = null;

    }

    getDomElement()
    {
        if(this._domElement == null)
          this._domElement = d3.selectAll(".note").filter(x => this.id == x.id).node();

        return this._domElement;
    }

    //<editor-fold desc="Getters and Setters for Note-data">

    get manager()
    {
        return this._context.noteManager;
    }

    get title(){
        return this.itemData.title;
    }

    get dimensions(){
        //TODO: Get real dimensions of note ...

      var p =  d3.select(this.getDomElement()).select(".noteParagraph").node();

        return [p.offsetWidth, p.offsetHeight];
    }

    //</editor-fold>

    select(matchData)
    {
        //this.termBox = new TermTextbox(this.getDomElement(), this, matchData, Visualization.itemManager.elements);
    }

    elementDrag(scale = 1)
    {
        var self = this;
        
        super.elementDrag(scale);

        var dragObj = d3.select(this.getDomElement());

        self.x = d3.event.x; // + bounds.attr("width")/2;
        self.y = d3.event.y; // + bounds.attr("height")/2;

        var matrix = $("svg").get(0).createSVGMatrix();

        matrix.a = 1;
        matrix.d = 1;
        matrix.e = self.x;
        matrix.f = self.y;

        d3.select(this.getDomElement()).attr("transform", DomHelper.getMatrixTransformString(matrix));
    }

    deleteItem()
    {

        this._context.logger.info(JSON.stringify({msg: "Note deleted", id: this.id}));

        var bgPage = chrome.extension.getBackgroundPage();

        this._context.repositoryManager.noteRepository.deleteElement(this, () => {
            bgPage.recomputeTFIDF();
        });

        var noteDom = d3.selectAll(".note").filter( (d) => this.id == d.id).node();

        noteDom.remove();

    }
    
    mouseOver()
    {
        super.mouseOver();

        this._context.logger.info(JSON.stringify({msg: "Note Mouseover", id: this.id}));

    }

    elementDragEnd()
    {

        this._context.logger.info(JSON.stringify({msg: "Note dragged", id: this.id}));

        this._context.repositoryManager.noteRepository.updateElement(this.itemData, () => console.log("Done updating Note"));
    }
}