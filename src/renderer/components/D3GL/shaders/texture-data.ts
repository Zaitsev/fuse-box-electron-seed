// language=GLSL
export const vs = `#version 300 es
// vertex
precision mediump float;
uniform mat4 u_worldViewProjection;
uniform mediump sampler2DArray u_y_data;
uniform  sampler2D u_y_color;
in float a_x_position;

out vec4 v_instance_color;
void main() {
    //textrure - x (-1..1) => x/2 +0.5 => 0..1 
    float y = texelFetch(u_y_data,ivec3(gl_VertexID,0,gl_InstanceID),0).r;
    v_instance_color = texelFetch(u_y_color,ivec2(gl_InstanceID,0),0);
    vec4 v_position = (u_worldViewProjection * vec4(a_x_position,y, 1., 1.0));
    gl_Position = v_position;
    
}
`;
// language=GLSL
export const fs = `#version 300 es
// fragment
precision mediump float;
in vec4 v_instance_color;
out vec4 outColor;

void main() {

    outColor = v_instance_color;
}
`;
