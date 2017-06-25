template_src = require('./template.js')
Handlebars = require('../../lib/handlebars/handlebars.min.js');

slideshow_template = Handlebars.compile(template_src);

data = {}

function render(n){
    console.log(n);
    var id = n.getAttribute("id");
    data[id] = [];
    var items = n.getElementsByTagName("item");
    for(var i = 0; i < items.length; i++){
	var d = {}
	for(var nn = items[i].firstChild; nn.nextSibling; nn = nn.nextSibling)
	    if(nn.nodeType == 1)
		d[nn.nodeName] = String(nn.innerHTML);
	d["label"] = items[i].getAttribute("label") || ""
	data[id].push(d);
    }

    var s = document.createElement("span");
    s.innerHTML = slideshow_template({"id":id, "item_data": data[id]});
    return s;
}

function set_content(id, i){
    console.log("A",id, i);
    document.getElementById("slideshow_"+id+"_content").innerHTML = data[id][i].content;
    document.getElementById("slideshow_"+id+"_caption").innerHTML = data[id][i].caption;
    for(var j = 0; j < data.length; j++){
	document.getElementById("slideshow_button_{{id}}_"+j).class = (i==j ? "slideshow_button_active" : "slideshow_button");
    }
}

module.exports = {"render":render,"set_content":set_content, "data":data};
