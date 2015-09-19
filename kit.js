var Kit = function(args){
    this.editor = CodeMirror.fromTextArea(args['input'], {
	    lineNumbers: true,
	    styleActiveLine: true,
	    readOnly: false, 
	    gutters: ["CodeMirror-linenumbers"]
    });
    this.plugins = {};
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
		//
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
    var pars = this.editor.getValue().split(/[ \t]*\n([ \t]*\n)+/);
    var output = document.createElement("span");
    for(var i = 0; i < pars.length; i += 2){
	var new_p = document.createElement("p");
	new_p.appendChild(document.createTextNode(pars[i]));
	output.appendChild(new_p);
    }
    alert(this.editor.getValue());
    return output;
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
	if(left_delim < cursor.ch && cursor.ch < right_delim + 2){
	    console.log("Found it");
	    right_delim += 2;
	    text = text.substring(0,right_delim+2);
	    console.log(text);
	    var matches = text.match(/^\[\[([a-zA-Z_][a-zA-Z_0-9]*)\.([a-zA-Z_][a-zA-Z_0-9]*)[ \t]*(?:\|[ \t]*(.*))?\]\]/);
	    if(!matches) return /^\[\[[a-zA-Z_][a-zA-Z_0-9]*\]\]/.test(text) ? {'plugin':text.substring(2,text.length-2),'left':offset,'right':right_delim + offset} : {'plugin':null};
	    return {'plugin':matches[1],'id':matches[2],'text':matches[3],'left':offset,'right':right_delim + offset};
	}
	else{
	    var left_delim = text.substring(1).indexOf("[[");
	    offset += left_delim;
	}
    }
}
