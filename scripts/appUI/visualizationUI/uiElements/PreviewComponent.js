class PreviewComponent
{
    constructor(containerId = "#previewContainer")
    {
        this.containerId = containerId;
    }

    updatePreview(snippets)
    {
        console.log(snippets);

        $(this.containerId).empty();
        $(this.containerId).css({margin:3});

        snippets.forEach(snippet => {

            var scaleFactor = 0.3;

            var scaledW = snippet.dimensions[0] * scaleFactor;
            var scaledH = snippet.dimensions[1] * scaleFactor;

            var imageDiv = $("<div>").attr("class", "brick").css({width: scaledW, height:scaledH});

            var image = $("<img>").attr("class","animImage").attr("src", snippet.screenShot).attr("width", "100%").css({border: "1px solid #337ab7", "border-radius":"3px"});

            image.on("click",  () => $(document).trigger(jQuery.Event("previewImageClicked", {snippet: snippet})));
            image.on("mouseenter", () =>$(document).trigger(jQuery.Event("previewImageMouseEnter", {snippet: snippet})));
            image.on("mouseleave", () =>$(document).trigger(jQuery.Event("previewImageMouseLeave", {snippet: snippet})));

            imageDiv.append(image);

            $(this.containerId).append(imageDiv);

        });


        var wall = new Freewall(this.containerId);

        wall.reset({
            selector: '.brick',
            animate: true,
            cellW: 150,
            cellH: 'auto',
            delay:50,
            onResize: function() {
                wall.fitWidth();
            }
        });

        var images = wall.container.find('.brick');

        images.find('img').load(function() {
            wall.fitWidth();
        });



    }
}