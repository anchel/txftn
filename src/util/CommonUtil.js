/**
 * convert arraybuffer to string 
 * only work with ASCII/one-byte characters 
 * 
 * include encoding.js,use like follow:
 * var str = TextDecoder(encoding).decode(uint8array);
 */
function bufferToString(buf, encoding){
    var view = new Uint8Array(buf);
    
    if(typeof(TextDecoder) == 'function'){
        var str = new TextDecoder(encoding || 'utf-8').decode(view);
        return str;
    }
    
    var narr = new Array(view.length);
    for(var i=0,len=view.length; i<len; i++){
       narr[i] = String.fromCharCode(view[i]);
    }
    return narr.join('');
}

/**
 * convert string to arraybuffer
 * only work with ASCII/one-byte characters 
 * 
 * include encoding.js,use like follow:
 * var uint8array = TextEncoder(encoding).encode(str);
 */
function stringToBuffer(str, encoding){
    //var arr = str.split('');
    if(typeof(TextEncoder) == 'function'){
        var uint8array = new TextEncoder(encoding || 'utf-8').encode(str);
        return uint8array.buffer;
    }
    var narr = new Array(str.length);
    for(var i=0,len=str.length; i<len; i++){
        narr[i] = str.charCodeAt(i);
    }
    var view = new Uint8Array(narr);
    return view.buffer;
}


function bufferToHexString(buf){
    var view = new Uint8Array(buf);
    var narr = [];
    for(var i=0,len=view.length; i<len; i++){
       var c = view[i].toString(16);
       if(c.length == 1) c = '0'+c;
       narr.push(c);
    }
    return narr.join(' ');
}