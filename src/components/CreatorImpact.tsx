import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import useSectionEntrance from '../hooks/useSectionEntrance';

// TODO: 替换为经授权的真实创作者故事；当前姓名、引述和粉丝数均为设计演示。
const creators=[
 {name:'@张桂芬',age:'62岁',quote:'退休后我在抖音教大家织毛衣，现在有 80 万人跟着我学',followers:'86.4万',gradient:'from-cyan/75 via-[#174c51] to-rose/70'},
 {name:'@山里的二牛',age:'',quote:'我在大山里拍日出，有人说看了我的视频决定辞职来这里',followers:'213万',gradient:'from-[#306773] via-[#27375b] to-[#b75a77]'},
 {name:'@深夜修表匠',age:'',quote:'修了 30 年表，现在抖音上有 50 万人看我修表',followers:'42.7万',gradient:'from-[#985338] via-[#3c274b] to-cyan/70'},
];
const metrics=[
 {label:'日活用户',value:700_000_000,copy:'每天都在刷'},
 {label:'创作者',value:100_000_000,copy:'把生活拍成作品'},
 {label:'日均播放',value:80_000_000_000,copy:'一秒钟，100 万次心动'},
];
const format=(value:number)=>`${Math.round(value).toLocaleString('en-US')}+`;

export default function CreatorImpact({reducedMotion}:{reducedMotion:boolean}) {
 const root=useSectionEntrance(reducedMotion,element=>gsap.timeline().from(element.querySelectorAll('[data-story]'),{autoAlpha:0,y:36,duration:.7,stagger:.14,ease:'power3.out'}));
 const stats=useRef<HTMLDivElement>(null);
 const {contextSafe}=useGSAP(()=>{
  if(reducedMotion||!stats.current)return;
  const nodes=stats.current.querySelectorAll<HTMLElement>('[data-count]');
  const timeline=gsap.timeline({paused:true});
  nodes.forEach((node,index)=>{
   const counter={value:0};node.textContent=format(0);
   timeline.to(counter,{value:metrics[index].value,duration:1.4,ease:'power2.out',onUpdate:()=>{node.textContent=format(counter.value);}},index*.08);
  });
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){timeline.play();observer.disconnect();}},{threshold:.25});
  observer.observe(stats.current);
  return()=>{observer.disconnect();nodes.forEach((node,index)=>{node.textContent=format(metrics[index].value);});};
 },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
 const hover=contextSafe((element:HTMLElement,active:boolean)=>{
  if(reducedMotion)return;
  gsap.to(element,{y:active?-8:0,duration:.3,ease:'power2.out',overwrite:'auto'});
 });
 const avatar=contextSafe((element:HTMLElement,active:boolean)=>{
  if(reducedMotion)return;
  gsap.to(element,{scale:active?1.1:1,duration:.3,ease:'power2.out',overwrite:'auto'});
 });
 return <section ref={root} id="creator-impact" aria-label="创作者故事与数据" className="creator-impact px-gutter relative flex min-h-dvh flex-col py-12 lg:py-14">
  <div className="creator-stories flex flex-[55] flex-col justify-center">
   <header className="mb-7 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-base font-normal text-white/60">在这里，每个人都能被看见</h2><span className="text-[10px] text-white/30">创作者故事为设计演示</span></header>
   <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
    {creators.map(creator=><article key={creator.name} data-story tabIndex={0} className="creator-story flex flex-col rounded-2xl border border-white/10 bg-black/40 p-6 outline-none hover:border-cyan/55 focus-visible:border-cyan/55 hover:shadow-[-8px_0_24px_#00f2ea12,8px_0_24px_#fe2c5522]" onPointerEnter={event=>hover(event.currentTarget,true)} onPointerLeave={event=>hover(event.currentTarget,false)} onFocus={event=>hover(event.currentTarget,true)} onBlur={event=>hover(event.currentTarget,false)}>
     <div className="mb-6 flex items-center gap-4"><div aria-hidden="true" className={`h-14 w-14 shrink-0 rounded-full bg-linear-to-br ${creator.gradient}`} onPointerEnter={event=>avatar(event.currentTarget,true)} onPointerLeave={event=>avatar(event.currentTarget,false)}/><div><h3 className="text-base font-semibold">{creator.name}</h3>{creator.age&&<p className="mt-1 text-xs text-white/45">{creator.age}</p>}</div></div>
     <blockquote className="flex-1 text-[15px] leading-7 text-white/85">「{creator.quote}」</blockquote>
     <p className="mt-6 text-xs text-white/45">粉丝 <strong className="ml-2 font-semibold text-white/90">{creator.followers}</strong></p>
    </article>)}
   </div>
  </div>
  <div ref={stats} className="creator-data flex flex-[45] flex-col justify-center pt-12">
   <div className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-0">
    {metrics.map((metric,index)=><div key={metric.label} className={`impact-metric ${index?'md:border-l md:border-white/20 md:pl-7':''} ${index<2?'md:pr-7':''}`}>
     <h3 className="mb-4 text-sm text-white/65">{metric.label}</h3>
     {/* TODO: 替换为官方真实数据，包括日均播放 80,000,000,000+ 占位值 */}
     <p className="impact-number font-sans font-extrabold tracking-[-.055em] text-white" aria-label={format(metric.value)}><span data-count aria-hidden="true">{format(metric.value)}</span></p>
     <p className="mt-4 text-sm text-white/55">{metric.copy}</p>
    </div>)}
   </div>
   {/* TODO: 替换为官方数据的真实统计日期 */}
   <p className="mt-8 text-right text-[10px] text-white/35">数据截至 2026 年</p>
  </div>
 </section>;
}
