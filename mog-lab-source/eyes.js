// Observable 2D eye/iris geometry only; no orbital or eyelid diagnosis.
export function eyeReadout(m){
 const {p,q,fw}=m,dist=(a,b)=>Math.hypot(q[a].x-q[b].x,q[a].y-q[b].y);
 const defs=[[33,133,159,145,468,[469,470,471,472]],[263,362,386,374,473,[474,475,476,477]]];
 const eyes=defs.map(([outer,inner,top,bottom,iris,edge])=>{
  const width=dist(outer,inner),height=dist(top,bottom),tilt=Math.atan2(q[inner].y-q[outer].y,Math.abs(q[inner].x-q[outer].x))*180/Math.PI;
  const irisPoints=edge.map(i=>q[i]).filter(Boolean),irisHeight=irisPoints.length?Math.max(...irisPoints.map(v=>v.y))-Math.min(...irisPoints.map(v=>v.y)):0;
  const validIris=q[iris]&&irisHeight>fw*.008&&irisHeight<width*.8&&Math.abs(q[iris].x-(q[inner].x+q[outer].x)/2)<width*.65;
  return {centerX:(p[outer].x+p[inner].x)/2,pfl:width,pfh:height,aspect:height>1?width/height:null,tilt,tiltLabel:tilt>.5?'positive':tilt<-.5?'negative':'near neutral',iris:validIris?iris:null,lowerIrisGap:validIris&&height>1?(q[bottom].y-Math.max(...irisPoints.map(v=>v.y)))/height:null};
 }).sort((a,b)=>a.centerX-b.centerX);
 const pupilDistance=eyes.every(e=>e.iris!==null)?dist(eyes[0].iris,eyes[1].iris):null;
 const outerSpan=dist(33,263),innerSpan=dist(133,362),meanPfl=(eyes[0].pfl+eyes[1].pfl)/2;
 return {eyes,pupilDistance,pupilCheekRatio:pupilDistance===null?null:pupilDistance/fw,pupilOuterRatio:pupilDistance===null?null:pupilDistance/outerSpan,innerCanthalEyeRatio:meanPfl>1?innerSpan/meanPfl:null,outerSpan,innerSpan,notes:'Pixels are image-space lengths, not millimeters. Iris/lid gaps are outline proxies, not lower-eyelid support or a diagnosis. Upper-lid crease, eye depth and orbital vector are not inferred.'};
}
