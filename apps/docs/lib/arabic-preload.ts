// /ar only: next/font preloads per layout file, and one layout serves both locales, so the Arabic page finds its own faces in the font stylesheet.

/**
 * Runs in `<head>` after the stylesheets, before the first layout: preloads each Noto Sans Arabic face whose
 * unicode-range holds an Arabic alef or a Latin a, the two faces an Arabic page sets its text in.
 */
export const ARABIC_PRELOAD_SCRIPT = `(function(){try{
var want=[0x627,0x61],done={},sheets=document.styleSheets;
for(var i=0;i<sheets.length;i++){
var rules;try{rules=sheets[i].cssRules}catch(e){continue}
for(var j=0;j<rules.length;j++){
if(rules[j].type!==5)continue;
var face=rules[j].style,src=/url\\(\\s*["']?([^"')]+)/.exec(face.getPropertyValue('src'));
if(src===null||face.getPropertyValue('font-family').replace(/["']/g,'').trim()!=='Noto Sans Arabic')continue;
var range=face.getPropertyValue('unicode-range').trim(),hit=range==='';
var parts=range.split(',');
for(var k=0;k<parts.length&&!hit;k++){
var ends=parts[k].trim().replace(/^u\\+/i,'').split('-'),low=parseInt(ends[0].replace(/\\?/g,'0'),16),high=parseInt((ends[1]||ends[0]).replace(/\\?/g,'f'),16);
for(var w=0;w<want.length;w++)if(want[w]>=low&&want[w]<=high)hit=true}
var href=new URL(src[1],sheets[i].href||document.baseURI).href;
if(!hit||done[href])continue;
done[href]=1;
var link=document.createElement('link');link.rel='preload';link.as='font';link.type='font/woff2';link.crossOrigin='';link.href=href;
document.head.appendChild(link)}}
}catch(e){}})()`
