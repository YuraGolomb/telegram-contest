const borderWidth = 3;
const cursors = {
  default: 'default',
  resize: 'w-resize',
  pointer: 'pointer',
};

class Minimap {
  constructor(canvas, width, height, paddingX, minimapYZoom = 0.1) {
    this.canvas = canvas;
    canvas.width = width;
    canvas.height = height * minimapYZoom;

    const BB = canvas.getBoundingClientRect();
    this.canvasLeft = BB.left;
    this.canvasTop = BB.top;

    this.ctx = canvas.getContext('2d');
    this.ctx.scale(1, minimapYZoom);

    this.isMouseDown = false;
    this.target = ''; // 'left-middle', 'right-middle', 'left-right-middle'
    this.mousePosX = 0;
    this.mousePosY = 0;

    this.contentWidth = width - (2 * paddingX);
    this.width = width;
    this.height = height;

    this.paddingX = paddingX;
    this.offsetLeft = paddingX;
    this.offsetRight = width - paddingX;

    this.setChartPaths = this.setChartPaths.bind(this);
    this.drawHidden = this.drawHidden.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.subscribeForZoom = this.subscribeForZoom.bind(this);
    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);


    this.canvas.onmousemove = this.onMouseMove;
    this.canvas.onmousedown = this.onMouseDown;
    this.drawHidden();
  }

  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    const posX = parseInt(e.clientX - this.canvasLeft);
    const posY = parseInt(e.clientY - this.canvasTop);
    this.mousePosX = posX;
    this.mousePosY = posY;
    if (this.ctx.isPointInPath(this.leftBorder, posX, posY)) {
      this.target = 'left-middle';
      document.body.style.cursor = cursors.resize;
      this.isMouseDown = true;
    } else if (this.ctx.isPointInPath(this.rightBorder, posX, posY)) {
      this.target = 'middle-right';
      document.body.style.cursor = cursors.resize;
      this.isMouseDown = true;
    } else if (this.ctx.isPointInPath(this.transparentRect, posX, posY)) {
      this.target = 'left-middle-right';
      document.body.style.cursor = cursors.pointer;
      this.isMouseDown = true;
    } else {
      document.body.style.cursor = cursors.default;
    }

    document.onmousemove = this.onDocumentMouseMove;
    document.onmouseup = this.onDocumentMouseUp;
  }

  onDocumentMouseMove(e) {
    const posX = parseInt(e.clientX - this.canvasLeft);
    if (this.target === 'left-middle') {
      const newOffsetLeft = this.offsetLeft - (this.mousePosX - posX);
      this.setOffsetLeft(newOffsetLeft);
      this.drawMinimap();
      const moveDiff = this.offsetLeft - this.paddingX;
      const perc = (this.offsetRight - this.offsetLeft) / this.contentWidth;
      if (this.zoomCallback) {
        this.zoomCallback(perc, moveDiff);
      }
    } else if (this.target === 'middle-right') {
      const newOffsetRight = this.offsetRight - (this.mousePosX - posX);
      this.setOffsetRight(newOffsetRight);
      this.drawMinimap();
      const perc = (this.offsetRight - this.offsetLeft) / this.contentWidth;
      if (this.zoomCallback) {
        this.zoomCallback(perc);
      }
    } else if (this.target === 'left-middle-right') {
      const newOffsetRight = this.offsetRight - (this.mousePosX - posX);
      const newOffsetLeft = this.offsetLeft - (this.mousePosX - posX);
      if (newOffsetRight > this.width - this.paddingX) {
        if (this.offsetRight < this.width - this.paddingX) {
          const diff = this.offsetRight - (this.width - this.paddingX);
          this.setOffsetRight(this.width - this.paddingX);
          this.setOffsetLeft(this.offsetLeft - diff);
          const moveDiff = this.offsetLeft - this.paddingX;
          if (this.moveCallback) {
            this.moveCallback(moveDiff);
          }
        }
      } else if (newOffsetLeft < this.paddingX) {
        if (this.offsetLeft > this.paddingX) {
          const diff = this.offsetLeft - this.paddingX;
          this.setOffsetLeft(this.paddingX);
          this.setOffsetRight(this.offsetRight - diff);
          const moveDiff = this.offsetLeft - this.paddingX;

          this.moveCallback(moveDiff);
        }
      } else {
        this.setOffsetLeft(newOffsetLeft);
        this.setOffsetRight(newOffsetRight);
        const moveDiff = this.offsetLeft - this.paddingX;
        this.moveCallback(moveDiff);
      }
      this.drawMinimap();
    }
    this.mousePosX = posX;
  }

  setOffsetRight(offset) {
    if (offset > this.width - this.paddingX) this.offsetRight = this.width - this.paddingX;
    else if (offset < this.offsetLeft + 20) this.offsetRight = this.offsetLeft + 20;
    else this.offsetRight = offset;
  }

  setOffsetLeft(offset) {
    if (offset < this.paddingX) this.offsetLeft = this.paddingX;
    else if (offset > this.offsetRight - 20) this.offsetLeft = this.offsetRight - 20;
    else this.offsetLeft = offset;
  }

  subscribeForZoom(zoomCallback) {
    this.zoomCallback = zoomCallback;
  }

  subscriberForMove(moveCallback) {
    this.moveCallback = moveCallback;
  }

  onDocumentMouseUp(e) {
    this.isMouseDown = false;
    this.target = '';
    document.body.style.cursor = cursors.default;
    document.onmousemove = null;
    document.onmouseup = null;
    this.onMouseMove(e);
  }

  onMouseMove(e) {
    if (this.isMouseDown) return;
    e.preventDefault();
    e.stopPropagation();

    const posX = parseInt(e.clientX - this.canvasLeft);
    const posY = parseInt(e.clientY - this.canvasTop);

    if (this.ctx.isPointInPath(this.leftBorder, posX, posY) ||
        this.ctx.isPointInPath(this.rightBorder, posX, posY)) {
      this.canvas.style.cursor = cursors.resize;
    } else if (this.ctx.isPointInPath(this.transparentRect, posX, posY)) {
      this.canvas.style.cursor = cursors.pointer;
    } else {
      this.canvas.style.cursor = cursors.default;
    }
  }

  setChartPaths(chartPaths) {
    this.chartPaths = chartPaths;
  }

  drawMinimap() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.chartPaths.forEach(({ path, color }) => {
      this.ctx.strokeStyle = color;
      this.ctx.stroke(path);
    });
    this.drawHidden();
  }

  drawHidden() {
    this.leftHidden = {
      x1: 0,
      x2: this.offsetLeft,
      y1: 0,
      y2: this.height,
    };

    this.rightHidden = {
      x1: 0,
      x2: this.offsetLeft,
      y1: 0,
      y2: this.height,
    };

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.offsetLeft, this.height);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(this.offsetRight, 0, this.width, this.height);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0)';

    const transparentRect = new Path2D();
    transparentRect.moveTo(this.offsetLeft, 0);
    transparentRect.lineTo(this.offsetRight, 0);
    transparentRect.lineTo(this.offsetRight, this.height);
    transparentRect.lineTo(this.offsetLeft, this.height);
    transparentRect.lineTo(this.offsetLeft, 0);
    this.transparentRect = transparentRect;
    this.ctx.stroke(transparentRect);

    const leftBorder = new Path2D();
    leftBorder.moveTo(this.offsetLeft - borderWidth, 0);
    leftBorder.lineTo(this.offsetLeft + borderWidth, 0);
    leftBorder.lineTo(this.offsetLeft + borderWidth, this.height);
    leftBorder.lineTo(this.offsetLeft - borderWidth, this.height);
    leftBorder.lineTo(this.offsetLeft - borderWidth, 0);
    this.leftBorder = leftBorder;

    const rightBorder = new Path2D();
    rightBorder.moveTo(this.offsetRight - borderWidth, 0);
    rightBorder.lineTo(this.offsetRight + borderWidth, 0);
    rightBorder.lineTo(this.offsetRight + borderWidth, this.height);
    rightBorder.lineTo(this.offsetRight - borderWidth, this.height);
    rightBorder.lineTo(this.offsetRight - borderWidth, 0);
    this.rightBorder = rightBorder;

    this.ctx.stroke(leftBorder);
    this.ctx.stroke(rightBorder);
  }
}


export default Minimap;
