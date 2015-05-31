(function(global, factory) {

    global.Sha1_calculator = factory();

})(self || window, function() {

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

    function sha1(m, hash) {
        var w = [];

        var H0 = hash[0], H1 = hash[1], H2 = hash[2], H3 = hash[3], H4 = hash[4];

        for (var i = 0; i < m.length; i += 16) {

            var a = H0, b = H1, c = H2, d = H3, e = H4;

            for (var j = 0; j < 80; j++) {

                if (j < 16) {
                    w[j] = m[i + j] | 0;
                } else {
                    var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                    w[j] = (n << 1) | (n >>> 31);
                }

                var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 : j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 : j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 : (H1 ^ H2 ^ H3) - 899497514);
                H4 = H3;
                H3 = H2;
                H2 = (H1 << 30) | (H1 >>> 2);
                H1 = H0;
                H0 = t;

            }
            H0 = (H0 + a) | 0;
            H1 = (H1 + b) | 0;
            H2 = (H2 + c) | 0;
            H3 = (H3 + d) | 0;
            H4 = (H4 + e) | 0;

        }

        return [H0, H1, H2, H3, H4];
    }

    //
    function Sha1_calculator(file_size) {
        this.reset();
        
        this.block.file_size = file_size;
    }


    Sha1_calculator.prototype = {
        init : function() {

        },
        reset : function(){
            this.hash = [1732584193, -271733879, -1732584194, 271733878, -1009589776];

            this.block = {
                file_size : 0,
                start : 0,
                end : 0
            };
        },
        update : function(buf) {
            var me = this;
            var block = me.block;
            var bufLen = buf.byteLength;
            var message, nBitsTotal, nBitsLeft, nBitsTotalH, nBitsTotalL;
            
            block.end += bufLen;
            
            message = me.bufToWords(buf);

            if (block.end === block.file_size) {
                nBitsTotal = block.file_size * 8;
                nBitsLeft = (block.end - block.start) * 8;

                nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
                nBitsTotalL = nBitsTotal & 0xFFFFFFFF;

                // Padding
                message[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
                message[((nBitsLeft + 64 >>> 9) << 4) + 14] = nBitsTotalH;
                message[((nBitsLeft + 64 >>> 9) << 4) + 15] = nBitsTotalL;

                me.hash = sha1(message, me.hash);

            } else {
                me.hash = sha1(message, me.hash);
            }
            message = null;
            
            block.start = block.end;
        },
        end : function() {
            var me = this;
            return bytesToHex(wordsToBytes(me.hash));
        },
        //将buf转换为 big-endian int array
        bufToWords : function(buf){
            var ab = buf;
            var abLen = ab.byteLength;
            var offLen = abLen % 4;
            if (offLen != 0) {
                var abnew = new ArrayBuffer(abLen + 4 - offLen);
                var abnewv = new Uint8Array(abnew);
                abnewv.set(new Uint8Array(ab), 0);
                ab = abnew;
            }

            var dv = new DataView(ab);
            var tmpArr = [];
            var len = ab.byteLength >> 2;

            for (var i = 0; i < len; i++) {
                tmpArr[i] = dv.getUint32(i << 2);
            }
            dv = null;
            ab = null;
            return tmpArr;
        }
    };

    return Sha1_calculator;

});
