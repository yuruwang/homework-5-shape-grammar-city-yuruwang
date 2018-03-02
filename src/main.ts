import {vec2, vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import{ gl } from './globals';

// import {LSystem, Grammer} from './Lsystem';
import Drawable from './rendering/gl/Drawable';
import Model from './geometry/Model';
import { Scene } from './Scene';

import {LandScape} from './LandScape';
import { Geometry } from './geometry/Geometry';
import {Primitive} from './geometry/Primitive';
import {Building, Grammer} from './Shape';

const PI = 3.1415;
let screenQuad: Square;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.

let landScape: LandScape;
let landScale: vec2;
let landScene: Scene;
let seaScene: Scene;
let grammer: Grammer;

export let cubeMesh = loadObj("./src/cube.obj");
let boatMesh = loadObj('./src/obj/boatMaya.obj');
function loadScene(){
  screenQuad = new Square(vec3.fromValues(0, 0, 0));
  screenQuad.create();

  landScene = new Scene();
  seaScene = new Scene();
  
  // load buildings
  landScale = vec2.fromValues(40, 40);
  landScape = new LandScape(landScale);

  grammer = new Grammer();
  let building: Building;

  for (let i = 0; i < landScale[0]; i++) {
    for (let j = 0; j < landScale[1]; j++) {

      building = new Building(landScape, vec2.fromValues(i, j), grammer);

      let rad = Math.floor(Math.random() * 4);
      if (landScape.landMap[i][j] == true) {
        for (let k = 0; k < building.shapes.length; k++) {
          let shape = building.shapes[k];
          let cube = new Model(shape.geometry, shape.color);

          // scale cube in local coords
          cube.scale(shape.scale[0], shape.scale[1], shape.scale[2]);
          // tarnslate cube in local coords
          cube.translate(vec4.fromValues(shape.pos[0], shape.pos[1], shape.pos[2], 1));
          // rotate cube in local coords
          let cubeCenter = vec2.fromValues(shape.pos[0] + shape.scale[0] / 2, shape.pos[2] + shape.scale[2] / 2);
          cube.translate(vec4.fromValues(-cubeCenter[0], 0, -cubeCenter[1], 1));
          cube.rotate(shape.angle, vec3.fromValues(0, 1, 0));
          cube.translate(vec4.fromValues(cubeCenter[0], 0, cubeCenter[1], 1));

          // rotate cube abount its center in world coords
          let center = vec2.fromValues(0.5, 0.5);
          cube.translate(vec4.fromValues(-center[0], 0, -center[1], 1));
          cube.rotate(rad * PI / 2, vec3.fromValues(0, 1, 0));
          cube.translate(vec4.fromValues(center[0], 0, center[1], 1));

          cube.translate(vec4.fromValues(i, 1.22, j, 1));
          landScene.addElement(cube);

          // add riverbank
          cube = new Model(shape.geometry, vec3.fromValues(0.7, 0, 0));
          cube.scale(1, 1.2, 1);
          cube.translate(vec4.fromValues(i, 0, j, 1));
          landScene.addElement(cube);

        }

      } else {
        // add sea block
        let seaColor = vec3.fromValues(1.0, 0.4, 0.4);
        let cube = new Model(cubeMesh, seaColor);
        cube.translate(vec4.fromValues(i, 0, j, 1));
        seaScene.addElement(cube);

        // add boat
        if (Math.random() > 0.98) {
          let boat = new Model(boatMesh, vec3.fromValues(0.3, 0.3, 0.3));
          boat.rotate(Math.random() * PI * 2, vec3.fromValues(0, 1, 0));
          boat.translate(vec4.fromValues(i, 1, j, 1));
          seaScene.addElement(boat);
        }
      }
    }
  }

  landScene.create();
  seaScene.create();

}

function loadObj(dir: string): any {
  let OBJ = require('webgl-obj-loader');

  let data = readTextFile(dir);
  let mesh = new OBJ.Mesh(data);

  return mesh;
}

function readTextFile(dir: string) : string
{
  var allText
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", dir, false);
  rawFile.onreadystatechange = function ()
  {
      if(rawFile.readyState === 4)
      {
          if(rawFile.status === 200 || rawFile.status == 0)
          {
              allText = rawFile.responseText;
              return allText;
          }
      }
  }
  rawFile.send(null);
  return allText;
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');

  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load branchScene
  loadScene();

  const camera = new Camera(vec3.fromValues(20, 10, 48), vec3.fromValues(20, 0, 20));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.0, 0.0, 0.0, 1);
  // renderer.renderCol = vec4.fromValues(controls.branchColor[0] / 255, controls.branchColor[1] / 255, controls.branchColor[2] / 255, 1);


  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const skyShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ]);


  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    renderer.shader = lambert;
    renderer.renderCol = vec4.fromValues(1, 0, 0, 1);
    renderer.render(camera, [landScene]);

    renderer.renderCol = vec4.fromValues(0, 0, 1, 1);
    renderer.render(camera, [seaScene]);


    skyShader.setDimension(vec2.fromValues(canvas.width, canvas.height));
    skyShader.draw(screenQuad);

    stats.end();
    // renderer.time++;

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();

}

main();
