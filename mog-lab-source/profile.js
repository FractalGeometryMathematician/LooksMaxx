// App-authored looksmaxxing-style presets, not validated human beauty ratings.
export const GROUPS={harmony:'Facial harmony',eyes:'Eye area',jaw:'Jaw & cheekbones',features:'Nose & lips',balance:'Landmark balance'};
export const PRESETS={
  angular:{name:'Angular / defined',weights:{harmony:20,eyes:25,jaw:25,features:15,balance:15},bands:{faceRatio:[1.28,1.65,.50],midLower:[.82,1.12,.75],eyeSpacing:[.42,.49,.20],canthalTilt:[2,10,18],eyeAspect:[2.8,4.2,2.5],browGap:[.025,.10,.13],jawRatio:[.80,.94,.35],chinRatio:[.27,.42,.25],cheekTemple:[.98,1.12,.30],noseEye:[.85,1.25,.75],mouthNose:[1.40,1.95,1.25],lipRatio:[.9,1.9,1.5],philtrumChin:[.20,.50,.50],asymmetry:[0,.025,.13],thirdsSpread:[0,.14,.40]}},
  balanced:{name:'Balanced / harmonious',weights:{harmony:30,eyes:20,jaw:15,features:20,balance:15},bands:{faceRatio:[1.30,1.70,.50],midLower:[.88,1.12,.75],eyeSpacing:[.42,.50,.20],canthalTilt:[0,9,18],eyeAspect:[2.4,3.8,2.5],browGap:[.04,.14,.13],jawRatio:[.73,.90,.35],chinRatio:[.22,.37,.25],cheekTemple:[.96,1.10,.30],noseEye:[.85,1.30,.75],mouthNose:[1.35,1.95,1.25],lipRatio:[1.0,2.0,1.5],philtrumChin:[.22,.55,.50],asymmetry:[0,.025,.13],thirdsSpread:[0,.12,.40]}},
  soft:{name:'Soft / rounded',weights:{harmony:20,eyes:25,jaw:10,features:25,balance:20},bands:{faceRatio:[1.20,1.58,.50],midLower:[.90,1.20,.75],eyeSpacing:[.42,.51,.20],canthalTilt:[0,10,18],eyeAspect:[2.0,3.4,2.5],browGap:[.05,.16,.13],jawRatio:[.67,.85,.35],chinRatio:[.18,.32,.25],cheekTemple:[.95,1.09,.30],noseEye:[.80,1.25,.75],mouthNose:[1.40,2.10,1.25],lipRatio:[1.0,2.2,1.5],philtrumChin:[.20,.52,.50],asymmetry:[0,.025,.13],thirdsSpread:[0,.15,.40]}}
};
for(const preset of Object.values(PRESETS)){preset.bands.fWHR=[1.6,2.2,.9];preset.bands.mentoPhiltrum=[.4,.6,.4]}
PRESETS.angular.bands.lowerCheek=[.82,.93,.22];PRESETS.balanced.bands.lowerCheek=[.86,.99,.22];PRESETS.soft.bands.lowerCheek=[.92,1.04,.22];
PRESETS.user={name:'User ratios / male-coded template',weights:{...PRESETS.angular.weights},bands:{...PRESETS.angular.bands,midLower:[.91,1,.65],fWHR:[1.8,2,.8],jawRatio:[.70,.75,.25],mentoPhiltrum:[.45,.55,.35]}};
PRESETS.psl={name:'PSL-inspired / structure priority',weights:{harmony:25,eyes:25,jaw:35,features:10,balance:5},bands:{...PRESETS.angular.bands}};
export const CRITERIA=[
  {key:'faceRatio',name:'Face proportions',group:'harmony',unit:'ratio',note:'Forehead-landmark-to-chin height / cheek width. The forehead landmark is not the hairline.'},
  {key:'midLower',name:'Midface / lower face',group:'harmony',unit:'ratio',note:'Brow center to nose base / nose base to chin.'},
  {key:'eyeSpacing',name:'Eye spacing',group:'harmony',unit:'ratio',note:'Eye-center spacing / cheek width.'},
  {key:'thirdsSpread',name:'Facial thirds',group:'harmony',unit:'ratio',note:'Spread between upper, middle and lower thirds / total height. Requires your marked hairline.'},
  {key:'canthalTilt',name:'Canthal tilt',group:'eyes',unit:'degrees',note:'Average outer-eye-corner tilt after correction for head roll.'},
  {key:'eyeAspect',name:'Eye elongation',group:'eyes',unit:'ratio',note:'Mean eye width / eyelid aperture. Squinting or blinking changes this.'},
  {key:'browGap',name:'Brow–eye spacing',group:'eyes',unit:'ratio',note:'Brow-to-upper-eyelid distance / cheek width. Expression affects it.'},
  {key:'jawRatio',name:'Jaw width',group:'jaw',unit:'ratio',note:'Visible frontal jaw width / cheek width; not a side-profile gonial angle.'},
  {key:'chinRatio',name:'Chin width',group:'jaw',unit:'ratio',note:'Lower outline width / cheek width. Describes the frontal chin frame.'},
  {key:'cheekTemple',name:'Cheekbone width',group:'jaw',unit:'ratio',note:'Cheek width / temple width. A silhouette proxy, not cheekbone projection.'},
  {key:'noseEye',name:'Nose width',group:'features',unit:'ratio',note:'Nose-wing width / mean eye width.'},
  {key:'mouthNose',name:'Mouth / nose balance',group:'features',unit:'ratio',note:'Mouth width / nose-wing width. Use a relaxed expression.'},
  {key:'lipRatio',name:'Lip proportions',group:'features',unit:'ratio',note:'Lower / upper visible lip height. Very thin or occluded lips may be unavailable.'},
  {key:'philtrumChin',name:'Philtrum / chin balance',group:'features',unit:'ratio',note:'Nose-base-to-upper-lip / lower-lip-to-chin distance.'},
  {key:'asymmetry',name:'Left/right balance',group:'balance',unit:'ratio',note:'Mean paired-landmark mismatch / cheek width, using the fitted facial midline.'}
];
CRITERIA.push({key:'lowerCheek',name:'Lower-cheek taper',group:'jaw',unit:'ratio',note:'Lower-cheek silhouette width / cheek width. Grades visible contour, not tissue fat content.'},{key:'fWHR',name:'Upper-face fWHR proxy',group:'harmony',unit:'ratio',note:'Cheek width / brow-center-to-upper-lip height. Definition-specific photo proxy, not a diagnostic threshold.'},{key:'mentoPhiltrum',name:'Philtrum / crease-to-chin',group:'features',unit:'ratio',note:'Nose-base-to-upper-lip / marked mentolabial-crease-to-chin height. Mark the crease to add this measure.'});
export function validTargets(overrides={}){return Object.fromEntries(Object.entries(overrides).filter(([key,v])=>CRITERIA.some(c=>c.key===key)&&Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)&&v[0]<=v[1]&&v[2]>0))}
export function bandFit(value,band){
  if(!Number.isFinite(value))return null;
  const [lo,hi,tolerance]=band,delta=value<lo?lo-value:value>hi?value-hi:0;
  return Math.max(0,Math.min(100,100*(1-(delta/tolerance)**2)));
}
export function harshTarget(band,key){
  const [lo,hi,tolerance]=band,oneSided=key==='asymmetry'||key==='thirdsSpread';
  return {target:oneSided?0:(lo+hi)/2,halfFitDistance:Math.max(1e-8,.85*(oneSided?hi:(hi-lo)/2)+.15*tolerance)};
}
export function harshFit(value,band,key){
  if(!Number.isFinite(value))return null;
  const {target,halfFitDistance}=harshTarget(band,key);
  return 100*Math.exp(-Math.LN2*((value-target)/halfFitDistance)**2);
}
export function scoreFeatures(features,preset='angular',weights,mode='standard',overrides={}){
  mode=mode==='harsh'?'harsh':'standard';
  const config=PRESETS[preset]??PRESETS.angular,usedWeights=weights??config.weights;
  const bands={...config.bands,...validTargets(overrides)};
  const criteria=CRITERIA.map(c=>({...c,value:features[c.key]??null,band:bands[c.key],...(mode==='harsh'?harshTarget(bands[c.key],c.key):{target:null,halfFitDistance:null}),fit:mode==='harsh'?harshFit(features[c.key],bands[c.key],c.key):bandFit(features[c.key],bands[c.key])}));
  const groups=Object.entries(GROUPS).map(([key,name])=>{const items=criteria.filter(c=>c.group===key&&c.fit!==null);return {key,name,score:items.length?items.reduce((s,c)=>s+c.fit,0)/items.length:null,available:items.length,total:criteria.filter(c=>c.group===key).length,weight:Math.max(0,Number(usedWeights[key])||0)}});
  const total=groups.reduce((s,g)=>s+(g.score===null?0:g.weight),0);
  const rawScore=total?groups.reduce((s,g)=>s+(g.score===null?0:g.score*g.weight),0)/total:null;
  const score=rawScore===null?null:mode==='harsh'?Math.round(rawScore*10)/10:Math.round(rawScore);
  for(const g of groups)g.share=total&&g.score!==null?Math.round(100*g.weight/total):0;
  for(const c of criteria){const g=groups.find(g=>g.key===c.group);c.pointsLost=c.fit===null||!total?null:(100-c.fit)*g.weight/total/g.available}
  return {score,rawScore,mode,criteria,groups,weights:Object.fromEntries(groups.map(g=>[g.key,g.weight])),available:criteria.filter(c=>c.fit!==null).length};
}
export function extractFeatures(m,hairline,crease){
  const {q,p,fw}=m;
  const dist=(a,b)=>Math.hypot(q[a].x-q[b].x,q[a].y-q[b].y);
  const ratio=(n,d)=>d>fw*.006?n/d:null;
  const eyeWidth=(dist(33,133)+dist(263,362))/2,eyeHeight=(dist(159,145)+dist(386,374))/2;
  const tilt=(inner,outer)=>Math.atan2(q[inner].y-q[outer].y,Math.abs(q[inner].x-q[outer].x))*180/Math.PI;
  const noseWidth=dist(98,327),mouthWidth=dist(61,291);
  const features={faceRatio:m.ratio,midLower:ratio(Math.abs(q[2].y-q[9].y),Math.abs(q[152].y-q[2].y)),eyeSpacing:m.spacing,canthalTilt:(tilt(133,33)+tilt(362,263))/2,eyeAspect:ratio(eyeWidth,eyeHeight),browGap:((q[159].y-q[105].y)+(q[386].y-q[334].y))/2/fw,jawRatio:m.jawRatio,chinRatio:dist(150,379)/fw,cheekTemple:ratio(fw,dist(127,356)),noseEye:ratio(noseWidth,eyeWidth),mouthNose:ratio(mouthWidth,noseWidth),lipRatio:ratio(Math.abs(q[17].y-q[14].y),Math.abs(q[13].y-q[0].y)),philtrumChin:ratio(Math.abs(q[2].y-q[0].y),Math.abs(q[152].y-q[17].y)),asymmetry:m.asymmetry,thirdsSpread:null};
  features.lowerCheek=ratio(dist(93,323),fw);features.fWHR=ratio(fw,Math.abs(q[13].y-q[9].y));features.mentoPhiltrum=null;let creaseValid=false;
  if(crease){const x=crease.x*m.width-p[1].x,y=crease.y*m.height-p[1].y,cy=x*m.axes.vx+y*m.axes.vy,cx=x*m.axes.ux+y*m.axes.uy;creaseValid=cy>q[17].y&&cy<q[152].y-fw*.05&&Math.abs(cx)<fw*.15;if(creaseValid)features.mentoPhiltrum=ratio(Math.abs(q[2].y-q[0].y),q[152].y-cy)}
  let thirds=null,hairlineValid=false;
  if(hairline){const x=hairline.x*m.width-p[1].x,y=hairline.y*m.height-p[1].y,hy=x*m.axes.vx+y*m.axes.vy;const lengths=[q[9].y-hy,q[2].y-q[9].y,q[152].y-q[2].y],sum=lengths.reduce((s,v)=>s+v,0);hairlineValid=lengths.every(v=>v>fw*.08)&&lengths[0]<fw*.85&&Math.abs(x*m.axes.ux+y*m.axes.uy)<fw*.2;if(hairlineValid){features.thirdsSpread=(Math.max(...lengths)-Math.min(...lengths))/sum;thirds=lengths.map(v=>100*v/sum)}}
  const issues=[];
  if(m.yaw>.12)issues.push('Face turned: retake straight on.');
  if(m.tilt>25)issues.push('Strong head roll: keep the camera level.');
  if(eyeHeight/Math.max(1,eyeWidth)<.12)issues.push('Eyes may be closed or strongly squinted.');
  if(dist(13,14)/fw>.08)issues.push('Mouth is open: use a relaxed, closed-mouth expression.');
  if(fw<100)issues.push('Face is small in the image: use a closer portrait.');
  if(p[10].y<3||p[152].y>m.height-3)issues.push('Face outline is cropped.');
  if(Object.entries(features).filter(([k,v])=>k!=='thirdsSpread'&&Number.isFinite(v)).length<11)issues.push('Some landmarks are unclear.');
  return {features,thirds,hairlineValid,creaseValid,issues,eligible:issues.length===0};
}
export function assessProfile(m,preset='angular',weights,hairline,mode='standard',overrides={},crease){
  const extracted=extractFeatures(m,hairline,crease),scored=scoreFeatures(extracted.features,preset,weights,mode,overrides);
  return {...scored,...extracted,preset,presetName:(PRESETS[preset]??PRESETS.angular).name,displayScore:extracted.eligible?scored.score:null};
}
