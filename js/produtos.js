/* ── DATA ── */
let produtos = JSON.parse(localStorage.getItem("produt")) || []

// 🔧 FIX: Garante que o contador de ID está sincronizado com os dados existentes
if (!localStorage.getItem("produt_nextId")) {
  const maxId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) : 0;
  localStorage.setItem("produt_nextId", maxId + 1);
}

let editId = null;
let deleteId = null;
/* --TEMA-- */

let body = document.body
let selectTema = document.getElementById('temaSelect')
let temaCaixa = document.getElementById('container-tema')



function renderTema() {
  saveTema()
  mudarTema()
  fecharTema()
}


function mudarTema() {
  let tema = localStorage.getItem('tema') || 'Dark'
  if (tema === 'Claro') {
    body.classList.add('claro')
    selectTema.style.color='black'
  } else if (tema === 'Dark') {
    body.classList.remove('claro')
    selectTema.style.color='white'
  }
}
mudarTema()

function fecharTema() {

  temaCaixa.classList.add('hide')
}

function abrirTema() {
  temaCaixa.classList.remove('hide')
}


//  --- SALVAR DADOS---

// 🔧 FIX: Contador persistente — nunca repete IDs, mesmo após deletar produtos
function gerarId() {
  let nextId = parseInt(localStorage.getItem("produt_nextId") || "1");
  if(produtos.length===0){
nextId=0
  }
  localStorage.setItem("produt_nextId", nextId + 1);
  return nextId;
}
 
 
function saveProdutos() {
  localStorage.setItem("produt", JSON.stringify(produtos))
}

function saveTema() {
  localStorage.setItem('tema', selectTema.value)
  
}
/* ── TABS ── */
function switchTab(tab) {
  document.getElementById('view-lista').style.display = tab === 'lista' ? '' : 'none';
  document.getElementById('view-form').style.display = tab === 'form' ? '' : 'none';
  document.getElementById('tab-lista').classList.toggle('active', tab === 'lista');
  document.getElementById('tab-form').classList.toggle('active', tab === 'form');
}

function openForm(prod = null) {
  editId = prod ? prod.id : null;
  document.getElementById('tab-form').style.display = '';
  document.getElementById('form-title').textContent = prod ? 'EDITAR PRODUTO' : 'NOVO PRODUTO';
  document.getElementById('tab-form-label').textContent = prod ? 'Editar' : 'Cadastrar';
  document.getElementById('btn-submit-label').textContent = prod ? 'Salvar Alterações' : 'Cadastrar Produto';

  document.getElementById('f-nome').value = prod ? prod.nome : '';
  document.getElementById('f-categoria').value = prod ? prod.categoria : '';
  document.getElementById('f-status-form').value = prod ? prod.status : 'Ativo';
  document.getElementById('f-preco').value = prod ? prod.preco : '';
  document.getElementById('f-estoque').value = prod ? prod.estoque : '';
  
  clearErrors();
  switchTab('form');
}

function cancelForm() {
  editId = null;
  document.getElementById('tab-form').style.display = 'none';
  switchTab('lista');
}

/* ── FORM ── */
function clearErrors() {
  ['nome', 'categoria', 'preco', 'estoque'].forEach(k => {
    document.getElementById('f-' + k).classList.remove('error');
    document.getElementById('err-' + k).classList.remove('show');
  });
}

function showError(field, msg) {
  document.getElementById('f-' + field).classList.add('error');
  const el = document.getElementById('err-' + field);
  el.textContent = msg;
  el.classList.add('show');
}

function validate() {
  clearErrors();
  let ok = true;
  const nome = document.getElementById('f-nome').value.trim();
  const cat = document.getElementById('f-categoria').value;
  const preco = document.getElementById('f-preco').value;
  const est = document.getElementById('f-estoque').value;

  if (!nome) { showError('nome', 'Nome obrigatório'); ok = false; }
  if (!cat) { showError('categoria', 'Categoria obrigatória'); ok = false; }
  if (!preco || isNaN(preco) || +preco <= 0) { showError('preco', 'Preço inválido'); ok = false; }
  if (est === '' || isNaN(est) || +est < 0) { showError('estoque', 'Estoque inválido'); ok = false; }
  return ok;
}

function submitForm() {
  if (!validate()) return;
  const p = {
    nome: document.getElementById('f-nome').value.trim(),
    categoria: document.getElementById('f-categoria').value,
    status: document.getElementById('f-status-form').value,
    preco: +document.getElementById('f-preco').value,
    estoque: +document.getElementById('f-estoque').value,
  };
  if (editId !== null) {
    const i = produtos.findIndex(x => x.id === editId);
    produtos[i] = { ...produtos[i], ...p };
    showToast('Produto atualizado!', 'success');
  } else {
    produtos.push({ id: gerarId(), ...p });
    showToast('Produto cadastrado!', 'success');
  }
  saveProdutos()
  cancelForm();
  renderStats();
  renderTable();

}

