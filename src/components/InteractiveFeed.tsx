import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, ChatCircleDots, ShareFat, Plus, MagnifyingGlass, MusicNote, X, Play, CameraRotate, Sparkle } from '@phosphor-icons/react';
import './InteractiveFeed.css';
const posts=[
 {nick:'拾光放映室',copy:'把平凡的一天，拍成自己的主角戏。',sound:'好戏 · 拾光放映室',title:'好戏\n在生活里',likes:'8.6万',liked:'8.7万',comments:'1286'},
 {nick:'夜航船',copy:'凌晨三点，城市还藏着没讲完的故事。',sound:'城市夜航 · 夜航船',title:'凌晨三点\n的城市',likes:'2.3万',liked:'2.4万',comments:'562'},
 {nick:'深夜食堂',copy:'这一口等了一年，终于和你一起尝到。',sound:'深夜的烟火 · 深夜食堂',title:'这一口\n等了一年',likes:'5.1万',liked:'5.2万',comments:'903'},
];
const profileColors=[['#00F2EA','#183b53'],['#FE2C55','#44203e'],['#537bff','#182351'],['#ecbb57','#5e351f'],['#50cfa3','#24434a'],['#cb789a','#462640'],['#60acd6','#203248'],['#e87850','#542522'],['#8483bc','#293454']];
const conversations=[['抖音小助手','你的视频被推荐了','10:30',true],['阿青','今天也要好好生活','09:15',true],['晚风来信','每一帧都想收藏','昨天',false],['橘子海','来了来了','昨天',false],['系统通知','你的账号已登录','周一',false]] as const;
const comments=[['晚风来信','普通的日子，也可以这么有电影感。','326'],['橘子海','这一刻，想认真生活。','218'],['阿青','原声好好听，已经循环了。','186'],['山野同学','镜头里的自由感，收到！','152'],['小满','生活里的主角，原来就是自己。','98'],['蓝调邮差','谢谢你，把这一秒留下来。','76']];
export default function InteractiveFeed({reducedMotion}:{reducedMotion:boolean}){
 const root=useRef<HTMLDivElement>(null),panel=useRef<HTMLDivElement>(null),sharePanel=useRef<HTMLDivElement>(null),list=useRef<HTMLDivElement>(null);
 const index=useRef(0),slide=useRef<gsap.core.Timeline|null>(null),record=useRef<gsap.core.Tween|null>(null);
 const timer=useRef<number|undefined>(undefined),tapTimer=useRef<number|undefined>(undefined),holdTimer=useRef<number|undefined>(undefined),held=useRef(false),alive=useRef(true);
 const [current,setCurrent]=useState(0),[liked,setLiked]=useState([false,false,false]),[mode,setMode]=useState<'comments'|'share'|null>(null),[toast,setToast]=useState('');
 const [tab,setTab]=useState('推荐'),[nav,setNav]=useState('首页'),[capture,setCapture]=useState(false),[paused,setPaused]=useState(false),[draft,setDraft]=useState('');
 const [conversation,setConversation]=useState<number|null>(null),[friendLiked,setFriendLiked]=useState(false);
 const gesture=useRef<{id:number;startY:number;startX:number;delta:number;moved:boolean;surface:HTMLDivElement;frame:Element;follow:ReturnType<typeof gsap.quickTo>|null}|null>(null);
 const suppressTap=useRef(false);
 const camera=useRef<HTMLDivElement>(null);
 const [replies,setReplies]=useState(comments.map(([name,copy,count])=>({name,copy,count})));
 const {contextSafe}=useGSAP(()=>{
  const frames=root.current!.querySelectorAll('.demo-feed-post');gsap.set(frames,{yPercent:100,autoAlpha:0});gsap.set(frames[index.current],{yPercent:0,autoAlpha:1});
  if(!reducedMotion)record.current=gsap.to('.feed-record',{rotation:360,duration:12,repeat:-1,ease:'none'});
 },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;[timer,tapTimer,holdTimer].forEach(t=>window.clearTimeout(t.current));};},[]);
 useEffect(()=>{if(paused){slide.current?.pause();}else{slide.current?.resume();}if(paused||capture||(nav!=='首页'&&nav!=='朋友'))record.current?.pause();else record.current?.resume();},[paused,capture,nav]);
 useEffect(()=>{if(list.current)list.current.scrollTop=list.current.scrollHeight;},[replies]);
 useGSAP(()=>{
  [panel.current,sharePanel.current].forEach((node,i)=>{if(!node)return;const show=mode===(i===0?'comments':'share');gsap.to(node,{y:0,yPercent:show?0:100,autoAlpha:show?1:0,duration:reducedMotion?0:.32,ease:'power3.out',overwrite:true});});
 },{scope:root,dependencies:[mode,reducedMotion]});
 useGSAP(()=>{
  const pages=root.current!.querySelectorAll<HTMLElement>('.phone-page');
  pages.forEach(node=>{
   const active=node.dataset.page===(nav==='首页'||nav==='朋友'?'feed':nav);
   if(active)gsap.fromTo(node,{autoAlpha:0,x:8},{autoAlpha:1,x:0,duration:reducedMotion?0:.3,ease:'power2.out',overwrite:true});
   else gsap.to(node,{autoAlpha:0,x:-8,duration:reducedMotion?0:.15,overwrite:true});
  });
 },{scope:root,dependencies:[nav,reducedMotion]});
 useGSAP(()=>{
  gsap.to(camera.current,{yPercent:capture?0:100,autoAlpha:capture?1:0,duration:reducedMotion?0:.3,ease:'power2.out',overwrite:true});
  gsap.to('.feed-add svg',{rotation:capture?45:0,duration:reducedMotion?0:.2,overwrite:true});
 },{scope:root,dependencies:[capture,reducedMotion]});
 const bounce=contextSafe((node:Element,factor=1.2)=>{if(reducedMotion)return;gsap.killTweensOf(node);gsap.fromTo(node,{scale:1},{scale:factor,duration:.16,ease:'power2.out',yoyo:true,repeat:1});});
 const hover=contextSafe((node:Element,active:boolean)=>{gsap.to(node,{scale:active?1.1:1,duration:reducedMotion?0:.18,overwrite:true});});
 const notify=(message:string)=>{window.clearTimeout(timer.current);setToast(message);timer.current=window.setTimeout(()=>setToast(''),1500);};
 const switchVideo=contextSafe((direction:number)=>{
  if(nav!=='首页'||capture||mode||paused||root.current?.closest<HTMLElement>('.phone-ui-reveal')?.inert)return;
  const previous=index.current,following=(previous+direction+posts.length)%posts.length,frames=root.current!.querySelectorAll('.demo-feed-post');
  index.current=following;setCurrent(following);slide.current?.kill();
  const offset=Number(gsap.getProperty(frames[previous],'y'))||0;
  gsap.set(frames,{autoAlpha:0,y:0,yPercent:100});gsap.set(frames[previous],{autoAlpha:1,y:offset,yPercent:0});
  if(reducedMotion){gsap.set(frames[previous],{autoAlpha:0,y:0});gsap.set(frames[following],{autoAlpha:1,y:0,yPercent:0});return;}
  slide.current=gsap.timeline({defaults:{duration:.45,ease:'power2.inOut'}})
   .to(frames[previous],{y:0,yPercent:-100*direction,autoAlpha:0},0)
   .fromTo(frames[following],{y:0,yPercent:100*direction,autoAlpha:1},{yPercent:0,autoAlpha:1},0);
 });
 const next=()=>switchVideo(1);
 const settle=contextSafe((frame:Element)=>gsap.to(frame,{y:0,duration:reducedMotion?0:.25,ease:'power3.out',overwrite:true}));
 const endGesture=(cancelled=false)=>{
  const g=gesture.current;if(!g)return;
  gesture.current=null;window.clearTimeout(holdTimer.current);g.follow?.tween.kill();
  if(g.surface.hasPointerCapture(g.id))g.surface.releasePointerCapture(g.id);
  if(g.moved){suppressTap.current=true;window.clearTimeout(tapTimer.current);}
  if(!cancelled&&g.moved&&!held.current&&Math.abs(g.delta)>80)switchVideo(g.delta<0?1:-1);
  else settle(g.frame);
 };
 const startGesture=contextSafe((e:PointerEvent<HTMLDivElement>)=>{
  if(!e.isPrimary||e.button!==0||capture||mode)return;
  endGesture(true);held.current=false;suppressTap.current=false;window.clearTimeout(tapTimer.current);
  slide.current?.progress(1);
  const frame=root.current!.querySelectorAll('.demo-feed-post')[index.current];
  const follow=reducedMotion?null:gsap.quickTo(frame,'y',{duration:.07,ease:'power2.out'});
  gesture.current={id:e.pointerId,startY:e.clientY,startX:e.clientX,delta:0,moved:false,surface:e.currentTarget,frame,follow};
  e.currentTarget.setPointerCapture(e.pointerId);
  holdTimer.current=window.setTimeout(()=>{held.current=true;window.clearTimeout(tapTimer.current);setPaused(v=>!v);},500);
 });
 const moveGesture=(e:PointerEvent<HTMLDivElement>)=>{
  const g=gesture.current;if(!g||e.pointerId!==g.id)return;
  const rect=g.surface.getBoundingClientRect();
  // Ownership is limited to the video surface; leaving it cancels and releases capture.
  if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom){endGesture(true);return;}
  g.delta=e.clientY-g.startY;
  if(Math.hypot(g.delta,e.clientX-g.startX)>8){g.moved=true;window.clearTimeout(holdTimer.current);}
  if(!paused&&!held.current&&nav==='首页')g.follow?.(gsap.utils.clamp(-50,50,g.delta*.5));
 };
 const like=(force=false)=>{if(nav==='朋友')setFriendLiked(v=>force||!v);else setLiked(values=>values.map((v,i)=>i===current?(force||!v):v));const icon=root.current?.querySelector('[aria-label="点赞"] svg');if(icon)bounce(icon,1.5);};
 const share=async()=>{let message='链接已复制';try{await navigator.clipboard.writeText(`${location.origin}/#features`);}catch{message='复制失败，请稍后重试';}if(alive.current){setMode(null);notify(message);}};
 const post=posts[current];
 const isFeed=nav==='首页'||nav==='朋友';
 const changePage=(page:string)=>{endGesture(true);suppressTap.current=false;window.clearTimeout(tapTimer.current);window.clearTimeout(holdTimer.current);setMode(null);setCapture(false);setPaused(false);setNav(page);if(page==='朋友')setFriendLiked(false);setTab(page==='朋友'?'关注':'推荐');};
 const controlHover={onPointerEnter:(e:PointerEvent<HTMLElement>)=>hover(e.currentTarget,true),onPointerLeave:(e:PointerEvent<HTMLElement>)=>hover(e.currentTarget,false)};
 return <div ref={root} className="screen-frame frame-feed interactive-feed isolate cursor-pointer overflow-clip outline-none" data-frame="feed" data-feed-index={current} data-paused={paused} role="region" aria-label="抖音推荐互动演示" tabIndex={0} onPointerDownCapture={e=>{if((e.target as HTMLElement).closest('button'))e.preventDefault();}} onKeyDown={e=>{if(e.key==='Escape'){setMode(null);setCapture(false);}else if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();next();}}}>
  <div className="phone-page phone-feed-page" data-page="feed" aria-hidden={!isFeed} inert={!isFeed||capture}>
  <div className="phone-home-posts" hidden={nav==='朋友'}>
  {posts.map((p,i)=><div className={`demo-feed-post absolute inset-0 overflow-hidden demo-post-${i}`} key={p.nick} aria-hidden={current!==i}><div className="demo-gradient"><div className="demo-sphere"/><div className="demo-orbit"/><span>{p.title}</span></div><div className="feed-shade"/><div className="feed-caption"><b>@{p.nick}</b><p>{p.copy}</p><span><MusicNote size={10}/> 原声 · {p.sound}</span></div></div>)}
  </div>
  {nav==='朋友'&&<div className="friend-poster"><div className="friend-orbs"><i/><i/><i/></div><div className="feed-caption"><b>@你的朋友刚刚发布了新作品</b><p>一起，把今天变成值得记住的一天。</p><span>♪ 原声 · 我们的日常</span></div></div>}
  <div className="feed-gesture absolute" aria-label="上滑下一条，下滑上一条；双击点赞，长按暂停"
   onPointerDown={startGesture} onPointerMove={moveGesture} onPointerUp={()=>endGesture()} onPointerCancel={()=>endGesture(true)} onLostPointerCapture={()=>endGesture(true)}
   onClick={e=>{if(suppressTap.current){suppressTap.current=false;return;}if(held.current){held.current=false;return;}const rect=e.currentTarget.getBoundingClientRect();if(e.clientY-rect.top<rect.height/2)return;window.clearTimeout(tapTimer.current);tapTimer.current=window.setTimeout(next,240);}}
   onDoubleClick={e=>{e.preventDefault();if(suppressTap.current)return;window.clearTimeout(tapTimer.current);like(true);}}/>

  <div className="screen-top feed-tabs"><button type="button" aria-pressed={tab===(nav==='朋友'?'同城':'关注')} {...controlHover} onClick={()=>setTab(nav==='朋友'?'同城':'关注')}>{nav==='朋友'?'同城':'关注'}</button><button type="button" aria-pressed={tab===(nav==='朋友'?'关注':'推荐')} {...controlHover} onClick={()=>setTab(nav==='朋友'?'关注':'推荐')}>{nav==='朋友'?'关注':'推荐'}</button><button type="button" aria-label="搜索演示" {...controlHover} onClick={()=>notify('搜索功能为演示')}><MagnifyingGlass size={22}/></button></div>
  <div className="feed-rail absolute right-[6%] bottom-[21%] z-[3] flex flex-col items-center gap-[3.8cqw]">
   <div className="rail-avatar"><span className="avatar" aria-label="虚构创作者头像"/><button className="avatar-plus" type="button" aria-label="关注创作者" {...controlHover} onClick={()=>notify('关注成功')}><Plus size={9} weight="bold"/></button></div>
   <button type="button" aria-label="点赞" aria-pressed={nav==='朋友'?friendLiked:liked[current]} {...controlHover} onClick={()=>like()} style={{color:(nav==='朋友'?friendLiked:liked[current])?'#FE2C55':'white'}}><Heart size={22} weight="fill"/><small>{nav==='朋友'?(friendLiked?'1':'0'):(liked[current]?post.liked:post.likes)}</small></button>
   <button type="button" aria-label="打开评论" {...controlHover} onClick={e=>{bounce(e.currentTarget.querySelector('svg')!);setMode('comments');}}><ChatCircleDots size={22} weight="fill"/><small>{nav==='朋友'?0:Number(post.comments)+replies.length-comments.length}</small></button>
   <button type="button" aria-label="打开分享" {...controlHover} onClick={e=>{bounce(e.currentTarget.querySelector('svg')!);setMode('share');}}><ShareFat size={22} weight="fill"/><small>分享</small></button>
   <span className="feed-record" aria-label="原声唱片" onPointerEnter={()=>record.current?.pause()} onPointerLeave={()=>{if(!paused)record.current?.resume();}}><MusicNote size={14} weight="fill"/></span>
  </div>
  <span className="feed-tap-hint" aria-hidden="true">双击点赞 · 长按暂停</span>{paused&&<span className="feed-paused" role="status">已暂停</span>}
  </div>
  {/* Mock phone pages stay mounted so GSAP can fade the outgoing and incoming content together. */}
  <div className="phone-page phone-messages" data-page="消息" aria-hidden={nav!=='消息'} inert={nav!=='消息'||capture}>
   <header><h3>消息</h3><button type="button" aria-label="搜索消息" {...controlHover}><MagnifyingGlass size={18}/></button></header>
   <div className="phone-conversations">{conversations.map(([name,text,time,unread],i)=><button type="button" className={conversation===i?'selected':''} key={name} aria-pressed={conversation===i} {...controlHover} onClick={()=>setConversation(i)}><span className="conversation-avatar">{name.slice(0,1)}</span><span className="conversation-copy"><b>{name}</b><small>{text}</small></span><span className="conversation-meta"><time>{time}</time>{unread&&<i/>}</span></button>)}</div>
  </div>
  <div className="phone-page phone-profile" data-page="我" aria-hidden={nav!=='我'} inert={nav!=='我'||capture}>
   <header><span className="profile-avatar"/><div><h3>@我</h3><small>抖音号：dy_2026</small></div></header>
   <div className="profile-stats">{[['128.6万','获赞'],['328','关注'],['8.6万','粉丝']].map(([number,label])=><div key={label}><b>{number}</b><span>{label}</span></div>)}</div>
   <button type="button" className="profile-edit" {...controlHover}>编辑资料</button>
   <div className="profile-grid">{Array.from({length:9},(_,i)=><button type="button" key={i} aria-label={`作品 ${i+1}`} {...controlHover} style={{background:`radial-gradient(at ${20+i*7}% 20%,${profileColors[i][0]}88,transparent 70%),linear-gradient(${i*30}deg,#101b22,${profileColors[i][1]})`}}><Play weight="fill" size={15}/></button>)}</div>
   <small className="profile-private">私密</small>
  </div>
  <div ref={camera} className="phone-camera" role="dialog" aria-label="拍摄页演示" aria-hidden={!capture} inert={!capture}>
   <header><button type="button" aria-label="翻转" {...controlHover}><CameraRotate size={19}/><small>翻转</small></button><button type="button" aria-label="美颜和滤镜" {...controlHover}><Sparkle size={19}/><small>美颜 / 滤镜</small></button><button type="button" className="camera-close" aria-label="关闭拍摄页" {...controlHover} onClick={()=>setCapture(false)}><X size={19}/></button></header>
   <button type="button" className="camera-shutter" aria-label="拍摄键演示" {...controlHover}/>
   <div className="camera-modes">{['照片','视频','直播'].map(label=><button key={label} type="button" {...controlHover} className={label==='视频'?'active':''}>{label}</button>)}</div>
  </div>
  <nav className="feed-bottom" aria-label="演示手机导航">{['首页','朋友','+','消息','我'].map(label=>label==='+'?<button key={label} className="feed-add" type="button" aria-label="拍摄演示" aria-pressed={capture} {...controlHover} onClick={()=>{setMode(null);setCapture(v=>!v);}}><Plus size={18} weight="bold"/></button>:<button key={label} type="button" aria-pressed={nav===label} {...controlHover} onClick={()=>changePage(label)}>{label}</button>)}</nav>
  {mode&&<button type="button" className="feed-comment-backdrop" aria-label="关闭手机面板" onClick={()=>setMode(null)}/>}
  <div ref={panel} className="feed-comment-panel" role="dialog" aria-label="评论区" aria-hidden={mode!=='comments'} inert={mode!=='comments'}><header><b>评论 · 演示</b><button type="button" {...controlHover} aria-label="收起评论" onClick={()=>setMode(null)}><X size={15}/></button></header><div ref={list} className="feed-comment-list">{replies.map(({name,copy,count},i)=><div className="feed-comment-row" key={i}><span className="comment-avatar"/><div><b>{name}</b><p>{copy}</p></div><span className="comment-likes"><Heart size={9}/>{count}</span></div>)}</div>
   {/* TODO: 部署后接真实输入校验；React 以文本渲染用户评论，禁止注入 HTML。 */}
   <form className="feed-comment-input" onSubmit={e=>{e.preventDefault();const copy=draft.trim();if(copy){setReplies(v=>[...v,{name:'我',copy,count:'0'}]);setDraft('');}}}><input aria-label="发布手机评论" placeholder="说点什么…" maxLength={120} value={draft} onChange={e=>setDraft(e.target.value)}/><button type="submit" {...controlHover}>发送</button></form>
  </div>
  <div ref={sharePanel} className="feed-comment-panel feed-share-panel" role="dialog" aria-label="分享面板" aria-hidden={mode!=='share'} inert={mode!=='share'}><header><b>分享给朋友</b><button type="button" {...controlHover} aria-label="收起分享" onClick={()=>setMode(null)}><X size={15}/></button></header><div className="feed-share-friends">{['晚风','橘子','山野','阿青'].map(name=><div key={name}><span className="comment-avatar"/><small>{name}</small></div>)}</div><div className="feed-share-actions"><button type="button" {...controlHover} onClick={()=>void share()}>复制链接</button><button type="button" {...controlHover} onClick={()=>{setMode(null);notify('已收到你的反馈');}}>不感兴趣</button></div></div>
  <div className="feed-toast" role="status" aria-live="polite">{toast}</div>
 </div>;
}
