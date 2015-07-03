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
        
        checkkey : '4d1f640e4e7d642eb883692d6e77b662779ca20f3197e173d348d003262fc1dec71e813c1b7ee3e749af0e25997de9b1a1fc9ad9dcb1a4248f18d85df0c99705d204291de0bff9336336911d8daf45e76505bc69d1e21a94f05d16cd52e3a6439f721a92141fc58eb6861e6260c04937d8826d944f4efcc5410d5d1887848a62d1bd1b3da80e113e6f311e2b4b4fe74a4684980b114c92ea905328dc9c8b56e49c4d768b92c7b468e348d9d5c83c414eb7baa2df6bd93ff08bb1af4593263888c897cd81a357fe2e3fe1356d0ee86cd39c6d995888c40a576b166aa1bd781edfdd8ad0fc106e88e2680e9de31b72eef5bb3d23fe3bf772198f55f3a140766f0b08d65206dda5f6d84d7b67accea3a980a11bd3eb182932ecdccc359684a9fb6de8a6d8627f2fbadefc92d6c8969897ac',
        
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