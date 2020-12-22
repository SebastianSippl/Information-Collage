class NoteManager
{
    constructor(context)
    {
        this.notes = [];
        this._context = context;

        //"Controller Events"
        $(document).on("storeNote", (e) => this.createNote(e.clickedCanvasPos, e.noteTitle, e.noteText));
        $(document).on("deleteNote", (e) => e.note.deleteItem());

        this._loadNotes();

        this.interactionState = new ItemManipulationState(this);

        this.observerCallback = (action, elem) => this.updateElements();

        this._context.repositoryManager.noteRepository.registerObserverCallback(this.observerCallback);

        $(window).unload(() => this._context.repositoryManager.noteRepository.unregisterObserverCallback(this.observerCallback));

    }

    changeState(stateName)
    {
        if(stateName == "manipulation")
            this.interactionState = new ItemManipulationState(this);
        else if(stateName == "info")
            this.interactionState = new ItemInfoState(this);
    }

    get elements()
    {
        return this.notes;
    }

    _loadNotes()
    {
        var data = this._context.repositoryManager.noteRepository.getAllElements();

        this.notes.splice(0,this.notes.length);

        $.each(data, (i, x) => this.notes.push(new Note(x, this._context)));
    }

    updateElements()
    {
        this._loadNotes();

        var drag = d3.drag()
            .on("start", n => this.interactionState.dragstart(n))
            .on("drag", n => this.interactionState.drag(n));

        var groupData = d3.select("#noteLayer").selectAll(".note").data(this.notes, (d, i) => d.id);

        var group = groupData.enter().append("foreignObject").attr("width",400).attr("height",1000)
            .attr("transform",
                function (d) {
                    return "translate(" + (d.x) + "," + (d.y) + ")";
                }).call(drag);


        group.classed("note",true);

        group.on("click", (d) => this.interactionState.click(d))
            .on("mouseover", d => this.interactionState.mouseOver(d))
            .on("mouseout", d => this.interactionState.mouseOut(d));

        var paragraph = group.append("xhtml:p").classed("noteParagraph", true);

        paragraph.append("xhtml:h3").classed("noteTitle",true).html((d) => d.title);

        paragraph.append("xhtml:div").classed("noteText",true).attr("style", "display:inline-block").html((d) => d.textContent);

        $(groupData[0]).tooltip({container: "body", html:true, trigger:"manual"});
        $(groupData[0]).tooltip('show');

    }

    createNote(pos, noteTitle, noteText)
    {
        //TODO: How to find language for notes?
        
        var textProc = new TextProcessor(Snowball("English"));
        var tfidfProc = new TFIDFProcessor();

        var resultObject = textProc.processText(noteText + " " + noteTitle);

        var sto = this._context.repositoryManager.stemTermRepository.getStemTermObject();

        for(var stem in resultObject.stemTermMap)
        {
            if(!sto.stemterms.hasOwnProperty(stem))
                sto.stemterms[stem] = resultObject.stemTermMap[stem];
        }

        this._context.repositoryManager.stemTermRepository.updateStemTermObject(sto);

        var termFrequency = tfidfProc.computeTf(resultObject.stemArray);

        var bgPage = chrome.extension.getBackgroundPage();

        var tfm = bgPage.getTermFrequencyManager();

        tfm.newCorporaEntered([termFrequency]);

        var note = {x: pos.x, y: pos.y, title:noteTitle, textContent:noteText, tf: termFrequency, tfidf:{}};

        this._context.repositoryManager.noteRepository.storeElement(note, (x) =>
        {
            this._context.logger.info(JSON.stringify({msg: "Note created", id: x.id, param: noteTitle, textContent: noteText}));
            note.id = x.id;
            this.updateElements();
            bgPage.recomputeTFIDF();
        });

    }

}