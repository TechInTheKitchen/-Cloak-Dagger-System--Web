const fs=require('node:fs');
const path=require('node:path');
const {validateConfig}=require('../assets/engine.js');
try{
 const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data',name),'utf8'));
 const objectives=read('objectives.json'),rules=read('uuid-rules.json');
 validateConfig(objectives,rules);
 const text=fs.readFileSync(path.join(__dirname,'..',rules.textFile),'utf8');
 for(const [name,rule] of Object.entries({numbers:rules.numbers,...rules.letters})){
  const start=text.indexOf(rule.reference.start),end=text.indexOf(rule.reference.end,start+rule.reference.start.length);
  if(start<0||end<0)throw Error(name+': reference markers were not found in order in '+rules.textFile);
 }
 console.log('Valid configuration: '+objectives.objectives.length+' objectives, 6 letter rules. All text references found.');
}catch(e){console.error('Configuration error: '+e.message);process.exitCode=1;}
