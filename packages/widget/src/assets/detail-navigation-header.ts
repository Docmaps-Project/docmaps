import { nothing, svg, SVGTemplateResult } from 'lit';
import { DisplayObject, TYPE_DISPLAY_OPTIONS } from '../constants';

const backButton = (
  allNodes: DisplayObject[],
  selectedNode: DisplayObject,
  updateSelectedNode: (node: DisplayObject) => void,
) => {
  const selectedIndex = allNodes.findIndex((node) => node.nodeId === selectedNode.nodeId);
  const previousIndex = selectedIndex > 0 ? selectedIndex - 1 : allNodes.length - 1;
  const previousNode = allNodes[previousIndex];
  return svg`
    <svg class='docmaps-timeline-back clickable' width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'
        @click='${() => updateSelectedNode(previousNode)}'>
      <circle cx='17.5' cy='17.5' r='17' stroke='#474747'/>
      <path transform='scale(-1,1) translate(-35,0)' d='M22.5 17.134C23.1667 17.5189 23.1667 18.4811 22.5 18.866L10.5 25.7942C9.83333 26.1791 9 25.698 9 24.9282L9 11.0718C9 10.302 9.83333 9.82087 10.5 10.2058L22.5 17.134Z' fill='#474747'/>
      <path transform='scale(-1,1) translate(-35,0)'  d='M24 10L24 26' stroke='#474747' stroke-width='2' stroke-linecap='round'/>
    </svg>`;
};

const forwardButton = (
  allNodes: DisplayObject[],
  selectedNode: DisplayObject,
  updateSelectedNode: (node: DisplayObject) => void,
) => {
  const index = allNodes.findIndex((node) => node.nodeId === selectedNode.nodeId);
  const nextIndex = index < allNodes.length - 1 ? index + 1 : 0;
  const nextNode = allNodes[nextIndex];
  return svg`
    <svg class='docmaps-timeline-forward clickable' width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'
        @click='${() => updateSelectedNode(nextNode)}'>
      <circle cx='17.5' cy='17.5' r='17' stroke='#474747'/>
      <path d='M22.5 17.134C23.1667 17.5189 23.1667 18.4811 22.5 18.866L10.5 25.7942C9.83333 26.1791 9 25.698 9 24.9282L9 11.0718C9 10.302 9.83333 9.82087 10.5 10.2058L22.5 17.134Z' fill='#474747'/>
      <path d='M24 10L24 26' stroke='#474747' stroke-width='2' stroke-linecap='round'/>
    </svg>`;
};

const makeTimeline = (
  allNodes: DisplayObject[],
  selectedNode: DisplayObject,
  updateSelectedNode: (node: DisplayObject) => void,
) => {
  const width = 368;
  const firstXPosition: number = 6.5;
  const lastXPosition: number = 358.5;

  const timelineNodes = allNodes.map((node, i) => {
    let x = firstXPosition;
    if (i > 0) {
      const spaceBetweenNodes: number = (lastXPosition - firstXPosition) / (allNodes.length - 1);
      x = firstXPosition + spaceBetweenNodes * i;
    }
    const displayOpts = TYPE_DISPLAY_OPTIONS[node.type];
    const color = displayOpts.detailBackgroundColor ?? displayOpts.backgroundColor;

    const selectedNodeIndicator =
      node.nodeId === selectedNode.nodeId
        ? svg`
          <circle class='selected-node-outline' cx='${x}' cy='6.5' r='5.5' stroke='${color}'/> 
          <path class='selected-node-line' d='M${x} 7L${x} 35' stroke='${color}' stroke-linecap='round'/>`
        : nothing;
    return svg`
      <circle class='timeline-node clickable' cx='${x}' cy='6.5' r='3.5' fill='${color}'
        @click='${() => updateSelectedNode(node)}'/>
      ${selectedNodeIndicator}
    `;
  });

  return svg`
    <svg width='${width}' height='35' viewBox='0 0 ${width} 35' fill='none' xmlns='http://www.w3.org/2000/svg' style='align-self: end;'>
      <line x1='3' y1='6.75' x2='${width - 6}' y2='6.75' stroke='#777777' stroke-width='0.5'/>
      ${timelineNodes}
    </svg>`;
};

export const renderDetailNavigationHeader: (
  allNodes: DisplayObject[],
  selectedNode: DisplayObject,
  updateSelectedNode: (node: DisplayObject) => void,
) => SVGTemplateResult = (
  allNodes: DisplayObject[],
  selectedNode: DisplayObject,
  updateSelectedNode,
) => svg`
  ${backButton(allNodes, selectedNode, updateSelectedNode)}
  ${forwardButton(allNodes, selectedNode, updateSelectedNode)}
  ${makeTimeline(allNodes, selectedNode, updateSelectedNode)}`;
