

function program() {
    
    title("TBFCS Workspace");
    size(800, 600);
    
    // All code goes here
	// All code goes here
/**
*
* Menu
* 	Graphic
* 	Buttons
* 	Character Design (shared with game)
* How
* 	Buttons
* 	How graphic
* 	Instructions
* Game
*   Graphics
* 		Assets
* 			Tanks
* 				Player Tanks
* 				Enemy Tanks
* 			Base
* 				Design
* 				Integration with Background?
* 			Bullets/Weapons
* 				Bullets	
* 				Arrows
* 				Guns (or part of tanks?)	
* 		Backgrounds
* 			Terrian
* 			Paths
* 			Rivers
* 			Base (perhaps asset, listed there too)
*   Game Dev
*		Player Class
* 		Enemy Class
* 		Enviorment Parent Class (perhaps abstract)
* 
* 
* 
* 
*/

// setup
noStroke();
textAlign(CENTER, CENTER);
textFont(createFont("calibri"));
var clicked = false;
var scene = "load";
var currLvl = 0;
var highScore = 0;
let input = [];

mouseClicked = function() {
	clicked = true;
}

const img = {
    "tank1": function() {
        background(0, 0);
        fill(100, 40, 40);
        rect(10, 0, 40, 40);
        fill(0);
        rect(0, 15, 10, 10);
        return get(0, 0, 100, 100);
    },
    "tank2": function() {
        background(0, 0);
        fill(40, 100, 40);
        rect(10, 0, 40, 40);
        fill(0);
        rect(0, 15, 10, 10);
        return get(0, 0, 100, 100);
    },
    "tank3": function() {
        background(0, 0);
        fill(40, 40, 100);
        rect(10, 0, 40, 40);
        fill(0);
        rect(0, 15, 10, 10);
        return get(0, 0, 100, 100);
    },
    "cannon": function() {
        background(0, 0);
        fill(0);
        ellipse(15, 15, 15, 15);
        rect(15, 7.5, 30, 15);
        ellipse(45, 15, 15, 15);
        return get(0, 0, 100, 100);
    }
}


/* @Description: global rectangle to recentagle collisions
* @param {integer} rect1 - the first rectangle of the collision
* @param {integer} rect2 - the second rectange of the collision
*/
function rectToRectCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w && 
            rect1.x > rect2.x - rect1.w &&
            rect1.y < rect2.y + rect2.h && 
            rect1.y > rect2.y - rect1.h;

}

class Bullet {
    constructor(x, y, w, h, damage, velocity) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.damage = damage;
        this.velocity = velocity;
    }
    display() {
        fill(205);
        ellipse(this.x, this.y, this.w, this.h);
    }
}

