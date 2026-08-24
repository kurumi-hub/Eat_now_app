"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import { interveneOrderAction } from "@/app/admin/actions";
import type { AdminActionResult, AdminOrderItem, AdminOrderList } from "@/types/admin";
import { createClient } from "@/utils/supabase/client";

const ORDER: Record<string,string> = { pending:"Đơn mới",confirmed:"Đã nhận",preparing:"Đang chuẩn bị",ready:"Sẵn sàng",delivering:"Đang giao",completed:"Hoàn thành",cancelled:"Đã hủy" };
const DELIVERY: Record<string,string> = { unassigned:"Chưa gán",searching:"Đang tìm tài xế",assigned:"Đã gán",arrived_at_restaurant:"Đã đến quán",picked_up:"Đã lấy món",delivering:"Đang giao",proof_submitted:"Chờ khách xác nhận",delivery_review:"Tranh chấp",delivered:"Đã giao",failed:"Thất bại",cancelled:"Đã hủy" };
const SLA: Record<string,string> = { preparation_overdue:"Chuẩn bị món quá hạn",dispatch_overdue:"Chưa tìm được tài xế",pickup_overdue:"Tài xế chậm lấy món",delivery_overdue:"Giao hàng quá hạn" };
function money(value:number){return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(value)}
function date(value:string){return new Date(value).toLocaleString("vi-VN",{dateStyle:"short",timeStyle:"short"})}

export default function AdminOrderConsole({ data, searchTerm, statusFilter }: { data: AdminOrderList; searchTerm: string; statusFilter: string }) {
  const router=useRouter(); const [pending,startTransition]=useTransition(); const [search,setSearch]=useState(searchTerm);
  const [notice,setNotice]=useState<AdminActionResult|null>(null);
  useEffect(()=>{const supabase=createClient();const channel=supabase.channel("admin-order-events")
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"order_events"},()=>router.refresh()).subscribe();
    return()=>{void supabase.removeChannel(channel)}},[router]);
  const navigate=(values:{q?:string;status?:string;page?:number})=>{const params=new URLSearchParams({tab:"orders"});const q=values.q??searchTerm;const status=values.status??statusFilter;if(q)params.set("q",q);if(status)params.set("status",status);if((values.page??1)>1)params.set("page",String(values.page));startTransition(()=>router.push(`/admin?${params}`));};
  const submit=(event:FormEvent)=>{event.preventDefault();navigate({q:search.trim(),page:1})};
  const act=(item:AdminOrderItem,action:"redispatch"|"mark_failed"|"cancel_refund"|"resolve_complete"|"resend_notification")=>{const note=window.prompt("Lý do/ghi chú can thiệp (ít nhất 5 ký tự):")||"";if(!note)return;startTransition(async()=>{const result=await interveneOrderAction(item.id,action,note,item.version);setNotice(result);if(result.ok)router.refresh()})};
  const page=Math.floor(data.offset/data.limit)+1;const pages=Math.max(1,Math.ceil(data.total/data.limit));
  return <section className="admin-orders-console">
    {notice&&<div className={`admin-alert ${notice.ok?"is-success":"is-error"}`}>{notice.message}<button type="button" onClick={()=>setNotice(null)}>×</button></div>}
    <section className="admin-panel"><div className="admin-panel__heading"><div><h2>Điều hành đơn hàng</h2><p>{data.total} đơn · mọi can thiệp đều ghi audit và yêu cầu lý do</p></div></div>
      <div className="admin-orders-tools"><form className="admin-search" onSubmit={submit}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Mã đơn, khách, nhà hàng hoặc mã VNPay"/><button disabled={pending}>Tìm</button></form><div className="admin-filters">{[["","Tất cả"],["stuck","Quá SLA"],["incident","Sự cố"],["pending","Đơn mới"],["searching","Tìm shipper"],["delivering","Đang giao"],["proof_submitted","Chờ khách"],["completed","Hoàn thành"],["cancelled","Đã hủy"]].map(([value,label])=><button type="button" key={value||"all"} className={statusFilter===value?"is-active":""} onClick={()=>navigate({status:value,page:1})}>{label}</button>)}</div></div>
      <div className="admin-order-list">{data.items.length?data.items.map(item=><article key={item.id} className={`${item.incidentStatus==="open"?"has-incident":""} ${item.slaState==="overdue"?"is-overdue":""}`}><header><div><span>{item.code}</span><h3>{item.restaurantName}</h3><small>{item.customerName} · {item.customerPhone} · {date(item.createdAt)}</small></div><div><b>{ORDER[item.status]||item.status}</b><em>{DELIVERY[item.deliveryStatus]||item.deliveryStatus}</em></div></header>{item.slaState==="overdue"&&<div className="admin-order-sla"><strong>{SLA[item.slaCode||""]||"Đơn hàng quá SLA"}</strong><span>Quá hạn {item.slaOverdueMinutes} phút{item.slaDueAt?` · hạn ${date(item.slaDueAt)}`:""}</span></div>}{item.incidentStatus==="open"&&<div className="admin-order-incident"><strong>Sự cố đang mở</strong><span>{item.incidentReason||"Chưa có mô tả"}</span></div>}<div className="admin-order-summary"><div><span>Tổng thanh toán</span><strong>{money(item.totalPrice)}</strong><small>{item.paymentMethod.toUpperCase()} · {item.paymentStatus}{item.transactionId?` · ${item.transactionId}`:""}</small></div><div><span>Tài xế</span><strong>{item.shipperName||"Chưa gán"}</strong></div></div><details><summary>Timeline ({item.events.length})</summary><ol>{item.events.map(event=><li key={event.id}><b>{event.toOrderStatus||event.toDeliveryStatus||event.eventType}</b><span>{event.source} · {date(event.createdAt)}{event.note?` · ${event.note}`:""}</span></li>)}</ol></details><footer>{["assigned","arrived_at_restaurant","searching"].includes(item.deliveryStatus)&&item.status!=="cancelled"&&<button disabled={pending} onClick={()=>act(item,"redispatch")}>Tìm lại shipper</button>}{["proof_submitted","delivery_review"].includes(item.deliveryStatus)&&<button className="is-primary" disabled={pending} onClick={()=>act(item,"resolve_complete")}>Xác nhận hoàn tất</button>}{!["completed","cancelled"].includes(item.status)&&<>{["assigned","arrived_at_restaurant","picked_up","delivering","proof_submitted","delivery_review"].includes(item.deliveryStatus)&&<button disabled={pending} onClick={()=>act(item,"mark_failed")}>Giao thất bại</button>}<button className="is-danger" disabled={pending} onClick={()=>act(item,"cancel_refund")}>Hủy/hoàn tiền</button></>}<button disabled={pending} onClick={()=>act(item,"resend_notification")}>Gửi lại thông báo</button></footer></article>):<div className="admin-empty-state">Không tìm thấy đơn hàng.</div>}</div>
      {pages>1&&<nav className="admin-pagination"><button disabled={pending||page<=1} onClick={()=>navigate({page:page-1})}>Trang trước</button><span>Trang <strong>{page}</strong> / {pages}</span><button disabled={pending||page>=pages} onClick={()=>navigate({page:page+1})}>Trang sau</button></nav>}
    </section>
  </section>;
}
