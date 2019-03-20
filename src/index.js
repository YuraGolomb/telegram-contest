import './index.css';
import Charts from './Charts';
import Minimap from './Minimap';

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
const canvasMinimap = document.getElementById('chart-minimap');
const minimapYZoom = 0.1;


const ctx = canvas.getContext('2d');
Charts.dowloadCharts();
ctx.lineJoin = 'round';
const charts = Charts.charts;
const chart = charts[0];

canvas.width = chart.width;
canvas.height = chart.height;
const minimap = new Minimap(canvasMinimap, chart.width, chart.height, chart.paddingX, minimapYZoom);


const xCoordPath = new Path2D();

// xCoordPath.moveTo(chart.paddingX, chart.height - chart.paddingY);
// xCoordPath.lineTo(chart.width - chart.paddingX, chart.height - chart.paddingY);

// ctx.stroke(xCoordPath);

// ctx.stroke(drawSeparatorsX(chart.paddingX, chart.height - chart.paddingY, chart.ticks, chart.contentWidth));
const chartPaths = chart.getChartPaths();
chartPaths.forEach(({ path, color }) => {
  ctx.strokeStyle = color;
  ctx.stroke(path);
});

let gxzoom = 1;
let gScrollX = 0;

const scale = function(xzoom, scrollX) {
  if (scrollX || scrollX === 0) {
    gScrollX = scrollX;
  }
  gxzoom = xzoom;
  ctx.setTransform(1 / xzoom, 0, 0, 1, -gScrollX / gxzoom, 0); // clear scale
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // xCoordPath.moveTo(chart.paddingX, chart.height - chart.paddingY);
  // xCoordPath.lineTo(chart.width - chart.paddingX, chart.height - chart.paddingY);
  // ctx.stroke(xCoordPath);

  // ctx.stroke(drawSeparatorsX(chart.paddingX, chart.height - chart.paddingY, chart.ticks, chart.contentWidth));
  chartPaths.forEach(({ path, color }) => {
    ctx.strokeStyle = color;
    ctx.stroke(path);
  });
};

const move = function(scrollX) {
  gScrollX = scrollX;
  ctx.setTransform(1 / gxzoom, 0, 0, 1, -scrollX / gxzoom, 0); // clear scale
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // xCoordPath.moveTo(chart.paddingX, chart.height - chart.paddingY);
  // xCoordPath.lineTo(chart.width - chart.paddingX, chart.height - chart.paddingY);

  // ctx.stroke(xCoordPath);

  // ctx.stroke(drawSeparatorsX(chart.paddingX, chart.height - chart.paddingY, chart.ticks, chart.contentWidth));
  chartPaths.forEach(({ path, color }) => {
    ctx.strokeStyle = color;
    ctx.stroke(path);
  });
}

minimap.setChartPaths(chartPaths);
minimap.drawMinimap();
minimap.subscribeForZoom(scale);
minimap.subscriberForMove(move);
