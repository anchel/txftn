/**
 * 一些常量的定义 
 */

(function(global, factory){
    
    global.FTN_H5 = global.FTN_H5 || {};
    FTN_H5.CONST_DEF = factory();
    
})(self || window, function(){
    var CONST_DEF = {
        EventType : {
            SEND : {
                FILE_SCAN : 11,
                FILE_SCAN_CANCEL : 12,
                BUF_SCAN : 21
            },
            REPLY : {
                SCAN_START : 11,
                SCAN_ING : 12,
                SCAN_SUCCESS : 13,
                SCAN_CANCEL : 14,
                SCAN_ERROR : 15,
                
                UPLOAD_START : 21,
                UPLOAD_ING : 22,
                UPLOAD_OVER : 23
            }
        },
        AlgType : {
            MD5 : 1,
            SHA1 : 2
        }
    };
    
    return CONST_DEF;
});
