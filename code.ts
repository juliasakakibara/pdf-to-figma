// Lógica principal do plugin PDF to Figma
figma.showUI(__html__, { width: 400, height: 300 });

figma.ui.onmessage = async (msg: {
  type: string;
  pdfWidth?: number;
  pdfHeight?: number;
  items?: Array<{ str: string; x: number; y: number; fontSize: number; width: number; height: number }>;
  pageNum?: number;
}) => {
  if (msg.type === 'import-pdf-layout' && msg.items && msg.pdfWidth && msg.pdfHeight) {
    const frame = figma.createFrame();
    frame.resize(msg.pdfWidth, msg.pdfHeight);
    frame.x = figma.viewport.center.x - msg.pdfWidth / 2;
    frame.y = figma.viewport.center.y - msg.pdfHeight / 2;
    frame.name = `PDF Página ${msg.pageNum || 1}`;

    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    for (const item of msg.items) {
      if (item.str.trim().length === 0) continue;
      const textNode = figma.createText();
      textNode.fontName = { family: "Inter", style: "Regular" };
      textNode.characters = item.str;
      textNode.fontSize = item.fontSize;
      textNode.x = item.x;
      textNode.y = item.y - item.height;
      frame.appendChild(textNode);
    }

    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);
    figma.notify(`Página ${msg.pageNum || 1} importada!`);
    // figma.closePlugin();
  }
};