class RepositoryManager
{
    constructor(repositoriesReadyCallback)
    {
        this.version = 13;
        
        this.initializeRepositories(repositoriesReadyCallback);
    }

    initializeRepositories(repositoriesReadyCallback)
    {
        this._openDatabaseConnection(x => {
            this.snippetRepository = new SnippetRepository(this.db, () =>
                this.bubbleRepository = new GenericRepository(this.db, "bubbles", () =>
                    this.stemTermRepository = new StemTermRepository(this.db, () =>
                        this.noteRepository = new GenericRepository(this.db, "notes", repositoriesReadyCallback))));
        });
    }

    exportDatabaseToJson()
    {
        var snippets = this.snippetRepository.getAllElements();
        var bubbles = this.bubbleRepository.getAllElements();
        var notes = this.noteRepository.getAllElements();
        var stemterms = this.stemTermRepository.getStemTermObject();

        return {snippets:snippets, bubbles: bubbles, notes:notes, stemterms: stemterms};
    }

    _buildStemTerms(databaseJson)
    {
        var stemmer = Snowball("English");

        var termMap = {};

        var stemFunc = s => {

            var stemmedTFs = {};
            var stemmedTFIDF = [];

            for(var term in s.tf)
            {
                stemmer.setCurrent(term);
                stemmer.stem();
                var stem = stemmer.getCurrent();

                if(!termMap.hasOwnProperty(stem))
                    termMap[stem] = term;

                stemmedTFs[stem] = s.tf[term];

                var tfidf = s.tfidf.find(x => x.word == term);

                if(tfidf != null)
                    stemmedTFIDF.push({word: stem, score: tfidf.score});
            }

            s.tf = stemmedTFs;
            s.tfidf = stemmedTFIDF;
        };


        databaseJson.snippets.forEach(stemFunc);
        databaseJson.notes.forEach(stemFunc);

        var stemterms = {};

        for(var stem in termMap)
            stemterms[stem] = termMap[stem];

        databaseJson.stemterms = {id:1, stemterms: stemterms};

    }


    importDatabaseFromJson(databaseJson, callback)
    {
        //Compatability

        if(!databaseJson.notes)
            databaseJson.notes = [];
        if(!databaseJson.stemterms)
            this._buildStemTerms(databaseJson);


        var self = this;
        //Drop old database;

        var snippetsLoaded = 0;
        var bubblesLoaded = 0;
        var notesLoaded = 0;

        self._openDatabaseConnection(x => {
            self.snippetRepository = new SnippetRepository(self.db, function () {
                self.bubbleRepository = new GenericRepository(self.db, "bubbles", function () {
                    self.noteRepository = new GenericRepository(self.db, "notes", function () {
                        self.stemTermRepository = new StemTermRepository(self.db, function () {


                    self.stemTermRepository.updateStemTermObject(databaseJson.stemterms);

                    databaseJson.snippets.forEach(s => {

                        if(s.url.includes("chrome-extension"))
                           s.url = s.url.replace(new RegExp("\/\/.*\\?"), "\\" + chrome.runtime.id +"/scripts/externalLibraries/pdf/web/viewer.html?");

                        self.snippetRepository.storeElement(s, function () {
                        snippetsLoaded++;
                        loaded();
                    })});
                    databaseJson.bubbles.forEach(b => self.bubbleRepository.storeElement(b, function () {
                        bubblesLoaded++;
                        loaded();
                    }));

                    databaseJson.notes.forEach( n => self.noteRepository.storeElement(n, function(){
                        notesLoaded++;
                        loaded();
                    }));

                        });
                    });
                });
            });
        });
        
        function loaded() {
            if(snippetsLoaded == databaseJson.snippets.length && bubblesLoaded == databaseJson.bubbles.length &&
               notesLoaded == databaseJson.notes.length)
                if(callback)
                    callback();
        }
    }

    _openDatabaseConnection(dbOpenCallback)
    {
        var self = this;

        if (!window.indexedDB) {
            window.alert("Your Browser does not support a stable Version of IndexedDB.");
        }

        var openRequest = indexedDB.open("browserCollage", this.version);

        openRequest.onupgradeneeded = function (e) {

            console.log("Upgrading...");
            var thisDB = e.target.result;

            if (!thisDB.objectStoreNames.contains("elements")){
                var store = thisDB.createObjectStore("elements", {keyPath:"id", autoIncrement: true });
                store.createIndex("url", "url", { unique: false });
            }
            if (!thisDB.objectStoreNames.contains("bubbles"))
                thisDB.createObjectStore("bubbles", {keyPath:"id", autoIncrement: true });
            if(!thisDB.objectStoreNames.contains("notes"))
                thisDB.createObjectStore("notes", {keyPath: "id", autoIncrement:true});
            if(!thisDB.objectStoreNames.contains("stemterm"))
                thisDB.createObjectStore("stemterm", {keyPath: "id"});
        };

        openRequest.onsuccess = e => {
            console.log("Success!");
            this.db = e.target.result;
            if(dbOpenCallback)
                dbOpenCallback();
        };

        openRequest.onerror = function (e) {
            console.log("Error");
            console.dir(e);
        }
    }

    deleteDb(dbReadyCallback) {

        var self = this;

        self.db.close();

        var req = indexedDB.deleteDatabase("browserCollage");

        req.onsuccess = function () {
            console.log("Deleted database successfully");

            if(dbReadyCallback)
                dbReadyCallback();
        };
        req.onerror = function () {
            console.log("Couldn't delete database");
        };
        req.onblocked = function () {
            console.log("Couldn't delete database due to the operation being nodeSelected");
        };
    }
}