class Cannonball extends Bullet {
    constructor(x, y, w, h, damage, velocity, direction) {
        super(x, y, w, h, damage, velocity);
        this.z = 7; // I actually need to check the height oh dear LOL. Units in feet.
        this.initalYVelocity = 700; // might make this a parameter later, let's just do real physics for cannons lol
        this.gravityAcceleration = 32; // ft/s constant
        this.direction = /*direction ?? */ "left";
        this.t = 0;
        this.theta = 45;
        this.smokeParticles = this.createSmokeParticles();
        this.explosionParticles = [];
    }
    createSmokeParticles() {
        let toReturn = [];
        for (let i = 0; i < 12; i++) {
            toReturn.push(new Particle(this.x, this.y, random(5, 12), random(0.4, 1.4),
                {
                    red: random(230, 255),
                    green: random(200, 255), 
                    blue: random(210, 255),
                },
                300));
        }
        return toReturn;
    }
    createExplosionParticles() {
        // this creates them at the currentX and Y, where I need them to be created at, rather than the initial x and Y
        this.explosionParticles.push(new Particle(this.x, this.y, 2, 3,
            {
                red: 240,
                green: 35, 
                blue: 30,
            },
            300));
        this.explosionParticles.push(new Particle(this.x, this.y, 2, 2,
            {
                red: 240,
                green: 23, 
                blue: 23,
            },
            300));
        
        // me realizing a for loop is the way to go here
        for (let i = 0; i < 13; i++) {
            this.explosionParticles.push(new Particle(this.x, this.y, random(5, 12), random(0.5, 1.5),
                {
                    red: 0,
                    green: 0, 
                    blue: 0,
                },
                random(200, 400)));
        }
        this.explosionParticles.push(new Particle(this.x, this.y, 2, 2,
            {
                red: 122,
                green: 125, 
                blue: 145,
            },
            300));
    }
    display() {
        fill(0);
        ellipse(this.x, this.y, this.w * 2, this.h * 2);
    }
    update() {
        switch (this.direction) {
            case "left":
                this.x -= this.velocity;
                break;
            case "right":
                this.x += this.velocity;
                break;
            case "up":
                this.y -= this.velocity;
                break;
            case "down":
                this.y += this.velocity;
                break;
        }
        for (let i = 0; i < this.smokeParticles.length; i++) {
            let currParticle = this.smokeParticles[i];
            if (currParticle.transparency > 0) {
                currParticle.run();
                currParticle.y -= random(-1, 3.75);
                currParticle.x += random(-1.5, 1.5);
            }
        }
        // z = v0sin(theta) - 1/2gt^2 from wikipedia lol I kind of forgot
        this.z = this.initalYVelocity * this.t * 0.707 - (0.5 * this.gravityAcceleration * (this.t * this.t));
        if (this.z < 0) {
            // shoot out particles, so set z below so collisions stop running (cannot splice so particles still run)
            this.z = -7;
            this.w = 0;
            this.h = 0;
            // I forgot to do this and wondered why I did not work skull
            if (this.explosionParticles.length === 0) {
                this.createExplosionParticles();
            }
            for (let i = 0; i < this.explosionParticles.length; i++) {
                let currParticle = this.explosionParticles[i];
                if (currParticle.transparency > 0) {               
                    currParticle.run();
                }
            }
            
            // once timer done set this.t back to 0 for next cannonball
        } else {
            this.t++;
        }
    }
}

class Tank {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Cannon {
    constructor(x, y, w, h, appearance) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.appearance = appearance;
        this.cannonballs = [];
        this.firing = true; // hard coded to true until we have enemies
        this.reloadTimer = 0;
    }
    display() {
        image(img[this.appearance], this.x, this.y);
    }
    load(amount) {
        for (let i = 0; i < amount; i++) {
            this.cannonballs.push(new Cannonball(this.x, this.y, 8, 8, 20, 25, "left"))
        }
        
    }
    fire() {
        if (this.firing && this.reloadTimer <= 0) {
            this.cannonballs.push(new Cannonball(this.x, this.y, 5, 5, 20, 10, "left"));
            this.reloadTimer = 100;
        }
    }
    update() {
        // move this outside to check against outer objects, perhaps?
        for (let i = this.cannonballs.length - 1; i >= 0; i--) {

            let currBall = this.cannonballs[i];
            currBall.display();
            currBall.update();
        }
        if (this.reloadTimer > 0) {
            this.reloadTimer--;
        }
    }
    // findEntitesWithinRange(enemies, items) {
    //     while (enemies.length !== 0) {
    //         let currEnemy = enemies.pop();
    //         const this.lifetime
    //         currEnemy.velocity;
    //     }
    // }
}

