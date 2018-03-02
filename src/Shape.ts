import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Model from './geometry/Model';
import {cubeMesh} from './main';
import {Scene} from './Scene';
import { LandScape } from './Landscape';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

const PI = 3.1415;

// class for storing shape symbol information
class Shape {
    terminal: boolean;
    pos: vec3;
    angle: number;
    scale: vec3;
    geometry: any;
    color: vec3;

    public constructor(terminal: boolean, pos: vec3, angle: number, scale: vec3, color: vec3, geometry: any) {
        this.terminal = terminal;
        this.pos = pos;
        this.angle = angle;
        this.scale = scale;
        this.color = color;
        this.geometry = geometry;
    }

}

class Grammer {

    // modify symbol shape with differnet rules
    public modify(predecessor: Shape, norRadius: number): Array<Shape> {
        let prob = Math.random();
        if (prob < 0.2) {  
            return this.f1(predecessor);

        } else if (prob < 0.4) {
            return this.f2(predecessor);

        } else if (prob < 0.6) {
            return this.f3(predecessor, norRadius);

        } else if (prob < 0.8) {
            return this.f4(predecessor, norRadius);

        } else {
            return this.f5(predecessor, norRadius);

        }

    }


    // rule 1: subdivde geometry along x axis into 3 parts with different scale
    private f1(predecessor: Shape): Array<Shape> {
        
        let shapes = new Array<Shape>();
        let newShape: Shape;
        let newTerminal: boolean;
        let newScale = vec3.fromValues(0, 0, 0);
        let newPos = vec3.fromValues(0, 0, 0);
        let newAngle = 0;
        let newCol = vec3.fromValues(0, 0, 0);

        let iteration = Math.floor(Math.random() * 2 + 1); // iterarion could be 1, 2, 
        let remainWidth = 1;
        let xStart = 0;
        if (iteration === 1) {
            shapes.push(predecessor);
            return shapes;
        }
        for (let i = 0; i < iteration; i++) {
            // for last iteration
            let width = 0;
            if (i === iteration - 1) {
                width = remainWidth;
            } else {
                width = (Math.random() * 0.5 + 0.5) * remainWidth;
            }
            

            let ZWidth =  (Math.random() * 0.6 + 0.4);
            let YHeightFactor = Math.random() * 0.5 + 0.5;
            newScale = vec3.fromValues(width, predecessor.scale[1] * YHeightFactor, predecessor.scale[2] * ZWidth);
            newPos = vec3.fromValues(xStart, predecessor.pos[1], predecessor.pos[2]);
            newAngle = predecessor.angle;
            newCol = vec3.fromValues(predecessor.color[0], predecessor.color[1], predecessor.color[2]);

            let volume = newScale[0] * newScale[1] * newScale[2];
            if (volume < 5) {
                newTerminal = true;
            } else {
                newTerminal = false;
            }

            newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
            shapes.push(newShape);

            remainWidth -= width;
            xStart += width;
        }
        

        return shapes;
    }

    // rule 2 : divid building along Y axis into two new shapes, upper one with smaller scale
    private f2(predecessor: Shape): Array<Shape> {
        let shapes = new Array<Shape>();
        let newShape: Shape;
        let newTerminal: boolean;
        let newScale = vec3.fromValues(0, 0, 0);
        let newPos = vec3.fromValues(0, 0, 0);
        let newAngle = 0;
        let newCol = vec3.fromValues(0, 0, 0);


        // bottom cube
        let bottomHeight = Math.random() * predecessor.scale[1];
        newTerminal = true;
        newScale = vec3.fromValues(predecessor.scale[0], bottomHeight, predecessor.scale[2]);
        newPos = vec3.fromValues(predecessor.pos[0], predecessor.pos[1], predecessor.pos[2]);
        newCol = vec3.fromValues(predecessor.color[0], predecessor.color[1], predecessor.color[2]);
        newAngle = predecessor.angle;
        newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
        shapes.push(newShape);

        // upper cube
        let scaleFactor = Math.random() * 0.5 + 0.5;
        newScale = vec3.fromValues(predecessor.scale[0] * scaleFactor, predecessor.scale[1] - bottomHeight, predecessor.scale[2] * scaleFactor);
        newPos = vec3.fromValues(predecessor.pos[0] + predecessor.scale[0] * (1 - scaleFactor) / 2, predecessor.pos[1] + bottomHeight, predecessor.pos[2] + predecessor.scale[2] * (1 - scaleFactor) / 2);
        newCol = vec3.fromValues(predecessor.color[0], predecessor.color[1], predecessor.color[2]);
        newAngle = predecessor.angle;

        let volume = newScale[0] * newScale[1] * newScale[2];
            if (volume < 2) {
                newTerminal = true;
            } else {
                newTerminal = false;
            }

        newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
        shapes.push(newShape);

        return shapes;
    }

