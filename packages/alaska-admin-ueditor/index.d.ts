import { Plugin } from 'alaska';

export default class UEditorPlugin extends Plugin {
}

export interface UEditorConfig {
  UEDITOR_HOME_URL?: string;
  serverUrl?: string;
  imageActionName?: string;
  scrawlActionName?: string;
  videoActionName?: string;
  fileActionName?: string;
  imageFieldName?: string;
  imageMaxSize?: number;
  imageUrlPrefix?: string;
  scrawlUrlPrefix?: string;
  videoUrlPrefix?: string;
  fileUrlPrefix?: string;
  catcherLocalDomain?: string;
  toolbars?: string[][];
  labelMap?: {
    [key: string]: string;
  };
  lang?: string;
  langPath?: string;
  theme?: string;
  themePath?: string;
  zIndex?: number;
  charset?: string;
  customDomain?: boolean;
  isShow?: boolean;
  textarea?: string;
  initialContent?: string;
  autoClearinitialContent?: string;
  focus?: boolean;
  initialStyle?: string;
  iframeJsUrl?: string;
  iframeCssUrl?: string;
  indentValue?: string;
  initialFrameWidth?: number;
  initialFrameHeight?: number;
  readonly?: boolean;
  autoClearEmptyNode?: boolean;
  enableAutoSave?: boolean;
  saveInterval?: number;
  enableDragUpload?: boolean;
  enablePasteUpload?: boolean;
  imageScaleEnabled?: boolean;
  fullscreen?: boolean;
  imagePopup?: boolean;
  autoSyncData?: boolean;
  emotionLocalization?: boolean;
  retainOnlyLabelPasted?: boolean;
  pasteplain?: boolean;
  filterTxtRules?: Function;
  allHtmlEnabled?: boolean;
  insertorderedlist?: {
    [key: string]: string;
  };
  insertunorderedlist?: {
    [key: string]: string;
  };
  listDefaultPaddingLeft?: number;
  listiconpath?: string;
  maxListLevel?: number;
  autoTransWordToList?: boolean;
  fontfamily?: Array<{ label: string; name: string; val: string }>;
  fontsize?: number[];
  paragraph?: {
    [key: string]: string;
  };
  rowspacingtop?: string[];
  rowspacingbottom?: string[];
  lineheight?: string[];
  customstyle?: Array<{ tag: string; name: string; label: string; style: string; }>;
  enableContextMenu?: boolean;
  contextMenu?: Array<{
    label: string;
    cmdName: string;
    exec: Function;
  }>;
  shortcutMenu?: string[];
  elementPathEnabled?: boolean;
  wordCount?: boolean;
  maximumWords?: number;
  wordCountMsg?: string;
  wordOverFlowMsg?: string;
  tabSize?: number;
  removeFormatTags?: string;
  removeFormatAttributes?: string;
  maxUndoCount?: number;
  maxInputCount?: number;
  autoHeightEnabled?: boolean;
  scaleEnabled?: boolean;
  minFrameWidth?: number;
  minFrameHeight?: number;
  autoFloatEnabled?: boolean;
  topOffset?: number;
  toolbarTopOffset?: number;
  catchRemoteImageEnable?: boolean;
  pageBreakTag?: string;
  autotypeset?: {
    mergeEmptyline?: boolean;
    removeClass?: boolean;
    removeEmptyline?: boolean;
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    imageBlockLine?: 'left' | 'right' | 'center' | 'none';
    pasteFilter: boolean;
    clearFontSize: boolean;
    clearFontFamily: boolean;
    removeEmptyNode: boolean;
    removeTagNames: {
      [tag: string]: 1;
    };
    indent: boolean;
    indentValue: string;
    bdc2sb: boolean;
    tobdc: boolean;
  };
  tableDragable?: boolean;
  sourceEditor?: 'codemirror' | 'textarea';
  codeMirrorJsUrl?: string;
  codeMirrorCssUrl?: string;
  sourceEditorFirst?: boolean;
  iframeUrlMap?: {
    [key: string]: string;
  };
  allowLinkProtocols?: string[];
  webAppKey?: string;
  disabledTableInTable?: boolean;
  allowDivTransToP?: boolean;
  rgb2Hex?: boolean;
  xssFilterRules?: boolean;
  inputXssFilter?: boolean;
  outputXssFilter?: boolean;
  whitList?: {
    [tag: string]: string[];
  };
}
