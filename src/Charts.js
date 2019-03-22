import chartData from '../chart_data';
import Chart from './Chart';

class Charts {
  constructor() {
    this.charts = [];
  }

  dowloadCharts(canvas, canvasMinimap) {
    // this.charts = chartData.map(rawChart => new Chart(canvas, canvasMinimap, rawChart));
    const chart = new Chart(canvas, canvasMinimap, chartData[0]);
    this.charts = [chart];
  }
}

export default new Charts();
