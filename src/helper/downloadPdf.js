import { pdf } from "@react-pdf/renderer";

const downloadPdf = async (doc) => {
  let url = "";
  try {
    const blob = await pdf(doc).toBlob();
    url = URL.createObjectURL(blob);

    const response = await fetch(url);
    const blobData = await response.blob();
    const blobUrl = window.URL.createObjectURL(blobData);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `data-${Date.now()}.pdf`;
    link.click();

  } catch (error) {
    console.error("Error in download process:", error);
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

export default downloadPdf;

