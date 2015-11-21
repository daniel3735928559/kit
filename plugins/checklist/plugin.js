KitChecklistPlugin = function(kit){
    this.kit = kit;
    var self = this;
    this.functions = [
	{'key':'Shift-Alt-C',
	'name':'checklist',
	'func': function(cm) {
	    var to_insert = self.insert(cm.kit_instance.gen_id());
	    cm.replaceSelection(to_insert.data);
	    var cur = cm.getCursor();
	    cm.setCursor({'line':cur.line,'ch':cur.ch - to_insert.text.length + to_insert.cursor});
	}}
    ];
}

KitChecklistPlugin.prototype.insert = function(id){
    var start = "<checklist id=\""+id+"\"><item>"
    var end = "</item></checklist>";
    return {"data":start+end,"cursor":start.length};
}
