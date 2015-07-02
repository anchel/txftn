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

/***
 * hex to string
 *  
 */
function hexToString(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function hexToBuffer(hexx) {
    var hex = hexx.toString();//force conversion
    var arr = [];
    for (var i = 0; i < hex.length; i += 2){
        arr.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(arr).buffer;
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
    var uint8 = new Uint8Array(buf);
    return bytesToHex(uint8);
    /*
    var narr = [];
    for(var i=0,len=view.length; i<len; i++){
       var c = view[i].toString(16);
       if(c.length == 1) c = '0'+c;
       narr.push(c);
    }
    return narr.join(' ');
    */
}

// Convert big-endian 32-bit words to a byte array
function wordsToBytes(words) {
    for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

