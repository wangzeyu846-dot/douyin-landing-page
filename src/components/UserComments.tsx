import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
type Comment={id:number;text:string};
function UserComment({comment,reducedMotion,onDone}:{comment:Comment;reducedMotion:boolean;onDone:(id:number)=>void}){
 const root=useRef<HTMLSpanElement>(null);
 useGSAP(()=>{
  if(reducedMotion)return;
  const node=root.current!,width=node.parentElement!.clientWidth;
  gsap.fromTo(node,{x:width+20},{x:-node.offsetWidth-30,duration:(width+node.offsetWidth+50)/60,ease:'none',onComplete:()=>onDone(comment.id)});
 },{scope:root,dependencies:[reducedMotion],revertOnUpdate:true});
 return <span ref={root} className="user-comment" style={{top:`${10+comment.id%8*10}%`}}>{comment.text}</span>;
}
export default function UserComments({reducedMotion}:{reducedMotion:boolean}){
 const [draft,setDraft]=useState(''),[comments,setComments]=useState<Comment[]>([]),[status,setStatus]=useState('');
 const next=useRef(0);
 const done=useCallback((id:number)=>setComments(prev=>prev.filter(c=>c.id!==id)),[]);
 const submit=(event:FormEvent)=>{
  event.preventDefault();
  // TODO: 部署后接真实输入校验、频率限制和服务端审核；永远以文本渲染，不使用 innerHTML。
  const text=draft.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80);
  if(!text){setStatus('先写一句，再发送。');return;}
  setComments(prev=>[...prev.slice(-19),{id:++next.current,text}]);setDraft('');setStatus('评论已上屏，仅在当前页面展示。');
 };
 return <>
  <div className={`user-comments ${reducedMotion?'user-comments-static':''}`} aria-live="off">{comments.map(comment=><UserComment key={comment.id} comment={comment} reducedMotion={reducedMotion} onDone={done}/>)}</div>
  <form className="comment-composer" onSubmit={submit}>
   <label className="sr-only" htmlFor="rain-input">发送一条评论</label><input id="rain-input" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="说点什么…" maxLength={80} autoComplete="off"/><span aria-hidden="true">回车发送</span>
   <p className="sr-only" role="status">{status}</p>
  </form>
 </>;
}
