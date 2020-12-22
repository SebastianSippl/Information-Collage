class BubbleManipulationState
{
    constructor()
    {

    }

    dragstart(b, domElement)
    {
        d3.event.sourceEvent.stopPropagation();
    }

    drag(b, domElement)
    {
        b.elementDrag(domElement);
    }

    dragend(b, domElement)
    {
        b.dragEnd(domElement);
    }

    noteMouseOver(n)
    {

    }

}