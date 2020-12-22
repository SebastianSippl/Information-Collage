class ClusterManipulationState
{
    constructor()
    {

    }

    click(c)
    {
        $(document).trigger("freezeSelection");
        d3.event.stopPropagation();
    }

    mouseOver(c)
    {
        c.mouseOver();
    }

    mouseOut(c)
    {
       c.mouseOut();
    }

}