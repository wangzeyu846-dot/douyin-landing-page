import InteractiveFeed from './InteractiveFeed';
import { Heart, ChatCircleDots, ShareFat, Plus, CameraRotate, Sparkle, ArrowLeft, MagnifyingGlass, MusicNote, List, DotsThree, WifiHigh, BatteryFull } from '@phosphor-icons/react';

export type FrameKind = 'feed' | 'live' | 'camera' | 'creator';
export const chapters = [
 {kind:'feed',title:'为你而刷',copy:'你喜欢什么，算法就懂什么'},
 {kind:'live',title:'正在直播',copy:'3000 万人此刻正在看'},
 {kind:'camera',title:'一拍即发',copy:'从拍到发，不超过三步'},
 {kind:'creator',title:'人人都能红',copy:'1 亿创作者，在这里被看见'},
] as const;
const Icon = {size:22,weight:'regular' as const};
function Avatar({large=false}:{large?:boolean}) { return <span className={`avatar ${large?'avatar-large':''}`} aria-label="渐变创作者头像"/>; }
function Poster({variant=0}:{variant?:number}) { return <div className={`abstract-poster poster-${variant}`} aria-hidden="true"><div className="poster-orbit"/><div className="poster-disc"/><span className="poster-type">{variant===1?'ON AIR':'好戏\n在生活里'}</span></div>; }
function Rail() { return <div className="feed-rail" aria-label="演示互动信息"><div className="rail-avatar"><Avatar/><span className="avatar-plus"><Plus size={9} weight="bold"/></span></div><span><Heart {...Icon} weight="fill"/><small>8.6万</small></span><span><ChatCircleDots {...Icon} weight="fill"/><small>1286</small></span><span><ShareFat {...Icon} weight="fill"/><small>分享</small></span></div>; }
function BottomNav() { return <div className="feed-bottom" aria-hidden="true"><span>首页</span><span>朋友</span><span className="feed-add"><Plus size={14} weight="bold"/></span><span>消息</span><span>我</span></div>; }
export function ScreenFrame({kind,interactive=false,reducedMotion=false}:{kind:FrameKind;interactive?:boolean;reducedMotion?:boolean}) {
 if(kind==='feed'&&interactive)return <InteractiveFeed reducedMotion={reducedMotion}/>;
 if (kind==='creator') return <div className="screen-frame frame-creator" data-frame={kind}>
  <div className="screen-top"><ArrowLeft {...Icon}/><span/><MagnifyingGlass {...Icon}/><DotsThree {...Icon}/></div>
  <div className="profile-cover"><div className="profile-cover-orbit"/></div>
  <div className="profile-body"><Avatar large/><h3>拾光放映室</h3><p className="profile-id">抖音号：shiguang_studio</p><div className="profile-stats"><span><b>128.6万</b>获赞</span><span><b>326</b>关注</span><span><b>8.9万</b>粉丝</span></div><p className="profile-bio">把普通的一天，拍成自己的电影。</p><div className="profile-follow">关注 <Plus size={12}/></div><div className="profile-tabs"><b>作品 36</b><span>喜欢</span><span>收藏</span></div><div className="profile-grid">{Array.from({length:9},(_,i)=><div key={i} className={`grid-art grid-art-${i%3}`}><PlayMini/><span>{['3.2万','8652','1.8万'][i%3]}</span></div>)}</div></div>
 </div>;
 if (kind==='camera') return <div className="screen-frame frame-camera" data-frame={kind}><Poster variant={2}/><div className="camera-shade"/><div className="screen-top"><ArrowLeft {...Icon}/><span>选择音乐 <MusicNote size={12}/></span></div><div className="camera-tools"><span><CameraRotate {...Icon}/>翻转</span><span><Sparkle {...Icon}/>美颜</span><span><List {...Icon}/>滤镜</span></div><div className="camera-viewfinder"/><div className="camera-bottom"><div className="camera-modes"><span>照片</span><b>视频</b><span>直播</span></div><div className="record-row"><span className="camera-album"/><span className="record-button" aria-label="演示拍摄按钮"/><span className="camera-length">15秒</span></div><div className="camera-hint">让这一刻，成为作品</div></div></div>;
 if (kind==='live') return <div className="screen-frame frame-live" data-frame={kind}><Poster variant={1}/><div className="feed-shade"/><div className="live-top"><Avatar/><div><b>拾光放映室</b><small>2.6万人在看</small></div><span className="live-follow">关注</span></div><span className="live-badge">LIVE</span><div className="live-topic">一起聊聊<br/><b>生活里的好戏</b></div><div className="danmaku-track">{['这个光影太好看了','普通日子也会发光','把热爱拍下来','今晚的氛围满分'].map((t,i)=><span key={t} className={`danmaku bubble-${i}`}>{t}</span>)}</div><div className="live-chat"><p><span>晚风来信</span> 每一帧都想收藏</p><p><span>阿青</span> 今天也要好好生活</p><p><span>橘子海</span> 来了来了</p></div><div className="live-controls"><span>说点什么…</span><ChatCircleDots size={17}/><Heart size={19} weight="fill"/><ShareFat size={18}/></div></div>;
 return <div className="screen-frame frame-feed" data-frame={kind}><Poster/><div className="feed-shade"/><div className="screen-top feed-tabs"><span>关注</span><b>推荐</b><MagnifyingGlass {...Icon}/></div><span className="live-badge">LIVE</span><Rail/><div className="feed-caption"><b>@拾光放映室</b><p>把平凡的一天，拍成自己的主角戏。</p><span><MusicNote size={10}/> 原声 · 拾光放映室</span></div><BottomNav/></div>;
}
function PlayMini(){ return <span aria-hidden="true" className="mini-play">▷</span>; }
export default function Phone({single,interactive=false,reducedMotion=false,reveal=false}:{single?:FrameKind;interactive?:boolean;reducedMotion?:boolean;reveal?:boolean}) { return <div className="phone-shell"><div className="phone-screen"><div className={reveal?'phone-ui-reveal':'phone-ui'}><div className="phone-status" aria-hidden="true"><span>9:41</span><span><WifiHigh size={10}/><BatteryFull size={13}/></span></div><div className="phone-notch" aria-hidden="true"/>{single?<ScreenFrame kind={single} interactive={interactive} reducedMotion={reducedMotion}/>:chapters.map(c=><ScreenFrame key={c.kind} kind={c.kind}/>)}<div className="home-indicator" aria-hidden="true"/></div></div><div className="phone-side-key" aria-hidden="true"/></div>; }
