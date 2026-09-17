function qs(name){
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function getSemesterLabel(value){
  const found = SEMESTERS.find(s => s.value === String(value));
  return found ? found.label : (value || "-");
}

function showToast(message){
  let toast = document.getElementById("grt-toast");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "grt-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


function renderHeader(mountEl, opts){
  opts = opts || {};
  const label = opts.label || "GRT COLLEGE VAULT";
  const sub   = opts.sub   || "Departmental Resource Archive";
  const showLogout = !!opts.showLogout;

  mountEl.innerHTML = `
    <header class="site-header">
      <div class="wrap">
        <a class="brand" href="index.html">
          <img src="assets/logo.png" alt="GRT College logo">
          <div class="brand-text">
            <div class="college-name">GRT College</div>
            <div class="college-sub">RESOURCE ARCHIVE</div>
          </div>
        </a>
        <div class="header-right">
          <div class="vault-title">${label}<small>${sub}</small></div>
          ${showLogout ? `<button class="btn btn-ghost btn-small" id="global-logout-btn">Log out</button>` : ""}
        </div>
      </div>
    </header>
  `;

  if(showLogout){
    const btn = document.getElementById("global-logout-btn");
    btn.addEventListener("click", () => {
      logoutAll();
      window.location.href = "index.html";
    });
  }
}

function renderFooter(mountEl){
  mountEl.innerHTML = `
    <footer class="site-footer">
      <div class="wrap">GRT College &middot; Departmental Resource Archive &middot; <a href="https://grt.edu.in/" target="_blank" rel="noopener">grt.edu.in</a></div>
    </footer>
  `;
}


function renderDeptGrid(mountEl, departments, hrefFn){
  mountEl.innerHTML = departments.map(d => `
    <a class="dept-card" href="${hrefFn(d)}">
      <div class="dept-arrow">&rarr;</div>
      <div class="dept-short">${escapeHtml(d.short)}</div>
      <div class="dept-full">${escapeHtml(d.name)}</div>
    </a>
  `).join("");
}


function renderLedger(mountEl, resources, opts){
  opts = opts || {};
  const showDelete = !!opts.showDelete;

  if(resources.length === 0){
    mountEl.innerHTML = `<div class="ledger-empty">Nothing uploaded here yet.</div>`;
    return;
  }

  const rows = resources.map(r => {
    const examType = getExamType(r.examType);
    return `
    <div class="ledger-row">
      <div>
        <span class="col-label">Title</span>
        <div class="paper-title">${escapeHtml(r.title)}</div>
        <div class="paper-meta">
          ${escapeHtml(r.fileName)}
          ${examType ? `<span class="tag">${escapeHtml(examType.label)}</span>` : ""}
        </div>
      </div>
      <div><span class="col-label">Year</span>${escapeHtml(r.year || "-")}</div>
      <div><span class="col-label">Semester</span>${escapeHtml(getSemesterLabel(r.semester))}</div>
      <div style="display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">
        ${opts.showView ? `<a class="btn btn-outline btn-small" href="${r.dataUrl}" target="_blank" rel="noopener">View</a>` : ""}
        <a class="btn btn-ghost btn-small" data-download href="${r.dataUrl}" download="${escapeHtml(r.fileName)}">Download</a>
        ${showDelete ? `<button class="btn btn-danger" data-delete="${r.id}">Delete</button>` : ""}
      </div>
    </div>
  `; }).join("");

  mountEl.innerHTML = `
    <div class="ledger-row head">
      <div>Title</div><div>Year</div><div>Semester</div><div style="text-align:right;">Action</div>
    </div>
    ${rows}
  `;

  mountEl.querySelectorAll("[data-download]").forEach(link => {
    link.addEventListener("click", () => showToast("Download successful!"));
  });

  if(showDelete){
    mountEl.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => opts.onDelete && opts.onDelete(btn.getAttribute("data-delete")));
    });
  }
}

function renderToolbar(mountEl, { withExamType }){
  mountEl.innerHTML = `
    <input type="search" id="f-search" placeholder="Search by title...">
    <select id="f-year"><option value="">All years</option></select>
    <select id="f-sem">
      <option value="">All semesters</option>
      ${SEMESTERS.map(s => `<option value="${s.value}">${s.label}</option>`).join("")}
    </select>
    ${withExamType ? `<select id="f-examtype"><option value="">All exam types</option>
      ${EXAM_TYPES.map(e => `<option value="${e.value}">${e.label}</option>`).join("")}
    </select>` : ""}
  `;
}

function populateFilterOptions(list){

  const yearSel = document.getElementById("f-year");
  const years = Array.from(new Set(list.map(r => r.year).filter(Boolean))).sort().reverse();
  if(yearSel){
    const current = yearSel.value;
    yearSel.innerHTML = `<option value="">All years</option>` + years.map(y => `<option value="${y}">${y}</option>`).join("");
    yearSel.value = current;
  }
}

function applyFilters(list){
  const term = (document.getElementById("f-search") || {}).value || "";
  const year = (document.getElementById("f-year") || {}).value || "";
  const sem  = (document.getElementById("f-sem") || {}).value || "";
  const examTypeEl = document.getElementById("f-examtype");
  const examType = examTypeEl ? examTypeEl.value : "";

  const t = term.trim().toLowerCase();
  return list.filter(r => {
    const matchesTerm = !t || r.title.toLowerCase().includes(t);
    const matchesYear = !year || r.year === year;
    const matchesSem  = !sem || r.semester === sem;
    const matchesExam = !examType || r.examType === examType;
    return matchesTerm && matchesYear && matchesSem && matchesExam;
  });
}
