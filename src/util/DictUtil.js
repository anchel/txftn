

(function(global){
    
    
    
    /**
     * fieldMap = 
     * {
     *     bodyLen : {
     *         index : 0, //the index in the dict
     *         type : [int string arraybuffer]
     *         name : 'bodyLen',
     *         length : 2,
     *         value : 23 or 'abc' or buffer,
     *         encoding : 'utf-8' //needed when string
     *     },
     *     MagicNum : {
     *         index : 1,
     *         type : int,
     *         name : 'MagicNum',
     *         length : 4,
     *         value : 2882377846,
     *         littleEndian : false
     *     },
     *     UKeyLen : {
     *         index : 2,
     *         type : int,
     *         name : 'UKeyLen',
     *         length : 2,
     *         value : 0,
     *         littleEndian : false,
     *         calFieldName : 'UKey'
     *     }
     * }
     */
    function Dict(){
        this.buffer = null;
        this.byteTotalLength = 0;
        
        this.fieldNum = 0;
        this.fieldMap = {};
    }
    
    Dict.prototype = {
        add : function(name, field){
            var me = this;
            me.fieldMap[name] = field;
            
            field.index = me.fieldNum++;
        },
        
        remove : function(){
            
        },
        
        setBuffer : function(buf){
            this.buffer = buf;
            this.byteTotalLength = this.buffer.byteLength;
        },
        
        fixEncodeField : function(){
            var me = this;
            var fieldMap = me.fieldMap;
            for(var fieldName in fieldMap){
                if(fieldMap.hasOwnProperty(fieldName)){
                    var field = fieldMap[fieldName];
                    if(field.calFieldName){  //该字段的值是另一个字段的长度
                        var calFieldName = field.calFieldName;
                        if(fieldMap[calFieldName]){
                            var calField = fieldMap[calFieldName];
                            field.value = calField.length;
                        }
                    }
                    
                    if(field.type == 'string'){ //自动将string -> arraybuffer
                        var buffer = stringToBuffer(field.value, field.encoding);
                        field.type = 'arraybuffer';
                        field.length = buffer.byteLength;
                        field.value = buffer;
                    }
                    
                    if(field.type == 'arraybuffer'){
                        field.length = field.value.byteLength;
                    }
                }
            }
        },
        
        calTotalLength : function(){
            var me = this;
            var fieldMap = me.fieldMap;
            var length = 0;
            for(var fieldName in fieldMap){
                if(fieldMap.hasOwnProperty(fieldName)){
                    var field = fieldMap[fieldName];
                    length += field.length;
                }
            }
            me.byteTotalLength = length;
        },
        /*
         * build a buffer
         */
        encode : function(){
            var me = this;
            me.fixEncodeField();
            me.calTotalLength();
            var arr = me.getFieldArray();
            var byteTotalLength = me.byteTotalLength;
            var buffer = new ArrayBuffer(byteTotalLength);
            var view = new DataView(buffer);
            
            
            var offset = 0;
            for(var i=0,len=arr.length; i<len; i++){
                var field = arr[i];
                if(field.length <= 0) continue;
                switch(field.type){
                    case 'int':
                        offset = me.encodeIntField(view, field, offset);
                        break;
                    
                    case 'arraybuffer':
                        offset = me.encodeArrayBufferField(view, field, offset);
                        break;
                    
                    case 'string':
                        offset = me.encodeStringField(view, field, offset);
                        break;
                    
                    default:
                        
                        
                }
            }
            me.buffer = buffer;
            return buffer;
        },
        
        encodeIntField : function(view, field, offset){
            var length = field.length;
            if(length == 1){
                view.setUint8(offset, field.value, field.littleEndian);
            }else if(length == 2){
                view.setUint16(offset, field.value, field.littleEndian);
            }else if(length == 4){
                view.setUint32(offset, field.value, field.littleEndian);
            }else{
                alert('encodeIntField: length invalid');
            }
            return offset + length; //return the new offset
        },
        
        encodeArrayBufferField : function(view, field, offset){
            var length = field.length;
            var u8arr = new Uint8Array(view.buffer);
            var fiedu8arr = new Uint8Array(field.value);
            u8arr.set(fiedu8arr, offset);
            return offset + length;
        },
        
        /**
         * in most case , use arraybuffer instead of string 
         */
        encodeStringField : function(view, field, offset){
            var length = field.length;
            var u8arr = new Uint8Array(view.buffer);
            var buf = stringToBuffer(field.value);
            var fiedu8arr = new Uint8Array(buf);
            u8arr.set(fiedu8arr, offset);
            return offset + length;
        },
        
        /*
         * decode to a json
         */
        decode: function(){
            var me = this;
            
            var buffer = me.buffer;
            var arr = me.getFieldArray();
            if(!buffer || arr.length <= 0) return null;
            var view = new DataView(buffer);
            var u8arr = new Uint8Array(buffer);
            
            var offset = 0;
            for(var i=0,len=arr.length; i<len; i++){
                var field = arr[i];

                switch(field.type){
                    case 'int':
                        offset = me.decodeIntField(view, field, offset);
                        break;
                    
                    case 'arraybuffer':
                        offset = me.decodeArrayBufferField(view, field, offset);
                        break;
                    
                    case 'string':
                        offset = me.decodeStringField(view, field, offset);
                        break;
                    
                    default:   
                }
                
                
            }
            return me.fieldMap;
        },
        
        decodeIntField : function(view, field, offset){
            var me = this;
            var length = field.length;
            var value = 0;
            var offset_new = offset+length;
            if(view.byteLength < offset_new){ //the buffer'byteLength not enough to decode
                
            }else{
                if(length == 1){
                    value = view.getUint8(offset, field.littleEndian);
                }else if(length == 2){
                    value = view.getUint16(offset, field.littleEndian);
                }else if(length == 4){
                    value = view.getUint32(offset, field.littleEndian);
                }else{
                    alert('encodeIntField: length invalid');
                }
            }
            field.value = value;
            me.fixDecodeField(field);  //比如后面某个field的length依赖于这个，则需更新那个field.length
            return offset_new;
        },
        
        decodeArrayBufferField : function(view, field, offset){
            var me = this;
            var length = field.length;
            var offset_new = offset+length;
            if(view.byteLength < offset_new){ //the buffer'byteLength not enough to decode
                field.value = null;
            }else{
                var u8arr = new Uint8Array(view.buffer, offset, length);
                field.value = u8arr.buffer;
            }
            
            return offset_new;
        },
        
        decodeStringField : function(view, field, offset){
            var me = this;
            var length = field.length;
            var offset_new = offset+length;
            if(view.byteLength < offset_new){ //the buffer'byteLength not enough to decode
                field.value = '';
            }else{
                var u8arr = new Uint8Array(view.buffer, offset, length);
                field.value = bufferToString(u8arr.buffer, field.encoding);
            }
            
            return offset_new;
        },
        
        fixDecodeField : function(field){
            var me = this;
            var fieldMap = me.fieldMap;
            if(field.calFieldName){  
                var calFieldName = field.calFieldName;
                if(fieldMap[calFieldName]){
                    var calField = fieldMap[calFieldName];
                    calField.length = field.value;
                }
            }
        },
        
        getFieldArray : function(){
            var me = this;
            var fieldMap = me.fieldMap;
            var arr = [];
            for(var fieldName in fieldMap){
                if(fieldMap.hasOwnProperty(fieldName)){
                    var field = fieldMap[fieldName];
                    arr.push(field);
                }
            }
            //sort by index
            arr.sort(function(a, b){
                return a.index - b.index;
            });
            return arr;
        }
    };
    
    global.Dict = Dict;
    
})(window);

