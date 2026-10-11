import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';
import './smoothScroll.css';

const dragSelector='.universe-track, .story-accordion, .feed-gesture';
const nativeSelector='.feed-comment-list, .phone-messages, .phone-profile';

export default function useSmoothScroll(reducedMotion:boolean) {
 const instance=useRef<Lenis|null>(null);
 useEffect(()=>{
  if(reducedMotion)return;
  // One live instance per root; state changes elsewhere do not reinitialize it.
  const lenis=new Lenis({
   duration:1.2,
   easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),
   lerp:0, // Use duration/easing rather than the library's default lerp.
   smoothWheel:true,syncTouch:true,touchMultiplier:1.5,wheelMultiplier:1,
   autoRaf:false,autoResize:false,infinite:false,overscroll:false,anchors:true,
   prevent:node=>node.matches(`${nativeSelector}, .feed-gesture`),
   virtualScroll:({event,deltaX,deltaY})=>{
    // Native horizontal scroll-snap stays independent of the vertical page clock.
    const target=event.target;
    if(target instanceof Element&&target.closest('.universe-track')&&('shiftKey' in event&&event.shiftKey||Math.abs(deltaX)>Math.abs(deltaY)))return false;
    return true;
   }
  });
  instance.current=lenis;
  const off=lenis.on('scroll',ScrollTrigger.update);
  const tick=(time:number)=>lenis.raf(time*1000);
  gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  let alive=true,resizeJob:gsap.core.Tween|null=null;
  const pointers=new Map<number,{x:number;y:number;locked:boolean;surface:Element}>();
  const syncLocks=()=>{const locked=Array.from(pointers.values()).some(p=>p.locked);if(locked)lenis.stop();else if(lenis.isStopped)lenis.start();};
  const down=(event:PointerEvent)=>{
   if(event.button!==0||!(event.target instanceof Element))return;
   const surface=event.target.closest(dragSelector);if(!surface)return;
   // Touch stays available for vertical page scrolling until horizontal intent wins.
   pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,locked:event.pointerType==='mouse'||surface.matches('.feed-gesture'),surface});syncLocks();
  };
  const move=(event:PointerEvent)=>{
   const pointer=pointers.get(event.pointerId);if(!pointer||pointer.locked)return;
   const dx=Math.abs(event.clientX-pointer.x),dy=Math.abs(event.clientY-pointer.y);
   if(dy>dx&&dy>8){pointers.delete(event.pointerId);syncLocks();return;}
   if(dx>8&&dx>dy){pointer.locked=true;syncLocks();}
  };
  const release=(event:PointerEvent)=>{if(pointers.delete(event.pointerId))syncLocks();};
  const reset=()=>{pointers.clear();syncLocks();};
  const visibility=()=>{if(document.hidden)reset();};
  const resized=()=>{resizeJob?.kill();resizeJob=gsap.delayedCall(.15,()=>{lenis.resize();ScrollTrigger.refresh();});};
  const refreshed=()=>lenis.resize();
  document.addEventListener('pointerdown',down,true);document.addEventListener('pointermove',move,true);
  document.addEventListener('pointerup',release,true);document.addEventListener('pointercancel',release,true);document.addEventListener('lostpointercapture',release,true);
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('blur',reset);window.addEventListener('resize',resized);
  ScrollTrigger.addEventListener('refresh',refreshed);
  lenis.resize();
  void document.fonts.ready.then(()=>{if(alive){lenis.resize();ScrollTrigger.refresh();}});
  return()=>{
   alive=false;resizeJob?.kill();pointers.clear();off();gsap.ticker.remove(tick);
   document.removeEventListener('pointerdown',down,true);document.removeEventListener('pointermove',move,true);
   document.removeEventListener('pointerup',release,true);document.removeEventListener('pointercancel',release,true);document.removeEventListener('lostpointercapture',release,true);
   document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',reset);window.removeEventListener('resize',resized);
   ScrollTrigger.removeEventListener('refresh',refreshed);lenis.destroy();instance.current=null;
  };
 },[reducedMotion]);
 return instance;
}
