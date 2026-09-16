
(function(){
  const baseProducts = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const STORAGE = "iontech_catalog_overrides_v1";
  const SETTINGS = "iontech_catalog_settings_v1";

  function readOverrides(){
    try { return JSON.parse(localStorage.getItem(STORAGE) || "{}"); } catch(e){ return {}; }
  }
  function readSettings(){
    try { return JSON.parse(localStorage.getItem(SETTINGS) || "{}"); } catch(e){ return {}; }
  }
  function getProducts(){
    const overrides = readOverrides();
    return baseProducts.map(p => ({...p, ...(overrides[p.sku] || {})}));
  }
  function money(v){
    if(!v || String(v).trim()==="" || String(v).trim()==="-") return "—";
    return "₱" + String(v).replace(/₱/g,"").trim();
  }
  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }
  function setMeta(name, content){
    let el=document.querySelector(`meta[name="${name}"]`);
    if(!el){el=document.createElement("meta");el.name=name;document.head.appendChild(el);}
    el.content=content;
  }
  function setCanonical(url){
    let el=document.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement("link");el.rel="canonical";document.head.appendChild(el);}
    el.href=url;
  }
  function imageHTML(src, label){
    return src
      ? `<div class="thumb"><img loading="lazy" src="${esc(src)}" alt="${esc(label)} product image"></div>`
      : `<div class="thumb"><div class="placeholder">PRODUCT IMAGE<br><span>${esc(label)}</span></div></div>`;
  }
  function productUrl(p){ return `${location.origin}${location.pathname}#product=${encodeURIComponent(p.sku)}`; }

  function applyBrand(){
    const s=readSettings();
    const name=s.companyName || "IONTECH";
    document.querySelectorAll("[data-brand]").forEach(el=>el.textContent=name);
    const logo=s.logo || "";
    document.querySelectorAll("[data-logo]").forEach(el=>{
      if(logo) el.innerHTML=`<img src="${esc(logo)}" alt="${esc(name)} logo">`;
      else el.innerHTML=`<span>YOUR<br>LOGO</span>`;
    });
  }

  function card(p){
    const onhandLabel=p.priceLabels?.onhand || "On-hand VAT inc.";
    const orderLabel=p.priceLabels?.orderBasis || "Order-basis VAT inc.";
    const qty=p.openQty ? `<span class="badge">${esc(p.openQty)} available</span>` : "";
    return `<article class="card">
      <div class="card-media">${imageHTML(p.image1,p.model)}${imageHTML(p.image2,p.model)}</div>
      <div class="card-body">
        <span class="badge">${esc(p.category)}</span>
        <h4>${esc(p.model)}</h4>
        <div class="sku">SKU: ${esc(p.sku)}</div>
        ${qty}
        <p class="card-desc">${esc(p.description)}</p>
        <div class="price-grid">
          <div class="price-box"><div class="price-label">${esc(onhandLabel)}</div><div class="price">${money(p.onhandPrice)}</div></div>
          <div class="price-box"><div class="price-label">${esc(orderLabel)}</div><div class="price">${money(p.orderBasisPrice)}</div></div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" data-view="${esc(p.sku)}">View details</button>
          <button class="btn btn-secondary" data-copy="${esc(productUrl(p))}">Copy link</button>
        </div>
      </div>
    </article>`;
  }

  function render(){
    const products=getProducts();
    const q=(document.querySelector("#search")?.value || "").toLowerCase().trim();
    const category=document.querySelector("#category")?.value || "All";
    const sort=document.querySelector("#sort")?.value || "model";
    let list=products.filter(p=>{
      const hay=[p.sku,p.model,p.category,p.description,Object.values(p.specs||{}).join(" ")].join(" ").toLowerCase();
      return (!q || hay.includes(q)) && (category==="All" || p.category===category);
    });
    if(sort==="priceAsc") list.sort((a,b)=>num(a.onhandPrice)-num(b.onhandPrice));
    else if(sort==="priceDesc") list.sort((a,b)=>num(b.onhandPrice)-num(a.onhandPrice));
    else list.sort((a,b)=>a.model.localeCompare(b.model)||a.sku.localeCompare(b.sku));
    document.querySelector("#count").textContent=`${list.length} product${list.length===1?"":"s"}`;
    document.querySelector("#grid").innerHTML=list.length?list.map(card).join(""):`<div class="empty">No products matched your search.</div>`;
  }
  function num(v){ const n=parseFloat(String(v||"").replace(/[^\d.]/g,"")); return isNaN(n)?Infinity:n; }

  function openProduct(sku){
    const p=getProducts().find(x=>x.sku===sku);
    if(!p)return;
    const modal=document.querySelector("#modal");
    const specs=Object.entries(p.specs||{}).filter(([k,v])=>v);
    const comps=p.components||[];
    document.querySelector("#modalContent").innerHTML=`
      <div class="modal-top"><div><span class="badge">${esc(p.category)}</span><div class="small">SKU ${esc(p.sku)}</div></div><button class="close" data-close>×</button></div>
      <div class="detail">
        <div class="detail-grid">
          <div>
            <div class="gallery">${imageHTML(p.image1,p.model)}${imageHTML(p.image2,p.model)}</div>
            <p class="small" style="margin-top:10px">Two image slots are available for every product. Admins can upload them from the Admin page.</p>
          </div>
          <div>
            <h2>${esc(p.model)}</h2>
            <p class="lead">${esc(p.description)}</p>
            <div class="detail-prices">
              <div class="detail-price"><span>${esc(p.priceLabels?.onhand || "On-hand VAT inc.")}</span><strong>${money(p.onhandPrice)}</strong></div>
              <div class="detail-price"><span>${esc(p.priceLabels?.orderBasis || "Order-basis VAT inc.")}</span><strong>${money(p.orderBasisPrice)}</strong></div>
            </div>
            ${p.openQty?`<p><strong>Open quantity:</strong> ${esc(p.openQty)}</p>`:""}
            ${specs.length?`<h3>Specifications</h3><table class="specs"><tbody>${specs.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`:""}
            ${comps.length?`<h3>Components & included configuration</h3><div class="components">${comps.map(c=>`<div class="component"><b>${esc(c.partNo)}</b><br>${esc(c.description)}</div>`).join("")}</div>`:""}
          </div>
        </div>
      </div>`;
    modal.classList.add("open");
    history.replaceState(null,"",`#product=${encodeURIComponent(sku)}`);
    updateSEO(p);
  }

  function updateSEO(p){
    const name=p.model+" "+p.sku;
    document.title=p.seoTitle || `${name} | IONTECH`;
    setMeta("description",p.seoDescription || p.description);
    setMeta("robots","index,follow");
    setCanonical(productUrl(p));
    let ld=document.querySelector("#product-jsonld");
    if(!ld){ld=document.createElement("script");ld.id="product-jsonld";ld.type="application/ld+json";document.head.appendChild(ld);}
    ld.textContent=JSON.stringify({
      "@context":"https://schema.org","@type":"Product","name":name,
      "description":p.description,"sku":p.sku,
      "category":p.category,
      "image":[p.image1,p.image2].filter(Boolean),
      "offers":[
        p.onhandPrice?{"@type":"Offer","priceCurrency":"PHP","price":String(p.onhandPrice).replace(/[^\d.]/g,""),"availability":p.openQty?"https://schema.org/InStock":"https://schema.org/LimitedAvailability"}:null,
        p.orderBasisPrice?{"@type":"Offer","priceCurrency":"PHP","price":String(p.orderBasisPrice).replace(/[^\d.]/g,"")} : null
      ].filter(Boolean)
    });
  }

  function resetSEO(){
    const s=readSettings();
    document.title=s.siteTitle || "IONTECH Professional Computing Catalog";
    setMeta("description",s.siteDescription || "Professional workstations and business computing products with specifications, components and VAT-inclusive pricing.");
    setMeta("robots","index,follow");
    setCanonical(location.origin+location.pathname);
    const ld=document.querySelector("#product-jsonld"); if(ld)ld.remove();
  }

  document.addEventListener("click",e=>{
    const v=e.target.closest("[data-view]");
    if(v){openProduct(v.dataset.view);return;}
    const c=e.target.closest("[data-copy]");
    if(c){navigator.clipboard?.writeText(c.dataset.copy);c.textContent="Copied";setTimeout(()=>c.textContent="Copy link",1200);return;}
    if(e.target.closest("[data-close]")){document.querySelector("#modal").classList.remove("open");history.replaceState(null,"",location.pathname);resetSEO();}
    if(e.target.id==="modal") {e.target.classList.remove("open");}
  });
  ["search","category","sort"].forEach(id=>document.getElementById(id)?.addEventListener("input",render));
  document.getElementById("modal")?.addEventListener("click",e=>{if(e.target.id==="modal")e.currentTarget.classList.remove("open")});

  window.IONTECH={getProducts,readOverrides,readSettings,render,applyBrand,openProduct,STORAGE,SETTINGS,baseProducts};

  window.addEventListener("DOMContentLoaded",()=>{
    applyBrand();
    const cats=["All",...new Set(getProducts().map(p=>p.category))];
    const select=document.querySelector("#category");
    if(select) select.innerHTML=cats.map(c=>`<option>${esc(c)}</option>`).join("");
    render();
    const m=location.hash.match(/^#product=(.+)$/);
    if(m)openProduct(decodeURIComponent(m[1]));
    else resetSEO();
  });
})();
