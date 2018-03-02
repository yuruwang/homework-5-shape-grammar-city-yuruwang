import {vec2, vec3, vec4, mat4} from 'gl-matrix';

class Geometry {
    idx: Array<number> = new Array<number>();
    pos: Array<number> = new Array<number>();
    nor: Array<number> = new Array<number>();

    vertList = new Array<vec4>();
    normList = new Array<vec4>();

    public constructor(pos: Array<number>,  nor: Array<number>, idx: Array<number>) {
        this.nor = nor.slice();
        this.pos = pos.slice();
        this.idx = idx.slice();

        for (let i = 0; i < this.pos.length - 3; i += 4) {
            let vert = vec4.fromValues(this.pos[i], this.pos[i + 1], this.pos[i + 2], this.pos[i + 3]);
            this.vertList.push(vert);

            let norm = vec4.fromValues(this.nor[i], this.nor[i + 1], this.nor[i + 2], this.nor[i + 3]);
            this.normList.push(norm);
        }             

    }

    public addElement(element: Geometry) {
        let count = 0;
        if (this.pos.length == 0) {
            count = element.idx.length;
            this.pos = element.pos.slice();
            this.nor = element.nor.slice();
            this.idx = element.idx.slice();
        } else {
            count = this.pos.length / 4;
            this.pos = this.pos.concat(element.pos);
            this.nor = this.nor.concat(element.nor);
            // this.col = this.col.concat(element.col);
        }

        for (let i = 0; i < element.idx.length; i++) {
            this.idx.push(element.idx[i] + count);
        }
    }

    public rotate(rad: number, axis: vec3) {
        let rotateM = mat4.fromValues(0, 0, 0, 0,
                                        0, 0, 0, 0,
                                        0, 0, 0, 0,
                                        0, 0, 0, 0);
        mat4.fromRotation(rotateM, rad, axis);

        for (let i = 0; i < this.vertList.length; i++) {
            vec4.transformMat4(this.vertList[i], this.vertList[i], rotateM);
            vec4.transformMat4(this.normList[i], this.normList[i], rotateM);
        }

        this.updateArrays();
    }

    public translate(v: vec4) {
        for (let i = 0; i < this.vertList.length; i++) {
            this.vertList[i][0] = this.vertList[i][0] + v[0];
            this.vertList[i][1] = this.vertList[i][1] + v[1];
            this.vertList[i][2] = this.vertList[i][2] + v[2];
        }
        this.updateArrays();
    }

    public scale(sx: number, sy: number, sz: number) {
        for (let i = 0; i < this.vertList.length; i++) {
            this.vertList[i][0] = this.vertList[i][0] * sx;
            this.vertList[i][1] = this.vertList[i][1] * sy;
            this.vertList[i][2] = this.vertList[i][2] * sz;
        }
        this.updateArrays();
    }

    // update vertex attributes 
    public updateArrays() {
        this.pos.length = 0;
        this.nor.length = 0;
        for (let i = 0; i < this.vertList.length; i++) {
            this.pos.push(this.vertList[i][0]);
            this.pos.push(this.vertList[i][1]);
            this.pos.push(this.vertList[i][2]);
            this.pos.push(this.vertList[i][3]);

            this.nor.push(this.normList[i][0]);
            this.nor.push(this.normList[i][1]);
            this.nor.push(this.normList[i][2]);
            this.nor.push(this.normList[i][3]);
        }
    }
}

export {Geometry};