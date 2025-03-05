import { useEffect, useState } from 'react';

/**
 * useWindowWidth
 *
 * @description Un hook que obtiene el ancho actual de la ventana y
 * lo actualiza automáticamente al redimensionar.
 *
 * @returns El ancho actual de la ventana del navegador (número).
 *
 * @example
 * // Ejemplo de uso en un componente funcional:
 * import React from 'react';
 * import { useWindowWidth } from 'my-react-hooks';
 *
 * function Demo() {
 *   const width = useWindowWidth();
 *   return <div>El ancho de la ventana es: {width}px</div>;
 * }
 */
export function useWindowWidth(): number {
    const [width, setWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return width;
}