    // rule 3 : modify buildings to spiral shape
    private f3(predecessor: Shape, norRadius: number): Array<Shape> {      
        let shapes = new Array<Shape>();
        let newShape: Shape;
        let newTerminal: boolean;
        let newScale = vec3.fromValues(0, 0, 0);
        let newPos = vec3.fromValues(0, 0, 0);
        let newAngle = 0;
        let newCol = vec3.fromValues(0, 0, 0);

        if (norRadius > 0.005) {
            shapes.push(predecessor);
            return shapes;
        }

        let unitHeight = 0.2;
        let n = Math.floor(predecessor.scale[1] / unitHeight) * 1.5;
        if (n < 30) {
            n = 40;
        }
        let totalY = predecessor.pos[1];
        let totalAngle = predecessor.angle;
        for (let i = 0; i < n; i++) {
            newTerminal = true;
            newScale = vec3.fromValues(predecessor.scale[0], unitHeight, predecessor.scale[2]);
            newPos = vec3.fromValues(predecessor.pos[0], totalY, predecessor.pos[2]);
            newAngle = totalAngle;
            newCol = vec3.fromValues(1, 0, 0);
            newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
            shapes.push(newShape);

            totalY += unitHeight;
            totalAngle += 2 * PI / n;
        }

        return shapes;
    }

    // rule 4 : add pyramid-shape roof to current shape
    private f4(predecessor: Shape, norRadius: number): Array<Shape> {
        let shapes = new Array<Shape>();
        let newShape: Shape;
        let newTerminal: boolean;
        let newScale = vec3.fromValues(0, 0, 0);
        let newPos = vec3.fromValues(0, 0, 0);
        let newAngle = 0;
        let newCol = vec3.fromValues(0, 0, 0);

        if (norRadius > 0.1 || Math.random() > 0.4) {
            shapes.push(predecessor);
            return shapes;
        }

        // bottom cube
        let bottomHeight = (Math.random() * 0.3 + 0.7) * predecessor.scale[1];
        newTerminal = true;
        newScale = vec3.fromValues(predecessor.scale[0], bottomHeight, predecessor.scale[2]);
        newPos = vec3.fromValues(predecessor.pos[0], predecessor.pos[1], predecessor.pos[2]);
        newCol = vec3.fromValues(predecessor.color[0], predecessor.color[1], predecessor.color[2]);
        newAngle = predecessor.angle;
        newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
        shapes.push(newShape);

        // roof part
        let unitHeight = 0.1;
        let n = Math.floor((predecessor.scale[1] - bottomHeight) / unitHeight);
        let totalY = predecessor.pos[1] + bottomHeight;
        let totalScale = 0.8;
        for (let i = 0; i < n; i++) {
            newTerminal = true;
            newScale = vec3.fromValues(predecessor.scale[0] * totalScale, unitHeight, predecessor.scale[2] * totalScale);
            newPos = vec3.fromValues(predecessor.pos[0] + predecessor.scale[0] * (1 - totalScale) / 2, predecessor.pos[1] + totalY, predecessor.pos[2] + predecessor.scale[2] * (1 - totalScale) / 2);
            newAngle = predecessor.angle;
            newCol = vec3.fromValues(predecessor.color[0], predecessor.color[1], predecessor.color[2]);
            newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
            shapes.push(newShape);

            totalY += unitHeight;
            totalScale *= totalScale;
        }

        return shapes;
    }

