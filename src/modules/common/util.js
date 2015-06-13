/**
 * 
 * 
 */
(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.Util = factory();
    
})(window, function(){
    
    var uniqueKey = 0;
    
    var Util = {
        log : function(msg){
            if(window.console && console.log){
                console.log(msg);
            }
        },
        inherit : function(childClass, parentClass) {
            var fn = function() {
            };
            fn.prototype = parentClass.prototype;
            childClass.prototype = new fn();
            childClass.prototype.constructor = childClass;
        },
        getUniqueKey : function(){
            return ++uniqueKey;
        }
    };
    
    return Util;
});
