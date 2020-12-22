class SnippetRepository extends GenericRepository
{
    constructor(db, dbReadyCallback)
    {
        super(db, "elements", dbReadyCallback);
    }

    getPageElements(url, callback)
    {
        var pageElements = this.elementCache.filter(function (el) {
            return el.url == url;
        });

        callback(pageElements);
    }

}