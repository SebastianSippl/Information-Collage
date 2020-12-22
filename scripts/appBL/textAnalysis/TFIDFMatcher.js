class TFIDFMatcher{

    constructor(source)
    {
        this.source = source;

        this.maxMatches = 99;

        this.stemmerEn = Snowball('English');
        this.stemmerGer = Snowball('German');

        this.matchData = null;
    }

    searchForElementsByTerm(term)
    {
        term = term.trim();

        var similarSnippets = [];

        this.stemmerEn.setCurrent(term);
        this.stemmerEn.stem();
        this.stemmerGer.setCurrent(term);
        this.stemmerGer.stem();


        var stemEn = this.stemmerEn.getCurrent();
        var stemGer = this.stemmerGer.getCurrent();

        this.source.elements.forEach(el =>
        {
            for(var i = 0; i < el.tfidf.length; i++)
            {
                if(el.tfidf[i].word.includes(stemEn) || el.tfidf[i].word.includes(stemGer))
                {
                    similarSnippets.push(el);
                    break;
                }
            }
        });

        return similarSnippets;
    }


    findSimilarElements(wFreqContainer)
    {
        var self = this;

        var similarWFreqContainers = [];

        this.source.elements.forEach(el =>
        {
            if(el == wFreqContainer)
                return;

                var matches = [];

                var match = TFIDFMatcher.match(wFreqContainer, el);

                if(match != null)
                    matches = matches.concat(match);

                if(matches.length > 0)
                    similarWFreqContainers.push({snippet:el, matches: matches});
        });

        this.matchData = similarWFreqContainers;

        return similarWFreqContainers;

    }

    /**
     * Computes the similarity of two objects according to the TF-IDF measure.
     *
     *
     * @param sourceWFreqContainer - A source object that contains a TF-IDF Frequency
     * @param targetWFreqContainer - A target object that contains a TF-IDF Frequency
     * @param matchThresh - The percentage that is necessary for counting two objects as similar (1.2 percent by default)
     * @param scoreFun - A function that decides how to use determine the score in the sort function below.
     *
     * @returns An object that describes the similarity of the two containers.
     *
     */
    static match(sourceWFreqContainer, targetWFreqContainer, matchThresh =  0.012, scoreFun = (scoreA, scoreB) => scoreA)
    {
        var self = this;

        var dot = 0;
        var normA = 0;
        var normB = 0;

        var wordScores = [];

        for (var j = 0; j < sourceWFreqContainer.tfidf.length; j++) {
            normA += Math.pow(sourceWFreqContainer.tfidf[j].score, 2);
            for (var k = 0; k < targetWFreqContainer.tfidf.length; k++) {
                if (targetWFreqContainer.tfidf[k].word == sourceWFreqContainer.tfidf[j].word ) {
                    wordScores.push({word: targetWFreqContainer.tfidf[k].word, scoreA: sourceWFreqContainer.tfidf[j].score, scoreB: targetWFreqContainer.tfidf[k].score });
                    dot += sourceWFreqContainer.tfidf[j].score * targetWFreqContainer.tfidf[k].score;
                    break;
                }
            }
        }

        for(var j = 0; j < targetWFreqContainer.tfidf.length; j++)
            normB += Math.pow(targetWFreqContainer.tfidf[j].score, 2);

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        var cosineSimilarity = dot/(normA * normB);

        function sort(a, b) {

            var sScoreA = scoreFun(a.scoreA, a.scoreB);
            var sScoreB = scoreFun(b.scoreA, b.scoreB);

            if(sScoreA > sScoreB)
                return -1;
            else if(sScoreB > sScoreA)
                return 1;

            return 0;
        }

        wordScores.sort(sort);

        if(wordScores.length > this.maxMatches)
            wordScores.splice(this.maxMatches, wordScores.length);

        var matchObj = {terms:[], scores:[], matchType: "TFIDF", color: "#638ccc", matchRelevance: cosineSimilarity};

        wordScores.map( function (wObj, i) {
            matchObj.terms[i] = wObj.word;
            matchObj.scores[i] = scoreFun(wObj.scoreA, wObj.scoreB);
        });

        if(cosineSimilarity > matchThresh)
            return matchObj;
        else
            return null;

    }

}