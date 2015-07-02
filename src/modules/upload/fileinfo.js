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
        
        serverip : '113.142.44.24',
        
        serverport : 80,
        
        checkkey : '045bae8a7f3549664b8b9e6a878c3aa98e99d34764cb99841e1c5b7ba7e2de0d0044aa126b4eea12427acabbb8f21fa4a3ff2b78c041c6a861924136c04c9c4e6faabab1fc690f6238361290224e426ab3246a61607749e1318593c3e3b492ed7211736fa1619d185f2188cacb0d4a315434a1c49d7fcd08499bcf1a21db86fab1e38d396a72696792e60f821cebe5aa47fec567d0fc027fa25591fbb7cdca58ac23edf2ea0856776af070a4567923c9bc61c2689190089eaa5bccaa0cca00a8fe12fe8a12bf003050bd30cf5a802ac770430ebee9f64116a68537a8adf71930e504192de4a8de681bf055d2d2765905631891890973735643623ae4c02bfaf3b2054ce00f10c9b73c0659ad065a2c733cf35196f0bd0521a47f9253d12fb26577d7b4a9d9261af135a1afe57b5b7eee',
        
        uploadStatus : 1, //ready scanning uploading 
        
        percent : 0,
        
        processedSize : 0,
        
        //下面两个只是辅助用的，因为两个worker算的进度不一样，需要取最小值作为实际进度
        processedSizeSha : 0,
        
        processedSizeMd5 : 0,
        
        errType : 1,
        
        errCode : 0,
        
        errMsg : '',
        
        workerPath : '../dist/ftn.h5.alg-worker.js'
    };
    
    function FileInfo(options){
        options = options || {};
        
        $.extend(this, defaultOptions, options);
    }
    
    return FileInfo;
});