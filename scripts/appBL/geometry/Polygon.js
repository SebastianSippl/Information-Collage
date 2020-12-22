/**
 * Created by ssippl on 02.03.2017.
 */
class Polygon
{
    constructor(points)
    {
        this.points = points;
        
        this._computePolygonArea(points);
        this._computePolygonCentroid();
    }

    _computePolygonArea()
    {
        var area = 0;

        var points = this.points.slice();

        points.push(this.points[0]);

        for(var i = 0; i < points.length - 1; i++)
            area += (points[i].x * points[i+1].y - points[i+1].x * points[i].y);

        area/=2;

        this.area = area;
    }

    _computePolygonCentroid()
    {
        var centroidX = 0;
        var centroidY = 0;

        var points = this.points.slice();

        points.push(this.points[0]);

        for(var i = 0; i < points.length - 1; i++)
            centroidX += (points[i].x + points[i+1].x) * (points[i].x * points[i+1].y - points[i+1].x * points[i].y);

        centroidX *= 1/(6 * this.area);

        for(var i = 0; i < points.length - 1; i++)
            centroidY += (points[i].y + points[i+1].y) * (points[i].x * points[i+1].y - points[i+1].x * points[i].y);

        centroidY *= 1/(6 * this.area);

        this.centroid = {x: centroidX, y: centroidY};

    }

    computePolygonIntersection(line)
    {
        var points = this.points.slice();

        points.push(this.points[0]);

        for(var i = 0; i < points.length - 1; i++){
            var edge = new Line(points[i], points[i+1]);
            var intersection = line.computeLineIntersection(edge);
            if(intersection.seg1 && intersection.seg2){
                return {point: {x: intersection.x, y: intersection.y}, edge: i};
            }
        }

        return null;
    }


    sortPointsCW()
    {
        var self = this;
        this.points.sort(function(a, b){
            // http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
            if (a.x - self.centroid.x >= 0 && b.x - self.centroid.x < 0)
                return true;
            if (a.x - self.centroid.x < 0 && b.x - self.centroid.x >= 0)
                return false;
            if (a.x - self.centroid.x == 0 && b.x - self.centroid.x == 0) {
                if (a.y - self.centroid.y >= 0 || b.y - self.centroid.y >= 0)
                    return a.y > b.y;
                return b.y > a.y;
            }

            // compute the cross product of vectors (center -> a) x (center -> b)
            var det = (a.x - self.centroid.x) * (b.y - self.centroid.y) - (b.x - self.centroid.x) * (a.y - self.centroid.y);
            if (det < 0)
                return true;
            if (det > 0)
                return false;

            // points a and b are on the same line from the center
            // check which point is closer to the center
            var d1 = (a.x - self.centroid.x) * (a.x - self.centroid.x) + (a.y - self.centroid.y) * (a.y - self.centroid.y);
            var d2 = (b.x - self.centroid.x) * (b.x - self.centroid.x) + (b.y - self.centroid.y) * (b.y - self.centroid.y);
            return d1 > d2;
        });
    }


    isPointInside(p)
    {
        // http://stackoverflow.com/questions/1119627/how-to-test-if-a-point-is-inside-of-a-convex-polygon-in-2d-integer-coordinates
        var points = this.points.slice();

        points.push(this.points[0]);

        for(var i = 0; i < points.length - 1; i++) {
            var v1 = {x: points[i].x - p.x, y: points[i].y - p.y};
            var v2 = {x: points[i + 1].x - p.x, y: points[i + 1].y - p.y};
            var edge = {x: v1.x - v2.x, y: v1.y - v2.y};

            var x = edge.x * v1.y - edge.y * v1.x;
            if (x < 0) return false;
        }
        return true;
    }

    _computeUnionStep(p1, polygon1, index1, polygon2)
    {
        var p2 = polygon1.points[index1 % polygon1.points.length];
        var edge = new Line(p1, p2);
        var intersection = polygon2.computePolygonIntersection(edge);
        if(intersection){
            return { p1: intersection.point, polygon1: polygon2, index1: intersection.edge + 1, polygon2: polygon1 };
        }
        return { p1: p2, polygon1: polygon1, index1: index1, polygon2: polygon2 };
    }

    computeUnion(polygon)
    {
        // search for polygon point that is NOT inside of other polygon
        var startIndex = -1;
        var insideCounter = 0;
        for(var i = 0; i < polygon.points.length; i++){
            if(!this.isPointInside(polygon.points[i])){
                if(startIndex == -1) startIndex = i;
            }
            else{
                insideCounter++;
            }
        }

        // polygon is completely inside of other polygon
        if(startIndex == -1){
            return polygon;
        }

        // polygons are not intersecting
        if(insideCounter == 0){
            return null;
        }

        // iteratively calculate concave union of convex polygons
        var points1 = this.points.slice();
        var points2 = polygon.points.slice();

        points1.push(this.points[0]);
        points2.push(polygon.points[0]);

        var start = points2[startIndex];
        var points = [];

        points.push(start);

        var next = { p1: start, polygon1: polygon, index1: startIndex, polygon2: this };

        do{
            next = this._computeUnionStep(next.p1, next.polygon1, next.index1+1, next.polygon2);
            points.push(next.p1);
        } while(next.p1 != start)

        return new Polygon(points);
    }



}