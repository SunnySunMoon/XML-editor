
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

//xml dom to js object 
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