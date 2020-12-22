class TextMeasurementTool
{
    constructor(textCssClasses = [])
    {
        this.normalCharMap = {};
        this.textCssClasses = {};

        textCssClasses.forEach(tcss =>{

            this.textCssClasses[tcss] = {};

            for(var i = 0; i < 1000; i++)
            {
                var char = String.fromCharCode(i);
                this.textCssClasses[tcss][char] = this._measureChar(char, tcss);
            }

            this.textCssClasses[tcss][" "] = {width:this._measureChar("A A", tcss).width - 2 * this.textCssClasses[tcss]["A"].width};

        });

        for(var i = 0; i < 1000; i++)
        {
            var char = String.fromCharCode(i);
            this.normalCharMap[char] = this._measureChar(char);
        }

        this.normalCharMap[" "] = {width:this._measureChar("A A").width - 2* this.normalCharMap["A"].width};
    }



    getTextWidth(text, cssClass)
    {
        var sumWidth = 0;

        for(var i = 0; i < text.length; i++)
            if(!cssClass)
                sumWidth += this.normalCharMap[text[i]].width;
            else
                sumWidth += this.textCssClasses[cssClass][text[i]].width;

        return sumWidth;

    }

    _measureChar(text, cssClass)
    {
        var textContainer = d3.select("svg")
           .append("g");

        var textDOM = textContainer.append("text")
            .text(text);


        if(cssClass)
            textDOM.attr('class', cssClass);

        var bbox = textContainer.node().getBBox();

        var w = textDOM.node().getComputedTextLength();

        textContainer.remove();

        return {height: bbox.height, width:w}
    }

}