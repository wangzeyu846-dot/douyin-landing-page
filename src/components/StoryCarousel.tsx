import { useEffect, useRef, useState } from 'react';
import AccordionGallery from './react-bits/AccordionGallery';
import { isPreviewCurrent, playPreview, stopPreview } from '../lib/previewPlayback';
import { videoLibrary } from '../data/videoLibrary';
import './StoryCarousel.css';
const examples = [
 {title:'在冰岛追极光',nick:'旅行家小宇',copy:'雪山尽头，等一场天空的回应'},
 {title:'深夜播客',nick:'声东击西播客',copy:'把说不出口的话，留给这一晚'},
 {title:'成都小酒馆',nick:'深夜食堂',copy:'锅气升起，故事下锅'},
 {title:'我家猫又拆家',nick:'猫奴日记',copy:'今天的主角，依旧不听劝'},
 {title:'音乐节实录',nick:'音乐现场',copy:'灯光亮起，一整个夏天都在这'},
];
const images=videoLibrary.depth.map(video=>video.poster);
const colors=['#00F2EA','#7C3AED','#FB923C','#FACC15','#FE2C55'];
const items=images.map((image,i)=>({image,alt:examples[i].title,label:examples[i].title}));
function PanelVideo({index,active,enabled}:{index:number;active:boolean;enabled:boolean}){
 const video=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  const el=video.current!;
  if(!active||!enabled||failed){stopPreview(el);el.pause();try{el.currentTime=0;}catch{/* Metadata not ready. */}setPlaying(false);return;}
  // TODO: 替换为抖音短视频切片；非激活面板不赋 src，不预加载视频。
  if(el.getAttribute('src')!==videoLibrary.depth[index].url)el.src=videoLibrary.depth[index].url;
  void playPreview(el,()=>setPlaying(false));
  return()=>{stopPreview(el);el.pause();try{el.currentTime=0;}catch{/* Metadata not ready. */}};
 },[index,active,enabled,failed]);
 return <video ref={video} className={`accordion-video ${playing?'is-playing':''}`} muted loop playsInline preload="none" aria-hidden="true" onPlaying={e=>{if(isPreviewCurrent(e.currentTarget)&&active&&enabled)setPlaying(true);else e.currentTarget.pause();}} onError={()=>{setFailed(true);setPlaying(false);stopPreview(video.current!);}}/>;
}
export default function StoryCarousel({reducedMotion}:{reducedMotion:boolean}){
 const [visible,setVisible]=useState(false),[hidden,setHidden]=useState(document.hidden);
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>setVisible(entries.some(e=>e.isIntersecting)),{threshold:.1});
  observer.observe(root.current!);const update=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
 },[]);
 return <div ref={root} className="story-carousel">
  <div className="story-carousel-interaction">
   {/* TODO: 替换为抖音截图；所有昵称与作品均为虚构演示。 */}
   <AccordionGallery className="story-accordion" items={items} defaultIndex={0} expandRatio={.5} gap={12} radius={20} height={504} duration={.6} tilt={0} parallax={0} stagger={0} showLabels={false} reducedMotion={reducedMotion} renderMedia={(index,active)=><PanelVideo index={index} active={active} enabled={!reducedMotion&&visible&&!hidden}/>} renderContent={i=><><span className="accordion-accent" style={{background:colors[i]}}/><span>@{examples[i].nick}</span><h3>{examples[i].title}</h3><p>{examples[i].copy}</p></>}/>
  </div>
 </div>;
}
