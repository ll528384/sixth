const state = { data: null, barChart: null, lineChart: null };

const loadData = async () => {
  if (window.location.protocol === 'file:') {
    $('#status')
      .text('双击打开无法加载数据(浏览器安全限制)。请在浏览器地址栏访问 http://127.0.0.1:8766/ ，或双击 my-dashboard 目录下的"启动看板.bat"。')
      .show();
    return;
  }
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/books.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：课程统一数据集');
    $('#status').hide();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  const months = data.months;
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">${total}</p>
            <p class="card-text small text-muted">共${months.length}个月累计消费</p>
          </div>
        </div>
      </div>
    `);
  });
};

const renderBarChart = (data) => {
  const chart = echarts.init(document.querySelector('#bar-chart'));
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: data.series.map(s => s.category) },
    grid: { left: 40, right: 16, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: data.months },
    yAxis: { type: 'value', name: '元' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
  state.barChart = chart;
};

// ECharts 不会自动跟随窗口尺寸,需要手动 resize;Chart.js 由 responsive:true 自动处理
// 注意:全页只保留这一个 resize 监听,图表实例统一从 state 里取
window.addEventListener('resize', () => {
  if (state.barChart) state.barChart.resize();
  if (state.lineChart) state.lineChart.resize();
});

let lineChart = null;

const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy();               // 防重复初始化
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.series.map(s => ({
        label: s.category,
        data: s.counts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '借阅趋势（单位：册）' }
      }
    }
  });
};

window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
  // Chart.js响应式默认自动处理，无需手动
});

loadData();
