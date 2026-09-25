(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RulesText=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function findMarker(text,marker,from=0){
    // A reference identifies the beginning of a source line, never a suffix
    // inside prose such as the "e =" at the end of "variable =".
    const literal=marker.replace(/^[\r\n]+/,'');
    if(!literal)throw Error('Reference marker cannot be empty.');
    const escaped=literal.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const pattern=new RegExp('^[ \\t]*'+escaped,'gm');
    pattern.lastIndex=from;
    const match=pattern.exec(text);
    return match?{index:match.index,end:pattern.lastIndex}:null;
  }
  function extract(text,start,end){
    const first=findMarker(text,start);
    if(!first)throw Error('Reference not found at the start of a line: '+start.trim());
    const last=end?findMarker(text,end,first.end):null;
    if(end&&!last)throw Error('Reference end marker not found at the start of a later line: '+end.trim());
    return text.slice(first.index,last?last.index:undefined).trim();
  }
  return {extract};
});
