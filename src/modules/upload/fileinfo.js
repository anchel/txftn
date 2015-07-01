(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.FileInfo = factory(global);
    
})(window, function(global){
    
    var FTN_H5 = global.FTN_H5;
    var Emitter = FTN_H5.Emitter;
    var Util = FTN_H5.Util;
    
    var CONST_DEF = FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var $ = window.jQuery;
    
    var defaultOptions = {
        
        uniqueKey : '',
        
        file : null,
        
        name : '',
        
        size : 0,
        
        chunkSize : 2097152,
        
        vid : '',
        
        md5 : '',
        
        sha : '',
        
        serverip : '',
        
        serverport : 80,
        
        checkkey : '',
        
        uploadStatus : 1, //ready scanning uploading 
        
        percent : 0,
        
        processedSize : 0,
        
        errType : 1,
        
        errCode : 0,
        
        errMsg : '',
        
        workerPath : 'http://v1.qq.com/anchel/test/txftn/dist/ftn.h5.alg-worker.js'
    };
    
    function FileInfo(options){
        options = options || {};
        
        $.extend(this, defaultOptions, options);
    }
    
    return FileInfo;
});