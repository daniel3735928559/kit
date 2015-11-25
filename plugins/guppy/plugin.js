KitGuppyPlugin = function(kit){
    this.kit = kit;
    var self = this;
    var req = new XMLHttpRequest();
    req.onload = function(){
	var xsltProcessor = new XSLTProcessor();
	xsltProcessor.importStylesheet((new window.DOMParser()).parseFromString(this.responseText, "text/xml"));
	self.xslt = xsltProcessor;
    };
    req.open("get", "plugins/guppy/transform.xsl", true);
    req.send();

    this.widgets = {};
    this.guppies = {};
    
    this.functions = [
	{'key':'Shift-Alt-M',
	 'name':'Math',
	 'tag':"math",
	 'text':false,
	 'func': function(cm) {
	     var id = cm.kit_instance.gen_id();
	     cm.replaceSelection("<math id=\""+id+"\">\n</math>");
	     self.make_widget(id);
	     var cur = cm.getCursor();
	     cm.addLineWidget(cur.line-1, self.widgets[id], {coverGutter: false, noHScroll: true});
	     
	 }}
    ];
}

KitGuppyPlugin.prototype.make_widget = function(id){
    var widget = document.createElement("div");
    // var self = this;
    // var width = 300;
    // var height = 300;
    // widget.style.position = "absolute";
    widget.style.height = "50px";
    widget.style.width = "500pxpx";
    // widget.style.border = "1px solid black";
    // widget.style.cursor = "pointer";
    widget.setAttribute('id', 'guppy'+id);
    this.widgets[id] = widget;
    this.guppies[id] = new Guppy(widget);
}

KitGuppyPlugin.prototype.cleanup = function(id){
    if(id in this.widgets){
	var widget = this.widgets[id];
	widget.parentNode.removeChild(widget);
    }
}

KitGuppyPlugin.prototype.render = function(node, doc){

    if(!this.xslt) return;
    var node_doc = document.implementation.createDocument("", "", null);
    node_doc.appendChild(node);
    console.log("BD",node_doc);
    return this.xslt.transformToFragment(node_doc, doc);
    
    var id = node.getAttribute("id");
    var canvas = this.widgets[id].getElementsByTagName("canvas")[0];
    var data = canvas.toDataURL();
    console.log("DATA",id,data)
    var img = document.createElement("img");
    img.setAttribute("src",data);
    img.setAttribute("border","1px");
    return img;
}

KitGuppyPlugin.prototype.edit = function(){ return ["",""] }

KitGuppyPlugin.prototype.insert = function(){
    var start = "<draw>";
    var end = "</draw>";
    return {"data":start+end,"cursor":start.length};
}
