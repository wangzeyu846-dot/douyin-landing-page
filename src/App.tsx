import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import useSmoothScroll from './hooks/useSmoothScroll';
import CinematicHero from './components/CinematicHero';
import StoryCarousel from './components/StoryCarousel';
import ContentUniverse from './components/ContentUniverse';
import CommentRain from './components/CommentRain';
import DownloadClosing from './components/DownloadClosing';
import FluidBackdrop from './components/FluidBackdrop';
import CreatorImpact from './components/CreatorImpact';
import FeatureMatrix from './components/FeatureMatrix';
import CinemaCursor from './components/CinemaCursor';
import './components/Enhancements.css';
import './components/FreeScroll.css';
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const forceReducedMotion = import.meta.env.DEV && new URLSearchParams(location.search).get('motion') === 'reduce';
export default function App() {
 const root=useRef<HTMLElement>(null);
 const navigationTween=useRef<gsap.core.Tween|null>(null);
 const [reduce,setReduce]=useState(()=>forceReducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches);
 const smoothScroll=useSmoothScroll(reduce);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduce(forceReducedMotion || q.matches);q.addEventListener('change',update);return()=>{q.removeEventListener('change',update);navigationTween.current?.kill();};},[]);
 const navigate=(index:number)=>{
  navigationTween.current?.kill();
  const target=index===0?(reduce?0:ScrollTrigger.getById('hero-wake')?.end ?? innerHeight):root.current?.querySelector<HTMLElement>('#discoveries') ?? undefined;
  if(reduce){if(typeof target==='number')window.scrollTo({top:target,behavior:'instant'});else target?.scrollIntoView({behavior:'instant'});return;}
  if(smoothScroll.current){if(target!==undefined)smoothScroll.current.scrollTo(target,{duration:.8,easing:gsap.parseEase('power2.inOut')});return;}
  navigationTween.current=gsap.to(window,{scrollTo:{y:target,autoKill:true},duration:.8,ease:'power2.inOut'});
 };
 return <main ref={root} className={reduce?'experience reduced':'experience'}>
  <div id="background-hero" className="background-scene-probe" aria-hidden="true"/><div id="background-phone" className="background-scene-probe" aria-hidden="true"/>
  <FluidBackdrop reducedMotion={reduce}/><CinemaCursor reducedMotion={reduce}/>
  <div className="hero-grain" aria-hidden="true"/>
  <CinematicHero reducedMotion={reduce} onNavigate={navigate}/>
  <div className="story-block">
   <section id="discoveries" className="story-stage discovery-stage" aria-label="抖音上的精彩，远不止这些">
    <header className="story-heading"><h2>抖音上的精彩，远不止这些</h2></header>
    <StoryCarousel reducedMotion={reduce}/>
    <p className="demo-disclaimer">作品与账号为虚构演示</p>
   </section>
  </div>
  <ContentUniverse reducedMotion={reduce}/>
  <CreatorImpact reducedMotion={reduce}/>
  <FeatureMatrix reducedMotion={reduce}/>
  <CommentRain reducedMotion={reduce}/>
  <DownloadClosing reducedMotion={reduce} onDemo={()=>navigate(0)}/>
 </main>;
}
