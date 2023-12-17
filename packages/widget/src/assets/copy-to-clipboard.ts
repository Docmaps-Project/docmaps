import { svg } from 'lit';

export const copyToClipboardButton = (value: string) => svg`
  <svg class='copy-to-clipboard-button clickable' width='12' height='14' viewBox='0 0 12 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path class='copy-to-clipboard-button-path' fill='#989898' fill-rule='evenodd' clip-rule='evenodd' d='M7 3H2C1.44772 3 1 3.44772 1 4V12C1 12.5523 1.44772 13 2 13H7C7.55228 13 8 12.5523 8 12V4C8 3.44772 7.55228 3 7 3ZM2 2C0.895431 2 0 2.89543 0 4V12C0 13.1046 0.89543 14 2 14H7C8.10457 14 9 13.1046 9 12V4C9 2.89543 8.10457 2 7 2H2ZM10 1H5C4.44772 1 4 1.44772 4 2V10C4 10.5523 4.44772 11 5 11H10C10.5523 11 11 10.5523 11 10V2C11 1.44772 10.5523 1 10 1ZM5 0C3.89543 0 3 0.895431 3 2V10C3 11.1046 3.89543 12 5 12H10C11.1046 12 12 11.1046 12 10V2C12 0.895431 11.1046 0 10 0H5Z'/>
  </svg>
`;
