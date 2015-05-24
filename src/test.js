function log(str){
    var el = document.getElementById('log_list');
    var oldHtml = el.innerHTML;
    el.innerHTML = oldHtml + ['<p>', str,'</p>'].join('');
}


function test_dict(file){
    var dict = new Dict();
    
    dict.add('MagicNum', {
        type : 'int',
        name : 'MagicNum',
        length : 4,
        value : 2882377846
    });
    
    dict.add('Cmd', {
        type : 'int',
        name : 'Cmd',
        length : 4,
        value : 1007
    });
    
    dict.add('SaveField', {
        type : 'int',
        name : 'SaveField',
        length : 4,
        value : 0
    });
    
    var buffer = dict.encode();
    
    var str = bufferToHexString(buffer);
    
    log(str);
}
