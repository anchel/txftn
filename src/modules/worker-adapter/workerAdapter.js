/**
 * 有些浏览器（在手机浏览器上发现）的Worker不支持File，所以需要在主线程通过File 的slice将数据分割好，塞给Worker里去计算
 * @param {Object} global
 * @param {Object} factory
 * 
 */

(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.WorkerAdapter = factory(global);
    
})(window, function(global){
    
    var FTN_H5 = global.FTN_H5;
    var Emitter = FTN_H5.Emitter;
    var Util = FTN_H5.Util;
    
    var CONST_DEF = FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var plog = Util.log;
    
    
    
    /**
     * 
     * @param {Object} options
     * {
     *     path : 'http://aa.bb.cc/dd.js'
     * }
     * 
     */
    function WorkerAdapter(options){
        Emitter.call(this);
        
        this.worker = null;
        
        options = options || {};
        
        this.options = options;
        
        this.init();
    }
    
    Util.inherit(WorkerAdapter, Emitter);
    
    var prototype = {
        
        init : function(){
            var me = this;
            var options = me.options;
            var path = options.path;
            var worker = me.worker = new Worker(path);
            
            worker.addEventListener('message', function(e){
                var data = e.data;
                me._HandleMessage(data);
            }, false);
        },
        
        _HandleMessage : function(data){
            var me = this;
            var evType = data.eventType;
            var uniqueKey = data.uniqueKey;
            
            switch(evType){
                case EventType.REPLY.SCAN_START:
                    
                    //plog('scan start');
                    break;
                case EventType.REPLY.SCAN_ING:
                    var processed = data.result.processed;
                    
                    //plog('scan process');
                    break;
                case EventType.REPLY.SCAN_SUCCESS:
                
                    //plog('scan success ' + data.result.hash);
                    break;
                case EventType.REPLY.SCAN_CANCEL:
                
                    //plog('scan cancel');
                    break;
                case EventType.REPLY.UPLOAD_START:
                
                    //plog('upload start');
                    break;
                case EventType.REPLY.UPLOAD_ING:
                
                    //plog('upload process');
                    break;
                case EventType.REPLY.UPLOAD_SUCCESS:
                
                    //plog('upload success');
                    break;
                case EventType.REPLY.UPLOAD_CANCEL:
                    
                    //plog('upload cancel');
                    break;
                case EventType.REPLY.UPLOAD_ERROR:
                    
                    //plog('upload error');
                    break;
                default:
            }
            
            me.emit('message', data);  //告诉外面
        },
        
        postMessage : function(msg, callback){
            var me = this;
            if(!me.worker) return;

            me.worker.postMessage(msg);
        },
        
        calFileMd5 : function(fileInfo, callback){
            /*
            fileInfo : {
                uniqueKey : 1,
                file : file,
                chunkSize : 2097152
            }*/
            var msg = {
                uniqueKey : fileInfo.uniqueKey,
                eventType : EventType.SEND.FILE_SCAN,
                algType : AlgType.MD5,
                fileInfo : fileInfo
            };
            this.postMessage(msg, callback);
        },
        
        calFileSha1 : function(fileInfo, callback){
            var msg = {
                uniqueKey : fileInfo.uniqueKey,
                eventType : EventType.SEND.FILE_SCAN,
                algType : AlgType.SHA1,
                fileInfo : fileInfo
            };
            this.postMessage(msg, callback);
        },
        
        calBufferMd5 : function(bufferInfo, callback){
            /*
             * bufferInfo : {
             *     uniqueKey : 0,
             *     buffer : arraybuffer
             * }
             */
            var msg = {
                uniqueKey : bufferInfo.uniqueKey,
                eventType : EventType.SEND.BUF_SCAN,
                algType : AlgType.MD5,
                bufferInfo : bufferInfo
            };
            this.postMessage(msg, callback);
        },
        
        /**
         * 取消扫描文件 
         */
        cancelCal : function(uniqueKey, algType, callback){
            var msg = {
                uniqueKey : uniqueKey,
                eventType : EventType.SEND.FILE_SCAN_CANCEL,
                algType : algType
            };
            this.postMessage(msg, callback);
        },
        
        /**
         * 上传文件 
         */
        uploadFile : function(fileInfo){
            var msg = {
                uniqueKey : fileInfo.uniqueKey,
                eventType : EventType.SEND.FILE_UPLOAD,
                fileInfo : fileInfo
            };
            this.postMessage(msg);
        },
        
        /**
         * 取消上传文件
         */
        cancelUpload : function(uniqueKey){
            var msg = {
                uniqueKey : uniqueKey,
                eventType : EventType.SEND.FILE_UPLOAD_CANCEL
            };
            this.postMessage(msg);
        },
        
        terminate : function(){
            if(this.worker){
                this.worker.terminate();
                this.worker = null;
            }
        }
    };
    
    for(var m in prototype){
        if(prototype.hasOwnProperty(m)){
            WorkerAdapter.prototype[m] = prototype[m];
        }
    }
    
    return WorkerAdapter;
});
