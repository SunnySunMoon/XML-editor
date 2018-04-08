var bus = new Vue({});  //declare the communication bus

//tags component
Vue.component('recursion-tag',{
    name: 'tagCard',
    template: '\
    <div class="tagCard" :style="styleObj" @click.stop="collapse">\
        <i class="fa fa-plus" title="addChild" @click.stop="addChild"></i>\
        <p class="cardText"> {{ name }} </p>\
        <i class="fa fa-close" title="remove" @click.stop="handleClickRemove"></i>\
        <div v-for="(child,index) of childNodes" v-show="isOpen">\
            <recursion-tag :data=child :peers="childNodes" \
            @remove="removeThisTag" :self="index">\
            </recursion-tag>\
        </div>\
    </div>\
    ',
    props: {
        data: {//the object represented by the card
            type: Object  
        },
        self: {//the childNodes card's index in its peers
            type: Number,
            required: true
        },
        peers: {// the childNodes card's peers array
            type: Array,
            required: true
        }
    },
    data (){
        return {
            isOpen: false,  //mark the collapse status
        }
    },
    computed: {
        name (){
            if(this.data && this.data.xtag){
                return this.data.xtag;
            }else{
                return ''
            }
        },
        styleObj (){
            if(this.isOpen){
                return {
                    'height': 'auto',
                    'line-height': 'normal',
                    'overflow-y': 'auto'
                }
            }else{
                return {}
            }
        },
        childNodes (){ //this card's children's data, a referrence of props
            for(let x in this.data){
                if(this.data[x] instanceof Array){
                    return this.data[x];
                }
            }
            return [];
        },
    },
    methods: {
        collapse (){
            this.isOpen = !this.isOpen;
            let that = this;
            bus.$emit('click-tag',that.data);
        },
        handleClickRemove (){
            this.$emit('remove',this.self);
        },
        removeThisTag (indexNum) {
            console.log('child index: '+indexNum,'peers: ',this.childNodes)
            this.childNodes.splice(indexNum,1);
            bus.$emit('clear-attributes');
        },
        addChild () {
            let that = this;
            bus.$emit('add-tag',that.data);
            this.isOpen = true; 
        }
    }
});

//attributes component
Vue.component('attribute-item',{
    template: '\
    <div>\
        <p class="inline" v-show="!isEdit">\
            {{ name }} : {{ value }} \
        </p>\
        <i class="fa fa-close" title="remove" @click="remove"></i>\
        <i class="fa fa-edit" title="edit" @click="edit"></i>\
        <div v-show="isEdit">\
            <input autofocus="autofocus"\
                :value="value" ref="input" @keyup.enter="change">\
            <i class="fa fa-check" @click="change"></i>\
        </div>\
    </div>',
    props: {
        value: String,
        name: String,
    },
    data (){
        return {
            isEdit: false,
        }
    },
    methods: {
        remove() {
            this.$emit('edit',{
                editWay:'remove',
                name:this.name,
                value:this.value});
        },
        edit() {
            this.isEdit = true;
        },
        change() {
            if(this.$refs.input.value == ''){
                alert('Please input some value!');
                return;
            }
            this.$emit('edit',{
                editWay: 'change',
                name: this.name,
                value: this.$refs.input.value,
            });
            this.isEdit = false;
        }
    }
})


//declare the head 
var head = new Vue({
    el: '#head',
    data: {
        xmlObject: null
    },
    methods: {
        readXML() {
            let reader = new FileReader();
            let fileDom = this.$refs.fileInput;
            //change the text on button. display the selected xml file's name
            this.$refs.importButtonText.textContent = fileDom.files[0].name;

            reader.readAsText(fileDom.files[0]); //read as string
            //when the reading process is over , callback:
            let that = this;
            reader.onload = function(){
                let domParser = new DOMParser();
                let xmlDom = domParser.parseFromString(reader.result,'application/xml');
                preProcess(xmlDom);
                that.xmlObject = null;
                that.xmlObject = xmlDomToJson(xmlDom.childNodes[0]); 
                console.log(that.xmlObject);
                //emit event to let the main instance get the data and dispatch to the recursion component   
                bus.$emit('get-data',that.xmlObject); 
            }
        },
        exportXML() {
            let result = this.xmlObject;
            let parser = new JsonToXml();
            result = parser.parse(result);
            console.log(result);
            export_raw('file.xml',result);
        }
    }
});

//declare the body
var main = new Vue({
    el: '#body',
    data: {
        xmlObject: {
            xtag: 'Root',
            Root: [], // the initial tag's childnodes array object
        },
        clickedTag: {},  
        isAddAttr: false,
        newAttrName: 'newName',
        newAttrValue: 'newValue',
    },
    methods: {
        editAttribute(data){
            switch(data.editWay){
                case 'remove':
                    if(data.name == 'xtag'){
                        alert('xtag should not be removed !')
                        return
                    } 
                    this.$delete(this.clickedTag,data.name);
                    break;
                case 'change':
                    this.$set(this.clickedTag,data.name,data.value);
            }
        },
        saveNewAttr(){
            this.$set(this.clickedTag,this.newAttrName,this.newAttrValue);
            this.isAddAttr = false;
        },
        removeRoot(){
            this.xmlObject = {};
            this.clickedTag = {};
        }

    },
    mounted (){
        let that = this;
        bus.$on('get-data',function(data){
            that.xmlObject = data;
        });
        bus.$on('click-tag',function(data){
            that.clickedTag = data;
        });
        bus.$on('clear-attributes',function(){
            that.clickedTag = {};
        });
        bus.$on('add-tag',function(data){
            that.clickedTag = data;
            for(let x in that.clickedTag){
                if(that.clickedTag[x] instanceof Array){
                    that.clickedTag[x].unshift({
                        xtag: 'newTag',
                        text: '',
                        newTag: [], //new tag's childnodes array object
                    });
                }
            }
        })
    }
})

