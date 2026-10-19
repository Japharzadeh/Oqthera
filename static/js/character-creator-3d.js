import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const host=document.querySelector('#avatar-3d');
if(host){
  const scene=new THREE.Scene();
  scene.background=null;
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.set(0,2.85,9.3);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xb7c9c6,0x171b1a,2.1));
  const key=new THREE.DirectionalLight(0xffe1c5,3.0);key.position.set(-4,7,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x6eb9b0,2.2);rim.position.set(4,5,-5);scene.add(rim);
  const fill=new THREE.PointLight(0xc16f4c,28,15,2);fill.position.set(2,2.8,4);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(2.3,64),new THREE.MeshBasicMaterial({color:0x9a6448,transparent:true,opacity:.13}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.035;scene.add(ground);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.55,.008,6,100),new THREE.MeshBasicMaterial({color:0xb66d4c,transparent:true,opacity:.52}));
  ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);

  const avatar=new THREE.Group();scene.add(avatar);
  const importedAvatar=new THREE.Group();scene.add(importedAvatar);
  const characterLoader=new GLTFLoader();
  const importedCharacterCache=new Map();
  let activeImportedGender=null;
  let importRequest=0;
  const externalCharacters={
    male:'https://www.innerscene.com/api/library/daniel-3d-person-standing-casual-f788af5a/download',
    female:'https://www.innerscene.com/api/library/jordan-3d-person-athlete-a0770454/download',
    androgynous:'https://www.innerscene.com/api/library/daniel-3d-person-standing-casual-f788af5a/download'
  };
  async function showExternalCharacter(gender){
    const key=gender==='female'?'female':'male';
    if(activeImportedGender===key&&importedAvatar.children.length){avatar.visible=false;importedAvatar.visible=true;return;}
    const request=++importRequest;
    try{
      let gltf=importedCharacterCache.get(key);
      if(!gltf){
        gltf=await new Promise((resolve,reject)=>characterLoader.load(externalCharacters[key],resolve,undefined,reject));
        importedCharacterCache.set(key,gltf);
      }
      if(request!==importRequest)return;
      importedAvatar.clear();
      const model=gltf.scene.clone(true);
      const bounds=new THREE.Box3().setFromObject(model);
      const size=bounds.getSize(new THREE.Vector3());
      const center=bounds.getCenter(new THREE.Vector3());
      const targetHeight=4.65;
      const scale=targetHeight/Math.max(size.y,0.001);
      model.scale.setScalar(scale);
      model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
      model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;if(node.material){node.material=Array.isArray(node.material)?node.material.map(m=>m.clone()):node.material.clone();}}});
      importedAvatar.add(model);
      importedAvatar.visible=true;avatar.visible=false;activeImportedGender=key;
    }catch(error){
      if(request===importRequest){avatar.visible=true;importedAvatar.visible=false;console.warn('Could not load the CC0 character asset; using the built-in preview.',error);}
    }
  }
  let characterParts=[];
  const mats={};
  const mat=(key,color,roughness=.78,metalness=.05)=>{const id=key+'|'+color;if(!mats[id])mats[id]=new THREE.MeshStandardMaterial({color,roughness,metalness});return mats[id]};
  const skinMat=(color)=>new THREE.MeshStandardMaterial({color:new THREE.Color(color||'#e1b795'),roughness:.72});
  function addMesh(geometry,material,parent=avatar,pos=[0,0,0],scale=null){
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...pos);if(scale)mesh.scale.set(...scale);parent.add(mesh);characterParts.push(mesh);return mesh;
  }
  function ellipsoid(parent,position,scale,material,segments=24){return addMesh(new THREE.SphereGeometry(1,segments,16),material,parent,position,scale)}
  function capsule(parent,a,b,radius,material,radius2=radius){
    const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),dir=new THREE.Vector3().subVectors(vb,va);
    const mesh=addMesh(new THREE.CylinderGeometry(radius2,radius,dir.length(),12,1),material,parent,va.clone().add(vb).multiplyScalar(.5).toArray());
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
    ellipsoid(parent,a,[radius,radius,radius],material,12);ellipsoid(parent,b,[radius2,radius2,radius2],material,12);return mesh;
  }
  function curve(parent,points,radius,material){
    const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return addMesh(new THREE.TubeGeometry(path,20,radius,7,false),material,parent);
  }
  function clearAvatar(){for(const child of [...avatar.children]){avatar.remove(child);if(child.geometry)child.geometry.dispose()}characterParts=[]}
  function colorValue(value,fallback){return /^#[0-9a-f]{6}$/i.test(value||'')?value:fallback}
  function buildCharacter(d={}){
    clearAvatar();
    const skin=colorValue(d['skin-tone'],'#e1b795'),hair=colorValue(d['hair-color'],'#554238'),outfit=colorValue(d['outfit-type'],'#4d5d58'),accent=colorValue(d['accent-color'],'#b66d4c'),eyes=colorValue(d['eye-color'],'#6c8878');
    const gender=d.gender||'male',build=d['character-build']||d.build||'Average';
    const skinM=skinMat(skin),hairM=mat('hair',hair,.88),cloth=mat('cloth',outfit,.92),trim=mat('trim',accent,.6,.2);
    const dark=mat('dark',0x1a2221,.86),black=mat('black',0x101515,.62),metal=mat('metal',0x68736d,.42,.65),eyeWhite=mat('eye-white',0xe5e2d8,.28),iris=mat('iris',eyes,.3),pupil=mat('pupil',0x101414,.18),lip=mat('lip',0x89584e,.8),scarMat=mat('scar',0xe4b49a,.9);
    const female=gender==='female',androgynous=gender==='androgynous';
    const broad=build==='Broad'?1.17:build==='Lean'?.86:build==='Athletic'?1.06:1;
    const torsoW=(female?.72:.82)*(androgynous?.96:1)*broad;
    const torso=ellipsoid(avatar,[0,2.65,0],[torsoW,.9,.39],cloth,32);
    torso.rotation.z=.015;
    // Collar, layered survival suit and hard-shell panels.
    ellipsoid(avatar,[0,3.26,.015],[.39,.28,.32],dark);
    capsule(avatar,[-.28,3.28,.17],[0,2.8,.36],.035,trim);
    capsule(avatar,[.28,3.28,.17],[0,2.8,.36],.035,trim);
    ellipsoid(avatar,[0,2.7,.36],[.25,.43,.055],dark);
    ellipsoid(avatar,[0,2.75,.42],[.15,.27,.025],trim);
    for(const x of [-1,1]){
      ellipsoid(avatar,[x*.43,3.13,0],[.27,.31,.34],metal);
      capsule(avatar,[x*.57,3.05,0],[x*.79,2.42,.01],.16,cloth,.135);
      ellipsoid(avatar,[x*.79,2.4,.01],[.145,.18,.145],dark);
      capsule(avatar,[x*.79,2.35,.01],[x*.84,1.86,.06],.105,metal,.095);
      // Narrow palm with separate fingers and a thumb; avoid a spherical hand shape.
      ellipsoid(avatar,[x*.84,1.755,.075],[.067,.095,.043],skinM,20);
      for(let f=0;f<4;f++){
        const fx=x*.84+(f-1.5)*.032;
        capsule(avatar,[fx,1.72,.105],[fx+(f-1.5)*.004,1.625-(Math.abs(f-1.5)*.012),.112],.012,skinM,.008);
      }
      capsule(avatar,[x*.84-x*.055,1.77,.075],[x*.84-x*.09,1.70,.09],.018,skinM,.012);
      // Shoulder armour and forearm bracer.
      ellipsoid(avatar,[x*.49,3.14,.015],[.25,.19,.3],cloth);
      ellipsoid(avatar,[x*.49,3.14,.27],[.19,.11,.045],trim);
      ellipsoid(avatar,[x*.81,2.08,.055],[.125,.22,.13],dark);
      capsule(avatar,[x*.81,2.16,.18],[x*.81,1.98,.18],.022,trim,.022);
    }
    // Belt, utility modules and trousers.
    ellipsoid(avatar,[0,1.95,0],[.53,.22,.34],dark);
    ellipsoid(avatar,[0,1.96,.31],[.12,.1,.035],trim);
    for(const x of [-.34,.34]){ellipsoid(avatar,[x,1.94,.25],[.12,.15,.11],metal);ellipsoid(avatar,[x,1.94,.33],[.07,.08,.025],black)}
    for(const x of [-.23,.23]){
      capsule(avatar,[x*.82,1.88,0],[x,1.02,0],.19,cloth,.145);
      ellipsoid(avatar,[x,1.12,.015],[.15,.24,.17],dark);
      capsule(avatar,[x,1.02,0],[x*1.04,.38,.015],.115,cloth,.105);
      ellipsoid(avatar,[x*1.04,.29,.13],[.16,.17,.31],black);
      ellipsoid(avatar,[x*1.04,.2,.24],[.16,.055,.15],trim);
      capsule(avatar,[x*1.04,.43,.13],[x*1.04,.31,.13],.02,metal);
      ellipsoid(avatar,[x*1.04,.48,.11],[.12,.12,.12],dark);
    }
    // Backpack and shoulder harness.
    ellipsoid(avatar,[0,2.75,-.39],[.43,.62,.23],dark);
    ellipsoid(avatar,[0,3.1,-.43],[.34,.24,.2],metal);
    ellipsoid(avatar,[0,2.62,-.59],[.27,.25,.04],trim);
    capsule(avatar,[-.32,3.27,.23],[.0,2.3,.36],.035,metal);
    capsule(avatar,[.32,3.27,.23],[.0,2.3,.36],.035,metal);
    // Neck and head proportions react to face shape, age and presentation.
    capsule(avatar,[0,3.34,0],[0,3.91,0],.205,skinM,.19);
    const faceShape=d['face-shape-choice']||'angular';
    const faceWidth=faceShape==='round'?.52:faceShape==='long'?.46:.48;
    const faceHeight=faceShape==='long'?.68:faceShape==='round'?.56:.61;
    const headY=4.27;
    const head=ellipsoid(avatar,[0,headY,0],[faceWidth,faceHeight,.43],skinM,32);
    if(faceShape==='angular')head.scale.set(faceWidth*.94,faceHeight,.43);
    // Small, anatomically placed ears with a subtle inner fold.
    for(const side of [-1,1]){
      ellipsoid(avatar,[side*.455,4.245,-.005],[.052,.12,.058],skinM,24);
      ellipsoid(avatar,[side*.481,4.245,.026],[.021,.073,.018],mat('ear-inner',0x9d7562,.9),20);
      ellipsoid(avatar,[side*.468,4.245,.042],[.012,.043,.009],skinM,16);
    }
    // Build each hairstyle from its own silhouette; no shared helmet-like scalp mesh.
    const hairStyle=d['hair-style']||'messy';
    const hairLock=(a,b,r1,r2=r1)=>capsule(avatar,a,b,r1,hairM,r2);
    const hairCurl=(x,y,z,rx,ry=rx,rz=rx)=>ellipsoid(avatar,[x,y,z],[rx,ry,rz],hairM,16);
    if(hairStyle==='shaved'){
      // A shaved head deliberately has no hair geometry.
    }else if(hairStyle==='mohawk'){
      // Narrow raised ridge with tapered front and rear ends.
      hairLock([0,4.57,-.24],[0,4.76,-.12],.055,.045);
      hairLock([0,4.76,-.12],[0,4.82,.10],.065,.052);
      hairLock([0,4.82,.10],[0,4.69,.27],.052,.018);
      for(const side of [-1,1]){
        hairLock([side*.27,4.54,-.08],[side*.24,4.63,.12],.018,.012);
      }
    }else if(hairStyle==='curly'){
      // Individual rounded curls create a textured silhouette instead of a smooth cap.
      for(let row=0;row<3;row++){
        const count=row===0?15:row===1?12:8;
        for(let i=0;i<count;i++){
          const a=i/count*Math.PI*2+(row%2)*.16;
          const radius=row===0?.31:row===1?.235:.13;
          const x=Math.cos(a)*radius;
          const z=Math.sin(a)*radius*.83-.015;
          const y=row===0?4.53:row===1?4.67:4.76;
          hairCurl(x,y+Math.cos(a*3+row)*.018,z,.065,.066,.061);
        }
      }
      hairCurl(-.16,4.78,.17,.058,.06,.052);
      hairCurl(0,4.81,.19,.06,.063,.055);
      hairCurl(.16,4.78,.17,.058,.06,.052);
    }else if(hairStyle==='long'){
      // Swept top locks flow into separate side lengths.
      hairLock([-.34,4.55,-.02],[-.22,4.76,.08],.075,.065);
      hairLock([-.22,4.76,.08],[.02,4.82,.11],.07,.055);
      hairLock([.02,4.82,.11],[.25,4.73,.06],.06,.048);
      hairLock([.25,4.73,.06],[.34,4.55,-.01],.052,.045);
      for(const side of [-1,1]){
        hairLock([side*.35,4.57,-.015],[side*.43,4.28,-.015],.07,.055);
        hairLock([side*.43,4.28,-.015],[side*.41,3.99,-.025],.055,.035);
        hairLock([side*.30,4.58,.13],[side*.34,4.27,.14],.048,.038);
        hairLock([side*.34,4.27,.14],[side*.32,4.04,.12],.038,.025);
      }
    }else if(hairStyle==='messy'){
      // Uneven swept locks with visible gaps and varied directions.
      hairLock([-.34,4.52,-.04],[-.24,4.72,.06],.065,.045);
      hairLock([-.24,4.72,.06],[-.30,4.83,.08],.045,.012);
      hairLock([-.20,4.59,.16],[-.10,4.78,.20],.064,.042);
      hairLock([-.10,4.78,.20],[-.02,4.88,.14],.042,.012);
      hairLock([-.04,4.60,.20],[.10,4.78,.19],.06,.042);
      hairLock([.10,4.78,.19],[.20,4.84,.10],.042,.012);
      hairLock([.15,4.58,.15],[.29,4.71,.08],.06,.04);
      hairLock([.29,4.71,.08],[.34,4.76,.01],.04,.012);
      hairLock([-.28,4.60,-.12],[-.16,4.74,-.20],.05,.025);
      hairLock([.04,4.62,-.17],[.20,4.73,-.15],.05,.024);
    }else{
      // Short textured crop: many small fitted locks, not a single solid shell.
      for(let row=0;row<4;row++){
        const count=row===0?13:row===1?11:row===2?8:5;
        for(let i=0;i<count;i++){
          const x=(i/(count-1)-.5)*(row===0?.62:row===1?.50:row===2?.34:.18);
          const z=row===0?-.12:row===1?.055:row===2?.15:.19;
          const y=row===0?4.52:row===1?4.66:row===2?4.73:4.76;
          hairLock([x,y-.035,z-.015],[x+.018,y+.025,z+.005],.035,.024);
        }
      }
    }
    // Eyes, lids, brows and facial structure are actual 3D geometry.
    for(const side of [-1,1]){
      // Recessed eye sockets and shallow eye layers reduce the bulging look.
      ellipsoid(avatar,[side*.19,4.36,.378],[.105,.058,.023],mat('eye-socket',0x9f7b65,.92),20);
      ellipsoid(avatar,[side*.19,4.36,.394],[.079,.034,.014],eyeWhite,20);
      ellipsoid(avatar,[side*.19,4.36,.405],[.035,.029,.009],iris,16);
      ellipsoid(avatar,[side*.19,4.36,.412],[.016,.02,.006],pupil,12);
      ellipsoid(avatar,[side*.19,4.36,.415],[.006,.007,.003],mat('eye-glint',0xffffff,.2),8);
      curve(avatar,[[side*.29,4.36,.389],[side*.19,4.397,.404],[side*.09,4.36,.389]],.008,skinM);
      const browStyle=d['brow-style']||'natural';
      curve(avatar,[[side*.09,4.48,.39],[side*.19,4.51+(browStyle==='strong'?.025:0),.4],[side*.29,4.48,.38]],browStyle==='soft'?.018:browStyle==='strong'?.035:.026,hairM);
    }
    // Nose bridge, tip and nostrils; nose selection changes the real mesh.
    const noseType=d['nose-type']||'straight';
    const noseWidth=noseType==='broad'?.115:noseType==='refined'?.065:noseType==='button'?.075:.085;
    const noseLength=noseType==='button'?.18:noseType==='aquiline'?.27:.23;
    capsule(avatar,[0,4.34,.39],[noseType==='aquiline'?.035:0,4.34-noseLength,.51],noseWidth,skinM,noseWidth*.72);
    ellipsoid(avatar,[noseType==='aquiline'?.035:0,4.34-noseLength,.515],[noseWidth*1.25,.065,.065],skinM);
    for(const side of [-1,1])ellipsoid(avatar,[side*noseWidth*.7,4.34-noseLength+.005,.55],[.025,.014,.015],mat('nostril',0x795642));
    // Mouth and lips with selectable volume/width.
    const lipType=d['lips-type']||'natural',lipW=lipType==='wide'?.17:lipType==='thin'?.105:.135,lipH=lipType==='full'?.07:lipType==='thin'?.022:.042;
    ellipsoid(avatar,[0,4.0,.405],[lipW,lipH,.035],lip);
    curve(avatar,[[-lipW*.8,4.01,.437],[0,4.015+lipH*.15,.442],[lipW*.8,4.01,.437]],.008,mat('lip-line',0x4a302b));
    // Facial hair.
    const facial=d['facial-hair']||'stubble';
    if(facial!=='none'){
      const beardMat=mat('beard',hair,.95);
      if(facial==='beard'||facial==='stubble'){
        ellipsoid(avatar,[0,3.91,.25],[.39,.19,.25],beardMat);
        ellipsoid(avatar,[0,4.02,.37],[.31,.105,.12],beardMat);
      }else if(facial==='goatee')ellipsoid(avatar,[0,3.91,.4],[.13,.15,.06],beardMat);
      if(facial==='mustache'||facial==='beard'||facial==='stubble'){
        for(const side of [-1,1])ellipsoid(avatar,[side*.09,4.06,.414],[.11,.045,.04],beardMat);
      }
    }
    // Face detail choices.
    if(d['skin-detail']==='freckles'){
      const freckle=mat('freckle',0x855e48,.9);
      for(let i=0;i<14;i++){const x=((i%7)-3)*.047;const y=4.18+Math.floor(i/7)*.035;ellipsoid(avatar,[x,y,.424],[.009,.009,.006],freckle,8)}
    }
    if(d['skin-detail']==='weathered'||Number(d['scar-intensity'])>65){
      curve(avatar,[[-.27,4.18,.42],[-.22,4.16,.43],[-.18,4.17,.43]],.008,mat('weather',0x9d7059));
      curve(avatar,[[.24,4.2,.42],[.29,4.18,.42],[.31,4.16,.41]],.008,mat('weather2',0x9d7059));
    }
    if(d['scar-type']!=='none'||d['skin-detail']==='scar'){
      const scarPos=d['scar-type']==='brow'?4.48:4.16;
      curve(avatar,[[-.25,scarPos,.45],[-.18,scarPos-.06,.46],[-.12,scarPos-.1,.45]],.012,scarMat);
    }
    // Eyewear: glasses or a translucent technical visor.
    const eyewear=d['glasses-type']||'none';
    if(eyewear!=='none'){
      const frame=mat('frames',eyewear==='visor'?0x6db9ad:0x202827,.35,.55);
      if(eyewear==='visor'){
        const visor=addMesh(new THREE.BoxGeometry(.77,.22,.045),new THREE.MeshPhysicalMaterial({color:0x6db9ad,roughness:.22,metalness:.35,transparent:true,opacity:.36,clearcoat:.8}),avatar,[0,4.36,.45]);
        visor.rotation.x=-.04;
      }else{
        for(const side of [-1,1]){
          const lens=addMesh(new THREE.TorusGeometry(.09,.012,8,24),frame,avatar,[side*.19,4.36,.465]);lens.scale.set(1.15,.8,1);
        }
        capsule(avatar,[-.09,4.36,.465],[.09,4.36,.465],.012,frame);
      }
    }
    // Tattoos and accessory loadout.
    if(d['tattoo-type']!=='none'){
      const tattoo=mat('tattoo',0x263b3a,.95);
      if(d['tattoo-type']==='neck')curve(avatar,[[-.12,3.55,.15],[-.04,3.5,.19],[.04,3.55,.19],[.12,3.5,.15]],.018,tattoo);
      else if(d['tattoo-type']==='wrist')curve(avatar,[[.61,1.83,.12],[.7,1.8,.12],[.7,1.76,.12]],.018,tattoo);
      else curve(avatar,[[.55,2.88,.17],[.65,2.82,.18],[.55,2.75,.18],[.65,2.68,.18]],.018,tattoo);
    }
    if(d['accessory-type']==='earring'){
      for(const side of [-1,1])ellipsoid(avatar,[side*.49,4.14,.04],[.025,.04,.025],trim,12);
    }else if(d['accessory-type']==='headset'){
      for(const side of [-1,1])ellipsoid(avatar,[side*.49,4.28,.015],[.09,.14,.1],dark);
      capsule(avatar,[-.48,4.38,-.02],[.0,4.64,-.02],.025,metal);
      capsule(avatar,[-.48,4.19,.02],[-.25,4.04,.23],.018,trim);
    }else if(d['accessory-type']==='respirator'){
      ellipsoid(avatar,[0,4.08,.48],[.24,.18,.12],dark);
      ellipsoid(avatar,[0,4.08,.585],[.11,.09,.025],metal);
      ellipsoid(avatar,[0,4.08,.61],[.055,.05,.012],trim);
      for(const side of [-1,1])ellipsoid(avatar,[side*.2,4.08,.48],[.07,.1,.055],metal);
    }
    // Age impression via subtle forehead lines.
    if(['36–45','46–55','56+'].includes(d['character-age']||d.age)){
      const ageMat=mat('age-lines',0x9b725d,.9);
      curve(avatar,[[-.16,4.58,.37],[0,4.59,.39],[.16,4.58,.37]],.006,ageMat);
      if((d['character-age']||d.age)==='56+')curve(avatar,[[-.23,4.27,.43],[-.18,4.25,.44],[-.13,4.27,.43]],.006,ageMat);
    }
    // Weathering affects the clothing finish without hiding the character.
    const weather=Number(d['scar-intensity']||0)/100;
    if(weather>.25){
      for(let i=0;i<5;i++)ellipsoid(avatar,[((i%2)*2-1)*(.23+i*.025),2.35+i*.13,.35],[.025+weather*.025,.035,.009],mat('dust'+i,0x887a66,.98));
    }
    // Build pivot groups from the exact meshes used by the creator, so gameplay can animate the selected outfit and body without replacing its appearance.
    const limbGroups={arms:[],legs:[]};
    const makePivotGroup=(name,pivot)=>{
      const group=new THREE.Group();
      group.name=name;
      group.position.set(...pivot);
      avatar.add(group);
      return group;
    };
    const kneeGroups=[];
    for(const side of [-1,1]){
      const arm=makePivotGroup(side<0?'oqArmLeft':'oqArmRight',[side*.49,3.14,0]);
      const leg=makePivotGroup(side<0?'oqLegLeft':'oqLegRight',[side*.19,1.88,0]);
      const knee=new THREE.Group();
      knee.name=side<0?'oqKneeLeft':'oqKneeRight';
      knee.position.set(0,1.02-1.88,0);
      leg.add(knee);
      for(const child of [...avatar.children]){
        if(child===arm||child===leg||!child.isMesh)continue;
        const x=child.position.x,y=child.position.y;
        const armMesh=Math.sign(x||side)===side&&Math.abs(x)>=.55&&y>=1.55&&y<=3.16;
        const legMesh=Math.sign(x||side)===side&&Math.abs(x)<=.29&&y>.1&&y<=1.95;
        if(armMesh){
          avatar.remove(child);
          child.position.x-=arm.position.x;child.position.y-=arm.position.y;child.position.z-=arm.position.z;
          arm.add(child);
        }else if(legMesh){
          avatar.remove(child);
          const lowerLeg=y<=1.12;
          child.position.x-=side*.19;
          child.position.y-=lowerLeg?1.02:1.88;
          child.position.z-=0;
          (lowerLeg?knee:leg).add(child);
        }
      }
      limbGroups.arms.push(arm);limbGroups.legs.push(leg);kneeGroups.push(knee);
    }
    avatar.userData.oqtheraLimbNames={arms:['oqArmLeft','oqArmRight'],legs:['oqLegLeft','oqLegRight'],knees:['oqKneeLeft','oqKneeRight']};
    avatar.visible=true;importedAvatar.visible=false;
  }
  let targetYaw=0,targetPitch=0,currentYaw=0,currentPitch=0,targetZoom=9.3,currentZoom=9.3,dragging=false,lastX=0,lastY=0;
  const view=(name)=>{if(name==='front'){targetYaw=0;targetPitch=0;targetZoom=9.3}else if(name==='back'){targetYaw=Math.PI;targetPitch=0;targetZoom=9.3}else if(name==='face'){targetYaw=0;targetPitch=.03;targetZoom=6.1}else{targetYaw=0;targetPitch=0;targetZoom=9.3}};
  host.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture?.(e.pointerId)});
  host.addEventListener('pointermove',e=>{if(!dragging)return;targetYaw+=(e.clientX-lastX)*.009;targetPitch=Math.max(-.45,Math.min(.45,targetPitch+(e.clientY-lastY)*.005));lastX=e.clientX;lastY=e.clientY});
  host.addEventListener('pointerup',()=>dragging=false);host.addEventListener('pointercancel',()=>dragging=false);
  host.addEventListener('wheel',e=>{e.preventDefault();targetZoom=Math.max(5.1,Math.min(12.5,targetZoom+e.deltaY*.008))},{passive:false});
  document.querySelectorAll('[data-avatar-view]').forEach(button=>button.addEventListener('click',()=>view(button.dataset.avatarView)));
  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(host);resize();
  window.update3DCharacter=(data)=>buildCharacter(data);
  window.createOqtheraGameplayCharacter=(data)=>{
    const characterData=data||JSON.parse(localStorage.getItem('oqthera.character')||'{}');
    buildCharacter(characterData);
    const model=avatar.clone(true);
    model.name='OqtheraSelectedCharacter';
    model.scale.setScalar(0.36);
    model.position.set(0,0,0);
    model.rotation.set(0,Math.PI,0);
    model.visible=true;
    model.traverse(node=>{
      if(node.isMesh){
        node.castShadow=true;
        node.receiveShadow=true;
      }
    });
    return model;
  };
  try{const saved=JSON.parse(localStorage.getItem('oqthera.character')||'null');if(saved)buildCharacter(saved);else buildCharacter({})}catch{buildCharacter({})}
  function animate(){requestAnimationFrame(animate);currentYaw+=(targetYaw-currentYaw)*.12;currentPitch+=(targetPitch-currentPitch)*.12;currentZoom+=(targetZoom-currentZoom)*.12;avatar.rotation.y=currentYaw;avatar.rotation.x=currentPitch;importedAvatar.rotation.y=currentYaw;importedAvatar.rotation.x=currentPitch;camera.position.z=currentZoom;camera.lookAt(0,2.55,0);renderer.render(scene,camera)}
  animate();
}
