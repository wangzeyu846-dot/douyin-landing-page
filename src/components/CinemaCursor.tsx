import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
export default function CinemaCursor({reducedMotion}:{reducedMotion:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useGSAP(()=>{
  const mm=gsap.matchMedia();
  mm.add('(min-width: 768px) and (hover: hover) and (pointer: fine)',()=>{
   const node=root.current!;let x=0,y=0,targetX=0,targetY=0,running=false,seen=false;
   const setX=gsap.quickSetter(node,'x','px'),setY=gsap.quickSetter(node,'y','px');
   const tick=(_time:number,delta:number)=>{const a=1-Math.exp(-delta/65);x+=(targetX-x)*a;y+=(targetY-y)*a;setX(x);setY(y);if(Math.abs(targetX-x)+Math.abs(targetY-y)<.08){gsap.ticker.remove(tick);running=false;}};
   const move=(e:PointerEvent)=>{targetX=e.clientX;targetY=e.clientY;if(!seen){x=targetX;y=targetY;seen=true;}node.style.opacity='1';if(reducedMotion){setX(targetX);setY(targetY);}else if(!running){running=true;gsap.ticker.add(tick);}};
   const hide=()=>{node.style.opacity='0';};
   window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',hide);
   return()=>{window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',hide);gsap.ticker.remove(tick);};
  });return()=>mm.revert();
 },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
 return <div ref={root} className="cinema-cursor" aria-hidden="true"><span className="cursor-halo"/><span className="cursor-dot"/></div>;
}
