import { UploadClient } from '@uploadcare/upload-client';

const apiUrl = 'https://api.uploadcare.com';
const client = new UploadClient({ publicKey:  process.env.UPLOAD_CARE_PUBLIC_KEY});

export const uploadImage = async (files) => {
    try {
        const uploadPromises = files.map(file =>
            client.uploadFile(file.buffer, {
                contentType: file.mimetype
            })
        );
        
    
        const uploadedFiles = await Promise.all(uploadPromises);
        
        const imageUrls = uploadedFiles.map(file => 
            `${file.cdnUrl}-/preview/600x800/-/format/auto/-/quality/smart/`
        );

        
        return {
            success: true,
            url: imageUrls[0]
        };
    } catch (error) {
        console.error('Error in uploadImages function:', error.message);
        console.error('Full error object:', error);
        return {
            success: false,
            message: 'Error uploading images.',
            error: error.message
        };
    }
}


export const deleteFile = async (fileUUID) => {
    try {
        const response = await axios.delete(`${apiUrl}/files/${fileUUID}/`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.UPLOAD_CARE_PUBLIC_KEY}:${process.env.UPLOAD_CARE_SECRET_KEY}`).toString('base64')}`
            }
        });
        
        console.log('File deleted successfully:', response.data);
        return {
            success: true,
            message: 'File deleted successfully.'
        };
    } catch (error) {
        console.error('Error deleting file:', error.message);
        console.error('Full error object:', error);
        return {
            success: false,
            error: 'Error deleting file'
        };
    }
};