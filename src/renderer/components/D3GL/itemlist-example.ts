import React, {useEffect}                  from "react";
import twgl, {BufferInfo, m4, ProgramInfo} from "twgl.js";
import chroma                              from "chroma-js";
import {fs, vs}                            from "./shaders/itemlist-experiment";
import {OriginList}                        from "~/renderer/components/D3GL/index";
import Mat4 = m4.Mat4;


type GLObjectUniforms = {
  u_lightWorldPos: number[]
  u_lightColor: number[]
  u_diffuseMult: [number, number, number, number]
  u_specular: [number, number, number, number]
  u_shininess: number
  u_specularFactor: number
  u_diffuse: WebGLTexture
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
    if (canv.current === null) {
      return;
    }
    console.log(`------ items_experiment ------`);
    twgl.setDefaults({attribPrefix: "a_"});
    const m4 = twgl.m4;
    if (canv.current === null) {
      return;
    }
    const gl = canv.current.getContext('webgl2',
                                       {desynchronized: true, preserveDrawingBuffer: true}
    )!;
    // if (gl.getContextAttributes().desynchronized) {
    //   console.log('Low latency canvas supported. Yay!');
    // } else {
    //   console.log('Low latency canvas not supported. Boo!');
    // }
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    const shapes = [
      twgl.primitives.createCubeBufferInfo(gl, 2),
      twgl.primitives.createSphereBufferInfo(gl, 1, 24, 12),
      twgl.primitives.createPlaneBufferInfo(gl, 20, 20),
      twgl.primitives.createTruncatedConeBufferInfo(gl, 1, 0, 2, 24, 1),
      twgl.primitives.createCresentBufferInfo(gl, 1, 1, 0.5, 0.1, 24),
      twgl.primitives.createCylinderBufferInfo(gl, 1, 2, 24, 2),
      twgl.primitives.createDiscBufferInfo(gl, 1, 24),
      twgl.primitives.createTorusBufferInfo(gl, 1, 0.4, 24, 12),
    ];

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    // Shared values
    const lightWorldPosition   = [1, 8, -10];
    const lightColor           = [1, 1, 1, 1];
    const camera               = m4.identity();
    const view                 = m4.identity();
    const viewProjection       = m4.identity();
    const tex                  = twgl.createTexture(gl, {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: [
        255, 255, 255, 255,
        192, 192, 192, 255,
        192, 192, 192, 255,
        255, 255, 255, 255,
      ],
    });
    const objects: GLObjects[] = [];
    console.log(origins);
    let ii = 0;

    for (const orig of origins) {
      if (orig.ref == null) {
        continue;
      }
      // const listElement                = document.createElement("div");
      // listElement.innerHTML            = list_item_template;
      // listElement.className            = "list-item";
      // const viewElement                = listElement.querySelector(".view")!;
      const viewElement                = orig.ref as HTMLDivElement;
      const uniforms: GLObjectUniforms = {
        u_lightWorldPos        : lightWorldPosition,
        u_lightColor           : lightColor,
        u_diffuseMult          : chroma.hsv(rand(0, 360), 0.4, 0.8).gl(),
        u_specular             : [1, 1, 1, 1],
        u_shininess            : 50,
        u_specularFactor       : 1,
        u_diffuse              : tex,
        u_viewInverse          : camera,
        u_world                : m4.identity(),
        u_worldInverseTranspose: m4.identity(),
        u_worldViewProjection  : m4.identity(),
      };
      objects.push({
                     ySpeed     : rand(0.1, 0.3),
                     zSpeed     : rand(0.1, 0.3),
                     uniforms   : uniforms,
                     viewElement: viewElement,
                     programInfo: programInfo,
                     bufferInfo : shapes[ii % shapes.length],
                   });
      // list.appendChild(listElement);
      ii++;
    }

    function render(time) {
      time *= 0.001;
      twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
      gl.clearColor(0.8, 0.8, 0.8, 1);
      const eye           = [0, 0, -8];
      const target        = [0, 0, 0];
      const up            = [0, 1, 0];
      const cvs           = gl.canvas as HTMLCanvasElement;
      cvs.style.transform = `translateY(${window.scrollY}px)`;
      m4.lookAt(eye, target, up, camera);
      m4.inverse(camera, view);
      objects.forEach(function (obj) {
        const viewElement                   = obj.viewElement;
        // get viewElement's position
        const [width, height, left, bottom] = getbbox(viewElement, cvs);
        if (width === 0) {
          return; // it's off screen, do not render
        }
        // console.log(viewElement)
        gl.viewport(left, bottom, width, height);
        gl.scissor(left, bottom, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const projection = m4.perspective(
          30 * Math.PI / 180,
          width / height,
          0.5,
          100
        );
        m4.multiply(projection, view, viewProjection);
        const uni   = obj.uniforms;
        const world = uni.u_world;

        m4.identity(world);
        m4.rotateY(world, time * obj.ySpeed, world);
        m4.rotateZ(world, time * obj.zSpeed, world);
        m4.transpose(m4.inverse(world, uni.u_worldInverseTranspose), uni.u_worldInverseTranspose);
        m4.multiply(viewProjection, uni.u_world, uni.u_worldViewProjection);
        gl.useProgram(obj.programInfo.program);
        twgl.setBuffersAndAttributes(gl, obj.programInfo, obj.bufferInfo);
        twgl.setUniforms(obj.programInfo, uni);
        twgl.drawBufferInfo(gl, obj.bufferInfo);
      });
    }

    const animated = true;
    let requestId;
    const renderContinuously = function (time) {
      // console.log(`render ${requestId}`);
      renderRequest(time);
      start();
    };
    const renderRequest = function (time) {
      render(time);
      requestId = undefined;
    };
    // If animated
    const queueRender   = function () {
      if (!requestId) {
        requestId = requestAnimationFrame(renderRequest);
      }
    };
    function start() {
      if (!requestId) {
        requestId = window.requestAnimationFrame(renderContinuously);
      }
    }
    function stop() {
      if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = undefined;
      }
    }

    stop()
    if (animated && origins.length) {
      start();
      return () => {
       stop()
      };
    } else {

      window.addEventListener('resize', queueRender);
      window.addEventListener('scroll', queueRender);
      queueRender();
      return () => {
        stop();
        window.removeEventListener('resize', queueRender);
        window.removeEventListener('scroll', queueRender);

      };
    }
  }, [canv, origins]);
}
