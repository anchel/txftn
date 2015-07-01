/**
 *
 *
 */
(function(global, factory) {

    global.FTN_H5 = global.FTN_H5 || {};
    global.FTN_H5.Util = factory();

})(window, function() {
    
    var $ = window.jQuery;

    var uniqueKey = 0;

    var Util = {
        log : function(msg) {
            if (window.console && console.log) {
                console.log(msg);
            }
        },
        extend : function() {
            var arr = Array.prototype.slice.call(arguments);
            if (arr.length < 2)
                return arr[0];
            var target = arr[0];
            for (var i = 1, len = arr.length; i < len; i++) {
                var tmp = arr[i];
                for (var m in tmp) {
                    if (tmp.hasOwnProperty(m)) {
                        target[m] = tmp[m];
                    }
                }
            }
            return target;
        },
        inherit : function(childClass, parentClass) {
            var fn = function() {
            };
            fn.prototype = parentClass.prototype;
            childClass.prototype = new fn();
            childClass.prototype.constructor = childClass;
        },
        getUniqueKey : function() {
            return ++uniqueKey;
        },

        getGUID : function() {
            //上报侧需要“16位随机小写字母和数字组合”
            var key = '';
            for (var i = 1; i <= 16; i++) {
                key += Math.floor(Math.random() * 16.0).toString(16);
            }
            return key;
        },
        getSizeString : function(size, precision) {
            var K = 1024, M = K * 1024, G = M * 1024;
            precision || ( precision = 1);
            if (size < K) {
                return size + 'B';
            } else if (size < M) {
                return (size / K).toFixed(precision) + 'KB';
            } else if (size < G) {
                return (size / (M)).toFixed(precision) + 'MB';
            } else {
                return (size / (G)).toFixed(precision) + 'GB';
            }
        }, 
        
        ajax : function(settings) {
            !settings && ( settings = {});
            if ( typeof settings.type === 'string' && settings.type.toUpperCase() == 'POST') {
                Util.ajax.post(settings);
            } else {
                Util.ajax.get(settings);
            }
        }

    };
    ( function() {

            var jsonpObj, gcGet, paramToStr, createFunName, callError, callSuccess, callComplete, callBeforeSend;

            gcGet = function(callbackName, script) {
                script.parentNode.removeChild(script);
                window[callbackName] = undefined;
                try {
                    delete window[callbackName];
                } catch (e) {
                }
            };

            paramToStr = function(parameters, encodeURI) {
                var str = "", key, parameter;
                for (key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        key = encodeURI ? encodeURIComponent(key) : key;
                        parameter = encodeURI ? encodeURIComponent(parameters[key]) : parameters[key];
                        str += key + "=" + parameter + "&";
                    }
                }
                return str.replace(/&$/, "");
            };

            createFunName = function() {
                return "cb_" + Util.getGUID();
            };

            callError = function(callback, errorMsg) {
                if ( typeof (callback) !== 'undefined') {
                    callback(errorMsg);
                }
            };

            callSuccess = function(callback, data) {
                if ( typeof (callback) !== 'undefined') {
                    callback(data);
                }
            };

            callComplete = function(callback) {
                if ( typeof (callback) !== 'undefined') {
                    callback();
                }
            };

            callBeforeSend = function(callback) {
                if ( typeof (callback) !== 'undefined') {
                    callback();
                }
            };

            jsonpObj = {};
            jsonpObj.init = function(options) {
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        jsonpObj.options[key] = options[key];
                    }
                }
                return true;
            };

            jsonpObj.get = function(options) {
                options = options || {};
                var url = options.url, callbackParameter = options.callbackParameter || 'callback', parameters = options.data || {}, script = document.createElement('script'), callbackName = createFunName(), prefix = "?";

                if (!url) {
                    return;
                }

                parameters[callbackParameter] = callbackName;
                if (url.indexOf("?") >= 0) {
                    prefix = "&";
                }
                url += prefix + paramToStr(parameters, true);
                url = url.replace(/=\?/, '=' + callbackName);

                window[callbackName] = function(data) {
                    if ( typeof (data) === 'undefined') {
                        callError(options.error, 'Invalid JSON data returned');
                    } else {
                        callSuccess(options.success, data);
                    }
                    gcGet(callbackName, script);
                    callComplete(options.complete);
                };

                script.onerror = function() {
                    gcGet(callbackName, script);
                    callComplete(options.complete);
                    callError(options.error, 'Error while trying to access the URL');
                };

                callBeforeSend(options.beforeSend);
                script.setAttribute('src', url);
                document.getElementsByTagName('head')[0].appendChild(script);
            };

            Util.ajax.get = jsonpObj.get;
        }());

    /**
     * ajax跨域post扩展
     */
    ( function() {
            /**
             * FormSender通信器类,建议写操作使用
             *
             * @param {String}
             *          actionURL 请求地址
             * @param {String}
             *          [method] 发送方式，除非指明get，否则全部为post
             * @param {Object}
             *          [data] hashTable形式的字典
             * @param {String}
             *          [charset="gb2312"] 于后台数据交互的字符集
             * @constructor
             * @namespace FormSender
             *
             * cgi返回模板: <html><head><meta http-equiv="Content-Type" content="text/html; charset=gb2312" /></head> <body><script type="text/javascript"> document.domain="qq.com"; frameElement.callback({JSON:"Data"}); </script></body></html>
             * @example
             * var fs = new FormSender(APPLY_ENTRY_RIGHT,"post",{"hUin": getParameter("uin"),"vUin":checkLogin(),"msg":getElementById("msg-area").value, "rd": Math.random()}, "utf-8");
             *      fs.onSuccess = function(re) {};
             *      fs.onError = function() {};
             *      fs.send();
             *
             */
            FormSender = function(actionURL, method, data, charset) {

                /**
                 * form的名称，默认为 _fpInstence_ + 计数
                 *
                 * @type string
                 */
                this.name = "_fpInstence_" + FormSender.counter;
                FormSender.instance[this.name] = this;
                FormSender.counter++;

                var c = String(charset).toLowerCase();

                if ( typeof (actionURL) == 'object' && actionURL.nodeType == 1 && actionURL.tagName == 'FORM') {
                    this.instanceForm = actionURL;
                } else {// standard mode

                    /**
                     * 数据发送方式
                     *
                     * @type string
                     */
                    this.method = method || "POST";

                    /**
                     * 数据请求地址
                     *
                     * @type string
                     */
                    this.uri = actionURL;

                    /**
                     * 数据请求的编码格式
                     *
                     * @type string
                     */
                    this.charset = (c == 'utf-8' || c == 'gbk' || c == 'gb2312' || c == 'gb18030') ? c : 'gb2312';

                    /**
                     * 数据参数表
                     *
                     * @type object
                     */
                    this.data = ( typeof (data) == "object" || typeof (data) == 'string') ? data : null;

                }

                this._sender = null;

                /**
                 * 服务器正确响应时的处理
                 *
                 * @event
                 */
                this.onSuccess = function() {
                };

                /**
                 * 服务器无响应或预定的不正常响应处理
                 *
                 * @event
                 */
                this.onError = function() {
                };

                // 准备时间
                this.startTime = 0;

                // 成功回调时间
                this.endTime = 0;

                // 发送请求时间
                this.postTime = 0;
            };

            FormSender.instance = {};
            FormSender.counter = 0;

            FormSender._errCodeMap = {
                999 : {
                    msg : 'Connection or Server error'
                }
            };

            FormSender.pluginsPool = {
                "formHandler" : [],
                "onErrorHandler" : []
            };

            FormSender._pluginsRunner = function(pType, data) {
                var _s = FormSender, l = _s.pluginsPool[pType], t = data, len;

                if (l && ( len = l.length)) {
                    for (var i = 0; i < len; ++i) {
                        if ( typeof (l[i]) == "function") {
                            t = l[i](t) || data;
                        }
                    }
                }

                return t;
            };

            FormSender._clear = function(o) {
                o._sender = o._sender.callback = o._sender.errorCallback = null;

                if (Util.userAgent.safari || Util.userAgent.opera) {
                    setTimeout('$("#_fp_frm_' + o.name + '").remove()', 50);
                } else {
                    $("#_fp_frm_" + o.name).remove();
                }
                // 完成了一次请求
                o.endTime = +new Date;
                FormSender._pluginsRunner('onRequestComplete', o);
                o.instanceForm = null;
            };

            /**
             * 发送请求
             *
             * @return {Boolean} 是否成功
             */
            FormSender.prototype.send = function() {
                // 记录一个开始时间点
                this.startTime = +new Date;

                if (this._sender === null || this._sender ===
                void (0)) {
                    var timer, sender = document.createElement("iframe");

                    sender.id = sender.name = "_fp_frm_" + this.name;
                    sender.style.cssText = "width:0;height:0;border-width:0;display:none;";

                    sender.callback = (function(th) {
                        return function() {
                            th.resultArgs = arguments;
                            th.msg = 'ok';
                            th.onSuccess.apply(th, arguments);
                            FormSender._clear(th);
                        };
                    })(this);

                    var errcallback = (function(th) {
                        var f = function() {
                            th.resultArgs = arguments;
                            th.msg = FormSender._errCodeMap[999].msg;
                            FormSender._pluginsRunner('onErrorHandler', th);
                            FormSender._clear(th);
                            th.onError();
                        };
                        return function() {
                            // th.resultArgs存在则已触发成功回调了
                            // ie下如果src没设上则证明是初始化的
                            // 非ie如果进入这里则已经证明其出错了
                            if ( typeof th.resultArgs == 'object') {
                                return;
                            }
                            if (this.readyState == 'complete' || typeof this.readyState == 'undefined') {
                                if ('sended'.indexOf(this.state) > -1) {
                                    this.onload = this.onreadystatechange = null;
                                    f();
                                }
                            }
                        };
                    })(this);

                    document.body.appendChild(sender);
                    sender.errorCallback = errcallback;
                    sender.onload = sender.onreadystatechange = errcallback;
                    sender.state = 'initing';
                    this._sender = sender;
                }

                if (!this.instanceForm) {
                    var t = this, ie = Util.userAgent.ie, ifrurl, ifrHTML, data = t.data;
                    ifrHTML = '<!DOCTYPE html><html lang="zh-cn"><head><meta http-equiv="content-type" content="text/html; charset=' + t.charset + '" /><meta charset="' + t.charset + '" />';
                    if (ie) {
                        ifrurl = 'javascript:document.open();document.domain="' + document.domain + '";var me=parent.FormSender.instance["' + t.name + '"];document.write(me.ifrHTML);document.close();';
                    }
                    ifrHTML = ifrHTML + '<script type="text/javascript">' + (ie && ('document.charset="' + t.charset + '"') || '') + ';document.domain="' + document.domain + '";frameElement.submited=void(0);frameElement.state="sending";<\/script><\/head><body>';
                    ifrHTML = ifrHTML + '<form action="' + t.uri + '" accept-charset="' + t.charset + '" id="p" enctype="application/x-www-form-urlencoded;charset=' + t.charset + '" method="post">';
                    ifrHTML = ifrHTML + '<input type="hidden" name="qzreferrer" id="qzreferrer" />';
                    ifrHTML = ifrHTML + '<\/form><script type="text/javascript">var me=parent.FormSender.instance["' + t.name + '"],doc=document,f=doc.getElementById("p"),d=me.jsonData,fg=doc.createDocumentFragment();if(typeof d=="string"){var l=d.split("&");for(var i=0;i<l.length;i++){var kv=l[i].split("=");var ipt=doc.createElement("input");ipt.type="hidden";ipt.name=kv[0];ipt.value=decodeURIComponent(kv[1]);fg.appendChild(ipt);}}else{for(var i in d){var ipt=doc.createElement("input");ipt.type="hidden";ipt.name=i;ipt.value=d[i];fg.appendChild(ipt);}}f.appendChild(fg);doc.getElementById("qzreferrer").value=parent.location.href;f.submit();me.postTime=+new Date;frameElement.submited=true;frameElement.state="sended";<\/script><\/body><\/html>';
                    t.ifrHTML = ifrHTML;
                    t.ifrurl = ifrurl;
                    t.jsonData = data;
                    ie ? setTimeout((function(th) {
                        return function() {
                            th._sender.state = 'inited';
                            th._sender.src = th.ifrurl;
                        };
                    })(t), 10) : (sender.src = 'javascript:;');
                    if (!ie) {
                        var d = sender.contentDocument || sender.contentWindow.document;
                        if (d) {
                            d.open();
                            d.write(t.ifrHTML);
                            d.close();
                        }
                    }
                } else {
                    this.instanceForm.target = (sender.name = sender.id);
                    this._sender.submited = true;
                    this.instanceForm.submit();
                }
                return true;
            };

            /**
             * FormSender对象自毁方法，用法 ins=ins.destroy();
             *
             * @return {Object} null用来复写引用本身
             */
            FormSender.prototype.destroy = function() {
                var n = this.name;
                delete FormSender.instance[n]._sender;
                FormSender.instance[n]._sender = null;
                delete FormSender.instance[n];
                FormSender.counter--;
                return null;
            };

            /**
             * 重载ajax组件，支持跨域post请求
             */
            Util.ajax.post = function(settings) {
                var beforeSend = success = error = complete = function() {
                }, formSender, url, data, charset;

                url = settings.url;
                data = settings.data;
                charset = settings.charset || "utf-8";
                beforeSend = settings.beforeSend || beforeSend;
                success = settings.success || success;
                error = settings.error || error;
                complete = settings.complete || complete;

                formSender = new FormSender(url, 'POST', data, charset);
                formSender.onSuccess = function(json) {
                    success.apply(null, arguments);
                    complete();
                };
                formSender.onError = function() {
                    error.apply(null, arguments);
                    complete();
                };
                beforeSend();
                formSender.send();
            };
        }());

    /**
     * 浏览器判断引擎，给程序提供浏览器判断的接口
     */
    ( function() {
            var ua = Util.userAgent = {}, agent = navigator.userAgent, nv = navigator.appVersion, r, m, optmz;

            if (window.ActiveXObject) {// ie (document.querySelectorAll)
                /**
                 * IE版本号，如果不是IE，此值为 NaN
                 *
                 * @field
                 * @type number
                 * @static
                 * @name ie
                 */
                ua.ie = 6;

                (window.XMLHttpRequest || (agent.indexOf('MSIE 7.0') > -1)) && (ua.ie = 7);
                (window.XDomainRequest || (agent.indexOf('Trident/4.0') > -1)) && (ua.ie = 8);
                (agent.indexOf('Trident/5.0') > -1) && (ua.ie = 9);
                (agent.indexOf('Trident/6.0') > -1) && (ua.ie = 10);

                /**
                 * 当前的IE浏览器是否为beta版本
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name isBeta
                 */
                ua.isBeta = navigator.appMinorVersion && navigator.appMinorVersion.toLowerCase().indexOf('beta') > -1;
            } else if (document.getBoxObjectFor || typeof (window.mozInnerScreenX) != 'undefined') {
                r = /(?:Firefox|GranParadiso|Iceweasel|Minefield).(\d+\.\d+)/i;

                /**
                 * FireFox浏览器版本号，非FireFox则为 NaN
                 *
                 * @field
                 * @type number
                 * @static
                 * @name firefox
                 */
                ua.firefox = parseFloat((r.exec(agent) || r.exec('Firefox/3.3'))[1], 10);
            } else if (!navigator.taintEnabled) {// webkit
                m = /AppleWebKit.(\d+\.\d+)/i.exec(agent);

                /**
                 * Webkit内核版本号，非Webkit则为 NaN
                 *
                 * @field
                 * @type number
                 * @static
                 * @name webkit
                 */
                ua.webkit = m ? parseFloat(m[1], 10) : (document.evaluate ? (document.querySelector ? 525 : 420) : 419);

                if (( m = /(?:Chrome|CriOS).(\d+\.\d+)/i.exec(agent)) || window.chrome) {

                    /**
                     * Chrome浏览器版本号，非Chrome浏览器则为 NaN
                     *
                     * @field
                     * @type number
                     * @static
                     * @name chrome
                     */
                    ua.chrome = m ? parseFloat(m[1], 10) : '2.0';
                } else if (( m = /Version.(\d+\.\d+)/i.exec(agent)) || window.safariHandler) {

                    /**
                     * Safari浏览器版本号，非Safari浏览器则为 NaN
                     *
                     * @field
                     * @type number
                     * @static
                     * @name safari
                     */
                    ua.safari = m ? parseFloat(m[1], 10) : '3.3';
                }

                /**
                 * 当前页面是否为air client
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name air
                 */
                ua.air = agent.indexOf('AdobeAIR') > -1 ? 1 : 0;

                /**
                 * 是否为iPod客户端页面
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name isiPod
                 */
                ua.isiPod = agent.indexOf('iPod') > -1;

                /**
                 * 是否为iPad客户端页面
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name isiPad
                 */
                ua.isiPad = agent.indexOf('iPad') > -1;

                /**
                 * 是否为iPhone客户端页面
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name isiPhone
                 */
                ua.isiPhone = agent.indexOf('iPhone') > -1;
            } else if (window.opera) {// opera

                /**
                 * Opera浏览器版本号，非Opera则为 NaN
                 *
                 * @field
                 * @type number
                 * @static
                 * @name opera
                 */
                ua.opera = parseFloat(window.opera.version(), 10);
            } else if (/Trident\/\d+.+rv:(\d+\.\d+?)/i.test(agent)) {
                ua.ie = RegExp.$1;
            } else {// 默认IE6吧
                ua.ie = 6;
            }

            /**
             * 是否为MacOS
             *
             * @field
             * @type boolean
             * @static
             * @name macs
             */
            if (!(ua.macs = agent.indexOf('Mac OS X') > -1)) {

                /**
                 * Windows操作系统版本号，不是的话为NaN
                 *
                 * @field
                 * @type number
                 * @static
                 * @name windows
                 */
                ua.windows = (( m = /Windows.+?(\d+\.\d+)/i.exec(agent)), m && parseFloat(m[1], 10));

                /**
                 * 是否Linux操作系统，不是的话为false
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name linux
                 */
                ua.linux = agent.indexOf('Linux') > -1;

                /**
                 * 是否Android操作系统，不是的话为false
                 *
                 * @field
                 * @type boolean
                 * @static
                 * @name android
                 */
                ua.android = agent.indexOf('Android') > -1;
            }

            /**
             * 是否iOS操作系统，不是的话为false
             *
             * @field
             * @type boolean
             * @static
             * @name iOS
             */
            ua.iOS = agent.indexOf('iPhone OS') > -1;
            !ua.iOS && ( m = /OS (\d+(?:_\d+)*) like Mac OS X/i.exec(agent), ua.iOS = m && m[1] ? true : false);

        }());

    return Util;
});
