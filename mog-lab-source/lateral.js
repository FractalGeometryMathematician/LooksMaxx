// Manual surface-outline geometry. Never bone geometry or a surgical diagnosis.
export const LATERAL_POINTS=[
 ['ear','Ear/tragus reference','Visible center of the ear opening; an approximate photo reference.'],
 ['underEye','Under-eye reference','Visible under-eye contour, for an approximate head-level line.'],
 ['bridge','Nose-bridge hollow','Visible dip between forehead and nose.'],
 ['glabella','Forehead/brow outline','Most forward visible contour above the nose bridge.'],
 ['nose','Nose tip','Most forward visible nose tip.'],
 ['subnasale','Nose base','Visible junction of nose base and upper lip.'],
 ['upperLip','Upper lip outline','Most forward point of the visible upper lip.'],
 ['lowerLip','Lower lip outline','Most forward point of the visible lower lip.'],
 ['chin','Chin outline','Most forward visible point of the chin.'],
 ['bottomChin','Bottom of chin','Lowest visible point of the chin.'],
 ['jawCorner','Jaw outline corner','Posterior turn in the visible jaw silhouette.'],
 ['ramusTop','Upper jaw-outline reference','Visible outline below the ear, above the jaw corner; not the bony condyle.']
];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function angle(a,b,c){const x={x:a.x-b.x,y:a.y-b.y},y={x:c.x-b.x,y:c.y-b.y},den=Math.hypot(x.x,x.y)*Math.hypot(y.x,y.y);return den>1?Math.acos(Math.max(-1,Math.min(1,(x.x*y.x+x.y*y.y)/den)))*180/Math.PI:null}
export function lateralMetrics(marks,width,height){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('Invalid profile image dimensions.');
 const p=Object.fromEntries(Object.entries(marks).filter(([,v])=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)).map(([k,v])=>[k,{x:v.x*width,y:v.y*height}]));
 const out=[],add=(key,name,value,unit,note)=>{if(Number.isFinite(value))out.push({key,name,value,unit,note})};
 const has=(...keys)=>keys.every(k=>p[k]);
 const orientation=has('ear','nose')&&p.nose.x<p.ear.x?-1:1;
 let reference=null;
 if(has('ear','underEye')&&distance(p.ear,p.underEye)>5){const dx=orientation*(p.underEye.x-p.ear.x),dy=p.underEye.y-p.ear.y;reference=Math.atan2(dy,dx)*180/Math.PI;add('referenceTilt','Head-reference tilt',reference,'degrees','Ear-to-under-eye photo reference. It does not locate the skeletal Frankfort plane.')}
 if(has('ramusTop','jawCorner','bottomChin')){add('jawAngle','Lateral jaw-outline angle',angle(p.ramusTop,p.jawCorner,p.bottomChin),'degrees','Manual surface-outline angle, not the true skeletal gonial angle.');const ramus=distance(p.ramusTop,p.jawCorner),body=distance(p.jawCorner,p.bottomChin);if(body>5)add('ramusBody','Upper/lower jaw-outline length',ramus/body,'ratio','Visible segment-length ratio, not anatomical ramus height or mandibular body length.')}
 if(has('nose','chin')){const a=p.nose,b=p.chin,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len>5){for(const [key,name] of [['upperLip','Upper lip / E-line-style gap'],['lowerLip','Lower lip / E-line-style gap']])if(p[key]){const signed=orientation*((p[key].x-a.x)*dy-(p[key].y-a.y)*dx)/len;add('eline-'+key,name,100*signed/len,'percent','Signed perpendicular gap normalized by nose–chin line length. Positive is outward. No mm calibration or clinical E-line target.')}}}
 if(reference!==null&&has('subnasale','chin')){const dx=orientation*(p.chin.x-p.subnasale.x),dy=p.chin.y-p.subnasale.y;let a=Math.atan2(dy,dx)*180/Math.PI-reference;while(a>180)a-=360;while(a< -180)a+=360;add('noseChinAngle','Nose-base-to-chin angle',a,'degrees','Angle against your ear/under-eye reference. Surface-photo measurement; not maxillary development.')}
 if(reference!==null&&has('subnasale','chin','bottomChin')){const r=reference*Math.PI/180,dx=orientation*(p.chin.x-p.subnasale.x),dy=p.chin.y-p.subnasale.y,bx=orientation*(p.bottomChin.x-p.subnasale.x),by=p.bottomChin.y-p.subnasale.y,offset=dx*Math.cos(r)+dy*Math.sin(r),height=-bx*Math.sin(r)+by*Math.cos(r);if(height>5)add('chinOffset','Chin-outline offset',offset/height,'ratio','Forward chin offset from the vertical through the nose base / lower-face height, using your head-reference line.')}
 if(has('bridge','glabella','nose'))add('browNoseAngle','Brow/nose outline angle',angle(p.glabella,p.bridge,p.nose),'degrees','Visible outline angle only, not brow-ridge depth or orbital recession.');
 const complete=LATERAL_POINTS.every(([k])=>p[k]);
 return {metrics:out,marked:Object.keys(p).length,total:LATERAL_POINTS.length,complete,referenceAligned:reference===null?null:Math.abs(reference)<=10,source:'manual 2D surface-photo marks',limitations:'2D surface geometry; internal skeletal landmarks and true 3D bone geometry are unavailable.'};
}
