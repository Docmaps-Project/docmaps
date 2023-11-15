import { svg } from 'lit';

export const closeDetailsButton = (color: string) => svg`
<svg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <circle stroke='${color}' cx='15' cy='15' r='14.5'/>
  <path fill='${color}' fill-rule='evenodd' clip-rule='evenodd' d='M16.41 15L20.7 10.71C20.89 10.53 21 10.28 21 10C21 9.45 20.55 9 20 9C19.72 9 19.47 9.11 19.29 9.29L15 13.59L10.71 9.29C10.53 9.11 10.28 9 10 9C9.45 9 9 9.45 9 10C9 10.28 9.11 10.53 9.29 10.71L13.59 15L9.3 19.29C9.11 19.47 9 19.72 9 20C9 20.55 9.45 21 10 21C10.28 21 10.53 20.89 10.71 20.71L15 16.41L19.29 20.7C19.47 20.89 19.72 21 20 21C20.55 21 21 20.55 21 20C21 19.72 20.89 19.47 20.71 19.29L16.41 15Z'/>
</svg>
`;
