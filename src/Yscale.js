const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};


class Yscale {
  constructor(height, width) {
    const chartContainer = document.getElementById('chart-container');
    const base = document.createElement('div');
    base.style.position = 'absolute';
    base.style.top = 0;
    base.style.left = 0;
    base.style.width = '100%';
    base.style.height = '100%';
    this.textSize = 14;
    this.base = base;
    this.oldBase = null;
    this.height = height;
    this.width = width;
    this.widthStr = `${width}px`;
    this.heightTick = height / 5;
    this.currentTicks = [];
    this.previousTicks = [];
    chartContainer.append(base);
    this.generateTicks = throttle(this.generateTicks, 1000);
  }

  removeElem(elem) {
    elem.style.transition = '1s';
    const topStr = elem.style.top;
    const topNum = +topStr.slice(0, topStr.length - 2)
    elem.style.top = `${topNum + this.heightTick / 2}px`;
    elem.style.opacity = 0.2;
    setTimeout(() => elem.remove(), 1000);
  }

  removeBase() {
    if (!this.oldBase) return;
    this.oldBase.style.opacity = '1s';
    this.oldBase.style.top = `${this.height}px`;
  }

  generateTicks(peak) {
    if (!peak) return;
    this.previousTicks = this.currentTicks;//.forEach(el => removeElem(el));
    if (this.currentTicks[0] && this.currentTicks[0].textContent === String(Math.round(peak))) {
      return ;
    }
    this.previousTicks.forEach(el => this.removeElem(el));
    this.peak = peak;
    this.currentTicks = [];
    this.createTickElem({
      text: String(Math.round(this.peak)),
      marginTop: '0px',
    });
    for (let i = 0; i < 5; i++) {
      const j = 5 - i;
      this.createTickElem({
        text: String(Math.round((this.peak / 5) * i)),
        marginTop: `${(this.heightTick) * j}px`,
      });
    }
  }

  createTickElem({ text, marginTop }) {
    const tick = document.createElement('div');
    tick.style.position = 'absolute';
    tick.style.top = marginTop;
    tick.style.width = this.widthStr;
    const tickText = document.createElement('div');
    tickText.textContent = text;
    tickText.style.color = 'gray';
    tickText.style.lineHeight = '14px';
    tickText.style.fontSize = '14px';
    tick.append(tickText);
    const tickLine = document.createElement('div');
    tickLine.style.height = '1px';
    tickLine.style.width = '100%';
    tickLine.style.backgroundColor = 'rgba(128, 128, 128, 0.18)';
    tick.append(tickLine);
    this.base.append(tick);
    this.currentTicks.push(tick);
  }
}

export default Yscale;
