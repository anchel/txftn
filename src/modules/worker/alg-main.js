/**
 *
 * worker的逻辑
 *  
 */

(function(global, factory){
    
    
    if (( typeof File !== 'undefined') && !File.prototype.slice) {
        if (File.prototype.webkitSlice) {
            File.prototype.slice = File.prototype.webkitSlice;
        }
        if (File.prototype.mozSlice) {
            File.prototype.slice = File.prototype.mozSlice;
        }
    }

    
    factory(global);
    
})(self || window, function(global){
    
    var self = global;
    
    var CONST_DEF = self.FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var MD5_FACTORY = self.SparkMD5;
    var SHA1_FACTORY_RUSHA = self.Rusha;  //这个更快，但只适用于2G以下
    var SHA1_FACTORY_CALCULATOR = self.Sha1_calculator;
    
    var defaultChunkSize = 2097152;  //2 * 1024 * 1024
    
    
    var uniqueKeyMap = {
        
    };
    
    function replyMsg(msg){
        self.postMessage(msg);
    }
    
    self.addEventListener('message', function(e){
        var data = e.data;
        if(typeof data.eventType == 'undefined') return;
        switch(data.eventType){
            case EventType.SEND.FILE_SCAN:
                scanFile(data);
                
                break;
            case EventType.SEND.FILE_SCAN_CANCEL:
                cancelScanFile(data);
                
                break;
            case EventType.SEND.BUF_SCAN:
                scanBuffer(data);
                
                break;
            default:
                break;
        }
        
    }, false);
    
    /**
     *  
     */
    function scanFile(data){
        var algtype = data.algType;
        if(algtype == AlgType.SHA1){
            scannFileSha1(data);
        }else{
            scanFileMd5(data);
        }
    }
    
    /**
     * 获取文件的 MD5 
     */
    function scanFileMd5(data){
        /*
         * 
         * fileInfo : {
         *     file : File,
         *     chunkSize : 2*1024*1024
         * }
         */
        var fileInfo = data.fileInfo;
        
        var file = fileInfo.file;
        var fileSize = file.size;
        var chunkSize = fileInfo.chunkSize || defaultChunkSize;
        
        var chunks = Math.ceil(fileSize / chunkSize);
        var currentChunk = 0;
        
        var alg = new MD5_FACTORY.ArrayBuffer();
        var start=0, end=0;
        
        var uniqueKey = data.uniqueKey;
        
        var fr = new FileReader(); //后续需要考虑firefox的 同步接口
        fr.onload = function(e){
            alg.append(e.target.result);
            
            currentChunk++;
            
            replyMsg({
                uniqueKey : uniqueKey,
                eventType : EventType.REPLY.SCAN_ING,  //进行中
                algType : data.algType,
                result : {
                    processed : end
                }
            });
            
            if(currentChunk == chunks){
                var hash = alg.end();
                
                releaseRes();
                
                replyMsg({
                    uniqueKey : uniqueKey,
                    eventType : EventType.REPLY.SCAN_SUCCESS,  //成功
                    algType : data.algType,
                    result : {
                        hash : hash
                    }
                });
            }else{
                next();
            }
        };
        
        fr.onerror = function(e){

        };
        
        fr.onabort = function(){
            
        };
        
        function next(){
            if(!uniqueKeyMap[uniqueKey+'_'+data.algType]){
                replyMsg({
                    uniqueKey : uniqueKey,
                    eventType : EventType.REPLY.SCAN_CANCEL,
                    algType : data.algType,
                    result : {
                        
                    }
                });
                releaseRes();
                return;
            }
            start = currentChunk * chunkSize;
            end = Math.min(fileSize, start+chunkSize);
            fr.readAsArrayBuffer(file.slice(start, end));
        }
        
        function releaseRes(){
            alg = null;
            fr.onabort = fr.onerror = fr.onload = null;
            fr = null;
        }
        
        
        uniqueKeyMap[uniqueKey+'_'+data.algType] = 1;
        
        replyMsg({
            uniqueKey : uniqueKey,
            eventType : EventType.REPLY.SCAN_START,
            algType : data.algType,
            result : {
                
            }
        });
        
        next();
    }
    
    //取消扫描
    function cancelScanFile(data){
        var uniqueKey = data.uniqueKey;
        if(typeof uniqueKeyMap[uniqueKey+'_'+data.algType] != 'undefined'){
            uniqueKeyMap[uniqueKey+'_'+data.algType] = 0; //置一个标志位为取消
        }
    }
    
    
    /**
     * 获取文件的 SHA1 
     */
    function scannFileSha1(data){
        /*
         * 
         * fileInfo : {
         *     file : File,
         *     chunkSize : 2*1024*1024
         * }
         */
        var fileInfo = data.fileInfo;
        
        var file = fileInfo.file;
        var fileSize = file.size;
        var chunkSize = fileInfo.chunkSize || defaultChunkSize;
        
        var chunks = Math.ceil(fileSize / chunkSize);
        var currentChunk = 0;
        
        var alg = new SHA1_FACTORY_RUSHA(chunkSize);
        if(fileSize > 2147483648){
            alg = new SHA1_FACTORY_CALCULATOR(fileSize);
        }
        alg.init();  //算法对象初始化
        
        var start=0, end=0;
        
        var uniqueKey = data.uniqueKey;
        
        var fr = new FileReader(); //后续需要考虑firefox的 同步接口
        fr.onload = function(e){
            alg.update(e.target.result);
            
            currentChunk++;
            
            replyMsg({
                uniqueKey : uniqueKey,
                eventType : EventType.REPLY.SCAN_ING,  //进行中
                algType : data.algType,
                result : {
                    processed : end
                }
            });
            
            if(currentChunk == chunks){
                var hash = alg.end();
                
                releaseRes();
                
                replyMsg({
                    uniqueKey : uniqueKey,
                    eventType : EventType.REPLY.SCAN_SUCCESS,  //成功
                    algType : data.algType,
                    result : {
                        hash : hash
                    }
                });
            }else{
                
                next();
            }
        };
        
        fr.onerror = function(e){
            replyMsg({
                uniqueKey : uniqueKey,
                eventType : EventType.REPLY.SCAN_ERROR,  //错误
                algType : data.algType,
                result : {
                    code : 111,
                    msg : 'read error'
                }
            });
            releaseRes();
        };
        
        fr.onabort = function(){
            
        };
        
        function next(){
            if(!uniqueKeyMap[uniqueKey+'_'+data.algType]){ //可能是被设置为取消状态了
                replyMsg({
                    uniqueKey : uniqueKey,
                    eventType : EventType.REPLY.SCAN_CANCEL,
                    algType : data.algType,
                    result : {
                        
                    }
                });
                releaseRes();
                return;
            }
            start = currentChunk * chunkSize;
            end = Math.min(fileSize, start+chunkSize);
            fr.readAsArrayBuffer(file.slice(start, end));
        }
        
        function releaseRes(){
            alg = null;
            fr.onabort = fr.onerror = fr.onload = null;
            fr = null;
        }
       
        uniqueKeyMap[uniqueKey+'_'+data.algType] = 1;
        
        replyMsg({
            uniqueKey : uniqueKey,
            eventType : EventType.REPLY.SCAN_START,
            algType : data.algType,
            result : {
                
            }
        });
        
        next();
    }
    
    /**
     *  
     */
    function scanBuffer(data){
        var algtype = data.algType;
        if(algtype == AlgType.SHA1){
            scanBufferSha1(data);
        }else{
            scanBufferMd5(data);
        }
    }
    
    function scanBufferMd5(data){
        /*
         * {
         *     buffer : buffer
         * }
         */
        var uniqueKey = data.uniqueKey;
        var bufferInfo = data.bufferInfo;
        
        var alg = MD5_FACTORY.ArrayBuffer.hash;
        
        var hash = alg(bufferInfo.buffer);
        replyMsg({
            uniqueKey : uniqueKey,
            eventType : EventType.REPLY.SCAN_SUCCESS,  //成功
            algType : data.algType,
            result : {
                hash : hash
            }
        });
    }
    
    function scanBufferSha1(data){
        
    }
    
    
});