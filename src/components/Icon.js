import { createFromIconfontCN } from '@ant-design/icons';

const EditorIcon = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/c/font_4396576_7hyg3okrvrt.js', // 在 iconfont.cn 上生成, 需要加http，不然打包后不能访问；
});

export default EditorIcon;
