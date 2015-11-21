KitArgumentPlugin = function(){
    var self = this;
    this.functions = [
	{'key':'Shift-Alt-S',
	 'name':"Statement",
	 'func':function(cm) {
	     var to_insert = self.insert("statement", cm.kit_instance.gen_id());
	     cm.replaceSelection(to_insert.data);
	     var cur = cm.getCursor();
	     cm.setCursor({'line':cur.line,'ch':cur.ch - to_insert.data.length + to_insert.cursor});
	 }},
	{'key':'Shift-Alt-P',
	'name':"Proof",
	'func': function(cm) {
	    var to_insert = self.insert("proof", cm.kit_instance.gen_id());
	    cm.replaceSelection(to_insert.data);
	    var cur = cm.getCursor();
	    cm.setCursor({'line':cur.line,'ch':cur.ch - to_insert.data.length + to_insert.cursor});
	}},
	{'key':'Shift-Alt-D',
	'name':"Definition",
	'func': function(cm) {
	    var to_insert = self.insert("definition", cm.kit_instance.gen_id());
	    console.log(self.kit);
	    cm.replaceSelection(to_insert.data);
	    var cur = cm.getCursor();
	    cm.setCursor({'line':cur.line,'ch':cur.ch - to_insert.data.length + to_insert.cursor});
	}}
    ];
}

KitArgumentPlugin.prototype.insert = function(type, id){
    var start = "<"+type+" id=\""+id+"\" name=\"\">";
    var end = "</"+type+">";
    return {"data":start+end,"cursor":start.length};
}
