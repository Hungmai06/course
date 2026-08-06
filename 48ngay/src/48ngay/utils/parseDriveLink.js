function normalizeDriveUrl(url) {
  return String(url || '').trim()
}

export function parseDriveLink(url) {
  const normalized = normalizeDriveUrl(url)
  if (!normalized) {
    return {
      embedUrl: '',
      openUrl: '',
      type: 'unknown',
    }
  }

  const fileIdMatch = normalized.match(/\/file\/d\/([^/?#]+)/)
  if (fileIdMatch) {
    const fileId = fileIdMatch[1]
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      openUrl: `https://drive.google.com/file/d/${fileId}/view`,
      type: 'file',
    }
  }

  const folderIdMatch = normalized.match(/\/folders\/([^/?#]+)/)
  if (folderIdMatch) {
    const folderId = folderIdMatch[1]
    return {
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#list`,
      openUrl: `https://drive.google.com/drive/folders/${folderId}`,
      type: 'folder',
    }
  }

  return {
    embedUrl: normalized,
    openUrl: normalized,
    type: 'external',
  }
}
