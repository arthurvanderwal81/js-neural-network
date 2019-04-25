    class BoundingBox
    {
        _size = [0.0, 0.0];
        _position = [0.0, 0.0];

        constructor(position, size)
        {
            this._position = position;
            this._size = size;
        }

        updatePosition(position)
        {
            this._position = position;
        }

        intersects(bb)
        {
            let deltaX = Math.abs(bb._position[0] - this._position[0]);
            let deltaY = Math.abs(bb._position[1] - this._position[1]);
            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            let widthSum = bb._size[0] / 2.0 + this._size[0] / 2.0;
            let heightSum = bb._size[1] / 2.0 + this._size[1] / 2.0;

            return distance <= widthSum || distance <= heightSum;
        }
    }