class MovingCannon extends Tank {
    constructor(x, y, w, h, health, tankType, cannonType) {
        super(x, y, w, h);
        this.cannon = new Cannon(this.x, this.y + this.w / 3, this.w / 2, this.h / 2, cannonType);
        this.health = health;
        this.tankType = tankType;
        this.velocity = 3;
        this.direction = "left";
        this.firing = true; // hard coded to true until we have enemies
    }
    display() {
        image(img[this.tankType], this.x, this.y);
        this.cannon.display();
    }
    move() {
        if (input[LEFT]) {
            this.x -= this.velocity;
        }
        if (input[RIGHT]) {
            this.x += this.velocity;
        }
        if (input[DOWN]) {
            this.y += this.velocity;
        }
        if (input[UP]) {
            this.y -= this.velocity;
        }
        
    }
    update() {
        if (input[32]) {
            this.cannon.fire();
        }
        this.cannon.update();
        this.cannon.display();
        this.cannon.x = this.x
        this.cannon.y = this.y;
    }
    
}

class Enemy {
    constructor(x, y, w, h, velocity, health) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.velocity = velocity;
        this.health = health;
    }
}


class Wolf extends Enemy {
    constructor(x, y, w, h, velocity, health) {
        super(x, y, w, h, velocity, health);
        this.path = [];
        this.currentPath = [];
    }
    display() {
        // dummy rect, graphic in progress by @happyyes
        fill(120);
        rect(this.x, this.y, this.w, this.h);
    }
    pathfinding() {
        // dummy path until @ty11ty makes the algorithm
        this.path = ["R", "R", "R", "R", "R", "R", "U", "U", "U", "R", "R", "R", "R", "R", "R",
            "U", "U", "U", "U", "U", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R",
            "D", "D", "D", "D", "R", "R", "U", "R"];
    }
    update() {
        if (this.currentPath.length === 0) {
            this.pathfinding();
            for (let i = this.path.length - 1; i >= 0; i--) {
                this.currentPath.push(this.path[i]);
            }
        }

        // each instruction, reset those to 0.
        let currentVelocityInstruction = {
            x: 0,
            y: 0
        };
        // now parse the instruction character. Since we initialize the currVelInst to 0 for both
        // x and y, we 
        switch (this.currentPath[this.currentPath.length - 1]) {
            case "R":
                currentVelocityInstruction.x += this.velocity;
                break;
            case "L":
                currentVelocityInstruction.x -= this.velocity;
                break;
            case "D":
                currentVelocityInstruction.y += this.velocity;
                break;
            case "U":
                currentVelocityInstruction.y -= this.velocity;
                break; 
            default:
                println("this should never occur");
                break;              
        }

        if (this.checkEdges()) {
            this.x += currentVelocityInstruction.x;
            this.y += currentVelocityInstruction.y;
        }

        // remove last element (path is backwards to keep it O(1))
        this.currentPath.pop();
        
    }
    checkEdges() {
        return this.x + this.w < width 
            && this.x > 0 
            && this.y + this.h < height
            && this.y > 0
    }
}


class ShopButton {
    constructor(x, y, w, h, cost, item) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cost = cost;
        this.item = item;
        this.created = null;
        this.canPlace = false;
        this.placed = false;
        this.followMouse = false;
    }
    createItem(item) {
        println("releveant");
        switch(item.tankType) {
            // internet seems divided on whether this is bad practice or not so let me know in the comments.
            // The mdn docs mention this is possible on the switch page therefore I think it is okay.
            case "tank1":
                return new MovingCannon(this.x, this.y, this.w, this.h, 200, "tank1", "cannon");
            case "tank2":
                return new MovingCannon(this.x, this.y, this.w, this.h, 200, "tank2", "cannon");
            case "tank3":
                return new MovingCannon(this.x, this.y, this.w, this.h, 200, "tank3", "cannon");
            default:
                return println("this should never occur");
        }
    }
    display() {
        if (rectToRectCollide({x: mouseX, y: mouseY, w: 0, h: 0}, this)) {
            fill(0, 0, 0, 40);
            if (clicked) {
                this.followMouse = true;
                // add price controls later
                this.created = this.createItem(this.item);
            }
        }
        if (this.followMouse) {
            this.created.x = mouseX;
            this.created.y = mouseY;
        } 
        this.item.display();
    }
    update() {
        
    }
}

