class Line
{
    constructor(a, b)
    {
        this.a = a;
        this.b = b;
    }

    computeLineIntersection(l2)
    {
        var ua, ub, denom = (l2.b.y - l2.a.y)*(this.b.x - this.a.x) - (l2.b.x - l2.a.x)*(this.b.y - this.a.y);
        if (denom == 0) {
            return null;
        }
        ua = ((l2.b.x - l2.a.x)*(this.a.y - l2.a.y) - (l2.b.y - l2.a.y)*(this.a.x - l2.a.x))/denom;
        ub = ((this.b.x - this.a.x)*(this.a.y - l2.a.y) - (this.b.y - this.a.y)*(this.a.x - l2.a.x))/denom;
        return {// TODO: This should return a point object
            x: this.a.x + ua*(this.b.x - this.a.x),
            y: this.a.y + ua*(this.b.y - this.a.y),
            seg1: ua >= 0 && ua <= 1,
            seg2: ub >= 0 && ub <= 1
        };
    }

    computeDirVector()
    {
        return {x: this.b.x - this.a.x, y: this.b.y - this.a.y};
    }

    computePointOnLine(s)
    {
        var dir = this.computeDirVector();
        return {x: this.a.x + s * dir.x, y: this.a.y + s * dir.y};
    }

    computeIfLinesIntersect(l2)
    {
       var intersect = this.computeLineIntersection(l2);

       return intersect && (intersect.seg1 && intersect.seg2);
    }

    computeLineNormal()
    {
        var ax = this.a.x - this.b.x;
        var ay = this.a.y - this.b.y;

       // var dx = this.b.x - this.a.x;
       // var dy = this.b.y - this.a.y;

        var norm = Math.sqrt((ax * ax) + (ay * ay));

        return {vx:ay/norm, vy:-ax/norm};
    }

}
