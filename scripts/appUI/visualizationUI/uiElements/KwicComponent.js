class KWICComponent
{
    constructor(context, textContent)
    {
        this._context = context;
        this._textContent = textContent;
    }

    createKWICBox(keyword)
    {
        var stemterms = this._context.repositoryManager.stemTermRepository.getStemTermObject().stemterms;

        var sentences = TextProcessor.findSentencesWithKeywords(this._textContent, keyword, stemterms);

        var sentencesMerged = "";

        sentences.forEach(s => {

            try {
                var regex = new RegExp(s.word, "gi");
            }
            catch(err)
            {
                console.log(err);
                return;
            }

            s.sentence = s.sentence.replace(regex, "<span class='highlightedWord'>$&</span>");

            sentencesMerged += "<p>" + s.sentence + "</p>"

        });

        return sentencesMerged;
    }





}