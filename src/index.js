import './index.css';
import Charts from './Charts';

const drawSeparatorsX = (x, y, count, width) => {
  const path = new Path2D();
  const distance = width / (count - 1);
  const y1 = y - 5;
  const y2 = y + 5;

  for (let i = 0; i < count; i++) {
    const xx = x + (i * distance);
    path.moveTo(xx, y1);
    path.lineTo(xx, y2);
  }

  return path;
};

const canvas = document.getElementById('chart');

const ctx = canvas.getContext('2d');
Charts.dowloadCharts();

const charts = Charts.charts;
const chart = charts[0];

canvas.width = chart.x;
canvas.height = chart.y;

const xCoordPath = new Path2D();

xCoordPath.moveTo(30, chart.y - 30);
xCoordPath.lineTo(chart.x - 30, chart.y - 30);

ctx.stroke(xCoordPath);

ctx.stroke(drawSeparatorsX(30, chart.y - 30, chart.ticks, chart.x - 60));

chart.getChartPaths().forEach(({ path, color }) => {
  ctx.strokeStyle = color;
  ctx.stroke(path);
});

