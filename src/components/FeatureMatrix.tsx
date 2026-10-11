import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Broadcast, ShoppingBag, MapPin, MagnifyingGlass } from '@phosphor-icons/react';
import useSectionEntrance from '../hooks/useSectionEntrance';
const features=[
 {title:'直播',copy:'3000 万人此刻正在看',icon:Broadcast,tone:'from-rose/25 via-rose/5 to-black/40',accent:'text-rose'},
 {title:'抖音商城',copy:'边看边买，好物直达',icon:ShoppingBag,tone:'from-cyan/20 via-cyan/5 to-black/40',accent:'text-cyan'},
 {title:'同城',copy:'发现你身边的新鲜事',icon:MapPin,tone:'from-violet/25 via-violet/5 to-black/40',accent:'text-[#b396ff]'},
 {title:'搜索',copy:'你想知道的，都在这',icon:MagnifyingGlass,tone:'from-orange-400/25 via-orange-400/5 to-black/40',accent:'text-orange-300'},
];
export default function FeatureMatrix({reducedMotion}:{reducedMotion:boolean}) {
 const root=useSectionEntrance(reducedMotion,element=>gsap.timeline().from(element.querySelectorAll('[data-feature]'),{autoAlpha:0,y:36,duration:.7,stagger:.12,ease:'power3.out'}));
 const {contextSafe}=useGSAP({scope:root});
 const hover=contextSafe((element:HTMLElement,active:boolean)=>{
  if(reducedMotion)return;
  gsap.to(element,{scale:active?1.03:1,duration:.3,ease:'power2.out',overwrite:'auto'});
  gsap.to(element.querySelector('[data-icon]'),{rotation:active?8:0,duration:.3,ease:'power2.out',overwrite:'auto'});
 });
 return <section ref={root} id="feature-matrix" aria-label="功能矩阵" className="feature-matrix px-gutter relative flex min-h-dvh flex-col justify-center py-16">
  <header className="mb-10"><h2 className="text-[clamp(42px,5.5vw,80px)] font-bold leading-tight tracking-[-.055em]">不只是刷视频</h2><p className="mt-4 text-base text-white/60">抖音能做的，比你想的多</p></header>
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
   {features.map(({title,copy,icon:Icon,tone,accent})=><article key={title} tabIndex={0} data-feature className={`flex min-h-[176px] items-center gap-6 rounded-[20px] border border-white/10 bg-black/40 bg-linear-to-br ${tone} p-8 hover:border-white/30 focus-visible:border-cyan/55`} onPointerEnter={event=>hover(event.currentTarget,true)} onPointerLeave={event=>hover(event.currentTarget,false)} onFocus={event=>hover(event.currentTarget,true)} onBlur={event=>hover(event.currentTarget,false)}>
    <Icon data-icon size={48} weight="regular" className={`shrink-0 ${accent}`} aria-hidden="true"/><div><h3 className="text-2xl font-semibold">{title}</h3>{/* TODO: 替换直播观看人数为官方真实数据 */}<p className="mt-3 text-sm leading-6 text-white/60">{copy}</p></div>
   </article>)}
  </div>
 </section>;
}
