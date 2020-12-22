class TFIDFProcessor
{
    constructor()
    {
    }

    _computeTf(listOfTerms) {

        var tf = {};

        listOfTerms.forEach(x => {
            if (tf.hasOwnProperty(x))
                tf[x]++;
            else
                tf[x] = 1;
        });

        return tf;
    }

    computeTf(bagOfWords)
    {
        return this._computeTf(bagOfWords);
    }

    static computeTFIDF(tf, idf, maxTerms = 50)
    {
        var scores = [];

        var max = 1;

        Object.values(tf).forEach(o => {
            if(max < o)
                max = o;
        });

        for(var w in tf)
           scores.push({word: w, score: 0.5 + 0.5 * (tf[w]/max) * idf[w]});

        function compareScores(a, b) {
            if(a.score < b.score)
                return 1;
            else if(a.score > b.score)
                return -1;
            else
                return 0;
        }

        scores.sort(compareScores);

        if(scores.length > maxTerms)
            scores.splice(maxTerms, scores.length);
        
        return scores;
    }

}

if (typeof module !== 'undefined' && module.exports)
    module.exports = TFIDFProcessor;