/* ── DELETE ── */
function askDelete(id) {
  deleteId = id;
  document.getElementById('modal').classList.add('show');
}
function closeModal() {
  deleteId = null;
  document.getElementById('modal').classList.remove('show');
}
function confirmDelete() {
  produtos = produtos.filter(p => p.id !== deleteId);
  closeModal();
  renderStats();
  renderTable();
  saveProdutos();
  showToast('Produto removido.', 'error');
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').textContent = type === 'error' ? '✕' : '✓';
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── STATS ── */
function renderStats() {
  const total = produtos.length;
  const ativos = produtos.filter(p => p.status === 'Ativo').length;
  const sem = produtos.filter(p => p.estoque === 0).length;
  const valor = produtos.reduce((a, p) => a + p.preco * p.estoque, 0);

  const data = [
    { label: 'Total de Produtos', value: total, icon: '◈', color: 'var(--accent)' },
    { label: 'Produtos Ativos', value: ativos, icon: '◉', color: 'var(--green)' },
    { label: 'Sem Estoque', value: sem, icon: '◎', color: 'var(--red)' },
    { label: 'Valor em Estoque', value: 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: '◆', color: 'var(--blue)' },
  ];

  document.getElementById('stats').innerHTML = data.map(s => `
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">${s.label}</span>
          <span class="stat-icon" style="color:${s.color}">${s.icon}</span>
        </div>
        <div class="stat-value" style="color:${s.color}">${s.value}</div>
      </div>
    `).join('');
}

/* ── FILTER CHIPS ── */
function renderChips() {
  const busca = document.getElementById('f-busca').value;
  const cat = document.getElementById('f-cat').value;
  const status = document.getElementById('f-status').value;
  const pmin = document.getElementById('f-pmin').value;
  const pmax = document.getElementById('f-pmax').value;

  const chips = [];
  if (busca) chips.push({ label: `"${busca}"`, clear: () => { document.getElementById('f-busca').value = ''; renderTable(); } });
  if (cat) chips.push({ label: cat, clear: () => { document.getElementById('f-cat').value = ''; renderTable(); } });
  if (status) chips.push({ label: status, clear: () => { document.getElementById('f-status').value = ''; renderTable(); } });
  if (pmin || pmax) chips.push({ label: `R$${pmin || '0'} – R$${pmax || '∞'}`, clear: () => { document.getElementById('f-pmin').value = ''; document.getElementById('f-pmax').value = ''; renderTable(); } });

  const el = document.getElementById('active-chips');
  if (chips.length === 0) { el.style.display = 'none'; return; }

  el.style.display = 'flex';
  el.innerHTML = `<span class="chips-label">Filtros ativos:</span>` +
    chips.map((c, i) => `<span class="chip">${c.label}<button class="chip-remove" onclick="chipClear(${i})">×</button></span>`).join('') +
    `<button class="btn-clear-all" onclick="clearAllFilters()">Limpar tudo</button>`;

  el._chips = chips;
}

function chipClear(i) {
  document.getElementById('active-chips')._chips[i].clear();
}

function clearAllFilters() {
  ['f-busca', 'f-cat', 'f-status', 'f-pmin', 'f-pmax'].forEach(id => {
    const el = document.getElementById(id);
    el.tagName === 'SELECT' ? el.selectedIndex = 0 : (el.value = '');
  });
  renderTable();
}

/* ── TABLE ── */
function getFiltered() {
  const busca = document.getElementById('f-busca').value.toLowerCase();
  const cat = document.getElementById('f-cat').value;
  const status = document.getElementById('f-status').value;
  const pmin = +document.getElementById('f-pmin').value || 0;
  const pmax = +document.getElementById('f-pmax').value || Infinity;

  return produtos.filter(p => {
    if (busca && !p.nome.toLowerCase().includes(busca) && !p.categoria.toLowerCase().includes(busca)) return false;
    if (cat && p.categoria !== cat) return false;
    if (status && p.status !== status) return false;
    if (p.preco < pmin || p.preco > pmax) return false;
    return true;
  });
}

function stockColor(n) {
  if (n === 0) return 'var(--red)';
  if (n < 10) return 'var(--yellow)';
  return 'var(--green)';
}

function renderTable() {
  renderChips();
  const list = getFiltered();
  const count = list.length;
  document.getElementById('table-count').textContent =
    count + ' produto' + (count !== 1 ? 's' : '') + ' encontrado' + (count !== 1 ? 's' : '');

  if (list.length === 0) {
    document.getElementById('table-wrap').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">◎</div>
          <div>Nenhum produto encontrado</div>
        </div>`;
    return;
  }

  document.getElementById('table-wrap').innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(p => `
          <tr>
            <td>
              <div class="td-name">${escHtml(p.nome)}</div>
              <div class="td-id">#${p.id}</div>
            </td>
            <td><span class="td-cat">${escHtml(p.categoria)}</span></td>
            <td class="td-price">R$ ${p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td style="color:${stockColor(p.estoque)};font-size:13px">
              ${p.estoque === 0 ? '✕ Esgotado' : p.estoque + ' un.'}
            </td>
            <td><span class="tag ${p.status === 'Ativo' ? 'tag-ativo' : 'tag-inativo'}">${p.status}</span></td>
            <td>
              <div class="td-actions">
                <button class="btn-edit" onclick="openForm(getProduto(${p.id}))">Editar</button>
                <button class="btn-danger" onclick="askDelete(${p.id})">Remover</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
}

function getProduto(id) { return produtos.find(p => p.id === id); }

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── INIT ── */
renderStats();
renderTable();