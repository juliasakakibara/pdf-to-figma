// Lógica principal do plugin PDF to Figma
figma.showUI(__html__, { width: 400, height: 300 });

let importedFrames: FrameNode[] = [];
figma.ui.onmessage = async (msg: {
  type: string;
  pdfWidth?: number;
  pdfHeight?: number;
  paragraphs?: Array<{ text: string; y: number; fontSize: number; items?: Array<{ x: number; width: number }> }>;
  pageNum?: number;
  maxFramesPerRow?: number;
}) => {
  if (msg.type === 'import-pdf-layout' && msg.paragraphs && msg.pdfWidth && msg.pdfHeight) {
    const maxFramesPerRow = msg.maxFramesPerRow || 30;
    const frameWidth = msg.pdfWidth;
    const frameHeight = msg.pdfHeight;
    const frameSpacing = 40;
    // Calcula posição do frame baseado no grid estilo slides
    const frameIndex = msg.pageNum ? (msg.pageNum - 1) : 0;
    const col = frameIndex % maxFramesPerRow;
    const row = Math.floor(frameIndex / maxFramesPerRow);
    const frameX = col * (frameWidth + frameSpacing);
    const frameY = row * (frameHeight + frameSpacing);
    const frame = figma.createFrame();
    frame.resize(frameWidth, frameHeight);
    frame.x = frameX;
    frame.y = frameY;
    frame.name = `PDF Página ${msg.pageNum || 1}`;
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    for (const para of msg.paragraphs) {
      if (para.text.trim().length === 0) continue;
      let paraX = 0;
      let paraWidth = frameWidth - 16;
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
    importedFrames.push(frame);
    figma.notify(`Página ${msg.pageNum || 1} importada!`);
    // Ao final da última página, dar scroll para todos os frames
    if (msg.pageNum === figma.currentPage.children.length) {
      figma.viewport.scrollAndZoomIntoView(importedFrames);
      importedFrames = [];
    }
    // figma.closePlugin();
  }
};