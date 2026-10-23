export function validatePhotos(files:unknown[], expectedCount:1|2=2): asserts files is File[] {
 if(files.length!==expectedCount) throw new Error(`Upload ${expectedCount === 1 ? "one photo" : "two photos"}.`);
 for(const file of files) {
  if(!(file instanceof File) || !["image/jpeg","image/png","image/webp"].includes(file.type) || file.size<1 || file.size>1800000)
   throw new Error("Upload JPG, PNG or WebP photos, each optimized below 1.8 MB.");
 }
}
export async function validatePhotoBytes(file:File) {
 const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const jpg=b[0]===255 && b[1]===216 && b[2]===255;
 const png=b[0]===137 && b[1]===80 && b[2]===78 && b[3]===71;
 const webp=String.fromCharCode(...b.slice(0,4))==="RIFF" && String.fromCharCode(...b.slice(8,12))==="WEBP";
 if(!(file.type==="image/jpeg" && jpg || file.type==="image/png" && png || file.type==="image/webp" && webp)) throw new Error("File content does not match its image type.");
}
