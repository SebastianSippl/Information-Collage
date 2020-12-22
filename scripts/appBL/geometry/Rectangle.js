class Rectangle
{
    constructor(center, width, height)
    {
        this.x = center.x;
        this.y = center.y;
        this.width = width;
        this.height = height;
    }

    get right()
    {
        return this.x + this.width/2;
    }

    get left()
    {
        return this.x - this.width/2;
    }

    get top()
    {
        return this.y - this.height/2;
    }

    get bottom()
    {
        return this.y + this.height/2;
    }


    //Factory methods

    static createRect(topLeft, width, height)
    {
        return new Rectangle({x: topLeft.x + width/2, y: topLeft.y + height/2}, width, height);
    }

    static createRectFromBoundingBox(bb)
    {
        return Rectangle.createRect({x:bb.x, y: bb.y}, bb.width, bb.height);
    }

    //Gets the rectangles vertices. If num > 0 it will create extra vertices on each line
    createVertices(num = 0, removeCorners = false)
    {
        var vertices = [];

        var topLeft = {x: this.left, y: this.top};
        var topRight = {x: this.right, y: this.top};

        if(!removeCorners)
        {
            vertices.push(topLeft);
            vertices.push(topRight);
            vertices.push({x: this.right, y: this.bottom});
            vertices.push({x: this.left, y: this.bottom});
        }

        var offsetsX = [this.top,0, this.bottom, 0];
        var offsetsY = [0, this.right, 0, this.left];

        for(var i = 0; i < 4; i++)
        {
            for(var j = 1; j < num + 1; j++)
            {
                if(i % 2 == 0)
                    vertices.push({x: this.left + this.width/(num+1) * j, y: offsetsX[i] })
                else
                    vertices.push({x: offsetsY[i], y: this.top +  this.height/(num+1) * j })
            }
        }

        return vertices;
    }

    inflate(w, h = 0)
    {
        if(h == 0)
            h = w;

        this.width  += w;
        this.height += h;

    }

    checkIfRectanglesCollide(rect) {

        var overlap = !(this.right < rect.left ||
        this.left > rect.right ||
        this.bottom < rect.top ||
        this.top > rect.bottom);

        return overlap;
    };

    checkIfPointInRectangle(point)
    {
        return this.checkIfRectanglesCollide(Rectangle.createRect({x:point.x, y:point.y},0, 0));
    }

    computeRectangleDistance(other)
    {
        var left = this.x < other.x ? this : other;
        var right = other.x < this.x ? this : other;

        var xDiff = right.x - (left.x + left.width);
        xDiff = Math.max(0, xDiff);

        var upper = this.y < other.y ? this : other;
        var lower = other.y < this.y ? this : other;

        var yDiff = lower.y - (upper.y + upper.height);
        yDiff = Math.max(0, yDiff);

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

}