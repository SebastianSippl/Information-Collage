class DomHelper
{
    //Extracts the text content from a given DOM Element
    static extractTextFromElement(domElement) {
        
     var t = $(domElement).clone();

    $("head, script, link, style, noscript", t).remove();

    $("div, br, span, strong, small", t).after(" ");

    var text = $(t).text().replace(/\s+/g," ");

    return text;
}

    //Generates the Xpath Expression for a specific html element
    static getXPath(node)
    {
        var comp, comps = [];
        var parent = null;
        var xpath = '';
        var getPos = function (node) {
            var position = 1, curNode;
            if (node.nodeType == Node.ATTRIBUTE_NODE) {
                return null;
            }
            for (curNode = node.previousSibling; curNode; curNode = curNode.previousSibling) {
                if (curNode.nodeName == node.nodeName) {
                    ++position;
                }
            }
            return position;
        };

        if (node instanceof Document) {
            return '/';
        }

        for (; node && !(node instanceof Document) ; node = node.nodeType == Node.ATTRIBUTE_NODE ? node.ownerElement : node.parentNode) {
            comp = comps[comps.length] = {};
            switch (node.nodeType) {
                case Node.TEXT_NODE:
                    comp.name = 'text()';
                    break;
                case Node.ATTRIBUTE_NODE:
                    comp.name = '@' + node.nodeName;
                    break;
                case Node.PROCESSING_INSTRUCTION_NODE:
                    comp.name = 'processing-instruction()';
                    break;
                case Node.COMMENT_NODE:
                    comp.name = 'comment()';
                    break;
                case Node.ELEMENT_NODE:
                    comp.name = node.nodeName;
                    break;
            }
            comp.position = getPos(node);
        }

        for (var i = comps.length - 1; i >= 0; i--) {
            comp = comps[i];
            xpath += '/' + comp.name;
            if (comp.position != null) {
                xpath += '[' + comp.position + ']';
            }
        }

        return xpath;
    }

    //Gets a specific html element by the given xpath expression
    static getElementByPath(path)
    {
        var element = document.evaluate(
            path,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        return element.snapshotItem(0);


    }

    //Extracts the domain from a given URL
    static extractDomainFromUrl(url)
    {
        var a = document.createElement('a');
        a.setAttribute('href', url);
        return a.hostname;
    }

    //Gets the combined SVG matrix transform of a specific SVG element.
    static getCompositeTransform(node, endLayerId)
    {
        var compoundMatrix =  node.transform.baseVal.consolidate().matrix;

        if(node.parentElement.id != endLayerId)
        {
            var m = DomHelper.getCompositeTransform(node.parentElement, endLayerId);
            compoundMatrix = m.multiply(compoundMatrix);
        }

        return compoundMatrix;
    }

    //Computes the transform string for dom elements from a given svg matrix
    static getMatrixTransformString(svgMatrix)
    {
        return "matrix("+  svgMatrix.a   + " " + svgMatrix.b + " " + svgMatrix.c + " " + svgMatrix.d + " " + svgMatrix.e + " " + svgMatrix.f + ")";
    }

    static cloneMatrix(svgMatrix)
    {
       var clone =  $("svg").get(0).createSVGMatrix();

       clone.a = svgMatrix.a;
       clone.b = svgMatrix.b;
       clone.c = svgMatrix.c;
       clone.d = svgMatrix.d;
       clone.e = svgMatrix.e;
       clone.f = svgMatrix.f;

        return clone;
    }

    //Gets the viewport Dimensions for a specific svg (Viewport) element and a specific transform layer
    static getViewportDimensions(svgElementId, transformLayerId)
    {
        var clientWidth = d3.select(svgElementId).node().clientWidth;
        var clientHeight = d3.select(svgElementId).node().clientHeight;

        var transform = d3.select(transformLayerId).node().transform.baseVal.consolidate().matrix;

        var x0 = -transform.e / transform.a;
        var y0 = -transform.f / transform.a;
        var x1 = x0 + clientWidth / transform.a;
        var y1 = y0 + clientHeight / transform.a;
        var viewportDimensions = [x0, y0, x1, y1];

        return viewportDimensions;
    }


    
    


}