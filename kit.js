var Kit = function(args){
    var self = this;
    this.cur_id = 0;
    this.name = "";
    this.id = "";
    this.raw = "";

    
    this.editor = CodeMirror.fromTextArea(args['input'], {
	    lineNumbers: true,
	    styleActiveLine: true,
	    readOnly: false, 
	    gutters: ["CodeMirror-linenumbers"]
    });
    this.editor.setOption("theme", "default");
    this.editor.kit_instance = this;
    this.editor.setValue(this.raw);
    this.editor.setSize(null, "75%");
    //this.editor.setSize(null, (this.raw.split("\n").length + 2)*(this.editor.defaultTextHeight()) + 10);
    
    this.plugins = Kit.test_plugins;
    this.output = args.output;
    // Set up keys from plugins and defaults: 
    
    var key_dict = this.plugins.keys;
    // key_dict['Enter'] = function(cm) {
    // 	var ext = self.current_extension();
    // 	console.log(ext);
    // 	if(ext){
    // 	    if(!ext.plugin) return CodeMirror.Pass;
    // 	    // Find plugin by plugin id and show editor
    // 	}
    // 	else{
    // 	    return CodeMirror.Pass;
    // 	}
    // };
    key_dict['Ctrl-Enter'] = function(cm) {
	self.output(self.render());
    };
    
    this.editor.setOption("extraKeys", key_dict);
}

Kit.setup_plugins = function(plugins, base_url){
    var transforms = {};
    var keys = {};
    var buttons = {};
    for(var p in plugins){
	(function(p){
	    var req = new XMLHttpRequest();
	    req.onload = function(){
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet((new window.DOMParser()).parseFromString(this.responseText, "text/xml"));
		transforms[p] = {"xsl":xsltProcessor};
	    };
	    req.open("get", base_url+"/"+p+"/transform.xsl", true);
	    req.send();
	})(p);
    }
    for(var p in plugins){
	for(var i = 0; i < plugins[p].functions.length; i++){
	    var f = plugins[p].functions[i];
	    if(!(f.key in keys)) keys[f.key] = f.func;
	    if(!(f.name in buttons)) buttons[f.name] = f.func;
	}
    }
    return {"plugins":plugins,
	    "transforms":transforms,
	    "keys":keys,
	    "buttons":buttons}
}

Kit.test_plugins = Kit.setup_plugins({"argument":new KitArgumentPlugin(),
				      "av":new KitAVPlugin(),
				      //"guppy":new KitGuppyPlugin(),
				      "checklist":new KitChecklistPlugin(),
				      "code":new KitCodePlugin(),
				      //"category":new KitCategoryPlugin()
				     }, "./plugins");

Kit.prototype.gen_id = function(){
    return ++this.cur_id;
}

Kit.prototype.get_links = function(){

}

Kit.prototype.get_text = function(){

}

Kit.prototype.get_ids = function(){

}

Kit.prototype.set_doc = function(doc){
    var base = (new window.DOMParser()).parseFromString(doc, "text/xml").documentRoot;
    this.name = base.getAttribute("name");
    this.id = base.getAttribute("id");
    var text = "";
    for(var n = base.firstChild; n != null; n = n.nextSibling){
	text += (new XMLSerializer()).serializeToString(n);
    }
    this.editor.setValue(text);
}

Kit.prototype.render = function(){
    //var pars = this.editor.getValue().split(/[ \t]*\n([ \t]*\n)+/);
    // for(var i = 0; i < pars.length; i += 2){
    // 	var new_p = document.createElement("p");
    // 	new_p.appendChild(document.createTextNode(pars[i]));
    // 	output.appendChild(new_p);
    // }
    var doc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><node name=\"\">\n"+this.editor.getValue()+"\n</node>";
    var base = (new window.DOMParser()).parseFromString(doc, "text/xml");
    console.log(doc,base);
    for(var p in this.plugins.transforms){
	console.log(p);
	base = this.plugins.transforms[p].xsl.transformToDocument(base);
	console.log(base);
    }
    var output = document.createElement("span");
    // var exts = Kit.find_extensions(html_content);
    // console.log("LLL",exts.length);
    // for(var i = exts.length-1; i >= 0; i--){
    // 	var e = exts[i];
    // 	console.log(e);
    // 	if(e.plugin in this.plugins && e.id in this.plugin_data[e.plugin]){
    // 	    console.log(this.plugin_data[e.plugin][e.id].xml);
    // 	}
    // }
    output.innerHTML = (new XMLSerializer()).serializeToString(base);
    return output;
}














Kit.parse_extension = function(text,left,right){
    console.log(text);
    var matches = text.match(/^\[\[([a-zA-Z_][a-zA-Z_0-9]*)\.([a-zA-Z_][a-zA-Z_0-9]*)[ \t]*(?:\|[ \t]*(.*?))?\]\]/);
    if(!matches) return /^\[\[[a-zA-Z_][a-zA-Z_0-9]*\]\]/.test(text) ? {'plugin':text.substring(2,text.length-2),'left':left,'right':right} : {'plugin':null};
    return {'plugin':matches[1],'id':matches[2],'text':matches[3],'left':left,'right':right};
}

Kit.find_extensions = function(text){
    var re = /\[\[[a-zA-Z_][a-zA-Z_0-9]*\.[a-zA-Z_][a-zA-Z_0-9]*[ \t]*(\|[ \t]*.*?)?\]\]/g;
    var ans = [];
    var match;
    while((match = re.exec(text)) != null) {
	console.log(match.index);
	ans.push(Kit.parse_extension(match[0],match.index,match.index+match[0].length));
    }
    return ans;
}


Kit.prototype.current_extension = function(){
    var cursor = this.editor.getCursor();
    var text = this.editor.getLine(cursor.line);
    var left_delim = text.indexOf("[[");
    var right_delim = 0;
    var offset = left_delim;
    if(left_delim < 0) return null;
    while(left_delim >= 0){
	text = text.substring(left_delim);
	right_delim = text.indexOf("]]");
	console.log(text,left_delim,right_delim,cursor.ch);
	var left = offset;
	var right = right_delim >= 0 ? offset + right_delim + 2: -1;
	if(left < cursor.ch && cursor.ch < right){
	    console.log("Found it");
	    right_delim += 2;
	    text = text.substring(0,right_delim);
	    return Kit.parse_extension(text,left,right);
	}
	else{
	    text = text.substring(1);
	    left_delim = text.indexOf("[[");
	    offset += left_delim+1;
	}
    }
}

