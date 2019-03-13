import chartData from '../chart_data';
import Chart from './Chart';

class Charts {
  constructor() {
    this.charts = [];
  }

  dowloadCharts() {
    this.charts = chartData.map(rawChart => new Chart(rawChart));
  }
}

export default new Charts();
