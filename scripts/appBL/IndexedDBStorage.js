function createIndexDBStorage(pageInfo) {

    var selectionBB = null; // Bounding box of selection

    $(document).on("mouseup", function () {

        var tmp =  getSelectionDimensions();

        if(tmp != undefined)
            selectionBB = tmp;

        function getSelectionDimensions() {
            var sel = document.selection, range;
            var width = 0, height = 0;
            var rect;
            if (sel) {
                if (sel.type != "Control") {
                    range = sel.createRange();
                    width = range.boundingWidth;
                    height = range.boundingHeight;
                }
            } else if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    range = sel.getRangeAt(0).cloneRange();
                    if (range.getBoundingClientRect) {
                        rect = range.getBoundingClientRect();
                    }
                }
            }




            return rect;
        }
    });


    return function () {
        return {
            create: function (annotation) {

                var cont = $("#viewerContainer");

                if(!cont.get(0))
                    cont =  $("body");

                annotation.id = ++pageInfo.id;
                annotation.links = [{rel:'alternate',href:"#", type: 'text/html', id: annotation.id}];
                annotation.textAnnotation = true;
                annotation.scrollTop = cont.get(0).scrollTop;

                //The bounding box should generally be generated from the annotation data - this is just a fast fix ...
                if(selectionBB.width == 0 || selectionBB.height == 0)
                {
                   var boxFirst =  DomHelper.getElementByPath("/HTML[1]/BODY[1]" + annotation.ranges[0].start).getBoundingClientRect();
                   var boxSecond =  DomHelper.getElementByPath("/HTML[1]/BODY[1]" + annotation.ranges[0].end).getBoundingClientRect();

                   var rect = {left: boxFirst.left < boxSecond.left ? boxFirst.left : boxSecond.left,
                               right: boxFirst.right > boxSecond.right ? boxFirst.right : boxSecond.right,
                               top: boxFirst.top < boxSecond.top ? boxFirst.top : boxSecond.top,
                               bottom: boxFirst.bottom > boxSecond.bottom ? boxFirst.bottom : boxSecond.bottom,
                              };

                    rect.width = rect.right - rect.left;
                    rect.height = rect.bottom - rect.top;

                    selectionBB = rect;

                }

                window.setTimeout(function () {
                    var oldCol = $("[data-annotation-id]").css("background-color");
                    $("[data-annotation-id]").css({"background-color":"transparent"});
                    $(".annotator-viewer").hide();
                    window.setTimeout(function () {
                        PageSnippetHelper.createPageSnippet(selectionBB,annotation.quote, "/HTML[1]/BODY[1]" + annotation.ranges[0].start, annotation, null , function () {
                            $("[data-annotation-id]").css({"background-color" : oldCol});
                            $(".annotator-viewer").show();
                        });
                    },50);
                }, 50);


                return annotation;
            },

            update: function (annotation) {
                chrome.extension.sendMessage({name: 'updateElement', element: {id:annotation.id, annotation:annotation}}, (response) => {});
                return annotation;
            },

            'delete': function (annotation) {
                chrome.extension.sendMessage({name: 'deleteElement', element: {id : annotation.id}}, (response) => {});
                return annotation;
            },

            query: function () {
              


                var pageElements = [];

                for(var i = 0; i < pageInfo.pageElements.length; i++)
                {
                    if(pageInfo.pageElements[i].annotation && pageInfo.pageElements[i].annotation.textAnnotation)
                    {
                       
                        var ann =  pageInfo.pageElements[i].annotation;
                        ann.id = pageInfo.pageElements[i].id;
                        pageElements.push(ann);
                    }

                }

                return {results: pageElements};
            },


            configure: function (registry) {
                registry.registerUtility(this, 'storage');

            }
        };
    };
}


