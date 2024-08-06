import { getSaveLocation } from '../../utils/helper';

const { join } = window.require('path');

const savedLocation = getSaveLocation();
export const imageCopyPrefix = join(savedLocation, "images/copy");
export const imagePastePrefix = join(savedLocation, "images/paste");

export const SHORTCUTS = {
  // '*': 'list-item',
  // '+': 'list-item',
  '-': 'bulleted-list-item',
  '1.': 'numbered-list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
  '[]': 'check-list',
  // '```': 'block-code-line'
};


export const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+Enter': 'newLine',
};

export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export const DEFAULT_NOTE = [
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
];
