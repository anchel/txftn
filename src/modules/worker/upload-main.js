/**
 *  
 * 暂时不会用到
 * 
 */
(function(global, factory){
    
    factory(global);
    
})(self || window, function(global){
    
    var self = global;
    
    var CONST_DEF = self.FTN_H5.CONST_DEF;
    var EventType = CONST_DEF.EventType;
    var AlgType = CONST_DEF.AlgType;
    
    var MD5_FACTORY = self.SparkMD5;
    
    
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
            case EventType.SEND.FILE_UPLOAD:
                uploadFile(data);
                
                break;
            case EventType.SEND.FILE_UPLOAD_CANCEL:
                cancelUploadFile(data);
                
                break;
            default:
                break;
        }
        
    }, false);
    
    
    function uploadFile(data){
        var uniqueKey = data.uniqueKey;
        var fileInfo = data.fileInfo;
        
        var file = fileInfo.file;
        var fileSize = fileInfo.size;
        var chunkSize = fileInfo.chunkSize || defaultChunkSize;
        
        var chunks = Math.ceil(fileSize / chunkSize);
        var currentChunk = 0;
        
        var start = 0, end = 0;
            
        var fr = new FileReader(); //后续需要考虑firefox的 同步接口
        fr.onload = function(e){
            
            var fileBuffer = e.target.result;
            
            currentChunk++;
            
            replyMsg({
                uniqueKey : uniqueKey,
                eventType : EventType.REPLY.UPLOAD_ING,  //进行中
                result : {
                    processed : end
                }
            });
            
            if(currentChunk == chunks){
                releaseRes();
                
                replyMsg({
                    uniqueKey : uniqueKey,
                    eventType : EventType.REPLY.UPLOAD_SUCCESS,  //成功
                    result : {
                        
                    }
                });
            }else{
                
                next();
            }
        };
        
        fr.onerror = function(e){
            replyMsg({
                uniqueKey : uniqueKey,
                eventType : EventType.REPLY.UPLOAD_ERROR,  //错误
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
            if(!uniqueKeyMap[uniqueKey]){ //可能是被设置为取消状态了
                replyMsg({
                    uniqueKey : uniqueKey,
                    eventType : EventType.REPLY.UPLOAD_CANCEL,
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
            fr.onabort = fr.onerror = fr.onload = null;
            fr = null;
        }
       
        uniqueKeyMap[uniqueKey] = 1;
        
        replyMsg({
            uniqueKey : uniqueKey,
            eventType : EventType.REPLY.UPLOAD_START,
            result : {
                
            }
        });
        
        next();
    }
    
    
    function cancelUploadFile(data){
        var uniqueKey = data.uniqueKey;
        if(typeof uniqueKeyMap[uniqueKey] != 'undefined'){
            uniqueKeyMap[uniqueKey] = 0; //置一个标志位为取消
        }
    }
});