import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Play } from '@phosphor-icons/react';
import SplitText from './react-bits/SplitText';
import Phone from './Phone';
import HeroAccents from './HeroAccents';
import './CinematicHero.css';
gsap.registerPlugin(useGSAP,ScrollTrigger);
export default function CinematicHero({reducedMotion,onNavigate}:{reducedMotion:boolean;onNavigate:(index:number)=>void}){
 const root=useRef<HTMLElement>(null),device=useRef<HTMLDivElement>(null),focus=useRef<HTMLDivElement>(null);
 const heroChars=useRef<Element[]>([]),feedChars=useRef<Element[]>([]),[ready,setReady]=useState(0);
 const onHero=useCallback((chars:Element[])=>{heroChars.current=chars;setReady(n=>n+1);},[]);
 const onFeed=useCallback((chars:Element[])=>{feedChars.current=chars;setReady(n=>n+1);},[]);
 useGSAP(()=>{
  if(!heroChars.current.length||!feedChars.current.length)return;
  const host=root.current!,phone=device.current!,visual=focus.current!;
  const period=heroChars.current[heroChars.current.length-1];gsap.set(period,{color:'#FE2C55'});
  const mm=gsap.matchMedia();
  mm.add({reduce:'(prefers-reduced-motion: reduce)',normal:'(prefers-reduced-motion: no-preference)',desktop:'(min-width:768px)',fine:'(hover:hover) and (pointer:fine)'},context=>{
   if(reducedMotion||context.conditions?.reduce){phone.inert=false;host.dataset.awake='true';return;}
   const desktop=context.conditions?.desktop;
   const size=()=>Math.min(desktop?320:220,innerHeight*(desktop?.38:.29));
   const x=()=>innerWidth*(desktop?.65:.5)-size()/2;
   const y=()=>innerHeight*(desktop?.54:.65)-size()*2.078/2;
   gsap.set(phone,{autoAlpha:0,width:size(),x:()=>innerWidth*.7-size()/2,y:()=>innerHeight*(desktop?.53:.72)-size()*2.078/2,scale:.15,rotation:-15,transformOrigin:'50% 50%'});
   gsap.set(visual,{opacity:1,filter:'none'});
   gsap.set('.feed-arrival',{autoAlpha:0});gsap.set(feedChars.current,{autoAlpha:0,x:-25,y:22});gsap.set('.feed-arrival p',{autoAlpha:0,y:16});
   gsap.set('.phone-ui-reveal',{'--wake-radius':'0%'});phone.inert=true;
   const pulse=gsap.fromTo(period,{opacity:1},{opacity:.4,duration:1,delay:1,repeat:-1,yoyo:true,ease:'sine.inOut',immediateRender:false});
   const intro=gsap.from(heroChars.current,{autoAlpha:0,y:28,duration:.55,stagger:{amount:.3},ease:'power3.out'});
   const transition=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'hero-wake',trigger:host,start:'top top',end:()=>`+=${innerHeight}`,pin:true,pinSpacing:true,scrub:true,invalidateOnRefresh:true,refreshPriority:10,onLeave:()=>{phone.querySelector<HTMLElement>('.phone-ui-reveal')!.inert=false;host.dataset.awake='true';},onEnter:()=>{phone.querySelector<HTMLElement>('.phone-ui-reveal')!.inert=true;host.dataset.awake='false';},onUpdate:self=>{if(self.progress>.001)intro.progress(1);phone.inert=false;const enabled=self.progress>=1-2/innerHeight;phone.querySelector<HTMLElement>('.phone-ui-reveal')!.inert=!enabled;host.dataset.awake=String(enabled);if(self.progress>.2)pulse.pause();else pulse.resume();}}})
    .fromTo('.hero-accents',{autoAlpha:1},{autoAlpha:0,duration:.2},0)
    .fromTo('.cinema-copy',{xPercent:0,autoAlpha:1},{xPercent:-12,autoAlpha:0,duration:.2},0)
    .fromTo(phone,{autoAlpha:0,x:()=>innerWidth*.7-size()/2,y:()=>innerHeight*(desktop?.53:.72)-size()*2.078/2,scale:.15,rotation:-15},{autoAlpha:1,x,y,scale:1,rotation:0,duration:.4},.2)
    .set(visual,{opacity:1,filter:'none',rotation:0},.2)
    .fromTo('.phone-ui-reveal',{'--wake-radius':'0%'},{'--wake-radius':'100%',duration:.4},.2)
    .set('.feed-arrival',{autoAlpha:1},.6)
    .to(feedChars.current,{autoAlpha:1,x:0,y:0,duration:.24,stagger:{amount:.16}},.6)
    .to('.feed-arrival p',{autoAlpha:1,y:0,duration:.25},.75);
   const ui=phone.querySelector<HTMLElement>('.phone-ui-reveal')!;
   const awake=(value:boolean)=>{ui.inert=!value;host.dataset.awake=String(value);};
   phone.inert=false;awake(false);
   const interaction=ScrollTrigger.create({id:'hero-interactions',trigger:host,// Two pixels absorb subpixel rounding at the pinned boundary, not an extra scroll delay.
    start:()=>transition.scrollTrigger!.end-2,end:()=>transition.scrollTrigger!.end+innerHeight,onEnter:()=>awake(true),onEnterBack:()=>awake(true),onLeave:()=>awake(false),onLeaveBack:()=>awake(false),onRefresh:self=>awake(self.scroll()>=self.start&&self.scroll()<self.end)});
   const resize=()=>gsap.set(phone,{width:size()});ScrollTrigger.addEventListener('refreshInit',resize);ScrollTrigger.refresh();
   return()=>{pulse.kill();intro.kill();interaction.kill();transition.kill();gsap.killTweensOf(visual);ScrollTrigger.removeEventListener('refreshInit',resize);phone.inert=false;phone.querySelector<HTMLElement>('.phone-ui-reveal')!.inert=false;};
  },root);
  return()=>mm.revert();
 },{scope:root,dependencies:[ready,reducedMotion],revertOnUpdate:true});
 return <section ref={root} className={`hero cinema-hero ${reducedMotion?'cinema-static':''}`} aria-label={reducedMotion?'为你而刷':'抖音，记录美好生活'}>
  <HeroAccents reducedMotion={reducedMotion}/>
  <header className="hero-navbar"><a href="/" aria-label="抖音首页" className="brand"><span aria-hidden="true">♪</span>抖音</a><nav aria-label="主导航"><span className="nav-tagline">记录美好生活</span><button onClick={()=>onNavigate(0)}>功能</button><button onClick={()=>onNavigate(3)}>创作者</button><a href="https://www.douyin.com/downloadpage/app" target="_blank" rel="noopener noreferrer">下载<ArrowUpRight size={12}/></a></nav></header>
  <div className="cinema-copy"><div className="hero-title-parallax"><SplitText text="你的生活，值得被看见。" tag="h1" textAlign="left" className="text-display font-bold text-ink" onReady={onHero}/></div><p className="hero-subtitle">看喜欢的内容，发现新鲜事，<br className="sm:hidden"/>也把自己的生活分享出去。</p><div className="hero-actions flex flex-wrap gap-3"><a href="https://www.douyin.com/" target="_blank" rel="noopener noreferrer" className="cta cta-primary">立即体验<ArrowUpRight size={20} weight="bold"/></a><button onClick={()=>onNavigate(0)} className="cta cta-secondary"><Play size={17} weight="fill"/>观看演示</button></div></div>
  <div className="feed-arrival" id="features"><SplitText text="为你而刷" tag="h2" textAlign="left" className="chapter-title" onReady={onFeed}/><p className="chapter-copy">你喜欢什么，算法就懂什么</p><small>界面与数据为设计演示</small></div>
  <div ref={device} className="cinema-device"><div ref={focus} className="cinema-device-focus"><Phone single="feed" interactive reducedMotion={reducedMotion} reveal={!reducedMotion}/></div></div>
 </section>;
}
