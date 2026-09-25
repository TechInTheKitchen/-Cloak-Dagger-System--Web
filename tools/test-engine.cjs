const test=require('node:test');
const assert=require('node:assert/strict');
const {createEngine}=require('../assets/engine.js');
const objectiveData=require('../data/objectives.json');
const uuidData=require('../data/uuid-rules.json');
const E=createEngine(objectiveData,uuidData);
function session(uuid='98765432-1234-4567-89ab-cdef01234567'){const s=E.fresh();E.setup(s,[0,0,0]);s.uuid=uuid;return s;}
test('all 27 setup combinations and valid v4 generation',()=>{for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){const s=E.fresh();E.setup(s,[a,b,c]);assert.equal(s.dagger,a+2);assert.equal(s.risk,a*2+(b===1?1:0));assert.equal(s.flaw,['ab','cd','ef'][c]);assert.ok(E.validUUID(s.uuid));assert.ok(E.validate(s));}});
test('sequential allowance and successful objective effects',()=>{const s=session();E.start(s,0,'cloak');E.burn(s);E.burn(s);E.burn(s);assert.equal(s.move.total,24);assert.throws(()=>E.burn(s));E.resolve(s);assert.equal(s.completed[0],true);assert.equal(s.cloak,4);assert.equal(s.dagger,3);assert.deepEqual(s.chronicles,['Report']);});
test('a amplifies, b extends by original stat and risk letters trigger',()=>{const s=session('ab987654-1234-4567-89ab-cdef01234567');s.boxes[0]=0;E.start(s,0,'cloak');E.burn(s);E.burn(s,{extra:true});assert.equal(s.move.budget,6);assert.equal(s.risk,2);E.burn(s);E.burn(s);E.resolve(s);assert.equal(s.boxes[0],2);});
test('c signals immediate resolution and schedules Scene',()=>{const s=session('c9876543-1234-4567-89ab-cdef01234567');E.start(s,0,'cloak');assert.equal(E.burn(s).forceResolve,true);E.resolve(s);assert.deepEqual(s.chronicles,['Scene']);assert.equal(s.risk,1);});
test('d doubles once per number, including a later number',()=>{const s=session('d9876543-1234-4567-89ab-cdef01234567');E.start(s,0,'cloak');E.burn(s);E.burn(s);E.double(s,0);assert.equal(s.move.total,18);assert.throws(()=>E.double(s,0));});
test('e stores an unburned character and copy does not consume allowance',()=>{const s=session('e9876543-1234-4567-89ab-cdef01234567');E.start(s,0,'cloak');E.burn(s,{extract:1});assert.equal(s.stored,'9');assert.equal(s.burned[1],false);E.burn(s,{copy:true});assert.equal(s.stored,null);assert.equal(s.move.used,1);assert.equal(s.move.total,9);});
test('f burns all remaining fours with no ordinary allowance cost',()=>{const s=session('f9876543-1234-4567-89ab-cdef01234567');E.start(s,0,'cloak');E.burn(s);assert.equal(s.move.total,16);assert.equal(s.move.used,1);assert.equal(s.burned.filter(Boolean).length,5);});
test('f without remaining fours subtracts four',()=>{const s=session('f9876543-1234-4567-89ab-cdef01234567');s.uuid.replace(/-/g,'').split('').forEach((ch,i)=>{if(ch==='4')s.burned[i]=true;});E.start(s,0,'cloak');E.burn(s);assert.equal(s.move.total,-4);});
test('exhaustion renews UUID and increases risk after resolution',()=>{const s=session();s.burned.fill(true);s.burned[31]=false;E.start(s,0,'cloak');assert.equal(E.burn(s).forceResolve,true);E.resolve(s);assert.equal(s.uuidCount,2);assert.equal(s.risk,2);assert.equal(s.history.length,1);});
test('risk locks at 16 and cannot be lowered; later turns apply attrition',()=>{const s=session();s.risk=15;s.boxes[0]=0;E.start(s,0,'cloak');E.resolve(s);assert.equal(s.risk,16);assert.equal(s.locked,true);assert.throws(()=>E.start(s,3,'dagger'));E.start(s,3,'dagger','cloak');assert.equal(s.opsec,3);assert.equal(s.cloak,2);s.move.total=20;s.move.amplify=true;E.resolve(s);assert.equal(s.risk,16);});
test('opsec reaching zero loses before a new move',()=>{const s=session();s.risk=16;s.locked=true;s.opsec=1;E.start(s,0,'cloak','dagger');assert.equal(s.ended,'loss');assert.equal(s.move,null);assert.deepEqual(s.chronicles,['Epilogue']);});
test('scorched earth strikes the following field without effects and caps opsec',()=>{const s=session();E.start(s,5,'cloak');E.burn(s);E.burn(s);E.resolve(s);assert.equal(s.opsec,4);assert.ok(s.burned.slice(8,12).every(Boolean));assert.equal(s.burned[12],false);});
test('major objectives unlock after four basic completions; all majors win',()=>{const s=session();assert.throws(()=>E.start(s,6,'cloak'));s.completed[0]=s.completed[1]=s.completed[2]=s.completed[3]=true;s.completed[6]=s.completed[7]=true;E.start(s,8,'cloak');s.move.total=16;E.resolve(s);assert.equal(s.ended,'win');assert.deepEqual(s.chronicles,['Report','Epilogue']);});
test('saved state validation rejects malformed and executable content fields',()=>{const s=session();assert.ok(E.validate(s));s.burned=['no'];assert.equal(E.validate(s),false);assert.equal(E.validate({version:1,started:true}),false);});

