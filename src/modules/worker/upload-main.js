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
        
    }
    
    
    function cancelUploadFile(data){
        var uniqueKey = data.uniqueKey;
        if(typeof uniqueKeyMap[uniqueKey] != 'undefined'){
            uniqueKeyMap[uniqueKey] = 0; //置一个标志位为取消
        }
    }
});