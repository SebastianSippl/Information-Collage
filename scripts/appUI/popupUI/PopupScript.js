$( () => new PopupScript());

class PopupScript
{
    constructor()
    {
        this.bgPage = chrome.extension.getBackgroundPage();
        this.logger = this.bgPage.getLogger();

        this._getStoreButtonState();
        this._setupEventHandling();
    }

    _getStoreButtonState()
    {
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                name: 'queryLocation',
            },  location => {

                if(!location)
                    return;

                this.bgPage.getRepositoryManager().snippetRepository.getPageElements(location.href,
                    elements => {
                        if(elements.find(x => x.domPath == "/HTML[1]/BODY[1]"))
                            $("#btnStorePage, #txtComment").prop("disabled", true);
                    });
            });
        });
    }

    _updateToolState()
    {
        var toolState = { enableAnnotations: $('#chkToolState').prop("checked"),
            pdfLinkParsingEnabled: $('#chkPDFState').prop("checked"),
            ajaxInterceptionEnabled: $('#chkAJAXInterception').prop("checked"),
            areaAnnotationEnabled:$('#chkAreaSelection').prop("checked")};

        this.logger.info(JSON.stringify({msg: "Tool State changed", param: {toolState}}));

        this.bgPage.setToolState(toolState);

    }

    _setupEventHandling()
    {

        var repoMan = this.bgPage.getRepositoryManager();

        var toolState = this.bgPage.getToolState();

        $('#chkToolState').prop('checked', toolState.enableAnnotations );

        $('#chkPDFState').prop('checked', toolState.pdfLinkParsingEnabled);

        $('#chkAJAXInterception').prop('checked', toolState.ajaxInterceptionEnabled);

        $('#chkAreaSelection').prop('checked', toolState.areaAnnotationEnabled);

        $('#chkPDFState, #chkAJAXInterception, #chkToolState, #chkAreaSelection').change(() => this._updateToolState());

        $("#btnStorePage").click(this.storePage);

        $("#txtComment").keypress( ev => {
            if(ev.which == 13)
                storePage();
        });

        $("#btnVisualize").click( () => {
            this.logger.info(JSON.stringify({msg: "Visualization opened"}));
            var newURL = "html/InformationCollage.html";
            chrome.tabs.create({ url: newURL });
        });

        $("#btnEraseDB").click(() => {
            this.logger.info(JSON.stringify({msg: "Database dropped"}));
            $("#confirmModal").modal();
        });

        $("#confirm").click(x =>  {
            repoMan.deleteDb();
            $("#confirmModal").modal("hide");
            chrome.runtime.reload();

        });
        $("#abort").click(x => $("#confirmModal").modal("hide"));

        $("#btnExportDB").click(x => {

           var jsonString = JSON.stringify(repoMan.exportDatabaseToJson());
           var bl = new Blob([jsonString], {type: "text/plain;charset=utf-8"});

            this.logger.info(JSON.stringify({msg:"Database exported"}));

           saveAs(bl, "dbBackup.json");
        });

        $("#btnImportDB").click(x => {
            this.logger.info(JSON.stringify({msg:"Database imported"}));
            var elem = document.getElementById("fileDialog");
            if(elem && document.createEvent) {
                var evt = document.createEvent("MouseEvents");
                evt.initEvent("click", true, false);
                elem.dispatchEvent(evt);
            }
        });

        $("#fileDialog").on("change",  ev => {
            var dbFile = $("#fileDialog").get(0).files[0];

            var reader = new FileReader();

            reader.onloadend = x => {
               var data = JSON.parse(reader.result);

               repoMan.deleteDb(() => {
                   repoMan.importDatabaseFromJson(data, () => {
                        this.bgPage.getTermFrequencyManager().newCorporaContainersEntered(repoMan.snippetRepository.getAllElements());
                        chrome.runtime.reload();

                       return true;
                   });
                });

            };

            reader.readAsText(dbFile);

            var text = reader.result;

        });

    }

    storePage()
    {
        chrome.tabs.getSelected(null, tab => {
            chrome.tabs.sendMessage(tab.id,{name:"storePage", comment: $("#txtComment").val() }, response => {
                $("#btnStorePage, #txtComment").prop("disabled", true);
                this.logger.log({msg:"Page stored", comment: $("#txtComment").val()});
            })});
    }

}



