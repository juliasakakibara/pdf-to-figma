// Lógica principal do plugin PDF to Figma
figma.showUI(__html__, { width: 400, height: 300 });

let lastFrameX = figma.viewport.center.x; // Posição inicial do primeiro frame

figma.ui.onmessage = async (msg: {
  type: string;
  pdfWidth?: number;
  pdfHeight?: number;
  paragraphs?: Array<{ text: string; y: number; fontSize: number }>;
  pageNum?: number;
}) => {
  if (msg.type === 'import-pdf-layout' && msg.paragraphs && msg.pdfWidth && msg.pdfHeight) {
    const frame = figma.createFrame();
    frame.resize(msg.pdfWidth, msg.pdfHeight);
    frame.x = lastFrameX;
    frame.y = 0;
    frame.name = `PDF Página ${msg.pageNum || 1}`;
    lastFrameX += msg.pdfWidth + 40;

    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    for (const para of msg.paragraphs) {
      if (para.text.trim().length === 0) continue;
      const textNode = figma.createText();
      textNode.fontName = { family: "Inter", style: "Regular" };
      textNode.characters = para.text;
      textNode.fontSize = para.fontSize;
      textNode.x = 0;
      textNode.y = para.y;
      frame.appendChild(textNode);
    }

    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);
    figma.notify(`Página ${msg.pageNum || 1} importada!`);
    // figma.closePlugin();
  }
};