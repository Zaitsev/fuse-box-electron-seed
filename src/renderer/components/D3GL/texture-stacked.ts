import React, {useEffect}                  from "react";
import twgl, {BufferInfo, m4, ProgramInfo} from "twgl.js";
import chroma                              from "chroma-js";
import {vs, fs}                            from "./shaders/texture-stacked";
import Mat4 = m4.Mat4;
import {OriginList}                        from "~/renderer/components/D3GL/index";

const list_item_template = `
    <div class="view"></div>
    <div class="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget enim mauris. In quis orci augue. Suspendisse aliquam enim non sem scelerisque pulvinar. Vestibulum elementum rhoncus tortor, a dapibus massa maximus vel. Praesent feugiat rutrum est a feugiat. Nam quis metus in arcu hendrerit molestie. Donec tempor purus id egestas convallis. Etiam libero nulla, gravida a eros at, blandit varius risus. Vivamus ut dui mi.</div>
`;
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

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setRectangle(gl: WebGL2RenderingContext, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.

  return gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                                                           x1, y1,
                                                           x2, y1,
                                                           x1, y2,
                                                           x1, y2,
                                                           x2, y1,
                                                           x2, y2]), gl.STATIC_DRAW);
}

// function drawRect(gl:WebGL2RenderingContext) {
//   // Setup a random rectangle
//   setRectangle(
//     gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
//
//   // Set a random color.
//   gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
//
//   // Draw the rectangle.
//   var primitiveType = gl.TRIANGLES;
//   var offset = 0;
//   var count = 6;
//   gl.drawArrays(primitiveType, offset, count);
// }

