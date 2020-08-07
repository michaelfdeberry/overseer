export enum WebcamOrientationType {
  Default = 'default',
  FlippedVertically = 'flip-vertically',
  FlippedHorizontally = 'flip-horizontally'
}

export const WebcamOrientationOptions = [
  { value: WebcamOrientationType.Default, text: 'Default' },
  { value: WebcamOrientationType.FlippedVertically, text: 'Flipped Vertical' },
  { value: WebcamOrientationType.FlippedHorizontally, text: 'Flipped Horizontal' }
];
