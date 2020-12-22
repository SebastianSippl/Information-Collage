/**
 * Created by sebastian on 25.02.2017.
 */
class WebSearchComponent
{
    constructor()
    {
        this.baseUrl = "http://www.google.at/search?q=";
        this.queryTermList = [];
    }

    addTerm(term)
    {
        this.queryTermList.push(term);
    }

    addTermString(termString)
    {
        this.queryTermList = termsString.split(" ");
    }

    clearQueryList()
    {
        this.queryTermList = [];
    }

    startQuery()
    {
        var queryUrl = this.baseUrl;

        this.queryTermList.forEach(qt => {
            queryUrl += " " + qt;
        });

        chrome.tabs.create({url: queryUrl});

        this.queryTermList = [];
    }

}