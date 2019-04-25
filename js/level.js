    class Level extends Drawable
    {
        _size = [1024, 768];
        _bullets = [];
        _players = [];

        _top250Players = [];

        constructor()
        {
            super();

            this.restart();

            window.addEventListener("tick", this.tickEventHandler);
        }

        restart()
        {
            this._bullets = [];
            this._players = [];

            for (let i = 0; i < 25; i++)
            {
                this._bullets.push(new Bullet(this._size[0], this._size[1], Math.random() * 20));
            }

            for (let i = 0; i < 250; i++)
            {
                this._players.push(new Player(i, this));
            }
        }

        getWidth()
        {
            return this._size[0];
        }

        getHeight()
        {
            return this._size[1];
        }

        draw(context, offsetX, offsetY)
        {
            context.rect(offsetX, offsetY, this._size[0], this._size[1]);
            context.stroke();

            //context.fillText("SCORE: " + this._player.getScore(), 500, 10);

            for (let i = 0; i < this._bullets.length; i++)
            {
                this._bullets[i].draw(context, offsetX, offsetY);
            }

            for (let i = 0; i < this._players.length; i++)
            {
                this._players[i].draw(context, offsetX, offsetY);
            }
        }

        allPlayersHit()
        {
            for (let i = 0; i < this._players.length; i++)
            {
                if (!this._players[i]._hit)
                {
                    return false;
                }
            }

            return true;
        }

        getBestPlayer()
        {
            let bestPlayer = this._players[0];

            for (let i = 1; i < this._players.length; i++)
            {
                if (this._players[i].getScore() > bestPlayer.getScore())
                {
                    bestPlayer = this._players[i];
                }
            }

            console.log("Best player with score: " + bestPlayer.getScore(), bestPlayer);
            let bestPlayerWeights = bestPlayer._neuralNetwork.getWeights();

            return bestPlayerWeights;
        }

        tick()
        {
            for (let i = 0; i < this._players.length; i++)
            {
                this._players[i].tick();
            }

            for (let i = 0; i < this._bullets.length; i++)
            {
                this._bullets[i].tick();

                for (let j = 0; j < this._players.length; j++)
                {
                    if (this._players[j]._boundingBox.intersects(this._bullets[i]._boundingBox))
                    {
                        this._players[j].hit();
                    }
                }
            }

            if (this.allPlayersHit())
            {
                if (this._top250Players.length >= 250)
                {
                    for (let i = 0; i < this._top250Players.length; i++)
                    {
                        this._players.push(new Player(i, this));
                        this._players[i]._neuralNetwork.importWeights(this._top250Players[i]);
                    }
                }
                else
                {
                    let bestPlayerWeights = this.getBestPlayer();

                    this._top250Players.push(bestPlayerWeights);

                    console.log("TOP 250 PLAYERS SIZE: " + this._top250Players.length);
                    
                    this.restart();
                }
                /*
                this._bullets = [];
                this._players = [];

                for (let i = 0; i < 25; i++)
                {
                    this._bullets.push(new Bullet(this._size[0], this._size[1], Math.random() * 20));
                }

                this._players.push(new Player(0, this));
                this._players[0]._neuralNetwork.importWeights(bestPlayerWeights);
                */
            }
        }

        tickEventHandler = this.tick.bind(this);
    }