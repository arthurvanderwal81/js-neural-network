    class Bullet extends Drawable
    {
        _levelWidth = -1;
        _levelHeight = -1;

        _position = [0.0, 0.0];
        _size = [5.0, 5.0];
        _speed = 10.0;

        _fillStyle = `rgb(${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())}, ${Math.floor(255 * Math.random())})`;

        _boundingBox;

        constructor(levelWidth, levelHeight, speed)
        {
            super();

            this._levelWidth = levelWidth;
            this._levelHeight = levelHeight;
            this._speed = speed;

            this._boundingBox = new BoundingBox(this._position, this._size);

            this.resetPosition();

            //window.addEventListener("tick", this.tickEventHandler);
        }

        resetPosition()
        {
            this._position = [this._levelWidth, Math.random() * this._levelHeight];
        }

        draw(context, offsetX, offsetY)
        {
            context.fillStyle = this._fillStyle;
            context.fillRect(this._position[0] - 0.5 * this._size[0], this._position[1] - 0.5 * this._size[1], this._size[0], this._size[1]);
            context.stroke();
        }

        tick()
        {
            this._position[0] -= this._speed;

            if (this._position[0] < 0.0)
            {
                this.resetPosition();
            }

            this._boundingBox.updatePosition(this._position);
        }

        tickEventHandler = this.tick.bind(this);
    }