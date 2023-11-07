import { svg } from 'lit';

const playButton = svg`
  <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='17.5' cy='17.5' r='17' stroke='#474747'/>
    <path d='M25.5 17.134C26.1667 17.5189 26.1667 18.4811 25.5 18.866L13.5 25.7942C12.8333 26.1791 12 25.698 12 24.9282L12 11.0718C12 10.302 12.8333 9.82087 13.5 10.2058L25.5 17.134Z' fill='#474747'/>
  </svg>`;

const forwardButton = svg`
  <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='17.5' cy='17.5' r='17' stroke='#474747'/>
    <path d='M22.5 17.134C23.1667 17.5189 23.1667 18.4811 22.5 18.866L10.5 25.7942C9.83333 26.1791 9 25.698 9 24.9282L9 11.0718C9 10.302 9.83333 9.82087 10.5 10.2058L22.5 17.134Z' fill='#474747'/>
    <path d='M24 10L24 26' stroke='#474747' stroke-width='2' stroke-linecap='round'/>
    <circle cx='24' cy='18' r='3' fill='#474747'/>
  </svg>`;

const timeline = svg`
  <svg width='362' height='35' viewBox='0 0 362 35' fill='none' xmlns='http://www.w3.org/2000/svg' style='align-self: end;'>
    <line x1='3' y1='6.75' x2='362' y2='6.75' stroke='#777777' stroke-width='0.5'/>
    <path d='M6.5 7L7 35' stroke='#077A12' stroke-linecap='round'/>
    <circle cx='6.5' cy='6.5' r='3.5' fill='#077A12'/>
    <circle cx='6.5' cy='6.5' r='5.5' stroke='#077A12'/>
    <circle cx='94.5' cy='6.5' r='3.5' fill='#077A12'/>
    <circle cx='117.5' cy='6.5' r='3.5' fill='#099CEE'/>
    <circle cx='193.5' cy='6.5' r='3.5' fill='#79109E'/>
    <circle cx='227.5' cy='6.5' r='3.5' fill='#936308'/>
    <circle cx='358.5' cy='6.5' r='3.5' fill='#099CEE'/>
  </svg>`;

export const timelinePlaceholder = svg`
  ${playButton}
  ${forwardButton}
  ${timeline}`;
