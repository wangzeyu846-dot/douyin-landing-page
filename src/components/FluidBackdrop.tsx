import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Aurora from './react-bits/Aurora';
import Particles from './react-bits/Particles';
import './FluidBackdrop.css';

const scenes=[
 {id:'hero',selector:'#background-hero',colors:['#00F2EA','#FE2C55','#7C3AED'],kind:'fluid',light:.4},
 {id:'phone',selector:'#background-phone',colors:['#071B52','#00D9ED','#7450CA'],kind:'fluid',light:.4},
 {id:'gallery',selector:'#discoveries',colors:['#050505','#071319','#050505'],kind:'particles',light:.2},
 {id:'universe',selector:'#content-universe',colors:['#FFB348','#EF6BA2','#7950AD'],kind:'fluid',light:.4},
 {id:'creators',selector:'#creator-impact',colors:['#1B784A','#286969','#0A2450'],kind:'fluid',light:.4},
 {id:'matrix',selector:'#feature-matrix',colors:['#FE2C55','#00F2EA','#7C3AED'],kind:'lights',light:.4},
 {id:'rain',selector:'#comment-rain',colors:['#050505','#050505','#050505'],kind:'black',light:0},
 {id:'cta',selector:'#download',colors:['#EC8843','#F27E9D','#EAC16B'],kind:'fluid',light:.4},
] as const;
type SceneId=typeof scenes[number]['id'];

function Scene({id,reducedMotion}:{id:SceneId;reducedMotion:boolean}) {
 const root=useRef<HTMLDivElement>(null);
 const scene=scenes.find(scene=>scene.id===id)!;
 useGSAP(()=>{
  if(reducedMotion)return;
  if(scene.kind==='fluid')gsap.to('.scene-fluid',{xPercent:3,yPercent:2,rotation:3,duration:12,repeat:-1,yoyo:true,ease:'sine.inOut'});
  if(id==='phone')gsap.utils.toArray<HTMLElement>('.scene-beam',root.current).forEach((beam,index)=>gsap.fromTo(beam,{xPercent:-25},{xPercent:25,duration:14+index*4,repeat:-1,yoyo:true,ease:'sine.inOut'}));
  if(id==='creators')gsap.utils.toArray<HTMLElement>('.scene-dapple',root.current).forEach((spot,index)=>gsap.to(spot,{x:18+index*3,y:-12-index*2,scale:1.12,opacity:.5,duration:7+index,repeat:-1,yoyo:true,ease:'sine.inOut'}));
  if(id==='matrix')gsap.utils.toArray<HTMLElement>('.scene-corner',root.current).forEach((spot,index)=>gsap.fromTo(spot,{opacity:.25},{opacity:.5,duration:4+index,repeat:-1,yoyo:true,ease:'sine.inOut'}));
 },{scope:root,dependencies:[reducedMotion,id],revertOnUpdate:true});
 return <div ref={root} className={`scene-effects scene-${id}`} style={{opacity:scene.light}}>
  {reducedMotion?<div className="scene-static" style={{background:scene.kind==='black'?'#050505':`radial-gradient(ellipse at 20% 30%,${scene.colors[0]},transparent 65%),radial-gradient(ellipse at 85% 70%,${scene.colors[1]},transparent 65%),linear-gradient(140deg,#050505,${scene.colors[2]})`}}/>:<>
   {scene.kind==='fluid'&&<div className="scene-fluid"><Aurora colorStops={[...scene.colors]} amplitude={1.4} blend={.8} speed={.35}/></div>}
   {(id==='hero'||id==='gallery')&&<div className="scene-particles"><Particles particleCount={id==='hero'?64:26} particleColors={id==='hero'?['#FFFFFF','#00F2EA','#FE2C55']:['#B5CDD0','#FFFFFF']} particleSpread={3} cameraDistance={20} speed={id==='hero'?.12:.06} particleBaseSize={id==='hero'?30:18} sizeRandomness={1} alphaParticles disableRotation pixelRatio={1}/></div>}
   {id==='phone'&&[0,1].map(index=><div key={index} className={`scene-beam scene-beam-${index}`}/>)}
   {id==='creators'&&Array.from({length:6},(_,index)=><div key={index} className="scene-dapple" style={{left:`${12+index*15}%`,top:`${18+(index%3)*24}%`,width:`${100+index*16}px`,height:`${100+index*16}px`}}/>)}
   {id==='matrix'&&['rose','cyan','violet','orange'].map(color=><div key={color} className={`scene-corner scene-corner-${color}`}/>)}
  </>}
 </div>;
}

export default function FluidBackdrop({reducedMotion}:{reducedMotion:boolean}) {
 const root=useRef<HTMLDivElement>(null);
 const initial:SceneId=reducedMotion?'phone':'hero';
 const [state,setState]=useState<{active:SceneId;layers:SceneId[]}>({active:initial,layers:[initial]});
 const desired=useRef<SceneId>(initial);
 useEffect(()=>{
  let active:SceneId|null=null;
  const sync=()=>{
   const ranked=scenes.map(scene=>{
    const rect=document.querySelector(scene.selector)?.getBoundingClientRect();
    return {id:scene.id,area:rect?Math.max(0,Math.min(innerHeight,rect.bottom)-Math.max(0,rect.top)):0};
   }).sort((a,b)=>b.area-a.area);
   const next=ranked[0];if(!next||next.area===0||active===next.id)return;
   active=next.id;desired.current=next.id;
   setState(previous=>{
    if(previous.active===next.id)return previous;
    if(reducedMotion)return {active:next.id,layers:[next.id]};
    // Rapid scrolling retains the strongest visible layer, never accumulates scenes.
    if(previous.layers.includes(next.id))return {...previous,active:next.id};
    const outgoing=[...previous.layers].sort((a,b)=>{
     const opacity=(id:SceneId)=>Number(gsap.getProperty(root.current!.querySelector(`[data-background="${id}"]`),'opacity'));
     return opacity(b)-opacity(a);
    })[0];
    return {active:next.id,layers:[outgoing,next.id]};
   });
  };
  const observer=new IntersectionObserver(sync,{threshold:[0,.1,.25,.5,.75,1]});
  scenes.forEach(scene=>{const node=document.querySelector(scene.selector);if(node)observer.observe(node);});sync();
  window.addEventListener('resize',sync);
  return()=>{observer.disconnect();window.removeEventListener('resize',sync);};
 },[reducedMotion]);
 useGSAP(()=>{
  const timeline=gsap.timeline({onComplete:()=>setState(previous=>previous.active===desired.current?{active:previous.active,layers:[previous.active]}:previous)});
  state.layers.forEach(id=>timeline.to(root.current!.querySelector(`[data-background="${id}"]`),{opacity:id===state.active?1:0,duration:reducedMotion?0:.8,ease:'power2.inOut',overwrite:true},0));
  return()=>{timeline.kill();};
 },{scope:root,dependencies:[state.active,state.layers.join(','),reducedMotion]});
 return <div ref={root} className="fluid-backdrop" data-active-background={state.active} data-background-count={state.layers.length} aria-hidden="true">
  {state.layers.map(id=><div key={id} data-background={id} className="background-scene" style={{opacity:0}}><Scene id={id} reducedMotion={reducedMotion}/></div>)}
  <div className="background-readability-mask"/>
 </div>;
}
