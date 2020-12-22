class GenericRepository
{

    // dbReadyCallback: Called, when the db is ready for operation and it is safe to execute the other methods of this class
    constructor(db, storeName, dbReadyCallback)
    {
        this.storeName = storeName;
        this.observerCallbacks = [];
        this.db = db;

        this._getAllElements((elems) => {
            this.elementCache = elems;

            if(dbReadyCallback != undefined)
                dbReadyCallback();
        });
    }

    unregisterObserverCallback(cb)
    {
        var indexOfCallback = this.observerCallbacks.findIndex(x => x == cb);
        this.observerCallbacks.splice(indexOfCallback,1);
    }

    registerObserverCallback(cb)
    {
        this.observerCallbacks.push(cb);
    }

    //Action that happened (create, update, delete) Element affected
    notifyObservers(action, element)
    {
        for(var i = 0; i < this.observerCallbacks.length; i++)
            this.observerCallbacks[i](action, element);
    }

    storeElement(element, callback)
    {
        var transaction = this.db.transaction([this.storeName], "readwrite");

        var elementStore = transaction.objectStore(this.storeName);

        var request = elementStore.add(element);

        request.onsuccess = x => {

            //Add to cache...

            element.id = x.target.result;

            this.elementCache.push(element);

            this.notifyObservers("create", element);

            if(callback)
                callback(element);

        }
    }

    getAllElements()
    {
        return this.elementCache;
    }

    _getAllElements(callback) {

        var transaction = this.db.transaction([this.storeName], "readonly");
        var request = transaction.objectStore(this.storeName).getAll();

        request.onsuccess = elements => { callback(elements.target.result);}
    }

    updateElement(elem, callback)
    {
        var transaction = this.db.transaction([this.storeName], "readwrite");

        transaction.objectStore(this.storeName).get(elem.id).onsuccess = (event) => {

            var request = transaction.objectStore(this.storeName).put(elem);

            request.onsuccess = x => {

                //Update Cached Element
                var changedObjectIndex = this.elementCache.findIndex(x => x.id == elem.id);

                this.elementCache[changedObjectIndex] = elem;

                this.notifyObservers("update", elem);

                if(callback)
                    callback(x.target.result);
            };
        };

    }

    updateElements(elements, callback)
    {
        var self = this;

        var transaction = this.db.transaction([this.storeName], "readwrite");

        var count = 0;

        var updatedElements = [];

        elements.forEach((elem) => {
            transaction.objectStore(this.storeName).get(elem.id).onsuccess = (event) => {

                var request = transaction.objectStore(this.storeName).put(elem);

                request.onsuccess = x => {

                    count++;
                    //Update Cached Element
                    var changedObjectIndex = this.elementCache.findIndex(x => x.id == elem.id);

                    this.elementCache[changedObjectIndex] = elem;

                    updatedElements.push(elem);

                    if(count == elements.length)
                        this.notifyObservers("update-batch", updatedElements);

                    if(callback)
                        callback(x.target.result);
                };
            };
        });
    }

    deleteElement(element, callback)
    {
        var self = this;

        var transaction = this.db.transaction([this.storeName], "readwrite");
        var store = transaction.objectStore(this.storeName);

        var request = store.delete(element.id);

        request.onsuccess = () => {
            //Remove from cache
            var indexOfId = self.elementCache.findIndex(x => x.id == element.id);
            var deletedElement = self.elementCache.splice(indexOfId,1)[0];

            self.notifyObservers("delete", deletedElement);

            if(callback)
                callback(deletedElement);
        };


    }

}