export function useTwglEffect(canv: React.RefObject<HTMLCanvasElement>,
                              origins: OriginList[]
) {
  useEffect(() => {
    if (canv.current === null) {
      return;
    }
    console.log('------ texture_data ------');
    twgl.setDefaults({attribPrefix: "a_"});
    const m4 = twgl.m4;
    if (canv.current === null) {
      return;
    }
    const gl = canv.current.getContext('webgl2',
                                       {
                                         desynchronized       : true,
                                         preserveDrawingBuffer: true
                                       }
    )!;
    // if (gl.getContextAttributes().desynchronized) {
    //   console.log('Low latency canvas supported. Yay!');
    // } else {
    //   console.log('Low latency canvas not supported. Boo!');
    // }
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    const shapes = [
      // twgl.primitives.createCubeBufferInfo(gl, 2),
      // twgl.primitives.createSphereBufferInfo(gl, 1, 24, 12),
      twgl.primitives.createPlaneBufferInfo(gl, 1, 1,),
      twgl.primitives.createTruncatedConeBufferInfo(gl, 1, 0, 2, 24, 1),
      twgl.primitives.createCresentBufferInfo(gl, 1, 1, 0.5, 0.1, 24),
      twgl.primitives.createCylinderBufferInfo(gl, 1, 2, 24, 2),
      // twgl.primitives.createDiscBufferInfo(gl, 1, 24),
      // twgl.primitives.createTorusBufferInfo(gl, 1, 0.4, 24, 12),
    ];

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    // Shared values
    const lightWorldPosition = [1, 8, -10];
    const lightColor         = [1, 1, 1, 1];
    const camera             = m4.identity();
    const view               = m4.identity();
    const viewProjection     = m4.identity();
    // const tex                  = twgl.createTexture(gl, {
    //   min: gl.NEAREST,
    //   mag: gl.NEAREST,
    //   src: [
    //     255, 255, 255, 255,
    //     192, 192, 192, 255,
    //     192, 192, 192, 255,
    //     255, 255, 255, 255,
    //   ],
    // });
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
      const viewElement = orig.ref as HTMLDivElement;
      const uniforms    = {
        u_lightWorldPos        : lightWorldPosition,
        u_lightColor           : lightColor,
        u_diffuseMult          : chroma.hsv(rand(0, 360), 0.4, 0.8).gl(),
        u_specular             : [1, 1, 1, 1],
        u_shininess            : 50,
        u_specularFactor       : 1,
        // u_diffuse              : tex,
        u_viewInverse          : camera,
        u_world                : m4.identity(),
        u_worldInverseTranspose: m4.identity(),
        u_worldViewProjection  : m4.identity(),
      } as Partial<GLObjectUniforms>;
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

    const Layers = 2;
    const Width  = 200;

    let y_data_color: number[][] | Uint8Array = []; //RGBA colors
    const y_data_tex_f                        = new Float32Array(Width * Layers);
    const x_position                          = new Float32Array(Width);

    for (let i = 1; i < Width; i+=2) {
      x_position[i] = i / Width;
      x_position[i+1] = i / Width;
    }
    y_data_color[0] = chroma.hsv(rand(0, 360), 0.6, 0.8).gl();
    for (let l = 1; l < Layers; l++) {
      y_data_color[l] = chroma.hsv(rand(0, 360), 0.6, 0.8).gl();
      for (let i = l * Width + 1; i < (l + 1) * Width; i++) {
        const x         = i / Width;
        const y         = 0.15 * Layers * Math.sin((10 * l + 1) * x * 2 * 3.14);
        y_data_tex_f[i] = Math.abs(y);
      }
    }
    y_data_color = new Uint8Array(y_data_color.flat().map(e => e * 255));

    function render(time) {
      time *= 0.001;
      twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
      gl.clearColor(0.8, 0.8, 0.8, 1);
      const eye           = [0, 0, -1];
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
        gl.useProgram(obj.programInfo.program);
        //------------------------ SET WORLD ------------------------
        const projection = m4.perspective(
          60 * Math.PI / 180,
          // width / height, //Natural
          0.5, //fill rect
          0.5,
          100
        );
        m4.multiply(projection, view, viewProjection);
        const uni   = obj.uniforms;
        const world = uni.u_world;

        m4.identity(world);
        // m4.rotateX(world, time * obj.ySpeed, world);
        // m4.rotateY(world, time * obj.ySpeed, world);
        // m4.rotateZ(world, time * obj.zSpeed, world);
        // m4.transpose(m4.inverse(world, uni.u_worldInverseTranspose), uni.u_worldInverseTranspose);
        m4.multiply(viewProjection, uni.u_world, uni.u_worldViewProjection);
        // uni.u_worldInverseTranspose = m4.identity()
        //------------------------ MY DATA ------------------------

        // y_data_color = new Uint8Array([
        //                                   ...chroma.hex('#FF0000').rgba(),
        //                                   ...chroma.hex('#FFFFFF').rgba(),
        //                                 ]);
        // console.log(y_data_color)
        // console.log(y_data_tex);
        /**
         * https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
         *
         *  !! R32F is not filterable - Not texture filterable means they must be
         * used with gl.NEAREST only
         * @type {{[p: string]: WebGLTexture}}
         */
        const textures = twgl.createTextures(gl, {
          u_y_color: {
            target: gl.TEXTURE_2D,
            mag   : gl.NEAREST,
            min   : gl.NEAREST,
            wrap  : gl.CLAMP_TO_EDGE,
            level : 0,
            // format        : gl.RGBA,
            // internalFormat: gl.R16F,
            src   : y_data_color as Uint8Array,
            height: 1,
            width : Layers,

          },

          u_y_data: {
            target        : gl.TEXTURE_2D_ARRAY,
            // wrap          : gl.CLAMP_TO_EDGE,
            level         : 0,
            mag           : gl.NEAREST,
            min           : gl.NEAREST,
            format        : gl.RED,
            internalFormat: gl.R32F,
            src           : y_data_tex_f,
            depth         : Layers,
            height        : 1,
            width         : Width,
            type          : gl.FLOAT,
          },
        });

        const bufferInfo = {
          attribs    : {
            a_x_position: {
              buffer       : twgl.createBufferFromTypedArray(gl, x_position),
              numComponents: 1,
            },
          },
          numElements: x_position.length
        } as BufferInfo;
        // console.log(y_data_tex.length)

        // const  texture2D = gl.createTexture();
        // gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture2D);
        // console.log(gl.getParameter(gl.TEXTURE_BINDING_2D_ARRAY));
        // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texImage3D(
        //   gl.TEXTURE_2D_ARRAY,
        //   0,
        //   gl.R32F,
        //   Width,
        //   1,
        //   Layers,
        //   0,
        //   gl.RED,
        //   gl.FLOAT,
        //   y_data_tex_f
        // );
        // uni.y_data = texture2D
        uni.u_y_data  = textures.u_y_data;
        uni.u_y_color = textures.u_y_color;

        twgl.setBuffersAndAttributes(gl, obj.programInfo, bufferInfo);
        twgl.setUniforms(obj.programInfo, uni);
        // console.log('drawing');
        gl.activeTexture(gl.TEXTURE0);
        twgl.drawBufferInfo(gl, bufferInfo, gl.LINE_STRIP, undefined, undefined, Layers);
        // twgl.setBuffersAndAttributes(gl, obj.programInfo, obj.bufferInfo);
        // twgl.setUniforms(obj.programInfo, uni);
        // twgl.drawBufferInfo(gl, obj.bufferInfo);
      });
    }

    const animated           = true;
    let requestId;
    const renderContinuously = function (time) {
      // console.log(`render ${requestId}`);
      renderRequest(time);
      start();
    };
    const renderRequest      = function (time) {
      render(time);
      requestId = undefined;
    };
    // If animated
    const queueRender        = function () {
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

    stop();
    if (animated && origins.length) {
      start();
      return () => {
        stop();
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
