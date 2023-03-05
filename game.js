window.addEventListener('load',function(){
    const canvas=document.getElementById('canvas1');
    const ctx=canvas.getContext('2d');
    canvas.width=1280;
    canvas.height=720;

    ctx.fillStyle='white';
    ctx.lineWidth=3;
    ctx.strokeStyle='black';
    ctx.font='40px Helvatica'

    class Player{
        constructor(game){
            this.game=game;
            this.CollisionX=this.game.width*0.5;
            this.CollisionY=this.game.height*0.5;
            this.CollisionRadius=30;
            this.speedX=0;
            this.speedY=0;
            this.dx=0;
            this.dy=0;
            this.speedModifier=3;
            this.spriteWidth=255;
            this.spriteHeight=256;
            this.width=this.spriteWidth;
            this.height=this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX=0;
            this.frameY=0;
            this.image=document.getElementById('bull');

        }
        draw(context){
            context.drawImage(this.image,this.frameX*this.spriteWidth,this.frameY*this.spriteHeight,this.spriteWidth,this.spriteHeight,this.spriteX,this.spriteY, this.width,this.height);
            if(this.game.debug){
            context.beginPath();
            context.arc(this.CollisionX,this.CollisionY,this.CollisionRadius,0,Math.PI*2);
            context.save();
            context.globalAlpha=0.5;
            context.fill();
            context.restore();
            context.stroke();
            context.beginPath();
            context.moveTo(this.CollisionX,this.CollisionY);
            context.lineTo(this.game.mouse.x,this.game.mouse.y);
            context.stroke();
            }
            
        }
        update(){
            this.dx=this.game.mouse.x-this.CollisionX;
            this.dy=this.game.mouse.y-this.CollisionY;
            const angle=Math.atan2(this.dy,this.dx);
            if(angle<-2.74 || angle>2.74) this.frameY=6;
            else if(angle<-1.17) this.frameY=0;
            else if(angle<-0.39) this.frameY=1;
            else if(angle<0.39) this.frameY=2;
            else if(angle<1.17) this.frameY=3;
            else if(angle<1.96) this.frameY=4;
            else if(angle<2.74) this.frameY=5;
            else if(angle<-1.96) this.frameY=7;
            const distance=Math.hypot(this.dy,this.dx);
            if(distance>this.speedModifier){
                this.speedX=(this.dx)/distance || 0;
                this.speedY=(this.dy)/distance || 0;
            }
            else{
                this.speedX=0;
                this.speedY=0;
            }
            this.CollisionX+=this.speedX*this.speedModifier;
            this.CollisionY+=this.speedY*this.speedModifier;
            this.spriteX=this.CollisionX-this.width*0.5;
            this.spriteY=this.CollisionY-this.height*0.5-100;
            
            if(this.CollisionX<this.CollisionRadius){
                this.CollisionX=this.CollisionRadius;
            }
            else if(this.CollisionX>this.game.width-this.CollisionRadius){
                this.CollisionX=this.game.width-this.CollisionRadius;
            }

            if(this.CollisionY<this.game.topMargin+this.CollisionRadius){
                this.CollisionY=this.game.topMargin+this.CollisionRadius;
            }
            else if(this.CollisionY>this.game.height-this.CollisionRadius){
                this.CollisionY=this.game.height-this.CollisionRadius;
            }

            this.game.obstacles.forEach(obstacle=>{
                let [collision,distance,sumOfRadii,dx,dy]=this.game.checkCollision(this,obstacle);
                if(collision){
                    const unit_x=dx/distance;
                    const unit_y=dy/distance;
                    this.CollisionX=obstacle.CollisionX+(sumOfRadii+1)*unit_x;
                    this.CollisionY=obstacle.CollisionY+(sumOfRadii+1)*unit_y;
                }
            })
        }
    }

    class Obstacle{
        constructor(game){
            this.game=game;
            this.CollisionX=Math.random()*this.game.width;
            this.CollisionY=Math.random()*this.game.height;
            this.CollisionRadius=50;
            this.image=document.getElementById('obstacles');
            this.spriteWidth=250;
            this.spriteHeight=250;
            this.width=this.spriteWidth;
            this.height=this.spriteHeight;
            this.spriteX=this.CollisionX-this.width*0.5;
            this.spriteY=this.CollisionY-this.height*0.5-70;
            this.frameX=Math.floor(Math.random()*4);
            this.frameY=Math.floor(Math.random()*3);
        }
        draw(context){
            context.drawImage(this.image,this.frameX*this.spriteWidth,this.frameY*this.spriteHeight,this.spriteWidth, this.spriteHeight, this.spriteX,this.spriteY,this.width,this.height);
            if(this.game.debug){
                context.beginPath();
                context.arc(this.CollisionX,this.CollisionY,this.CollisionRadius,0,Math.PI*2);
                context.save();
                context.globalAlpha=0.5;
                context.fill();
                context.restore();
                context.stroke();
            }  
        }
        update(){

        }
    }
    class Egg{
        constructor(game){
            this.game=game;
            this.CollisionRadius=40;
            this.margin=this.CollisionRadius*2;
            this.CollisionX=this.margin+(Math.random()*(this.game.width-this.margin*2));
            this.CollisionY=this.game.topMargin+(Math.random()*(this.game.height-this.game.topMargin-this.margin));  
            this.img=document.getElementById('egg');
            this.spriteWidth=110;
            this.spriteHeight=135;
            this.width=this.spriteWidth;
            this.height=this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.hatchTimer=0;
            this.hatchInterval=5000;
            this.markedForDeletion=false;
        }
        draw(context){
            context.drawImage(this.img,this.spriteX,this.spriteY);
            if(this.game.debug){
                context.beginPath();
                context.arc(this.CollisionX,this.CollisionY,this.CollisionRadius,0,Math.PI*2);
                context.save();
                context.globalAlpha=0.5;
                context.fill();
                context.restore();
                context.stroke();
            }  
        }
        update(deltaTime){
            this.spriteX=this.CollisionX-this.width*0.5;
            this.spriteY=this.CollisionY-this.height*0.5-30;
            let collisionObject=[this.game.player,...this.game.obstacles,...this.game.enemies]; 
            collisionObject.forEach(object=>{
                let[collision,distance,sumOfRadii,dx,dy]=this.game.checkCollision(this,object);
                if(collision){
                    const unit_x=dx/distance;
                    const unit_y=dy/distance;
                    this.CollisionX=object.CollisionX+(sumOfRadii+1)*unit_x;
                    this.CollisionY=object.CollisionY+(sumOfRadii+1)*unit_y;
                }
            });
            if(this.hatchTimer>this.hatchInterval){
                this.game.hatchlings.push(new Larva(this.game,this.CollisionX,this.CollisionY));
                this.markedForDeletion=true;
                this.game.removeGameObjects()
            }
            else{
                this.hatchTimer+=deltaTime;
            }
        }
    }
    class Larva{
        constructor(game,x,y){
            this.game=game;
            this.CollisionX=x;
            this.CollisionY=y;
            this.CollisionRadius=30;
            this.img=document.getElementById('larva');
            this.spriteWidth=150;
            this.spriteHeight=150;
            this.width=this.spriteWidth;
            this.height=this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY=1+Math.random();
            this.frameX=0;
            this.frameY=Math.floor(Math.random()*2);
        }
        draw(context){
            context.drawImage(this.img,this.frameX*this.spriteWidth,this.frameY*this.spriteHeight,this.spriteWidth,this.spriteHeight,this.spriteX,this.spriteY,this.width,this.height);
            if(this.game.debug){
                context.beginPath();
                context.arc(this.CollisionX,this.CollisionY,this.CollisionRadius,0,Math.PI*2);
                context.save();
                context.globalAlpha=0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }
        update(){
            this.CollisionY-=this.speedY;
            this.spriteX=this.CollisionX-this.width*0.5;
            this.spriteY=this.CollisionY-this.height*0.5-50;

            if(this.CollisionY<this.game.topMargin){
                this.markedForDeletion=true;
                this.game.removeGameObjects();
                this.game.score++;
                for(let i=0;i<3;i++){
                    this.game.particles.push(new Spark(this.game,this.CollisionX,this.CollisionY,'yellow'));
                }
                
            }
            let collisionObject=[this.game.player,...this.game.obstacles]; 
            collisionObject.forEach(object=>{
                let[collision,distance,sumOfRadii,dx,dy]=this.game.checkCollision(this,object);
                if(collision){
                    const unit_x=dx/distance;
                    const unit_y=dy/distance;
                    this.CollisionX=object.CollisionX+(sumOfRadii+1)*unit_x;
                    this.CollisionY=object.CollisionY+(sumOfRadii+1)*unit_y;
                }
            });
            this.game.enemies.forEach(enemy=>{
                if(this.game.checkCollision(this,enemy)[0]){
                    this.markedForDeletion=true;
                    this.game.removeGameObjects();
                    this.game.lostHatchlings++;
                    for(let i=0;i<3;i++){
                        this.game.particles.push(new Spark(this.game,this.CollisionX,this.CollisionY,'blue'));
                    }
                }
            });
        }
    }
    class Enemy{
        constructor(game){
            this.game=game;
            this.CollisionRadius=30;
            this.speedX=Math.random()*3+0.5;
            this.img=document.getElementById('toads');
            this.spriteWidth=140;
            this.spriteHeight=260;
            this.width=this.spriteWidth;
            this.height=this.spriteHeight;
            this.CollisionX=this.game.width+this.width+Math.random()*this.game.width*0.5;
            this.CollisionY=this.game.topMargin+(Math.random()*(this.game.height)-this.game.topMargin);
            this.spriteX;
            this.spriteY;
            this.frameX=0;
            this.frameY=Math.floor(Math.random()*4);
        }
        draw(context){
            context.drawImage(this.img,this.frameX*this.spriteWidth,this.frameY*this.spriteHeight,this.spriteWidth,this.spriteHeight,this.spriteX,this.spriteY,this.width,this.height);
            if(this.game.debug){
                context.beginPath();
                context.arc(this.CollisionX,this.CollisionY,this.CollisionRadius,0,Math.PI*2);
                context.save();
                context.globalAlpha=0.5;
                context.fill();
                context.restore();
                context.stroke();
            }  
        }
        update(){
            this.spriteX=this.CollisionX-this.width*0.5;
            this.spriteY=this.CollisionY-this.height*0.5+40;
            this.CollisionX-=this.speedX;
            if(this.spriteX+this.width<0){
                this.CollisionX=this.game.width+this.width+Math.random()*this.game.width*0.5;
                this.CollisionY=this.game.topMargin+(Math.random()*(this.game.height)-this.game.topMargin);
                this.frameY=Math.floor(Math.random()*4);
            }
            let collisionObject=[this.game.player,...this.game.obstacles]; 
            collisionObject.forEach(object=>{
                let[collision,distance,sumOfRadii,dx,dy]=this.game.checkCollision(this,object);
                if(collision){
                    const unit_x=dx/distance;
                    const unit_y=dy/distance;
                    this.CollisionX=object.CollisionX+(sumOfRadii+1)*unit_x;
                    this.CollisionY=object.CollisionY+(sumOfRadii+1)*unit_y;
                }
            });
        }
    }
    class Particle{
        constructor(game,x,y,color){
            this.game=game;
            this.CollisionX=x;
            this.CollisionY=y;
            this.color=color;
            this.radius=Math.floor(Math.random()*10+5);
            this.speedX=Math.random()*6-3;
            this.speedY=Math.random()*2+0.5;
            this.angle=0;
            this.va=Math.random()*0.1+0.01;
            this.markedForDeletion=false;

        }
        draw(context){
            context.save();
            context.fillStyle=this.color;
            context.beginPath();
            context.arc(this.CollisionX,this.CollisionY,this.radius,0,Math.PI*2);
            context.fill();
            context.stroke();
            context.restore();
        }
    }
    class Firefly extends Particle{
        update(){
            this.angle+=this.va;
            this.CollisionX+=Math.cos(this.angle)*this.speedX;
            this.CollisionY-=this.speedY;
            if(this.CollisionY<0 - this.radius){
                this.markedForDeletion=true;
                this.game.removeGameObjects();
            }
        }

    }
    class Spark extends Particle{
        update(){
            this.angle+=this.va*0.5;
            this.CollisionX-=Math.cos(this.angle)*this.speedX;
            this.CollisionY-=Math.sin(this.angle)*this.speedY;
            if(this.radius>0.1){
                this.radius-=0.05;
            }
            if(this.radius<0.2){
                this.markedForDeletion=true;
                this.game.removeGameObjects();
            }
        }
    }

    class Game{
        constructor(canvas){
            this.canvas=canvas;
            this.width=this.canvas.width;
            this.height=this.canvas.height;
            this.topMargin=260;
            this.debug=false;
            this.eggs=[];
            this.gameObjects=[];
            this.maxEggs=10;
            this.eggTimer=0;
            this.eggInterval=2000;
            this.hatchlings=[];
            this.enemies=[];
            this.fps=70;
            this.timer=0;
            this.score=0;
            this.lostHatchlings=0;
            this.winningScore=20;
            this.particles=[];
            this.interval=1000/this.fps;
            this.player=new Player(this);
            this.gameOver=false;
            this.numberOfObstacles=10;
            this.obstacles=[];
            this.mouse={
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false

            }

            canvas.addEventListener('mousedown',(e)=>{
                this.mouse.x=e.offsetX;
                this.mouse.y=e.offsetY;

                this.mouse.pressed=true;
            })
            canvas.addEventListener('mouseup',(e)=>{
                this.mouse.x=e.offsetX;
                this.mouse.y=e.offsetY;
                this.mouse.pressed=false;
            })
            canvas.addEventListener('mousemove',(e)=>{
                if(this.mouse.pressed){
                    this.mouse.x=e.offsetX;
                    this.mouse.y=e.offsetY;
                }
            })
            window.addEventListener('keydown', e=>{
                if(e.key=='d'){
                    this.debug= !this.debug;
                } 
                
            })                
        }
        render(context,deltaTime){
            if(this.timer>this.interval){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                this.gameObjects=[...this.eggs,...this.obstacles,this.player,...this.enemies,...this.hatchlings,...this.particles];
                this.gameObjects.sort((a,b)=>{
                    return a.CollisionY-b.CollisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime);
                });
                
                this.timer=0;
            }
            this.timer+=deltaTime;
            if(this.eggTimer>this.eggInterval && this.eggs.length<this.maxEggs){
                this.addEgg();
                this.eggTimer=0;
            }
            else{
                this.eggTimer+=deltaTime;
            }
            context.save();
            context.textAlign='left';
            context.fillText('Score:'+ this.score,25,50);
            
            context.fillText('Lost:'+ this.lostHatchlings,25,100);
            
            context.restore();

            if(this.score>=this.winningScore){
                this.gameOver=true;
                context.save();
                context.fillStyle='rgba(0,0,0,0.5)';
                context.fillRect(0,0,this.width,this.height);
                context.fillStyle='white';
                context.textAlign='center';
                let message1;
                let message2;
                if(this.lostHatchlings<=2){
                    message1='BullesEye!!!!'
                    message2="Win"
                }
                else{
                    message1="You Lose";
                    message2="Try Again Later";
                }
                context.font="130px Helvetica";
                context.fillText(message1,this.width*0.5,this.height*0.5-20);
                context.font="40px Helvetica";
                context.fillText(message2,this.width*0.5,this.height*0.5+30);
                context.fillText("Final Score: "+this.score+"Press R to start again//",this.width*0.5,this.height*0.5+80);
                context.restore();
            }
        }

        checkCollision(a,b){
            const dx=a.CollisionX-b.CollisionX;
            const dy=a.CollisionY-b.CollisionY;
            const distance=Math.hypot(dy,dx);
            const sumOfRadii=a.CollisionRadius+b.CollisionRadius;
            return [(distance<sumOfRadii),distance,sumOfRadii,dx,dy];
        }
        addEnemy(){
            this.enemies.push(new Enemy(this));
        }
        addEgg(){
            this.eggs.push(new Egg(this));
        }
        removeGameObjects(){
            this.eggs=this.eggs.filter(object => !object.markedForDeletion);
            this.hatchlings=this.hatchlings.filter(object => !object.markedForDeletion);
            this.particles=this.particles.filter(object => !object.markedForDeletion);
        }
        init(){
            for(let i=0;i<3;i++){
                this.addEnemy();
            }
            let attempts=0;
            while(this.obstacles.length<this.numberOfObstacles && attempts<500){
                let testObstacle=new Obstacle(this);
                let overlap=false;
                this.obstacles.forEach(obstacle=>{
                    const dx=testObstacle.CollisionX-obstacle.CollisionX;
                    const dy=testObstacle.CollisionY-obstacle.CollisionY;
                    const distance=Math.hypot(dy,dx);
                    const distanceBuffer=150;
                    const sumOfRadii=testObstacle.CollisionRadius+obstacle.CollisionRadius+distanceBuffer;
                    if(distance<sumOfRadii){
                        overlap=true;
                    }
                });
                const margin=testObstacle.CollisionRadius*3;
                if(!overlap && testObstacle.spriteX>0 && testObstacle.spriteX<this.width-testObstacle.width && testObstacle.CollisionY>this.topMargin+margin && testObstacle.CollisionY<this.height){
                    this.obstacles.push(testObstacle);
                }
                attempts++;
                
            }
        }
    }

    const game=new Game(canvas);
    game.init();
    console.log(game);
    
    let lastTime=0;
    function animate(timeStamp){
        const deltaTime=timeStamp-lastTime;
        lastTime=timeStamp;
        
        game.render(ctx,deltaTime);
        if(!game.gameOver) requestAnimationFrame(animate);
        
    }
    animate(0);
});