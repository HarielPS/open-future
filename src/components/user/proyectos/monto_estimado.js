// Función para calcular la ganancia mensual
export const calcularGananciaMensual = (montoInvertir, rendimientoAnual) => {
    // Asegúrate de que ambos valores son números válidos
    montoInvertir = parseFloat(montoInvertir);
    rendimientoAnual = parseFloat(rendimientoAnual);

    if (isNaN(montoInvertir) || isNaN(rendimientoAnual)) {
        return 0;
    }

    // Calcular el rendimiento mensual
    const rendimientoMensual = rendimientoAnual / 12;

    // Calcular la ganancia mensual
    const gananciaMensual = montoInvertir * (rendimientoMensual / 100);

    return gananciaMensual.toFixed(2);
};

// Función para calcular la ganancia total del proyecto
export const calcularGananciaTotal = (montoInvertir, rendimientoAnual, duracionMeses) => {
    // Asegúrate de que todos los valores son números válidos
    montoInvertir = parseFloat(montoInvertir);
    rendimientoAnual = parseFloat(rendimientoAnual);
    duracionMeses = parseFloat(duracionMeses);

    if (isNaN(montoInvertir) || isNaN(rendimientoAnual) || isNaN(duracionMeses)) {
        return 0;
    }

    // Calcular la ganancia mensual usando la función anterior
    const gananciaMensual = calcularGananciaMensual(montoInvertir, rendimientoAnual);

    // Calcular la ganancia total del proyecto
    const gananciaTotal = gananciaMensual * duracionMeses;

    return gananciaTotal.toFixed(2);
};
