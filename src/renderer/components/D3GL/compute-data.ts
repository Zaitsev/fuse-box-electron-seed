import React, {useEffect}                  from "react";
import twgl, {BufferInfo, m4, ProgramInfo} from "twgl.js";
import chroma                              from "chroma-js";
import {vs, fs}                            from "./shaders/texture-data";
import Mat4 = m4.Mat4;
import {OriginList}                        from "~/renderer/components/D3GL/index";

type GLObjectUniforms = {
  u_lightWorldPos: number[]
  u_lightColor: number[]
  u_diffuseMult: [number, number, number, number]
  u_specular: [number, number, number, number]
  u_shininess: number
  u_specularFactor: number
  u_diffuse?: WebGLTexture
  u_y_data: WebGLTexture
  u_y_color: WebGLTexture
  u_viewInverse: Mat4
  u_world: Mat4
  u_worldInverseTranspose: Mat4
  u_worldViewProjection: Mat4
}
type GLObjects = {
  ySpeed: number,
  zSpeed: number,
  uniforms: GLObjectUniforms
  viewElement: Element
  programInfo: ProgramInfo
  bufferInfo: BufferInfo
}

function getbbox(viewElement: Element, cvs: HTMLCanvasElement) {
  const rect = viewElement.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > cvs.clientHeight ||
    rect.right < 0 || rect.left > cvs.clientWidth) {
    return [0, 0, 0, 0];  // it's off screen
  }
  const width  = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const left   = rect.left;
  const bottom = cvs.clientHeight - rect.bottom - 1;
  return [width, height, left, bottom];
}

export function useTwglEffect(canv: React.RefObject<HTMLCanvasElement>,
                              origins: OriginList[]
) {
  useEffect(() => {
    const canvas = document.createElement(('canvas'));

    // Create WebGL2ComputeRenderingContext
    const context = canvas.getContext('webgl2-compute');
    const el      = document.createElement('h2');
    if (!context) {
      el.innerText = "ERROR";
      console.log('erroe');
      return;
    }
    el.innerText = 'WebGL2ComputeRenderingContext create: success';
    console.log('WebGL2ComputeRenderingContext create: success');
    document.body.appendChild(el);

    // ComputeShader source
    // language=GLSL
    const computeShaderSource = `#version 310 es
    layout (local_size_x = 8, local_size_y = 1, local_size_z = 1) in;
    layout (std430, binding = 0) buffer SSBO {
        float data[];
    } ssbo;

    void main() {
        uint threadIndex = gl_GlobalInvocationID.x;
        ssbo.data[threadIndex] = float(threadIndex);
    }
    `;

    // create WebGLShader for ComputeShader
    const computeShader = context.createShader(context.COMPUTE_SHADER);
    context.shaderSource(computeShader, computeShaderSource);
    context.compileShader(computeShader);
    if (!context.getShaderParameter(computeShader, context.COMPILE_STATUS)) {
      console.log(context.getShaderInfoLog(computeShader));
      return;
    }

    // create WebGLProgram for ComputeShader
    const computeProgram = context.createProgram();
    context.attachShader(computeProgram, computeShader);
    context.linkProgram(computeProgram);
    if (!context.getProgramParameter(computeProgram, context.LINK_STATUS)) {
      console.log(context.getProgramInfoLog(computeProgram));
      return;
    }

    // input data
    const input = new Float32Array(8);
    console.log(`input: [${input}]`);
    // document.getElementById('input').innerText = `input: [${input}]`;

    // create ShaderStorageBuffer
    const ssbo = context.createBuffer();
    context.bindBuffer(context.SHADER_STORAGE_BUFFER, ssbo);
    context.bufferData(context.SHADER_STORAGE_BUFFER, input, context.DYNAMIC_COPY);
    context.bindBufferBase(context.SHADER_STORAGE_BUFFER, 0, ssbo);

    // execute ComputeShader
    context.useProgram(computeProgram);
    context.dispatchCompute(1, 1, 1);

    // get result
    const result = new Float32Array(8);
    context.getBufferSubData(context.SHADER_STORAGE_BUFFER, 0, result);
    const elr      = document.createElement('h2');
    elr.innerText=`output: [${result}]`;
    document.body.appendChild(elr);
    console.log(`output: [${result}]`);
    // document.getElementById('output').innerText = `output: [${result}]`;
  }, [canv, origins]);
}
