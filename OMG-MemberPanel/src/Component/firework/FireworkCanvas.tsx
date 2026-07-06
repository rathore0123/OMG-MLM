// import React, { useRef, useEffect } from 'react';
// import { dynamicImage } from '../../Service'
// import { H2, Image, P,H4,Btn } from '../../AbstractElements'
// interface FireworkCardProps {
//   width: number;
//   height: number;
// }

// const FireworkCanvas: React.FC<FireworkCardProps> = ({ width, height }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Set canvas size to match the card
//     canvas.width = width;
//     canvas.height = height;

//     let fireworks: any[] = [];
//     const particlesPerFirework = 50;

//     const createFirework = (x: number, y: number) => {
//       for (let i = 0; i < particlesPerFirework; i++) {
//         const angle = (Math.PI * 2 * i) / particlesPerFirework;
//         const speed = Math.random() * 2 + 2;
//         fireworks.push({
//           x,
//           y,
//           dx: Math.cos(angle) * speed,
//           dy: Math.sin(angle) * speed,
//           alpha: 1,
//           color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`,
//         });
//       }
//     };

//     const updateFireworks = () => {
//       fireworks = fireworks.filter(firework => firework.alpha > 0);
//       fireworks.forEach(firework => {
//         firework.x += firework.dx;
//         firework.y += firework.dy;
//         firework.alpha -= 0.02;
//         ctx.globalAlpha = firework.alpha;
//         ctx.fillStyle = firework.color;
//         ctx.beginPath();
//         ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
//         ctx.fill();
//       });
//     };

//     const animate = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       updateFireworks();
//       requestAnimationFrame(animate);
//     };

//     const launchRandomFirework = () => {
//       const x = Math.random() * width;
//       const y = Math.random() * height / 2;
//       createFirework(x, y);
//     };

//     animate();

//     const fireworkInterval = setInterval(launchRandomFirework, 800);

//     return () => {
//       clearInterval(fireworkInterval);
//     };
//   }, [width, height]);


//   return (
//     <div style={{ height, width:'100%', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
//       <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width:'100%' }} />
//       <div style={{ position: 'relative', zIndex: 1,  }}>
//         <Image alt="Diwali-img" style={{width:'160px'}} src={dynamicImage("diwali-2024.gif")}/>
//         {/* <h2>Happy Diwali</h2> */}
//         <P>Wishing you a Diwali filled with sparkling joy, boundless prosperity, and moments of cherished light. Happy Diwali!</P>
//       </div>
//     </div>
//   );
// };

// export default FireworkCanvas;


import { Fireworks as FireworksJs } from 'fireworks-js'
import type { FireworksOptions } from 'fireworks-js'
import React, { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { dynamicImage } from '../../Service'
import { H2, Image, P,H4,Btn } from '../../AbstractElements'


type FireworksProps = {
    children?: React.ReactNode
    options?: FireworksOptions
    style?: CSSProperties
    soundSrc?: string // New prop for sound source
  }

  const FireworkCanvas = ({ children, options, style, soundSrc  }: FireworksProps) => {
    const container = useRef<HTMLDivElement>(null)
    const fireworks = useRef<FireworksJs | null>(null)
    // const audioRef = useRef<HTMLAudioElement | null>(null)
  
    useEffect(() => {
      fireworks.current = new FireworksJs(container.current!, options)
      fireworks.current.start()

        // Play the sound if soundSrc is provided
    // if (soundSrc && audioRef.current) {
    //     audioRef.current.play().catch((error) => {
    //       console.error("Error playing sound:", error);
    //     });
    //   }
  
  
      return () => {
        fireworks.current!.stop()
      }
    }, [])
  
    return (
      <div
        ref={container}
        style={style}
      >
        
        {children}
        {/* {soundSrc && (
        <audio ref={audioRef} src={soundSrc} loop>
          Your browser does not support the audio element.
        </audio>
      )} */}
      </div>
    )
  }
  
  export { FireworkCanvas }
  export type { FireworksOptions }
  export default FireworkCanvas
