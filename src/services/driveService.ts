export const driveService = {
  async init(accessToken: string) {
    const FOLDER_NAME = 'FinTrack_Data';
    const FILE_NAME = 'transactions.json';

    // 1. Find or create folder
    let folderId = await this.findFile(accessToken, FOLDER_NAME, "application/vnd.google-apps.folder");
    if (!folderId) {
      folderId = await this.createFolder(accessToken, FOLDER_NAME);
    }

    // 2. Find or create file
    let fileId = await this.findFile(accessToken, FILE_NAME, "application/json", folderId);
    if (!fileId) {
      fileId = await this.createFile(accessToken, FILE_NAME, folderId, "[]");
    }

    return fileId;
  },

  async findFile(accessToken: string, name: string, mimeType: string, parentId?: string) {
    let q = `name='${name}' and mimeType='${mimeType}' and trashed=false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    }
    
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&spaces=drive`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to search Drive: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  },

  async createFolder(accessToken: string, name: string) {
    const metadata = {
      name,
      mimeType: "application/vnd.google-apps.folder"
    };
    
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create folder in Drive: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    return data.id;
  },

  async createFile(accessToken: string, name: string, parentId: string, content: string) {
    // 1. Create file metadata
    const metadataRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        parents: [parentId],
        mimeType: 'application/json'
      })
    });
    
    if (!metadataRes.ok) {
      const errorText = await metadataRes.text();
      throw new Error(`Failed to create file metadata in Drive: ${metadataRes.status} ${metadataRes.statusText} - ${errorText}`);
    }
    const metadata = await metadataRes.json();
    const fileId = metadata.id;

    // 2. Upload content
    await this.updateFile(accessToken, fileId, content);

    return fileId;
  },

  async readFile(accessToken: string, fileId: string) {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to read file from Drive: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return [];
    }
  },

  async updateFile(accessToken: string, fileId: string, content: string) {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: content
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update file in Drive: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    return await res.json();
  }
};
