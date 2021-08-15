var _ = function() {
    var IsometricLib = new PlugIn.Library(new Version("0.6"));

    IsometricLib.skewX = function(points, deg, zeroOffset=0){
        newPoints = []
        for (let p of points) {
            newPoints.push(new Point(p.x + (p.y - zeroOffset) * Math.tan(deg * Math.PI / 180), p.y))
        }
        return newPoints
    }

    IsometricLib.skewY = function(points, deg, zeroOffset=0){
        newPoints = []
        for (let p of points) {
            newPoints.push(new Point(p.x, p.y + (p.x - zeroOffset) * Math.tan(deg * Math.PI / 180)))
        }
        return newPoints
    }

    IsometricLib.scaleX = function(size, factor){
        newSize = new Size(size.width * factor, size.height)
        return newSize
    }

    IsometricLib.scaleY = function(size, factor){
        newSize = new Size(size.width, size.height * factor)
        return newSize
    }

    IsometricLib.getAllShapes = function(graphics){
        shapes = []
        if (graphics instanceof Group) {
            queue = [...graphics.graphics]
            while (queue.length) {
                elt = queue.pop()
                if (elt instanceof Group) {
                    queue.push(...elt.graphics)
                } else {
                    shapes.push(elt)
                }
            }
        } else {
            shapes.push(graphics)
        }
        return shapes
    }

    // returns a list of functions
    IsometricLib.handlers = function(){
        return "\n// IsometricLib ©2021 Andrey Golovanov\n• skewX(points, deg)\n• skewY(points, deg)\n• scaleX(size, factor)\n• scaleY(size, factor)\n• getAllShapes(graphics)"
    }

    // returns contents of matching strings file
    IsometricLib.documentation = function(){
        // create a version object
        var aVersion = new Version("0.6")
        // look up the plugin
        var plugin = PlugIn.find("com.networmix.OmniGraffleIsometricPlugin",aVersion)
        // get the url for the text file inside this plugin
        var url = plugin.resourceNamed("IsometricLib.strings")
        // read the file
        url.fetch(function (data){
            dataString = data.toString()
            console.log(dataString) // show in console
            return dataString
        })
    }
    
    return IsometricLib;
}();
_;