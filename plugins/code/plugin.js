KitCodePlugin = function(kit){
    this.kit = kit;
    var self = this;
    this.functions = [
	{'key':'Shift-Alt-K',
	 'name':'code',
	 'func': function(cm) {
	    var to_insert = self.insert();
	    cm.replaceSelection(to_insert.data);
	    var cur = cm.getCursor();
	    cm.setCursor({'line':cur.line,'ch':cur.ch - to_insert.data.length + to_insert.cursor});
	 }}
    ];
}

KitCodePlugin.prototype.insert = function(){
    var start = "<code lang=\"\">";
    var end = "</code>";
    return {"data":start+end,"cursor":start.length};
}