class TankMenu {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sliding = "null";
        this.tankButtons = [];
        this.tankButtonsCreated = false;
    }
    createButtons() {
        this.tankButtons.push(new ShopButton(this.x + 20, this.y + 20, 60, 50, 10, 
            new MovingCannon(this.x + 20, this.y + 20, 60, 50, 10, "tank1", "cannon")));
        this.tankButtons.push(new ShopButton(this.x + 20, this.y + 75, 60, 50, 10, 
            new MovingCannon(this.x + 20, this.y + 75, 60, 50, 10, "tank2", "cannon")));
        this.tankButtons.push(new ShopButton(this.x + 120, this.y + 125, 60, 50, 10, 
            new MovingCannon(this.x + 20, this.y + 125, 60, 50, 10, "tank3", "cannon")));
    }
    display() {
        if (this.tankButtonsCreated === false) {
            this.createButtons();
            this.tankButtonsCreated = true;
        }
        
        fill(140, 180, 210);
        rect(this.x - 20, this.y + 280, 20, 40, 5);
        fill(30);
        if (this.sliding === "null" || this.sliding === "out") {
            triangle(this.x - 15, this.y + 300, this.x - 5, this.y + 290, this.x - 5, this.y + 310);
        } else {
            triangle(this.x - 5, this.y + 300, this.x - 15, this.y + 290, this.x - 15, this.y + 310);
        }
        fill(240);
        rect(this.x, this.y, 100, 600);
        for (let i = 20; i < 560; i += 55) {
            fill(220);
            rect(this.x + 20, i, 60, 50, 5);
            
            fill(0);
            text("Tank here", this.x + 50, i + 25);
        }
        for (let i = 0; i < this.tankButtons.length; i++) {
            this.tankButtons[i].display();
        }
    }
    update() {
        if (rectToRectCollide({x: mouseX, y: mouseY, w: 0, h: 0}, {x: this.x - 20, y: this.y + 280, w: 20, h: 40})) {
            if (clicked) {
                if (this.sliding === "null") {
                    this.sliding = this.x > 550 ? "out" : "in";
                } else if (this.sliding === "out") {
                    this.sliding = "in";
                } else if (this.sliding === "in") {
                    this.sliding = "out";
                }
            }
            fill(0, 0, 0, 50);
            rect(this.x - 20, this.y + 280, 20, 40, 5);
        } 

        if (this.x > 500 && this.sliding === "out") {
            this.x -= 2;
        } else if (this.x < 600 && this.sliding === "in") {
            this.x += 2;
        } else if (this.x <= 500 || this.x >= 600) {
            this.sliding = "null";
        }
        for (let i = 0; i < this.tankButtons.length; i++) {
            this.tankButtons[i].item.x = this.x;
            this.tankButtons[i].item.cannon.x = this.x;
            //this.tankButtons[i].item.y = this.y;
            //this.tankButtons[i].item.cannon.y = this.y;
        }

    }
}

