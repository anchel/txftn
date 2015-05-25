function log(str){
    var el = document.getElementById('log_list');
    var oldHtml = el.innerHTML;
    el.innerHTML = oldHtml + ['<p>', str,'</p>'].join('');
}

$(function(){
    var uploadEl = document.getElementById('upload_file');
    uploadEl.onchange = function(e){
        var files = e.target.files;
        if(files){
            onselect(files, 'encode');
        }
    };
});

$(function(){
    var uploadEl = document.getElementById('decode_data');
    uploadEl.onchange = function(e){
        var files = e.target.files;
        if(files){
            onselect(files, 'decode');
        }
    };
});

function onselect(files, type){
    log(files.length);
    if(files.length > 0){
        var file = files[0];
        var fr = new FileReader();
        fr.onload = function(e){
            if('encode' == type){
                test_dict_encode(e.target.result);
            }else{
                test_dict_decode(e.target.result);
            }
        };
        fr.readAsArrayBuffer(file);
    }
}

function test_dict_encode(file){
    var dict = new Dict();
    
    dict.add({
        type : 'int',
        name : 'MagicNum',
        length : 4,
        value : 2882377846
    });
    
    dict.add({
        type : 'int',
        name : 'Cmd',
        length : 4,
        value : 1007
    });
    
    dict.add({
        type : 'int',
        name : 'SaveField',
        length : 4,
        value : 0
    });
    
    dict.add({
        type : 'string',
        name : 'F1',
        length : 2,
        value : '中国'
    });
    
    dict.add({
        type : 'arraybuffer',
        name : 'Filedata',
        length : file.byteLength,
        value : file
    });
    
    var buffer = dict.encode();
    
    var str = bufferToHexString(buffer);
    
    log(str);
}

function test_dict_decode(file){
    var dict = new Dict();
    
    dict.add({
        type : 'int',
        name : 'MagicNum',
        length : 4,
        value : 0
    });
    
    dict.add({
        type : 'int',
        name : 'Cmd',
        length : 4,
        value : 0
    });
    
    dict.add({
        type : 'int',
        name : 'SaveField',
        length : 4,
        value : 0
    });
    
    dict.add({
        type : 'int',
        name : 'bodyLen',
        length : 4,
        value : 0
    });
    
    dict.add({
        type : 'int',
        name : 'F1',
        length : 1,
        value : ''
    });
    
    dict.add({
        type : 'int',
        name : 'F2',
        length : 4,
        value : 0
    });
    dict.add({
        type : 'int',
        name : 'F3',
        length : 4,
        value : 0
    });
    
    dict.setBuffer(file);

    var json = dict.decode();
    log(JSON.stringify(json));
    
    var buffer = dict.encode();
    var str = bufferToHexString(buffer);
    
    log(str);
}