function altered(edit){const o=structuredClone(objectiveData),r=structuredClone(uuidData);edit(o,r);return createEngine(o,r);}
function customSession(engine,uuid='98765432-1234-4567-89ab-cdef01234567'){const s=engine.fresh();engine.setup(s,[0,0,0]);s.uuid=uuid;return s;}
test('JSON changes objective costs, effects, variable and success threshold',()=>{
 const e=altered((o,r)=>{o.objectives[0].size=4;o.objectives[0].stat='dagger';o.objectives[0].effects=[{type:'adjust',stat:'risk',amount:-3},{type:'adjust',stat:'cloak',amount:5}];r.move.successTotal=8;r.move.successBoxes=2;});
 const s=customSession(e);assert.throws(()=>e.start(s,0,'cloak'));e.start(s,0,'dagger');e.burn(s);e.resolve(s);assert.equal(s.completed[0],true);assert.equal(s.cloak,8);assert.equal(s.risk,-3);
});
test('objective identity survives reordering and newly added objectives execute',()=>{
 const e=altered(o=>{o.objectives.reverse();o.objectives.push({id:'playtest',name:'Playtest objective',kind:'basic',size:1,stat:'cloak',effects:[{type:'adjust',stat:'dagger',amount:4}]});o.majorUnlockBasicCompletions=1;});
 const s=customSession(e);const refine=e.objectives.findIndex(o=>o.id==='refine-plan');assert.equal(s.boxes[refine],2);e.start(s,9,'cloak');e.burn(s);e.burn(s);e.resolve(s);assert.equal(s.dagger,6);assert.equal(e.basicCount(s),1);assert.equal(e.available(s,0),true);assert.ok(e.validate(s));
});
test('letter remapping executes the configured action instead of character-specific code',()=>{
 const e=altered((o,r)=>{r.letters.a={name:'triple',action:'double',multiplier:3,reference:{start:'a =',end:'b ='}};r.risk.flawIncrement=2;});
 const s=customSession(e,'a9876543-1234-4567-89ab-cdef01234567');e.start(s,0,'cloak');e.burn(s);e.burn(s);e.double(s,0);assert.equal(s.move.total,27);assert.equal(s.risk,2);assert.equal(s.move.amplify,false);
});
test('JSON modifies sweep digit, numeric value and exhaustion risk',()=>{
 const e=altered((o,r)=>{r.letters.f.digit='7';r.letters.f.emptyTotal=-9;r.numbers.multiplier=2;r.exhaustion.risk=3;});
 const s=customSession(e,'f9876543-1234-4567-89ab-cdef01234567');e.start(s,0,'cloak');e.burn(s);assert.equal(s.move.total,42);assert.equal(s.burned[12],false);s.burned.fill(true);e.resolve(s);assert.equal(s.risk,3);assert.equal(s.uuidCount,2);
});
test('JSON modifies amplifier, allowance and optional Chronicle timing',()=>{
 const e=altered((o,r)=>{r.letters.a.boxes=3;r.letters.b.variableMultiplier=2;r.letters.c.scenes=2;r.letters.c.resolveImmediately=false;});
 const s=customSession(e,'abc98765-1234-4567-89ab-cdef01234567');e.start(s,0,'cloak');e.burn(s);e.burn(s,{extra:true});assert.equal(s.move.budget,9);assert.equal(e.burn(s).forceResolve,false);e.burn(s);e.burn(s);e.resolve(s);assert.equal(s.boxes[0],3);assert.deepEqual(s.chronicles,['Scene','Scene','Report']);
});
test('JSON thresholds and attrition amounts drive lock and defeat',()=>{
 const e=altered((o,r)=>{r.risk.lockAt=6;r.risk.minimum=0;r.risk.attritionOpsec=2;r.risk.attritionStat=2;r.opsec.maximum=6;r.opsec.start=6;r.opsec.loseAt=1;r.move.failureRisk=6;});
 const s=customSession(e);e.start(s,0,'cloak');e.resolve(s);assert.equal(s.risk,6);e.start(s,0,'cloak','dagger');assert.equal(s.opsec,4);assert.equal(s.dagger,0);e.resolve(s);e.start(s,0,'cloak','dagger');assert.equal(s.opsec,2);e.resolve(s);e.start(s,0,'cloak','dagger');assert.equal(s.ended,'loss');assert.ok(e.validate(s));
});
test('configuration validation identifies bad fields, references, effects and missing letters',()=>{
 assert.throws(()=>altered(o=>{o.objectives[0].szie=5;}),/szie: unknown field/);
 assert.throws(()=>altered(o=>{o.objectives[0].size=0;}),/size/);
 assert.throws(()=>altered((o,r)=>{r.setup.structure[0].objective='missing';}),/unknown objective/);
 assert.throws(()=>altered(o=>{o.objectives[0].effects=[{type:'eval',code:'bad'}];}),/unknown field/);
 assert.throws(()=>altered((o,r)=>{delete r.letters.a;}),/missing letter/);
 assert.throws(()=>altered(o=>{o.majorUnlockBasicCompletions=99;}),/majorUnlock/);
});
test('saved rules snapshots retain their mechanics after disk rules change',()=>{
 const s=session();const changed=altered((o,r)=>{r.move.successTotal=50;});assert.equal(changed.validate(s),false);
 const restored=createEngine(s.ruleset.objectives,s.ruleset.uuid);assert.ok(restored.validate(s));restored.start(s,0,'cloak');restored.burn(s);restored.burn(s);assert.equal(restored.resolve(s),true);
});
test('legacy saves migrate without losing progress or pending doubles',()=>{
 const s=session('d9876543-1234-4567-89ab-cdef01234567');E.start(s,0,'cloak');E.burn(s);s.version=1;delete s.ruleset;delete s.move.pendingDoubles;delete s.move.awardBoxes;const migrated=E.migrate(s);assert.ok(E.validate(migrated));E.burn(migrated);E.double(migrated,0);assert.equal(migrated.move.total,18);assert.equal(s.version,1);
});
