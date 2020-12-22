
class TermFrequencyManager{

    //TODO: This class is highly inefficient (and still fast) ... several recomputations need not to be done ... optimize code

    constructor()
    {
        this.corpusTfList = [];
        this.temporaryCorpusTfList = [];
        this.mergedTermFrequencies = {};
    }

    computeMergedTermFrequencies()
    {
        var self = this;

        this.mergedTermFrequencies = {};

        this.corpusTfList.forEach( corpus => {

            for(var word in corpus)
            {
                if(!self.mergedTermFrequencies.hasOwnProperty(word))
                    self.mergedTermFrequencies[word] = corpus[word];
                else
                    self.mergedTermFrequencies[word] += corpus[word];
            }
        });
    }
    
    createWordlist()
    {
        var self = this;
        self.words = [];

        var mergedCorpora = self.corpusTfList.concat(self.temporaryCorpusTfList);

        $.each(mergedCorpora, function (i, x) {
            for(var word in x)
            {
                if($.inArray(word,self.words) == -1)
                {
                    self.words.push(word);
                }
            }
        });
    }

    generateWordsIDF()
    {
        var self = this;

        self.wordsIDF = {};

        $.each(self.words, function (i,x) {

            self.wordsIDF[x] = self.computeIDF(x);

        });

    }

    //Computes IDF for a Term and the current corpus of Documents
    computeIDF(term) {

        var self = this;
        var documentsContainingTerm = 0;

        var mergedCorpora = self.corpusTfList.concat(self.temporaryCorpusTfList);

        $.each(mergedCorpora, function (i, x) {
            if(x.hasOwnProperty(term))
                documentsContainingTerm++;
        });

        var idf = Math.log(Object.keys(mergedCorpora).length/documentsContainingTerm);

        return idf;
    }

    temporaryCorporaEntered(newCorpora)
    {
        var self = this;

        this.temporaryCorpusTfList = this.temporaryCorpusTfList.concat(newCorpora);

        this.createWordlist();
        this.generateWordsIDF();
    }

    deleteTemporaryCorpora()
    {
        this.temporaryCorpusTfList = [];
    }

    newCorporaEntered(newCorpora)
    {
        this.corpusTfList =  this.corpusTfList.concat(newCorpora);
        this.createWordlist();
        this.generateWordsIDF();
        this.computeMergedTermFrequencies();
    }

    newCorporaContainersEntered(corporaContainers)
    {
        var corpora = [];

        corporaContainers.forEach( x => corpora.push(x.tf));

        this.newCorporaEntered(corpora);
    }


}