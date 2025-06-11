export const MS_GRAPH_GET_ACCOUNT_DETAILS_URL =
  'https://graph.microsoft.com/v1.0/me';

export const MS_GRAPH_LIST_ITEMS_IN_ONE_DRIVE_URL =
  'https://graph.microsoft.com/v1.0/me/drive/root/children';

export const MS_GRAPH_RECENT_FILES_IN_ONE_DRIVE_URL =
  'https://graph.microsoft.com/v1.0/me/drive/recent';

export const MS_GRAPH_FILES_SHARED_WITH_ME_URL =
  'https://graph.microsoft.com/v1.0/me/drive/sharedWithMe';

export const MS_GRAPH_SEARCH_IN_ONE_DRIVE_URL =
  "https://graph.microsoft.com/v1.0/me/drive/root/search(q='finance')?select=name,id,webUrl";

export const MS_GRAPH_TOKEN_URL =
  'https://login.microsoftonline.com/common/oauth2/v2.0/token';

export const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

export const get_EMAIL_UPLOAD_URL = (folderId: string, fileName: string) => {
  return `${GRAPH_BASE_URL}/me/drive/items/${folderId}:/${fileName}:/content`;
};

export const get_FILE_UPLOAD_URL = (folderId: string, fileName: string) => {
  return `${GRAPH_BASE_URL}/me/drive/items/${folderId}:/${fileName}:/content`;
};

export const get_CHECK_FOLDER_EXISTENCE_BY_NAME_URL = (folderName: string) => {
  return `${GRAPH_BASE_URL}/me/drive/root/children?$filter=name eq '${folderName}'`;
};

export const get_CREATE_FOLDER_URL = () => {
  return `${GRAPH_BASE_URL}/me/drive/root/children`;
};

export const CUSTOM_MS_ERROR_CODES_FOR_PLUGIN = {
  EmailNotPermitted: 'EmailNotPermitted',
};
