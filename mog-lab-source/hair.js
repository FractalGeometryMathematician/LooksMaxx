export const HAIR_LABELS={unknown:'Not clear',short:'Short / cropped',volume:'Volume on top',fringe:'Fringe / bangs',long:'Medium / long',curl:'Curly / textured',shaved:'Shaved / buzz cut'};
export function classifyHairOutline(f){
  // Heuristics on a detected hair silhouette, not a trained haircut classifier.
  if(f.clipped)return {style:'unknown',label:'Hair cropped out',note:'Include the top and sides of your hair in the photo.'};
  if(f.coverage<.025)return {style:'unknown',label:'Hair not clear',note:'Very short hair, occlusion or lighting may leave too little visible hair. Choose a style manually.'};
  let style='short';
  if(f.sideLength>.63)style='long';else if(f.fringeCoverage>.16)style='fringe';else if(f.topHeight>.27)style='volume';
  return {style,label:HAIR_LABELS[style],note:'Automatic suggestion from the visible hair outline. Correct it below if needed; curl type and exact cuts are not classified.'};
}
export function inspectHairMask(data,width,height,landmarks,imageWidth,imageHeight){
  if(data.length!==width*height||width<2||height<2)throw new Error('Invalid hair mask.');
  const p=landmarks.map(v=>({x:v.x*imageWidth,y:v.y*imageHeight})),origin=p[10];
  const dx=p[454].x-p[234].x,dy=p[454].y-p[234].y,fw=Math.hypot(dx,dy);
  if(!(fw>0))throw new Error('Invalid face width.');
  const ux=dx/fw,uy=dy/fw,vx=-uy,vy=ux;
  const normalize=(x,y)=>{const ax=x-origin.x,ay=y-origin.y;return {x:(ax*ux+ay*uy)/fw,y:(ax*vx+ay*vy)/fw}};
  const browY=(normalize(p[33].x,p[33].y).y+normalize(p[263].x,p[263].y).y)/2;
  let count=0,topCount=0,topYs=[],sideYs=[],fringe=0,fringeTotal=0,edge=0,roi=0;
  // A fixed face-relative region excludes shoulders, clothing, and most background hair.
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const v=normalize((x+.5)/width*imageWidth,(y+.5)/height*imageHeight);
    if(Math.abs(v.x)>.85||v.y<-.8||v.y>1.4)continue;
    roi++;const hair=data[y*width+x]>=.70;
    if(Math.abs(v.x)<.30&&v.y>.03&&v.y<Math.max(.07,browY*.85)){fringeTotal++;if(hair)fringe++}
    if(!hair)continue;count++;
    if(y<2||x<2||x>width-3)edge++;
    if(v.y<0){topCount++;topYs.push(v.y)}
    if(Math.abs(v.x)>.36&&v.y>0)sideYs.push(v.y);
  }
  const quantile=(a,q)=>{a.sort((a,b)=>a-b);return a.length?a[Math.floor((a.length-1)*q)]:0};
  const features={coverage:count/Math.max(1,roi),topHeight:Math.max(0,-quantile(topYs,.05)),sideLength:quantile(sideYs,.95),fringeCoverage:fringe/Math.max(1,fringeTotal),clipped:edge>Math.max(4,count*.006)&&topCount>10};
  return {...classifyHairOutline(features),features};
}
