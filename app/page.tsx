'use client'
import { useEffect, useState, CSSProperties } from 'react'
import { supabase } from '../lib/supabase'

interface Order {
  inv: string; type: string; cust: string; custPhone: string; custNotes: string; 
  pay: string; mthd: string; vat: string; notes: string;
  cashAmt: string; cardAmt: string; bankAmt: string;
  lines: Line[]; opts: Record<number, any>; msg: string; busy: boolean; open: boolean;
}
interface Line { style: string; colour: string; from: string; boxes: string; price: string; }

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) { setErr(error.message); setLoading(false) } else onLogin()
  }
  return (
    <div style={{minHeight:'100vh',background:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      <div style={{display:'flex',maxWidth:800,width:'100%',minHeight:420,borderRadius:12,overflow:'hidden',boxShadow:'0 25px 80px rgba(0,0,0,0.5)'}}>
        <div style={{flex:1,background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px 50px',color:'white'}}>
          <h1 style={{fontSize:28,fontWeight:300,margin:0,letterSpacing:3,textTransform:'uppercase'}}>Leading Fashions</h1>
          <div style={{width:40,height:2,background:'#e2725b',marginTop:12}}></div>
        </div>
        <div style={{width:360,background:'#fff',padding:'50px 40px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <h2 style={{fontSize:18,fontWeight:600,color:'#111',margin:'0 0 24px'}}>Sign In</h2>
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}><label style={{display:'block',fontSize:11,fontWeight:600,color:'#555',marginBottom:5,textTransform:'uppercase',letterSpacing:1}}>Email</label><input type="email" value={email} onChange={(e: any)=>setEmail(e.target.value)} required style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:6,fontSize:14,color:'#111',outline:'none',boxSizing:'border-box' as const}} placeholder="your@email.com"/></div>
            <div style={{marginBottom:20}}><label style={{display:'block',fontSize:11,fontWeight:600,color:'#555',marginBottom:5,textTransform:'uppercase',letterSpacing:1}}>Password</label><input type="password" value={pass} onChange={(e: any)=>setPass(e.target.value)} required style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:6,fontSize:14,color:'#111',outline:'none',boxSizing:'border-box' as const}} placeholder="••••••••"/></div>
            {err&&<div style={{background:'#fff0f0',color:'#c0392b',padding:10,borderRadius:6,marginBottom:14,fontSize:12}}>{err}</div>}
            <button type="submit" disabled={loading} style={{width:'100%',padding:13,background:loading?'#999':'#111',color:'white',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:loading?'default':'pointer',letterSpacing:1}}>{loading?'SIGNING IN...':'SIGN IN'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('orders')
  const [stats, setStats] = useState({shop:0,wh:0,styles:0,todayOut:0})
  const [inv, setInv] = useState<any[]>([])
  const [nextInv, setNextInv] = useState('1')
  const [stockMap, setStockMap] = useState<any>({})
  const [selectedLoc, setSelectedLoc] = useState<string|null>(null)
  const [locDetail, setLocDetail] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [allCusts, setAllCusts] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([makeOrder('1')])
  const [styleQ, setStyleQ] = useState('')
  const [styleR, setStyleR] = useState<any[]>([])
  const [styleImg, setStyleImg] = useState<string|null>(null)
  const [custQ, setCustQ] = useState('')
  const [custR, setCustR] = useState<any[]>([])
  const [editingLog, setEditingLog] = useState<any>(null)
  const [logFilter, setLogFilter] = useState('')
  const [expandedLog, setExpandedLog] = useState<number|null>(null)
  const [masterInv, setMasterInv] = useState<any[]>([])
  const [masterFilter, setMasterFilter] = useState('')
  const [masterLoc, setMasterLoc] = useState('')
  const [masterEdit, setMasterEdit] = useState<any>(null)
  const [masterAdd, setMasterAdd] = useState(false)
  const [newItem, setNewItem] = useState({location_id:'',style_code:'',colour:'',boxes:''})
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [showAudit, setShowAudit] = useState(false)
  const [custProfile, setCustProfile] = useState<any>(null)
  const [custProfileTab, setCustProfileTab] = useState('overview')
  const [custNotes, setCustNotes] = useState<any[]>([])
  const [custFollowups, setCustFollowups] = useState<any[]>([])
  const [custOrders, setCustOrders] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [showAddFollowup, setShowAddFollowup] = useState(false)
  const [newFollowup, setNewFollowup] = useState({title:'',details:'',due_date:'',priority:'Normal',category:'Phone Call'})
  const [allFollowups, setAllFollowups] = useState<any[]>([])
  const [custSearch, setCustSearch] = useState('')

  function makeOrder(n: string): Order {
    return {inv:n,type:'OUT',cust:'',custPhone:'',custNotes:'',pay:'Paid',mthd:'Cash',vat:'0',notes:'',cashAmt:'',cardAmt:'',bankAmt:'',lines:[{style:'',colour:'',from:'',boxes:'',price:''}],opts:{},msg:'',busy:false,open:true}
  }

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user||null);setChecking(false);if(session?.user)load()})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_: any,s: any)=>{setUser(s?.user||null);if(s?.user)load()})
    return()=>subscription.unsubscribe()
  },[])

  async function logout(){await supabase.auth.signOut();setUser(null)}

  async function load() {
    const {data:i}=await supabase.from('inventory').select('*');setInv(i||[]);setMasterInv(i||[])
    const shop=(i||[]).filter((r: any)=>!r.location_id.startsWith('W'))
    const wh=(i||[]).filter((r: any)=>r.location_id.startsWith('W'))
    const {data:m}=await supabase.from('v_shop_map').select('*')
    const mp: any={};(m||[]).forEach((r: any)=>{mp[r.location_id]=r});setStockMap(mp)
    const {data:ni}=await supabase.rpc('get_next_invoice');const nxt=ni||'1';setNextInv(nxt)
    if(orders.length===1&&orders[0].inv==='1')setOrders([makeOrder(nxt)])
    const {data:c}=await supabase.from('customers').select('*').order('last_order',{ascending:false});setAllCusts(c||[])
    const {data:fu}=await supabase.from('customer_followups').select('*').eq('completed',false).order('due_date',{ascending:true});setAllFollowups(fu||[])
    const today=new Date().toISOString().split('T')[0]
    const {data:tl}=await supabase.from('stock_log').select('qty,type').ilike('created_at',today+'%')
    const tout=(tl||[]).filter((r: any)=>r.type==='OUT'||r.type==='TBC').reduce((s: number,r: any)=>s+Math.abs(r.qty||0),0)
    setStats({shop:shop.reduce((s: number,r: any)=>s+r.boxes,0),wh:wh.reduce((s: number,r: any)=>s+r.boxes,0),styles:new Set((i||[]).map((r: any)=>r.style_code)).size,todayOut:tout})
  }

  // Payment string builder
  function buildPayStr(o: Order): string {
    if(o.pay==='Mixed'){
      const parts: string[]=[]
      if(parseFloat(o.cashAmt)>0)parts.push('Cash £'+o.cashAmt)
      if(parseFloat(o.cardAmt)>0)parts.push('Card £'+o.cardAmt)
      if(parseFloat(o.bankAmt)>0)parts.push('Bank £'+o.bankAmt)
      return 'Mixed ('+parts.join(' + ')+')'
    }
    return o.pay+(o.mthd&&o.mthd!=='N/A'?' ('+o.mthd+')':'')
  }

  function custSuggestions(q: string): any[]{if(q.length<2)return[];return allCusts.filter((c: any)=>(c.name||'').toLowerCase().includes(q.toLowerCase())).slice(0,8)}
  function selectCustForOrder(oi: number,c: any){updOrder(oi,{cust:c.name,custPhone:c.phone||'',custNotes:c.notes||''})}
  function updOrder(idx: number,ch: Partial<Order>){setOrders(p=>p.map((o,i)=>i===idx?{...o,...ch}:o))}
  function updLine(oi: number,li: number,f: string,v: string){setOrders(p=>p.map((o,i)=>{if(i!==oi)return o;const nl=[...o.lines];nl[li]={...nl[li],[f]:v};return{...o,lines:nl}}))}
  function addLine(oi: number){setOrders(p=>p.map((o,i)=>i===oi?{...o,lines:[...o.lines,{style:'',colour:'',from:'',boxes:'',price:''}]}:o))}
  function rmLine(oi: number,li: number){setOrders(p=>p.map((o,i)=>i===oi?{...o,lines:o.lines.filter((_: any,j: number)=>j!==li)}:o))}
  function addNewOrder(){const used=orders.map((o: Order)=>parseInt(o.inv)||0);const mx=Math.max(...used,parseInt(nextInv)||0);setOrders(p=>[...p,makeOrder(String(mx+1))])}
  function removeOrder(idx: number){if(orders.length<=1)return;setOrders(p=>p.filter((_: any,i: number)=>i!==idx))}
  function toggleOrder(idx: number){updOrder(idx,{open:!orders[idx].open})}

  async function styleBlur(oi: number,li: number,style: string){
    if(!style||style.length<2)return
    const {data}=await supabase.rpc('get_style_options',{p_style:style})
    if(data){setOrders(p=>p.map((o,i)=>{if(i!==oi)return o;const no={...o.opts,[li]:data};const nl=[...o.lines];if(data.colours?.length>0&&!nl[li].colour)nl[li]={...nl[li],colour:data.colours[0]};if(data.shop_locations?.length>0&&!nl[li].from)nl[li]={...nl[li],from:data.shop_locations[0]};return{...o,opts:no,lines:nl}}))}
    const {data:cat}=await supabase.rpc('get_catalogue_info',{p_style:style})
    if(cat&&cat.length>0&&cat[0].sell_price){setOrders(p=>p.map((o,i)=>{if(i!==oi)return o;const nl=[...o.lines];if(!nl[li].price)nl[li]={...nl[li],price:String(cat[0].sell_price)};return{...o,lines:nl}}))}
  }

  async function submitOrder(idx: number){
    const o=orders[idx];updOrder(idx,{busy:true,msg:''})
    const valid=o.lines.filter((l: Line)=>l.style&&parseInt(l.boxes)>0)
    if(!valid.length){updOrder(idx,{busy:false,msg:'Add lines with style + boxes'});return}
    if((o.type==='OUT'||o.type==='TBC')&&!o.cust){updOrder(idx,{busy:false,msg:'Enter customer name'});return}
    const now=new Date().toISOString()
    const payStr=buildPayStr(o)
    let shopT=stats.shop;const errors: string[]=[]
    for(let i=0;i<valid.length;i++){
      const L=valid[i],bx=parseInt(L.boxes)||0,priceNote=L.price?'£'+L.price+(parseFloat(o.vat)>0?' +VAT':''):''
      if(L.style.toUpperCase()==='DPD'){await supabase.from('stock log imported').insert({'DATE':now,'ORDER#':o.inv,'TYPE':o.type,'STYLE':L.style,'COLOUR':L.colour||'N/A','£/PAIR':priceNote,'QTY':-bx,'TO':o.cust,'CUSTOMER':o.cust,'PAYMENT':payStr,'NOTES':'Order #'+o.inv+' | '+bx+'bx'+(o.notes?' | '+o.notes:''),'SHOP TOTAL':shopT});continue}
      if(o.type==='OUT'||o.type==='TBC'){
        const match=inv.find((r: any)=>r.style_code.toLowerCase()===L.style.toLowerCase()&&r.colour.toLowerCase()===L.colour.toLowerCase()&&r.location_id===L.from)
        if(!match){errors.push(L.style+' '+L.colour+' not found at '+L.from);continue}
        if(match.boxes<bx){errors.push(L.style+' only '+match.boxes+' at '+L.from+', need '+bx);continue}
        const nq=match.boxes-bx;await supabase.from('inventory').update({boxes:nq}).eq('id',match.id);match.boxes=nq;shopT-=bx
        await supabase.from('stock log imported').insert({'DATE':now,'ORDER#':o.inv,'TYPE':o.type,'STYLE':L.style,'COLOUR':L.colour,'£/PAIR':priceNote,'QTY':-bx,'BEFORE':match.boxes+bx,'AFTER':nq,'FROM':L.from,'TO':o.cust,'CUSTOMER':o.cust,'PAYMENT':payStr,'NOTES':'Order #'+o.inv+' | '+L.style+' '+L.colour+' | '+bx+'bx from '+L.from+(parseFloat(o.vat)>0?' | +VAT':'')+(o.notes?' | '+o.notes:'')+(o.custPhone?' | Ph:'+o.custPhone:'')+(nq<=0?' | DEPLETED':''),'SHOP TOTAL':shopT})
      } else if(o.type==='IN'){
        const match=inv.find((r: any)=>r.style_code.toLowerCase()===L.style.toLowerCase()&&r.colour.toLowerCase()===L.colour.toLowerCase()&&r.location_id===L.from)
        if(match){const nq=match.boxes+bx;await supabase.from('inventory').update({boxes:nq}).eq('id',match.id);match.boxes=nq;shopT+=bx;await supabase.from('stock log imported').insert({'DATE':now,'ORDER#':o.inv,'TYPE':'IN','STYLE':L.style,'COLOUR':L.colour,'QTY':bx,'BEFORE':match.boxes-bx,'AFTER':nq,'TO':L.from,'PAYMENT':'N/A','NOTES':'IN #'+o.inv+' | '+L.style+' '+L.colour+' | '+bx+'bx to '+L.from,'SHOP TOTAL':shopT})}
        else{await supabase.from('inventory').insert({location_id:L.from,style_code:L.style.toLowerCase(),colour:L.colour,boxes:bx});shopT+=bx;await supabase.from('stock log imported').insert({'DATE':now,'ORDER#':o.inv,'TYPE':'IN','STYLE':L.style,'COLOUR':L.colour,'QTY':bx,'BEFORE':0,'AFTER':bx,'TO':L.from,'PAYMENT':'N/A','NOTES':'IN #'+o.inv+' | '+L.style+' '+L.colour+' | '+bx+'bx to '+L.from+' (NEW)','SHOP TOTAL':shopT})}
      }
    }
    // Auto-add note to customer
    if(o.cust&&valid.length>0&&!errors.length){
      const noteText='Order #'+o.inv+' | '+valid.length+' lines, '+valid.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0),0)+'bx | '+payStr+(o.notes?' | '+o.notes:'')
      await supabase.from('customer_notes').insert({customer_name:o.cust,note:noteText})
    }
    if(errors.length){updOrder(idx,{busy:false,msg:'Errors: '+errors.join('; ')})}
    else{const tb=valid.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0),0);updOrder(idx,{busy:false,msg:'Done #'+o.inv+' | '+valid.length+'L, '+tb+'bx'+(o.cust?' | '+o.cust:''),lines:[{style:'',colour:'',from:'',boxes:'',price:''}],opts:{},open:false});load()}
  }

  async function searchStyle(q: string){setStyleQ(q);setStyleImg(null);if(q.length<2){setStyleR([]);return};const {data}=await supabase.rpc('search_inventory',{p_style:q});setStyleR(data||[]);const {data:cat}=await supabase.rpc('get_catalogue_info',{p_style:q});if(cat&&cat.length>0&&cat[0].image_url)setStyleImg(cat[0].image_url)}
  function searchCust(q: string){setCustQ(q);if(q.length<2){setCustR([]);return};setCustR(allCusts.filter((c: any)=>(c.name||'').toLowerCase().includes(q.toLowerCase())).slice(0,15))}

  async function pickLoc(id: string){setSelectedLoc(id);const{data}=await supabase.rpc('get_location_stock',{p_location:id});setLocDetail(data||[])}
  async function loadLog(){const {data}=await supabase.from('stock_log').select('*').order('created_at',{ascending:false}).limit(500);setLogs(data||[])}

  // FIXED: Edit log entry using id
  async function saveLogEdit(le: any){
    if(!le.id){setEditingLog(null);return}
    await supabase.from('stock log imported').update({
      'TYPE':le.type,'STYLE':le.style_code,'COLOUR':le.colour,'QTY':le.qty,
      'PAYMENT':le.payment,'NOTES':le.notes,'CUSTOMER':le.customer
    }).eq('id',le.id)
    setEditingLog(null);loadLog();load()
  }

  // FIXED: Cancel log entry — restores stock properly
  async function cancelLogEntry(le: any){
    if(!le.id)return
    if(!confirm('Cancel order line #'+le.order_num+' ('+le.style_code+' '+le.colour+')?\n\nThis will restore '+Math.abs(le.qty||0)+' boxes to '+le.from_loc))return
    const absQty=Math.abs(le.qty||0)
    // Restore stock to inventory
    if(absQty>0&&(le.type==='OUT'||le.type==='TBC')&&le.from_loc&&le.style_code){
      const {data:match}=await supabase.from('inventory').select('*').eq('location_id',le.from_loc).ilike('style_code',le.style_code).ilike('colour',le.colour||'').limit(1)
      if(match&&match.length>0){
        const newQty=match[0].boxes+absQty
        await supabase.from('inventory').update({boxes:newQty}).eq('id',match[0].id)
      }
    }
    // Mark as cancelled with timestamp
    const stamp=new Date().toLocaleString('en-GB')
    await supabase.from('stock log imported').update({
      'TYPE':'CANCELLED',
      'NOTES':(le.notes||'')+' | CANCELLED '+stamp+' | Was: '+le.type+' | Restored: '+absQty+'bx to '+(le.from_loc||'N/A')
    }).eq('id',le.id)
    setEditingLog(null);setExpandedLog(null);loadLog();load()
  }

  // Customer Profile
  async function openProfile(name: string){
    const cust=allCusts.find((c: any)=>c.name===name)
    const {data:prof}=await supabase.from('customer_profiles').select('*').eq('name',name).single()
    if(prof){setCustProfile(prof);setEditingProfile({...prof})}
    else{const np={name,company:cust?.company||'',address:cust?.address||'',phone:cust?.phone||'',description:cust?.notes||''};setCustProfile(np);setEditingProfile({...np})}
    const {data:notes}=await supabase.from('customer_notes').select('*').eq('customer_name',name).order('created_at',{ascending:false});setCustNotes(notes||[])
    const {data:fu}=await supabase.from('customer_followups').select('*').eq('customer_name',name).order('due_date',{ascending:true});setCustFollowups(fu||[])
    const {data:ord}=await supabase.from('stock_log').select('*').ilike('customer','%'+name+'%').order('created_at',{ascending:false}).limit(100);setCustOrders(ord||[])
    setCustProfileTab('overview');setTab('customer-profile')
  }

  async function saveProfile(){
    if(!editingProfile)return
    if(editingProfile.id){await supabase.from('customer_profiles').update({name:editingProfile.name,company:editingProfile.company,address:editingProfile.address,phone:editingProfile.phone,description:editingProfile.description,updated_at:new Date().toISOString()}).eq('id',editingProfile.id)}
    else{await supabase.from('customer_profiles').insert({name:editingProfile.name,company:editingProfile.company,address:editingProfile.address,phone:editingProfile.phone,description:editingProfile.description})}
    setCustProfile(editingProfile)
  }
  async function addNote(){if(!newNote.trim()||!custProfile)return;await supabase.from('customer_notes').insert({customer_name:custProfile.name,note:newNote});setNewNote('');const {data}=await supabase.from('customer_notes').select('*').eq('customer_name',custProfile.name).order('created_at',{ascending:false});setCustNotes(data||[])}
  async function addFollowup(){if(!newFollowup.title||!custProfile)return;await supabase.from('customer_followups').insert({customer_name:custProfile.name,...newFollowup});setNewFollowup({title:'',details:'',due_date:'',priority:'Normal',category:'Phone Call'});setShowAddFollowup(false);const {data}=await supabase.from('customer_followups').select('*').eq('customer_name',custProfile.name).order('due_date',{ascending:true});setCustFollowups(data||[]);const {data:fu}=await supabase.from('customer_followups').select('*').eq('completed',false).order('due_date',{ascending:true});setAllFollowups(fu||[])}
  async function toggleFollowup(id: number,completed: boolean){await supabase.from('customer_followups').update({completed:!completed,completed_at:!completed?new Date().toISOString():null}).eq('id',id);const {data}=await supabase.from('customer_followups').select('*').eq('customer_name',custProfile.name).order('due_date',{ascending:true});setCustFollowups(data||[]);const {data:fu}=await supabase.from('customer_followups').select('*').eq('completed',false).order('due_date',{ascending:true});setAllFollowups(fu||[])}
  async function deleteFollowup(id: number){await supabase.from('customer_followups').delete().eq('id',id);const {data}=await supabase.from('customer_followups').select('*').eq('customer_name',custProfile.name).order('due_date',{ascending:true});setCustFollowups(data||[])}
  async function deleteNote(id: number){await supabase.from('customer_notes').delete().eq('id',id);const {data}=await supabase.from('customer_notes').select('*').eq('customer_name',custProfile.name).order('created_at',{ascending:false});setCustNotes(data||[])}

  async function loadMaster(){const {data}=await supabase.from('inventory').select('*').order('location_id');setMasterInv(data||[])}
  async function saveMasterEdit(item: any){await supabase.from('inventory').update({location_id:item.location_id,style_code:item.style_code,colour:item.colour,boxes:parseInt(item.boxes)||0}).eq('id',item.id);await supabase.from('audit_log').insert({action:'EDIT',table_name:'inventory',record_id:String(item.id),old_data:masterInv.find((r: any)=>r.id===item.id),new_data:item,user_email:user?.email});setMasterEdit(null);loadMaster();load()}
  async function addMasterItem(){if(!newItem.location_id||!newItem.style_code)return;const {data}=await supabase.from('inventory').insert({location_id:newItem.location_id,style_code:newItem.style_code.toLowerCase(),colour:newItem.colour,boxes:parseInt(newItem.boxes)||0}).select();if(data)await supabase.from('audit_log').insert({action:'ADD',table_name:'inventory',record_id:String(data[0]?.id),new_data:data[0],user_email:user?.email});setNewItem({location_id:'',style_code:'',colour:'',boxes:''});setMasterAdd(false);loadMaster();load()}
  async function deleteMasterItem(item: any){if(!confirm('Delete '+item.style_code+'?'))return;await supabase.from('inventory').delete().eq('id',item.id);await supabase.from('audit_log').insert({action:'DELETE',table_name:'inventory',record_id:String(item.id),old_data:item,user_email:user?.email});loadMaster();load()}
  async function loadAudit(){const {data}=await supabase.from('audit_log').select('*').order('created_at',{ascending:false}).limit(200);setAuditLogs(data||[])}

  function sw(t: string){setTab(t);if(t==='log')loadLog();if(t==='master'){loadMaster();loadAudit()}}

  // Group logs by order number for expandable view
  function getOrderGroups(){
    const groups: any={};logs.forEach((l: any)=>{const k=l.order_num||'?';if(!groups[k])groups[k]={lines:[],customer:'',type:'',payment:'',date:''};groups[k].lines.push(l);if(!groups[k].customer)groups[k].customer=l.customer;if(!groups[k].type)groups[k].type=l.type;if(!groups[k].payment)groups[k].payment=l.payment;if(!groups[k].date)groups[k].date=l.created_at})
    return groups
  }

  const filteredMaster=masterInv.filter((r: any)=>{const q=masterFilter.toLowerCase();return(!masterLoc||r.location_id===masterLoc)&&(!q||r.style_code?.toLowerCase().includes(q)||r.colour?.toLowerCase().includes(q)||r.location_id?.toLowerCase().includes(q))})
  const allLocs=[...new Set(masterInv.map((r: any)=>r.location_id))].sort()
  const filteredLogs=logFilter?logs.filter((l: any)=>(l.order_num||'').includes(logFilter)||(l.customer||'').toLowerCase().includes(logFilter.toLowerCase())||(l.style_code||'').toLowerCase().includes(logFilter.toLowerCase())):logs
  const filteredCusts=custSearch?allCusts.filter((c: any)=>(c.name||'').toLowerCase().includes(custSearch.toLowerCase())||(c.phone||'').includes(custSearch)):allCusts

  function logRowBg(t: string){return({OUT:'#e3f2fd',IN:'#e8f5e9',TBC:'#fff3e0',CANCELLED:'#ffebee',MOVE_S2W:'#f3e5f5',MOVE_W2S:'#ede7f6'} as any)[t]||'white'}
  function typeBg(t: string){return({OUT:'#1565c0',IN:'#2e7d32',TBC:'#e65100',CANCELLED:'#c62828',MOVE_S2W:'#6a1b9a',MOVE_W2S:'#4527a0'} as any)[t]||'#546e7a'}
  function payBg(p: string){const s=p||'';return s.includes('Unpaid')?'#ff1744':s.includes('Partial')?'#ff6d00':s.includes('TBC')?'#ff9100':s.includes('Mixed')?'#5c6bc0':'#43a047'}
  function sBg(n: number){return n>20?'#c8e6c9':n>10?'#dcedc8':n>4?'#fff9c4':n>0?'#ffcdd2':'#f5f5f5'}
  function sFg(n: number){return n>20?'#1b5e20':n>10?'#33691e':n>4?'#f57f17':n>0?'#b71c1c':'#bbb'}
  function fmtDate(d: string){if(!d)return'';return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function fmtDateTime(d: string){if(!d)return'';const dt=new Date(d);return dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+' '+dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
  function isDue(d: string){if(!d)return false;return new Date(d)<=new Date()}

  const tabs=[{id:'orders',l:'Orders'},{id:'map',l:'Map'},{id:'log',l:'Stock Log'},{id:'master',l:'Master Inventory'},{id:'customers',l:'Customers'}]
  const I: CSSProperties={width:'100%',padding:'8px 10px',border:'1px solid #ddd',borderRadius:6,fontSize:13,color:'#111',background:'#fff',outline:'none',boxSizing:'border-box'}
  const L: CSSProperties={display:'block',fontSize:10,fontWeight:600,color:'#888',marginBottom:3,textTransform:'uppercase',letterSpacing:0.5}

  if(checking)return <div style={{minHeight:'100vh',background:'#111',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'white'}}>Loading...</div></div>
  if(!user)return <LoginScreen onLogin={()=>{supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user||null);if(session?.user)load()})}}/>

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',color:'#111',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      <div style={{background:'#111',color:'white',padding:'0 24px',display:'flex',alignItems:'center',height:48,position:'sticky',top:0,zIndex:100}}>
        <span style={{fontSize:14,fontWeight:300,letterSpacing:2,textTransform:'uppercase',marginRight:32,cursor:'pointer'}} onClick={()=>setTab('orders')}>Leading Fashions</span>
        <div style={{display:'flex',gap:1}}>{tabs.map(t=>(<button key={t.id} onClick={()=>sw(t.id)} style={{background:tab===t.id?'#e2725b':'transparent',color:'white',border:'none',padding:'7px 14px',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:tab===t.id?600:400}}>{t.l}</button>))}</div>
        <div style={{marginLeft:'auto',display:'flex',gap:16,fontSize:11,alignItems:'center',color:'rgba(255,255,255,0.5)'}}>
          <span>Shop <b style={{color:'white'}}>{stats.shop}</b></span><span>WH <b style={{color:'white'}}>{stats.wh}</b></span><span>Out <b style={{color:'#e2725b'}}>{stats.todayOut}</b></span>
          {allFollowups.filter((f: any)=>isDue(f.due_date)).length>0&&<span style={{background:'#ff1744',color:'white',padding:'2px 8px',borderRadius:10,fontWeight:700,fontSize:10}}>{allFollowups.filter((f: any)=>isDue(f.due_date)).length} overdue</span>}
          <button onClick={logout} style={{background:'transparent',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.15)',padding:'3px 10px',borderRadius:4,cursor:'pointer',fontSize:10}}>Logout</button>
        </div>
      </div>

      <div style={{padding:20}}>

      {/* ═══ ORDERS ═══ */}
      {tab==='orders'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20,alignItems:'start'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <h2 style={{fontSize:18,fontWeight:600,margin:0}}>Order Entry</h2>
              <button onClick={addNewOrder} style={{background:'#111',color:'white',border:'none',padding:'7px 18px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:12}}>+ New Order</button>
            </div>
            {orders.map((o,oi)=>(
              <div key={oi} style={{background:'white',borderRadius:8,padding:18,marginBottom:12,border:o.msg&&!o.msg.startsWith('Error')?'2px solid #2e7d32':'1px solid #e0e0e0'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>toggleOrder(oi)}>
                  <span style={{fontSize:16,fontWeight:700}}>#{o.inv}</span>
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,fontWeight:600,background:typeBg(o.type),color:'white'}}>{o.type}</span>
                  {o.cust&&<span style={{fontSize:13,fontWeight:600,color:'#333'}}>{o.cust}</span>}
                  {o.lines.filter((l: Line)=>l.style).length>0&&<span style={{fontSize:11,color:'#999'}}>{o.lines.filter((l: Line)=>l.style).length}L / {o.lines.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0),0)}bx</span>}
                  <span style={{marginLeft:'auto',fontSize:11,color:'#ccc'}}>{o.open?'−':'+'}</span>
                  {orders.length>1&&<button onClick={(e: any)=>{e.stopPropagation();removeOrder(oi)}} style={{background:'none',border:'none',color:'#c62828',cursor:'pointer',fontSize:14}}>×</button>}
                </div>
                {o.msg&&<div style={{marginTop:8,padding:8,borderRadius:6,background:o.msg.startsWith('Error')?'#ffebee':'#e8f5e9',color:o.msg.startsWith('Error')?'#c62828':'#2e7d32',fontSize:12}}>{o.msg}</div>}
                {o.open&&(
                  <div style={{marginTop:14}}>
                    <div style={{display:'grid',gridTemplateColumns:'70px 70px 1fr 85px 70px',gap:8,marginBottom:10}}>
                      <div><label style={L}>Inv #</label><input style={{...I,fontWeight:700,fontSize:15,textAlign:'center'}} value={o.inv} onChange={(e: any)=>updOrder(oi,{inv:e.target.value})}/></div>
                      <div><label style={L}>Type</label><select style={I} value={o.type} onChange={(e: any)=>updOrder(oi,{type:e.target.value})}>{['OUT','IN','TBC'].map(t=><option key={t}>{t}</option>)}</select></div>
                      <div style={{position:'relative'}}><label style={L}>Customer</label><input style={{...I,fontSize:14}} value={o.cust} onChange={(e: any)=>updOrder(oi,{cust:e.target.value})} placeholder="Customer name..."/>
                        {o.cust.length>=2&&custSuggestions(o.cust).length>0&&(<div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #ddd',borderRadius:6,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:50,maxHeight:160,overflowY:'auto'}}>{custSuggestions(o.cust).map((c: any,ci: number)=>(<div key={ci} onClick={()=>selectCustForOrder(oi,c)} style={{padding:'6px 10px',cursor:'pointer',borderBottom:'1px solid #f5f5f5',fontSize:12}}><div style={{fontWeight:600}}>{c.name}</div><div style={{fontSize:10,color:'#888'}}>{c.phone||''}</div></div>))}</div>)}
                      </div>
                      <div><label style={L}>Payment</label><select style={I} value={o.pay} onChange={(e: any)=>updOrder(oi,{pay:e.target.value})}>{['Paid','Unpaid','Partial','TBC','Mixed'].map(p=><option key={p}>{p}</option>)}</select></div>
                      <div><label style={L}>VAT</label><select style={I} value={o.vat} onChange={(e: any)=>updOrder(oi,{vat:e.target.value})}><option value="0">0%</option><option value="20">20%</option></select></div>
                    </div>
                    {/* Payment method row */}
                    {o.pay!=='Mixed'?(
                      <div style={{display:'grid',gridTemplateColumns:'150px 1fr 1fr',gap:8,marginBottom:10}}>
                        <div><label style={L}>Method</label><select style={I} value={o.mthd} onChange={(e: any)=>updOrder(oi,{mthd:e.target.value})}>{['Cash','Card','Bank','N/A'].map(m=><option key={m}>{m}</option>)}</select></div>
                        <div><label style={L}>Phone</label><input style={I} value={o.custPhone} onChange={(e: any)=>updOrder(oi,{custPhone:e.target.value})} placeholder="Phone..."/></div>
                        <div><label style={L}>Order Notes</label><input style={I} value={o.notes} onChange={(e: any)=>updOrder(oi,{notes:e.target.value})} placeholder="Order notes..."/></div>
                      </div>
                    ):(
                      <div style={{background:'#f5f5f5',borderRadius:6,padding:12,marginBottom:10}}>
                        <label style={{...L,marginBottom:8}}>Split Payment</label>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:8}}>
                          <div><label style={{fontSize:9,color:'#888'}}>Cash £</label><input type="number" style={I} value={o.cashAmt} onChange={(e: any)=>updOrder(oi,{cashAmt:e.target.value})} placeholder="0.00"/></div>
                          <div><label style={{fontSize:9,color:'#888'}}>Card £</label><input type="number" style={I} value={o.cardAmt} onChange={(e: any)=>updOrder(oi,{cardAmt:e.target.value})} placeholder="0.00"/></div>
                          <div><label style={{fontSize:9,color:'#888'}}>Bank £</label><input type="number" style={I} value={o.bankAmt} onChange={(e: any)=>updOrder(oi,{bankAmt:e.target.value})} placeholder="0.00"/></div>
                          <div><label style={{fontSize:9,color:'#888'}}>Phone</label><input style={I} value={o.custPhone} onChange={(e: any)=>updOrder(oi,{custPhone:e.target.value})} placeholder="Phone"/></div>
                          <div><label style={{fontSize:9,color:'#888'}}>Notes</label><input style={I} value={o.notes} onChange={(e: any)=>updOrder(oi,{notes:e.target.value})} placeholder="Notes"/></div>
                        </div>
                        <div style={{marginTop:6,fontSize:11,color:'#555'}}>Total split: £{((parseFloat(o.cashAmt)||0)+(parseFloat(o.cardAmt)||0)+(parseFloat(o.bankAmt)||0)).toFixed(2)}</div>
                      </div>
                    )}
                    {/* Lines table */}
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{textAlign:'left',borderBottom:'2px solid #eee'}}>
                      <th style={{padding:'6px 4px',color:'#999',fontWeight:600,width:24}}>#</th><th style={{padding:'6px 4px',color:'#999',fontWeight:600}}>Style</th><th style={{padding:'6px 4px',color:'#999',fontWeight:600}}>Colour</th><th style={{padding:'6px 4px',color:'#999',fontWeight:600,width:55}}>Loc</th><th style={{padding:'6px 4px',color:'#999',fontWeight:600,width:50}}>Boxes</th><th style={{padding:'6px 4px',color:'#999',fontWeight:600,width:55}}>£/pr</th><th style={{padding:'6px 4px',width:24}}></th>
                    </tr></thead><tbody>
                      {o.lines.map((Li: Line,li: number)=>(<tr key={li} style={{borderBottom:'1px solid #f5f5f5'}}>
                        <td style={{padding:4,color:'#ccc',fontSize:11}}>{li+1}</td>
                        <td style={{padding:4}}><input style={{...I,fontWeight:600}} value={Li.style} onChange={(e: any)=>updLine(oi,li,'style',e.target.value)} onBlur={(e: any)=>styleBlur(oi,li,e.target.value)} placeholder="style code"/></td>
                        <td style={{padding:4}}>{o.opts[li]?.colours?.length>0?<select style={I} value={Li.colour} onChange={(e: any)=>updLine(oi,li,'colour',e.target.value)}><option value="">Pick...</option>{o.opts[li].colours.map((c: string)=><option key={c}>{c}</option>)}</select>:<input style={I} value={Li.colour} onChange={(e: any)=>updLine(oi,li,'colour',e.target.value)} placeholder="colour"/>}</td>
                        <td style={{padding:4}}>{o.opts[li]?.shop_locations?.length>0?<select style={{...I,fontSize:11}} value={Li.from} onChange={(e: any)=>updLine(oi,li,'from',e.target.value)}><option value="">-</option>{o.opts[li].shop_locations.map((l: string)=><option key={l}>{l}</option>)}</select>:<input style={{...I,fontSize:11}} value={Li.from} onChange={(e: any)=>updLine(oi,li,'from',e.target.value)} placeholder="loc"/>}</td>
                        <td style={{padding:4}}><input type="number" style={{...I,textAlign:'center',fontWeight:700,fontSize:14}} value={Li.boxes} onChange={(e: any)=>updLine(oi,li,'boxes',e.target.value)}/></td>
                        <td style={{padding:4}}><input type="number" step="0.5" style={I} value={Li.price} onChange={(e: any)=>updLine(oi,li,'price',e.target.value)} placeholder="0.00"/></td>
                        <td style={{padding:4}}><button onClick={()=>rmLine(oi,li)} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:14}}>×</button></td>
                      </tr>))}
                    </tbody></table>
                    {o.lines.some((l: Line)=>l.price&&l.boxes)&&<div style={{marginTop:8,padding:'8px 12px',background:'#fafafa',borderRadius:6,fontSize:12,color:'#555',display:'flex',gap:20}}>
                      <span>Subtotal: £{o.lines.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0)*12*(parseFloat(l.price)||0),0).toFixed(2)}</span>
                      {parseFloat(o.vat)>0&&<span>VAT: £{(o.lines.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0)*12*(parseFloat(l.price)||0),0)*parseFloat(o.vat)/100).toFixed(2)}</span>}
                      <span style={{fontWeight:700,color:'#111'}}>Total: £{(o.lines.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0)*12*(parseFloat(l.price)||0),0)*(1+parseFloat(o.vat)/100)).toFixed(2)}</span>
                    </div>}
                    <div style={{display:'flex',gap:8,marginTop:12,alignItems:'center'}}>
                      <button onClick={()=>addLine(oi)} style={{color:'white',background:'#333',border:'none',padding:'7px 14px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:11}}>+ Line</button>
                      <button onClick={()=>submitOrder(oi)} disabled={o.busy} style={{color:'white',background:o.busy?'#999':'#e2725b',border:'none',padding:'9px 24px',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:700}}>{o.busy?'Processing...':'Submit Order'}</button>
                      <div style={{marginLeft:'auto',fontSize:12,color:'#888'}}>{o.lines.filter((l: Line)=>l.style).length} lines | {o.lines.reduce((s: number,l: Line)=>s+(parseInt(l.boxes)||0),0)} boxes</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* SIDEBAR */}
          <div>
            <div style={{background:'#111',borderRadius:8,padding:14,marginBottom:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                <div style={{background:'#222',borderRadius:6,padding:8,textAlign:'center'}}><div style={{fontSize:18,fontWeight:700,color:'white'}}>{stats.shop}</div><div style={{fontSize:9,color:'#666'}}>Shop</div></div>
                <div style={{background:'#222',borderRadius:6,padding:8,textAlign:'center'}}><div style={{fontSize:18,fontWeight:700,color:'white'}}>{stats.wh}</div><div style={{fontSize:9,color:'#666'}}>Warehouse</div></div>
                <div style={{background:'#222',borderRadius:6,padding:8,textAlign:'center'}}><div style={{fontSize:18,fontWeight:700,color:'#e2725b'}}>{stats.todayOut}</div><div style={{fontSize:9,color:'#666'}}>Out Today</div></div>
              </div>
            </div>
            <div style={{background:'white',borderRadius:8,padding:14,marginBottom:12,border:'1px solid #e0e0e0'}}>
              <h3 style={{fontSize:11,fontWeight:600,margin:'0 0 8px',color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Style Search</h3>
              <input style={{...I,fontSize:13}} value={styleQ} onChange={(e: any)=>searchStyle(e.target.value)} placeholder="Type style code..."/>
              {styleImg&&<div style={{marginTop:8,textAlign:'center',background:'#fafafa',borderRadius:6,padding:8}}><img src={styleImg} alt="" style={{maxWidth:'100%',maxHeight:130,borderRadius:6,objectFit:'contain'}}/></div>}
              {styleQ.length>=2&&<div style={{marginTop:8,maxHeight:180,overflowY:'auto'}}>
                {styleR.length>0&&<div style={{fontSize:11,color:'#555',marginBottom:4}}>Shop: <b style={{color:'#1565c0'}}>{styleR.filter((r: any)=>r.zone==='shop').reduce((s: number,r: any)=>s+r.boxes,0)}</b> | WH: <b style={{color:'#6a1b9a'}}>{styleR.filter((r: any)=>r.zone==='warehouse').reduce((s: number,r: any)=>s+r.boxes,0)}</b></div>}
                {styleR.map((r: any,i: number)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 4px',fontSize:11,background:i%2===0?'#fafafa':'white'}}><div><b>{r.style_code}</b> <span style={{color:'#888'}}>{r.colour}</span> <span style={{fontSize:9,color:'#bbb'}}>@{r.location_id}</span></div><span style={{fontWeight:700,padding:'1px 6px',borderRadius:4,background:sBg(r.boxes),color:sFg(r.boxes)}}>{r.boxes}</span></div>))}
              </div>}
            </div>
            <div style={{background:'white',borderRadius:8,padding:14,marginBottom:12,border:'1px solid #e0e0e0'}}>
              <h3 style={{fontSize:11,fontWeight:600,margin:'0 0 8px',color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Customer Lookup</h3>
              <input style={{...I,fontSize:13}} value={custQ} onChange={(e: any)=>searchCust(e.target.value)} placeholder="Search customer..."/>
              {custQ.length>=2&&<div style={{marginTop:8,maxHeight:160,overflowY:'auto'}}>
                {custR.map((c: any,i: number)=>(<div key={i} onClick={()=>openProfile(c.name)} style={{padding:'5px 0',borderBottom:'1px solid #f0f0f0',fontSize:12,cursor:'pointer'}}><div style={{fontWeight:600}}>{c.name}</div><div style={{color:'#888',fontSize:10}}>{c.phone||''}</div></div>))}
              </div>}
            </div>
            <div style={{background:'white',borderRadius:8,padding:14,border:'1px solid #e0e0e0'}}>
              <h3 style={{fontSize:11,fontWeight:600,margin:'0 0 8px',color:'#888',textTransform:'uppercase',letterSpacing:0.5}}>Follow-ups {allFollowups.length>0&&<span style={{color:'#e2725b'}}>({allFollowups.length})</span>}</h3>
              <div style={{maxHeight:200,overflowY:'auto'}}>
                {allFollowups.slice(0,10).map((f: any,i: number)=>(<div key={i} style={{padding:'5px 0',borderBottom:'1px solid #f5f5f5',fontSize:11}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:600,cursor:'pointer',color:'#1565c0'}} onClick={()=>openProfile(f.customer_name)}>{f.customer_name}</span><span style={{fontSize:10,color:isDue(f.due_date)?'#c62828':'#888',fontWeight:isDue(f.due_date)?700:400}}>{fmtDate(f.due_date)}</span></div>
                  <div style={{color:'#555'}}>{f.title}</div>
                </div>))}
                {allFollowups.length===0&&<p style={{color:'#ccc',fontSize:11,textAlign:'center'}}>No follow-ups</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAP ═══ */}
      {tab==='map'&&(
        <div>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:14}}>Shop Map</h2>
          <div style={{display:'flex',gap:20}}>
            <div style={{background:'white',borderRadius:8,padding:14,border:'1px solid #e0e0e0'}}>
              {[19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0].map((row,idx)=>{const rr=[20,21,22,23,24,25,26,27];return(<div key={row} style={{display:'flex',gap:2,marginBottom:2,alignItems:'center'}}><MC l={row+'L'} m={stockMap} s={selectedLoc} o={pickLoc}/><MC l={String(row)} m={stockMap} s={selectedLoc} o={pickLoc}/><MC l={row+'R'} m={stockMap} s={selectedLoc} o={pickLoc}/><div style={{width:22,textAlign:'center',fontWeight:700,color:'#555',fontSize:9}}>{row}</div><div style={{width:3,height:30,background:'#333',borderRadius:1}}></div>{idx<rr.length?(<><div style={{width:22,textAlign:'center',fontWeight:700,color:'#555',fontSize:9}}>{rr[idx]}</div><MC l={rr[idx]+'L'} m={stockMap} s={selectedLoc} o={pickLoc}/><MC l={String(rr[idx])} m={stockMap} s={selectedLoc} o={pickLoc}/><MC l={rr[idx]+'R'} m={stockMap} s={selectedLoc} o={pickLoc}/></>):<div style={{width:150}}></div>}</div>)})}
              <div style={{marginTop:8,textAlign:'center',padding:6,background:'#eee',borderRadius:4,fontWeight:600,color:'#777',fontSize:10}}>ENTRANCE</div>
            </div>
            <div style={{flex:1,minWidth:260}}>
              {selectedLoc?(<div style={{background:'white',borderRadius:8,padding:18,border:'1px solid #e0e0e0'}}><h3 style={{fontSize:16,fontWeight:700,margin:'0 0 4px'}}>{selectedLoc}</h3><p style={{color:'#888',fontSize:11,margin:'0 0 12px'}}>{locDetail.length} items | {locDetail.reduce((s: number,d: any)=>s+d.boxes,0)} boxes</p>{locDetail.map((d: any,i: number)=>(<div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 10px',borderRadius:6,marginBottom:2,background:'#fafafa'}}><div><div style={{fontWeight:600,fontSize:12}}>{d.style_code}</div><div style={{color:'#999',fontSize:10}}>{d.colour}</div></div><div style={{display:'flex',alignItems:'center',gap:6}}>{d.warehouse_stock>0&&<span style={{fontSize:8,background:'#f3e5f5',color:'#6a1b9a',padding:'2px 5px',borderRadius:4,fontWeight:600}}>WH {d.warehouse_stock}</span>}<span style={{fontSize:14,fontWeight:700,padding:'2px 10px',borderRadius:4,background:sBg(d.boxes),color:sFg(d.boxes)}}>{d.boxes}</span></div></div>))}</div>):(<div style={{background:'white',borderRadius:8,padding:30,textAlign:'center',border:'1px solid #e0e0e0',color:'#ccc'}}>Select a location</div>)}
              <div style={{background:'white',borderRadius:8,padding:14,marginTop:12,border:'1px solid #e0e0e0'}}><h3 style={{fontSize:11,fontWeight:600,color:'#6a1b9a',margin:'0 0 8px',textTransform:'uppercase'}}>Warehouse</h3><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{['WG1L','WG1M','WG1R','WG2L','WG2M','WG2R','WB1','WUK','W'].map(w=>(<button key={w} onClick={()=>pickLoc(w)} style={{padding:'4px 8px',borderRadius:4,border:selectedLoc===w?'2px solid #6a1b9a':'1px solid #ddd',background:(stockMap[w]?.total_boxes||0)>0?'#f3e5f5':'#fafafa',color:(stockMap[w]?.total_boxes||0)>0?'#6a1b9a':'#bbb',fontWeight:600,fontSize:10,cursor:'pointer'}}>{w} {stockMap[w]?.total_boxes||0}</button>))}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STOCK LOG — Expandable + Working Edit/Cancel ═══ */}
      {tab==='log'&&(
        <div>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:10}}>Stock Log</h2>
          <input style={{...I,width:320,marginBottom:12}} value={logFilter} onChange={(e: any)=>setLogFilter(e.target.value)} placeholder="Filter by order #, customer, or style..."/>
          <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0',overflow:'hidden'}}>
            <div style={{overflowX:'auto',maxHeight:'76vh',overflowY:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead style={{position:'sticky',top:0,zIndex:10}}><tr style={{background:'#222',color:'white'}}>{['Date','Order#','Type','Style','Colour','£/pr','Qty','From','Customer','Payment','Notes','Actions'].map(h=>(<th key={h} style={{padding:'7px 5px',fontWeight:600,textAlign:'left',fontSize:10}}>{h}</th>))}</tr></thead>
                <tbody>{filteredLogs.map((l: any,i: number)=>{
                  const isExp=expandedLog===i
                  const isEdit=editingLog&&editingLog._idx===i
                  if(isEdit){const e=editingLog;return(
                    <tr key={i} style={{background:'#fffde7',borderBottom:'2px solid #fbc02d'}}>
                      <td style={{padding:5,fontSize:9}}>{fmtDateTime(l.created_at)}</td>
                      <td style={{padding:5,fontWeight:700}}>{l.order_num}</td>
                      <td style={{padding:5}}><select style={{...I,width:75,fontSize:10,padding:2}} value={e.type||''} onChange={(ev: any)=>setEditingLog({...e,type:ev.target.value})}>{['OUT','IN','TBC','CANCELLED','MOVE_S2W','MOVE_W2S'].map(t=><option key={t}>{t}</option>)}</select></td>
                      <td style={{padding:5}}><input style={{...I,width:65,fontSize:10,padding:2}} value={e.style_code||''} onChange={(ev: any)=>setEditingLog({...e,style_code:ev.target.value})}/></td>
                      <td style={{padding:5}}><input style={{...I,width:65,fontSize:10,padding:2}} value={e.colour||''} onChange={(ev: any)=>setEditingLog({...e,colour:ev.target.value})}/></td>
                      <td style={{padding:5}}>{l.price_pair}</td>
                      <td style={{padding:5}}><input type="number" style={{...I,width:40,fontSize:10,padding:2}} value={e.qty||''} onChange={(ev: any)=>setEditingLog({...e,qty:parseInt(ev.target.value)||0})}/></td>
                      <td style={{padding:5}}>{l.from_loc}</td>
                      <td style={{padding:5}}><input style={{...I,width:75,fontSize:10,padding:2}} value={e.customer||''} onChange={(ev: any)=>setEditingLog({...e,customer:ev.target.value})}/></td>
                      <td style={{padding:5}}><select style={{...I,width:100,fontSize:10,padding:2}} value={e.payment||''} onChange={(ev: any)=>setEditingLog({...e,payment:ev.target.value})}>{['Paid','Paid (Cash)','Paid (Card)','Paid (Bank)','Unpaid','Unpaid (Cash)','Unpaid (Card)','Partial','Partial (Cash)','Mixed','TBC','N/A'].map(p=><option key={p}>{p}</option>)}</select></td>
                      <td style={{padding:5}}><input style={{...I,width:150,fontSize:10,padding:2}} value={e.notes||''} onChange={(ev: any)=>setEditingLog({...e,notes:ev.target.value})}/></td>
                      <td style={{padding:5,whiteSpace:'nowrap'}}><button onClick={()=>saveLogEdit(editingLog)} style={{background:'#2e7d32',color:'white',border:'none',padding:'3px 8px',borderRadius:3,cursor:'pointer',fontSize:9,fontWeight:600,marginRight:2}}>Save</button><button onClick={()=>setEditingLog(null)} style={{background:'#777',color:'white',border:'none',padding:'3px 8px',borderRadius:3,cursor:'pointer',fontSize:9}}>X</button></td>
                    </tr>
                  )}
                  return(<>
                    <tr key={i} style={{background:logRowBg(l.type),borderBottom:isExp?'none':'1px solid rgba(0,0,0,0.05)',textDecoration:l.type==='CANCELLED'?'line-through':'none',cursor:'pointer'}} onClick={()=>setExpandedLog(isExp?null:i)}>
                      <td style={{padding:5,fontSize:9,whiteSpace:'nowrap'}}>{fmtDateTime(l.created_at)}</td>
                      <td style={{padding:5,fontWeight:700,color:'#bf360c'}}>{l.order_num}</td>
                      <td style={{padding:5}}><span style={{fontSize:9,padding:'2px 6px',borderRadius:3,fontWeight:700,background:typeBg(l.type),color:'white'}}>{l.type}</span></td>
                      <td style={{padding:5,fontWeight:600}}>{l.style_code}</td>
                      <td style={{padding:5}}>{l.colour}</td>
                      <td style={{padding:5}}>{l.price_pair}</td>
                      <td style={{padding:5,fontWeight:700,color:(l.qty||0)<0?'#c62828':'#2e7d32'}}>{l.qty}</td>
                      <td style={{padding:5}}>{l.from_loc}</td>
                      <td style={{padding:5,fontWeight:600,cursor:'pointer',color:'#1565c0'}} onClick={(e: any)=>{e.stopPropagation();l.customer&&openProfile(l.customer)}}>{l.customer}</td>
                      <td style={{padding:5}}>{l.payment&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:3,fontWeight:700,background:payBg(l.payment),color:'white'}}>{l.payment}</span>}</td>
                      <td style={{padding:5,fontSize:9,color:'#666',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={l.notes||''}>{l.notes}</td>
                      <td style={{padding:5,whiteSpace:'nowrap'}} onClick={(e: any)=>e.stopPropagation()}>
                        <button onClick={()=>setEditingLog({...l,_idx:i})} style={{background:'#1565c0',color:'white',border:'none',padding:'2px 5px',borderRadius:3,cursor:'pointer',fontSize:8,fontWeight:600,marginRight:2}}>Edit</button>
                        {l.type!=='CANCELLED'&&<button onClick={()=>cancelLogEntry(l)} style={{background:'#c62828',color:'white',border:'none',padding:'2px 5px',borderRadius:3,cursor:'pointer',fontSize:8,fontWeight:600}}>Cancel</button>}
                      </td>
                    </tr>
                    {isExp&&<tr key={i+'exp'}><td colSpan={12} style={{padding:0}}><div style={{background:'#fafafa',padding:16,borderBottom:'2px solid #e0e0e0'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:12,fontSize:12,marginBottom:8}}>
                        <div><span style={{color:'#888'}}>Order:</span> <b>#{l.order_num}</b></div>
                        <div><span style={{color:'#888'}}>Customer:</span> <b>{l.customer}</b></div>
                        <div><span style={{color:'#888'}}>Payment:</span> <b>{l.payment}</b></div>
                        <div><span style={{color:'#888'}}>Date:</span> <b>{fmtDateTime(l.created_at)}</b></div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:12,fontSize:12,marginBottom:8}}>
                        <div><span style={{color:'#888'}}>Style:</span> <b>{l.style_code}</b></div>
                        <div><span style={{color:'#888'}}>Colour:</span> <b>{l.colour}</b></div>
                        <div><span style={{color:'#888'}}>Qty:</span> <b>{l.qty}</b></div>
                        <div><span style={{color:'#888'}}>From:</span> <b>{l.from_loc}</b></div>
                        <div><span style={{color:'#888'}}>Price:</span> <b>{l.price_pair}</b></div>
                      </div>
                      <div style={{fontSize:12,marginBottom:8}}><span style={{color:'#888'}}>Before:</span> {l.before_qty} → <span style={{color:'#888'}}>After:</span> {l.after_qty}</div>
                      <div style={{fontSize:12,background:'white',padding:10,borderRadius:6,border:'1px solid #eee'}}><span style={{color:'#888'}}>Notes:</span> {l.notes||'—'}</div>
                      <div style={{marginTop:10,display:'flex',gap:6}}>
                        <button onClick={()=>setEditingLog({...l,_idx:i})} style={{background:'#1565c0',color:'white',border:'none',padding:'6px 14px',borderRadius:4,cursor:'pointer',fontSize:11,fontWeight:600}}>Edit Entry</button>
                        {l.type!=='CANCELLED'&&<button onClick={()=>cancelLogEntry(l)} style={{background:'#c62828',color:'white',border:'none',padding:'6px 14px',borderRadius:4,cursor:'pointer',fontSize:11,fontWeight:600}}>Cancel & Restore Stock</button>}
                      </div>
                    </div></td></tr>}
                  </>)
                })}</tbody>
              </table>
            </div>
            <div style={{padding:'8px 14px',borderTop:'1px solid #eee',fontSize:11,color:'#888'}}>{filteredLogs.length} entries</div>
          </div>
        </div>
      )}

      {/* ═══ MASTER INVENTORY ═══ */}
      {tab==='master'&&(
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><h2 style={{fontSize:18,fontWeight:600,margin:0}}>Master Inventory</h2><div style={{display:'flex',gap:6}}><button onClick={()=>setShowAudit(!showAudit)} style={{background:'white',color:'#555',border:'1px solid #ddd',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600}}>{showAudit?'Hide':'Show'} Change Log</button><button onClick={()=>{setMasterAdd(true);setNewItem({location_id:'',style_code:'',colour:'',boxes:''})}} style={{background:'#111',color:'white',border:'none',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600}}>+ Add Item</button></div></div>
          <div style={{display:'flex',gap:8,marginBottom:12}}><input style={{...I,width:280}} value={masterFilter} onChange={(e: any)=>setMasterFilter(e.target.value)} placeholder="Search style, colour, or location..."/><select style={{...I,width:130}} value={masterLoc} onChange={(e: any)=>setMasterLoc(e.target.value)}><option value="">All Locations</option>{allLocs.map(l=><option key={l} value={l}>{l}</option>)}</select><div style={{marginLeft:'auto',fontSize:12,color:'#777',display:'flex',alignItems:'center',gap:12}}><span>{filteredMaster.length} items</span><span>{filteredMaster.reduce((s: number,r: any)=>s+r.boxes,0)} boxes</span></div></div>
          {masterAdd&&<div style={{background:'#fffde7',borderRadius:8,padding:14,marginBottom:12,border:'2px solid #fbc02d'}}><div style={{display:'flex',gap:8,alignItems:'end'}}><div><label style={L}>Location</label><input style={{...I,width:100}} value={newItem.location_id} onChange={(e: any)=>setNewItem({...newItem,location_id:e.target.value})} placeholder="e.g. 5R"/></div><div><label style={L}>Style</label><input style={{...I,width:140}} value={newItem.style_code} onChange={(e: any)=>setNewItem({...newItem,style_code:e.target.value})}/></div><div><label style={L}>Colour</label><input style={{...I,width:110}} value={newItem.colour} onChange={(e: any)=>setNewItem({...newItem,colour:e.target.value})}/></div><div><label style={L}>Boxes</label><input type="number" style={{...I,width:70}} value={newItem.boxes} onChange={(e: any)=>setNewItem({...newItem,boxes:e.target.value})}/></div><button onClick={addMasterItem} style={{background:'#2e7d32',color:'white',border:'none',padding:'8px 14px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:11}}>Add</button><button onClick={()=>setMasterAdd(false)} style={{background:'#777',color:'white',border:'none',padding:'8px 14px',borderRadius:6,cursor:'pointer',fontSize:11}}>Cancel</button></div></div>}
          <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0',overflow:'hidden'}}><div style={{overflowX:'auto',maxHeight:'62vh',overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead style={{position:'sticky',top:0,zIndex:10}}><tr style={{background:'#222',color:'white'}}>{['Location','Style Code','Colour','Boxes','Actions'].map(h=>(<th key={h} style={{padding:'8px 10px',fontWeight:600,textAlign:'left',fontSize:11}}>{h}</th>))}</tr></thead><tbody>
            {filteredMaster.map((r: any,i: number)=>{const isE=masterEdit&&masterEdit.id===r.id;if(isE){const e=masterEdit;return(<tr key={i} style={{background:'#fffde7'}}><td style={{padding:'5px 10px'}}><input style={{...I,fontSize:12}} value={e.location_id} onChange={(ev: any)=>setMasterEdit({...e,location_id:ev.target.value})}/></td><td style={{padding:'5px 10px'}}><input style={{...I,fontSize:12}} value={e.style_code} onChange={(ev: any)=>setMasterEdit({...e,style_code:ev.target.value})}/></td><td style={{padding:'5px 10px'}}><input style={{...I,fontSize:12}} value={e.colour} onChange={(ev: any)=>setMasterEdit({...e,colour:ev.target.value})}/></td><td style={{padding:'5px 10px'}}><input type="number" style={{...I,fontSize:12,fontWeight:700}} value={e.boxes} onChange={(ev: any)=>setMasterEdit({...e,boxes:ev.target.value})}/></td><td style={{padding:'5px 10px',whiteSpace:'nowrap'}}><button onClick={()=>saveMasterEdit(masterEdit)} style={{background:'#2e7d32',color:'white',border:'none',padding:'3px 8px',borderRadius:4,cursor:'pointer',fontSize:10,fontWeight:600,marginRight:3}}>Save</button><button onClick={()=>setMasterEdit(null)} style={{background:'#777',color:'white',border:'none',padding:'3px 8px',borderRadius:4,cursor:'pointer',fontSize:10}}>Cancel</button></td></tr>)}
              return(<tr key={i} style={{borderBottom:'1px solid #f0f0f0',background:i%2===0?'white':'#fafafa'}}><td style={{padding:'7px 10px',fontWeight:600,color:'#555'}}>{r.location_id}</td><td style={{padding:'7px 10px',fontWeight:700}}>{r.style_code}</td><td style={{padding:'7px 10px',color:'#555'}}>{r.colour}</td><td style={{padding:'7px 10px'}}><span style={{fontWeight:700,fontSize:13,padding:'2px 8px',borderRadius:4,background:sBg(r.boxes),color:sFg(r.boxes)}}>{r.boxes}</span></td><td style={{padding:'7px 10px',whiteSpace:'nowrap'}}><button onClick={()=>setMasterEdit({...r})} style={{background:'#1565c0',color:'white',border:'none',padding:'2px 6px',borderRadius:3,cursor:'pointer',fontSize:9,fontWeight:600,marginRight:3}}>Edit</button><button onClick={()=>deleteMasterItem(r)} style={{background:'#c62828',color:'white',border:'none',padding:'2px 6px',borderRadius:3,cursor:'pointer',fontSize:9,fontWeight:600}}>Delete</button></td></tr>)
            })}</tbody></table></div></div>
          {showAudit&&<div style={{marginTop:16}}><h3 style={{fontSize:14,fontWeight:600,marginBottom:10}}>Change Log</h3><div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0',overflow:'hidden',maxHeight:250,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}><thead><tr style={{background:'#f5f5f5'}}>{['Time','Action','Details','User'].map(h=>(<th key={h} style={{padding:'6px 8px',fontWeight:600,textAlign:'left',color:'#777'}}>{h}</th>))}</tr></thead><tbody>{auditLogs.map((a: any,i: number)=>(<tr key={i} style={{borderBottom:'1px solid #f0f0f0'}}><td style={{padding:'5px 8px',fontSize:10}}>{fmtDateTime(a.created_at)}</td><td style={{padding:'5px 8px'}}><span style={{padding:'1px 6px',borderRadius:3,fontWeight:600,fontSize:9,background:a.action==='ADD'?'#e8f5e9':a.action==='DELETE'?'#ffebee':'#e3f2fd',color:a.action==='ADD'?'#2e7d32':a.action==='DELETE'?'#c62828':'#1565c0'}}>{a.action}</span></td><td style={{padding:'5px 8px',fontSize:10,color:'#555'}}>{a.action==='EDIT'&&a.old_data&&<span>{a.old_data.style_code} @ {a.old_data.location_id}: {a.old_data.boxes}→{a.new_data?.boxes}</span>}{a.action==='ADD'&&a.new_data&&<span>Added {a.new_data.style_code} @ {a.new_data.location_id}</span>}{a.action==='DELETE'&&a.old_data&&<span>Deleted {a.old_data.style_code} @ {a.old_data.location_id}</span>}</td><td style={{padding:'5px 8px',fontSize:10,color:'#aaa'}}>{a.user_email}</td></tr>))}</tbody></table></div></div>}
        </div>
      )}

      {/* ═══ CUSTOMERS ═══ */}
      {tab==='customers'&&(
        <div>
          <h2 style={{fontSize:18,fontWeight:600,marginBottom:14}}>Customers</h2>
          <input style={{...I,width:320,marginBottom:12}} value={custSearch} onChange={(e: any)=>setCustSearch(e.target.value)} placeholder="Search by name or phone..."/>
          <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0',overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{background:'#222',color:'white'}}>{['Name','Phone','Address','Last Order','Notes'].map(h=>(<th key={h} style={{padding:'8px 10px',fontWeight:600,textAlign:'left'}}>{h}</th>))}</tr></thead><tbody>
            {filteredCusts.map((c: any,i: number)=>(<tr key={i} style={{borderBottom:'1px solid #f0f0f0',background:i%2===0?'white':'#fafafa',cursor:'pointer'}} onClick={()=>openProfile(c.name)}><td style={{padding:'8px 10px',fontWeight:600,color:'#1565c0'}}>{c.name}</td><td style={{padding:'8px 10px'}}>{c.phone||'-'}</td><td style={{padding:'8px 10px'}}>{c.address||'-'}</td><td style={{padding:'8px 10px'}}>{c.last_order||'-'}</td><td style={{padding:'8px 10px',fontSize:10,color:'#777',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.notes||''}</td></tr>))}
          </tbody></table></div>
        </div>
      )}

      {/* ═══ CUSTOMER PROFILE ═══ */}
      {tab==='customer-profile'&&custProfile&&(
        <div>
          <button onClick={()=>setTab('customers')} style={{background:'none',border:'none',color:'#1565c0',cursor:'pointer',fontSize:13,fontWeight:600,marginBottom:16}}>← Back to Customers</button>
          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,alignItems:'start'}}>
            <div>
              {/* Header */}
              <div style={{background:'white',borderRadius:8,padding:20,border:'1px solid #e0e0e0',marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                  <div>
                    <h2 style={{fontSize:22,fontWeight:700,margin:'0 0 8px'}}>{custProfile.name}</h2>
                    {editingProfile?.company&&<div style={{fontSize:14,fontWeight:600,color:'#333',marginBottom:4}}>{editingProfile.company}</div>}
                    {editingProfile?.address&&<div style={{fontSize:13,color:'#666',marginBottom:4}}>{editingProfile.address}</div>}
                    {editingProfile?.phone&&<div style={{fontSize:13,color:'#333',marginBottom:4}}>{editingProfile.phone}</div>}
                    {editingProfile?.description&&<div style={{fontSize:13,color:'#888',marginTop:8,fontStyle:'italic'}}>{editingProfile.description}</div>}
                  </div>
                  <button onClick={()=>{const d=prompt('Edit (company|address|phone|description)',[editingProfile?.company||'',editingProfile?.address||'',editingProfile?.phone||'',editingProfile?.description||''].join('|'));if(d){const[company,address,phone,description]=d.split('|');setEditingProfile({...editingProfile,company,address,phone,description});setTimeout(saveProfile,100)}}} style={{background:'white',border:'1px solid #ddd',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:600}}>Edit</button>
                </div>
              </div>
              {/* Tabs */}
              <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:'2px solid #eee'}}>
                {['overview','notes','followups','orders'].map(t=>(<button key={t} onClick={()=>setCustProfileTab(t)} style={{background:'none',border:'none',borderBottom:custProfileTab===t?'2px solid #111':'2px solid transparent',padding:'10px 20px',cursor:'pointer',fontSize:13,fontWeight:custProfileTab===t?700:400,color:custProfileTab===t?'#111':'#888',marginBottom:-2}}>{t==='overview'?'Overview':t==='notes'?'Notes ('+custNotes.length+')':t==='followups'?'Follow-ups ('+custFollowups.length+')':'Orders ('+custOrders.length+')'}</button>))}
              </div>

              {/* Overview: Mixed chronological */}
              {custProfileTab==='overview'&&(
                <div>
                  <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0'}}>
                    {[...custNotes.map((n: any)=>({...n,_type:'note',_date:n.created_at})),...custFollowups.map((f: any)=>({...f,_type:'followup',_date:f.created_at})),...custOrders.map((o: any)=>({...o,_type:'order',_date:o.created_at}))].sort((a: any,b: any)=>new Date(b._date).getTime()-new Date(a._date).getTime()).slice(0,30).map((item: any,i: number)=>(
                      <div key={i} style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0',display:'flex',gap:12}}>
                        <div style={{width:70,fontSize:10,color:'#888',textAlign:'right',paddingTop:2}}>{fmtDateTime(item._date)}</div>
                        <div style={{width:60}}><span style={{fontSize:9,padding:'2px 8px',borderRadius:4,fontWeight:600,background:item._type==='note'?'#e3f2fd':item._type==='followup'?'#fff3e0':'#e8f5e9',color:item._type==='note'?'#1565c0':item._type==='followup'?'#e65100':'#2e7d32'}}>{item._type==='note'?'Note':item._type==='followup'?'Task':'Order'}</span></div>
                        <div style={{flex:1,fontSize:13}}>
                          {item._type==='note'&&<span>{item.note}</span>}
                          {item._type==='followup'&&<span><b>{item.title}</b>{item.details&&' — '+item.details} {item.completed&&<span style={{color:'#2e7d32',fontSize:10}}>(Done)</span>}</span>}
                          {item._type==='order'&&<span><b>#{item.order_num}</b> {item.style_code} {item.colour} | {item.qty}bx | {item.payment}</span>}
                        </div>
                      </div>
                    ))}
                    {custNotes.length===0&&custFollowups.length===0&&custOrders.length===0&&<div style={{padding:30,textAlign:'center',color:'#ccc'}}>No activity</div>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {custProfileTab==='notes'&&(
                <div>
                  <div style={{display:'flex',gap:8,marginBottom:16}}><input style={{...I,flex:1}} value={newNote} onChange={(e: any)=>setNewNote(e.target.value)} placeholder="Add a note..." onKeyDown={(e: any)=>{if(e.key==='Enter')addNote()}}/><button onClick={addNote} style={{background:'#111',color:'white',border:'none',padding:'8px 18px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:12}}>Add Note</button></div>
                  <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0'}}>
                    {custNotes.map((n: any,i: number)=>(<div key={i} style={{padding:'14px 18px',borderBottom:'1px solid #f0f0f0',display:'flex',gap:16}}><div style={{fontSize:11,color:'#888',whiteSpace:'nowrap',minWidth:100,textAlign:'right'}}>{fmtDateTime(n.created_at)}</div><div style={{flex:1,fontSize:13}}>{n.note}</div><button onClick={()=>deleteNote(n.id)} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer'}}>×</button></div>))}
                    {custNotes.length===0&&<div style={{padding:30,textAlign:'center',color:'#ccc'}}>No notes</div>}
                  </div>
                </div>
              )}

              {/* Follow-ups */}
              {custProfileTab==='followups'&&(
                <div>
                  {!showAddFollowup?<button onClick={()=>setShowAddFollowup(true)} style={{background:'#111',color:'white',border:'none',padding:'8px 18px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:12,marginBottom:16}}>Add Follow-up</button>:(
                    <div style={{background:'#fffde7',borderRadius:8,padding:16,marginBottom:16,border:'2px solid #fbc02d'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:8,marginBottom:8}}><div><label style={L}>Summary</label><input style={I} value={newFollowup.title} onChange={(e: any)=>setNewFollowup({...newFollowup,title:e.target.value})} placeholder="e.g. Ring to follow up"/></div><div><label style={L}>Priority</label><select style={I} value={newFollowup.priority} onChange={(e: any)=>setNewFollowup({...newFollowup,priority:e.target.value})}><option>Normal</option><option>High</option><option>Low</option></select></div></div>
                      <div style={{display:'grid',gridTemplateColumns:'150px 150px 1fr',gap:8,marginBottom:8}}><div><label style={L}>Due Date</label><input type="date" style={I} value={newFollowup.due_date} onChange={(e: any)=>setNewFollowup({...newFollowup,due_date:e.target.value})}/></div><div><label style={L}>Category</label><select style={I} value={newFollowup.category} onChange={(e: any)=>setNewFollowup({...newFollowup,category:e.target.value})}><option>Phone Call</option><option>Email</option><option>Visit</option><option>Other</option></select></div><div><label style={L}>Details</label><input style={I} value={newFollowup.details} onChange={(e: any)=>setNewFollowup({...newFollowup,details:e.target.value})} placeholder="Details..."/></div></div>
                      <div style={{display:'flex',gap:8}}><button onClick={addFollowup} style={{background:'#2e7d32',color:'white',border:'none',padding:'8px 16px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:12}}>Save</button><button onClick={()=>setShowAddFollowup(false)} style={{background:'#777',color:'white',border:'none',padding:'8px 16px',borderRadius:6,cursor:'pointer',fontSize:12}}>Cancel</button></div>
                    </div>
                  )}
                  <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{background:'#f5f5f5'}}><th style={{padding:'8px 12px',textAlign:'left',fontWeight:600,color:'#555'}}>Task</th><th style={{padding:'8px 12px',textAlign:'left',fontWeight:600,color:'#555',width:80}}>Priority</th><th style={{padding:'8px 12px',textAlign:'left',fontWeight:600,color:'#555',width:100}}>Due</th><th style={{padding:'8px 12px',textAlign:'left',fontWeight:600,color:'#555',width:80}}>Done</th><th style={{width:40}}></th></tr></thead>
                  <tbody>{custFollowups.map((f: any,i: number)=>(<tr key={i} style={{borderBottom:'1px solid #f0f0f0',opacity:f.completed?0.5:1,background:!f.completed&&isDue(f.due_date)?'#fff8f8':'white'}}><td style={{padding:'10px 12px'}}><div style={{fontWeight:600}}>{f.title}</div>{f.details&&<div style={{fontSize:11,color:'#888'}}>{f.details}</div>}<div style={{fontSize:10,color:'#aaa'}}>{f.category}</div></td><td style={{padding:'10px 12px'}}><span style={{fontSize:10,padding:'2px 8px',borderRadius:4,fontWeight:600,background:f.priority==='High'?'#ffebee':'#fff3e0',color:f.priority==='High'?'#c62828':'#e65100'}}>{f.priority}</span></td><td style={{padding:'10px 12px',color:isDue(f.due_date)&&!f.completed?'#c62828':'#555',fontWeight:isDue(f.due_date)?700:400}}>{fmtDate(f.due_date)}</td><td style={{padding:'10px 12px'}}><input type="checkbox" checked={f.completed||false} onChange={()=>toggleFollowup(f.id,f.completed)} style={{cursor:'pointer',width:16,height:16}}/></td><td><button onClick={()=>deleteFollowup(f.id)} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer'}}>×</button></td></tr>))}</tbody></table>
                  {custFollowups.length===0&&<div style={{padding:30,textAlign:'center',color:'#ccc'}}>No follow-ups</div>}</div>
                </div>
              )}

              {/* Orders */}
              {custProfileTab==='orders'&&(
                <div style={{background:'white',borderRadius:8,border:'1px solid #e0e0e0'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}><thead><tr style={{background:'#f5f5f5'}}>{['Date','Order#','Type','Style','Colour','Qty','Payment'].map(h=>(<th key={h} style={{padding:'8px 10px',fontWeight:600,textAlign:'left',color:'#555'}}>{h}</th>))}</tr></thead>
                <tbody>{custOrders.map((o: any,i: number)=>(<tr key={i} style={{borderBottom:'1px solid #f0f0f0',background:logRowBg(o.type)}}><td style={{padding:'6px 10px',fontSize:10}}>{fmtDateTime(o.created_at)}</td><td style={{padding:'6px 10px',fontWeight:700,color:'#bf360c'}}>{o.order_num}</td><td style={{padding:'6px 10px'}}><span style={{fontSize:9,padding:'2px 6px',borderRadius:3,fontWeight:700,background:typeBg(o.type),color:'white'}}>{o.type}</span></td><td style={{padding:'6px 10px',fontWeight:600}}>{o.style_code}</td><td style={{padding:'6px 10px'}}>{o.colour}</td><td style={{padding:'6px 10px',fontWeight:700,color:(o.qty||0)<0?'#c62828':'#2e7d32'}}>{o.qty}</td><td style={{padding:'6px 10px'}}>{o.payment&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:3,fontWeight:700,background:payBg(o.payment),color:'white'}}>{o.payment}</span>}</td></tr>))}</tbody></table>
                {custOrders.length===0&&<div style={{padding:30,textAlign:'center',color:'#ccc'}}>No orders</div>}</div>
              )}
            </div>
            {/* Right sidebar */}
            <div>
              <div style={{background:'white',borderRadius:8,padding:18,border:'1px solid #e0e0e0',marginBottom:12}}>
                <h3 style={{fontSize:13,fontWeight:600,margin:'0 0 12px',color:'#333',textTransform:'uppercase',letterSpacing:0.5}}>Quick Info</h3>
                <div style={{fontSize:13,marginBottom:8}}><span style={{color:'#888',display:'inline-block',width:80}}>Orders:</span> <b>{custOrders.length}</b></div>
                <div style={{fontSize:13,marginBottom:8}}><span style={{color:'#888',display:'inline-block',width:80}}>Notes:</span> <b>{custNotes.length}</b></div>
                <div style={{fontSize:13,marginBottom:8}}><span style={{color:'#888',display:'inline-block',width:80}}>Follow-ups:</span> <b>{custFollowups.filter((f: any)=>!f.completed).length} active</b></div>
                {custOrders.length>0&&<div style={{fontSize:13}}><span style={{color:'#888',display:'inline-block',width:80}}>Last Order:</span> <b>{fmtDate(custOrders[0]?.created_at)}</b></div>}
              </div>
              <div style={{background:'white',borderRadius:8,padding:18,border:'1px solid #e0e0e0'}}>
                <h3 style={{fontSize:13,fontWeight:600,margin:'0 0 12px',color:'#333',textTransform:'uppercase',letterSpacing:0.5}}>Recent</h3>
                {custNotes.slice(0,5).map((n: any,i: number)=>(<div key={i} style={{padding:'5px 0',borderBottom:'1px solid #f5f5f5',fontSize:11}}><div style={{color:'#888',fontSize:10}}>{fmtDate(n.created_at)}</div><div style={{color:'#333',marginTop:1}}>{n.note}</div></div>))}
                {custNotes.length===0&&<p style={{color:'#ccc',fontSize:11,textAlign:'center'}}>No notes</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}

function MC({l,m,s,o}: {l: string; m: any; s: string|null; o: (id: string)=>void}){
  const st=m[l]?.total_boxes||0
  return(<button onClick={()=>o(l)} style={{width:40,height:28,borderRadius:3,fontWeight:700,fontSize:10,cursor:'pointer',border:s===l?'2px solid #111':'1px solid #ddd',background:st>20?'#c8e6c9':st>10?'#dcedc8':st>4?'#fff9c4':st>0?'#ffcdd2':'#f5f5f5',color:st>20?'#1b5e20':st>10?'#33691e':st>4?'#f57f17':st>0?'#b71c1c':'#ccc'}}>{st||'-'}</button>)
}