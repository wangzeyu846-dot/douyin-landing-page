import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChatCircle, Fire, Heart, MusicNote, Play, Star, VinylRecord } from '@phosphor-icons/react';
import './HeroAccents.css';
const icons=[MusicNote,Heart,Play,Star,ChatCircle,Fire,VinylRecord];
const tags=['记录生活','深夜食堂','旅行','美食','萌宠','知识','音乐','运动','科技','剧情','手冲咖啡','露营','citywalk'];
const palette=['#FFFFFF','#00F2EA','#FE2C55'];
export default function HeroAccents({reducedMotion}:{reducedMotion:boolean}) {
 const root=useRef<HTMLDivElement>(null);
 useGSAP(()=>{
  const host=root.current!.closest<HTMLElement>('section')!;
  const floats=Array.from(root.current!.querySelectorAll<HTMLElement>('.hero-float'));
  const title=host.querySelector<HTMLElement>('.hero-title-parallax')!;
  // Separate layers keep pointer parallax independent of the existing scroll exit.
  gsap.set(title,{x:0,y:0,rotationX:0,rotationY:0});
  gsap.set(floats,{x:0,y:0});
  const marquee=root.current!.querySelector<HTMLElement>('.hero-marquee')!;
  const track=marquee.querySelector<HTMLElement>('.hero-marquee-track')!;
  const group=track.firstElementChild as HTMLElement;
  const randoms=floats.map(()=>({dx:gsap.utils.random(-3,3),dy:gsap.utils.random(-12,12),size:gsap.utils.random(20,40,1),opacity:gsap.utils.random(.15,.35),color:gsap.utils.random(palette)}));
  const centers=floats.map(()=>({x:0,y:0,px:0,py:0}));
  const mouse={x:0,y:0,inside:false};let bounds=host.getBoundingClientRect(),visible=true,hovered=false;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const setters=floats.map(node=>({x:gsap.quickSetter(node,'x','px'),y:gsap.quickSetter(node,'y','px')}));
  const titleSet={x:gsap.quickSetter(title,'x','px'),y:gsap.quickSetter(title,'y','px'),rx:gsap.quickSetter(title,'rotationX','deg'),ry:gsap.quickSetter(title,'rotationY','deg')};
  const titlePosition={x:0,y:0,rx:0,ry:0};
  let loop:gsap.core.Tween|undefined,loopWidth=0;
  const drift:gsap.core.Tween[]=[];
  const measure=()=>{
   bounds=host.getBoundingClientRect();const actions=host.querySelector('.hero-actions')!.getBoundingClientRect();
   const bottom=bounds.height*.9-30;
   const top=Math.min(bottom,Math.max(bounds.height*.62,actions.bottom-bounds.top+44));
   floats.forEach((node,i)=>{
    const r=randoms[i],column=i%7,row=Math.floor(i/7);
    const x=gsap.utils.clamp(24,bounds.width-r.size-24,bounds.width*(.16+column*.12+r.dx/100)),y=top+(bottom-top)*(row*.68+.12+r.dy/100);
    node.style.left=`${x}px`;node.style.top=`${y}px`;node.style.fontSize=`${r.size}px`;node.style.opacity=String(r.opacity);node.style.color=r.color;
    centers[i].x=x+r.size/2;centers[i].y=y+r.size/2;
   });
   const width=group.getBoundingClientRect().width;
   if(!reducedMotion&&width>0&&Math.abs(width-loopWidth)>.5){
    const progress=loop?.progress()??0;loop?.kill();loopWidth=width;
    const wrap=gsap.utils.wrap(-width,0);
    loop=gsap.fromTo(track,{x:0},{x:-width,duration:30,repeat:-1,ease:'none',modifiers:{x:value=>`${wrap(parseFloat(value))}px`}}).progress(progress);
    if(hovered||!visible)loop.pause();
   }
  };
  measure();
  if(!reducedMotion){
   floats.forEach(node=>{const inner=node.firstElementChild!;const tween=gsap.fromTo(inner,{x:-10,y:-20,rotation:-5},{x:10,y:20,rotation:5,duration:gsap.utils.random(2,4),repeat:-1,yoyo:true,ease:'sine.inOut'});tween.progress(Math.random());drift.push(tween);});
   drift.push(gsap.fromTo('.hero-scroll-dot',{y:0,opacity:.55},{y:10,opacity:1,duration:1,repeat:-1,yoyo:true,ease:'sine.inOut'}));
  }
  const pointer=(e:PointerEvent)=>{mouse.x=e.clientX-bounds.left;mouse.y=e.clientY-bounds.top;mouse.inside=true;};
  const leave=()=>{mouse.inside=false;};
  const tick=(_time:number,delta:number)=>{
   if(!visible||document.hidden)return;
   const showing=(gsap.getProperty(root.current!,'opacity') as number)>.01;
   const active=mouse.inside&&showing;
   const lerp=1-Math.exp(-Math.min(delta,50)/130);
   centers.forEach((center,i)=>{
    const dx=center.x-mouse.x,dy=center.y-mouse.y,distance=Math.hypot(dx,dy);
    const force=active?Math.max(0,1-distance/120)*16:0;
    center.px+=(dx/(distance||1)*force-center.px)*lerp;center.py+=(dy/(distance||1)*force-center.py)*lerp;
    setters[i].x(center.px);setters[i].y(center.py);
   });
   const nx=active?gsap.utils.clamp(-1,1,mouse.x/bounds.width*2-1):0,ny=active?gsap.utils.clamp(-1,1,mouse.y/bounds.height*2-1):0;
   const targets={x:nx*5,y:ny*5,rx:-ny*2,ry:nx*2};
   (Object.keys(targets) as (keyof typeof targets)[]).forEach(key=>{titlePosition[key]+=(targets[key]-titlePosition[key])*lerp;titleSet[key](titlePosition[key]);});
  };
  const pause=()=>{hovered=true;loop?.pause();};const resume=()=>{hovered=false;if(visible&&!document.hidden)loop?.resume();};
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);drift.forEach(t=>visible&&!document.hidden?t.resume():t.pause());if(visible&&!hovered&&!document.hidden)loop?.resume();else loop?.pause();},{threshold:.01});observer.observe(host);
  const visibility=()=>{drift.forEach(t=>visible&&!document.hidden?t.resume():t.pause());if(visible&&!hovered&&!document.hidden)loop?.resume();else loop?.pause();};
  const resize=new ResizeObserver(measure);resize.observe(host);resize.observe(group);
  if(!reducedMotion){marquee.addEventListener('pointerenter',pause);marquee.addEventListener('pointerleave',resume);document.addEventListener('visibilitychange',visibility);if(fine){host.addEventListener('pointermove',pointer);host.addEventListener('pointerleave',leave);gsap.ticker.add(tick);}}
  return()=>{resize.disconnect();observer.disconnect();gsap.ticker.remove(tick);loop?.kill();drift.forEach(t=>t.kill());host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);marquee.removeEventListener('pointerenter',pause);marquee.removeEventListener('pointerleave',resume);document.removeEventListener('visibilitychange',visibility);};
 },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
 return <div ref={root} className={`hero-accents absolute inset-0 ${reducedMotion?'hero-accents-static':''}`}>
  <div className="hero-floats absolute inset-0 pointer-events-none" aria-hidden="true">{Array.from({length:14},(_,i)=>{const Icon=icons[i%icons.length];return <span className="hero-float absolute" key={i}><span className="block"><Icon size="1em" weight={i%3===0?'fill':'regular'}/></span></span>;})}</div>
  <div className="hero-scroll-hint" aria-hidden="true"><span className="hero-scroll-track"><i className="hero-scroll-dot"/></span><span>向下滑动</span></div>
  <div className="hero-marquee absolute inset-x-0 bottom-0 overflow-hidden" aria-label="内容标签"><div className="hero-marquee-track flex w-max">{[0,1].map(copy=><div className="hero-marquee-group flex shrink-0" key={copy} aria-hidden={copy===1}>{tags.map(tag=><span key={tag}>#{tag}<i aria-hidden="true">·</i></span>)}</div>)}</div></div>
 </div>;
}
