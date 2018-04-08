var myKit = {
    //字符串类型ajax函数, 目前只支持GET \ POST
    /* XMLHttpRequest 的 readyState 值：
     * 0 : 未初始化， 即尚未调用open
     * 1 : 初始化， 即尚未调用send
     * 2 : 发送数据，即已经调用send
     * 3 : 数据传送中。
     * 4 : 完成。(不等于成功)
    */
    sendTextAjax: function (interface, sendData, func) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = '';
        //get and process data
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 1) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                xhr.setRequestHeader('Content-Type','application/json');
            }
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.statuss == 304) {
                    let data = xhr.response;
                    if (func) {
                        func(data);
                    }
                } else {
                    if (interface.alertMessage) {
                        alert(interface.alertMessage + ' ' + xhr.status);
                    }
                }
            }
        }
        //send data
        if (typeof sendData == 'object') {
            sendData = JSON.stringify(sendData);
        }
        if (interface.type == "GET" || interface.type == 'get') {
            xhr.open("GET", interface.url + "?data=" + sendData, true);
        } else {
            xhr.open("POST", interface.url, true);
        }

        xhr.send(sendData);
    },

    //deep copy of array and object
    deepCopy: function (origin) {
        let copy = null; //声明副本
        if (origin.constructor === Array) { //check data type
            copy = [];
        } else if (origin.constructor === Object) {
            copy = {};
        }

        for (i in origin) {
            //Array和Object类型其原型链上均含Object构造函数
            if (origin[i] instanceof Object) {
                copy[i] = this.deepCopy(origin[i]); //对数组、对象类型的属性继续调用深拷贝函数
            } else {
                copy[i] = origin[i];
            }
        }

        return copy;
    },

    //数字 快速排序
    quickSort: function (origin) {
        let a = this.deepCopy(origin);

        //转换类型
        for (let i = 0; i < a.length; i++) {
            if (!isNaN(parseFloat(a[i]))) {
                a[i] = parseFloat(a[i]);
            }
        }

        //终止条件：(子)数组内只剩下一个元素
        if (a.length <= 1) {
            return a;
        }

        let flagIndex = Math.floor(a.length / 2);
        let flag = a.splice(flagIndex, 1)[0];
        let left = []; //存放小于flag的元素
        let right = []; //存放大于flag的元素

        for (let i = 0; i < a.length; i++) {
            if (a[i] < flag) {
                left.push(a[i]);
            } else {
                right.push(a[i]);
            }
        }

        //递归条件
        return this.quickSort(left).concat(flag, this.quickSort(right));
    },

    //对象数组排序  根据属性名
    objectSort: function (origin, prop) {
        let a = this.deepCopy(origion);

        //转换类型
        for (let i = 0; i < a.length; i++) {
            if (!isNaN(parseFloat(a[i][prop]))) {
                a[i][prop] = parseFloat(a[i][porp]);
            }
        }

        //结束条件
        if (a.length <= 1) {
            return a;
        }

        let flagIndex = Math.floor(a.length / 2);
        let flag = a.splice(flagIndex, 1)[0];
        let left = [];
        let right = [];

        for (let i = 0; i < a.length; i++) {
            if (a[i][prop] < flag[prop]) {
                left.push(a[i]);
            } else {
                rigth.push(a[i]);
            }
        }
        return this.objectSort(left).concat(flag, this.quickSort(right));
    },

    //获取当日日期字符串函数
    getDate: function(){
        var a = new Date();
        var year = a.getFullYear();
        var month = a.getMonth() + 1;
        if(month < 10){
            month = '0' + month;
        }
        var date = a.getDate();
        if(date < 10){
            date = '0' + date;
        }
        var b = year + '-' + month + '-' + date;
        return b;
    }
}
