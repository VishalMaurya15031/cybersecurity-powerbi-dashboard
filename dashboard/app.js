/* ============================================================
   CYBERSHIELD — MAIN APP LOGIC + CHARTS
   ============================================================ */

// ---- Wait for DOM + data ----
document.addEventListener('DOMContentLoaded', () => {
  initBackground();
  initClock();
  initKPIs();
  initOverviewCharts();
  initTechnicalCharts();
  initInvestigationTable();
});

// ============================================================
// ANIMATED BACKGROUND MATRIX DOTS
// ============================================================
function initBackground() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const nodes = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 2 + 1,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(180, 80, 255, ${0.18 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.r > 2 ? 'rgba(224, 64, 251, 0.6)' : 'rgba(180, 80, 255, 0.45)';
      ctx.fill();

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
}

// ============================================================
// CLOCK
// ============================================================
function initClock() {
  const el = document.getElementById('currentTime');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + ' IST';
  }
  tick();
  setInterval(tick, 1000);
}

// ============================================================
// TAB SWITCHING
// ============================================================
function switchTab(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ============================================================
// KPI COUNTER ANIMATION
// ============================================================
function animateCounter(id, target, decimals = 0, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const duration = 1500;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = ease * target;
    el.textContent = (decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initKPIs() {
  const d = DASHBOARD_DATA;
  animateCounter('val-total', d.totalAttacks, 0);
  animateCounter('val-threat', d.avgThreatScore, 1);
  animateCounter('val-critical', d.criticalIPs, 0);
  animateCounter('val-countries', d.uniqueCountries, 0);
}

// ============================================================
// CHART DEFAULTS
// ============================================================
Chart.defaults.color = '#7fa3c0';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;

const COLORS = {
  green: 'rgba(191, 95, 255, 0.8)',
  greenDim: 'rgba(191, 95, 255, 0.15)',
  greenBorder: 'rgba(191, 95, 255, 1)',
  cyan: 'rgba(224, 64, 251, 0.8)',
  cyanDim: 'rgba(224, 64, 251, 0.15)',
  red: 'rgba(255, 56, 96, 0.8)',
  orange: 'rgba(255, 159, 67, 0.8)',
  purple: 'rgba(155, 89, 246, 0.8)',
  yellow: 'rgba(255, 214, 50, 0.8)',
};

const PALETTE = [
  '#bf5fff', '#e040fb', '#a78bfa', '#f472b6',
  '#fb923c', '#facc15', '#34d399', '#60a5fa',
  '#f87171', '#c084fc', '#e879f9', '#fb7185',
  '#818cf8', '#fbbf24', '#4ade80',
];

function gradientBar(ctx, chartArea, colorA, colorB) {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(1, colorB);
  return gradient;
}

// ============================================================
// OVERVIEW CHARTS
// ============================================================
function initOverviewCharts() {
  const d = DASHBOARD_DATA;

  // --- Countries Bar Chart ---
  const countries = d.topCountries.sort((a, b) => b.count - a.count).slice(0, 15);
  new Chart(document.getElementById('chartCountries'), {
    type: 'bar',
    data: {
      labels: countries.map(c => c.country),
      datasets: [{
        label: 'Attacks',
        data: countries.map(c => c.count),
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return COLORS.greenDim;
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, 'rgba(191,95,255,0.85)');
          g.addColorStop(1, 'rgba(224,64,251,0.35)');
          return g;
        },
        borderColor: COLORS.greenBorder,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,255,136,0.3)',
          borderWidth: 1,
          titleColor: '#00ff88',
          bodyColor: '#e8f4ff',
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(180,80,255,0.06)', drawBorder: false },
          ticks: { color: '#a07fc0' }
        },
        y: {
          grid: { color: 'rgba(180,80,255,0.1)', drawBorder: false },
          ticks: { color: '#a07fc0' },
          beginAtZero: true
        }
      }
    }
  });

  // --- Risk Donut ---
  const risk = d.riskLevels;
  new Chart(document.getElementById('chartRisk'), {
    type: 'doughnut',
    data: {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [risk.Critical || 0, risk.High || 0, risk.Medium || 0, risk.Low || 0],
        backgroundColor: [
          'rgba(255,56,96,0.85)', 'rgba(255,159,67,0.85)',
          'rgba(191,95,255,0.8)', 'rgba(224,64,251,0.75)'
        ],
        borderColor: 'rgba(6,20,40,0.8)',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#7fa3c0', padding: 12, usePointStyle: true, pointStyleWidth: 8 }
        },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,255,136,0.3)',
          borderWidth: 1,
          titleColor: '#00ff88',
          bodyColor: '#e8f4ff',
        }
      }
    }
  });

  // --- Protocol Donut ---
  const proto = d.protocols;
  new Chart(document.getElementById('chartProtocol'), {
    type: 'doughnut',
    data: {
      labels: ['TCP', 'UDP'],
      datasets: [{
        data: [proto.TCP || 0, proto.UDP || 0],
        backgroundColor: ['rgba(191,95,255,0.85)', 'rgba(224,64,251,0.75)'],
        borderColor: 'rgba(6,20,40,0.8)',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#7fa3c0', padding: 16, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          titleColor: '#00d4ff',
          bodyColor: '#e8f4ff',
        }
      }
    }
  });

  // --- Timeline Line Chart ---
  const timeline = d.timeline;
  new Chart(document.getElementById('chartTimeline'), {
    type: 'line',
    data: {
      labels: timeline.map(t => t.month),
      datasets: [{
        label: 'Attacks',
        data: timeline.map(t => t.count),
        borderColor: '#bf5fff',
        backgroundColor: 'rgba(191,95,255,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e040fb',
        pointBorderColor: 'rgba(6,20,40,0.8)',
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,255,136,0.3)',
          borderWidth: 1,
          titleColor: '#00ff88',
          bodyColor: '#e8f4ff',
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(180,80,255,0.06)' },
          ticks: { color: '#a07fc0' }
        },
        y: {
          grid: { color: 'rgba(180,80,255,0.1)' },
          ticks: { color: '#a07fc0' },
          beginAtZero: true
        }
      }
    }
  });
}

