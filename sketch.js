

function program() {
    
    title("TBFCS Workspace");
    size(600, 600);
    
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
var scene = "menu";
var currLvl = 0;
var highScore = 0;
let input = [];
function keyPressed() {
    input[keyCode] = true;
}
function keyReleased() {
    input[keyCode] = false;
}

function mouseClicked() {
	clicked = true;
}

class Bullet {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    display() {
        fill(205);
        ellipse(this.x, this.y, this.w, this.h);
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
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class MovingCannon extends Tank {
    constructor(x, y, w, h, health) {
        super(x, y, w, h);
        this.Cannon = new Cannon(this.x, this.y + this.w / 3, this.w / 2, this.h / 2);
        this.health = health;
        this.velocity = 3;
    }
    display() {
        fill(100);
        rect(this.x, this.y, this.w, this.h);
    }
    move() {
        if (input[LEFT]) {
            this.x -= this.velocity;
        }
        if (input[RIGHT]) {
            this.x += this.velocity;
        }
        if (input[DOWN]) {
            this.y -= this.velocity;
        }
        if (input[UP]) {
            this.y += this.velocity;
        }
        println(this.x);
        
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
var movingCannon = new MovingCannon(100, 100, 100, 100, 100);

// Particles
class Particle {
    constructor(x, y, timer) {
        this.x = x;
        this.y = y;
        this.angle = random(0, 360);
        this.velocity = random(1, 10);
        this.r = random(2, 4);
        this.transparency = timer;
    }
    run() {
        fill(255, 255, 255, this.transparency);
        ellipse(this.x, this.y, 4, 4);
        // fine I will use basic trig rather than random. Basically think of velocity as a vector (b/c it is) and then I am breaking it down into its x and y components. I can explain more if you have questions.
        this.x += this.velocity * cos(this.angle);
        this.y += this.velocity * sin(this.angle);
        // I think this should be fine, idk let's see
        this.transparency -= random(2, 5);
    }
}


function game() {
	scene = "game";

}

function menu() {
	// change to softer gradient
	background(140, 255, 50);
	

    bullet.display();
    movingCannon.display();
    movingCannon.move();

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
}

runPJS(program);

// Add reload button on KA --> <script>