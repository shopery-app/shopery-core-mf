export const toImageSrc = (image) => {
    if (!image || typeof image !== "string") {
        return "";
    }
    if (image.startsWith("data:") || image.startsWith("http") || image.startsWith("blob:")) {
        return image;
    }
    return `data:image/jpeg;base64,${image}`;
};