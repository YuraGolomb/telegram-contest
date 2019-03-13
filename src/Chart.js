import tinytime from 'tinytime';

const parseColumn = rawColumn => ({
  id: rawColumn[0],
  values: rawColumn.slice(1),
});

const timeTemplate = tinytime('MM DD');

class Chart {
  constructor(rawChart, x = 1000, y = 500) {
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

    this.lineColumns = columns.filter(column => column.type === 'line');

    this.xColumn = columns.filter(column => column.type === 'x')[0];
    this.xColumn.values = this.xColumn.values.map(v => timeTemplate.render(new Date(v)));

    this.ticks = this.xColumn.values.length;

    this.x = x;
    this.y = y;
    this.getChartPaths = this.getChartPaths.bind(this);
  }

  getChartPaths(offsetX = 30, offsetY = 30, width = 940, height = 440) {
    const paths = [];
    for (let columnIndex = 0; columnIndex < this.lineColumns.length; columnIndex++) {
      const path = new Path2D();
      const column = this.lineColumns[columnIndex];
      const distanceX = width / column.values.length;
      const distanceY = height / (column.max - column.min);
      path.moveTo(offsetX, (height + (offsetY * 2)) - (column.values[0] * distanceY));
      for (let i = 1; i < column.values.length; i++) {
        path.lineTo(offsetX + (i * distanceX), (height + (offsetY * 2)) - (column.values[i] * distanceY));
      }
      paths.push({ path, color: column.color });
    }
    return paths;
  }
}


export default Chart;
