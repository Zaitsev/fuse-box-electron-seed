import * as React from "react";

function createLine(x1, y1, x2, y2, data) {
  data.vertices = [x1, y1, 0, x2, y2, 0];
  data.indices  = [0, 1];
}

function initObject(gl, i) {

  var data = {
    'vertices': [],
    'indices' : []
  };

  createLine(-0.8, -0.8 + 0.2 * i, 0.8, -0.8 + 0.2 * i, data);

  var object = {};

  object['vertex_buffer'] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, object['vertex_buffer']);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data['vertices']), gl.STATIC_DRAW);

  object['index_buffer'] = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object['index_buffer']);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data['indices']), gl.STATIC_DRAW);

  object['n_elements'] = data.indices.length;

  return object;
}

function initShader(gl) {
  var vs = 'attribute vec3 aVertexPosition;';
  vs += 'uniform mat4 uModelViewMatrix;';
  vs += 'uniform mat4 uProjectionMatrix;';
  vs += 'void main(void) {';
  vs += 'gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);';
  vs += '}';

  var fs = '#ifdef GL_ES \n';
  fs += 'precision highp float; \n';
  fs += '#endif \n';
  fs += 'void main(void) {';
  fs += 'gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);';
  fs += '}';

  var xfs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(xfs, fs);
  gl.compileShader(xfs);

  // See if it compiled successfully
  if (!gl.getShaderParameter(xfs, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(xfs));
    return null;
  }

  var xvs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(xvs, vs);
  gl.compileShader(xvs);

  // See if it compiled successfully
  if (!gl.getShaderParameter(xvs, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(xvs));
    return null;
  }

  var shader = {};

  shader['program'] = gl.createProgram();
  gl.attachShader(shader['program'], xvs);
  gl.attachShader(shader['program'], xfs);
  gl.linkProgram(shader['program']);

  // See if it compiled successfully
  if (!gl.getProgramParameter(shader['program'], gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program.');
    return null;
  }

  gl.useProgram(shader['program']);
  shader['aVertexPosition'] = gl.getAttribLocation(shader['program'], 'aVertexPosition');
  gl.enableVertexAttribArray(shader['aVertexPosition']);

  shader['uModelViewMatrix']  = gl.getUniformLocation(shader['program'], 'uModelViewMatrix');
  shader['uProjectionMatrix'] = gl.getUniformLocation(shader['program'], 'uProjectionMatrix');

  shader['MV_MATRIX'] = [1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0];


  shader['PROJECTION_MATRIX'] = [
    1.000, 0.000, 0.000, 0.000,
    0.000, 1.000, 0.000, 0.000,
    0.000, 0.000, 0.002, 0.000,
    0.000, 0.000, 0.998, 1.000];

  return shader;
}

function checkError(text, gl) {
  var error = gl.getError();
  if (error != gl.NO_ERROR) {
    alert(text + ' ' + error);
  }
}

function drawObject(gl, shader, object, width) {
  gl.useProgram(shader['program']);

  gl.bindBuffer(gl.ARRAY_BUFFER, object['vertex_buffer']);
  gl.vertexAttribPointer(shader['aVertexPosition'], 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object['index_buffer']);

  gl.uniformMatrix4fv(shader['uProjectionMatrix'], false, shader['PROJECTION_MATRIX']);
  gl.uniformMatrix4fv(shader['uModelViewMatrix'], false, shader['MV_MATRIX']);

  gl.lineWidth(width);
  gl.drawElements(gl.LINES, object['n_elements'], gl.UNSIGNED_SHORT, 0);
}

function init(canvas: HTMLCanvasElement) {
  // var canvas = document.getElementById('gl');
  var gl     = canvas.getContext('webgl2');

  var shader  = initShader(gl);
  var objects = [];
  for (var i = 0; i < 9; i++) objects[i] = initObject(gl, i);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < 9; i++) drawObject(gl, shader, objects[i], i + 1);
}

export class GLtest extends React.PureComponent {
  ref = React.createRef<HTMLCanvasElement>();

  componentDidMount(): void {
    init(this.ref.current!);
  }

  render() {
    return <div>
      <h1> GL test : line width should by vary</h1>
      <canvas ref={this.ref} width={100} height={100} style={{background: '#EEE'}}/>
    </div>;
  }
}

// init();
