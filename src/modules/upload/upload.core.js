
(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.UploadCore = factory(global);
    
})(window, function(global){
    
    var FTN_H5 = global.FTN_H5;
    var Emitter = FTN_H5.Emitter;
    var Util = FTN_H5.Util;
    
    var WorkerAdapter = FTN_H5.WorkerAdapter;
    
    var CONST_DEF = FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var $ = window.jQuery;
    
    var methodArr = ['onStart', 'onScanProgress', 'onUploadStart', 'onUploadProgress', 'onSuccess', 'onCancel', 'onError',];
    var emptyFn = function(){};
    
    /**
     * 
     * @param {Object} fio
     * {
     *     
     * }
     * 
     */
    function UploadCore(fio){
        Emitter.call(this);
        
        this.fio = fio || {};
        
        for(var i=0,len=methodArr.length; i<len; i++){
            var m = methodArr[i];
            this[m] = emptyFn;
        }
        
        this._init();
    }
    
    Util.inherit(UploadCore, Emitter);
    
    var prototype = {
        
        _init : function(){
            var me = this;
            me.on('uploadevent', function(data){
                var evtName = data.name;
                var param = me.fio;
                if(me[evtName]){
                    me[evtName](param);
                }
            });
            
            /*
             * 每次计算完md5 或者 sha 都会触发该函数
             */
            me.on('algfinish', function(data){
                me._onAlgFinish(data);
            });
        },
        
        start : function(){
            var me = this;
            
            me.createWorkerAdapter();
            
            me.emit('uploadevent', {
                name : 'onStart'
            });
            
            me.scanFile();
        },
        
        cancel : function(){
            
        },
        
        getVid : function(){
            
        },
        
        /*
         * 每次计算完md5 或者 sha 都会触发该函数
         */
        _onAlgFinish : function(data){
            var fio = this.fio;
            var algType = data.algType;
            var hash = data.result.hash;
            if(algType == AlgType.SHA1){
                fio.sha = hash;
            }else{
                fio.md5 = hash;
            }
            
            //如果md5和sha1的值都计算完了，则进行下一步获取vid
            if(fio.sha && fio.md5){
                this.getVid();
            }
        },
        
        _handleMessage : function(data){
            var me = this;
            var fio = me.fio;
            var evType = data.eventType;
            var uniqueKey = data.uniqueKey;
            
            switch(evType){
                case EventType.REPLY.SCAN_START:
                    
                    
                    break;
                case EventType.REPLY.SCAN_ING:
                    var processed = data.result.processed;
                    fio.processedSize = processed;
                    me.emit('uploadevent', {
                        name : 'onScanProgress'
                    });
                    
                    break;
                case EventType.REPLY.SCAN_SUCCESS:
                    
                    me.emit('algfinish', data);
                    break;
                case EventType.REPLY.SCAN_CANCEL:
                    me.emit('uploadevent', {
                        name : 'onCancel'
                    });
                    
                    break;
                    
                case EventType.REPLY.UPLOAD_START:
                
                    me.emit('uploadevent', {
                        name : 'onUploadStart'
                    });
                    break;
                case EventType.REPLY.UPLOAD_ING:
                
                    var processed = data.result.processed;
                    fio.processedSize = processed;
                    me.emit('uploadevent', {
                        name : 'onUploadProgress'
                    });
                    break;
                case EventType.REPLY.UPLOAD_SUCCESS:
                
                    
                    break;
                case EventType.REPLY.UPLOAD_CANCEL:
                    me.emit('uploadevent', {
                        name : 'onCancel'
                    });
                    break;
                case EventType.REPLY.UPLOAD_ERROR:
                    me.emit('uploadevent', {
                        name : 'onError'
                    });
                    break;
                default:
            }
        },
        
        createWorkerAdapter : function(){
            var me = this;
            //计算md5值的worker
            if(!me.waAlgMd5){
                me.waAlgMd5 = new WorkerAdapter({
                    path : me.fio.workerPath
                });
                me.waAlgMd5.on('message', function(data){
                    me._handleMessage(data);
                });
            }
            
            //计算sha值的worker
            if(!me.waAlgSha){
                me.waAlgSha = new WorkerAdapter({
                    path : me.fio.workerPath
                });
                me.waAlgSha.on('message', function(data){
                    me._handleMessage(data);
                });
            }
            
            //上传文件的worker
            if(!me.waUpload){
                me.waUpload = new WorkerAdapter({
                    path : me.fio.workerPath
                });
                me.waUpload.on('message', function(data){
                    me._handleMessage(data);
                });
            }
        },
        
        scanFile : function(){
            var me = this;
            var fio = me.fio;
            me.waAlgMd5.calFileMd5({
                file : fio.file,
                uniqueKey : fio.uniqueKey
            });
            me.waAlgSha.calFileSha1({
                file : fio.file,
                uniqueKey : fio.uniqueKey
            });
        },
        
        uploadFile : function(){
            
        }
    };
    
    for(var m in prototype){
        if(prototype.hasOwnProperty(m)){
            UploadCore.prototype[m] = prototype[m];
        }
    }
    
    return UploadCore;
});