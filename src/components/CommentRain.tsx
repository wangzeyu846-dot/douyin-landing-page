import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from './react-bits/SplitText';
import './CommentRain.css';
import UserComments from './UserComments';

gsap.registerPlugin(useGSAP, ScrollTrigger);
const comments = [
 '哈哈哈这也太好笑了','求 BGM！！','看完直接关注了','这是什么神仙地方','我也想这样生活','博主哪里人','一秒钟看完整部剧','眼泪不值钱','这舞也太丝滑了','已截图，周末就去','原来还能这样','这也太治愈了','前方高能','第一秒我就笑了','这谁顶得住','家人们谁懂啊','一整个爱住','看完想辞职','这就是我梦想的生活',
 '这个镜头我反复看了十遍','谢谢你拍下这一刻','隔着屏幕都闻到香了','下班路上被你治愈了','妈妈也给这条点了赞','这一幕好像我的小时候','收藏夹又多了一个目的地','原来普通日子也会发光','跟着学了一遍，真的会了','今晚就试试这个做法',
 '最后一秒给我看愣了','转给朋友一起笑了','认真生活的人真的很酷','这声音一下就把我拉回夏天','今天的快乐是你给的','已经循环到忘记时间了','替我去看看那片海吧','这一刻值得一个长镜头','看到这里突然有了勇气','谢谢，让我想起家了','好想给镜头里的你一个拥抱','平凡的一天也有自己的光','这个转场太会了','刚刚还在难过，现在笑了','我把这段发给了爸爸','隔了很远，也像在身边','你拍到了我没注意的美','愿我们都能继续热爱','明天也要好好过呀',
];
// Stable variety prevents React renders from changing the composition.
const samples = comments.map((text, i) => ({ text, lane:i%8, size:14+(i*7%9), opacity:.35+(i*17%51)/100, speed:20+(i*13%41), color:i%9===0?'#a8e6e3':i%11===0?'#e9b7c0':i%3===0?'#bdbdbd':'#fff' }));
export default function CommentRain({ reducedMotion }: { reducedMotion:boolean }) {
 const root=useRef<HTMLElement>(null), stage=useRef<HTMLDivElement>(null), chars=useRef<Element[]>([]);
 const [ready,setReady]=useState(false);
 const onReady=useCallback((elements:Element[])=>{chars.current=elements;setReady(true);},[]);
 const onCleanup=useCallback(()=>{chars.current=[];},[]);
 const {contextSafe}=useGSAP(()=>{
  if(!ready||!root.current||!stage.current)return;
  const mm=gsap.matchMedia();
  mm.add({full:'(prefers-reduced-motion: no-preference)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
   if(reducedMotion||context.conditions?.reduce){gsap.set(chars.current,{clearProps:'all'});return;}
   const panel=stage.current!, field=panel.querySelector<HTMLElement>('.comment-field')!;
   const nodes=Array.from(panel.querySelectorAll<HTMLElement>('.rain-comment'));
   const envelope=panel.querySelector('.rain-envelope')!;
   const loops:gsap.core.Tween[]=[];
   const motion={speed:1};
   const buildLoops=()=>{
    loops.forEach(t=>t.kill());loops.length=0;
    const width=panel.clientWidth;
    // Six comments per lane: wrapping occurs in a long invisible tail offscreen.
    const span=Math.max(width*2.8,2400);
    nodes.forEach((node,i)=>{
     const left=-node.offsetWidth-80,right=width+span;
     const distance=right-left;
     const offset=(Math.floor(i/8)/6)*distance+(i%8)*41;
     const wrap=gsap.utils.wrap(left,right);
     const tween=gsap.fromTo(node,{x:right-offset},{x:right-offset-distance,duration:distance/samples[i].speed,repeat:-1,ease:'none',paused:true,
      modifiers:{x:value=>`${wrap(parseFloat(value))}px`}});
     tween.timeScale(motion.speed);loops.push(tween);
    });
   };
   buildLoops();
   gsap.set(envelope,{autoAlpha:0});
   gsap.set(chars.current,{autoAlpha:0,y:28});
   gsap.set('.rain-signature',{autoAlpha:0,y:12});
   const entrance=gsap.timeline({paused:true}).to(envelope,{autoAlpha:1,duration:.6,ease:'power2.out'},0);
   const start=()=>{entrance.restart();loops.forEach(t=>t.play());};
   const stop=()=>{entrance.pause();loops.forEach(t=>t.pause());};
   const entry=ScrollTrigger.create({trigger:panel,start:'top bottom',end:'bottom top',refreshPriority:-2,onEnter:start,onEnterBack:()=>loops.forEach(t=>t.play()),onLeave:stop,onLeaveBack:stop});
   const master=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'comment-rain',trigger:panel,start:'top top',end:()=>`+=${innerHeight*1.5}`,pin:true,pinSpacing:true,scrub:.25,invalidateOnRefresh:true,refreshPriority:-2,
    onEnter:()=>loops.forEach(t=>t.play()),onEnterBack:()=>loops.forEach(t=>t.play()),onLeave:stop,onLeaveBack:stop,
    onUpdate:self=>{root.current!.dataset.rainProgress=self.progress.toFixed(3);}}});
   master.addLabel('words',0)
    .to(chars.current,{autoAlpha:1,y:0,duration:24,stagger:{amount:22},ease:'power2.out'},0)
    .to('.rain-signature',{autoAlpha:1,y:0,duration:10},35)
    .addLabel('acceleration',50)
    .to(motion,{speed:3,duration:50,onUpdate:()=>{loops.forEach(t=>t.timeScale(motion.speed));root.current!.dataset.rainSpeed=motion.speed.toFixed(2);}},50)
    .to(field,{filter:'blur(8px)',opacity:.15,duration:50},50)
    .to('.rain-quote',{autoAlpha:0,duration:45},50)
    .to(envelope,{autoAlpha:0,duration:4},96)
    .to('.comment-composer',{autoAlpha:0,duration:4},96);
   const refresh=()=>{const active=master.scrollTrigger?.isActive;buildLoops();if(active)loops.forEach(t=>t.play());};
   ScrollTrigger.addEventListener('refreshInit',refresh);
   ScrollTrigger.refresh();
   if(entry.isActive)start();
   return()=>{ScrollTrigger.removeEventListener('refreshInit',refresh);loops.forEach(t=>t.kill());entrance.kill();entry.kill();};
  },root);
  return()=>mm.revert();
 },{scope:root,dependencies:[ready,reducedMotion],revertOnUpdate:true});
 const emphasize=contextSafe((index:number|null)=>{
  root.current?.querySelectorAll<HTMLElement>('.rain-comment').forEach((node,i)=>gsap.to(node,{opacity:index===i?1:samples[i].opacity*(index===null?1:.5),fontWeight:index===i?700:400,duration:reducedMotion?0:.18,overwrite:'auto'}));
 });
 return <section ref={root} id="comment-rain" className={`comment-rain ${reducedMotion?'rain-static':''}`} aria-label="弹幕雨">
  <div className="rain-pin-shell"><div ref={stage} className="rain-stage relative overflow-hidden bg-night">
   <div className="rain-envelope"><div className="comment-field" aria-hidden={!reducedMotion} onPointerLeave={()=>emphasize(null)}>
    {samples.map((sample,i)=><span key={sample.text} className="rain-comment whitespace-nowrap" style={{top:`${7+sample.lane*12}%`,fontSize:sample.size,opacity:sample.opacity,color:sample.color}} onPointerEnter={event=>{if(event.pointerType==='mouse')emphasize(i);}}>{sample.text}</span>)}
   </div>
   <div className="rain-quote pointer-events-none px-gutter text-center text-ink">
    <SplitText text="你随手划走的，是别人认真活过的一天。" tag="h2" textAlign="center" className="rain-title font-bold" onReady={onReady} onCleanup={onCleanup}/>
    <p className="rain-signature">—— 这就是抖音。</p>
   </div>
   </div>
   <UserComments reducedMotion={reducedMotion}/>
  </div></div>
  <div className="rain-breath" aria-hidden="true"/>
 </section>;
}
