varying vec3 vNormal;
  
uniform float uTime;
  
void main() {
    vec3 color = vec3(1.0);
    
    gl_FragColor = vec4(vNormal, 1.0);
}  