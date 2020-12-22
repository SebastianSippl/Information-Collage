class SnippetSearchResultManager
{
    constructor(context)
    {
        this._context = context;
        this.searchResult = [];
        this.selectionIndex = 0;

        $(document).on("queryCollage", (e) => {
           this._context.logger.info(JSON.stringify({msg: "Collage query started", param : e.queryTerm}));
           this.searchForSnippets(e.queryTerm);
           $(document).trigger(jQuery.Event("collageQueryCompleted", {searchResult: this.searchResult}));
        });


    }

    searchForSnippets(term)
    {
        this.searchResult = this._context.tfidfMatcher.searchForElementsByTerm(term);

        this.selectionIndex = 0;
    }

    getNextResult()
    {
        if(this.searchResult.length == 0)
            return null;

        var result = this.searchResult[this.selectionIndex];

        this.selectionIndex = (this.selectionIndex + 1) % this.searchResult.length;

        return result;

    }





}