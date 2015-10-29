var Kit = function(args){
    this.editor = CodeMirror.fromTextArea(args['input'], {
	    lineNumbers: true,
	    styleActiveLine: true,
	    readOnly: false, 
	    gutters: ["CodeMirror-linenumbers"]
    });
    this.plugins = {"guppy":{},
		    "statement":{}};
    this.init_plugins = function(){
	var self = this;
	for(var p in this.plugins){
	    (function(p){
		var req = new XMLHttpRequest();
		req.onload = function(){
		    console.log(p);
		var xsltProcessor = new XSLTProcessor();
		    xsltProcessor.importStylesheet((new window.DOMParser()).parseFromString(this.responseText, "text/xml"));
		    self.plugins[p].xsl = xsltProcessor;
		    console.log(self.plugins);
		};
		req.open("get", "plugins/"+p+"/transform.xsl", true);
		req.send();
	    })(p);
	}
    }
    this.init_plugins();
    this.plugin_data = {
	"guppy":{
	    "m0":{"xml":"<m><e>x+1</e></m>","snippet":"x+1"}
	}
    };
    this.raw = "";
    this.editor.setOption("theme", "default");
    this.editor.setValue(this.raw);
    this.editor.setSize(null, "75%");
    //this.editor.setSize(null, (this.raw.split("\n").length + 2)*(this.editor.defaultTextHeight()) + 10);
    var this_kit = this;
    this.output = args['output'];
    this.editor.setOption("extraKeys", {
	'Enter': function(cm) {
	    var ext = this_kit.current_extension();
	    console.log(ext);
	    if(ext){
		if(!ext.plugin) return CodeMirror.Pass;
		// Find plugin by plugin id and show editor
	    }
	    else{
		return CodeMirror.Pass;
	    }
	},
	'Ctrl-Enter': function(cm) {
	    this_kit.output(this_kit.render());
	},
	'Shift-Ctrl-E': function(cm) {
	    cm.replaceSelection("[[]]");
	    var cur = cm.getCursor();
	    cm.setCursor({'line':cur.line,'ch':cur.ch-2});
	},
    });
}

Kit.prototype.render = function(){
    //var pars = this.editor.getValue().split(/[ \t]*\n([ \t]*\n)+/);
    // for(var i = 0; i < pars.length; i += 2){
    // 	var new_p = document.createElement("p");
    // 	new_p.appendChild(document.createTextNode(pars[i]));
    // 	output.appendChild(new_p);
    // }
    var doc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><node>\n"+this.editor.getValue()+"\n</node>";
    var base = (new window.DOMParser()).parseFromString(doc, "text/xml");
    console.log(doc,base);
    for(var p in this.plugins){
	if(p != "statement") continue;
	console.log(p);
	base = this.plugins[p].xsl.transformToDocument(base);
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
