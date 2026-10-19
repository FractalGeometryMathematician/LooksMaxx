// Deterministic game presets. No trained attractiveness or health model.
export const PHI = (1 + Math.sqrt(5)) / 2;
export const FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
const clamp = (x,lo,hi) => Math.max(lo,Math.min(hi,x));
// Visible outline categories only. These rules do not estimate adipose tissue.
export function faceFullness(ratio,jawRatio,lowQuality=false){
  if(!Number.isFinite(ratio)||ratio<=0||!Number.isFinite(jawRatio)||jawRatio<=0)throw new Error('Invalid face outline measurements.');
  if(lowQuality)return {label:'RETAKE NEEDED',description:'A turned or tilted face changes its outline. Retake straight on before comparing fullness.'};
  const label=ratio<1.40&&jawRatio>=.80?'ROUNDER OUTLINE':ratio>1.65||jawRatio<.72?'MORE TAPERED':'MODERATE TAPER';
  return {label,description:`Visible shape only: cheek width / face height ${(1/ratio).toFixed(2)}, jaw width / cheek width ${jawRatio.toFixed(2)}. Bone structure, pose and lens distortion also affect this; it is not a facial-fat measurement.`};
}
export function measure(landmarks,width,height){
  if(!Array.isArray(landmarks)||landmarks.length<468||!(width>0&&height>0))throw new Error('Incomplete face landmarks. Try a clearer photo.');
  const p=landmarks.map(v=>({x:v.x*width,y:v.y*height}));
  if(p.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.y)))throw new Error('Invalid landmark coordinates.');
  const dist=(a,b)=>Math.hypot(p[a].x-p[b].x,p[a].y-p[b].y);
  const fw=dist(234,454),fh=dist(10,152);
  if(fw<10||fh<10)throw new Error('Face is too small. Use a closer portrait.');
  const left={x:(p[33].x+p[133].x)/2,y:(p[33].y+p[133].y)/2};
  const right={x:(p[263].x+p[362].x)/2,y:(p[263].y+p[362].y)/2};
  const dx=right.x-left.x,dy=right.y-left.y,eyeDist=Math.hypot(dx,dy);
  if(eyeDist<1)throw new Error('Eye landmarks are unclear. Try a clearer portrait.');
  const orientation=dx<0?-1:1;
  const ux=orientation*dx/eyeDist,uy=orientation*dy/eyeDist,vx=-uy,vy=ux;
  const q=p.map(v=>({x:(v.x-p[1].x)*ux+(v.y-p[1].y)*uy,y:(v.x-p[1].x)*vx+(v.y-p[1].y)*vy}));
  const pairs=[[33,263],[133,362],[61,291],[172,397],[234,454]];
  const midpoints=pairs.map(([a,b])=>(q[a].x+q[b].x)/2).sort((a,b)=>a-b);
  const midline=midpoints[Math.floor(midpoints.length/2)];
  const asymmetry=pairs.reduce((s,[a,b])=>s+(Math.abs(q[a].x+q[b].x-2*midline)+Math.abs(q[a].y-q[b].y))/fw,0)/pairs.length;
  const ratio=fh/fw,spacing=eyeDist/fw,jawRatio=dist(172,397)/fw;
  const phiScore=clamp(100-180*Math.abs(ratio/PHI-1),0,100);
  const spacingScore=clamp(100-200*Math.abs(spacing/.46-1),0,100);
  const symmetryScore=clamp(100-500*asymmetry,0,100);
  const score=Math.round((phiScore+spacingScore+symmetryScore)/3);
  const shape=ratio>1.62?'long':jawRatio>.88?'angular':ratio<1.35?'wide':'balanced';
  const yaw=Math.abs(dist(1,234)-dist(1,454))/fw;
  const tilt=Math.abs(Math.atan2(orientation*dy,orientation*dx)*180/Math.PI);
  const lowQuality=tilt>12||yaw>.16;
  return {score,phiScore:Math.round(phiScore),spacingScore:Math.round(spacingScore),symmetryScore:Math.round(symmetryScore),ratio,spacing,jawRatio,shape,tilt,yaw,lowQuality,fullness:faceFullness(ratio,jawRatio,lowQuality),asymmetry,p,q,fw,fh,width,height,axes:{ux,uy,vx,vy}};
}
export function suggestions(m,hair,goal,texture){
  const framing=m.shape==='long'?'Try a textured fringe or a little width at the sides. Less height on top can give a more balanced frame.':m.shape==='wide'?'Try some height on top with cleaner sides if you want a longer visual frame. A textured crop is another low-maintenance option.':m.shape==='angular'?'Try softer texture, curls, or a side part if you want contrast with the jaw outline. Clean short cuts work too.':'Try a textured crop, side part, or natural curls. Choose the shape you like rather than chasing the score.';
  const hairSuffix=hair==='unknown'?' Select your hairstyle for a more specific note.':hair==='shaved'?' A buzz cut keeps the outline visible; experiment with glasses or clothing around the face for framing.':hair==='long'?' With longer hair, try face-framing layers or moving the part.':hair==='curl'?' Work with your curl pattern; ask a barber for a shape that preserves texture.':hair==='fringe'?' Compare an open forehead and a light fringe in the same lighting.':hair==='volume'?' Compare your current volume with a slightly flatter top.':' Keep the edges tidy and compare a few crop lengths.';
  const tips={hair:{title:'Hairmaxx / build the frame',text:framing+hairSuffix},photo:{title:'Photomaxx / fix the setup',text:m.lowQuality?'The face is tilted or turned. Retake straight on, camera at eye level, in soft window light. This changes the measurements far more than a styling tweak.':'Use soft window light, a neutral expression, and a camera at eye level. Step back and crop instead of shooting very close with a wide lens.'},skin:{title:'Skin routine / keep it simple',text:'A gentle cleanser, moisturizer, and sunscreen are a simple starting routine. '+(texture==='higher'?'The photo has more local texture contrast; retake in softer light before interpreting it.':'Texture depends on lighting and camera processing, so treat the photo estimate lightly.')},jaw:{title:'Jaw frame / presentation first',text:'Try relaxed posture and clear lighting along the jaw. Hair, glasses, and optional facial-hair styling can change the frame. This scan cannot estimate body fat or recommend a target weight.'}};
  const order=goal==='hair'?['hair','photo','jaw']:goal==='skin'?['skin','photo','hair']:goal==='photo'?['photo','hair','jaw']:['hair','photo','skin','jaw'];
  return order.map(k=>tips[k]);
}
export function syntheticLandmarks(){
  const p=Array.from({length:478},()=>({x:.5,y:.48,z:0}));
  FACE_OVAL.forEach((id,i)=>{const a=-Math.PI/2+2*Math.PI*i/FACE_OVAL.length;p[id]={x:.5+.29*Math.cos(a),y:.49+.34*Math.sin(a),z:0}});
  const set=(i,x,y)=>p[i]={x,y,z:0};
  set(10,.5,.14);set(152,.5,.83);set(234,.20,.49);set(454,.80,.49);set(127,.215,.34);set(356,.785,.34);
  set(1,.5,.51);set(9,.5,.32);set(168,.5,.37);set(2,.5,.57);set(98,.427,.535);set(327,.573,.535);
  set(33,.31,.397);set(133,.435,.41);set(263,.69,.397);set(362,.565,.41);
  set(159,.37,.382);set(145,.37,.42);set(386,.63,.382);set(374,.63,.42);
  for(const [i,x,y] of [[160,.34,.389],[158,.40,.393],[153,.40,.419],[144,.34,.414],[387,.66,.389],[385,.60,.393],[380,.60,.419],[373,.66,.414],[70,.31,.335],[63,.34,.33],[105,.37,.33],[66,.40,.334],[107,.435,.35],[300,.69,.335],[293,.66,.33],[334,.63,.33],[296,.60,.334],[336,.565,.35]])set(i,x,y);
  set(61,.38,.658);set(291,.62,.658);set(0,.5,.635);set(13,.5,.65);set(14,.5,.654);set(17,.5,.675);
  set(172,.245,.70);set(397,.755,.70);set(150,.40,.786);set(379,.60,.786);set(148,.46,.823);set(377,.54,.823);return p;
}
