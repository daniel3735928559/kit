var plugins = ["guppy", "slideshow"];

var marked = require("./lib/marked/marked.min.js");

var KitRenderer = function(id){
    this.elt = document.getElementById(id);
    var self = this;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
	if (xhr.readyState === XMLHttpRequest.DONE) {
	    if (xhr.status === 200) {
		var xml_data = xhr.responseText;
		self.doc = (new window.DOMParser()).parseFromString(xml_data, "text/xml");
		self.render();
	    } else {
		console.log('There was a problem with the request.');
	    }
	}
    };
    xhr.open('GET', this.elt.getAttribute("src"));
    xhr.send();
}

KitRenderer.renderers = {
    "guppy":require("./plugins/guppy/render.js"),
    "slideshow":require("./plugins/slideshow/render.js")
}

KitRenderer.prototype.xpath_list = function(xpath, node){
    node = node || this.doc.documentElement
    return this.doc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
}

KitRenderer.prototype.render = function(){
    rendered = this.doc.documentElement.cloneNode(true);
    // var iterator = this.xpath_list("//obj[count(.//obj) = 0]");
    var iterator = this.xpath_list("//obj", rendered);
    var to_replace = []
    for(var n = iterator.iterateNext(); n != null; n = iterator.iterateNext()){
	console.log("n",n);
	var p = n.getAttribute("type");
	to_replace.push([n,KitRenderer.renderers[p].render(n)]);
    }
    for(var i = 0; i < to_replace.length; i++)
	to_replace[i][0].parentNode.replaceChild(to_replace[i][1],to_replace[i][0]);
    var ans = document.createElement("div");
    console.log(String(rendered.innerHTML));
    console.log(marked(String(rendered.innerHTML)));
    ans.innerHTML = marked(String(rendered.innerHTML));
    console.log(marked("# hello"),this.elt.parentNode);
    this.elt.parentNode.replaceChild(ans, this.elt);
    this.elt = ans;
    return ans;
}

module.exports = KitRenderer;
