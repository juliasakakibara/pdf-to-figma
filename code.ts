// Lógica principal do plugin PDF to Figma
figma.showUI(__html__, { width: 400, height: 300 });

let lastFrameX = figma.viewport.center.x; // Posição inicial do primeiro frame

figma.ui.onmessage = async (msg: {
  type: string;
  pdfWidth?: number;
  pdfHeight?: number;
  paragraphs?: Array<{ text: string; y: number; fontSize: number; items?: Array<{ x: number; width: number }> }>;
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
      // Calcular posição X e largura do parágrafo
      let paraX = 0;
      let paraWidth = msg.pdfWidth - 16;
      if (para.items && para.items.length > 0) {
        paraX = Math.min(...para.items.map(i => i.x));
        const maxX = Math.max(...para.items.map(i => i.x + i.width));
        paraWidth = maxX - paraX;
      }
      const textNode = figma.createText();
      textNode.fontName = { family: "Inter", style: "Regular" };
      textNode.characters = para.text;
      textNode.fontSize = para.fontSize;
      textNode.x = paraX;
      textNode.y = para.y;
      textNode.textAutoResize = 'HEIGHT';
      textNode.resize(paraWidth, textNode.height);
      frame.appendChild(textNode);
    }
    figma.currentPage.appendChild(frame);
    figma.viewport.scrollAndZoomIntoView([frame]);
    figma.notify(`Página ${msg.pageNum || 1} importada!`);
    // figma.closePlugin();
  }
};