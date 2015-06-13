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
        extend : function(){
            var arr = Array.prototype.slice.call(arguments);
            if(arr.length < 2) return arr[0];
            var target = arr[0];
            for(var i=1,len=arr.length; i<len; i++){
                var tmp = arr[i];
                for(var m in tmp){
                    if(tmp.hasOwnProperty(m)){
                        target[m] = tmp[m];
                    }
                }
            }
            return target;
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
