
(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.UploadMain = factory(global);
    
})(window, function(global){
    
    var FTN_H5 = global.FTN_H5;
    var Emitter = FTN_H5.Emitter;
    var Util = FTN_H5.Util;
    
    var CONST_DEF = FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var emptyFn = function(){};
    
    var $ = window.jQuery;
    
    var defaultOptions = {
        onSelect : emptyFn,
        onStart : emptyFn,
        onScanProgress : emptyFn,
        onUploadStart : emptyFn,
        onUploadProgress : emptyFn,
        onSuccess : emptyFn,
        onError : emptyFn,
        
        
        triggerSelector : '.upload_file_input'
    };
    
    var uploadCoreObjMap = {
        
    };
    
    var _options = {
        
    };
    
    function createUploadCore(file){
        var uniqueKey = Util.getUniqueKey();
        var fio = {
            uniqueKey : uniqueKey,
            file : file
        };
        var uc = new FTN_H5.UploadCore(fio);
        uploadCoreObjMap[uniqueKey] = uc;
        return {
            uniqueKey : uniqueKey,
            name : file.name,
            size : file.size
        };
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
                _options.onSelect(fio);
            }
        });
    }
    
    var UploadMain = {
        
        inited : false,
        
        init : function(options){
            if(this.inited) return;
            options = options || {};
            
            Util.extend(_options, defaultOptions, options);
            initEvent();
        },
        
        start : function(fio){
            
        },
        
        cancel : function(fio){
            
        },
        
        isSupport : function(){
            return true;
        }
    };
    
    return UploadMain;
});