// ============================================================
// TECHNICAL CHARTS
// ============================================================
function initTechnicalCharts() {
  const d = DASHBOARD_DATA;

  // --- Techniques Horizontal Bar ---
  const techs = d.topTechniques.slice(0, 10);
  new Chart(document.getElementById('chartTechniques'), {
    type: 'bar',
    data: {
      labels: techs.map(t => t.name.length > 28 ? t.name.substring(0, 28) + '…' : t.name),
      datasets: [{
        label: 'Count',
        data: techs.map(t => t.count),
        backgroundColor: PALETTE.slice(0, 10).map(c => c + 'cc'),
        borderColor: PALETTE.slice(0, 10),
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,255,136,0.3)',
          borderWidth: 1,
          titleColor: '#00ff88',
          bodyColor: '#e8f4ff',
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,255,136,0.06)' },
          ticks: { color: '#7fa3c0' },
          beginAtZero: true
        },
        y: {
          grid: { display: false },
          ticks: { color: '#f0e8ff', font: { size: 10 } }
        }
      }
    }
  });

  // --- Ports Bar ---
  const ports = d.topPorts.slice(0, 8);
  new Chart(document.getElementById('chartPorts'), {
    type: 'bar',
    data: {
      labels: ports.map(p => 'Port ' + p.port),
      datasets: [{
        label: 'Attacks',
        data: ports.map(p => p.count),
        backgroundColor: 'rgba(191,95,255,0.7)',
        borderColor: 'rgba(191,95,255,1)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,212,255,0.3)',
          borderWidth: 1,
          titleColor: '#00d4ff',
          bodyColor: '#e8f4ff',
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#a07fc0' } },
        y: { grid: { color: 'rgba(180,80,255,0.08)' }, ticks: { color: '#a07fc0' }, beginAtZero: true }
      }
    }
  });

  // --- OS Pie ---
  const osKeys = Object.keys(d.osDist);
  const osVals = Object.values(d.osDist);
  new Chart(document.getElementById('chartOS'), {
    type: 'pie',
    data: {
      labels: osKeys,
      datasets: [{
        data: osVals,
        backgroundColor: PALETTE.slice(0, osKeys.length).map(c => c + 'bb'),
        borderColor: 'rgba(6,20,40,0.8)',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#7fa3c0', padding: 8, usePointStyle: true, pointStyleWidth: 8, font: { size: 10 } }
        },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,255,136,0.3)',
          borderWidth: 1,
          titleColor: '#00ff88',
          bodyColor: '#e8f4ff',
        }
      }
    }
  });

  // --- CVE Severity Donut ---
  const cve = d.cveSeverity;
  new Chart(document.getElementById('chartCVE'), {
    type: 'doughnut',
    data: {
      labels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      datasets: [{
        data: [cve.CRITICAL || 0, cve.HIGH || 0, cve.MEDIUM || 0, cve.LOW || 0],
        backgroundColor: [
          'rgba(248,113,113,0.85)', 'rgba(251,146,60,0.85)',
          'rgba(191,95,255,0.8)', 'rgba(224,64,251,0.75)'
        ],
        borderColor: 'rgba(6,20,40,0.8)',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#7fa3c0', padding: 8, usePointStyle: true, pointStyleWidth: 8, font: { size: 10 } }
        },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(155,89,246,0.3)',
          borderWidth: 1,
          titleColor: '#9b59f6',
          bodyColor: '#e8f4ff',
        }
      }
    }
  });

  // --- Tactics Radar ---
  const tactics = d.tactics.slice(0, 10);
  new Chart(document.getElementById('chartTactics'), {
    type: 'radar',
    data: {
      labels: tactics.map(t => t.name.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')),
      datasets: [{
        label: 'Attack Count',
        data: tactics.map(t => t.count),
        backgroundColor: 'rgba(191,95,255,0.15)',
        borderColor: '#bf5fff',
        pointBackgroundColor: '#e040fb',
        pointBorderColor: 'rgba(13,6,24,0.8)',
        pointHoverBackgroundColor: '#f0abfc',
        borderWidth: 2,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(6,20,40,0.95)',
          borderColor: 'rgba(0,255,136,0.3)',
          borderWidth: 1,
          titleColor: '#00ff88',
          bodyColor: '#e8f4ff',
        }
      },
      scales: {
        r: {
          grid: { color: 'rgba(180,80,255,0.15)' },
          angleLines: { color: 'rgba(180,80,255,0.15)' },
          pointLabels: { color: '#c4b5fd', font: { size: 9 } },
          ticks: { color: 'rgba(0,0,0,0)', backdropColor: 'transparent' },
          beginAtZero: true
        }
      }
    }
  });
}

