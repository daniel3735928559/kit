katex = require('../../lib/katex/katex-modified.min.js');
GuppyDoc = require('./guppy_doc.js');

function render(n){
    var d = new GuppyDoc(n.innerHTML);
    var s = document.createElement("span");
    s.setAttribute("id","eqn1_render");
    katex.render(d.get_content("latex"), s);
    //n.replaceWith(s);
    return s;
}

module.exports = {"render":render};