    // rule 5: add rings to the shape along y axis
    private f5(predecessor: Shape, norRadius: number): Array<Shape> {
        let shapes = new Array<Shape>();
        let newShape: Shape;
        let newTerminal: boolean;
        let newScale = vec3.fromValues(0, 0, 0);
        let newPos = vec3.fromValues(0, 0, 0);
        let newAngle = 0;
        let newCol = vec3.fromValues(0, 0, 0);

        if (norRadius > 0.1 || Math.random() > 0.5) {
            shapes.push(predecessor);
            return shapes;
        }

        // original building body part
        predecessor.terminal = true;
        shapes.push(predecessor);

        // rings
        let unitHeight = 0.2;
        let segHeight = 0.5;
        let n = Math.floor(predecessor.scale[1] / (unitHeight + segHeight));
        let totalY = predecessor.pos[1];
        let scale = 1.1;
        for (let i = 0; i < n; i++) {
            newTerminal = true;
            newScale = vec3.fromValues(predecessor.scale[0] * scale, unitHeight, predecessor.scale[2] * scale);
            newPos = vec3.fromValues(predecessor.pos[0] - predecessor.scale[0] * (scale - 1) / 2, predecessor.pos[1] + totalY, predecessor.pos[2] - predecessor.scale[2] * (scale - 1) / 2);
            newAngle = predecessor.angle;
            newCol = vec3.fromValues(1, 1, 1);
            newShape = new Shape(newTerminal, newPos, newAngle, newScale, newCol, cubeMesh);
            shapes.push(newShape);

            totalY += unitHeight + segHeight;
        }

        return shapes;
    }
}

class Building {    
    pos: vec2;
    axiom: Shape;
    shapes: Array<Shape>;
    queue: Array<Shape>;
    grammer: Grammer;
    landScape: LandScape;
    norRadius: number

    public constructor(landScape: LandScape, pos: vec2, grammer: Grammer) {
        let midP = vec2.fromValues(landScape.landScale[0] / 2, landScape.landScale[1] / 2);
        let length = Math.pow(pos[0] - midP[0], 2) + Math.pow(pos[1] - midP[1], 2);
        this.norRadius = length / (Math.pow(landScape.landScale[0] - midP[0], 2) + Math.pow(landScape.landScale[1] - midP[1], 2));

        // create axiom shape
        let axiomHeight = 0;
        let noise = 0;
        let grayScale = 0;
        if (this.norRadius < 0.3) {
            axiomHeight = 4 * (1 - this.norRadius / 0.3);
            noise = 3 * Math.random() - 1;
            axiomHeight += noise;
            grayScale = Math.random() * 0.5 + 0.5;
        } else {
            axiomHeight = 1.3;
            noise = 2 * Math.random() - 1;
            axiomHeight += noise;
            grayScale = Math.random() * 0.5;
        }


        let axiomColor = vec3.fromValues(grayScale, grayScale, grayScale);
        this.axiom = new Shape(false, vec3.fromValues(0, 0, 0), 0, vec3.fromValues(0.8, axiomHeight, 0.8), axiomColor, cubeMesh);
        this.shapes = new Array<Shape>();
        this.queue = new Array<Shape>();
        this.pos = pos;
        this.grammer = grammer;

        this.queue.push(this.axiom);
        this.expand();

    }

    // shape the building using rules iteratively
    public expand() {
        while (this.queue.length > 0) {
            let temp = this.queue.shift();
            if (temp.terminal === true) {
                this.shapes.push(temp);
                continue;
            }

            let resultShapes = this.grammer.modify(temp, this.norRadius);

            if (this.queue.length === 0) {
                this.queue = resultShapes.slice();
            } else {
                this.queue.concat(resultShapes);
            }
            
        }
    }
}

export {Building, Grammer};