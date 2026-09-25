const fs=require('node:fs');
const path=require('node:path');
const {validateConfig}=require('../assets/engine.js');
const {extract}=require('../assets/rules-text.js');
try{
 const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'../data',name),'utf8'));
 const objectives=read('objectives.json'),rules=read('uuid-rules.json');
 validateConfig(objectives,rules);
 const text=fs.readFileSync(path.join(__dirname,'..',rules.textFile),'utf8');
 for(const [name,rule] of Object.entries({numbers:rules.numbers,...rules.letters})){
  try{extract(text,rule.reference.start,rule.reference.end);}catch(e){throw Error(name+': '+e.message);}
 }
 console.log('Valid configuration: '+objectives.objectives.length+' objectives, 6 letter rules. All text references found.');
}catch(e){console.error('Configuration error: '+e.message);process.exitCode=1;}
