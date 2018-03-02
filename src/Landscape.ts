import {vec2, vec3} from 'gl-matrix';

// this class is for building the landscape pattern
class LandScape {
    landMap: boolean[][];
    landScale: vec2;

    public constructor(landScale: vec2) {
        this.landMap = [];
        this.landScale = vec2.fromValues(0, 0);
        vec2.copy(this.landScale, landScale);

        for(let i = 0; i < this.landScale[0]; i++) {
            this.landMap[i] = [];
            for(let j = 0; j < this.landScale[1]; j++) {
                this.landMap[i][j] = true;
            }
        }

        this.createSea();
    }

    // mark sea blocks on map
    public createSea() {
        let p1 = vec2.fromValues(Math.floor(this.landScale[0] / 3), Math.floor(this.landScale[1] / 3));
        let p2 = vec2.fromValues(Math.floor(this.landScale[0] / 3), Math.floor(this.landScale[1] * 2 / 3));
        let p3 = vec2.fromValues(Math.floor(this.landScale[0] * 2 / 3), Math.floor(this.landScale[1] * 2 / 3));
        let p4 = vec2.fromValues(Math.floor(this.landScale[0] * 2 / 3), Math.floor(this.landScale[1] / 3));

        this.landMap[p1[0]][p1[1]] = false;
        this.landMap[p2[0]][p2[1]] = false;
        this.landMap[p3[0]][p3[1]] = false;
        this.landMap[p4[0]][p4[1]] = false;
        
        this.diveSea(p1[0] - 1, p1[1]);
        this.diveSea(p1[0] + 1, p1[1]);
        this.diveSea(p1[0], p1[1] - 1);
        this.diveSea(p1[0], p1[1] + 1);

        this.diveSea(p2[0] - 1, p2[1]);
        this.diveSea(p2[0] + 1, p2[1]);
        this.diveSea(p2[0], p2[1] - 1);
        this.diveSea(p2[0], p2[1] + 1);

        this.diveSea(p3[0] - 1, p3[1]);
        this.diveSea(p3[0] + 1, p3[1]);
        this.diveSea(p3[0], p3[1] - 1);
        this.diveSea(p3[0], p3[1] + 1);

        this.diveSea(p4[0] - 1, p4[1]);
        this.diveSea(p4[0] + 1, p4[1]);
        this.diveSea(p4[0], p4[1] - 1);
        this.diveSea(p4[0], p4[1] + 1);


        this.landMap[this.landScale[0] / 2][this.landScale[1] / 2] = false;
        this.makeIrland(this.landScale[0] / 2, this.landScale[1] / 2, 0);

        // eliminate tiny island
        for (let i = 0; i < this.landScale[0]; i++) {
            for (let j = 0; j < this.landScale[1]; j++) {
                if (i - 1 < 0 || i + 1 >= this.landScale[0] || j - 1 < 0 || j + 1 >= this.landScale[1]) {
                    continue;
                }

                if (this.landMap[i - 1][j] === false &&
                    this.landMap[i + 1][j] === false &&
                    this.landMap[i][j - 1] === false &&
                    this.landMap[i][j + 1] === false) {
                    
                        this.landMap[i][j] = false;
                }

            }

        }

    }

    // mark central island blocks on map
    public makeIrland(i: number, j: number, iteration: number) {
        if (i - 1 < 0 || i + 1 >= this.landScale[0] || j - 1 < 0 || j + 1 > this.landScale[1]) {
            return;
        }
        if (this.landMap[i][j] == true) {
            return;
        }

        if (iteration > 20) {
            return;
        }
        this.landMap[i][j] = true;

        let rand = Math.random();
        if (rand < 0.25) { // upwards
            this.makeIrland(i, j - 1, iteration + 1);
            this.makeIrland(i + 1, j, iteration + 1);
            this.makeIrland(i, j + 1, iteration + 1);

        } else if (rand < 0.5) { // left
            this.makeIrland(i + 1, j, iteration + 1);
            this.makeIrland(i, j + 1, iteration + 1);
            this.makeIrland(i - 1, j, iteration + 1);

        } else if (rand < 0.75) { // downwards
            this.makeIrland(i - 1, j, iteration + 1);
            this.makeIrland(i, j - 1, iteration + 1);
            this.makeIrland(i, j + 1, iteration + 1);

        } else { //right
            this.makeIrland(i - 1, j, iteration + 1);
            this.makeIrland(i, j - 1, iteration + 1);
            this.makeIrland(i + 1, j, iteration + 1);
        }

        
    }

    public diveSea(i: number, j: number) {
        if (i - 1 < 0 || i + 1 >= this.landScale[0] || j - 1 < 0 || j + 1 > this.landScale[1]) {
            return;
        }
        
        this.landMap[i][j] = false;

        let rand = Math.random();
        if (rand < 0.25) { // upwards
            this.diveSea(i - 1, j);

        } else if (rand < 0.5) { // left
            this.diveSea(i, j - 1);

        } else if (rand < 0.75) { // downwards
            this.diveSea(i + 1, j);

        } else { //right
            this.diveSea(i, j + 1);
        }
    }
}

export {LandScape};