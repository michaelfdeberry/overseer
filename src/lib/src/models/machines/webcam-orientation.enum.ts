export enum WebcamOrientationType {
    Default = '',
    FlippedVertically = 'flip-vertically',
    FlippedHorizontally = 'flip-horizontally'
}

export const WebcamOrientationOptions = [
    { key: WebcamOrientationType.Default, value: '' },
    { key: WebcamOrientationType.FlippedVertically, value: 'Flipped Vertical' },
    { key: WebcamOrientationType.FlippedHorizontally, value: 'Flipped Horizontal' }
];
