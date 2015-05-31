/*
 * Crypto-JS v2.5.1
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2011 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */

importScripts('crypto-min.js');

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

/*
 * (c) 2011 by md5file.com. All rights reserved.
 */

self.hash = [1732584193, -271733879, -1732584194, 271733878, -1009589776];

self.addEventListener('message', function(event) {
    var data = event.data;
    var type = data.type;
    var content = data.content;
    hash_file(content.fileid, content.file);

}, false);

function hash_file(fileid, file) {
    
	
    function actionBuffer(resultOutput) {
        var block = resultOutput.block;
        handle_hash_block(block);
        
        if (resultOutput.sha_value) {
          console.log('sha : ' + resultOutput.sha_value);
          self.postMessage({
              type : 'scanover',
			  name : file.name,
			  size : file.size,
              sha : resultOutput.sha_value
          });
        } else {
			var desc = ((block.end * 100)/block.file_size).toFixed(2) + '%';
           
            self.postMessage({
                type : 'scaning',
                desc : desc
            });
			
        }
        /*
        if (resultOutput.sha_value) {
          $("#" + id).parent().html(event.data.result);
        } else {
          $("#" + id + ' .bar').text((event.data.block.end * 100 / event.data.block.file_size).toFixed(1) + '%');
        }
        */
    }

    function processBuffer(block, buf) {
        var uint8_array, message, nBitsTotal, output, nBitsLeft, nBitsTotalH, nBitsTotalL;

		var ab = buf;
		var abLen = ab.byteLength;
		var offLen = abLen % 4;
		if(offLen != 0){
			var abnew = new ArrayBuffer(abLen + 4 - offLen);
			var abnewv = new Uint8Array(abnew);
			abnewv.set(new Uint8Array(ab), 0);
			ab = abnew;
		}
		

		var dv = new DataView(ab);
		var tmpArr = [];
		var len = ab.byteLength >> 2;

		for(var i=0; i<len; i++){

			tmpArr[i] = dv.getUint32(i<<2);

		}
		message = tmpArr;
		
        //uint8_array = new Uint8Array(buf);
        //message = Crypto.util.bytesToWords(uint8_array);
		
		buf = null;
        uint8_array = null;
        output = {
            'block' : block
        };

        if (block.end === block.file_size) {
            nBitsTotal = block.file_size * 8;
            nBitsLeft = (block.end - block.start) * 8;

            nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
            nBitsTotalL = nBitsTotal & 0xFFFFFFFF;

            // Padding
            message[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            message[((nBitsLeft + 64 >>> 9) << 4) + 14] = nBitsTotalH;
            message[((nBitsLeft + 64 >>> 9) << 4) + 15] = nBitsTotalL;

            self.hash = sha1(message, self.hash);

            output.sha_value = Crypto.util.bytesToHex(Crypto.util.wordsToBytes(self.hash));
        } else {
            self.hash = sha1(message, self.hash);
        }
        message = null;

        actionBuffer(output);
        
    }

    var i, buffer_size, block,  reader, blob;

    function handle_load_block(event) {
        processBuffer(block, event.target.result);
    };
    
    function handle_hash_block(block) {
        if (block.end !== file.size) {
            block.start += buffer_size;
            block.end += buffer_size;

            if (block.end > file.size) {
                block.end = file.size;
            }
			//reader = null;
            //reader = new FileReader();
            //reader.onload = handle_load_block;
            blob = file.slice(block.start, block.end);

            reader.readAsArrayBuffer(blob);
        }
    };
    buffer_size = 2 * 1024 * 1024;
    block = {
        'file_size' : file.size,
        'start' : 0
    };

    block.end = buffer_size > file.size ? file.size : buffer_size;

    reader = new FileReader();
    reader.onload = handle_load_block;
    blob = file.slice(block.start, block.end);

    reader.readAsArrayBuffer(blob);
}
