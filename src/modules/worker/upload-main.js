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
    var uintmax = 4294967296;
    
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
        var dictRequestCommon = getRequestDataDictCommon(fio);  //请求用的数据字典
        var dictResponse = getReponseDataDict();  //返回用的数据字典
        
        var offsetParam = getRequestCommonBuffer(dictRequestCommon);
        
        console.log('offsetParam : ' + JSON.stringify(offsetParam));
        
        var xhr = new XMLHttpRequest();
        
        xhr.onload = function(e){
            
        };
        
        xhr.onerror = function(){
            
        };
        
        var fr = new FileReader(); //后续需要考虑firefox的 同步接口
        fr.onload = function(e){
            
            var dataBuffer = e.target.result;
            
            var hash = MD5_FACTORY.ArrayBuffer.hash(dataBuffer);
            
            var url = getPostUrl(fio, hash);
            var sendBuffer = getRequestSendBuffer(dictRequestCommon, dataBuffer, start, offsetParam);
            
            xhr.open('POST', url, false);  //async true false
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader('Accept', '*/*');
            xhr.setRequestHeader('Cache-Control', 'no-cache');
            xhr.send(sendBuffer);
            
            if(xhr.readyState == 4){
                var status = xhr.status; //200是正常
                
                if(status == 200){
                    var recvBuffer = xhr.response;
                    dictResponse.setBuffer(recvBuffer);
                    var json = dictResponse.decode();
                    console.log(json);
                }
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
                hex : true,
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
                hex : true,
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
                name : 'OffsetH', //偏移位 - 高位
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
                value : 0  //0-成功 其他-错误码
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
    
    /**
     * 构建公共头部初始buffer，并把相关修改字段的偏移量返回
     *  
     */
    function getRequestCommonBuffer(dictCommon){
        dictCommon.encode();
        var LenOffset = dictCommon.getItemOffset('Len');
        var OffsetOffset = dictCommon.getItemOffset('Offset');
        var OffsetHOffset = dictCommon.getItemOffset('OffsetH');
        var DataLenOffset = dictCommon.getItemOffset('DataLen');
        
        return {
            Len : LenOffset,
            Offset : OffsetOffset,
            OffsetH : OffsetHOffset,
            DataLen : DataLenOffset
        };
    }
    
    /**
     * 根据公共头部和数据buffer，构造请求用的buffer
     * 1、修改协议体长度
     * 2、修改Offset和OffsetH
     * 3、修改DataLen
     * 
     * ext : {
     *     Len : 12,
     *     Offset : xx,
     *     OffsetH : xx,
     *     DataLen : xx
     * }
     */
    function getRequestSendBuffer(dictCommon, dataBuffer, start, offsetParam){
        var commBuffer = dictCommon.buffer;
        var commBufferLen = commBuffer.byteLength;
        var dataBufferLen = dataBuffer.byteLength;
        
        var totalLen = commBufferLen + dataBufferLen;
        var sendBuffer = new ArrayBuffer(totalLen);
        
        var u8arr = new Uint8Array(sendBuffer);
        var commu8arr = new Uint8Array(commBuffer);
        var datau8arr = new Uint8Array(dataBuffer);
        u8arr.set(commu8arr, 0);
        u8arr.set(datau8arr, commBufferLen);
        
        var LenOffset = offsetParam.Len;
        var OffsetOffset = offsetParam.Offset;
        var OffsetHOffset = offsetParam.OffsetH;
        var DataLenOffset = offsetParam.DataLen;
        
        var dv = new DataView(sendBuffer);
        dv.setUint32(LenOffset, totalLen-16, false);  //这里图方便写死16个字节吧
        
        var startL = start % uintmax;
        var startH = Math.round(start / uintmax);
        dv.setUint32(OffsetOffset, startL, false);
        dv.setUint32(OffsetHOffset, startH, false);
        dv.setUint32(DataLenOffset, dataBufferLen, false);
        return sendBuffer;
    }
});