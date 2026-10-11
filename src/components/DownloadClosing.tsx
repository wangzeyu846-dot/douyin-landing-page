import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Play } from '@phosphor-icons/react';
import SplitText from './react-bits/SplitText';
import './DownloadClosing.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);
const footerGroups: {title:string;links:{label:string;href?:string}[]}[]=[
 {title:'关于我们',links:[{label:'公司介绍',href:'https://www.douyin.com/aboutus/'},{label:'加入我们',href:'https://jobs.bytedance.com/'},{label:'广告合作',href:'https://www.oceanengine.com/'},{label:'新闻中心',href:'https://www.bytedance.com/zh/news'}]},
 {title:'创作者',links:[{label:'创作者学院',href:'https://creator.douyin.com/'},{label:'创作服务平台',href:'https://creator.douyin.com/'},{label:'抖音商城',href:'https://douyinec.com/'},{label:'直播开放平台',href:'https://open.douyin.com/'}]},
 {title:'支持',links:[{label:'帮助中心',href:'https://www.douyin.com/help'},{label:'社区规范',href:'https://trust.douyin.com/'},{label:'隐私政策',href:'https://www.douyin.com/draft/douyin_agreement/douyin_agreement_privacy.html?id=6773901168964798477'},{label:'用户协议',href:'https://www.douyin.com/agreements/?id=6773906068725565448'}]},
 // TODO: 补充并确认微信公众号、Instagram、YouTube 官方账号链接；不要冒充 TikTok 账号。
 {title:'关注我们',links:[{label:'微信公众号'},{label:'微博',href:'https://www.weibo.com/douyinmv'},{label:'Instagram'},{label:'YouTube'}]},
];
// Decorative checker matrix only: no QR encoding, payload, or finder patterns.
const fakeCells=Array.from({length:441},(_,i)=>Math.abs((Math.sin(i*127.1+31.7)*43758.5453)%1)<.49);
export default function DownloadClosing({reducedMotion,onDemo}:{reducedMotion:boolean;onDemo:()=>void}){
 const root=useRef<HTMLElement>(null),letters=useRef<Element[]>([]);
 const [ready,setReady]=useState(false);
 const onReady=useCallback((chars:Element[])=>{letters.current=chars;setReady(true);},[]);
 const onCleanup=useCallback(()=>{letters.current=[];},[]);
 const {contextSafe}=useGSAP(()=>{
  if(!root.current||!ready)return;
  const mm=gsap.matchMedia();
  mm.add({full:'(prefers-reduced-motion: no-preference)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
   if(reducedMotion||context.conditions?.reduce){gsap.set(letters.current,{clearProps:'all'});return;}
   const tl=gsap.timeline({defaults:{ease:'power3.out'},scrollTrigger:{trigger:'.download-content',start:'top 78%',once:true,refreshPriority:-3}});
   tl.from(letters.current,{autoAlpha:0,y:48,duration:.42,stagger:{amount:.18}},0)
    .from('.download-subtitle',{autoAlpha:0,y:20,duration:.3},.45)
    .from('.download-actions',{autoAlpha:0,duration:.3},.65)
    .from('.download-qr-reveal',{autoAlpha:0,filter:'blur(8px)',duration:.35},.85);
   root.current!.dataset.entranceDuration=String(tl.duration());
   ScrollTrigger.refresh();
  },root);
  return()=>mm.revert();
 },{scope:root,dependencies:[ready,reducedMotion],revertOnUpdate:true});
 const hoverQR=contextSafe((active:boolean)=>{gsap.to('.download-qr-frame',{scale:active?1.05:1,borderColor:active?'#00F2EA':'#ffffff26',duration:reducedMotion?0:.2,ease:'power2.out',overwrite:'auto'});});
 return <>
  <section ref={root} id="download" className={`download-closing bg-night ${reducedMotion?'download-static':''}`} aria-label="现在，轮到你了">
   <div className="download-breath" aria-hidden="true"/>
   <div className="download-content relative px-gutter">
    <div className="download-inner relative mx-auto max-w-[1440px]">
     <SplitText text="现在，轮到你了。" tag="h2" textAlign="center" className="download-title font-bold text-ink" onReady={onReady} onCleanup={onCleanup}/>
     <div className="download-details">
      <div className="download-copy">
       {/* TODO: 核对并替换「3 亿人」为官方真实数据 */}
       <p className="download-subtitle">3 亿人已经在这里记录生活。下一条爆款，也许就是你。</p>
       <div className="download-actions flex gap-4"><a className="cta cta-primary" href="https://www.douyin.com/downloadpage/app" target="_blank" rel="noopener noreferrer">立即下载<ArrowUpRight size={20} weight="bold"/></a><button className="cta cta-secondary" onClick={onDemo}><Play size={17} weight="fill"/>观看演示</button></div>
      </div>
      <div className="download-qr-reveal">
       {/* TODO: 替换为官方下载二维码 */}
       <div className="download-qr-frame rounded-[24px]" role="img" aria-label="官方下载二维码占位图，当前为不可扫描的装饰图案" onPointerEnter={e=>{if(e.pointerType==='mouse')hoverQR(true);}} onPointerLeave={()=>hoverQR(false)}>
        <div className="fake-qr" aria-hidden="true">{fakeCells.map((dark,i)=><span key={i} className={dark?'bg-black':'bg-white'}/>)}</div>
       </div>
       <p className="download-qr-caption">扫码下载<br/>或搜索“抖音”</p>
      </div>
     </div>
    </div>
   </div>
   <div className="download-breath" aria-hidden="true"/>
  </section>
  <footer className="site-footer px-gutter">
   <nav className="footer-links grid grid-cols-2 md:grid-cols-4" aria-label="页脚导航">{footerGroups.map(group=><div key={group.title}><h3>{group.title}</h3><ul>{group.links.map(link=><li key={link.label}>{link.href?<a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>:<span className="footer-pending" role="link" aria-disabled="true" title="官方入口待确认">{link.label}</span>}</li>)}</ul></div>)}</nav>
   <div className="footer-legal"><p>© 2026 Douyin. All rights reserved.</p>{/* TODO: 替换为本网站真实 ICP 备案号 */}<p>京ICP备XXXXXXXX号</p></div>
  </footer>
 </>;
}
