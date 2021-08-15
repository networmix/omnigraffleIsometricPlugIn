var _ = function() {
    var IsometricLib = new PlugIn.Library(new Version("0.5"));

    IsometricLib.skewX = function(points, deg){
        new_points = []
        for (let p of points) {
            new_points.push(new Point(p.x + p.y * Math.tan(deg * Math.PI / 180), p.y))
        }
        return new_points
    }

    IsometricLib.skewY = function(points, deg){
        new_points = []
        for (let p of points) {
            new_points.push(new Point(p.x, p.y + p.x * Math.tan(deg * Math.PI / 180)))
        }
        return new_points
    }
    
    // returns a list of functions
    IsometricLib.handlers = function(){
        return "\n// IsometricLib ©2021 Andrey Golovanov\n• skewX(points, deg)\n• skewY(points, deg)"
    }

    // returns contents of matching strings file
    IsometricLib.documentation = function(){
        // create a version object
        var aVersion = new Version("0.5")
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