// ============================================================
// INVESTIGATION TABLE
// ============================================================
let allAttacks = [];
let filteredAttacks = [];

function initInvestigationTable() {
  allAttacks = DASHBOARD_DATA.recentAttacks;
  filteredAttacks = [...allAttacks];

  // Populate country filter
  const countries = [...new Set(allAttacks.map(a => a.country))].filter(c => c && c !== 'Unknown').sort();
  const sel = document.getElementById('filterCountry');
  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });

  renderTable();
}

function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const country = document.getElementById('filterCountry').value;
  const risk = document.getElementById('filterRisk').value;
  const protocol = document.getElementById('filterProtocol').value;

  filteredAttacks = allAttacks.filter(a => {
    const matchSearch = !search ||
      (a.src_ip && a.src_ip.toLowerCase().includes(search)) ||
      (a.technique && a.technique.toLowerCase().includes(search)) ||
      (a.cve && a.cve.toLowerCase().includes(search));
    const matchCountry = !country || a.country === country;
    const matchRisk = !risk || a.risk_level === risk;
    const matchProtocol = !protocol || a.protocol === protocol;
    return matchSearch && matchCountry && matchRisk && matchProtocol;
  });

  renderTable();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterCountry').value = '';
  document.getElementById('filterRisk').value = '';
  document.getElementById('filterProtocol').value = '';
  filteredAttacks = [...allAttacks];
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const count = document.getElementById('resultCount');
  count.textContent = `Showing ${filteredAttacks.length} records`;

  tbody.innerHTML = filteredAttacks.slice(0, 500).map(a => {
    const scoreWidth = Math.min((a.threat_score / 100) * 60, 60);
    const scoreColor = a.threat_score >= 80 ? '#ff3860' : a.threat_score >= 60 ? '#ff9f43' : '#bf5fff';
    return `
      <tr>
        <td>${a.timestamp || '—'}</td>
        <td>${a.src_ip || '—'}</td>
        <td>${a.country || '—'}</td>
        <td><code style="color:#00d4ff">${a.port || '—'}</code></td>
        <td>${a.protocol || '—'}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${a.technique}">${a.technique || '—'}</td>
        <td style="text-transform:capitalize;color:#9b59f6">${(a.tactic || '—').replace(/-/g,' ')}</td>
        <td>
          <div class="score-bar">
            <div class="score-bar-fill" style="width:${scoreWidth}px;background:linear-gradient(90deg,#00ff88,${scoreColor})"></div>
            <span class="score-val" style="color:${scoreColor}">${a.threat_score}</span>
          </div>
        </td>
        <td><span class="badge badge-${a.risk_level}">${a.risk_level || '—'}</span></td>
        <td style="color:#7fa3c0;font-size:0.68rem">${a.cve || '—'}</td>
        <td><span class="badge badge-${a.severity}">${a.severity || '—'}</span></td>
        <td>${a.os || '—'}</td>
      </tr>
    `;
  }).join('');
}
