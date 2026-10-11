import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Play } from '@phosphor-icons/react';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from './react-bits/SplitText';
import { playPreview, stopPreview, isPreviewCurrent } from '../lib/previewPlayback';
import './ContentUniverse.css';
import { videoLibrary } from '../data/videoLibrary';

gsap.registerPlugin(useGSAP, ScrollTrigger);
const categories = [
  { name: '知识', tag: '#知识', theme: 'indigo' },
  { name: '美食', tag: '#深夜食堂', theme: 'orange' },
  { name: '旅行', tag: '#出发吧', theme: 'aqua' },
  { name: '剧情', tag: '#反转', theme: 'rose' },
  { name: '萌宠', tag: '#喵星人', theme: 'yellow' },
  { name: '科技', tag: '#未来已来', theme: 'teal' },
  { name: '运动', tag: '#动起来', theme: 'lime' },
  { name: '音乐', tag: '#BGM', theme: 'magenta' },
] as const;
export default function ContentUniverse({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false), suppressClick = useRef(false);
  const playGeneration = useRef(0);
  const playing = useRef<HTMLVideoElement | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopPlayback = useCallback(() => {
    playGeneration.current++;
    const video=playing.current; playing.current=null;
    if(video)stopPreview(video);
    if(video){video.pause();try{video.currentTime=0;}catch{/* Unloaded media has no seek range. */}const card=video.closest<HTMLElement>('.universe-card')!;card.dataset.playing='false';gsap.killTweensOf([video,card.querySelector('h3')]);gsap.set(video,{opacity:0});gsap.set(card.querySelector('h3'),{autoAlpha:1,scale:1});}
    playing.current=null;
  }, []);
  useEffect(()=>{
    stopPlayback();
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting&&entry.target.contains(playing.current))stopPlayback();}},{threshold:.15});
    root.current?.querySelectorAll('.universe-card').forEach(card=>observer.observe(card));
    const hidden=()=>{if(document.hidden)stopPlayback();};document.addEventListener('visibilitychange',hidden);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hidden);stopPlayback();if(touchTimer.current)clearTimeout(touchTimer.current);};
  },[reducedMotion,stopPlayback]);
  const letters = useRef<Element[]>([]);
  const [ready, setReady] = useState(false);
  const onReady = useCallback((chars: Element[]) => { letters.current = chars; setReady(true); }, []);
  const onCleanup = useCallback(() => { letters.current = []; }, []);

  const { contextSafe } = useGSAP(() => {
    if (!ready || !root.current || !stage.current || !track.current) return;
    const mm = gsap.matchMedia();
    mm.add({ full: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
      const reduced = reducedMotion || context.conditions?.reduce;
      if (reduced) {
        gsap.set(letters.current, { clearProps: 'all' });
        return;
      }
      gsap.fromTo(letters.current,
        { autoAlpha: 0, y: 48 },
        { autoAlpha: 1, y: 0, duration: .5, stagger: { amount: .3 }, ease: 'power3.out',
          scrollTrigger: { trigger: '.universe-heading', start: 'top 85%', once: true, refreshPriority: -1 } });
    }, root);
    return () => mm.revert();
  }, { scope: root, dependencies: [ready, reducedMotion], revertOnUpdate: true });

  useGSAP((_context, contextSafe) => {
    const belt=track.current!;
    const cards=Array.from(belt.querySelectorAll<HTMLElement>('.universe-card'));
    const reduced=reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
    const flags={visible:false,hover:false,focus:false,hidden:document.hidden,drag:false};
    let timer:gsap.core.Tween|null=null,moveTween:gsap.core.Tween|null=null,raf=0;
    let pointer:{id:number;x:number;y:number;left:number;moved:boolean}|null=null;
    const max=()=>Math.max(0,belt.scrollWidth-belt.clientWidth);
    const positions=()=>cards.map(card=>Math.min(max(),Math.max(0,card.offsetLeft-parseFloat(getComputedStyle(belt).paddingLeft))));
    const nearest=()=>positions().reduce((best,p,i,all)=>Math.abs(p-belt.scrollLeft)<Math.abs(all[best]-belt.scrollLeft)?i:best,0);
    const sync=()=>timer?.paused(reduced||!flags.visible||flags.hover||flags.focus||flags.hidden||flags.drag);
    const setProgress=gsap.quickSetter(root.current!.querySelector('.universe-progress-fill'),'scaleX');
    const update=()=>{raf=0;const progress=max()?belt.scrollLeft/max():0;root.current!.dataset.railProgress=progress.toFixed(4);setProgress(progress);};
    const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};
    const jump=contextSafe!((index:number)=>{
      moveTween?.kill();belt.style.scrollSnapType='none';
      moveTween=gsap.to(belt,{scrollLeft:positions()[gsap.utils.clamp(0,cards.length-1,index)],duration:reduced?0:.65,ease:'power2.inOut',onComplete:()=>{belt.style.scrollSnapType='';update();}});
    });
    const down=(event:PointerEvent)=>{
      if(event.button!==0)return;
      suppressClick.current=false;moveTween?.kill();belt.style.scrollSnapType='';
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,left:belt.scrollLeft,moved:false};
    };
    const move=(event:PointerEvent)=>{
      if(!pointer||event.pointerId!==pointer.id)return;
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
      if(!pointer.moved){
        if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){pointer=null;return;}
        if(Math.abs(dx)<8)return;
        pointer.moved=true;dragging.current=true;flags.drag=true;sync();stopPlayback();
        if(touchTimer.current)clearTimeout(touchTimer.current);
        belt.setPointerCapture(pointer.id);belt.style.scrollSnapType='none';belt.dataset.dragging='true';
      }
      event.preventDefault();belt.scrollLeft=gsap.utils.clamp(0,max(),pointer.left-dx);
    };
    const end=(event:PointerEvent)=>{
      if(!pointer||event.pointerId!==pointer.id)return;
      const finished=pointer;pointer=null;
      if(finished.moved){suppressClick.current=true;dragging.current=false;flags.drag=false;belt.dataset.dragging='false';if(belt.hasPointerCapture(finished.id))belt.releasePointerCapture(finished.id);jump(nearest());timer?.restart();sync();}
    };
    const key=(event:KeyboardEvent)=>{if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;event.preventDefault();jump(nearest()+(event.key==='ArrowRight'?1:-1));};
    const enter=(event:PointerEvent)=>{if(event.pointerType==='mouse'){flags.hover=true;sync();}};
    const leave=()=>{flags.hover=false;sync();};
    const focus=()=>{flags.focus=true;sync();};
    const blur=(event:FocusEvent)=>{if(!belt.contains(event.relatedTarget as Node)){flags.focus=false;sync();}};
    const visibility=()=>{flags.hidden=document.hidden;sync();};
    if(!reduced){const clock={progress:0};timer=gsap.to(clock,{progress:1,duration:4,ease:'none',paused:true,onComplete:()=>{const current=nearest();jump(belt.scrollLeft>=max()-2?0:current+1);clock.progress=0;timer!.restart();sync();}});}
    const observer=new IntersectionObserver(entries=>{flags.visible=entries.some(entry=>entry.isIntersecting);sync();},{threshold:.15});observer.observe(stage.current!);
    const resize=new ResizeObserver(update);resize.observe(belt);
    belt.addEventListener('scroll',scroll,{passive:true});belt.addEventListener('pointerdown',down);belt.addEventListener('pointermove',move);belt.addEventListener('pointerup',end);belt.addEventListener('pointercancel',end);belt.addEventListener('lostpointercapture',end);belt.addEventListener('keydown',key);belt.addEventListener('pointerenter',enter);belt.addEventListener('pointerleave',leave);belt.addEventListener('focusin',focus);belt.addEventListener('focusout',blur);document.addEventListener('visibilitychange',visibility);update();
    return()=>{timer?.kill();moveTween?.kill();observer.disconnect();resize.disconnect();cancelAnimationFrame(raf);if(pointer&&belt.hasPointerCapture(pointer.id))belt.releasePointerCapture(pointer.id);pointer=null;dragging.current=false;belt.style.scrollSnapType='';belt.removeEventListener('scroll',scroll);belt.removeEventListener('pointerdown',down);belt.removeEventListener('pointermove',move);belt.removeEventListener('pointerup',end);belt.removeEventListener('pointercancel',end);belt.removeEventListener('lostpointercapture',end);belt.removeEventListener('keydown',key);belt.removeEventListener('pointerenter',enter);belt.removeEventListener('pointerleave',leave);belt.removeEventListener('focusin',focus);belt.removeEventListener('focusout',blur);document.removeEventListener('visibilitychange',visibility);};
  },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});

  const emphasize = contextSafe((index: number | null) => {
    const cards = root.current?.querySelectorAll<HTMLElement>('.universe-card');
    if (!cards) return;
    const reduce = reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach((card, i) => gsap.to(card, {
      scale: index === i ? 1.03 : 1,
      opacity: index === null || index === i ? 1 : .3,
      duration: reduce ? 0 : .22, ease: 'power2.out', overwrite: 'auto',
    }));
  });
  const restoreTitle = contextSafe((card:HTMLElement) => {
    gsap.to(card.querySelector('h3'),{autoAlpha:1,scale:1,duration:reducedMotion?0:.4,overwrite:true});
  });
  const stop = contextSafe(() => {
    const card=playing.current?.closest<HTMLElement>('.universe-card');stopPlayback();
    if(card)restoreTitle(card);emphasize(null);
  });
  const start = contextSafe((index:number) => {
    if(dragging.current)return;
    if(reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches){emphasize(index);return;}
    stop();
    const card=root.current!.querySelector<HTMLElement>(`[data-category="${index}"]`)!;
    const video=card.querySelector<HTMLVideoElement>('video')!;
    if(card.dataset.failed==='true')return;
    const generation=++playGeneration.current;playing.current=video;emphasize(index);
    // TODO: 替换为抖音短视频切片，放 src/assets/clips/；当前为 Pexels 原始 720p 视频直链，完整时长至少 8 秒。
    if(video.getAttribute('src')!==videoLibrary.universe[index].url)video.src=videoLibrary.universe[index].url;
    void playPreview(video,stopPlayback).then(ok=>{if(ok)return;if(playing.current===video&&playGeneration.current===generation){stopPlayback();restoreTitle(card);emphasize(null);}});
  });
  const revealVideo = contextSafe((video:HTMLVideoElement) => {
    if(playing.current!==video||!isPreviewCurrent(video)){video.pause();return;}
    const card=video.closest<HTMLElement>('.universe-card')!;card.dataset.playing='true';gsap.fromTo(video,{opacity:0},{opacity:1,duration:.4,overwrite:true});
    gsap.to(card.querySelector('h3'),{autoAlpha:0,scale:.86,duration:.4,overwrite:true});
  });
  const tap = (index:number,detail:number) => {
    if(dragging.current||suppressClick.current)return;
    if(matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches)return;
    if(touchTimer.current)clearTimeout(touchTimer.current);
    if(detail>1)return; // A double tap never toggles playback or intercepts horizontal gestures.
    touchTimer.current=setTimeout(()=>{
      if(playing.current?.closest<HTMLElement>('.universe-card')?.dataset.category===String(index))stop();else start(index);
    },250);
  };

  return <section ref={root} id="content-universe" className={`content-universe ${reducedMotion ? 'universe-static' : ''}`} aria-label="内容宇宙">
    <header className="universe-heading px-gutter">
      <SplitText text="在这里，万物都能被拍成视频" mobileBreakBefore="视频" tag="h2" textAlign="left" className="universe-title font-bold text-ink" onReady={onReady} onCleanup={onCleanup} />
      <ul className="universe-tags" aria-label="内容分类">{categories.map(c => <li key={c.name}>{c.name}</li>)}</ul>
    </header>
    <div className="universe-rail-shell">
    <div ref={stage} className="universe-rail-stage" aria-label="八种内容分类">
      <div ref={track} className="universe-track" role="group" aria-roledescription="carousel" aria-label="内容分类，拖拽或左右键切换" tabIndex={0} onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}} onPointerLeave={() => stop()} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) stop(); }}>
        {categories.map((category, index) => <article key={category.name} data-category={index} tabIndex={0} aria-label={`${category.name}，${category.tag}`} className={`universe-card universe-card-${category.theme} rounded-[24px] text-ink`} onPointerEnter={event => { if (event.pointerType === 'mouse' && matchMedia('(min-width: 768px) and (hover: hover)').matches) start(index); }} onFocus={() => emphasize(index)} onPointerLeave={() => stop()} onClick={event=>tap(index,event.detail)} onDoubleClick={()=>{if(touchTimer.current)clearTimeout(touchTimer.current);}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(playing.current?.closest<HTMLElement>('.universe-card')?.dataset.category===String(index))stop();else start(index);}}}>
          <div className="universe-card-motion">
          <video className="universe-card-video" muted loop playsInline preload="none" onPlaying={event=>revealVideo(event.currentTarget)} onError={event=>{const card=event.currentTarget.closest<HTMLElement>('.universe-card')!;card.dataset.failed='true';if(playing.current===event.currentTarget)stop();}}/>
          {reducedMotion&&<img className="universe-static-cover" loading="lazy" src={videoLibrary.universe[index].poster} alt="" onError={event=>{event.currentTarget.style.display='none';}}/>}
          <span className="universe-video-icon" aria-hidden="true"><Play weight="fill" size={18}/></span><div className="universe-card-art" aria-hidden="true"><div className="universe-art-disc"/><div className="universe-art-arc"/></div>
          <h3>{category.name}</h3>
          <span className="universe-card-tag">{category.tag}</span>
          <span className="universe-explore" aria-hidden="true">{reducedMotion?'看看这个世界 →':'预览短视频 →'}</span></div>
        </article>)}
      </div>
      <div className="universe-progress" aria-hidden="true"><div className="universe-progress-fill" /></div>
    </div>
    </div>
  </section>;
}
