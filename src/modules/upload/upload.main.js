
(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.UploadMain = factory(global);
    
})(window, function(global){
    
    var FTN_H5 = global.FTN_H5;
    var Emitter = FTN_H5.Emitter;
    var Util = FTN_H5.Util;
    
    var FileInfo = FTN_H5.FileInfo;
    
    var CONST_DEF = FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var emptyFn = function(){};
    
    function log(msg){
        /*
        if(window.console && console.log){
            console.log(msg);
        }
        */
    }
    
    var $ = window.jQuery;
    
    var defaultOptions = {
        onSelect : emptyFn,
        onStart : emptyFn,
        onScanProgress : emptyFn,
        onUploadStart : emptyFn,
        onUploadProgress : emptyFn,
        onSuccess : emptyFn,
        onCancel : emptyFn,
        onError : emptyFn,
        
        uploadInfo : {
            
        },
        
        triggerSelector : '.upload_file_input'
    };
    
    var uploadCoreObjMap = {
        
    };
    
    var _options = {
        
    };
    
    function onSelect(fio){
        log('onSelect ' + fio.name);
        _options.onSelect(fio);
    }
    
    function onStart(fio){
        log('onStart ' + fio.name);
        _options.onStart(fio);
    }
    
    function onScanProgress(fio){
        log('onScanProgress ' + fio.name + ' process:' + fio.processedSize);
        _options.onScanProgress(fio);
    }
    
    function onUploadStart(fio){
        log('onUploadStart ' + fio.name);
        _options.onUploadStart(fio);
    }
    
    function onUploadProgress(fio){
        log('onUploadProgress ' + fio.name);
        _options.onUploadProgress(fio);
    }
    
    function onSuccess(fio){
        log('onSuccess ' + fio.name);
        _options.onSuccess(fio);
    }
    
    function onCancel(fio){
        log('onCancel ' + fio.name);
        _options.onCancel(fio);
    }
    
    function onError(fio){
        log('onError ' + fio.name);
        _options.onError(fio);
    }
    
    function createUploadCore(file){
        var uniqueKey = Util.getUniqueKey();
        var fio = new FileInfo({
            uniqueKey : uniqueKey,
            file : file,
            name : file.name,
            size : file.size
        });
        
        var uc = new FTN_H5.UploadCore(fio);
        uc.onStart = onStart;
        uc.onScanProgress = onScanProgress;
        uc.onUploadStart = onUploadStart;
        uc.onUploadProgress = onUploadProgress;
        uc.onSuccess = onSuccess;
        uc.onCancel = onCancel;
        uc.onError = onError;
        
        uploadCoreObjMap[uniqueKey] = uc;
        return fio;
    }
    
    function initEvent(){
        $(document).on('change', _options.triggerSelector, function(e){
            var oe = e.originalEvent;
            var files = e.target.files;
            if(!files || files.length==0){
                return;
            }
            for(var i=0,len=files.length; i<len; i++){
                var fio = createUploadCore(files[i]);
                onSelect(fio);
            }
        });
    }
    
    var UploadMain = {
        
        inited : false,
        
        init : function(options){
            if(this.inited) return;
            this.inited = true;
            
            options = options || {};
            
            Util.extend(_options, defaultOptions, options);
            initEvent();
        },
        
        start : function(fio){
            var uniqueKey = fio.uniqueKey;
            var uc = uploadCoreObjMap[uniqueKey];
            if(uc){
                uc.start();
            }
        },
        
        cancel : function(fio){
            var uniqueKey = fio.uniqueKey;
            var uc = uploadCoreObjMap[uniqueKey];
            if(uc){
                uc.cancel();
            }
        },
        
        openSelectFileWindow : function(){
            
        },
        
        isSupport : function(){
            return true;
        }
    };
    
    return UploadMain;
});