
// Function to download the specific element as an image
export const downloadAsImage = async (element: HTMLElement, filename: string) => {
  try {
    // Dynamically import html-to-image to avoid package.json modifications
    // @ts-ignore
    const { toPng } = await import('https://esm.sh/html-to-image@1.11.11');

    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2, // Higher resolution
      backgroundColor: '#ffffff',
      cacheBust: true, // Attempt to bypass CORS caching
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Image generation failed:', err);
    throw new Error('無法產生圖片，這可能是因為跨網域圖片(CORS)問題。');
  }
};
