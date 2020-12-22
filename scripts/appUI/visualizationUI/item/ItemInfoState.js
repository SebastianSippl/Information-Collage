class ItemInfoState
{
    constructor(snippetManager)
    {
        this._snippetManager = snippetManager;
    }

    mouseOver(s)
    {
        s.mouseOverInfo();
    }

    mouseOut(s)
    {
        s.mouseOutInfo();
    }

    click(s)
    {
        d3.event.preventDefault();
    }

    dragstart(s)
    {

    }

    drag(s)
    {

    }

    dragend(s)
    {

    }
}