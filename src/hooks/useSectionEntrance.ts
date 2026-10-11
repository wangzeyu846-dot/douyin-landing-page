import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

// IO starts a paused timeline once; scroll position never drives its progress.
export default function useSectionEntrance(reducedMotion:boolean, setup:(element:HTMLElement)=>gsap.core.Timeline) {
 const root=useRef<HTMLElement>(null);
 useGSAP(()=>{
  if(!root.current||reducedMotion)return;
  const timeline=setup(root.current).pause();
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){timeline.play();observer.disconnect();}
  },{threshold:.12});
  observer.observe(root.current);
  return()=>observer.disconnect();
 },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
 return root;
}
