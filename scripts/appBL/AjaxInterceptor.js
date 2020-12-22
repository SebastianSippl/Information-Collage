class AjaxInterceptor
{
    constructor(interceptionCallback)
    {
        this.expireTime = 500;
        this.lastRequestTime = new Date();
        this.running = false;
        this.interceptionCallback = interceptionCallback;

    }

    startInterceptor()
    {
        var self = this;

       this.intervalId = window.setInterval(function () {
            if(new Date() - self.lastRequestTime  > self.expireTime && self.running)
            {
                self.running = false;
                console.log("No more Ajax updates coming in... Executing update callback ...");
                self.interceptionCallback();
            }
        }, self.expireTime+20);

        chrome.webRequest.onCompleted.addListener(function (request) {
            chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
                if(tabs[0] == undefined)
                    return;

                if(request.tabId == tabs[0].id && new Date() - self.lastRequestTime  > self.expireTime )
                {
                    self.lastRequestTime = new Date();
                    self.running = true;
                }

            });

        },{urls: ["<all_urls>"]},[]);
    }

    stopInterceptor()
    {
        if(this.intervalId)
            window.clearInterval(this.intervalId);

    }


}



  