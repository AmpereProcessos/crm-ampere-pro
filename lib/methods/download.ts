import toast from "react-hot-toast";

export async function handleDownload({ fileName, fileUrl }: { fileName: string; fileUrl: string }) {
	try {
		const downloadLoadingToast = toast.loading("Baixando arquivo...");

		// Fetch the file content as a blob
		const downloadResponse = await fetch(fileUrl);
		const blob = await downloadResponse.blob();

		// Create a blob URL and simulate a click to trigger the download
		const blobUrl = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = fileName; // Specify the desired file name
		link.target = "_blank"; // Open in a new tab/window
		link.rel = "noopener noreferrer"; // Security best practice
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		// Revoke the blob URL to free up resources
		URL.revokeObjectURL(blobUrl);

		// If download went successfully
		toast.dismiss(downloadLoadingToast);
	} catch (error) {
		throw error;
	}
}
