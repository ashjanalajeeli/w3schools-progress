const colors = ['#3974ff', '#8967f5', '#f39b4a', '#32b8a4', '#e35d8f', '#45a8d8'];
const labels = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  sql: 'SQL',
  bootstrap: 'Bootstrap',
  python: 'Python',
  react: 'React',
  nodejs: 'Node.js',
  flutter: 'Flutter',
  dart: 'Dart'
};

async function init() {
  try {
    const response = await fetch('progress.json');
    if (!response.ok) throw new Error('تعذّر تحميل بيانات التقدم');
    const raw = await response.json();
    const entries = Object.entries(raw)
      .filter(([, value]) => Number.isFinite(Number(value)) && Number(value) >= 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]));
    render(entries);
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'error';
    message.setAttribute('role', 'alert');
    message.textContent = `${error.message}. افتحي الصفحة عبر خادم محلي لقراءة ملف JSON.`;
    document.querySelector('.shell').append(message);
  }
}

function render(entries) {
  const total = entries.reduce((sum, [, value]) => sum + Number(value), 0);
  const top = entries[0] || ['—', 0];
  const max = Math.max(...entries.map(([, value]) => Number(value)), 1);

  document.querySelector('#total').textContent = total;
  document.querySelector('#tracks').textContent = entries.length;
  document.querySelector('#top').textContent = entries.length ? (labels[top[0].toLowerCase()] || top[0]) : '—';
  document.querySelector('#topValue').textContent = entries.length ? `${top[1]} درسًا منجزًا` : 'لا توجد بيانات بعد';
  document.querySelector('#ringTotal').textContent = total;

  renderBars(entries, max);
  renderLegend(entries, total);
  renderRing(entries, total);
}

function renderBars(entries, max) {
  const chart = document.querySelector('#bars');
  chart.replaceChildren();

  if (!entries.length) {
    chart.append(emptyState('أضيفي مسارات التعلّم إلى progress.json لعرض الرسم.'));
    return;
  }

  entries.forEach(([key, value], index) => {
    const item = document.createElement('div');
    item.className = 'bar-item';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.setProperty('--height', `${Math.max(Number(value) / max * 88, 2)}%`);
    bar.style.setProperty('--color', colors[index % colors.length]);
    bar.dataset.value = value;
    bar.setAttribute('aria-label', `${labels[key.toLowerCase()] || key}: ${value} درسًا منجزًا`);

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = labels[key.toLowerCase()] || key;
    item.append(bar, label);
    chart.append(item);
  });
}

function renderLegend(entries, total) {
  const legend = document.querySelector('#legend');
  legend.replaceChildren();

  if (!entries.length) {
    legend.append(emptyState('ستظهر تفاصيل التوزيع هنا بعد إضافة البيانات.'));
    return;
  }

  entries.forEach(([key, value], index) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.setAttribute('role', 'listitem');

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.setProperty('--color', colors[index % colors.length]);
    dot.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.textContent = labels[key.toLowerCase()] || key;

    const share = document.createElement('strong');
    share.textContent = `${total ? Math.round(Number(value) / total * 100) : 0}%`;

    item.append(dot, name, share);
    legend.append(item);
  });
}

function renderRing(entries, total) {
  const ring = document.querySelector('#ring');
  if (!entries.length || total === 0) {
    ring.style.background = 'conic-gradient(#e8edf5 0deg 360deg)';
    return;
  }

  let angle = 0;
  const stops = entries.map(([key, value], index) => {
    const start = angle;
    angle += Number(value) / total * 360;
    return `${colors[index % colors.length]} ${start}deg ${angle}deg`;
  });
  ring.style.background = `conic-gradient(${stops.join(', ')})`;
}

function emptyState(message) {
  const state = document.createElement('p');
  state.className = 'empty-state';
  state.textContent = message;
  return state;
}

init();
