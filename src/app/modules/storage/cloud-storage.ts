import axios from 'axios';

interface CloudStorageOptions {
    url?: string;
    uploadPreset?: string;
}

export class CloudStorage {
    private _url: string;
    private _uploadPreset: string;

    constructor({ url, uploadPreset }: CloudStorageOptions) {
        this._url = url;
        this._uploadPreset = uploadPreset;
    }

    public async upload(imageBlob: Blob): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', imageBlob);
            formData.append('upload_preset', this._uploadPreset);

            const response = await axios.post(this._url, formData);
            return response.data.secure_url;
        } catch (error) {
            console.error('Failed to upload file', error.response);
        }
    }
}