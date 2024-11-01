/**
 * Identify the file type based on the MIME type,
 * return type for common file types.
 *
 * @param {string} type - MIME type of the file
 */
export const identifyFileType = (type: string): string => {
  switch (type) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Document';
    case 'application/msword':
      return 'MS Word';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'Spreadsheet';
    case 'application/vnd.ms-excel':
      return 'Excel';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'Presentation';
    case 'application/vnd.ms-powerpoint':
      return 'PowerPoint';
    default:
      return type;
  }
};
