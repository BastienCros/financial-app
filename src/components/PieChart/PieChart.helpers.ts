export function computeRadialOffsets(radius: number, strokeWidth: number, k: number) {
    // Stroke visible are between R_in et R_out
    const R_in = radius - strokeWidth / 2;
    const R_out = radius + strokeWidth / 2;

    // Set Gradient radius to the outer edge
    const r_grad = R_out;

    // Start of stroke (normalised)
    const offsetIn = R_in / r_grad;

    const epsilon = 0.5; // inward shift in pixels

    // Transition between light and dark stroke
    // k = proportion of each
    const transitionRadius = R_in + k * strokeWidth - epsilon;
    // Normalized
    const offsetTransition = transitionRadius / r_grad;

    // Outer edge
    const offsetOut = 1; // = R_out / r_grad

    return { R_out, offsetIn, offsetTransition, offsetOut };
}