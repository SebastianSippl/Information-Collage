class ItemManipulationState
{
    constructor(snippetManager)
    {
        this._snippetManager = snippetManager;
    }

    mouseOver(s)
    {
        s.mouseOver();
    }

    mouseOut(s)
    {
        s.mouseOut();
    }

    click(s)
    {
        $(document).trigger(jQuery.Event("elementMouseOver", {selection: s}));
        $(document).trigger("freezeSelection");
        d3.event.stopPropagation();
    }

    dragend(s)
    {
        s.elementDragEnd();
    }

    dragstart(s)
    {
        d3.event.sourceEvent.stopPropagation();
    }

    drag(s, scale = 1)
    {
        s.elementDrag(scale);
    }

}