
/* convert relative functions */

//delete non-element nodes, this function will be deleted cause 
//I need other types' nodes in the future
function preProcess(xml){
    for(let i=0; i<xml.childNodes.length; i++){
        if(xml.childNodes[i].nodeType !== 1){
            xml.removeChild(xml.childNodes[i]);
            i--;
        }
    }
}

//xml dom to js object , an op style
function xmlDomToJson(xml){
    //if this childNode is not element node , return null
    if(xml.nodeType != 1){
        return null;
    }
    let obj = {};
    /* obj has following attributes: 
    *   obj.xtag : the name of the xml element
    *   obj.text : the text of the xml element(if it has)
    *   obj[obj.xtag] : the childNodes of the xml element (object form)
    *   others are named by the xml element's attributes' names
    */

    obj.xtag = xml.nodeName;

    //replace the carriage returns, line feeds and spaces with ''
    let nodeText = (xml.textContent || '').replace(/(\r|\n)/g, "").replace(/^\s+|\s+$/g, "");
    if(nodeText && xml.childNodes.length == 1){
        obj.text = nodeText;
    }

    //convert the xml element's attributes
    if(xml.attributes.length > 0){
        for(let i=0; i<xml.attributes.length; i++){
            let attribute = xml.attributes[i];
            obj[attribute.nodeName] = attribute.nodeValue;
        }
    }

    //convert the xml element's childNodes
    let items = [];
    for(let i=0; i<xml.childNodes.length; i++){
        let node = xml.childNodes[i];
        let item = xmlDomToJson(node); //call recursion to convert childNodes 
        if(item){
            items.push(item); 
        }
    }
    /*even this node has no childs, it's corresponding object 
    *still own a children array attribute in order to add child
    * in the vue data object , if we want to add child to this 
    * node in the future .  I think this is a convenient solution.
    */
    obj[obj.xtag] = items;

    return obj;
}


//js object to xml dom  , an oo style
function JsonToXml() {
    this.result = [];
}
JsonToXml.prototype.spacialChars = ['&','<','>','\'','"'];
JsonToXml.prototype.validChars = ['&','<','>','\'','"'];
JsonToXml.prototype.toString = function () {
    return this.result.join('');
};
JsonToXml.prototype.replaceSpecialChar = function (s){
    for (let i=0; i<this.spacialChar.length; i++){
        s = s.replace(new RegExp(this.spacialChars[i],'g'),this.validChars[i]);
    }
    return s;
}
JsonToXml.prototype.appendText = function(s){
    s = this.replaceSpecialChar(s);
    this.result.push(s);
}
JsonToXml.prototype.appendAttr = function (key,value){
    this.result.push(' ' + key + '="' + value + '"');
}
JsonToXml.prototype.appendFlagBeginS = function (s) {
    this.result.push('<' + s);
}
JsonToXml.prototype.appendFlagBeginE = function (s){
    this.result.push('>');
}
JsonToXml.prototype.appendFlagEnd = function (s) {
    this.result.push('</' + s + '>');
}
JsonToXml.prototype.parse = function (json) {
    this.convert(json);
    return this.toString();
}
JsonToXml.prototype.convert = function (obj) {
    let nodeName = obj.xtag || "nameUndefined";
    this.appendFlagBeginS(nodeName);
    let arrayMap = {};
    for (let key in obj){
        let item = obj[key];
        if(key == 'xtag'){
            continue;
        }
        if(item.constructor == String){
            this.appendAttr(key, item);
        }
        if(item.constructor == Array){
            arrayMap[key] = item;
        }
    }
    this.appendFlagBeginE();
    for (let key in arrayMap){
        let items = arrayMap[key];
        for (let i=0; i<items.length; i++){
            this.convert(items[i]);
        }
    }
    this.appendFlagEnd(nodeName);
}

//export xml event
//declare
function fake_click(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
        );
    obj.dispatchEvent(ev);
}
//convert data to xml file
function export_raw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;

    var export_blob = new Blob([data]);

    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fake_click(save_link);
}