class Button {
    constructor(x, y, r, appearance, sceneTo) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.appearance = appearance;
        this.sceneTo = sceneTo;
        this.border = 2;
    }
    run() {
        pushStyle();
        stroke(255, 255, 255);
        // if hovered
        if (dist(this.x, this.y, mouseX, mouseY) < this.r) {
            fill(0, 80, 200);
            if (clicked) {
                scene = this.sceneTo;
            } else {
                strokeWeight(this.border * 2);
            }
        } else {
            fill(40, 120, 230);
            strokeWeight(this.border);
        }
        ellipse(this.x, this.y, this.r * 2, this.r * 2);

        // switching between the different button types
        fill(255);
        switch (this.appearance) {
            case "restart":
                pushStyle();
                stroke(255);
                strokeWeight(2);
                triangle(this.x + this.r * 0.55, this.y, this.x + this.r * 0.55 - 5, this.y + 6, this.x + this.r * 0.55 + 3, this.y + 7);
                strokeWeight(5);
                noFill();
                arc(this.x, this.y, this.r * 1.1, this.r * 1.1, 30, 300);

                popStyle();
                break;
            case "back":
                triangle(this.x - (this.r / 1.4), this.y, this.x - this.r / 2.5, this.y - this.r / 2.75, this.x - this.r / 2.5, this.y + this.r / 2.75);
                rect(this.x - this.r / 2.5, this.y - this.r / 4, this.r, this.r / 2);
                break;
            case "how":
                // I hate myself too, it is all good
                pushStyle();
                textSize(64);
                text("?", this.x, this.y);
                popStyle();
                break;
            case "play":
                triangle(this.x - this.r / 2.2, this.y - this.r / 1.5, this.x - this.r / 2.2, this.y + this.r / 1.5, this.x + this.r / 2 + 3, this.y);
                break;
            case "lead":
                break;
        }
        popStyle();
    }
}
var playButton = new Button(200, 250, 40, "play", "game");
var howButton = new Button(100, 300, 40, "how", "how");
var leadButton = new Button(300, 300, 40, "lead", "lead");
var backButton = new Button(350, 350, 30, "back", "menu");
var restartButton = new Button(200, 330, 30, "restart", "menu");
var bullet = new Bullet(100, 100, 15, 4);
//var movingCannon = new MovingCannon(100, 100, 100, 100, 100, "cannon");
let wolf = new Wolf(25, 350, 50, 50, 3, 100);
let component = new TankMenu(599, 0);

// Particles
class Particle {
    constructor(x, y, size, velocity, color, timer) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.angle = random(0, 360);
        this.velocity = velocity;
        this.r = random(2, 4);
        this.color = color;
        this.transparency = timer;
    }
    run() {
        fill(this.color.red, this.color.green, this.color.blue, this.transparency);
        ellipse(this.x, this.y, this.size, this.size);
        // fine I will use basic trig rather than random. Basically think of velocity as a vector (b/c it is) and then I am breaking it down into its x and y components. I can explain more if you have questions.
        this.x += this.velocity * cos(this.angle);
        this.y += this.velocity * sin(this.angle);
        // I think this should be fine, idk let's see
        this.transparency -= random(4, 5);
    }
}


function game() {
	scene = "game";

}

// image loading
var curLoad = 0;
function load(s) {
    var obj = Object.keys(img);
    var imgKey = obj[curLoad];
    img[obj[curLoad]] = img[obj[curLoad]]();
        
    curLoad++;
        
    if (curLoad >= obj.length) {
        scene = s;
    }
    
    pushStyle();
        background(0, 0, 200);
        fill(255);
        textSize(30);
        //text("Loading\n " + obj[curLoad], width/2, height/2.5);
    popStyle();
}

function menu() {
	// change to softer gradient
	background(140, 255, 50);
	

    bullet.display();
    // movingCannon.display();
    // movingCannon.move();
    // movingCannon.update();
    
    wolf.display();
    wolf.update();
    component.display();
    component.update();
    image(img.tank1, 10, 250);
    image(img.tank2, 50, 350);
    image(img.tank3, 410, 450);

}

function how() {
	background(0);
	pushStyle();
		textSize(15);
		text("The code has lots of unfinished pieces \n because this is currently a demo. \n Click to shoot, pull the mouse opposite the direction \n you want to go.", width / 2, height / 2);
	popStyle();
	backButton.run();
}

function lead() {
	background(0);
}
draw = function() {
	background(0, 0, 0);
    
	
	switch(scene) {
        case "load":
            load("menu");
            break;
		case "menu":
			menu();
			break;
		case "game":
			game();
			break;
		case "how":
			how();
			break;
		case "lead":
			lead();
			break;
	}	
	
	clicked = false;
};

keyPressed = (() => input[keyCode] = true);

keyReleased = (() => input[keyCode] = false);


}

runPJS(program);

// Add reload button on KA --> <script>