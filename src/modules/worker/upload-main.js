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
    var DataDict = self.FTN_H5.DataDict;
    
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
        var fio = data.fileInfo;
        
        var file = fio.file;
        var fileSize = fio.size;
        var chunkSize = fio.chunkSize || defaultChunkSize;
        
        var chunks = Math.ceil(fileSize / chunkSize);
        
        var start = 0, end = 0;
        
        var xhr = new XMLHttpRequest();
        
        xhr.onload = function(e){
            
        };
        
        xhr.onerror = function(){
            
        };
        
        var fr = new FileReader(); //后续需要考虑firefox的 同步接口
        fr.onload = function(e){
            
            var fileBuffer = e.target.result;
            
            var hash = MD5_FACTORY.ArrayBuffer.hash(fileBuffer);
            
            var url = getPostUrl(fio, hash);
            
            xhr.open('POST', url, false);
            xhr.responseType = 'arraybuffer';
            
            xhr.send(data);
            
            if(xhr.readyState == 4){
                var status = xhr.status; //200
            }
            
           
            
            replyMsg({
                uniqueKey : uniqueKey,
                eventType : EventType.REPLY.UPLOAD_ING,  //进行中
                result : {
                    processed : end
                }
            });
            
            /*
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
            */
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
            
            start = end;
            end = Math.min(fileSize, start+chunkSize);
            fr.readAsArrayBuffer(file.slice(start, end));
        }
        
        function releaseRes(){
            xhr.onload = xhr.onerror = null;
            xhr = null;
            
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
    
    function getPostUrl(fio, md5){
        //http://server ip/ftn_handler?bmd5=xx_32
        return ['http://', fio.serverip, ':', fio.serverport, '/ftn_handler?bmd5=', md5, '&_r=', (new Date()).valueOf()].join('');
    }
    
    //生成请求头部的公共部分
    function getRequestDataDictCommon(fio){
        var size = fio.size;
        var uintmax = 4294967296;
        var fileSize = size % uintmax;
        var fileSizeH = Math.round(size / uintmax);
        
        
        var checkkey = fio.checkkey;
        var sha = fio.sha;
        var md5 = fio.md5;
        
        var dict = new DataDict();
        dict.add([
            {
                type : 'int',
                name : 'MagicNum',
                length : 4,
                value : 2882377846 //0xABCD9876
            },
            {
                type : 'int',
                name : 'Cmd',
                length : 4,
                value : 1007
            },
            {
                type : 'int',
                name : 'SaveField',
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'Len',  //协议体长度
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'UKeyLen',
                length : 2,
                value : 0,
                calFieldName : 'UKey'
            },
            {
                type : 'string',
                name : 'UKey',  //服务器返回的checkkey
                length : 0,
                value : checkkey
            },
            {
                type : 'int',
                name : 'FileKeyLen',
                length : 2,
                value : 0,
                calFieldName : 'FileKey'
            },
            {
                type : 'string',
                name : 'FileKey',  //文件的sha值
                length : 0,
                value : sha
            },
            {
                type : 'int',
                name : 'FileSize',  //文件大小 - 低位
                length : 4,
                value : fileSize
            },
            {
                type : 'int',
                name : 'Offset', //偏移位 - 低位
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'DataLen',  //该次上传的数据块大小
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'file_sizeH', //文件大小 - 高位
                length : 4,
                value : fileSizeH
            },
            {
                type : 'int',
                name : 'offsetH', //偏移位 - 高位
                length : 4,
                value : 0
            }
        ]);
        return dict;
    }
    
    function getReponseDataDict(){
        var dict = new DataDict();
        dict.add([
            {
                type : 'int',
                name : 'MagicNum',
                length : 4,
                value : 2882377846 //0xABCD9876
            },
            {
                type : 'int',
                name : 'Cmd',
                length : 4,
                value : 1007
            },
            {
                type : 'int',
                name : 'SaveField',
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'Len',
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'Flag',
                length : 1,
                value : 0  //0-继续上传 1-上传完成
            },
            {
                type : 'int',
                name : 'NextOffset',
                length : 4,
                value : 0
            },
            {
                type : 'int',
                name : 'NextOffsetH',
                length : 4,
                value : 0
            }
        ]);
        return dict;
    }
});