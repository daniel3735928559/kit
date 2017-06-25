module.exports = '<div class="slideshow"> \
    <div class="slideshow_content" id="slideshow_{{id}}_content">{{{item_data.0.content}}}</div> \
    <div class="slideshow_caption" id="slideshow_{{id}}_caption">{{{item_data.0.caption}}}</div> \
    <div class="slideshow_controls" id="slideshow_{{id}}_controls"> \
    {{#each item_data}} \
    <div class="slideshow_button" id="slideshow_button_{{@root.id}}_{{@index}}" onmouseover="KitRenderer.renderers.slideshow.set_content({{@root.id}}, {{@index}})">{{label}}</div> \
    {{/each}}</div> \
    </div>';
//KitRenderer.renderers.slideshow.set_content ,{{@root.id}}, {{this}}, {{@index}}
