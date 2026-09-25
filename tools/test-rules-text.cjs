const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {extract}=require('../assets/rules-text.js');
const root=path.join(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'data/uuid-rules.json'),'utf8'));
const text=fs.readFileSync(path.join(root,config.textFile),'utf8');
test('extract rule does not start in the overview variable formula',()=>{
 const ref=config.letters.e.reference;
 const result=extract(text,ref.start,ref.end);
 assert.match(result,/^e = "extract"/);
 assert.match(result,/You can never store more than 1 copy/);
 assert.doesNotMatch(result,/CH\.2|variable =|f = "fours"/);
 assert.ok(result.length<350);
});
test('all configured digit and letter excerpts start at their own rule',()=>{
 for(const [key,rule] of Object.entries({numbers:config.numbers,...config.letters})){
  const result=extract(text,rule.reference.start,rule.reference.end);
  assert.ok(result.startsWith(rule.reference.start));
  assert.ok(result.length<500,key+' included unrelated text');
 }
});
test('line matching ignores embedded markers and handles indentation and CRLF',()=>{
 const sample='overview [variable = n]\r\nnot an e = rule\r\n  e = extract\r\nkeep whitespace  here\r\n  f = fours';
 assert.equal(extract(sample,'e =','f ='),'e = extract\r\nkeep whitespace  here');
});
test('literal punctuation and missing boundaries are handled safely',()=>{
 assert.equal(extract('a+b = literal\nbody\n(end)', 'a+b =','(end)'),'a+b = literal\nbody');
 assert.throws(()=>extract('variable = n\nf = end','e =','f ='),/Reference not found/);
 assert.throws(()=>extract('e = extract\nprose f = suffix','e =','f ='),/end marker not found/);
});
test('chapter and Chronicle references still resolve at source lines',()=>{
 assert.match(extract(text,'\nCH.2 -','\nCH.3 -'),/^CH\.2 -/);
 assert.match(extract(text,"You'll write a Scene","You'll write a Report"),/^You'll write a Scene/);
});
