// Own camera lifetime explicitly, including permission requests completed after cancel.
export class CameraController {
  constructor(video,mediaDevices){this.video=video;this.mediaDevices=mediaDevices;this.stream=null;this.revision=0;this.facing='user'}
  stop(){this.revision++;for(const track of this.stream?.getTracks()??[])track.stop();this.stream=null;this.video.srcObject=null}
  async start(facing='user'){
    this.stop();const token=this.revision;this.facing=facing;
    if(!this.mediaDevices?.getUserMedia)throw new Error('Camera capture is unavailable here. Open the app directly in your browser or use Phone camera / upload.');
    const stream=await this.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:1280}}});
    if(token!==this.revision){for(const track of stream.getTracks())track.stop();return false}
    this.stream=stream;this.video.srcObject=stream;
    try{await this.video.play()}catch(error){if(token===this.revision)this.stop();throw error}
    return token===this.revision;
  }
}
export function pastedImage(data){
  for(const item of Array.from(data?.items??[])){if(item.kind==='file'&&item.type.startsWith('image/')){const file=item.getAsFile();if(file)return file}}
  return Array.from(data?.files??[]).find(file=>file.type.startsWith('image/'))??null;
}
export function cameraError(error){
  if(error.name==='NotAllowedError'||error.name==='SecurityError')return 'Camera permission was denied or blocked. Allow camera access in browser settings, open the app directly, or use Phone camera / upload.';
  if(error.name==='NotFoundError')return 'No camera found. Paste or upload a photo instead.';
  if(error.name==='NotReadableError')return 'The camera may be in use by another app. Close it there and try again.';
  return error.message||'Could not open the camera. Try Phone camera / upload instead.';
}
