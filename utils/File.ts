export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const getFileIcon = (fileName: string, mimeType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf': return 'picture-as-pdf'
        case 'doc':
        case 'docx': return 'description'
        case 'xls':
        case 'xlsx': return 'grid-on'
        case 'ppt':
        case 'pptx': return 'slideshow'
        case 'txt': return 'subject'
        case 'zip':
        case 'rar': return 'folder-zip'
        default:
            if (mimeType.includes('image')) return 'image'
            if (mimeType.includes('audio')) return 'audiotrack'
            if (mimeType.includes('video')) return 'videocam'
            return 'insert-drive-file'
    }
}

export const getFileColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '#F40F02'
    if (mimeType.includes('word')) return '#2B579A'
    if (mimeType.includes('excel')) return '#217346'
    if (mimeType.includes('powerpoint')) return '#D24726'
    if (mimeType.includes('zip')) return '#808080'
    return '#666'
}

export const getMimeType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    switch (extension) {
        case 'pdf': return 'application/pdf'
        case 'doc': return 'application/msword'
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        case 'xls': return 'application/vnd.ms-excel'
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        case 'ppt': return 'application/vnd.ms-powerpoint'
        case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        case 'txt': return 'text/plain'
        default: return 'application/octet-stream'
    }
}

export type FileType =
    | 'image'
    | 'audio'
    | 'video'
    | 'pdf'
    | 'word'
    | 'excel'
    | 'powerpoint'
    | 'text'
    | 'csv'
    | 'archive'
    | 'javascript'
    | 'html'
    | 'css'
    | 'json'
    | 'xml'
    | 'unknown';

export const getFileType = (filename: string, mimeType?: string): FileType => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    // First check by MIME type if available
    if (mimeType) {
        if (mimeType.includes('image/')) return 'image';
        if (mimeType.includes('audio/')) return 'audio';
        if (mimeType.includes('video/')) return 'video';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('msword') || mimeType.includes('wordprocessingml')) return 'word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) return 'excel';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentationml')) return 'powerpoint';
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
        if (mimeType.includes('text/')) return 'text';
    }

    // Then check by file extension
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'svg':
        case 'bmp':
        case 'tiff':
        case 'avif':
            return 'image';

        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'm4a':
        case 'flac':
        case 'aac':
        case 'wma':
            return 'audio';

        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
        case 'webm':
        case 'wmv':
        case 'flv':
            return 'video';

        case 'pdf':
            return 'pdf';

        case 'doc':
        case 'docx':
            return 'word';

        case 'xls':
        case 'xlsx':
            return 'excel';

        case 'ppt':
        case 'pptx':
            return 'powerpoint';

        case 'txt':
        case 'rtf':
        case 'md':
            return 'text';

        case 'csv':
            return 'csv';

        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return 'archive';

        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return 'javascript';

        case 'html':
        case 'htm':
            return 'html';

        case 'css':
            return 'css';

        case 'json':
            return 'json';

        case 'xml':
            return 'xml';

        default:
            return 'unknown';
    }
};

export const getVideoThumbnail = (videoUri: string) => {
    // In a real app, you would generate or fetch a thumbnail for the video
    // This is just a placeholder
    return 'https://placehold.co/250x250?text=Video+Thumbnail';
};
