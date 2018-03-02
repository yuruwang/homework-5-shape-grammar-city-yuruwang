import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';



class Model {

    vertList = new Array<vec4>();
    normList = new Array<vec4>();

    pos =  new Array<number>();
    nor =  new Array<number>();
    idx = new Array<number>();
    col = new Array<number>();

    meshIdx: any;
    meshPos: any;
    meshNor: any;

    height: number;

    constructor(mesh: any, color: vec3) {

        this.meshIdx = mesh.indices;
        this.meshPos = mesh.vertices;
        this.meshNor = mesh.vertexNormals;

        for (let i = 0; i < this.meshPos.length - 2; i += 3 ) {

            this.pos.push(this.meshPos[i]);
            this.pos.push(this.meshPos[i + 1]);
            this.pos.push(this.meshPos[i + 2]);
            this.pos.push(1);

            this.nor.push(this.meshNor[i]);
            this.nor.push(this.meshNor[i + 1]);
            this.nor.push(this.meshNor[i + 2]);
            this.nor.push(0);

            this.idx.push(this.meshIdx[i]);
            this.idx.push(this.meshIdx[i + 1]);
            this.idx.push(this.meshIdx[i + 2]);

            this.col.push(color[0]);
            this.col.push(color[1]);
            this.col.push(color[2]);
            this.col.push(1);
        }


        for (let i = 0; i < this.pos.length - 3; i += 4) {
            let vert = vec4.fromValues(this.pos[i], this.pos[i + 1], this.pos[i + 2], this.pos[i + 3]);
            this.vertList.push(vert);

            let norm = vec4.fromValues(this.nor[i], this.nor[i + 1], this.nor[i + 2], this.nor[i + 3]);
            this.normList.push(norm);
        }
    } 

    public addElement(element: Model) {
        let count = this.pos.length / 4;

        this.pos = this.pos.concat(element.pos);
        this.nor = this.nor.concat(element.nor);
        // this.col = this.col.concat(element.col);


        for (let i = 0; i < element.idx.length; i++) {
            this.idx.push(element.idx[i] + count);
        }
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
        this.height = sy;
        this.updateArrays();
    }

   
};

export default Model;