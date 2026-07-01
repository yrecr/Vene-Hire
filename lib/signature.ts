export function removeBg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const d = ctx.getImageData(0, 0, c.width, c.height);
      const px = d.data;
      const threshold = 200;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] > threshold && px[i + 1] > threshold && px[i + 2] > threshold) {
          px[i + 3] = 0;
        }
      }
      ctx.putImageData(d, 0, 0);
      c.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
