/**
 * Renders a template preview element (#pdf-print-area) into an A4 PDF and
 * downloads it. Shared by the invoice and quote previews.
 */
export const downloadPdfFromElement = async (
  element: HTMLElement,
  filename: string,
): Promise<void> => {
    const images = Array.from(
      element.querySelectorAll("img")
    ) as HTMLImageElement[];
    const imageConversions: Array<{
      img: HTMLImageElement;
      originalSrc: string;
      dataUrl: string;
    }> = [];

    for (const img of images) {
      if (img.src && !img.src.startsWith("data:")) {
        try {
          const corsImage = new Image();
          corsImage.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            corsImage.onload = () => resolve();
            corsImage.onerror = () => {
              const fallbackImage = new Image();
              fallbackImage.onload = () => {
                Object.assign(corsImage, {
                  width: fallbackImage.width,
                  height: fallbackImage.height,
                  naturalWidth: fallbackImage.naturalWidth,
                  naturalHeight: fallbackImage.naturalHeight,
                });
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width =
                  fallbackImage.naturalWidth || fallbackImage.width;
                tempCanvas.height =
                  fallbackImage.naturalHeight || fallbackImage.height;
                const tempCtx = tempCanvas.getContext("2d");
                if (tempCtx) {
                  try {
                    tempCtx.drawImage(fallbackImage, 0, 0);
                    resolve();
                  } catch (e) {
                    reject(e);
                  }
                } else {
                  reject(new Error("Could not get canvas context"));
                }
              };
              fallbackImage.onerror = reject;
              fallbackImage.src = img.src;
            };
            corsImage.src = img.src;
          });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          canvas.width =
            corsImage.naturalWidth ||
            corsImage.width ||
            img.naturalWidth ||
            img.width;
          canvas.height =
            corsImage.naturalHeight ||
            corsImage.height ||
            img.naturalHeight ||
            img.height;

          ctx.drawImage(corsImage, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");

          imageConversions.push({
            img,
            originalSrc: img.src,
            dataUrl,
          });
        } catch (error) {
          console.error("Failed to convert image:", img.src, error);
        }
      }
    }

    imageConversions.forEach(({ img, dataUrl }) => {
      img.src = dataUrl;
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    const html2pdf = await import("html2pdf.js");
    const opt = {
      margin: 0,
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: 1200,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    // Temporarily apply PDF-specific padding offsets to DOM before canvas snapshot
    const ths = element.querySelectorAll("th");
    const tds = element.querySelectorAll("td");
    const balanceBox = element.querySelector("#balance-due-box");

    const prevThPaddings = Array.from(ths).map(
      (th) => (th as HTMLElement).style.padding,
    );
    const prevTdPaddings = Array.from(tds).map(
      (td) => (td as HTMLElement).style.padding,
    );
    const prevBalancePadding =
      (balanceBox as HTMLElement)?.style.padding || "";

    ths.forEach((th) => {
      (th as HTMLElement).style.padding = "2px 12px 15px 12px";
    });
    tds.forEach((td) => {
      (td as HTMLElement).style.padding = "2px 12px 8px 12px";
    });
    if (balanceBox) {
      (balanceBox as HTMLElement).style.padding = "2px 14px 15px 14px";
    }

    try {
      await html2pdf.default().from(element).set(opt).save();
    } finally {
      // Restore clean on-screen UI styling immediately
      ths.forEach((th, i) => {
        (th as HTMLElement).style.padding = prevThPaddings[i];
      });
      tds.forEach((td, i) => {
        (td as HTMLElement).style.padding = prevTdPaddings[i];
      });
      if (balanceBox) {
        (balanceBox as HTMLElement).style.padding = prevBalancePadding;
      }
    }

    imageConversions.forEach(({ img, originalSrc }) => {
      img.src = originalSrc;
    });
};
