class StateController
{
    constructor(stateContexts)
    {
        if(stateContexts != undefined)
            this.stateContexts = stateContexts;
        else
            this.stateContexts = [];
        this.currentState = "manipulation";
    }

    registerStateContext(sc)
    {
        this.stateContexts.push(sc);
    }

    registerStateContexts(scArray)
    {
       this.stateContexts =  this.stateContexts.concat(scArray);
    }

    changeState(stateName)
    {
        this.currentState = stateName;
        this.stateContexts.forEach(s => s.changeState(stateName));
    }


}