import tinytime from 'tinytime';
import Minimap from './Minimap';

const parseColumn = rawColumn => ({
  id: rawColumn[0],
  values: rawColumn.slice(1),
});

const timeTemplate = tinytime('MM DD');

class Chart {
  constructor(canvas, canvasMinimap, rawChart, width = 1000, height = 500) {
    this.ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    const columns = rawChart.columns.map(parseColumn);
    columns.forEach((column) => {
      const { min, max } = column.values.reduce((acc, value) => {
        if (acc.min > value) acc.min = value;
        else if (acc.max < value) acc.max = value;
        return acc;
      }, { min: column.values[0], max: column.values[0] });
      column.min = min;
      column.max = max;

      column.type = rawChart.types[column.id];
      if (column.type !== 'x') {
        column.name = rawChart.names[column.id];
        column.color = rawChart.colors[column.id];
      }
    });

    this.heightAnim = {
      isRunning: false,
      from: 0,
      current: 0,
      to: 0,
      step: 1,
    };

    this.lineColumns = columns.filter(column => column.type === 'line');

    this.xColumn = columns.filter(column => column.type === 'x')[0];
    this.xColumn.values = this.xColumn.values.map(v => timeTemplate.render(new Date(v)));

    this.ticks = this.xColumn.values.length - 1;

    this.width = width;
    this.height = height;
    this.getChartPaths = this.getChartPaths.bind(this);
    this.scale = this.scale.bind(this);
    this.move = this.move.bind(this);

    this.xzoom = 1;
    this.scrollx = 0;
    this.getChartPaths();
    this.minimap = new Minimap(canvasMinimap, this.width, this.height, 0.1);
    this.minimap.setChartPaths(this.chartPaths);
    this.minimap.drawMinimap();
    this.minimap.subscribeForZoom(this.scale);
    this.minimap.subscriberForMove(this.move);
    this.drawChart();
  }

  getPeak(from = 0, count, part) {
    let max = -Infinity;
    const to = Math.ceil(from + count + part);
    for (let i = from; i <= to; i++) {
      for (let j = 0; j < this.lineColumns.length; j++) {
        if (this.lineColumns[j].values[i] > max) max = this.lineColumns[j].values[i];
      }
    }

    // for (let j = 0; j < this.lineColumns.length -1; j++) {

    //   const height = (this.lineColumns[j].values[to] - this.lineColumns[j].values[to - 1]) * part + this.lineColumns[j].values[to - 1];
    //   console.log(this.lineColumns[j].values[to - 1], this.lineColumns[j].values[to])
    //   console.log(part, height, max)
    //   console.log('=-=-=-=-=-=-=-=-=-=-=-')
    //   if (height > max) max = height;
    // }
    return max;
  }

  updatePeak(peak) {
    let newPeak;
    if (peak === this.heightAnim.from) {
      if (peak < this.heightAnim.to) {
        newPeak = peak + this.heightAnim.step;
        if (newPeak >= this.heightAnim.to) {
          this.heightAnim.isRunning = false;
          this.heightAnim.from = newPeak;
        }
        this.heightAnim.current = newPeak;
      } else {
        this.heightAnim.isRunning = false;
      }
    }
  }


  getChartPaths() {
    const paths = [];
    const offsetLeft = this.scrollx * this.xzoom;
    const countOfTicks = this.ticks / this.xzoom;
    const distanceX = this.width / countOfTicks;
    const ticksToSkip = Math.floor(offsetLeft / distanceX);
    const peak = this.getPeak(ticksToSkip, countOfTicks, (((offsetLeft / distanceX)%1)));
    const distanceY = this.height / peak;
    this.updatePeak(peak);

    for (let columnIndex = 0; columnIndex < this.lineColumns.length; columnIndex++) {
      const path = new Path2D();
      const column = this.lineColumns[columnIndex];

      path.moveTo(0, this.height - (column.values[0] * distanceY));
      for (let i = 1; i <= this.ticks; i++) {
        const x = i * distanceX;
        const y = this.height - (column.values[i] * distanceY);
        path.lineTo(x, y);
      }
      paths.push({ path, color: column.color });
    }
    this.chartPaths = paths;
    return paths;
  }

  drawChart() {
    this.ctx.clearRect(0, 0, this.width * this.xzoom, this.height);
    this.chartPaths.forEach(({ path, color }) => {
      this.ctx.strokeStyle = color;
      this.ctx.stroke(path);
    });
  }

  scale(xzoom, scrollx) {
    if (scrollx || scrollx === 0) {
      this.scrollx = scrollx;
    }
    this.xzoom = xzoom;
    this.ctx.clearRect(0, 0, this.width * xzoom, this.height);
    this.ctx.setTransform(1, 0, 0, 1, -scrollx * this.xzoom, 0);
    this.getChartPaths();
    this.drawChart();
  }

  move(scrollx) {
    this.scrollx = scrollx;
    this.ctx.setTransform(1, 0, 0, 1, -scrollx * this.xzoom, 0);
    this.getChartPaths();
    this.drawChart();
  }
}


export default Chart;
