
(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.UploadCore = factory(global);
    
})(window, function(global){
    
    var FTN_H5 = global.FTN_H5;
    var Emitter = FTN_H5.Emitter;
    var Util = FTN_H5.Util;
    
    var CONST_DEF = FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    function UploadCore(options){
        Emitter.call(this);
        
        options = options || {};
        
        this.fileInfo = {
            uniqueKey : options.uniqueKey,
            file : options.file,
            chunkSize : 2097152,
            md5 : '',
            sha1 : ''
        };
    }
    
    Util.inherit(UploadCore, Emitter);
    
    var prototype = {
        
        
        
    };
    
    for(var m in prototype){
        if(prototype.hasOwnProperty(m)){
            UploadCore.prototype[m] = prototype[m];
        }
    }
    
    return UploadCore;
});