class StemTermRepository
{
    // To delete Db-Stuff manually: remove %USERPROFILE%\AppData\Local\Google\Chrome\User Data\Default\IndexedDB
    // dbReadyCallback: Called, when the db is ready for operation and it is safe to execute the other methods of this class
    constructor(db, dbReadyCallback) {

        var self = this;

        this.db = db;

        this._initialize(function () {
            if(dbReadyCallback != undefined)
                dbReadyCallback();
        });

    }

    _initialize(callback)
    {
        var transaction = this.db.transaction(["stemterm"], "readwrite");

        var stemTermStore = transaction.objectStore("stemterm");

        var result = stemTermStore.get(1);

        result.onsuccess = x => {

            this.stemCache = x.target.result;

            if(x.target.result == undefined)
            {
                var newObj = {id: 1, stemterms: {}};

                stemTermStore.put(newObj);

                this.stemCache = newObj;
            }

            callback();
        };

    }

    getStemTermObject()
    {
        return this.stemCache;
    }

    updateStemTermObject(newStemTermObject)
    {
        this.elementCache = newStemTermObject;

        var transaction = this.db.transaction(["stemterm"], "readwrite");

        var stemTermStore = transaction.objectStore("stemterm");

        var result = stemTermStore.put(newStemTermObject);

        result.onsuccess = x => {console.log("OK!")};
        result.onerror = x => {console.log("Error!")};

    }



}