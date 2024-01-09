let particles = [];
let interactionData = [];
let growthFactor = 1.05; // Growth rate for exponential increase in particles
let camX = 0, camY = 0, camZ = 0;
let connectionDistance = 75; // Distance for connections between particles

function setup() {
  createCanvas(800, 600, WEBGL);
  // Initial spawn of a small particle
  particles.push(new Particle(random(-width / 2, width / 2), random(-height / 2, height / 2), random(-200, 200), color(255, 204, 0), 5));
}

function draw() {
  background(255);
  translate(-camX, -camY, -camZ); // Camera control for panning

  // Update and display particles
  for (let particle of particles) {
    particle.update();
    particle.connectToOthers(particles, connectionDistance);
    particle.show();
  }

  // Exponential particle multiplication
  if (frameCount % 30 == 0) { // Every second
    let currentCount = particles.length;
    for (let i = 0; i < currentCount * (growthFactor - 1); i++) {
      let x = random(-width / 2, width / 2);
      let y = random(-height / 2, height / 2);
      let z = random(-200, 200);
      let p = new Particle(x, y, z, color(255, 204, 0), 5);
      particles.push(p);
    }
  }

  // Gradual color change to resemble molding
  for (let particle of particles) {
    let r = red(particle.col);
    let g = green(particle.col);
    let b = blue(particle.col);
    particle.col = color(r * 0.99, g * 0.99, b + 0.1);
  }

  // Update interaction data
  interactionData.push({time: frameCount, count: particles.length});
  if (interactionData.length > 50) {
    interactionData.shift();
  }

  // 2D Growth vs Time Chart
  drawDataChart();
}

function mouseDragged() {
  camX += mouseX - pmouseX;
  camY += mouseY - pmouseY;
}

function drawDataChart() {
  push();
  translate(-width / 2, -height / 2); // Reset translation for 2D drawing
  let plotWidth = 150;
  let plotHeight = 100;
  let chartX = width - 170;
  let chartY = 20;

  // Draw chart
  fill(255);
  rect(chartX, chartY, plotWidth, plotHeight);
  stroke(0);
  line(chartX + 10, chartY + plotHeight - 10, chartX + plotWidth - 10, chartY + plotHeight - 10); // X-axis
  line(chartX + 10, chartY + 10, chartX + 10, chartY + plotHeight - 10); // Y-axis

  // Plot data
  noFill();
  beginShape();
  for (let i = 0; i < interactionData.length; i++) {
    let x = map(i, 0, interactionData.length - 1, chartX + 10, chartX + plotWidth - 10);
    let y = map(interactionData[i].count, 0, max(interactionData.map(d => d.count)), chartY + plotHeight - 10, chartY + 10);
    vertex(x, y);
  }
  endShape();
  pop();
}

class Particle {
  constructor(x, y, z, col, size) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.col = col;
    this.size = size;
    this.connected = [];
    this.sizeOscillation = 0;
  }

  update() {
    // Oscillating size
    this.sizeOscillation += 0.1;
    this.size = 5 + sin(this.sizeOscillation) * 2;
  }

  show() {
    push();
    translate(this.x, this.y, this.z);
    fill(this.col);
    noStroke();
    sphere(this.size / 2);
    pop();
  }

  connectToOthers(particles, connectionDistance) {
    this.connected = [];
    for (let other of particles) {
      if (other !== this && dist(this.x, this.y, this.z, other.x, other.y, other.z) < connectionDistance) {
        this.connected.push(other);
      }
    }

    // Draw connections
    stroke(this.col);
    for (let other of this.connected) {
      line(this.x, this.y, this.z, other.x, other.y, other.z);
    }
  }
}
