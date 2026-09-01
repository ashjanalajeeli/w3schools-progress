const colors = ['#3974ff', '#8967f5', '#f39b4a', '#32b8a4', '#e35d8f', '#45a8d8'];
const labels = { html: 'HTML', css: 'CSS', javascript: 'JavaScript', sql: 'SQL', bootstrap: 'Bootstrap', python: 'Python' };

async function init() {
  try {
    const response = await fetch('progress.json');
    if (!response.ok) throw new Error('تعذّر تحميل البيانات');
    const raw = await response.json();
    const entries = Object.entries(raw).filter(([, value]) => Number.isFinite(Number(value)) && Number(value) >= 0).sort((a,b) => b[1] - a[1]);
    render(entries);
  } catch (error) {
    document.querySelector('.shell').insertAdjacentHTML('beforeend', `<p class="error">${error.message}. افتح الصفحة عبر خادم محلي لقراءة JSON.</p>`);
  }
}

function render(entries) {
  const total = entries.reduce((sum, [, value]) => sum + Number(value), 0);
  const top = entries[0] || ['—', 0];
  const max = Math.max(...entries.map(([, value]) => Number(value)), 1);
  document.querySelector('#total').textContent = total;
  document.querySelector('#tracks').textContent = entries.length;
  document.querySelector('#top').textContent = labels[top[0]] || top[0];
  document.querySelector('#topValue').textContent = `${top[1]} درسًا مكتملًا`;
  document.querySelector('#ringTotal').textContent = total;

  document.querySelector('#bars').innerHTML = entries.map(([key, value], index) => {
    const color = colors[index % colors.length];
    return `<div class="bar-item"><div class="bar" style="--height:${Math.max(Number(value) / max * 88, 2)}%;--color:${color}" data-value="${value}"></div><label>${labels[key] || key}</label></div>`;
  }).join('');

  let angle = 0;
  const stops = entries.map(([key, value], index) => {
    const start = angle;
    angle += Number(value) / total * 360;
    return `${colors[index % colors.length]} ${start}deg ${angle}deg`;
  });
  document.querySelector('#ring').style.background = `conic-gradient(${stops.join(',')})`;
  document.querySelector('#legend').innerHTML = entries.map(([key, value], index) => `<div class="legend-item"><span class="dot" style="background:${colors[index % colors.length]}"></span><span>${labels[key] || key}</span><b>${Math.round(value / total * 100)}%</b></div>`).join('');
  document.querySelector('#progressList').innerHTML = entries.map(([key, value], index) => `<div class="progress-row"><span>${labels[key] || key}</span><div class="track"><div class="fill" style="width:${Number(value) / max * 100}%;--color:${colors[index % colors.length]}"></div></div><strong>${value}</strong></div>`).join('');
}

init();
