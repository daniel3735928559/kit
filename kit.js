var Kit = function(args){
    var self = this;
    this.cur_id = 0;
    this.name = "";
    this.id = "";
    this.raw = "";
    
    this.editor = CodeMirror.fromTextArea(args.input, {
	lineNumbers: true,
	mode: "text/xml",
	styleActiveLine: true,
	readOnly: false, 
	foldGutter: true,
	gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });
    this.editor.setOption("theme", "default");
    this.editor.kit_instance = this;
    this.editor.setValue(this.raw);
    this.editor.setSize(null, "75%");
    this.editor.on("beforeChange", function (cm, change) {
	var cur = cm.getCursor();
	var tag = CodeMirror.findMatchingTag(cm, change.from) || CodeMirror.findMatchingTag(cm, change.to);
	var in_tag = true;
	var on_outer_boundary = false;
	var on_inner_boundary = false;
	var following_tag = false;
	if(tag && tag.open && tag.close){
	    on_outer_boundary = (cur.line == tag.open.from.line && cur.ch == tag.open.from.ch) || (cur.line == tag.close.to.line && cur.ch == tag.close.to.ch);
	    on_inner_boundary = (cur.line == tag.open.to.line && cur.ch == tag.open.to.ch) || (cur.line == tag.close.from.line && cur.ch == tag.close.from.ch);
	    following_tag = (cur.line == tag.open.to.line && cur.ch == tag.open.to.ch) || (cur.line == tag.close.to.line && cur.ch == tag.close.to.ch);
	    in_tag = (in_tag && !on_outer_boundary && !on_inner_boundary) || (following_tag && change.origin == "+delete"); 
	    console.log("in_tag",in_tag);
	}
	else in_tag = false;
	
	// We could also be following a tag by being after the end of a closing tag.  Check this now:
	if(!tag){
	    var c = {'line':cur.line,'ch':cur.ch-1};
	    tag = CodeMirror.findMatchingTag(cm, c);
	    if(tag && tag.open && tag.close){
		following_tag = c.line == tag.close.to.line && c.ch == tag.close.to.ch-1;
	    }
	}
	
	if(!in_tag){
	    tag = CodeMirror.findEnclosingTag(cm, change.from) || CodeMirror.findEnclosingTag(cm, change.to);
	}
	//console.log("AAAA", tag, in_tag, on_outer_boundary, on_inner_boundary, following_tag, cur);
	if(tag && tag.open && tag.close && tag.open.tag in self.plugin_info.tags){
	    console.log("ISTEXT",self.plugin_info.tags[tag.open.tag].text);
	    //if(in_tag && cur.line == tag.open.from.line && cur.ch == tag.open.from.ch) return;
	    if(change.origin == "+delete"){
		if(!self.plugin_info.tags[tag.open.tag].text)
		    change.update(tag.open.from, tag.close.to, ['']);
		else if(in_tag || following_tag)
		    change.update(tag.open.from, tag.close.to, [cm.getRange(tag.open.to, tag.close.from)]);
	    }
	    else if(change.origin == "+input" && !self.plugin_info.tags[tag.open.tag].text){
	    	var p = self.plugin_info.tags[tag.open.tag];
		console.log("ASD",p);
	    	if(change.update) change.update(tag.open.to, tag.close.from, self.plugin_info.plugins[p.plugin_name].edit(self.editor, tag.open.to, tag.close.from));
	    }
	    else if(in_tag){
		change.cancel();
	    }
	}
    });
    //this.editor.setSize(null, (this.raw.split("\n").length + 2)*(this.editor.defaultTextHeight()) + 10);
    
    this.plugin_info = Kit.test_plugins;
    this.output = args.output;
    this.edit = args.edit;
    this.container = args.container;

    for(var b in this.plugin_info.buttons){
	var a = document.createElement("a");
	a.innerHTML = b;
	a.setAttribute("href","#");
	var f = function(x){
	    a.onclick = function(){ self.plugin_info.buttons[x](self.editor); };
	}(b)
	this.container.insertBefore(a, this.container.firstChild);
	this.container.insertBefore(document.createElement("br"), this.container.firstChild);
    }
    
    // Set up keys from plugins and defaults: 
    
    var key_dict = this.plugin_info.keys;
    // key_dict['Enter'] = function(cm) {
    // 	var tag = CodeMirror.findMatchingTag(cm, cm.getCursor()) || CodeMirror.findEnclosingTag(cm, cm.getCursor());
    // 	if(tag && tag.open.tag in self.plugin_info.tags && !self.plugin_info.tags[tag.open.tag].text){
    // 	    console.log("T",tag.open.tag,tag);
    // 	    var p = self.plugin_info.tags[tag.open.tag];
    // 	    self.plugin_info.plugins[p.plugin].edit(cm, tag.open.to, tag.close.from);
    // 	    return;
    // 	}
    // 	return CodeMirror.Pass;
    // };
    key_dict['Ctrl-Enter'] = function(cm) {
	self.output(self.render());
    };
    
    this.editor.setOption("extraKeys", key_dict);
}

Kit.setup_plugins = function(plugins, base_url){
    var keys = {};
    var buttons = {};
    var tags = {};
    for(var p in plugins){
	for(var i = 0; i < plugins[p].functions.length; i++){
	    var f = plugins[p].functions[i];
	    if(!(f.key in keys)) keys[f.key] = f.func;
	    if(!(f.name in buttons)) buttons[f.name] = f.func;
	    if(!(f.tag in tags)) tags[f.tag] = {"plugin_name":p,"text":plugins[p].functions[i].text};
	}
    }
    return {"plugins":plugins,
	    "keys":keys,
	    "buttons":buttons,
	    "tags":tags}
}

Kit.test_plugins = Kit.setup_plugins({"argument":new KitArgumentPlugin(),
				      //"av":new KitAVPlugin(),
				      "guppy":new KitGuppyPlugin(),
				      "checklist":new KitChecklistPlugin(),
				      "code":new KitCodePlugin(),
				      "draw":new KitDrawPlugin(),
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
    for(var t in this.plugin_info.tags){
	var plugin = this.plugin_info.plugins[this.plugin_info.tags[t].plugin_name];
	var nodes = base.getElementsByTagName(t);
	console.log("AAA",t,this.plugin_info.tags[t],nodes.length);
	while(nodes.length > 0){
	    var r = plugin.render(nodes[0].cloneNode(true), base);
	    var par = document.createElement("p");
	    par.appendChild(r);
	    nodes[0].parentNode.replaceChild(par, nodes[0]);
	}
	console.log(base);
    }
    var output = document.createElement("span");
    output.innerHTML = (new XMLSerializer()).serializeToString(base);
    var a = document.createElement("a");
    a.setAttribute("onclick","k.edit()");
    a.setAttribute("href","#");
    a.innerHTML = "edit";
    output.insertBefore(document.createElement("br"), output.firstChild);
    output.insertBefore(a, output.firstChild);
    return output;
}

Kit.prototype.tag = function(){
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

